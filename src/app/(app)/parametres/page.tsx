import type { Metadata } from "next";
import { Download, LogOut, X } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { listerTypes } from "@/lib/donnees";
import { seDeconnecter } from "@/lib/actions/auth";
import {
  ajouterTypeIncident,
  ajouterTypeSanction,
  supprimerTypeIncident,
  supprimerTypeSanction,
} from "@/lib/actions/suivi";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { Bouton, Carte, Champ, classesBouton, EnTete } from "@/components/ui";

export const metadata: Metadata = { title: "Réglages" };

function Puce({ libelle, supprimer }: { libelle: string; supprimer: () => Promise<void> }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-full bg-parchment py-1 pr-1 pl-3 text-sm text-ink">
      {libelle}
      <form action={supprimer}>
        <button
          type="submit"
          className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-chip hover:text-red-700"
          aria-label={`Retirer ${libelle}`}
        >
          <X className="size-3.5" />
        </button>
      </form>
    </li>
  );
}

export default async function PageParametres() {
  const { email } = await requireUser();
  const { typesIncident, typesSanction } = await listerTypes();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <EnTete titre="Réglages" sousTitre={`Connecté en tant que ${email}`} />

      <Carte className="space-y-3">
        <h2 className="font-semibold text-ink">Types d&apos;incident</h2>
        <ul className="flex flex-wrap gap-2">
          {typesIncident.map((t) => (
            <Puce key={t.id} libelle={t.libelle} supprimer={supprimerTypeIncident.bind(null, t.id)} />
          ))}
        </ul>
        <Formulaire action={ajouterTypeIncident} className="flex items-end gap-2">
          <Champ label="Nouveau type" name="libelle" required className="flex-1" />
          <BoutonEnvoyer variante="secondaire" enCours="…">
            Ajouter
          </BoutonEnvoyer>
        </Formulaire>
      </Carte>

      <Carte className="space-y-3">
        <h2 className="font-semibold text-ink">Sanctions</h2>
        <p className="text-sm text-muted">Classées de la moins grave à la plus grave.</p>
        <ul className="flex flex-wrap gap-2">
          {typesSanction.map((t) => (
            <Puce key={t.id} libelle={t.libelle} supprimer={supprimerTypeSanction.bind(null, t.id)} />
          ))}
        </ul>
        <Formulaire action={ajouterTypeSanction} className="flex flex-wrap items-end gap-2">
          <Champ label="Nouvelle sanction" name="libelle" required className="min-w-48 flex-1" />
          <Champ label="Gravité (1 à 9)" name="gravite" type="number" min={1} max={9} defaultValue={3} className="w-28" />
          <BoutonEnvoyer variante="secondaire" enCours="…">
            Ajouter
          </BoutonEnvoyer>
        </Formulaire>
      </Carte>

      <Carte className="space-y-3">
        <h2 className="font-semibold text-ink">Sauvegarde</h2>
        <p className="text-sm text-muted">
          Téléchargez toutes vos données (élèves, parents, observations, incidents) dans un fichier ouvrable avec Excel.
          Pensez à le faire régulièrement.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {[
            { type: "eleves", label: "Élèves et parents" },
            { type: "observations", label: "Observations" },
            { type: "incidents", label: "Incidents" },
          ].map((e) => (
            <a key={e.type} href={`/api/export?type=${e.type}`} className={classesBouton("secondaire")} download>
              <Download className="size-4" aria-hidden /> {e.label}
            </a>
          ))}
        </div>
      </Carte>

      <form action={seDeconnecter}>
        <Bouton type="submit" variante="danger" className="w-full">
          <LogOut className="size-4" aria-hidden /> Se déconnecter
        </Bouton>
      </form>
    </div>
  );
}
