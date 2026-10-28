import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { listerClasses } from "@/lib/donnees";
import { EnTete, EtatVide, LienBouton } from "@/components/ui";

export const metadata: Metadata = { title: "Classes" };

export default async function PageClasses() {
  const classes = await listerClasses();

  return (
    <>
      <EnTete
        titre="Mes classes"
        actions={
          <LienBouton href="/classes/nouvelle">
            <Plus className="size-4" aria-hidden /> Nouvelle classe
          </LienBouton>
        }
      />
      {classes.length ? (
        <ul className="divide-y divide-divider overflow-hidden rounded-2xl border border-black/8 bg-canvas">
          {classes.map((c) => (
            <li key={c.id}>
              <Link href={`/classes/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-parchment">
                <div>
                  <p className="font-semibold text-ink">{c.nom}</p>
                  <p className="text-sm text-muted">
                    {c.nb_eleves} élève{c.nb_eleves > 1 ? "s" : ""} · {c.annee_scolaire}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-48" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EtatVide
          titre="Aucune classe"
          texte="Créez les 2 ou 3 classes qui vous sont confiées cette année."
          action={<LienBouton href="/classes/nouvelle">Créer une classe</LienBouton>}
        />
      )}
    </>
  );
}
