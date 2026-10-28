import { lireResponsable, lireResponsablesEleve } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { EnTete } from "@/components/ui";
import { FormulaireParent } from "../formulaire-parent";

export default async function PageModifierParent({ params }: PageProps<"/eleves/[id]/parents/[rid]">) {
  const { id, rid } = await params;
  const [responsable, lies] = await Promise.all([lireResponsable(rid), lireResponsablesEleve(id)]);
  const principal = lies.find((r) => r.id === rid)?.principal;

  return (
    <div className="mx-auto max-w-2xl">
      <EnTete
        titre="Modifier le parent"
        sousTitre={nomComplet(responsable)}
        retour={{ href: `/eleves/${id}?onglet=parents`, label: "Fiche élève" }}
      />
      <FormulaireParent eleveId={id} responsable={responsable} principal={principal} />
    </div>
  );
}
