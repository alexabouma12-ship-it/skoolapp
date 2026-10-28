import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Variante = "primaire" | "secondaire" | "danger" | "fantome";

// button-primary : pilule Action Blue · button-secondary-pill : pilule « fantôme » bleue
const VARIANTES: Record<Variante, string> = {
  primaire: "bg-action text-white",
  secondaire: "bg-canvas text-action ring-1 ring-inset ring-action",
  danger: "bg-canvas text-red-700 ring-1 ring-inset ring-red-300",
  fantome: "text-action hover:bg-action-50",
};

export function classesBouton(variante: Variante = "primaire", extra?: string) {
  return cx(
    "presse inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-[22px] text-[17px] font-normal tracking-[-0.022em] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTES[variante],
    extra,
  );
}

export function Bouton({
  variante = "primaire",
  className,
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={classesBouton(variante, className)} {...props} />;
}

export function LienBouton({
  variante = "primaire",
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={classesBouton(variante, className)} {...props} />;
}

const classesChamp =
  "block w-full min-h-11 rounded-xl border border-black/10 bg-canvas px-3.5 py-2 text-[17px] text-ink placeholder:text-muted-48 focus:border-action-focus focus:ring-1 focus:ring-action-focus focus:outline-none aria-invalid:border-red-500";

function Etiquette({ htmlFor, label, requis }: { htmlFor: string; label: string; requis?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-80">
      {label}
      {requis && <span className="text-red-600"> *</span>}
    </label>
  );
}

export function Champ({
  label,
  name,
  erreur,
  aide,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; name: string; erreur?: string; aide?: string }) {
  return (
    <div className={className}>
      <Etiquette htmlFor={name} label={label} requis={props.required} />
      <input id={name} name={name} className={classesChamp} aria-invalid={!!erreur} {...props} />
      {aide && !erreur && <p className="mt-1 text-xs text-muted">{aide}</p>}
      {erreur && <p className="mt-1 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}

export function ZoneTexte({
  label,
  name,
  erreur,
  className,
  ...props
}: ComponentProps<"textarea"> & { label: string; name: string; erreur?: string }) {
  return (
    <div className={className}>
      <Etiquette htmlFor={name} label={label} requis={props.required} />
      <textarea
        id={name}
        name={name}
        rows={4}
        className={cx(classesChamp, "min-h-24")}
        aria-invalid={!!erreur}
        {...props}
      />
      {erreur && <p className="mt-1 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}

export function Liste({
  label,
  name,
  options,
  vide,
  erreur,
  className,
  ...props
}: ComponentProps<"select"> & {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  vide?: string;
  erreur?: string;
}) {
  return (
    <div className={className}>
      <Etiquette htmlFor={name} label={label} requis={props.required} />
      <select id={name} name={name} className={classesChamp} {...props}>
        {vide !== undefined && <option value="">{vide}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {erreur && <p className="mt-1 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}

export function CaseACocher({
  label,
  name,
  ...props
}: ComponentProps<"input"> & { label: string; name: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[17px] text-ink">
      <input type="checkbox" name={name} value="on" className="size-5 accent-action" {...props} />
      {label}
    </label>
  );
}

/** store-utility-card : blanc, filet 1px, rayon 18px, aucune ombre. */
export function Carte({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-2xl border border-black/8 bg-canvas p-4 sm:p-6", className)} {...props} />;
}

export function Pastille({
  children,
  ton = "neutre",
}: {
  children: ReactNode;
  ton?: "neutre" | "action" | "rouge" | "orange";
}) {
  const tons = {
    neutre: "bg-parchment text-ink-80",
    action: "bg-action-50 text-action",
    rouge: "bg-red-50 text-red-700",
    orange: "bg-amber-50 text-amber-800",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tons[ton])}>
      {children}
    </span>
  );
}

export function EnTete({
  titre,
  sousTitre,
  retour,
  actions,
}: {
  titre: ReactNode;
  sousTitre?: ReactNode;
  retour?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {retour && <LienRetour href={retour.href}>{retour.label}</LienRetour>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Titre>{titre}</Titre>
          {sousTitre && <p className="mt-1 text-[17px] text-muted">{sousTitre}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** display-md : 600, approche serrée « Apple tight ». */
export function Titre({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cx("text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]", className)}>
      {children}
    </h1>
  );
}

export function LienRetour({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-2 inline-flex min-h-8 items-center text-[17px] text-action">
      ‹ {children}
    </Link>
  );
}

export function EtatVide({ titre, texte, action }: { titre: string; texte?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-canvas px-6 py-12 text-center">
      <p className="text-[21px] leading-tight font-semibold tracking-[0.011em] text-ink">{titre}</p>
      {texte && <p className="mx-auto mt-2 max-w-md text-[17px] text-muted">{texte}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Message({ type, children }: { type: "erreur" | "succes"; children: ReactNode }) {
  return (
    <p
      role={type === "erreur" ? "alert" : "status"}
      className={cx(
        "rounded-xl px-4 py-3 text-[15px]",
        type === "erreur" ? "bg-red-50 text-red-800" : "bg-action-50 text-ink",
      )}
    >
      {children}
    </p>
  );
}
