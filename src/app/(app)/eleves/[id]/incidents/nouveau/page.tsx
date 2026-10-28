import { lireEleve, listerTypes } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { EnTete } from "@/components/ui";
import { FormulaireIncident } from "../formulaire-incident";

export default async function PageNouvelIncident({ params }: PageProps<"/eleves/[id]/incidents/nouveau">) {
  const { id } = await params;
  const [eleve, types] = await Promise.all([lireEleve(id), listerTypes()]);

  return (
    <div className="mx-auto max-w-2xl">
      <EnTete
        titre="Nouvel incident"
        sousTitre={nomComplet(eleve)}
        retour={{ href: `/eleves/${id}?onglet=incidents`, label: "Fiche élève" }}
      />
      <FormulaireIncident eleveId={id} {...types} />
    </div>
  );
}
