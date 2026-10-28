import type { Metadata } from "next";
import { connection } from "next/server";
import { EnTete } from "@/components/ui";
import { FormulaireClasse } from "../formulaire-classe";

export const metadata: Metadata = { title: "Nouvelle classe" };

export default async function PageNouvelleClasse() {
  // Rendu à la demande : l'année scolaire proposée suit la date du jour.
  await connection();
  return (
    <div className="mx-auto max-w-lg">
      <EnTete titre="Nouvelle classe" retour={{ href: "/classes", label: "Classes" }} />
      <FormulaireClasse />
    </div>
  );
}
