import { enregistrerEleve } from "@/lib/actions/eleves";
import { REGIMES, STATUTS } from "@/lib/constantes";
import type { Classe, Eleve } from "@/lib/types";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { CaseACocher, Carte, Champ, Liste, ZoneTexte } from "@/components/ui";

export function FormulaireEleve({
  eleve,
  classes,
  classeParDefaut,
}: {
  eleve?: Eleve;
  classes: Pick<Classe, "id" | "nom" | "annee_scolaire">[];
  classeParDefaut?: string;
}) {
  const nouveau = !eleve;

  return (
    <Formulaire action={enregistrerEleve.bind(null, eleve?.id ?? null)} className="space-y-5">
      <Carte className="space-y-4">
        <h2 className="font-semibold text-ink">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Nom" name="nom" required defaultValue={eleve?.nom} autoFocus autoCapitalize="characters" />
          <Champ label="Prénoms" name="prenoms" defaultValue={eleve?.prenoms} autoCapitalize="words" />
          <Champ
            label="Matricule"
            name="matricule"
            defaultValue={eleve?.matricule ?? ""}
            autoCapitalize="characters"
          />
          <Liste
            label="Classe"
            name="classe_id"
            vide="— Sans classe —"
            defaultValue={eleve?.classe_id ?? classeParDefaut ?? ""}
            options={classes.map((c) => ({ value: c.id, label: `${c.nom} (${c.annee_scolaire})` }))}
          />
          <Liste
            label="Sexe"
            name="sexe"
            vide="—"
            defaultValue={eleve?.sexe ?? ""}
            options={[
              { value: "F", label: "Fille" },
              { value: "M", label: "Garçon" },
            ]}
          />
          <Champ label="Date de naissance" name="date_naissance" type="date" defaultValue={eleve?.date_naissance ?? ""} />
          <Champ label="Lieu de naissance" name="lieu_naissance" defaultValue={eleve?.lieu_naissance ?? ""} />
        </div>
      </Carte>

      <details className="group rounded-2xl border border-black/8 bg-canvas" open={!nouveau}>
        <summary className="cursor-pointer list-none p-4 font-semibold text-ink sm:p-5">
          Informations complémentaires
          <span className="ml-2 text-sm font-normal text-muted group-open:hidden">(facultatif)</span>
        </summary>
        <div className="space-y-4 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Liste
              label="Statut"
              name="statut"
              vide="—"
              defaultValue={eleve?.statut ?? ""}
              options={Object.entries(STATUTS).map(([value, label]) => ({ value, label }))}
            />
            <Liste
              label="Régime"
              name="regime"
              vide="—"
              defaultValue={eleve?.regime ?? ""}
              options={Object.entries(REGIMES).map(([value, label]) => ({ value, label }))}
            />
            <Champ label="Téléphone de l'élève" name="telephone" type="tel" defaultValue={eleve?.telephone ?? ""} />
            <Champ label="Adresse / quartier" name="adresse" defaultValue={eleve?.adresse ?? ""} />
          </div>
          <CaseACocher label="Redoublant(e)" name="redoublant" defaultChecked={eleve?.redoublant} />
          <ZoneTexte
            label="Notes générales"
            name="notes"
            defaultValue={eleve?.notes ?? ""}
            placeholder="Allergies, situation particulière, à savoir…"
          />
        </div>
      </details>

      <div className="flex flex-col gap-2 sm:flex-row">
        {nouveau ? (
          <>
            <BoutonEnvoyer name="suite" value="suivant">
              Enregistrer et ajouter le suivant
            </BoutonEnvoyer>
            <BoutonEnvoyer name="suite" value="fiche" variante="secondaire">
              Enregistrer et voir la fiche
            </BoutonEnvoyer>
          </>
        ) : (
          <BoutonEnvoyer>Enregistrer les modifications</BoutonEnvoyer>
        )}
      </div>
    </Formulaire>
  );
}
