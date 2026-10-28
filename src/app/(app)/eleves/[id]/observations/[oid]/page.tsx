import { supprimerObservation } from "@/lib/actions/suivi";
import { lireEleve, lireObservation } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { BoutonSupprimer } from "@/components/formulaire";
import { EnTete } from "@/components/ui";
import { FormulaireObservation } from "../formulaire-observation";

export default async function PageModifierObservation({ params }: PageProps<"/eleves/[id]/observations/[oid]">) {
  const { id, oid } = await params;
  const [eleve, observation] = await Promise.all([lireEleve(id), lireObservation(oid)]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EnTete
        titre="Modifier l'observation"
        sousTitre={nomComplet(eleve)}
        retour={{ href: `/eleves/${id}?onglet=observations`, label: "Fiche élève" }}
      />
      <FormulaireObservation eleveId={id} observation={observation} />
      <form action={supprimerObservation.bind(null, id, oid)}>
        <BoutonSupprimer message="Supprimer cette observation ?">Supprimer l&apos;observation</BoutonSupprimer>
      </form>
    </div>
  );
}
