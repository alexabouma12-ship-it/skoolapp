"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { CATEGORIES_OBSERVATION } from "@/lib/constantes";
import type { EtatFormulaire } from "@/lib/types";
import { coche, date, messageErreur, texte } from "./utils";

// ---------------------------------------------------------------- Observations

export async function enregistrerObservation(
  eleveId: string,
  id: string | null,
  formData: FormData,
): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const contenu = texte(formData, "contenu");
  if (!contenu) return { erreur: "L'observation ne peut pas être vide." };
  const categorie = texte(formData, "categorie") ?? "autre";

  const observation = {
    eleve_id: eleveId,
    contenu,
    categorie: categorie in CATEGORIES_OBSERVATION ? categorie : "autre",
    date_observation: date(formData, "date_observation") ?? new Date().toISOString().slice(0, 10),
  };

  const { error } = id
    ? await supabase.from("observations").update(observation).eq("id", id)
    : await supabase.from("observations").insert(observation);
  if (error) return { erreur: messageErreur(error)! };

  revalidatePath(`/eleves/${eleveId}`);
  redirect(`/eleves/${eleveId}?onglet=observations`);
}

export async function supprimerObservation(eleveId: string, id: string) {
  const { supabase } = await requireUser();
  await supabase.from("observations").delete().eq("id", id);
  revalidatePath(`/eleves/${eleveId}`);
  redirect(`/eleves/${eleveId}?onglet=observations`);
}

// ------------------------------------------------------- Incidents et sanctions

export async function enregistrerIncident(
  eleveId: string,
  id: string | null,
  formData: FormData,
): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const typeIncident = texte(formData, "type_incident_id");
  const description = texte(formData, "description");
  if (!typeIncident && !description) return { erreur: "Indiquez au moins le type d'incident ou une description." };

  const typeSanction = texte(formData, "type_sanction_id");
  const incident = {
    eleve_id: eleveId,
    date_incident: date(formData, "date_incident") ?? new Date().toISOString().slice(0, 10),
    type_incident_id: typeIncident,
    description,
    lieu: texte(formData, "lieu"),
    type_sanction_id: typeSanction,
    date_sanction: typeSanction ? date(formData, "date_sanction") : null,
    duree_sanction: typeSanction ? texte(formData, "duree_sanction") : null,
    parent_informe: coche(formData, "parent_informe"),
    commentaire: texte(formData, "commentaire"),
  };

  const { error } = id
    ? await supabase.from("incidents").update(incident).eq("id", id)
    : await supabase.from("incidents").insert(incident);
  if (error) return { erreur: messageErreur(error)! };

  revalidatePath("/", "layout");
  redirect(`/eleves/${eleveId}?onglet=incidents`);
}

export async function supprimerIncident(eleveId: string, id: string) {
  const { supabase } = await requireUser();
  await supabase.from("incidents").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/eleves/${eleveId}?onglet=incidents`);
}

// ------------------------------------------------------------------ Paramètres

export async function ajouterTypeIncident(formData: FormData): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const libelle = texte(formData, "libelle");
  if (!libelle) return { erreur: "Saisissez un libellé." };
  const { error } = await supabase.from("types_incident").insert({ libelle });
  if (error) return { erreur: messageErreur(error)! };
  revalidatePath("/parametres");
  return { succes: `« ${libelle} » ajouté.` };
}

export async function supprimerTypeIncident(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("types_incident").delete().eq("id", id);
  revalidatePath("/parametres");
}

export async function ajouterTypeSanction(formData: FormData): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();
  const libelle = texte(formData, "libelle");
  if (!libelle) return { erreur: "Saisissez un libellé." };
  const gravite = Math.min(9, Math.max(1, Number(formData.get("gravite")) || 1));
  const { error } = await supabase.from("types_sanction").insert({ libelle, gravite });
  if (error) return { erreur: messageErreur(error)! };
  revalidatePath("/parametres");
  return { succes: `« ${libelle} » ajoutée.` };
}

export async function supprimerTypeSanction(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("types_sanction").delete().eq("id", id);
  revalidatePath("/parametres");
}
