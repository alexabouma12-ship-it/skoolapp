"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import type { EtatFormulaire } from "@/lib/types";
import { coche, date, messageErreur, texte } from "./utils";

export async function enregistrerEleve(id: string | null, formData: FormData): Promise<EtatFormulaire> {
  const { supabase } = await requireUser();

  const nom = texte(formData, "nom");
  if (!nom) return { erreur: "Le nom de l'élève est obligatoire." };

  const sexe = texte(formData, "sexe");
  const statut = texte(formData, "statut");
  const regime = texte(formData, "regime");

  const eleve = {
    nom: nom.toUpperCase(),
    prenoms: texte(formData, "prenoms") ?? "",
    matricule: texte(formData, "matricule")?.toUpperCase() ?? null,
    classe_id: texte(formData, "classe_id"),
    sexe: sexe === "M" || sexe === "F" ? sexe : null,
    date_naissance: date(formData, "date_naissance"),
    lieu_naissance: texte(formData, "lieu_naissance"),
    statut: statut === "affecte" || statut === "non_affecte" ? statut : null,
    regime: regime === "externe" || regime === "demi_pension" || regime === "interne" ? regime : null,
    redoublant: coche(formData, "redoublant"),
    adresse: texte(formData, "adresse"),
    telephone: texte(formData, "telephone"),
    notes: texte(formData, "notes"),
  };

  const { data, error } = id
    ? await supabase.from("eleves").update(eleve).eq("id", id).select("id").single()
    : await supabase.from("eleves").insert(eleve).select("id").single();

  if (error) {
    if (error.code === "23505") return { erreur: `Le matricule ${eleve.matricule} est déjà utilisé par un autre élève.` };
    return { erreur: messageErreur(error)! };
  }

  revalidatePath("/", "layout");

  // « Enregistrer et ajouter le suivant » : on revient sur un formulaire vide, même classe.
  if (!id && formData.get("suite") === "suivant") {
    const params = new URLSearchParams({ ajoute: `${eleve.nom} ${eleve.prenoms}`.trim(), n: String(Date.now()) });
    if (eleve.classe_id) params.set("classe", eleve.classe_id);
    redirect(`/eleves/nouveau?${params}`);
  }

  redirect(`/eleves/${data.id}`);
}

export async function supprimerEleve(id: string) {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("eleves").select("classe_id, photo_path").eq("id", id).single();
  if (data?.photo_path) await supabase.storage.from("photos").remove([data.photo_path]);
  await supabase.from("eleves").delete().eq("id", id);
  // Les parents qui ne sont plus rattachés à aucun élève sont supprimés aussi.
  const { data: orphelins } = await supabase
    .from("responsables")
    .select("id, eleve_responsables(eleve_id)")
    .eq("owner_id", userId);
  const ids = (orphelins ?? []).filter((r) => r.eleve_responsables.length === 0).map((r) => r.id);
  if (ids.length) await supabase.from("responsables").delete().in("id", ids);

  revalidatePath("/", "layout");
  redirect(data?.classe_id ? `/classes/${data.classe_id}` : "/");
}

export async function definirPhoto(id: string, photoPath: string | null) {
  const { supabase, userId } = await requireUser();
  if (photoPath && !photoPath.startsWith(`${userId}/`)) return;
  const { data: avant } = await supabase.from("eleves").select("photo_path").eq("id", id).single();
  if (avant?.photo_path && avant.photo_path !== photoPath) {
    await supabase.storage.from("photos").remove([avant.photo_path]);
  }
  await supabase.from("eleves").update({ photo_path: photoPath }).eq("id", id);
  revalidatePath(`/eleves/${id}`);
}
