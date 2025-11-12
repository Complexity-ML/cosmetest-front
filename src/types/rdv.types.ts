// Types pour les rendez-vous

export interface RendezVousData {
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  dateRdv?: string;
  heureDebut?: string;
  heureFin?: string;
  statut?: string;
  salle?: string;
  commentaire?: string;
  typeRdv?: string;
  duree?: number;
  [key: string]: any;
}

export interface RendezVousFilters {
  idEtude?: number;
  idVolontaire?: number;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  salle?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}

export interface CreneauData {
  date: string;
  heureDebut: string;
  heureFin: string;
  salle?: string;
  capacite?: number;
  volontaires?: number[];
  [key: string]: any;
}

export interface RendezVousStats {
  total: number;
  confirmes: number;
  enAttente: number;
  annules: number;
  termines: number;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  resource?: any;
  [key: string]: any;
}
