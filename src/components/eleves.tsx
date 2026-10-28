import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { age, formatDate, initiales, nomComplet } from "@/lib/format";
import { cx, Pastille } from "./ui";

export function Avatar({
  nom,
  prenoms,
  url,
  taille = "md",
}: {
  nom: string;
  prenoms?: string | null;
  url?: string;
  taille?: "md" | "lg";
}) {
  const dimensions = taille === "lg" ? "size-20 text-2xl" : "size-11 text-sm";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- URL signée temporaire, pas d'optimisation utile
    return <img src={url} alt="" className={cx(dimensions, "shrink-0 rounded-full object-cover ring-1 ring-black/8")} />;
  }
  return (
    <span
      aria-hidden
      className={cx(
        dimensions,
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        "bg-parchment text-ink-80",
      )}
    >
      {initiales(nom, prenoms)}
    </span>
  );
}

export type EleveListe = {
  id: string;
  nom: string;
  prenoms: string;
  sexe: string | null;
  matricule: string | null;
  date_naissance: string | null;
  photo_path: string | null;
  classe_nom?: string | null;
  nb_incidents?: number;
};

export function ListeEleves({
  eleves,
  photos,
  afficherClasse = true,
}: {
  eleves: EleveListe[];
  photos: Map<string, string>;
  afficherClasse?: boolean;
}) {
  return (
    <ul className="divide-y divide-divider overflow-hidden rounded-2xl border border-black/8 bg-canvas">
      {eleves.map((e) => {
        const a = age(e.date_naissance);
        return (
          <li key={e.id}>
            <Link href={`/eleves/${e.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-parchment active:bg-parchment">
              <Avatar nom={e.nom} prenoms={e.prenoms} url={e.photo_path ? photos.get(e.photo_path) : undefined} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{nomComplet(e)}</p>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                  {afficherClasse && e.classe_nom && <span className="font-medium text-ink-80">{e.classe_nom}</span>}
                  {e.matricule && <span className="font-mono">{e.matricule}</span>}
                  {e.date_naissance && (
                    <span>
                      {formatDate(e.date_naissance)}
                      {a !== null && ` (${a} ans)`}
                    </span>
                  )}
                </p>
              </div>
              {!!e.nb_incidents && (
                <Pastille ton={e.nb_incidents >= 3 ? "rouge" : "orange"}>
                  {e.nb_incidents} incident{e.nb_incidents > 1 ? "s" : ""}
                </Pastille>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-48" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
