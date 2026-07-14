export interface StatutConfigItem {
  label: string;
  icon: string;
  style: string;
}

export interface VolontaireAssigne {
  id?: number;
  idVolontaire: number;
  idGroupe: number;
  idEtude: number;
  iv: number;
  numsujet: number;
  paye: number;
  statut: string;
}

export interface VolontaireInfo {
  prenom?: string;
  prenomVol?: string;
  prenomVolontaire?: string;
  nom?: string;
  nomVol?: string;
  nomVolontaire?: string;
  nomComplet?: string;
}

export interface GroupeInfo {
  id: number;
  nom?: string;
}

export interface IndemniteManagerProps {
  etudeId: string | number;
  etudeTitre?: string;
  etudeRef?: string;
  onError?: (error: string) => void;
  showDebugInfo?: boolean;
  rdvs?: any[];
}

export interface UpdateStatusMap {
  [key: string]: 'loading' | 'success' | 'error' | 'cancelled';
}

export interface UpdateParams {
  idEtude: number;
  idGroupe: number;
  idVolontaire: number;
  iv: number;
  numsujet: number;
  paye: number;
  statut: string;
  nouveauStatut?: string;
  nouveauNumSujet?: number;
  nouvelIV?: number;
}
