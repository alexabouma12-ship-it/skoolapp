"use client";

import { useActionState } from "react";
import { seConnecter } from "@/lib/actions/auth";
import { BoutonEnvoyer } from "@/components/formulaire";
import { Carte, Champ, Message } from "@/components/ui";

export function FormulaireConnexion() {
  const [etat, action] = useActionState(seConnecter, {});

  return (
    <Carte>
      <form action={action} className="space-y-4">
        {etat.erreur && <Message type="erreur">{etat.erreur}</Message>}
        <Champ label="Email" name="email" type="email" autoComplete="email" required />
        <Champ
          label="Mot de passe"
          name="mot_de_passe"
          type="password"
          autoComplete="current-password"
          required
        />
        <BoutonEnvoyer className="w-full" enCours="Connexion…">
          Se connecter
        </BoutonEnvoyer>
      </form>
    </Carte>
  );
}
