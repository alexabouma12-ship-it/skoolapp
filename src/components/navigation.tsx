"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, School, UserPlus, Settings } from "lucide-react";
import { cx } from "./ui";

const LIENS = [
  { href: "/", label: "Recherche", icone: Search },
  { href: "/classes", label: "Classes", icone: School },
  { href: "/eleves/nouveau", label: "Ajouter", icone: UserPlus },
  { href: "/parametres", label: "Réglages", icone: Settings },
];

function estActif(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || (pathname.startsWith("/eleves/") && pathname !== "/eleves/nouveau");
  return pathname.startsWith(href);
}

/** global-nav : barre noire de 44 px, liens 12 px blancs. */
export function NavigationHaut() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-6 sm:flex">
      {LIENS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cx(
            "text-xs tracking-[-0.01em] transition-opacity",
            estActif(pathname, href) ? "text-white" : "text-white/70 hover:text-white",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Barre d'onglets mobile, en verre dépoli Parchment (sub-nav-frosted). */
export function NavigationBas() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/8 bg-parchment/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-180 sm:hidden">
      <ul className="grid grid-cols-4">
        {LIENS.map(({ href, label, icone: Icone }) => {
          const actif = estActif(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cx(
                  "presse flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] tracking-[-0.01em]",
                  actif ? "text-action" : "text-muted",
                )}
              >
                <Icone className="size-6" aria-hidden strokeWidth={actif ? 2.2 : 1.6} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
