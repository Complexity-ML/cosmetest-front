export interface MakeupOptions {
  visage: string[];
  yeux: string[];
  levres: string[];
}

export const MAKEUP_OPTIONS: MakeupOptions = {
  visage: [
    'Fond de teint',
    'Poudre libre',
    'Blush/Fard a joues',
    'Correcteur de teint',
    'Anti-cerne',
    'Base de maquillage',
    'Creme teintee'
  ],
  yeux: [
    'Mascara',
    'Mascara waterproof',
    'Crayons a yeux',
    'Eyeliner',
    'Fard a paupieres',
    'Maquillage des sourcils',
    'Faux cils'
  ],
  levres: [
    'Rouge a levres',
    'Gloss',
    'Crayon a levres'
  ]
};

export const MAKEUP_FIELD_MAPPING: Record<string, string> = {
  'Fond de teint': 'fondDeTeint',
  'Poudre libre': 'poudreLibre',
  'Blush/Fard a joues': 'blushFardAJoues',
  'Correcteur de teint': 'correcteurTeint',
  'Anti-cerne': 'anticerne',
  'Base de maquillage': 'baseMaquillage',
  'Creme teintee': 'cremeTeintee',
  'Mascara': 'mascara',
  'Mascara waterproof': 'mascaraWaterproof',
  'Crayons a yeux': 'crayonsYeux',
  'Eyeliner': 'eyeliner',
  'Fard a paupieres': 'fardAPaupieres',
  'Maquillage des sourcils': 'maquillageDesSourcils',
  'Faux cils': 'fauxCils',
  'Rouge a levres': 'rougeALevres',
  'Gloss': 'gloss',
  'Crayon a levres': 'crayonLevres'
};

export interface EvaluationField {
  key: string;
  label: string;
}

export const EVALUATION_FIELDS: EvaluationField[] = [
  { key: 'globale', label: 'Note globale' },
  { key: 'yeux', label: 'Evaluation yeux' },
  { key: 'levres', label: 'Evaluation levres' },
  { key: 'teint', label: 'Evaluation teint' },
  { key: 'cynetique', label: 'Evaluation cynetique' }
];

export interface EthnieOption {
  value: string;
  label: string;
}

export const ETHNIE_OPTIONS: EthnieOption[] = [
  { value: 'CAUCASIEN', label: 'Caucasien(ne)' },
  { value: 'AFRICAIN', label: 'Africain(e)' },
  { value: 'ASIATIQUE', label: 'Asiatique' },
  { value: 'INDIENNE', label: 'Indien(ne)' },
  { value: 'ANTILLAISE', label: 'Antillais(e)' }
];
