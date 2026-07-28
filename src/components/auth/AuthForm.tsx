"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/app/auth/actions";

/*
  Form condiviso da login e registrazione. useActionState tiene lo stato
  restituito dalla Server Action senza gestire fetch a mano.
*/
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
    <div className="mx-auto w-full max-w-[480px]">
      <h1 className="text-[40px] leading-[0.97] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
        {titolo}
      </h1>

      <form action={formAction} className="mt-10 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[16px] text-grey">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="border border-grey bg-transparent px-4 py-3 text-[18px] outline-none focus:border-foreground"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[16px] text-grey">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="border border-grey bg-transparent px-4 py-3 text-[18px] outline-none focus:border-foreground"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-[16px] text-grey2">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-[16px] text-grey2">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="hoverable mt-2 border border-foreground px-5 py-3.5 text-[24px] leading-[0.933] tracking-[-0.96px] disabled:opacity-50"
        >
          {pending ? "Attendi…" : cta}
        </button>
      </form>

      <p className="mt-8 text-[16px] text-grey">
        {altroTesto}{" "}
        <Link href={altroLink} className="hoverable text-foreground underline">
          {altroLabel}
        </Link>
      </p>
    </div>
  );
}
