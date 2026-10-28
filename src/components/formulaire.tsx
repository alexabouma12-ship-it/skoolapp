"use client";

import { createContext, use, useRef, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { EtatFormulaire } from "@/lib/types";
import { Bouton, Message } from "./ui";

const ContexteEnvoi = createContext(false);

/**
 * Formulaire branché sur une Server Action. On passe par onSubmit plutôt que
 * par l'attribut `action` pour que les champs ne soient pas vidés quand le
 * serveur renvoie une erreur de validation.
 */
export function Formulaire({
  action,
  children,
  className = "space-y-4",
}: {
  action: (formData: FormData) => Promise<EtatFormulaire | void>;
  children: ReactNode;
  className?: string;
}) {
  const [etat, setEtat] = useState<EtatFormulaire>({});
  const [enCours, demarrer] = useTransition();
  const formulaire = useRef<HTMLFormElement>(null);

  return (
    <ContexteEnvoi value={enCours}>
      <form
        ref={formulaire}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const formData = new FormData(e.currentTarget, submitter);
          demarrer(async () => {
            const resultat = await action(formData);
            setEtat(resultat ?? {});
            // Sur téléphone le message est souvent hors de l'écran : on le ramène en vue.
            if (resultat?.erreur || resultat?.succes) {
              requestAnimationFrame(() =>
                formulaire.current?.querySelector('[role="alert"], [role="status"]')?.scrollIntoView({ behavior: "smooth", block: "center" }),
              );
            }
          });
        }}
      >
        {etat.erreur && <Message type="erreur">{etat.erreur}</Message>}
        {etat.succes && <Message type="succes">{etat.succes}</Message>}
        {children}
      </form>
    </ContexteEnvoi>
  );
}

export function BoutonEnvoyer({
  children,
  enCours = "Enregistrement…",
  ...props
}: ComponentProps<typeof Bouton> & { enCours?: string }) {
  const envoiFormulaire = use(ContexteEnvoi);
  const { pending } = useFormStatus();
  const occupe = envoiFormulaire || pending;
  return (
    <Bouton type="submit" disabled={occupe} {...props}>
      {occupe ? enCours : children}
    </Bouton>
  );
}

/** Bouton de suppression avec confirmation, à placer dans un <form action={...}>. */
export function BoutonSupprimer({
  message = "Supprimer définitivement ?",
  children = "Supprimer",
  className,
}: {
  message?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Bouton
      type="submit"
      variante="danger"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Suppression…" : children}
    </Bouton>
  );
}
