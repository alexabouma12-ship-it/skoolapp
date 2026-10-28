import { enregistrerIncident } from "@/lib/actions/suivi";
import type { Incident, TypeIncident, TypeSanction } from "@/lib/types";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { CaseACocher, Carte, Champ, Liste, ZoneTexte } from "@/components/ui";

export function FormulaireIncident({
  eleveId,
  incident,
  typesIncident,
  typesSanction,
}: {
  eleveId: string;
  incident?: Incident;
  typesIncident: TypeIncident[];
  typesSanction: TypeSanction[];
}) {
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <Formulaire action={enregistrerIncident.bind(null, eleveId, incident?.id ?? null)} className="space-y-5">
      <Carte className="space-y-4">
        <h2 className="font-semibold text-ink">L&apos;incident</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Date" name="date_incident" type="date" required defaultValue={incident?.date_incident ?? aujourdhui} />
          <Liste
            label="Type d'incident"
            name="type_incident_id"
            vide="— Choisir —"
            defaultValue={incident?.type_incident_id ?? ""}
            options={typesIncident.map((t) => ({ value: t.id, label: t.libelle }))}
          />
          <Champ
            label="Lieu"
            name="lieu"
            defaultValue={incident?.lieu ?? ""}
            placeholder="Salle, cour, cantine…"
            className="sm:col-span-2"
          />
        </div>
        <ZoneTexte
          label="Description"
          name="description"
          defaultValue={incident?.description ?? ""}
          placeholder="Ce qui s'est passé, avec qui, quel cours…"
        />
      </Carte>

      <Carte className="space-y-4">
        <h2 className="font-semibold text-ink">Sanction</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Liste
            label="Sanction donnée"
            name="type_sanction_id"
            vide="— Aucune sanction —"
            defaultValue={incident?.type_sanction_id ?? ""}
            options={typesSanction.map((t) => ({ value: t.id, label: t.libelle }))}
          />
          <Champ label="Date de la sanction" name="date_sanction" type="date" defaultValue={incident?.date_sanction ?? aujourdhui} />
          <Champ
            label="Durée"
            name="duree_sanction"
            defaultValue={incident?.duree_sanction ?? ""}
            placeholder="Ex. 2 heures, 3 jours"
          />
        </div>
        <CaseACocher label="Les parents ont été informés" name="parent_informe" defaultChecked={incident?.parent_informe} />
        <ZoneTexte label="Commentaire / suite donnée" name="commentaire" rows={3} defaultValue={incident?.commentaire ?? ""} />
      </Carte>

      <BoutonEnvoyer className="w-full sm:w-auto">Enregistrer l&apos;incident</BoutonEnvoyer>
    </Formulaire>
  );
}
