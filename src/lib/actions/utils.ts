import type { PostgrestError } from "@supabase/supabase-js";

/** Valeur texte nettoyée, ou null si vide. */
export function texte(formData: FormData, nom: string) {
  const v = String(formData.get(nom) ?? "").trim();
  return v === "" ? null : v;
}

export function coche(formData: FormData, nom: string) {
  return formData.get(nom) === "on";
}

/** Date "AAAA-MM-JJ" valide, ou null. */
export function date(formData: FormData, nom: string) {
  const v = texte(formData, nom);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export function messageErreur(error: PostgrestError | null, contexte = "l'enregistrement") {
  if (!error) return null;
  if (error.code === "23505") return "Cet élément existe déjà (doublon).";
  if (error.code === "23514") return "Une valeur saisie n'est pas valide.";
  console.error(error);
  return `Erreur pendant ${contexte}. Vérifiez votre connexion et réessayez.`;
}
