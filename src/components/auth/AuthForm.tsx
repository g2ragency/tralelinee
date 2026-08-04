"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/app/auth/actions";

/*
  Form condiviso da login e registrazione. useActionState tiene lo stato
  restituito dalla Server Action senza gestire fetch a mano.

  Misure dal Figma: colonna 350px, titolo 30px interlinea 100%, campi 18px con
  padding 14/20 e angoli 10px, 10px fra un campo e l'altro, pulsante alto 50px.
  Le etichette sono diventate segnaposto: nel design il campo è vuoto e non ha
  testo sopra. Restano dichiarate in aria-label, altrimenti chi naviga con lo
  screen reader si troverebbe due caselle senza nome.
*/
const CAMPO =
  "rounded-[10px] border border-grey bg-transparent px-5 py-[14px] text-[18px] leading-[0.93] tracking-[-0.04em] outline-none placeholder:text-grey focus:border-foreground";

export function AuthForm({
  action,
  titolo,
  cta,
  altroTesto,
  altroLink,
  altroLabel,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  titolo: string;
  cta: string;
  altroTesto: string;
  altroLink: string;
  altroLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="w-full">
      {/* Più largo della colonna dei campi: nel Figma il titolo sta su una
          riga sola e sborda da entrambi i lati. */}
      <h1 className="mx-auto max-w-[440px] text-center text-[30px] leading-none tracking-[-0.04em]">
        {titolo}
      </h1>

      {/* Figma: 75px fra titolo e primo campo */}
      <form
        action={formAction}
        className="mx-auto mt-[75px] flex w-full max-w-[352px] flex-col gap-[10px]"
      >
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          className={CAMPO}
        />

        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          className={CAMPO}
        />

        {state.error && (
          <p role="alert" className="text-[14px] leading-[1.2] text-grey">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-[14px] leading-[1.2] text-grey">
            {state.message}
          </p>
        )}

        {/* Pieno: sfondo e testo prendono i token del tema, così sul chiaro si
            inverte invece di restare una barra chiara su fondo chiaro. */}
        <button
          type="submit"
          disabled={pending}
          className="h-[50px] rounded-[10px] bg-foreground text-[18px] leading-[0.93] tracking-[-0.04em] text-background disabled:opacity-50"
        >
          {pending ? "Attendi…" : cta}
        </button>
      </form>

      {/* Non è nel Figma della schermata, ma senza questo non resta nessuna
          strada per chiedere l'accesso o tornare al login. */}
      <p className="mx-auto mt-6 max-w-[352px] text-center text-[14px] leading-[1.2] tracking-[-0.04em] text-grey">
        {altroTesto}{" "}
        <Link href={altroLink} className="text-foreground underline">
          {altroLabel}
        </Link>
      </p>
    </div>
  );
}
