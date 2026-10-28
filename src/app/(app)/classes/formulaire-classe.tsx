import { enregistrerClasse } from "@/lib/actions/classes";
import { anneeScolaireCourante } from "@/lib/constantes";
import type { Classe } from "@/lib/types";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { Carte, Champ } from "@/components/ui";

export function FormulaireClasse({ classe }: { classe?: Classe }) {
  return (
    <Carte>
      <Formulaire action={enregistrerClasse.bind(null, classe?.id ?? null)}>
        <Champ
          label="Nom de la classe"
          name="nom"
          required
          defaultValue={classe?.nom}
          placeholder="Ex. 3e 2, 2nde A1, Tle D2"
          autoFocus
        />
        <Champ
          label="Année scolaire"
          name="annee_scolaire"
          required
          defaultValue={classe?.annee_scolaire ?? anneeScolaireCourante()}
          pattern="\d{4}-\d{4}"
          aide="Format : 2026-2027"
        />
        <BoutonEnvoyer className="w-full sm:w-auto">Enregistrer</BoutonEnvoyer>
      </Formulaire>
    </Carte>
  );
}
