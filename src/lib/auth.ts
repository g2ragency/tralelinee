import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  role: "user" | "super_admin";
  approved: boolean;
};

/*
  Data access layer: qui stanno i controlli veri (il proxy fa solo il filtro
  ottimistico). `cache` memoizza per render, così più chiamate nello stesso
  albero non ripetono la query.

  NB: la sicurezza non dipende da queste funzioni ma dalle RLS — un utente non
  approvato che aggirasse il redirect otterrebbe comunque zero righe.
*/
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, approved")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
});

export async function isApproved() {
  const profile = await getProfile();
  return profile?.approved === true;
}

export async function isSuperAdmin() {
  const profile = await getProfile();
  return profile?.role === "super_admin";
}
