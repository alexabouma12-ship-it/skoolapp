export type Classe = {
  id: string;
  nom: string;
  annee_scolaire: string;
  created_at: string;
};

export type Eleve = {
  id: string;
  classe_id: string | null;
  matricule: string | null;
  nom: string;
  prenoms: string;
  sexe: "M" | "F" | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  statut: "affecte" | "non_affecte" | null;
  redoublant: boolean;
  regime: "externe" | "demi_pension" | "interne" | null;
  adresse: string | null;
  telephone: string | null;
  notes: string | null;
  photo_path: string | null;
  archive: boolean;
  created_at: string;
  updated_at: string;
};

export type Responsable = {
  id: string;
  nom: string;
  prenoms: string;
  lien: "pere" | "mere" | "tuteur" | "tutrice" | "autre";
  telephone_1: string | null;
  telephone_2: string | null;
  whatsapp: string | null;
  email: string | null;
  commune: string | null;
  quartier: string | null;
  profession: string | null;
};

export type Observation = {
  id: string;
  eleve_id: string;
  date_observation: string;
  categorie: string;
  contenu: string;
  created_at: string;
};

export type TypeIncident = { id: string; libelle: string };
export type TypeSanction = { id: string; libelle: string; gravite: number };

export type Incident = {
  id: string;
  eleve_id: string;
  date_incident: string;
  type_incident_id: string | null;
  description: string | null;
  lieu: string | null;
  type_sanction_id: string | null;
  date_sanction: string | null;
  duree_sanction: string | null;
  parent_informe: boolean;
  commentaire: string | null;
  created_at: string;
};

export type ResultatRecherche = {
  id: string;
  matricule: string | null;
  nom: string;
  prenoms: string;
  sexe: "M" | "F" | null;
  date_naissance: string | null;
  photo_path: string | null;
  classe_id: string | null;
  classe_nom: string | null;
  nb_incidents: number;
};

/** État renvoyé par les Server Actions aux formulaires (useActionState). */
export type EtatFormulaire = {
  erreur?: string;
  champs?: Record<string, string>;
  succes?: string;
};
