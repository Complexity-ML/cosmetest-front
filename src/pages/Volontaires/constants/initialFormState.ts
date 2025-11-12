export interface InitialFormStateType {
  // Informations personnelles
  titre: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephoneDomicile: string;
  sexe: string;
  dateNaissance: string;

  // Adresse
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;

  // Caractéristiques physiques
  taille: string;
  poids: string;
  phototype: string;
  ethnie: string;
  sousEthnie: string;
  yeux: string;
  pilosite: string;
  originePere: string;
  origineMere: string;

  // Peau
  typePeauVisage: string;
  carnation: string;
  sensibiliteCutanee: string;
  teintInhomogene: string;
  teintTerne: string;
  poresVisibles: string;
  expositionSolaire: string;
  bronzage: string;
  coupsDeSoleil: string;
  celluliteBras: string;
  celluliteFessesHanches: string;
  celluliteJambes: string;
  celluliteVentreTaille: string;

  // Cheveux et ongles
  couleurCheveux: string;
  longueurCheveux: string;
  natureCheveux: string;
  epaisseurCheveux: string;
  natureCuirChevelu: string;
  cuirCheveluSensible: string;
  chuteDeCheveux: string;
  cheveuxCassants: string;
  onglesCassants: string;
  onglesDedoubles: string;

  // Problèmes spécifiques
  acne: string;
  couperoseRosacee: string;
  dermiteSeborrheique: string;
  eczema: string;
  psoriasis: string;

  // Informations médicales
  traitement: string;
  anamnese: string;
  contraception: string;
  menopause: string;
  allergiesCommentaires: string;
  santeCompatible: string;

  // Notes
  notes: string;

  // Caractéristiques supplémentaires
  cicatrices: string;
  tatouages: string;
  piercings: string;

  // Vergetures
  vergeturesJambes: string;
  vergeturesFessesHanches: string;
  vergeturesVentreTaille: string;
  vergeturesPoitrineDecollete: string;

  // Sécheresse de la peau
  secheresseLevres: string;
  secheresseCou: string;
  secheressePoitrineDecollete: string;
  secheresseVentreTaille: string;
  secheresseFessesHanches: string;
  secheresseBras: string;
  secheresseMains: string;
  secheresseJambes: string;
  secheressePieds: string;

  // Taches pigmentaires
  tachesPigmentairesVisage: string;
  tachesPigmentairesCou: string;
  tachesPigmentairesDecollete: string;
  tachesPigmentairesMains: string;

  // Perte de fermeté
  perteDeFermeteVisage: string;
  perteDeFermeteCou: string;
  perteDeFermeteDecollete: string;

  // Cils
  epaisseurCils: string;
  longueurCils: string;
  courbureCils: string;
  cilsAbimes: string;
  cilsBroussailleux: string;
  chuteDeCils: string;

  // Problèmes médicaux supplémentaires
  angiome: string;
  pityriasis: string;
  vitiligo: string;
  melanome: string;
  zona: string;
  herpes: string;
  pelade: string;
  reactionAllergique: string;
  desensibilisation: string;
  terrainAtopique: string;

  // Valeurs mesurées
  ihBrasDroit: string;
  ihBrasGauche: string;

  // Scores
  scorePod: string;
  scorePog: string;
  scoreFront: string;
  scoreLion: string;
  scorePpd: string;
  scorePpg: string;
  scoreDod: string;
  scoreDog: string;
  scoreSngd: string;
  scoreSngg: string;
  scoreLevsup: string;
  scoreComlevd: string;
  scoreComlevg: string;
  scorePtose: string;
  ita: string;

  // Autres attributs
  levres: string;
  bouffeeChaleurMenaupose: string;
  cernesVasculaires: string;
  cernesPigmentaires: string;
  poches: string;
  nbCigarettesJour: string;
  caracteristiqueSourcils: string;
  mapyeux: string;
  maplevres: string;
  mapsourcils: string;
  ths: string;

  // Informations Bancaires
  iban: string;
  bic: string;

  // Champs pour les évaluations
  evaluation: number;
  evaluationYeux: number;
  evaluationLevres: number;
  evaluationTeint: number;
  evaluationCynetique: number;
}

export const INITIAL_FORM_STATE: InitialFormStateType = {
  // Informations personnelles
  titre: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  telephoneDomicile: "",
  sexe: "",
  dateNaissance: "",

  // Adresse
  adresse: "",
  codePostal: "",
  ville: "",
  pays: "France",

  // Caractéristiques physiques
  taille: "",
  poids: "",
  phototype: "",
  ethnie: "",
  sousEthnie: "",
  yeux: "",
  pilosite: "",
  originePere: "",
  origineMere: "",

  // Peau
  typePeauVisage: "",
  carnation: "",
  sensibiliteCutanee: "",
  teintInhomogene: "Non",
  teintTerne: "Non",
  poresVisibles: "Non",
  expositionSolaire: "",
  bronzage: "",
  coupsDeSoleil: "",
  celluliteBras: "Non",
  celluliteFessesHanches: "Non",
  celluliteJambes: "Non",
  celluliteVentreTaille: "Non",

  // Cheveux et ongles
  couleurCheveux: "",
  longueurCheveux: "",
  natureCheveux: "",
  epaisseurCheveux: "",
  natureCuirChevelu: "",
  cuirCheveluSensible: "Non",
  chuteDeCheveux: "Non",
  cheveuxCassants: "Non",
  onglesCassants: "Non",
  onglesDedoubles: "Non",

  // Problèmes spécifiques
  acne: "Non",
  couperoseRosacee: "Non",
  dermiteSeborrheique: "Non",
  eczema: "Non",
  psoriasis: "Non",

  // Informations médicales
  traitement: "",
  anamnese: "",
  contraception: "",
  menopause: "Non",
  allergiesCommentaires: "",
  santeCompatible: "Oui",

  // Notes
  notes: "",

  // Caractéristiques supplémentaires
  cicatrices: "Non",
  tatouages: "Non",
  piercings: "Non",

  // Vergetures
  vergeturesJambes: "Non",
  vergeturesFessesHanches: "Non",
  vergeturesVentreTaille: "Non",
  vergeturesPoitrineDecollete: "Non",

  // Sécheresse de la peau
  secheresseLevres: "Non",
  secheresseCou: "Non",
  secheressePoitrineDecollete: "Non",
  secheresseVentreTaille: "Non",
  secheresseFessesHanches: "Non",
  secheresseBras: "Non",
  secheresseMains: "Non",
  secheresseJambes: "Non",
  secheressePieds: "Non",

  // Taches pigmentaires
  tachesPigmentairesVisage: "Non",
  tachesPigmentairesCou: "Non",
  tachesPigmentairesDecollete: "Non",
  tachesPigmentairesMains: "Non",

  // Perte de fermeté
  perteDeFermeteVisage: "Non",
  perteDeFermeteCou: "Non",
  perteDeFermeteDecollete: "Non",

  // Cils
  epaisseurCils: "",
  longueurCils: "",
  courbureCils: "",
  cilsAbimes: "Non",
  cilsBroussailleux: "Non",
  chuteDeCils: "Non",

  // Problèmes médicaux supplémentaires
  angiome: "Non",
  pityriasis: "Non",
  vitiligo: "Non",
  melanome: "Non",
  zona: "Non",
  herpes: "Non",
  pelade: "Non",
  reactionAllergique: "Non",
  desensibilisation: "Non",
  terrainAtopique: "Non",

  // Valeurs mesurées
  ihBrasDroit: "",
  ihBrasGauche: "",

  // Scores
  scorePod: "",
  scorePog: "",
  scoreFront: "",
  scoreLion: "",
  scorePpd: "",
  scorePpg: "",
  scoreDod: "",
  scoreDog: "",
  scoreSngd: "",
  scoreSngg: "",
  scoreLevsup: "",
  scoreComlevd: "",
  scoreComlevg: "",
  scorePtose: "",
  ita: "",

  // Autres attributs manquants
  levres: "",
  bouffeeChaleurMenaupose: "Non",
  cernesVasculaires: "Non",
  cernesPigmentaires: "Non",
  poches: "Non",
  nbCigarettesJour: "",
  caracteristiqueSourcils: "",
  mapyeux: "",
  maplevres: "",
  mapsourcils: "",
  ths: "Non",

  // Informations Bancaires
  iban: "",
  bic: "",

  // Champs pour les évaluations
  evaluation: 0,
  evaluationYeux: 0,
  evaluationLevres: 0,
  evaluationTeint: 0,
  evaluationCynetique: 0,
};
