import type { Metadata } from "next";
import { FormulaireConnexion } from "./formulaire-connexion";

export const metadata: Metadata = { title: "Connexion" };

export default function PageConnexion() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-ink text-2xl font-semibold text-white">
            S
          </div>
          <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.02em] text-ink">Skoolapp</h1>
          <p className="mt-1 text-[17px] text-muted">Le suivi de vos élèves, partout avec vous.</p>
        </div>
        <FormulaireConnexion />
      </div>
    </main>
  );
}
