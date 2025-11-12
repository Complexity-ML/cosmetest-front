// Types pour les volontaires

export interface VolontaireData {
  // Identifiants
  idVol?: number;
  volontaireId?: number;

  // Informations personnelles
  nomVol?: string;
  prenomVol?: string;
  emailVol?: string;
  titreVol?: string;
  sexe?: string;
  dateNaissance?: string;
  dateI?: string; // Date d'inclusion/ajout du volontaire

  // Contact
  telPortableVol?: string;
  telDomicileVol?: string;

  // Adresse
  adresseVol?: string;
  cpVol?: string;
  villeVol?: string;
  paysVol?: string;

  // État
  archive?: boolean | number;

  // Caractéristiques physiques
  taille?: number;
  poids?: number;
  phototype?: string;
  ethnie?: string;
  sousEthnie?: string;
  yeux?: string;
  pilosite?: string;
  originePere?: string;
  origineMere?: string;

  // Peau
  typePeauVisage?: string;
  carnation?: string;
  sensibiliteCutanee?: string;
  teintInhomogene?: boolean;
  teintTerne?: boolean;
  poresVisibles?: boolean;
  expositionSolaire?: string;
  bronzage?: string;
  coupsDeSoleil?: string;
  
  // Cellulite
  celluliteBras?: boolean;
  celluliteFessesHanches?: boolean;
  celluliteJambes?: boolean;
  celluliteVentreTaille?: boolean;

  // Vergetures
  vergeturesJambes?: boolean;
  vergeturesFessesHanches?: boolean;
  vergeturesVentreTaille?: boolean;
  vergeturesPoitrineDecollete?: boolean;

  // Cheveux
  couleurCheveux?: string;
  longueurCheveux?: string;
  natureCheveux?: string;
  epaisseurCheveux?: string;
  natureCuirChevelu?: string;
  cuirCheveluSensible?: boolean;
  chuteDeCheveux?: boolean;
  cheveuxCassants?: boolean;

  // Ongles
  onglesCassants?: boolean;
  onglesDedoubles?: boolean;

  // Problèmes spécifiques
  acne?: boolean;
  couperoseRosacee?: boolean;
  dermiteSeborrheique?: boolean;
  eczema?: boolean;
  psoriasis?: boolean;

  // Informations médicales
  traitement?: string;
  anamnese?: string;
  contraception?: string;
  menopause?: boolean;
  allergiesCommentaires?: string;
  santeCompatible?: boolean;

  // Caractéristiques supplémentaires
  cicatrices?: boolean;
  tatouages?: boolean;
  piercings?: boolean;

  // Notes et commentaires
  notes?: number; // Note globale (évaluation en étoiles 0-5)
  commentairesVol?: string; // Commentaires textuels

  // Évaluations détaillées (étoiles 0-5) - camelCase pour le JSON Java
  notesYeux?: number;
  notesLevres?: number;
  notesTeint?: number;
  notesCynetique?: number;

  // Autres propriétés possibles
  [key: string]: any;
}

export interface VolontaireTransformed {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  sexe?: string;
  adresseVol?: string;
  codePostal?: string;
  ville?: string;
  dateNaissance?: string;
  dateI?: string; // Date d'inclusion/ajout du volontaire
  archive?: boolean | number;
  phototype?: string;
  ethnie?: string;
  titre?: string;
  telephone?: string;
  telephoneDomicile?: string;
  pays?: string;
  taille?: number;
  poids?: number;
  sousEthnie?: string;
  yeux?: string;
  pilosite?: string;
  originePere?: string;
  origineMere?: string;
  typePeauVisage?: string;
  carnation?: string;
  sensibiliteCutanee?: string;
  teintInhomogene?: boolean;
  teintTerne?: boolean;
  poresVisibles?: boolean;
  expositionSolaire?: string;
  bronzage?: string;
  coupsDeSoleil?: string;
  celluliteBras?: boolean;
  celluliteFessesHanches?: boolean;
  celluliteJambes?: boolean;
  celluliteVentreTaille?: boolean;
  couleurCheveux?: string;
  longueurCheveux?: string;
  natureCheveux?: string;
  epaisseurCheveux?: string;
  natureCuirChevelu?: string;
  cuirCheveluSensible?: boolean;
  chuteDeCheveux?: boolean;
  cheveuxCassants?: boolean;
  onglesCassants?: boolean;
  onglesDedoubles?: boolean;
  acne?: boolean;
  couperoseRosacee?: boolean;
  dermiteSeborrheique?: boolean;
  eczema?: boolean;
  psoriasis?: boolean;
  traitement?: string;
  anamnese?: string;
  contraception?: string;
  menopause?: boolean;
  allergiesCommentaires?: string;
  santeCompatible?: boolean;
  notes?: string;
  cicatrices?: boolean;
  tatouages?: boolean;
  piercings?: boolean;
  vergeturesJambes?: boolean;
  vergeturesFessesHanches?: boolean;
  vergeturesVentreTaille?: boolean;
  vergeturesPoitrineDecollete?: boolean;
  [key: string]: any;
}

export interface VolontaireFilters {
  nom?: string;
  prenom?: string;
  email?: string;
  sexe?: string;
  ethnie?: string;
  archive?: boolean | number;
  search?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}

export interface VolontaireStats {
  total: number;
  actifs: number;
  archives: number;
  nouveaux: number;
}

export interface AnnulationResult {
  success: boolean;
  rdvsSupprimees?: number;
  etudesDesassignees?: number;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface VolontaireValidation {
  isValid: boolean;
  errors: ValidationErrors;
}
