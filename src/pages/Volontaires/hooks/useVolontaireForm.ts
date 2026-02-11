import { useState, useEffect, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';

import volontaireService from '../../../services/volontaireService';
import infoBancaireService from '../../../services/infoBancaireService';
import { toISODateString } from '../../../utils/dateUtils';

import { INITIAL_FORM_STATE } from '../constants/initialFormState';

// Helper : matcher une valeur BDD avec les options d'un dropdown (insensible casse/accents/espaces)
const matchOption = (dbValue: any, options: string[]): string => {
  if (!dbValue) return '';
  const val = String(dbValue).trim();
  // Match exact d'abord
  if (options.includes(val)) return val;
  // Match insensible à la casse
  const lower = val.toLowerCase();
  const match = options.find(opt => opt.toLowerCase() === lower);
  return match || val;
};

// Normalise n'importe quel format de phototype vers "I","II",..."VI"
// Gère : "1"→"I", "III"→"III", "Phototype III"→"III", "Phototype 3"→"III", "phototype_3"→"III", etc.
const normalizePhototype = (raw: any): string => {
  if (!raw) return '';
  const s = String(raw).trim();
  // Mapping numérique direct
  const numToRoman: Record<string, string> = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI',
  };
  if (numToRoman[s]) return numToRoman[s];
  // Déjà un chiffre romain valide
  const validRomans = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const upper = s.toUpperCase();
  if (validRomans.includes(upper)) return upper;
  // Extraire le chiffre ou romain d'une chaîne plus longue (ex: "Phototype III", "Phototype 3")
  const match = s.match(/(\d+|[IViv]+)\s*$/);
  if (match) {
    const extracted = match[1];
    if (numToRoman[extracted]) return numToRoman[extracted];
    const extractedUpper = extracted.toUpperCase();
    if (validRomans.includes(extractedUpper)) return extractedUpper;
  }
  return s;
};

// Options valides pour chaque select du formulaire
const SELECT_OPTIONS = {
  phototype: ['I', 'II', 'III', 'IV', 'V', 'VI'],
  typePeauVisage: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Mixte à tendance grasse', 'Mixte à tendance sèche', 'Sensible'],
  carnation: ['Très claire', 'Claire', 'Moyenne', 'Mate', 'Foncée', 'Très foncée'],
  sensibiliteCutanee: ['Peau sensible', 'Peau peu sensible', 'Peau non sensible'],
  expositionSolaire: ['Faiblement', 'Moyennement', 'Fortement'],
  bronzage: ['Progressif', 'Rapide', 'Difficile', 'Inexistant'],
  coupsDeSoleil: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
  couleurCheveux: ['Blond', 'Châtain', 'Brun', 'Noir', 'Roux', 'Gris', 'Blanc', 'Colorés'],
  longueurCheveux: ['Courts', 'Mi-longs', 'Longs', 'Très longs'],
  natureCheveux: ['Raides', 'Ondulés', 'Bouclés', 'Crépus'],
  epaisseurCheveux: ['Fins', 'Moyens', 'Épais'],
  natureCuirChevelu: ['Normal', 'Gras', 'Sec', 'Mixte'],
  epaisseurCils: ['Fins', 'Moyens', 'Épais'],
  longueurCils: ['Courts', 'Moyens', 'Longs'],
  courbureCils: ['Droit', 'Courbé'],
  caracteristiqueSourcils: ['Clairsemés', 'Fournis'],
  levres: ['Fines', 'Moyennes', 'Pulpeuses', 'Asymétriques'],
  sexe: ['M', 'F', 'Masculin', 'Féminin', 'Autre'],
  ethnie: ['Caucasienne', 'Africaine', 'Asiatique', 'Indienne', 'Antillaise'],
};

// Mapping des champs d'erreur vers les onglets correspondants
const FIELD_TO_TAB_MAP: Record<string, string> = {
  // Informations personnelles
  titre: 'infos-personnelles',
  nom: 'infos-personnelles',
  prenom: 'infos-personnelles',
  email: 'infos-personnelles',
  telephone: 'infos-personnelles',
  telephoneDomicile: 'infos-personnelles',
  sexe: 'infos-personnelles',
  dateNaissance: 'infos-personnelles',
  adresse: 'infos-personnelles',
  codePostal: 'infos-personnelles',
  ville: 'infos-personnelles',
  pays: 'infos-personnelles',

  // Caractéristiques physiques
  taille: 'caracteristiques',
  poids: 'caracteristiques',
  phototype: 'caracteristiques',
  ethnie: 'caracteristiques',
  sousEthnie: 'caracteristiques',
  yeux: 'caracteristiques',
  pilosite: 'caracteristiques',
  originePere: 'caracteristiques',
  origineMere: 'caracteristiques',

  // Peau
  typePeauVisage: 'peau',
  carnation: 'peau',
  sensibiliteCutanee: 'peau',
  teintInhomogene: 'peau',
  teintTerne: 'peau',
  poresVisibles: 'peau',
  expositionSolaire: 'peau',
  bronzage: 'peau',
  coupsDeSoleil: 'peau',
  celluliteBras: 'peau',
  celluliteFessesHanches: 'peau',
  celluliteJambes: 'peau',
  celluliteVentreTaille: 'peau',

  // Marques cutanées
  cicatrices: 'marques-cutanees',
  tatouages: 'marques-cutanees',
  piercings: 'marques-cutanees',
  vergeturesJambes: 'marques-cutanees',
  vergeturesFessesHanches: 'marques-cutanees',
  vergeturesVentreTaille: 'marques-cutanees',
  vergeturesPoitrineDecollete: 'marques-cutanees',
  secheresseLevres: 'marques-cutanees',
  secheresseCou: 'marques-cutanees',
  secheressePoitrineDecollete: 'marques-cutanees',
  secheresseVentreTaille: 'marques-cutanees',
  secheresseFessesHanches: 'marques-cutanees',
  secheresseBras: 'marques-cutanees',
  secheresseMains: 'marques-cutanees',
  secheresseJambes: 'marques-cutanees',
  secheressePieds: 'marques-cutanees',
  tachesPigmentairesVisage: 'marques-cutanees',
  tachesPigmentairesCou: 'marques-cutanees',
  tachesPigmentairesDecollete: 'marques-cutanees',
  tachesPigmentairesMains: 'marques-cutanees',
  perteDeFermeteVisage: 'marques-cutanees',
  perteDeFermeteCou: 'marques-cutanees',
  perteDeFermeteDecollete: 'marques-cutanees',

  // Cheveux et ongles
  couleurCheveux: 'cheveux',
  longueurCheveux: 'cheveux',
  natureCheveux: 'cheveux',
  epaisseurCheveux: 'cheveux',
  natureCuirChevelu: 'cheveux',
  cuirCheveluSensible: 'cheveux',
  chuteDeCheveux: 'cheveux',
  cheveuxCassants: 'cheveux',
  onglesCassants: 'cheveux',
  onglesDedoubles: 'cheveux',
  cheveuxAbimes: 'cheveux',
  cheveuxPlats: 'cheveux',
  cheveuxTernes: 'cheveux',
  onglesMous: 'cheveux',
  onglesStries: 'cheveux',
  pellicules: 'cheveux',
  demangeaisonsDuCuirChevelu: 'cheveux',
  pointesFourchues: 'cheveux',
  calvitie: 'cheveux',

  // Cils et sourcils
  epaisseurCils: 'cils',
  longueurCils: 'cils',
  courbureCils: 'cils',
  cilsAbimes: 'cils',
  cilsBroussailleux: 'cils',
  chuteDeCils: 'cils',
  caracteristiqueSourcils: 'cils',
  cils: 'cils',
  mapyeux: 'cils',
  maplevres: 'cils',
  mapsourcils: 'cils',

  // Problèmes spécifiques
  acne: 'problemes',
  couperoseRosacee: 'problemes',
  dermiteSeborrheique: 'problemes',
  eczema: 'problemes',
  psoriasis: 'problemes',
  angiome: 'problemes',
  pityriasis: 'problemes',
  vitiligo: 'problemes',
  melanome: 'problemes',
  zona: 'problemes',
  herpes: 'problemes',
  pelade: 'problemes',
  reactionAllergique: 'problemes',
  desensibilisation: 'problemes',
  terrainAtopique: 'problemes',
  lesionsInflammatoires: 'problemes',
  lesionsRetentionnelles: 'problemes',

  // Informations médicales
  traitement: 'medical',
  anamnese: 'medical',
  contraception: 'medical',
  menopause: 'medical',
  allergiesCommentaires: 'medical',
  santeCompatible: 'medical',
  bouffeeChaleurMenaupose: 'medical',
  cernesVasculaires: 'medical',
  cernesPigmentaires: 'medical',
  poches: 'medical',
  nbCigarettesJour: 'medical',
  ths: 'medical',

  // Mesures
  ihBrasDroit: 'mesures',
  ihBrasGauche: 'mesures',
  scorePod: 'mesures',
  scorePog: 'mesures',
  scoreFront: 'mesures',
  scoreLion: 'mesures',
  scorePpd: 'mesures',
  scorePpg: 'mesures',
  scoreDod: 'mesures',
  scoreDog: 'mesures',
  scoreSngd: 'mesures',
  scoreSngg: 'mesures',
  scoreLevsup: 'mesures',
  scoreComlevd: 'mesures',
  scoreComlevg: 'mesures',
  scorePtose: 'mesures',
  ita: 'mesures',
  levres: 'mesures',
  hauteurSiege: 'mesures',

  // Notes
  notes: 'notes',

  // RIB
  iban: 'RIB',
  bic: 'RIB',

  // Évaluation
  evaluation: 'evaluation',
  evaluationYeux: 'evaluation',
  evaluationLevres: 'evaluation',
  evaluationTeint: 'evaluation',
  evaluationCynetique: 'evaluation',
};

// Fonction pour trouver le premier onglet contenant une erreur
const findFirstTabWithError = (errors: FormErrors): string | null => {
  const errorFields = Object.keys(errors);
  if (errorFields.length === 0) return null;

  // Parcourir les champs d'erreur et trouver le premier onglet correspondant
  for (const field of errorFields) {
    const tab = FIELD_TO_TAB_MAP[field];
    if (tab) {
      return tab;
    }
  }

  return null;
};

interface UseVolontaireFormParams {
  id?: string;
  isEditMode: boolean;
  navigate: NavigateFunction;
}

interface FormData {
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
  evaluation: number;
  evaluationYeux: number;
  evaluationLevres: number;
  evaluationTeint: number;
  evaluationCynetique: number;

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

  // Champs supplémentaires
  cheveuxAbimes?: string;
  cheveuxPlats?: string;
  cheveuxTernes?: string;
  onglesMous?: string;
  onglesStries?: string;
  pellicules?: string;
  demangeaisonsDuCuirChevelu?: string;
  pointesFourchues?: string;
  calvitie?: string;
  cils?: string;
  lesionsInflammatoires?: string;
  lesionsRetentionnelles?: string;
  hauteurSiege?: string;

  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

interface InfoBankData {
  iban: string;
  bic: string;
}

interface UseVolontaireFormReturn {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: FormData;
  errors: FormErrors;
  isLoading: boolean;
  isSaving: boolean;
  formError: string | null;
  formSuccess: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useVolontaireForm = ({ id, isEditMode, navigate }: UseVolontaireFormParams): UseVolontaireFormReturn => {
  const [activeTab, setActiveTab] = useState<string>('infos-personnelles');
  const [formData, setFormData] = useState<FormData>(() => ({ ...INITIAL_FORM_STATE }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
  }, []);

  // Effet pour mettre le focus sur le premier champ en erreur
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Attendre que le DOM soit mis à jour avec le nouvel onglet actif
      setTimeout(() => {
        // Trouver le premier champ en erreur
        const firstErrorField = Object.keys(errors)[0];

        // Essayer de trouver l'élément dans le DOM par son nom
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;

        if (element) {
          // Scroller vers l'élément
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Mettre le focus sur l'élément
          element.focus();
        }
      }, 300); // Délai pour laisser le temps au changement d'onglet
    }
  }, [errors, activeTab]);

  // Chargement des données du volontaire si en mode édition
  useEffect(() => {
    const fetchVolontaire = async () => {
      if (!isEditMode) return;

      try {
        setIsLoading(true);

        // Charger d'abord les détails qui contiennent toutes les informations
        let detailsData: any = {};
        try {
          const detailsResponse = await volontaireService.getDetails(id!);
          const responseData = detailsResponse.data;
          // Gérer le wrapper ApiResponse { success, message, data: {...} }
          detailsData = (responseData?.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data))
            ? responseData.data
            : responseData || {};
        } catch (detailsError) {
          console.warn(
            "Erreur lors du chargement des détails du volontaire:",
            detailsError
          );
        }

        // Charger les informations bancaires avec le service dédié
        let infoBankData: InfoBankData = { iban: '', bic: '' };
        try {
          const infoBankResponse = await infoBancaireService.getByVolontaireId(parseInt(id!, 10));
          if (infoBankResponse.data && infoBankResponse.data.length > 0) {
            // Prendre la première information bancaire
            const bankInfo = infoBankResponse.data[0];
            infoBankData = {
              iban: bankInfo.iban || '',
              bic: bankInfo.bic || ''
            };
          }
        } catch (infoBankError) {
          console.warn("Erreur lors du chargement de l'InfoBank du volontaire:", infoBankError);
        }

        // À partir des données détaillées, préremplir le formulaire
        const formattedData: FormData = {
          ...INITIAL_FORM_STATE,
          titre: detailsData.titreVol || "",
          nom: detailsData.nomVol || "",
          prenom: detailsData.prenomVol || "",
          email: detailsData.emailVol || "",
          telephone: detailsData.telPortableVol || "",
          telephoneDomicile: detailsData.telDomicileVol || "",
          sexe: matchOption(detailsData.sexe, SELECT_OPTIONS.sexe),
          dateNaissance: detailsData.dateNaissance
            ? toISODateString(detailsData.dateNaissance)
            : "",

          // Adresse
          adresse: detailsData.adresseVol || "",
          codePostal: detailsData.cpVol || "",
          ville: detailsData.villeVol || "",
          pays: detailsData.pays || "France",

          // Caractéristiques physiques
          taille: detailsData.taille || "",
          poids: detailsData.poids || "",
          phototype: (() => {
            const raw = detailsData.phototype;
            const normalized = normalizePhototype(raw);
            console.log('[DEBUG Phototype] raw:', raw, '→ normalized:', normalized);
            return matchOption(normalized, SELECT_OPTIONS.phototype);
          })(),
          ethnie: matchOption(detailsData.ethnie, SELECT_OPTIONS.ethnie),
          sousEthnie: detailsData.sousEthnie || "",
          yeux: detailsData.yeux || "",
          pilosite: detailsData.pilosite || "",
          originePere: detailsData.originePere || "",
          origineMere: detailsData.origineMere || "",

          // Peau
          typePeauVisage: matchOption(detailsData.typePeauVisage, SELECT_OPTIONS.typePeauVisage),
          carnation: matchOption(detailsData.carnation, SELECT_OPTIONS.carnation),
          sensibiliteCutanee: matchOption(detailsData.sensibiliteCutanee, SELECT_OPTIONS.sensibiliteCutanee),
          teintInhomogene: detailsData.teintInhomogene || "Non",
          teintTerne: detailsData.teintTerne || "Non",
          poresVisibles: detailsData.poresVisibles || "Non",
          expositionSolaire: matchOption(detailsData.expositionSolaire, SELECT_OPTIONS.expositionSolaire),
          bronzage: matchOption(detailsData.bronzage, SELECT_OPTIONS.bronzage),
          coupsDeSoleil: matchOption(detailsData.coupsDeSoleil, SELECT_OPTIONS.coupsDeSoleil),
          celluliteBras: detailsData.celluliteBras || "Non",
          celluliteFessesHanches: detailsData.celluliteFessesHanches || "Non",
          celluliteJambes: detailsData.celluliteJambes || "Non",
          celluliteVentreTaille: detailsData.celluliteVentreTaille || "Non",

          // Cheveux et ongles
          couleurCheveux: matchOption(detailsData.couleurCheveux, SELECT_OPTIONS.couleurCheveux),
          longueurCheveux: matchOption(detailsData.longueurCheveux, SELECT_OPTIONS.longueurCheveux),
          natureCheveux: matchOption(detailsData.natureCheveux, SELECT_OPTIONS.natureCheveux),
          epaisseurCheveux: matchOption(detailsData.epaisseurCheveux, SELECT_OPTIONS.epaisseurCheveux),
          natureCuirChevelu: matchOption(detailsData.natureCuirChevelu, SELECT_OPTIONS.natureCuirChevelu),
          cuirCheveluSensible: detailsData.cuirCheveluSensible || "Non",
          chuteDeCheveux: detailsData.chuteDeCheveux || "Non",
          cheveuxCassants: detailsData.cheveuxCassants || "Non",
          onglesCassants: detailsData.onglesCassants || "Non",
          onglesDedoubles: detailsData.onglesDedoubles || "Non",

          // Problèmes spécifiques
          acne: detailsData.acne || "Non",
          couperoseRosacee: detailsData.couperoseRosacee || "Non",
          dermiteSeborrheique: detailsData.dermiteSeborrheique || "Non",
          eczema: detailsData.eczema || "Non",
          psoriasis: detailsData.psoriasis || "Non",

          // Informations médicales
          traitement: detailsData.traitement || "",
          anamnese: detailsData.anamnese || "",
          contraception: detailsData.contraception || "",
          menopause: detailsData.menopause || "Non",
          allergiesCommentaires: detailsData.allergiesCommentaires || "",
          santeCompatible: detailsData.santeCompatible || "Oui",

          // Notes
          notes: detailsData.commentairesVol || "",
          evaluation: detailsData.notes || 0,
          evaluationYeux: detailsData.notesYeux || 0,
          evaluationLevres: detailsData.notesLevres || 0,
          evaluationTeint: detailsData.notesTeint || 0,
          evaluationCynetique: detailsData.notesCynetique || 0,
          // Caractéristiques supplémentaires
          cicatrices: detailsData.cicatrices || "Non",
          tatouages: detailsData.tatouages || "Non",
          piercings: detailsData.piercings || "Non",

          // Vergetures
          vergeturesJambes: detailsData.vergeturesJambes || "Non",
          vergeturesFessesHanches: detailsData.vergeturesFessesHanches || "Non",
          vergeturesVentreTaille: detailsData.vergeturesVentreTaille || "Non",
          vergeturesPoitrineDecollete:
            detailsData.vergeturesPoitrineDecollete || "Non",

          // Sécheresse de la peau
          secheresseLevres: detailsData.secheresseLevres || "Non",
          secheresseCou: detailsData.secheresseCou || "Non",
          secheressePoitrineDecollete:
            detailsData.secheressePoitrineDecollete || "Non",
          secheresseVentreTaille: detailsData.secheresseVentreTaille || "Non",
          secheresseFessesHanches: detailsData.secheresseFessesHanches || "Non",
          secheresseBras: detailsData.secheresseBras || "Non",
          secheresseMains: detailsData.secheresseMains || "Non",
          secheresseJambes: detailsData.secheresseJambes || "Non",
          secheressePieds: detailsData.secheressePieds || "Non",

          // Taches pigmentaires
          tachesPigmentairesVisage:
            detailsData.tachesPigmentairesVisage || "Non",
          tachesPigmentairesCou: detailsData.tachesPigmentairesCou || "Non",
          tachesPigmentairesDecollete:
            detailsData.tachesPigmentairesDecollete || "Non",
          tachesPigmentairesMains: detailsData.tachesPigmentairesMains || "Non",

          // Perte de fermeté
          perteDeFermeteVisage: detailsData.perteDeFermeteVisage || "Non",
          perteDeFermeteCou: detailsData.perteDeFermeteCou || "Non",
          perteDeFermeteDecollete: detailsData.perteDeFermeteDecollete || "Non",
          perteDeFermeteAvantBras: detailsData.perteDeFermeteAvantBras || "Non",

          // Cils
          epaisseurCils: matchOption(detailsData.epaisseurCils, SELECT_OPTIONS.epaisseurCils),
          longueurCils: matchOption(detailsData.longueurCils, SELECT_OPTIONS.longueurCils),
          courbureCils: matchOption(detailsData.courbureCils, SELECT_OPTIONS.courbureCils),
          cilsAbimes: detailsData.cilsAbimes || "Non",
          cilsBroussailleux: detailsData.cilsBroussailleux || "Non",
          chuteDeCils: detailsData.chuteDeCils || "Non",

          // Problèmes médicaux supplémentaires
          angiome: detailsData.angiome || "Non",
          pityriasis: detailsData.pityriasis || "Non",
          vitiligo: detailsData.vitiligo || "Non",
          melanome: detailsData.melanome || "Non",
          zona: detailsData.zona || "Non",
          herpes: detailsData.herpes || "Non",
          pelade: detailsData.pelade || "Non",
          reactionAllergique: detailsData.reactionAllergique || "Non",
          desensibilisation: detailsData.desensibilisation || "Non",
          terrainAtopique: detailsData.terrainAtopique || "Non",

          // Valeurs mesurées
          ihBrasDroit: detailsData.ihBrasDroit || "",
          ihBrasGauche: detailsData.ihBrasGauche || "",

          // Scores
          scorePod: detailsData.scorePod || "",
          scorePog: detailsData.scorePog || "",
          scoreFront: detailsData.scoreFront || "",
          scoreLion: detailsData.scoreLion || "",
          scorePpd: detailsData.scorePpd || "",
          scorePpg: detailsData.scorePpg || "",
          scoreDod: detailsData.scoreDod || "",
          scoreDog: detailsData.scoreDog || "",
          scoreSngd: detailsData.scoreSngd || "",
          scoreSngg: detailsData.scoreSngg || "",
          scoreLevsup: detailsData.scoreLevsup || "",
          scoreComlevd: detailsData.scoreComlevd || "",
          scoreComlevg: detailsData.scoreComlevg || "",
          scorePtose: detailsData.scorePtose || "",
          ita: detailsData.ita || "",

          // Autres attributs manquants
          levres: matchOption(detailsData.levres, SELECT_OPTIONS.levres),
          bouffeeChaleurMenaupose: detailsData.bouffeeChaleurMenaupose || "Non",
          cernesVasculaires: detailsData.cernesVasculaires || "Non",
          cernesPigmentaires: detailsData.cernesPigmentaires || "Non",
          poches: detailsData.poches || "Non",
          nbCigarettesJour: detailsData.nbCigarettesJour || "",
          caracteristiqueSourcils: matchOption(detailsData.caracteristiqueSourcils, SELECT_OPTIONS.caracteristiqueSourcils),
          mapyeux: detailsData.mapyeux || "",
          maplevres: detailsData.maplevres || "",
          mapsourcils: detailsData.mapsourcils || "",
          ths: detailsData.ths || "Non",

          // Informations Bancaires
          iban: infoBankData.iban || "",
          bic: infoBankData.bic || "",
        };

        console.log("Données formatées pour le formulaire:", formattedData);

        // Mise à jour du formulaire
        setFormData(formattedData);
      } catch (error) {
        // Gestion des erreurs Axios
        const errorMessage =
          (error as any).response?.data?.message ||
          "Impossible de charger les données du volontaire";
        console.error(
          "Erreur lors du chargement des données du volontaire:",
          error
        );
        setFormError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolontaire();
  }, [id, isEditMode]);

  const validateBankInfo = (): FormErrors => {
    const bankErrors: FormErrors = {};

    // Validation IBAN si fourni
    if (formData.iban && formData.iban.trim()) {
      if (!infoBancaireService.validation.validateIban(formData.iban)) {
        bankErrors.iban = 'Format IBAN invalide (format français attendu: FR + 25 caractères)';
      }
    }

    // Validation BIC si fourni
    if (formData.bic && formData.bic.trim()) {
      if (!infoBancaireService.validation.validateBic(formData.bic)) {
        bankErrors.bic = 'Format BIC invalide (8 ou 11 caractères alphanumériques)';
      }
    }

    return bankErrors;
  };


  // Gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Pour les checkbox, utilisez la valeur "Oui" ou "Non"
    const newValue = type === "checkbox" ? (checked ? "Oui" : "Non") : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Effacer l'erreur lorsque l'utilisateur modifie un champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation du formulaire
  // Modifier la fonction validateForm pour inclure la validation bancaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation des champs obligatoires existants
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.sexe) {
      newErrors.sexe = "Le sexe est obligatoire";
    }

    if (!formData.typePeauVisage) {
      newErrors.typePeauVisage = "Le type de peau est obligatoire";
    }

    // Code postal français (5 chiffres)
    if (formData.codePostal && !/^\d{5}$/.test(formData.codePostal)) {
      newErrors.codePostal = "Le code postal doit contenir 5 chiffres";
    }

    // Validation des informations bancaires
    const bankErrors = validateBankInfo();
    Object.assign(newErrors, bankErrors);

    setErrors(newErrors);

    // Si des erreurs existent, naviguer vers le premier onglet contenant une erreur
    if (Object.keys(newErrors).length > 0) {
      const firstTabWithError = findFirstTabWithError(newErrors);
      if (firstTabWithError) {
        setActiveTab(firstTabWithError);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Ajouter une fonction spécifique pour sauvegarder les informations bancaires
  const saveBankInfo = async (volontaireId: string | number) => {
    // Ne sauvegarder que si IBAN ou BIC sont fournis
    if (!formData.iban?.trim() && !formData.bic?.trim()) {
      return; // Pas d'informations bancaires à sauvegarder
    }

    const numericVolontaireId = typeof volontaireId === 'string' ? parseInt(volontaireId, 10) : volontaireId;
    const bankData = {
      iban: infoBancaireService.validation.cleanIban(formData.iban),
      bic: infoBancaireService.validation.cleanBic(formData.bic),
      idVol: numericVolontaireId
    };

    try {
      await infoBancaireService.saveForVolontaire(numericVolontaireId, bankData);
      console.log("Informations bancaires sauvegardées avec succès");
    } catch (error) {
      console.warn("Erreur lors de la sauvegarde des informations bancaires:", error);
      // Ne pas faire échouer toute la sauvegarde pour les infos bancaires
    }
  };

  // Soumission du formulaire
  // Modification de la fonction handleSubmit pour s'assurer que tous les champs obligatoires ont des valeurs

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      setFormSuccess(null);

      // Préparation des données pour l'API
      console.log("Données du formulaire à envoyer:", formData);
      console.log("🌟 Évaluations dans formData:", {
        evaluation: formData.evaluation,
        evaluationYeux: formData.evaluationYeux,
        evaluationLevres: formData.evaluationLevres,
        evaluationTeint: formData.evaluationTeint,
        evaluationCynetique: formData.evaluationCynetique
      });

      // Fonction helper améliorée pour s'assurer qu'aucune valeur n'est null
      const defaultIfNull = (value: any, defaultValue: any): any => {
        // Si la valeur est null, undefined ou une chaîne vide, utiliser la valeur par défaut
        if (value === null || value === undefined || value === "") {
          return defaultValue;
        }
        return value;
      };

      // Combiner toutes les données en un seul objet avec des valeurs par défaut pour éviter les nulls
      const volontaireCompleteData = {
        // Données de base du volontaire
        titreVol: defaultIfNull(formData.titre, ""),
        nomVol: defaultIfNull(formData.nom, ""),
        prenomVol: defaultIfNull(formData.prenom, ""),
        emailVol: defaultIfNull(formData.email, ""),
        telPortableVol: defaultIfNull(formData.telephone, ""),
        telDomicileVol: defaultIfNull(formData.telephoneDomicile, ""),
        sexe: defaultIfNull(formData.sexe, ""),
        dateNaissance: defaultIfNull(formData.dateNaissance, ""),
        typePeauVisage: defaultIfNull(formData.typePeauVisage, ""),
        phototype: defaultIfNull(formData.phototype, ""),
        ethnie: defaultIfNull(formData.ethnie, ""),
        santeCompatible: defaultIfNull(formData.santeCompatible, "Oui"),

        // Adresse
        adresseVol: defaultIfNull(formData.adresse, ""),
        cpVol: defaultIfNull(formData.codePostal, ""),
        villeVol: defaultIfNull(formData.ville, ""),
        pays: defaultIfNull(formData.pays, "France"),

        // Caractéristiques physiques
        taille: formData.taille ? parseFloat(formData.taille) : 0,
        poids: formData.poids ? parseFloat(formData.poids) : 0,
        sousEthnie: defaultIfNull(formData.sousEthnie, ""),
        yeux: defaultIfNull(formData.yeux, ""),
        pilosite: defaultIfNull(formData.pilosite, ""),
        originePere: defaultIfNull(formData.originePere, ""),
        origineMere: defaultIfNull(formData.origineMere, ""),

        // Peau
        carnation: defaultIfNull(formData.carnation, ""),
        sensibiliteCutanee: defaultIfNull(formData.sensibiliteCutanee, ""),
        teintInhomogene: defaultIfNull(formData.teintInhomogene, "Non"),
        teintTerne: defaultIfNull(formData.teintTerne, "Non"),
        poresVisibles: defaultIfNull(formData.poresVisibles, "Non"),
        expositionSolaire: defaultIfNull(formData.expositionSolaire, ""),
        bronzage: defaultIfNull(formData.bronzage, ""),
        coupsDeSoleil: defaultIfNull(formData.coupsDeSoleil, ""),
        celluliteBras: defaultIfNull(formData.celluliteBras, "Non"),
        celluliteFessesHanches: defaultIfNull(formData.celluliteFessesHanches, "Non"),
        celluliteJambes: defaultIfNull(formData.celluliteJambes, "Non"),
        celluliteVentreTaille: defaultIfNull(formData.celluliteVentreTaille, "Non"),

        // Cheveux et ongles
        couleurCheveux: defaultIfNull(formData.couleurCheveux, ""),
        longueurCheveux: defaultIfNull(formData.longueurCheveux, ""),
        natureCheveux: defaultIfNull(formData.natureCheveux, ""),
        epaisseurCheveux: defaultIfNull(formData.epaisseurCheveux, ""),
        natureCuirChevelu: defaultIfNull(formData.natureCuirChevelu, ""),
        cuirCheveluSensible: defaultIfNull(formData.cuirCheveluSensible, "Non"),
        chuteDeCheveux: defaultIfNull(formData.chuteDeCheveux, "Non"),
        cheveuxCassants: defaultIfNull(formData.cheveuxCassants, "Non"),
        onglesCassants: defaultIfNull(formData.onglesCassants, "Non"),
        onglesDedoubles: defaultIfNull(formData.onglesDedoubles, "Non"),

        // CHAMPS OBLIGATOIRES MANQUANTS
        // Ces champs doivent avoir des valeurs par défaut non-null
        cheveuxAbimes: defaultIfNull(formData.cheveuxAbimes, "Non"),
        cheveuxPlats: defaultIfNull(formData.cheveuxPlats, "Non"),
        cheveuxTernes: defaultIfNull(formData.cheveuxTernes, "Non"),
        onglesMous: defaultIfNull(formData.onglesMous, "Non"),
        onglesStries: defaultIfNull(formData.onglesStries, "Non"),
        pellicules: defaultIfNull(formData.pellicules, "Non"),
        demangeaisonsDuCuirChevelu: defaultIfNull(formData.demangeaisonsDuCuirChevelu, "Non"),
        pointesFourchues: defaultIfNull(formData.pointesFourchues, "Non"),
        calvitie: defaultIfNull(formData.calvitie, "Non"),
        caracteristiqueSourcils: defaultIfNull(formData.caracteristiqueSourcils, "Non spécifié"),
        cils: defaultIfNull(formData.cils, "Non spécifié"),
        mapyeux: defaultIfNull(formData.mapyeux, "Non spécifié"),
        maplevres: defaultIfNull(formData.maplevres, "Non spécifié"),
        mapsourcils: defaultIfNull(formData.mapsourcils, "Non spécifié"),

        // Problèmes spécifiques
        acne: defaultIfNull(formData.acne, "Non"),
        couperoseRosacee: defaultIfNull(formData.couperoseRosacee, "Non"),
        dermiteSeborrheique: defaultIfNull(formData.dermiteSeborrheique, "Non"),
        eczema: defaultIfNull(formData.eczema, "Non"),
        psoriasis: defaultIfNull(formData.psoriasis, "Non"),
        lesionsInflammatoires: defaultIfNull(formData.lesionsInflammatoires, "Non"),
        lesionsRetentionnelles: defaultIfNull(formData.lesionsRetentionnelles, "Non"),

        // Informations médicales
        traitement: defaultIfNull(formData.traitement, ""),
        anamnese: defaultIfNull(formData.anamnese, ""),
        contraception: defaultIfNull(formData.contraception, ""),
        menopause: defaultIfNull(formData.menopause, "Non"),
        allergiesCommentaires: defaultIfNull(formData.allergiesCommentaires, ""),

        // Notes
        commentairesVol: defaultIfNull(formData.notes, ""),

        //Evaluations (integers 0-5) - camelCase pour le JSON Java
        notes: Number(formData.evaluation) || 0,
        notesYeux: Number(formData.evaluationYeux) || 0,
        notesLevres: Number(formData.evaluationLevres) || 0,
        notesTeint: Number(formData.evaluationTeint) || 0,
        notesCynetique: Number(formData.evaluationCynetique) || 0,

        //Caractéristiques supplémentaires
        cicatrices: defaultIfNull(formData.cicatrices, "Non"),
        tatouages: defaultIfNull(formData.tatouages, "Non"),
        piercings: defaultIfNull(formData.piercings, "Non"),

        // Vergetures
        vergeturesJambes: defaultIfNull(formData.vergeturesJambes, "Non"),
        vergeturesFessesHanches: defaultIfNull(formData.vergeturesFessesHanches, "Non"),
        vergeturesVentreTaille: defaultIfNull(formData.vergeturesVentreTaille, "Non"),
        vergeturesPoitrineDecollete: defaultIfNull(formData.vergeturesPoitrineDecollete, "Non"),

        // Sécheresse de la peau
        secheresseLevres: defaultIfNull(formData.secheresseLevres, "Non"),
        secheresseCou: defaultIfNull(formData.secheresseCou, "Non"),
        secheressePoitrineDecollete: defaultIfNull(formData.secheressePoitrineDecollete, "Non"),
        secheresseVentreTaille: defaultIfNull(formData.secheresseVentreTaille, "Non"),
        secheresseFessesHanches: defaultIfNull(formData.secheresseFessesHanches, "Non"),
        secheresseBras: defaultIfNull(formData.secheresseBras, "Non"),
        secheresseMains: defaultIfNull(formData.secheresseMains, "Non"),
        secheresseJambes: defaultIfNull(formData.secheresseJambes, "Non"),
        secheressePieds: defaultIfNull(formData.secheressePieds, "Non"),

        //Taches pigmentaires
        tachesPigmentairesVisage: defaultIfNull(formData.tachesPigmentairesVisage, "Non"),
        tachesPigmentairesCou: defaultIfNull(formData.tachesPigmentairesCou, "Non"),
        tachesPigmentairesDecollete: defaultIfNull(formData.tachesPigmentairesDecollete, "Non"),
        tachesPigmentairesMains: defaultIfNull(formData.tachesPigmentairesMains, "Non"),

        // Perte de fermeté
        perteDeFermeteVisage: defaultIfNull(formData.perteDeFermeteVisage, "Non"),
        perteDeFermeteCou: defaultIfNull(formData.perteDeFermeteCou, "Non"),
        perteDeFermeteDecollete: defaultIfNull(formData.perteDeFermeteDecollete, "Non"),
        perteDeFermeteAvantBras: defaultIfNull(formData.perteDeFermeteAvantBras, "Non"),

        // Cils
        epaisseurCils: defaultIfNull(formData.epaisseurCils, ""),
        longueurCils: defaultIfNull(formData.longueurCils, ""),
        courbureCils: defaultIfNull(formData.courbureCils, ""),
        cilsAbimes: defaultIfNull(formData.cilsAbimes, "Non"),
        cilsBroussailleux: defaultIfNull(formData.cilsBroussailleux, "Non"),
        chuteDeCils: defaultIfNull(formData.chuteDeCils, "Non"),

        //Problèmes médicaux supplémentaires
        angiome: defaultIfNull(formData.angiome, "Non"),
        pityriasis: defaultIfNull(formData.pityriasis, "Non"),
        vitiligo: defaultIfNull(formData.vitiligo, "Non"),
        melanome: defaultIfNull(formData.melanome, "Non"),
        zona: defaultIfNull(formData.zona, "Non"),
        herpes: defaultIfNull(formData.herpes, "Non"),
        pelade: defaultIfNull(formData.pelade, "Non"),
        reactionAllergique: defaultIfNull(formData.reactionAllergique, "Non"),
        desensibilisation: defaultIfNull(formData.desensibilisation, "Non"),
        terrainAtopique: defaultIfNull(formData.terrainAtopique, "Non"),

        // Valeurs mesurées
        ihBrasDroit: formData.ihBrasDroit ? parseFloat(formData.ihBrasDroit) : 0,
        ihBrasGauche: formData.ihBrasGauche ? parseFloat(formData.ihBrasGauche) : 0,

        // Scores
        scoreComlevd: formData.scoreComlevd ? parseFloat(formData.scoreComlevd) : 0,
        scoreComlevg: formData.scoreComlevg ? parseFloat(formData.scoreComlevg) : 0,
        scoreDod: formData.scoreDod ? parseFloat(formData.scoreDod) : 0,
        scoreDog: formData.scoreDog ? parseFloat(formData.scoreDog) : 0,
        scoreFront: formData.scoreFront ? parseFloat(formData.scoreFront) : 0,
        scoreLevsup: formData.scoreLevsup ? parseFloat(formData.scoreLevsup) : 0,
        scoreLion: formData.scoreLion ? parseFloat(formData.scoreLion) : 0,
        scorePod: formData.scorePod ? parseFloat(formData.scorePod) : 0,
        scorePog: formData.scorePog ? parseFloat(formData.scorePog) : 0,
        scorePpd: formData.scorePpd ? parseFloat(formData.scorePpd) : 0,
        scorePpg: formData.scorePpg ? parseFloat(formData.scorePpg) : 0,
        scorePtose: formData.scorePtose ? parseFloat(formData.scorePtose) : 0,
        scoreSngd: formData.scoreSngd ? parseFloat(formData.scoreSngd) : 0,
        scoreSngg: formData.scoreSngg ? parseFloat(formData.scoreSngg) : 0,
        ita: formData.ita ? parseFloat(formData.ita) : 0,

        //Autres attributs
        levres: defaultIfNull(formData.levres, ""),
        bouffeeChaleurMenaupose: defaultIfNull(formData.bouffeeChaleurMenaupose, "Non"),
        cernesVasculaires: defaultIfNull(formData.cernesVasculaires, "Non"),
        cernesPigmentaires: defaultIfNull(formData.cernesPigmentaires, "Non"),
        poches: defaultIfNull(formData.poches, "Non"),
        nbCigarettesJour: defaultIfNull(formData.nbCigarettesJour, ""),
        ths: defaultIfNull(formData.ths, "Non"),

        // Champs supplémentaires identifiés dans la requête SQL
        archive: false, // Valeur par défaut pour un nouveau volontaire
        hauteurSiege: defaultIfNull(formData.hauteurSiege, ""),
        dateI: new Date().toISOString().split('T')[0], // Date d'inscription/création, aujourd'hui par défaut
      };

      console.log("Données complètes préparées pour l'API:", volontaireCompleteData);
      console.log("📊 Évaluations envoyées:", {
        notes: volontaireCompleteData.notes,
        notesYeux: volontaireCompleteData.notesYeux,
        notesLevres: volontaireCompleteData.notesLevres,
        notesTeint: volontaireCompleteData.notesTeint,
        notesCynetique: volontaireCompleteData.notesCynetique
      });

      let volontaireId: string | number;

      // Création ou mise à jour du volontaire
      if (isEditMode) {
        const updateResponse = await volontaireService.updateDetails(id!, volontaireCompleteData);
        console.log("✅ Réponse backend après update:", updateResponse);
        volontaireId = id!; //  Assigner l'ID existant
        setFormSuccess("Volontaire mis à jour avec succès");
      } else {
        // Création d'un nouveau volontaire
        const response = await volontaireService.create(volontaireCompleteData);

        //  Extraire et assigner correctement l'ID
        volontaireId = response.data.id || response.data.idVol || response.data.volontaireId;

        //  Vérifier que l'ID a bien été récupéré
        if (!volontaireId) {
          throw new Error("Impossible de récupérer l'ID du volontaire créé");
        }

        setFormSuccess("Volontaire créé avec succès");
      }

      //  Sauvegarder les informations bancaires avec l'ID correct
      await saveBankInfo(volontaireId);

      //  Une seule redirection, après un délai
      if (!isEditMode) {
        redirectTimeoutRef.current = setTimeout(() => {
          navigate(`/volontaires/${volontaireId}`);
        }, 1500);
      }

    } catch (error) {
      // Gestion des erreurs Axios
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).message ||
        "Une erreur est survenue lors de l'enregistrement du volontaire";
      console.error("Erreur lors de l'enregistrement du volontaire:", error);
      setFormError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    formData,
    errors,
    isLoading,
    isSaving,
    formError,
    formSuccess,
    handleChange,
    handleSubmit,
  };
};
