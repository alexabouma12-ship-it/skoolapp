"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { LIENS_PARENTE } from "@/lib/constantes";
import type { EtatFormulaire } from "@/lib/types";
import { coche, messageErreur, texte } from "./utils";

async function marquerPrincipal(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  eleveId: string,
  responsableId: string,
) {
  await supabase.from("eleve_responsables").update({ principal: false }).eq("eleve_id", eleveId);
  await supabase
    .from("eleve_responsables")
    .update({ principal: true })
    .eq("eleve_id", eleveId)
    .eq("responsable_id", responsableId);
}

export async function enregistrerResponsable(
  eleveId: string,
  responsableId: string | null,
  formData: FormData,
): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();

  const nom = texte(formData, "nom");
  if (!nom) return { erreur: "Le nom du parent est obligatoire." };
  const lien = texte(formData, "lien") ?? "autre";

  const responsable = {
    nom: nom.toUpperCase(),
    prenoms: texte(formData, "prenoms") ?? "",
    lien: lien in LIENS_PARENTE ? lien : "autre",
    telephone_1: texte(formData, "telephone_1"),
    telephone_2: texte(formData, "telephone_2"),
    whatsapp: texte(formData, "whatsapp"),
    email: texte(formData, "email"),
    commune: texte(formData, "commune"),
    quartier: texte(formData, "quartier"),
    profession: texte(formData, "profession"),
  };

  let id = responsableId;
  if (id) {
    const { error } = await supabase.from("responsables").update(responsable).eq("id", id);
    if (error) return { erreur: messageErreur(error)! };
  } else {
    const { data, error } = await supabase.from("responsables").insert(responsable).select("id").single();
    if (error) return { erreur: messageErreur(error)! };
    id = data.id;
    const { count } = await supabase
      .from("eleve_responsables")
      .select("*", { count: "exact", head: true })
      .eq("eleve_id", eleveId);
    const { error: erreurLien } = await supabase
      .from("eleve_responsables")
      .insert({ eleve_id: eleveId, responsable_id: id, principal: !count });
    if (erreurLien) return { erreur: messageErreur(erreurLien)! };
  }

  if (coche(formData, "principal")) await marquerPrincipal(supabase, eleveId, id!);

  revalidatePath("/", "layout");
  redirect(`/eleves/${eleveId}?onglet=parents`);
}

/** Rattache un parent déjà enregistré (frère ou sœur d'un autre élève). */
export async function lierResponsableExistant(eleveId: string, formData: FormData): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const responsableId = texte(formData, "responsable_id");
  if (!responsableId) return { erreur: "Choisissez un parent dans la liste." };

  const { count } = await supabase
    .from("eleve_responsables")
    .select("*", { count: "exact", head: true })
    .eq("eleve_id", eleveId);
  const { error } = await supabase
    .from("eleve_responsables")
    .insert({ eleve_id: eleveId, responsable_id: responsableId, principal: !count });
  if (error) {
    return { erreur: error.code === "23505" ? "Ce parent est déjà rattaché à l'élève." : messageErreur(error)! };
  }

  revalidatePath("/", "layout");
  redirect(`/eleves/${eleveId}?onglet=parents`);
}

export async function definirPrincipal(eleveId: string, responsableId: string) {
  const { supabase } = await requireUser();
  await marquerPrincipal(supabase, eleveId, responsableId);
  revalidatePath(`/eleves/${eleveId}`);
}

/** Retire le parent de cet élève ; il est supprimé s'il n'est plus rattaché à personne. */
export async function retirerResponsable(eleveId: string, responsableId: string) {
  const { supabase } = await requireUser();
  await supabase.from("eleve_responsables").delete().eq("eleve_id", eleveId).eq("responsable_id", responsableId);
  const { count } = await supabase
    .from("eleve_responsables")
    .select("*", { count: "exact", head: true })
    .eq("responsable_id", responsableId);
  if (!count) await supabase.from("responsables").delete().eq("id", responsableId);

  revalidatePath("/", "layout");
  redirect(`/eleves/${eleveId}?onglet=parents`);
}
