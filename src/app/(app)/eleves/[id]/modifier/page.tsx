import { supprimerEleve } from "@/lib/actions/eleves";
import { lireEleve, listerClasses } from "@/lib/donnees";
import { nomComplet } from "@/lib/format";
import { BoutonSupprimer } from "@/components/formulaire";
import { EnTete } from "@/components/ui";
import { FormulaireEleve } from "../../formulaire-eleve";

export default async function PageModifierEleve({ params }: PageProps<"/eleves/[id]/modifier">) {
  const { id } = await params;
  const [eleve, classes] = await Promise.all([lireEleve(id), listerClasses()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EnTete titre="Modifier l'élève" sousTitre={nomComplet(eleve)} retour={{ href: `/eleves/${id}`, label: "Fiche élève" }} />
      <FormulaireEleve eleve={eleve} classes={classes} />
      <form action={supprimerEleve.bind(null, id)} className="border-t border-hairline pt-6">
        <p className="mb-3 text-sm text-muted">
          La suppression efface aussi les observations, incidents et la photo de l&apos;élève. Elle est définitive.
        </p>
        <BoutonSupprimer message={`Supprimer définitivement ${nomComplet(eleve)} et tout son suivi ?`}>
          Supprimer l&apos;élève
        </BoutonSupprimer>
      </form>
    </div>
  );
}
