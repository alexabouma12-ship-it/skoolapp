import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, MessageCircle, NotebookPen, Pencil, Phone, Plus, Star, Users } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import {
  lireEleve,
  lireFratrie,
  lireResponsablesEleve,
  listerIncidents,
  listerObservations,
  urlsPhotos,
} from "@/lib/donnees";
import { definirPrincipal, retirerResponsable } from "@/lib/actions/responsables";
import { CATEGORIES_OBSERVATION, LIENS_PARENTE, REGIMES, STATUTS } from "@/lib/constantes";
import { age, formatDate, formatTelephone, lienAppel, lienWhatsApp, nomComplet } from "@/lib/format";
import { Telephone } from "@/components/contact";
import { BoutonSupprimer } from "@/components/formulaire";
import { Carte, classesBouton, cx, EtatVide, LienBouton, LienRetour, Pastille } from "@/components/ui";
import { PhotoEleve } from "./photo-eleve";

export async function generateMetadata({ params }: PageProps<"/eleves/[id]">): Promise<Metadata> {
  const { id } = await params;
  const eleve = await lireEleve(id);
  return { title: nomComplet(eleve) };
}

const ONGLETS = [
  { id: "infos", label: "Infos" },
  { id: "parents", label: "Parents" },
  { id: "observations", label: "Observations" },
  { id: "incidents", label: "Incidents" },
] as const;

type Onglet = (typeof ONGLETS)[number]["id"];

export default async function PageEleve({ params, searchParams }: PageProps<"/eleves/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const onglet: Onglet = ONGLETS.some((o) => o.id === sp.onglet) ? (sp.onglet as Onglet) : "infos";

  const { supabase, userId } = await requireUser();
  const [eleve, responsables, observations, incidents] = await Promise.all([
    lireEleve(id),
    lireResponsablesEleve(id),
    listerObservations(id),
    listerIncidents(id),
  ]);
  const photos = await urlsPhotos(supabase, [eleve.photo_path]);
  const principal = responsables[0];
  const a = age(eleve.date_naissance);
  const telPrincipal = principal?.telephone_1 ?? principal?.telephone_2;
  const waPrincipal = principal?.whatsapp ?? telPrincipal;

  const compteurs: Record<Onglet, number | null> = {
    infos: null,
    parents: responsables.length,
    observations: observations.length,
    incidents: incidents.length,
  };

  return (
    <div className="space-y-4">
      <LienRetour href={eleve.classe ? `/classes/${eleve.classe.id}` : "/"}>
        {eleve.classe ? eleve.classe.nom : "Accueil"}
      </LienRetour>

      {/* En-tête de la fiche */}
      <Carte className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <PhotoEleve
          eleveId={eleve.id}
          userId={userId}
          url={eleve.photo_path ? photos.get(eleve.photo_path) : undefined}
          nom={eleve.nom}
          prenoms={eleve.prenoms}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">{nomComplet(eleve)}</h1>
          <p className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted sm:justify-start">
            {eleve.classe && <span className="font-semibold text-ink">{eleve.classe.nom}</span>}
            {eleve.matricule && <span className="font-mono">Mat. {eleve.matricule}</span>}
            {eleve.date_naissance && (
              <span>
                Né{eleve.sexe === "F" ? "e" : ""} le {formatDate(eleve.date_naissance)}
                {a !== null && ` (${a} ans)`}
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {eleve.sexe && <Pastille>{eleve.sexe === "F" ? "Fille" : "Garçon"}</Pastille>}
            {eleve.redoublant && <Pastille ton="orange">Redoublant(e)</Pastille>}
            {eleve.statut && <Pastille>{STATUTS[eleve.statut]}</Pastille>}
            {incidents.length > 0 && (
              <Pastille ton={incidents.length >= 3 ? "rouge" : "orange"}>
                {incidents.length} incident{incidents.length > 1 ? "s" : ""}
              </Pastille>
            )}
          </div>
        </div>
        <LienBouton href={`/eleves/${id}/modifier`} variante="secondaire" className="w-full sm:w-auto">
          <Pencil className="size-4" aria-hidden /> Modifier
        </LienBouton>
      </Carte>

      {/* Contact rapide du parent principal */}
      {principal && (telPrincipal || waPrincipal) && (
        <div className="grid grid-cols-2 gap-2">
          {telPrincipal && (
            <a href={lienAppel(telPrincipal)} className={classesBouton("primaire", "min-h-12")}>
              <Phone className="size-5" aria-hidden />
              <span className="truncate">
                Appeler<span className="hidden sm:inline"> {LIENS_PARENTE[principal.lien].toLowerCase()}</span>
              </span>
            </a>
          )}
          {waPrincipal && (
            <a
              href={lienWhatsApp(waPrincipal)}
              target="_blank"
              rel="noopener noreferrer"
              className={classesBouton("secondaire", "min-h-12 text-action")}
            >
              <MessageCircle className="size-5" aria-hidden /> WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-2">
        <LienBouton href={`/eleves/${id}/observations/nouvelle`} variante="secondaire">
          <NotebookPen className="size-4" aria-hidden /> Observation
        </LienBouton>
        <LienBouton href={`/eleves/${id}/incidents/nouveau`} variante="secondaire" className="text-red-700">
          <AlertTriangle className="size-4" aria-hidden /> Incident
        </LienBouton>
      </div>

      {/* Onglets */}
      <nav className="-mx-4 overflow-x-auto px-4" aria-label="Sections de la fiche">
        <div className="flex min-w-max gap-1 rounded-xl bg-chip/50 p-1">
          {ONGLETS.map((o) => (
            <Link
              key={o.id}
              href={`/eleves/${id}?onglet=${o.id}`}
              replace
              scroll={false}
              className={cx(
                "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium whitespace-nowrap",
                onglet === o.id ? "bg-canvas text-ink" : "text-muted hover:text-ink",
              )}
            >
              {o.label}
              {compteurs[o.id] ? <span className="ml-1 text-muted-48">{compteurs[o.id]}</span> : null}
            </Link>
          ))}
        </div>
      </nav>

      {onglet === "infos" && <OngletInfos eleve={eleve} />}
      {onglet === "parents" && <OngletParents eleveId={id} responsables={responsables} />}
      {onglet === "observations" && <OngletObservations eleveId={id} observations={observations} />}
      {onglet === "incidents" && <OngletIncidents eleveId={id} incidents={incidents} />}
    </div>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{valeur}</dd>
    </div>
  );
}

function OngletInfos({ eleve }: { eleve: Awaited<ReturnType<typeof lireEleve>> }) {
  return (
    <Carte>
      <dl className="divide-y divide-divider">
        <Ligne label="Nom" valeur={eleve.nom} />
        <Ligne label="Prénoms" valeur={eleve.prenoms} />
        <Ligne label="Matricule" valeur={eleve.matricule && <span className="font-mono">{eleve.matricule}</span>} />
        <Ligne label="Classe" valeur={eleve.classe && `${eleve.classe.nom} (${eleve.classe.annee_scolaire})`} />
        <Ligne label="Date de naissance" valeur={formatDate(eleve.date_naissance)} />
        <Ligne label="Lieu de naissance" valeur={eleve.lieu_naissance} />
        <Ligne label="Statut" valeur={eleve.statut && STATUTS[eleve.statut]} />
        <Ligne label="Régime" valeur={eleve.regime && REGIMES[eleve.regime]} />
        <Ligne label="Redoublant(e)" valeur={eleve.redoublant ? "Oui" : "Non"} />
        <Ligne label="Téléphone" valeur={eleve.telephone && <Telephone numero={eleve.telephone} />} />
        <Ligne label="Adresse" valeur={eleve.adresse} />
      </dl>
      {eleve.notes && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm whitespace-pre-line text-amber-900">
          <p className="mb-1 font-semibold">Notes</p>
          {eleve.notes}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-48">Fiche mise à jour le {formatDate(eleve.updated_at)}</p>
    </Carte>
  );
}

async function OngletParents({
  eleveId,
  responsables,
}: {
  eleveId: string;
  responsables: Awaited<ReturnType<typeof lireResponsablesEleve>>;
}) {
  const fratrie = await lireFratrie(eleveId, responsables.map((r) => r.id));

  return (
    <div className="space-y-3">
      {responsables.length === 0 && (
        <EtatVide titre="Aucun parent enregistré" texte="Ajoutez le père, la mère ou le tuteur pour pouvoir les contacter en un clic." />
      )}

      {responsables.map((r) => (
        <Carte key={r.id} className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{nomComplet(r)}</p>
              <p className="text-sm text-muted">
                {LIENS_PARENTE[r.lien]}
                {r.profession && ` · ${r.profession}`}
              </p>
            </div>
            {r.principal && (
              <Pastille ton="action">
                <Star className="mr-1 size-3" aria-hidden /> Principal
              </Pastille>
            )}
          </div>
          <div className="space-y-2">
            {r.telephone_1 && <Telephone numero={r.telephone_1} whatsapp={!r.whatsapp} />}
            {r.telephone_2 && <Telephone numero={r.telephone_2} whatsapp={false} />}
            {r.whatsapp && (
              <a
                href={lienWhatsApp(r.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-action"
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp : {formatTelephone(r.whatsapp)}
              </a>
            )}
            {r.email && (
              <a href={`mailto:${r.email}`} className="block text-sm text-action underline">
                {r.email}
              </a>
            )}
            {(r.commune || r.quartier) && (
              <p className="text-sm text-ink-80">📍 {[r.quartier, r.commune].filter(Boolean).join(", ")}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-hairline pt-3">
            <LienBouton href={`/eleves/${eleveId}/parents/${r.id}`} variante="secondaire" className="min-h-9">
              Modifier
            </LienBouton>
            {!r.principal && (
              <form action={definirPrincipal.bind(null, eleveId, r.id)}>
                <button type="submit" className={classesBouton("fantome", "min-h-9")}>
                  Définir comme principal
                </button>
              </form>
            )}
            <form action={retirerResponsable.bind(null, eleveId, r.id)}>
              <BoutonSupprimer message={`Retirer ${nomComplet(r)} de cette fiche ?`} className="min-h-9">
                Retirer
              </BoutonSupprimer>
            </form>
          </div>
        </Carte>
      ))}

      <LienBouton href={`/eleves/${eleveId}/parents/nouveau`} className="w-full">
        <Plus className="size-4" aria-hidden /> Ajouter un parent / tuteur
      </LienBouton>

      {fratrie.length > 0 && (
        <Carte>
          <p className="mb-2 flex items-center gap-2 font-semibold text-ink">
            <Users className="size-4" aria-hidden /> Frères et sœurs suivis
          </p>
          <ul className="space-y-1">
            {fratrie.map((f) => (
              <li key={f.id}>
                <Link href={`/eleves/${f.id}`} className="text-sm text-action underline">
                  {nomComplet(f)}
                </Link>
                {f.classe && <span className="text-sm text-muted"> · {f.classe.nom}</span>}
              </li>
            ))}
          </ul>
        </Carte>
      )}
    </div>
  );
}

const TON_CATEGORIE: Record<string, "neutre" | "action" | "rouge" | "orange"> = {
  comportement: "orange",
  travail: "neutre",
  positif: "action",
  entretien: "neutre",
  famille: "neutre",
  sante: "rouge",
  autre: "neutre",
};

function OngletObservations({
  eleveId,
  observations,
}: {
  eleveId: string;
  observations: Awaited<ReturnType<typeof listerObservations>>;
}) {
  return (
    <div className="space-y-3">
      <LienBouton href={`/eleves/${eleveId}/observations/nouvelle`} className="w-full">
        <Plus className="size-4" aria-hidden /> Nouvelle observation
      </LienBouton>
      {observations.length === 0 ? (
        <EtatVide titre="Aucune observation" texte="Notez ici le comportement, les progrès, les entretiens avec l'élève ou sa famille." />
      ) : (
        <ol className="relative space-y-3 border-l-2 border-hairline pl-4">
          {observations.map((o) => (
            <li key={o.id} className="relative">
              <span className="absolute top-5 -left-[1.4rem] size-3 rounded-full bg-canvas ring-2 ring-black/8" aria-hidden />
              <Carte>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{formatDate(o.date_observation)}</span>
                    <Pastille ton={TON_CATEGORIE[o.categorie]}>
                      {CATEGORIES_OBSERVATION[o.categorie as keyof typeof CATEGORIES_OBSERVATION] ?? o.categorie}
                    </Pastille>
                  </div>
                  <Link href={`/eleves/${eleveId}/observations/${o.id}`} className="text-sm text-muted underline">
                    Modifier
                  </Link>
                </div>
                <p className="text-sm whitespace-pre-line text-ink">{o.contenu}</p>
              </Carte>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function OngletIncidents({
  eleveId,
  incidents,
}: {
  eleveId: string;
  incidents: Awaited<ReturnType<typeof listerIncidents>>;
}) {
  const parType = new Map<string, number>();
  for (const i of incidents) {
    const cle = i.type_incident?.libelle ?? "Autre";
    parType.set(cle, (parType.get(cle) ?? 0) + 1);
  }
  const sanctions = incidents.filter((i) => i.type_sanction).length;

  return (
    <div className="space-y-3">
      <LienBouton href={`/eleves/${eleveId}/incidents/nouveau`} className="w-full">
        <Plus className="size-4" aria-hidden /> Nouvel incident
      </LienBouton>
      {incidents.length === 0 ? (
        <EtatVide titre="Aucun incident" texte="Tant mieux ! Les incidents et sanctions apparaîtront ici." />
      ) : (
        <>
          <Carte className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-ink-80">
              {incidents.length} incident{incidents.length > 1 ? "s" : ""}, {sanctions} sanction{sanctions > 1 ? "s" : ""} :
            </span>
            {[...parType.entries()].map(([type, n]) => (
              <Pastille key={type}>
                {type} × {n}
              </Pastille>
            ))}
          </Carte>
          <ul className="space-y-3">
            {incidents.map((i) => (
              <li key={i.id}>
                <Carte className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{formatDate(i.date_incident)}</span>
                      <Pastille ton="orange">{i.type_incident?.libelle ?? "Incident"}</Pastille>
                    </div>
                    <Link href={`/eleves/${eleveId}/incidents/${i.id}`} className="text-sm text-muted underline">
                      Modifier
                    </Link>
                  </div>
                  {i.description && <p className="text-sm whitespace-pre-line text-ink">{i.description}</p>}
                  {i.lieu && <p className="text-xs text-muted">Lieu : {i.lieu}</p>}
                  {i.type_sanction ? (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-900">
                      <p className="font-semibold">
                        Sanction : {i.type_sanction.libelle}
                        {i.duree_sanction && ` (${i.duree_sanction})`}
                      </p>
                      {i.date_sanction && <p className="text-xs">Le {formatDate(i.date_sanction)}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">Pas de sanction</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Pastille ton={i.parent_informe ? "action" : "neutre"}>
                      {i.parent_informe ? "✓ Parents informés" : "Parents non informés"}
                    </Pastille>
                  </div>
                  {i.commentaire && <p className="text-sm text-muted italic">{i.commentaire}</p>}
                </Carte>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
