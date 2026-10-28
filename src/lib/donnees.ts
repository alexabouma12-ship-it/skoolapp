import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import type { Classe, Eleve, Incident, Observation, Responsable, TypeIncident, TypeSanction } from "./types";

type Client = Awaited<ReturnType<typeof requireUser>>["supabase"];

/** URLs signées (1 h) pour afficher les photos d'un bucket privé. */
export async function urlsPhotos(supabase: Client, chemins: (string | null)[]) {
  const valides = [...new Set(chemins.filter((c): c is string => !!c))];
  if (!valides.length) return new Map<string, string>();
  const { data } = await supabase.storage.from("photos").createSignedUrls(valides, 3600);
  const urls = new Map<string, string>();
  for (const d of data ?? []) if (d.path && d.signedUrl) urls.set(d.path, d.signedUrl);
  return urls;
}

export async function listerClasses() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("classes")
    .select("*, eleves(count)")
    .order("annee_scolaire", { ascending: false })
    .order("nom");
  return (data ?? []).map((c) => ({
    ...(c as Classe),
    nb_eleves: (c.eleves as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function lireClasse(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as Classe;
}

export async function lireEleve(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("eleves").select("*, classe:classes(id, nom, annee_scolaire)").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as Eleve & { classe: Pick<Classe, "id" | "nom" | "annee_scolaire"> | null };
}

export async function lireResponsablesEleve(eleveId: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("eleve_responsables")
    .select("principal, responsable:responsables(*)")
    .eq("eleve_id", eleveId);
  return ((data ?? []) as unknown as { principal: boolean; responsable: Responsable }[])
    .map((r) => ({ ...r.responsable, principal: r.principal }))
    .sort((a, b) => Number(b.principal) - Number(a.principal));
}

/** Autres enfants suivis rattachés aux mêmes parents. */
export async function lireFratrie(eleveId: string, responsableIds: string[]) {
  if (!responsableIds.length) return [];
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("eleve_responsables")
    .select("eleve:eleves(id, nom, prenoms, classe:classes(nom))")
    .in("responsable_id", responsableIds)
    .neq("eleve_id", eleveId);
  const vus = new Map<string, { id: string; nom: string; prenoms: string; classe: { nom: string } | null }>();
  for (const r of (data ?? []) as unknown as { eleve: { id: string; nom: string; prenoms: string; classe: { nom: string } | null } }[]) {
    vus.set(r.eleve.id, r.eleve);
  }
  return [...vus.values()];
}

export async function lireResponsable(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("responsables").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as Responsable;
}

export async function listerTousResponsables() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("responsables")
    .select("id, nom, prenoms, lien, telephone_1, eleve_responsables(eleve:eleves(nom, prenoms))")
    .order("nom");
  return (data ?? []) as unknown as (Pick<Responsable, "id" | "nom" | "prenoms" | "lien" | "telephone_1"> & {
    eleve_responsables: { eleve: { nom: string; prenoms: string } }[];
  })[];
}

export async function listerObservations(eleveId: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("observations")
    .select("*")
    .eq("eleve_id", eleveId)
    .order("date_observation", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as Observation[];
}

export async function lireObservation(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("observations").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as Observation;
}

export type IncidentDetaille = Incident & {
  type_incident: { libelle: string } | null;
  type_sanction: { libelle: string; gravite: number } | null;
};

export async function listerIncidents(eleveId: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("incidents")
    .select("*, type_incident:types_incident(libelle), type_sanction:types_sanction(libelle, gravite)")
    .eq("eleve_id", eleveId)
    .order("date_incident", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as IncidentDetaille[];
}

export async function lireIncident(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("incidents").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as Incident;
}

export async function derniersIncidents(limite = 6) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("incidents")
    .select(
      "id, date_incident, description, type_incident:types_incident(libelle), type_sanction:types_sanction(libelle), eleve:eleves(id, nom, prenoms, classe:classes(nom))",
    )
    .order("date_incident", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limite);
  return (data ?? []) as unknown as {
    id: string;
    date_incident: string;
    description: string | null;
    type_incident: { libelle: string } | null;
    type_sanction: { libelle: string } | null;
    eleve: { id: string; nom: string; prenoms: string; classe: { nom: string } | null };
  }[];
}

export async function listerTypes() {
  const { supabase } = await requireUser();
  const [incidents, sanctions] = await Promise.all([
    supabase.from("types_incident").select("id, libelle").order("libelle"),
    supabase.from("types_sanction").select("id, libelle, gravite").order("gravite").order("libelle"),
  ]);
  return {
    typesIncident: (incidents.data ?? []) as TypeIncident[],
    typesSanction: (sanctions.data ?? []) as TypeSanction[],
  };
}
