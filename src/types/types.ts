/**
 * Form Types
 */
export interface FormItem {
  id: string;
  label: string;
}

export interface FormGroup {
  title?: string;
  items: FormItem[];
}

export interface FormSection {
  title: string;
  icon: string;
  groups: FormGroup[];
}

export interface FormData {
  idVol?: string | number;
  [key: string]: any;
}

/**
 * API Response Types
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  page?: number;
}

export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

/**
 * Domain Entity Types
 */
export interface Etude {
  idEtude?: number;
  id?: number;
  ref: string;
  titre?: string;
  dateDebut?: string;
  dateFin?: string;
  type?: string;
  paye?: number;
  rdvCount?: number;
  [key: string]: any;
}

export interface Volontaire {
  idVol?: number;
  id?: number;
  volontaireId?: number;
  nomVol: string;
  prenomVol: string;
  emailVol: string;
  sexe: string;
  adresseVol?: string;
  cpVol?: string;
  villeVol?: string;
  dateNaissance?: string;
  archive?: boolean;
  phototype?: string;
  ethnie?: string;
  telPortableVol?: string;
  telDomicileVol?: string;
  typePeauVisage?: string;
  [key: string]: any;
}

export interface RendezVous {
  idRdv?: number;
  idEtude: number;
  idVolontaire?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  duree?: number;
  salle?: string;
  volontaire?: Volontaire | null;
  [key: string]: any;
}

export interface Groupe {
  idGroupe?: number;
  id?: number;
  nom?: string;
  idEtude?: number;
  ageMin?: number | null;
  ageMax?: number | null;
  ethnie?: string;
  description?: string;
  [key: string]: any;
}

export interface EtudeVolontaire {
  idEtude: number;
  idVolontaire: number;
  idGroupe?: number;
  iv?: number;
  numsujet?: number;
  paye?: number;
  statut?: string;
  [key: string]: any;
}

export interface InfoBancaire {
  iban: string;
  bic: string;
  idVol: number;
  [key: string]: any;
}

export interface Paiement {
  idEtude: number;
  idVolontaire: number;
  montant?: number;
  paye?: number;
  statut?: string;
  dateVersement?: string;
  [key: string]: any;
}

export interface Parametre {
  idVolontaire: number;
  login: string;
  mdp?: string;
  role?: string;
  email?: string;
  [key: string]: any;
}

export interface User {
  id?: number;
  username: string;
  email?: string;
  role?: string;
  token?: string;
  [key: string]: any;
}

/**
 * Search and Filter Types
 */
export interface SearchCriteria {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  [key: string]: any;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Utility Types
 */
export type SortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AssociationId {
  idEtude: number;
  idGroupe: number;
  idVolontaire: number;
  iv: number;
  numsujet: number;
  paye: number;
  statut: string;
}
