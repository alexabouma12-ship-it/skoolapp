"use client";

import { Bouton, EtatVide } from "@/components/ui";

export default function Erreur({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EtatVide
      titre="Une erreur est survenue"
      texte="Vérifiez votre connexion internet puis réessayez."
      action={<Bouton onClick={reset}>Réessayer</Bouton>}
    />
  );
}
