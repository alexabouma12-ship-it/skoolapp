import { lierResponsableExistant } from "@/lib/actions/responsables";
import { LIENS_PARENTE } from "@/lib/constantes";
import { lireEleve, lireResponsablesEleve, listerTousResponsables } from "@/lib/donnees";
import { formatTelephone, nomComplet } from "@/lib/format";
import { BoutonEnvoyer, Formulaire } from "@/components/formulaire";
import { Carte, EnTete, Liste } from "@/components/ui";
import { FormulaireParent } from "../formulaire-parent";

/** « KOUAMÉ Jean (Père de Awa, Koffi) · 07 07 12 34 56 » */
function libelleParent(r: Awaited<ReturnType<typeof listerTousResponsables>>[number]) {
  const enfants = r.eleve_responsables.map((er) => er.eleve.prenoms || er.eleve.nom).join(", ");
  const lien = enfants ? `${LIENS_PARENTE[r.lien]} de ${enfants}` : LIENS_PARENTE[r.lien];
  const tel = r.telephone_1 ? ` · ${formatTelephone(r.telephone_1)}` : "";
  return `${nomComplet(r)} (${lien})${tel}`;
}

export default async function PageNouveauParent({ params }: PageProps<"/eleves/[id]/parents/nouveau">) {
  const { id } = await params;
  const [eleve, dejaLies, tous] = await Promise.all([lireEleve(id), lireResponsablesEleve(id), listerTousResponsables()]);
  const lies = new Set(dejaLies.map((r) => r.id));
  const disponibles = tous.filter((r) => !lies.has(r.id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EnTete
        titre="Ajouter un parent"
        sousTitre={nomComplet(eleve)}
        retour={{ href: `/eleves/${id}?onglet=parents`, label: "Fiche élève" }}
      />

      {disponibles.length > 0 && (
        <Carte>
          <h2 className="mb-1 font-semibold text-ink">Parent déjà enregistré ?</h2>
          <p className="mb-3 text-sm text-muted">Pour un frère ou une sœur, choisissez le parent existant.</p>
          <Formulaire action={lierResponsableExistant.bind(null, id)}>
            <Liste
              label="Parent"
              name="responsable_id"
              vide="— Choisir —"
              required
              options={disponibles.map((r) => ({
                value: r.id,
                label: libelleParent(r),
              }))}
            />
            <BoutonEnvoyer variante="secondaire">Rattacher ce parent</BoutonEnvoyer>
          </Formulaire>
        </Carte>
      )}

      <div>
        {disponibles.length > 0 && <h2 className="mb-2 font-semibold text-ink">Ou nouveau parent</h2>}
        <FormulaireParent eleveId={id} principal={dejaLies.length === 0} />
      </div>
    </div>
  );
}
