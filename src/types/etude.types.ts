// Types pour les études

export interface EtudeData {
  idEtude?: number;
  ref?: string;
  titre?: string;
  description?: string;
  examens?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  capaciteVolontaires?: number;
  paye?: boolean | number;
  montant?: number;
  statut?: string;
  [key: string]: any;
}

export interface EtudeTransformed extends EtudeData {
  id?: number;
}

export interface EtudeFilters {
  ref?: string;
  titre?: string;
  type?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}

export interface EtudeStats {
  total: number;
  enCours: number;
  terminees: number;
  aVenir: number;
  volontairesTotal: number;
}

export interface GroupeData {
  idGroupe?: number;
  intitule?: string;
  description?: string;
  idEtude?: number;
  ageMinimum?: number;
  ageMaximum?: number;
  sexe?: string;
  ethnie?: string | string[];
  nbSujet?: number;
  iv?: number;
  criteresSupplémentaires?: string;
  [key: string]: any;
}

export interface IndemniteData {
  idEtude: number;
  idVolontaire: number;
  montant: number;
  statut?: string;
  datePaiement?: string;
  [key: string]: any;
}
