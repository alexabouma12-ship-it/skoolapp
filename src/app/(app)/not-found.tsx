import { EtatVide, LienBouton } from "@/components/ui";

export default function Introuvable() {
  return (
    <EtatVide
      titre="Page introuvable"
      texte="Cet élément n'existe pas ou a été supprimé."
      action={<LienBouton href="/">Retour à l&apos;accueil</LienBouton>}
    />
  );
}
