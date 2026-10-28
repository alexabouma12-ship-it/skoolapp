export const LIENS_PARENTE = {
  pere: "Père",
  mere: "Mère",
  tuteur: "Tuteur",
  tutrice: "Tutrice",
  autre: "Autre",
} as const;

export const CATEGORIES_OBSERVATION = {
  comportement: "Comportement",
  travail: "Travail scolaire",
  positif: "Point positif",
  entretien: "Entretien",
  famille: "Famille",
  sante: "Santé",
  autre: "Autre",
} as const;

export const REGIMES = {
  externe: "Externe",
  demi_pension: "Demi-pensionnaire",
  interne: "Interne",
} as const;

export const STATUTS = {
  affecte: "Affecté(e)",
  non_affecte: "Non affecté(e)",
} as const;

/** Année scolaire en cours : elle bascule en août (rentrée de septembre). */
export function anneeScolaireCourante(date = new Date()) {
  const annee = date.getFullYear();
  return date.getMonth() >= 7 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`;
}
