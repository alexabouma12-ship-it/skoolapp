"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EtatFormulaire } from "@/lib/types";

export async function seConnecter(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  if (!email || !motDePasse) return { erreur: "Saisissez votre email et votre mot de passe." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) return { erreur: "Email ou mot de passe incorrect." };

  redirect("/");
}

export async function seDeconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
