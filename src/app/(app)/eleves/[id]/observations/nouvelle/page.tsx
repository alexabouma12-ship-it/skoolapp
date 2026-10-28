import { lireEleve } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { EnTete } from "@/components/ui";
import { FormulaireObservation } from "../formulaire-observation";

export default async function PageNouvelleObservation({ params }: PageProps<"/eleves/[id]/observations/nouvelle">) {
  const { id } = await params;
  const eleve = await lireEleve(id);

  return (
    <div className="mx-auto max-w-2xl">
      <EnTete
        titre="Nouvelle observation"
        sousTitre={nomComplet(eleve)}
        retour={{ href: `/eleves/${id}?onglet=observations`, label: "Fiche élève" }}
      />
      <FormulaireObservation eleveId={id} />
    </div>
  );
}
