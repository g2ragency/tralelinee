import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  Client Supabase lato server (Server Component, Server Action, Route Handler).
  La scrittura dei cookie fallisce nei Server Component (sola lettura): lì la
  sessione la rinfresca il proxy, quindi l'errore si può ignorare.
*/
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: se ne occupa il proxy.
          }
        },
      },
    },
  );
}
