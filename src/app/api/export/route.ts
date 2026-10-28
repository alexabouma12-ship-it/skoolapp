import { createClient } from "@/lib/supabase/server";
import { CATEGORIES_OBSERVATION, LIENS_PARENTE } from "@/lib/constantes";
import { formatDate, formatTelephone } from "@/lib/format";

type Ligne = (string | number | boolean | null | undefined)[];

/** CSV au format attendu par Excel en français : séparateur « ; », BOM UTF-8, CRLF. */
function csv(entetes: string[], lignes: Ligne[]) {
  const cellule = (v: Ligne[number]) => {
    const s = v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "Oui" : "Non") : String(v);
    return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n");
}

type EleveExport = {
  matricule: string | null;
  nom: string;
  prenoms: string;
  sexe: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  redoublant: boolean;
  telephone: string | null;
  adresse: string | null;
  notes: string | null;
  classe: { nom: string } | null;
  eleve_responsables: {
    principal: boolean;
    responsable: {
      nom: string;
      prenoms: string;
      lien: keyof typeof LIENS_PARENTE;
      telephone_1: string | null;
      telephone_2: string | null;
      commune: string | null;
      quartier: string | null;
    };
  }[];
  incidents: { count: number }[];
  observations: { count: number }[];
};

type Rattache = { date: string; eleve: { nom: string; prenoms: string; matricule: string | null; classe: { nom: string } | null } };

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return new Response("Non autorisé", { status: 401 });

  const type = new URL(request.url).searchParams.get("type") ?? "eleves";
  const eleveCols = "eleve:eleves(nom, prenoms, matricule, classe:classes(nom))";
  let contenu: string;

  if (type === "observations") {
    const { data } = await supabase
      .from("observations")
      .select(`date:date_observation, categorie, contenu, ${eleveCols}`)
      .order("date_observation", { ascending: false });
    const lignes = (data ?? []) as unknown as (Rattache & { categorie: string; contenu: string })[];
    contenu = csv(
      ["Date", "Classe", "Matricule", "Nom", "Prénoms", "Catégorie", "Observation"],
      lignes.map((o) => [
        formatDate(o.date),
        o.eleve.classe?.nom,
        o.eleve.matricule,
        o.eleve.nom,
        o.eleve.prenoms,
        CATEGORIES_OBSERVATION[o.categorie as keyof typeof CATEGORIES_OBSERVATION] ?? o.categorie,
        o.contenu,
      ]),
    );
  } else if (type === "incidents") {
    const { data } = await supabase
      .from("incidents")
      .select(
        `date:date_incident, description, lieu, duree_sanction, date_sanction, parent_informe, commentaire,
         type_incident:types_incident(libelle), type_sanction:types_sanction(libelle), ${eleveCols}`,
      )
      .order("date_incident", { ascending: false });
    const lignes = (data ?? []) as unknown as (Rattache & {
      description: string | null;
      lieu: string | null;
      duree_sanction: string | null;
      date_sanction: string | null;
      parent_informe: boolean;
      commentaire: string | null;
      type_incident: { libelle: string } | null;
      type_sanction: { libelle: string } | null;
    })[];
    contenu = csv(
      ["Date", "Classe", "Matricule", "Nom", "Prénoms", "Type", "Description", "Lieu", "Sanction", "Durée", "Date sanction", "Parents informés", "Commentaire"],
      lignes.map((i) => [
        formatDate(i.date),
        i.eleve.classe?.nom,
        i.eleve.matricule,
        i.eleve.nom,
        i.eleve.prenoms,
        i.type_incident?.libelle,
        i.description,
        i.lieu,
        i.type_sanction?.libelle,
        i.duree_sanction,
        formatDate(i.date_sanction),
        i.parent_informe,
        i.commentaire,
      ]),
    );
  } else {
    const { data } = await supabase
      .from("eleves")
      .select(
        `matricule, nom, prenoms, sexe, date_naissance, lieu_naissance, redoublant, telephone, adresse, notes,
         classe:classes(nom),
         eleve_responsables(principal, responsable:responsables(nom, prenoms, lien, telephone_1, telephone_2, commune, quartier)),
         incidents(count), observations(count)`,
      )
      .order("nom");
    const eleves = (data ?? []) as unknown as EleveExport[];
    contenu = csv(
      [
        "Classe", "Matricule", "Nom", "Prénoms", "Sexe", "Date de naissance", "Lieu de naissance", "Redoublant",
        "Téléphone élève", "Adresse", "Parent principal", "Lien", "Téléphone parent", "Autre téléphone",
        "Commune / quartier", "Autres parents", "Nb observations", "Nb incidents", "Notes",
      ],
      eleves.map((e) => {
        const parents = [...e.eleve_responsables].sort((a, b) => Number(b.principal) - Number(a.principal));
        const p = parents[0]?.responsable;
        return [
          e.classe?.nom,
          e.matricule,
          e.nom,
          e.prenoms,
          e.sexe,
          formatDate(e.date_naissance),
          e.lieu_naissance,
          e.redoublant,
          formatTelephone(e.telephone),
          e.adresse,
          p && `${p.nom} ${p.prenoms}`.trim(),
          p && LIENS_PARENTE[p.lien],
          formatTelephone(p?.telephone_1),
          formatTelephone(p?.telephone_2),
          p && [p.quartier, p.commune].filter(Boolean).join(", "),
          parents
            .slice(1)
            .map(({ responsable: r }) => `${r.nom} ${r.prenoms} (${LIENS_PARENTE[r.lien]}) ${formatTelephone(r.telephone_1)}`.trim())
            .join(" | "),
          e.observations[0]?.count ?? 0,
          e.incidents[0]?.count ?? 0,
          e.notes,
        ];
      }),
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skoolapp-${type}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
