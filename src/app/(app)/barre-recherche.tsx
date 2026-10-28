"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cx } from "@/components/ui";

const classesFiltre =
  "min-h-11 rounded-full border border-black/10 bg-canvas px-4 text-sm text-ink focus:border-action-focus focus:outline-none";

export function BarreRecherche({ classes }: { classes: { id: string; nom: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [enCours, demarrer] = useTransition();
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);

  function appliquer(modifs: Record<string, string | null>) {
    const suivant = new URLSearchParams(params.toString());
    for (const [cle, valeur] of Object.entries(modifs)) {
      if (valeur) suivant.set(cle, valeur);
      else suivant.delete(cle);
    }
    const chaine = suivant.toString();
    demarrer(() => router.replace(chaine ? `${pathname}?${chaine}` : pathname, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(minuteur.current), []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-muted-48" aria-hidden />
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          autoFocus
          value={q}
          onChange={(e) => {
            const valeur = e.target.value;
            setQ(valeur);
            clearTimeout(minuteur.current);
            minuteur.current = setTimeout(() => appliquer({ q: valeur.trim() || null }), 300);
          }}
          placeholder="Nom, prénom, matricule, date de naissance, n° parent…"
          aria-label="Rechercher un élève"
          className="block min-h-12 w-full rounded-full border border-black/10 bg-canvas py-3 pr-12 pl-12 text-[17px] placeholder:text-muted-48 focus:border-action-focus focus:ring-1 focus:ring-action-focus focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              appliquer({ q: null });
            }}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-parchment"
            aria-label="Effacer la recherche"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className={cx("flex flex-wrap items-center gap-2 transition-opacity", enCours && "opacity-60")}>
        <select
          aria-label="Filtrer par classe"
          className={classesFiltre}
          value={params.get("classe") ?? ""}
          onChange={(e) => appliquer({ classe: e.target.value || null })}
        >
          <option value="">Toutes les classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrer par sexe"
          className={classesFiltre}
          value={params.get("sexe") ?? ""}
          onChange={(e) => appliquer({ sexe: e.target.value || null })}
        >
          <option value="">Filles et garçons</option>
          <option value="F">Filles</option>
          <option value="M">Garçons</option>
        </select>
        <label className={cx(classesFiltre, "inline-flex cursor-pointer items-center gap-2")}>
          <input
            type="checkbox"
            className="size-4 accent-action"
            checked={params.get("incidents") === "1"}
            onChange={(e) => appliquer({ incidents: e.target.checked ? "1" : null })}
          />
          Avec incidents
        </label>
      </div>
    </div>
  );
}
