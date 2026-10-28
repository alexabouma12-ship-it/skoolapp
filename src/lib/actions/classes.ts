"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { anneeScolaireCourante } from "@/lib/constantes";
import type { EtatFormulaire } from "@/lib/types";
import { messageErreur, texte } from "./utils";

export async function enregistrerClasse(id: string | null, formData: FormData): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const nom = texte(formData, "nom");
  const annee = texte(formData, "annee_scolaire") ?? anneeScolaireCourante();
  if (!nom) return { erreur: "Le nom de la classe est obligatoire." };

  const { data, error } = id
    ? await supabase.from("classes").update({ nom, annee_scolaire: annee }).eq("id", id).select("id").single()
    : await supabase.from("classes").insert({ nom, annee_scolaire: annee }).select("id").single();

  const erreur = messageErreur(error);
  if (erreur) return { erreur: error?.code === "23505" ? "Une classe porte déjà ce nom cette année." : erreur };

  revalidatePath("/", "layout");
  redirect(`/classes/${data!.id}`);
}

export async function supprimerClasse(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("classes").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/classes");
}
