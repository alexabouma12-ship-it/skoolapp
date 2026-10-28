import type { Metadata } from "next";
import { listerClasses } from "@/lib/donnees";
import { EnTete, Message } from "@/components/ui";
import { FormulaireEleve } from "../formulaire-eleve";

export const metadata: Metadata = { title: "Nouvel élève" };

export default async function PageNouvelEleve({ searchParams }: PageProps<"/eleves/nouveau">) {
  const sp = await searchParams;
  const classeId = typeof sp.classe === "string" ? sp.classe : undefined;
  const ajoute = typeof sp.ajoute === "string" ? sp.ajoute : undefined;
  const cle = typeof sp.n === "string" ? sp.n : "0";

  const classes = await listerClasses();
  const classe = classes.find((c) => c.id === classeId);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <EnTete
        titre="Nouvel élève"
        sousTitre={classe ? `${classe.nom} · ${classe.nb_eleves} élève${classe.nb_eleves > 1 ? "s" : ""} enregistré${classe.nb_eleves > 1 ? "s" : ""}` : undefined}
        retour={classe ? { href: `/classes/${classe.id}`, label: classe.nom } : { href: "/", label: "Accueil" }}
      />
      {ajoute && <Message type="succes">✓ {ajoute} a été ajouté(e). Vous pouvez saisir l&apos;élève suivant.</Message>}
      {/* La clé change après chaque ajout pour repartir d'un formulaire vide. */}
      <FormulaireEleve key={cle} classes={classes} classeParDefaut={classeId} />
    </div>
  );
}
