import { supprimerClasse } from "@/lib/actions/classes";
import { lireClasse } from "@/lib/donnees";
import { BoutonSupprimer } from "@/components/formulaire";
import { EnTete } from "@/components/ui";
import { FormulaireClasse } from "../../formulaire-classe";

export default async function PageModifierClasse({ params }: PageProps<"/classes/[id]/modifier">) {
  const { id } = await params;
  const classe = await lireClasse(id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <EnTete titre={`Modifier ${classe.nom}`} retour={{ href: `/classes/${id}`, label: classe.nom }} />
      <FormulaireClasse classe={classe} />
      <form action={supprimerClasse.bind(null, id)} className="border-t border-hairline pt-6">
        <p className="mb-3 text-sm text-muted">
          Supprimer la classe ne supprime pas ses élèves : ils restent consultables, sans classe.
        </p>
        <BoutonSupprimer message={`Supprimer la classe ${classe.nom} ?`}>Supprimer la classe</BoutonSupprimer>
      </form>
    </div>
  );
}
