import { supprimerIncident } from "@/lib/actions/suivi";
import { lireEleve, lireIncident, listerTypes } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { BoutonSupprimer } from "@/components/formulaire";
import { EnTete } from "@/components/ui";
import { FormulaireIncident } from "../formulaire-incident";

export default async function PageModifierIncident({ params }: PageProps<"/eleves/[id]/incidents/[iid]">) {
  const { id, iid } = await params;
  const [eleve, incident, types] = await Promise.all([lireEleve(id), lireIncident(iid), listerTypes()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EnTete
        titre="Modifier l'incident"
        sousTitre={nomComplet(eleve)}
        retour={{ href: `/eleves/${id}?onglet=incidents`, label: "Fiche élève" }}
      />
      <FormulaireIncident eleveId={id} incident={incident} {...types} />
      <form action={supprimerIncident.bind(null, id, iid)}>
        <BoutonSupprimer message="Supprimer cet incident et sa sanction ?">Supprimer l&apos;incident</BoutonSupprimer>
      </form>
    </div>
  );
}
