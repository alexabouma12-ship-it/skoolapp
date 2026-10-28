const formatDateFr = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });

/** "2010-03-12" -> "12/03/2010" */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return formatDateFr.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

/** "12/03/2010", "12-3-2010" ou "12.03.2010" -> "2010-03-12" (null si invalide) */
export function parseDateFr(texte: string): string | null {
  const m = texte.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return null;
  const [, j, mo, a] = m;
  const d = new Date(Date.UTC(Number(a), Number(mo) - 1, Number(j)));
  if (d.getUTCDate() !== Number(j) || d.getUTCMonth() !== Number(mo) - 1) return null;
  return d.toISOString().slice(0, 10);
}

export function age(iso: string | null | undefined) {
  if (!iso) return null;
  const naissance = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const maintenant = new Date();
  let a = maintenant.getUTCFullYear() - naissance.getUTCFullYear();
  const m = maintenant.getUTCMonth() - naissance.getUTCMonth();
  if (m < 0 || (m === 0 && maintenant.getUTCDate() < naissance.getUTCDate())) a--;
  return a;
}

export function nomComplet(p: { nom: string; prenoms?: string | null }) {
  return [p.nom?.toUpperCase(), p.prenoms].filter(Boolean).join(" ");
}

/** Numéro ivoirien sans indicatif : 10 chiffres (ex. 0707123456). */
function chiffresLocaux(tel: string) {
  let d = tel.replace(/\D/g, "");
  if (d.startsWith("00225")) d = d.slice(5);
  else if (d.startsWith("225") && d.length === 13) d = d.slice(3);
  return d;
}

/** "0707123456" -> "07 07 12 34 56" */
export function formatTelephone(tel: string | null | undefined) {
  if (!tel) return "";
  const d = chiffresLocaux(tel);
  if (d.length !== 10) return tel;
  return d.replace(/(\d{2})(?=\d)/g, "$1 ");
}

export function lienAppel(tel: string) {
  const d = chiffresLocaux(tel);
  return d.length === 10 ? `tel:+225${d}` : `tel:${tel.replace(/[^\d+]/g, "")}`;
}

export function lienWhatsApp(tel: string) {
  const d = chiffresLocaux(tel);
  return `https://wa.me/${d.length === 10 ? `225${d}` : d}`;
}

export function initiales(nom: string, prenoms?: string | null) {
  return ((nom?.[0] ?? "") + (prenoms?.[0] ?? "")).toUpperCase();
}
