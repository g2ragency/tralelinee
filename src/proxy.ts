import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
  Next 16: quello che prima era `middleware.ts` ora è `proxy.ts`.
  Due compiti:
  1. rinfrescare la sessione Supabase a ogni richiesta (altrimenti scade e i
     Server Component vedono l'utente sloggato);
  2. controllo OTTIMISTICO sulle aree riservate — solo "esiste una sessione?".
  La verifica vera (approvato? super admin?) sta nelle RLS del database e nel
  data access layer, come raccomanda la doc di Next: il proxy gira su ogni
  richiesta, comprese quelle di prefetch, quindi niente query pesanti qui.
*/
const PROTETTE = ["/portfolio", "/admin"];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Finché Supabase non è configurato il sito pubblico deve restare in piedi:
  // il proxy gira su OGNI richiesta, quindi qui un throw = intero sito in 500.
  if (!url || !anonKey) {
    if (PROTETTE.some((p) => request.nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() e non getSession(): valida il token contro Supabase invece di
  // fidarsi del cookie, ed è la chiamata che rinnova la sessione.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (!user && PROTETTE.some((p) => pathname.startsWith(p))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  // Salta asset statici e immagini: il refresh sessione lì non serve.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
