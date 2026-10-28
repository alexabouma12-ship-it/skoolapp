"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { definirPhoto } from "@/lib/actions/eleves";
import { Avatar } from "@/components/eleves";

/** Réduit la photo à 480 px max (JPEG) : envoi rapide même en 3G. */
async function compresser(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, 480 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Compression impossible"))), "image/jpeg", 0.8),
  );
}

export function PhotoEleve({
  eleveId,
  userId,
  url,
  nom,
  prenoms,
}: {
  eleveId: string;
  userId: string;
  url?: string;
  nom: string;
  prenoms: string;
}) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(fichier: File) {
    setErreur(null);
    try {
      const blob = await compresser(fichier);
      const chemin = `${userId}/${eleveId}-${Date.now()}.jpg`;
      const { error } = await createClient().storage.from("photos").upload(chemin, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      await definirPhoto(eleveId, chemin);
      router.refresh();
    } catch (e) {
      console.error(e);
      setErreur("Envoi de la photo impossible.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => champ.current?.click()}
        disabled={enCours}
        className="group relative rounded-full disabled:opacity-60"
        aria-label={url ? "Changer la photo" : "Ajouter une photo"}
      >
        <Avatar nom={nom} prenoms={prenoms} url={url} taille="lg" />
        <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-canvas text-ink-80 ring-1 ring-black/8 group-hover:text-action">
          <Camera className="size-4" aria-hidden />
        </span>
      </button>
      {enCours && <span className="text-xs text-muted">Envoi…</span>}
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
      {url && !enCours && (
        <button
          type="button"
          className="text-xs text-muted underline"
          onClick={() =>
            confirm("Retirer la photo ?") &&
            demarrer(async () => {
              await definirPhoto(eleveId, null);
              router.refresh();
            })
          }
        >
          Retirer
        </button>
      )}
      <input
        ref={champ}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const fichier = e.target.files?.[0];
          e.target.value = "";
          if (fichier) demarrer(() => envoyer(fichier));
        }}
      />
    </div>
  );
}
