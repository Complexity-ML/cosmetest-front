export interface Paiement {
  id?: number;
  idEtude: number;
  idGroupe?: number | string;
  idVolontaire: number;
  iv: number;
  numsujet?: string;
  paye: number;
  statut?: number;
}

export interface VolontaireInfo {
  idVolontaire: number | string;
  nom: string;
  prenom: string;
  [key: string]: unknown;
}

export interface GroupeInfo {
  idGroupe: number | string;
  nom: string;
  [key: string]: unknown;
}

export interface PaiementSummary {
  total: number;
  payes: number;
  nonPayes: number;
  enAttente: number;
  annules: number;
  montantTotal: number;
  montantPaye: number;
  [key: string]: number;
}
