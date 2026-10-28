import { enregistrerObservation } from "@/lib/actions/suivi";
import { CATEGORIES_OBSERVATION } from "@/lib/constantes";
import type { Observation } from "@/lib/types";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { Carte, Champ, Liste, ZoneTexte } from "@/components/ui";

export function FormulaireObservation({ eleveId, observation }: { eleveId: string; observation?: Observation }) {
  return (
    <Carte>
      <Formulaire action={enregistrerObservation.bind(null, eleveId, observation?.id ?? null)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            label="Date"
            name="date_observation"
            type="date"
            required
            defaultValue={observation?.date_observation ?? new Date().toISOString().slice(0, 10)}
          />
          <Liste
            label="Catégorie"
            name="categorie"
            defaultValue={observation?.categorie ?? "comportement"}
            options={Object.entries(CATEGORIES_OBSERVATION).map(([value, label]) => ({ value, label }))}
          />
        </div>
        <ZoneTexte
          label="Observation"
          name="contenu"
          required
          rows={6}
          defaultValue={observation?.contenu}
          placeholder="Ce que vous avez constaté, ce qui a été dit, la suite à donner…"
          autoFocus
        />
        <BoutonEnvoyer className="w-full sm:w-auto">Enregistrer</BoutonEnvoyer>
      </Formulaire>
    </Carte>
  );
}
