import { enregistrerResponsable } from "@/lib/actions/responsables";
import { LIENS_PARENTE } from "@/lib/constantes";
import type { Responsable } from "@/lib/types";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { CaseACocher, Carte, Champ, Liste } from "@/components/ui";

export function FormulaireParent({
  eleveId,
  responsable,
  principal,
}: {
  eleveId: string;
  responsable?: Responsable;
  principal?: boolean;
}) {
  return (
    <Carte>
      <Formulaire action={enregistrerResponsable.bind(null, eleveId, responsable?.id ?? null)}>
        <Liste
          label="Lien avec l'élève"
          name="lien"
          defaultValue={responsable?.lien ?? "pere"}
          options={Object.entries(LIENS_PARENTE).map(([value, label]) => ({ value, label }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Nom" name="nom" required defaultValue={responsable?.nom} autoCapitalize="characters" />
          <Champ label="Prénoms" name="prenoms" defaultValue={responsable?.prenoms} autoCapitalize="words" />
          <Champ
            label="Téléphone principal"
            name="telephone_1"
            type="tel"
            inputMode="tel"
            defaultValue={responsable?.telephone_1 ?? ""}
            placeholder="07 07 12 34 56"
          />
          <Champ label="Autre téléphone" name="telephone_2" type="tel" inputMode="tel" defaultValue={responsable?.telephone_2 ?? ""} />
          <Champ
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={responsable?.whatsapp ?? ""}
            aide="Si différent du téléphone principal"
          />
          <Champ label="Email" name="email" type="email" defaultValue={responsable?.email ?? ""} />
          <Champ label="Commune" name="commune" defaultValue={responsable?.commune ?? ""} placeholder="Ex. Yopougon, Cocody…" />
          <Champ label="Quartier" name="quartier" defaultValue={responsable?.quartier ?? ""} />
          <Champ label="Profession" name="profession" defaultValue={responsable?.profession ?? ""} className="sm:col-span-2" />
        </div>
        <CaseACocher
          label="Contact principal (celui qu'on appelle en premier)"
          name="principal"
          defaultChecked={principal}
        />
        <BoutonEnvoyer className="w-full sm:w-auto">Enregistrer</BoutonEnvoyer>
      </Formulaire>
    </Carte>
  );
}
