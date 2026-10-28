import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/supabase/server";
import { derniersIncidents, listerClasses, urlsPhotos } from "@/lib/donnees";
import { formatDate, nomComplet, parseDateFr } from "@/lib/format";
import type { ResultatRecherche } from "@/lib/types";
import { ListeEleves } from "@/components/eleves";
import { Carte, EtatVide, LienBouton, Pastille } from "@/components/ui";
import { BarreRecherche } from "./barre-recherche";

export default async function PageRecherche({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const valeur = (cle: string) => (typeof sp[cle] === "string" ? (sp[cle] as string) : "");
  const q = valeur("q").trim();
  const classe = valeur("classe");
  const sexe = valeur("sexe");
  const avecIncidents = valeur("incidents") === "1";

  const classes = await listerClasses();
  const recherche = Boolean(q || classe || sexe || avecIncidents);

  return (
    <div className="space-y-6">
      <Suspense>
        <BarreRecherche classes={classes.map((c) => ({ id: c.id, nom: c.nom }))} />
      </Suspense>

      {recherche ? (
        <Resultats q={q} classe={classe} sexe={sexe} avecIncidents={avecIncidents} />
      ) : (
        <TableauDeBord classes={classes} />
      )}
    </div>
  );
}

async function Resultats({
  q,
  classe,
  sexe,
  avecIncidents,
}: {
  q: string;
  classe: string;
  sexe: string;
  avecIncidents: boolean;
}) {
  const { supabase } = await requireUser();
  // Une date tapée dans la barre (12/03/2010) est cherchée comme date de naissance.
  const dateNaissance = parseDateFr(q);

  const { data, error } = await supabase.rpc("rechercher_eleves", {
    q: dateNaissance ? null : q || null,
    p_classe: classe || null,
    p_sexe: sexe === "M" || sexe === "F" ? sexe : null,
    p_date_naissance: dateNaissance,
    p_avec_incidents: avecIncidents,
  });

  if (error) {
    console.error(error);
    return <EtatVide titre="La recherche a échoué" texte="Vérifiez votre connexion internet et réessayez." />;
  }

  const resultats = (data ?? []) as ResultatRecherche[];
  const photos = await urlsPhotos(supabase, resultats.map((r) => r.photo_path));

  if (!resultats.length) {
    return (
      <EtatVide
        titre="Aucun élève trouvé"
        texte={q ? `Aucun résultat pour « ${q} ».` : "Aucun élève ne correspond à ces filtres."}
        action={<LienBouton href="/eleves/nouveau" variante="secondaire">Ajouter un élève</LienBouton>}
      />
    );
  }

  return (
    <section>
      <p className="mb-2 text-sm text-muted">
        {resultats.length} élève{resultats.length > 1 ? "s" : ""} trouvé{resultats.length > 1 ? "s" : ""}
        {dateNaissance && ` né(s) le ${formatDate(dateNaissance)}`}
      </p>
      <ListeEleves eleves={resultats} photos={photos} />
    </section>
  );
}

async function TableauDeBord({ classes }: { classes: Awaited<ReturnType<typeof listerClasses>> }) {
  if (!classes.length) {
    return (
      <EtatVide
        titre="Bienvenue sur Skoolapp 👋"
        texte="Commencez par créer vos classes, puis ajoutez vos élèves."
        action={<LienBouton href="/classes/nouvelle">Créer ma première classe</LienBouton>}
      />
    );
  }

  const incidents = await derniersIncidents();
  const total = classes.reduce((s, c) => s + c.nb_eleves, 0);

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[21px] leading-tight font-semibold tracking-[0.011em] text-ink">Mes classes</h2>
          <span className="text-sm text-muted">{total} élèves au total</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/classes/${c.id}`}
              className="presse rounded-2xl border border-black/8 bg-canvas p-5 hover:border-action"
            >
              <p className="text-[21px] leading-tight font-semibold tracking-[0.011em] text-ink">{c.nom}</p>
              <p className="text-sm text-muted">
                {c.nb_eleves} élève{c.nb_eleves > 1 ? "s" : ""} · {c.annee_scolaire}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[21px] leading-tight font-semibold tracking-[0.011em] text-ink">Derniers incidents</h2>
        {incidents.length ? (
          <Carte className="divide-y divide-divider p-0 sm:p-0">
            {incidents.map((i) => (
              <Link
                key={i.id}
                href={`/eleves/${i.eleve.id}?onglet=incidents`}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-parchment"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {nomComplet(i.eleve)}
                    {i.eleve.classe && <span className="font-normal text-muted"> · {i.eleve.classe.nom}</span>}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {i.type_incident?.libelle ?? "Incident"}
                    {i.description && ` : ${i.description}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted">{formatDate(i.date_incident)}</p>
                  {i.type_sanction && <Pastille ton="rouge">{i.type_sanction.libelle}</Pastille>}
                </div>
              </Link>
            ))}
          </Carte>
        ) : (
          <p className="text-sm text-muted">Aucun incident enregistré pour le moment.</p>
        )}
      </section>
    </div>
  );
}
