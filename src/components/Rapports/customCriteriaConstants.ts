// Mapping des critères personnalisés disponibles pour le matching
// Les values correspondent exactement aux valeurs stockées en base (attribut value des <option>)

export interface CustomCriteriaOption {
  label: string;
  field: string;
  values: string[];
}

export const CUSTOM_CRITERIA_OPTIONS: CustomCriteriaOption[] = [
  {
    label: 'Couleur des cheveux',
    field: 'couleurCheveux',
    values: ['Blonds', 'Bruns', 'Chatains', 'Noirs', 'Roux', 'Gris', 'Blancs', 'Colorés']
  },
  {
    label: 'Longueur des cheveux',
    field: 'longueurCheveux',
    values: ['Courts', 'Mi-longs', 'Longs', 'Très longs']
  },
  {
    label: 'Nature des cheveux',
    field: 'natureCheveux',
    values: ['Lisses', 'Ondulés', 'Bouclés', 'Crépus', 'Frisés', 'Normaux', 'Secs', 'Gras']
  },
  {
    label: 'Épaisseur des cheveux',
    field: 'epaisseurCheveux',
    values: ['Fins', 'Moyens', 'Épais']
  },
  {
    label: 'Nature cuir chevelu',
    field: 'natureCuirChevelu',
    values: ['Normal', 'Sec', 'Gras', 'Mixte']
  },
  {
    label: 'Couleur des yeux',
    field: 'yeux',
    values: ['Bleus', 'Verts', 'Marrons', 'Noisette', 'Gris', 'Noirs']
  },
  {
    label: 'Carnation',
    field: 'carnation',
    values: ['Très claire', 'Claire', 'Moyenne', 'Mate', 'Foncée', 'Très foncée']
  },
  {
    label: 'Sensibilité cutanée',
    field: 'sensibiliteCutanee',
    values: ['Peau sensible', 'Peau non sensible']
  },
  {
    label: 'Pilosité',
    field: 'pilosite',
    values: ['Faible_pilosite', 'Moyenne_pilosite', 'Forte_pilosite']
  },
  {
    label: 'Exposition solaire',
    field: 'expositionSolaire',
    values: ['Faiblement', 'Moyennement', 'Fortement']
  },
  {
    label: 'Bronzage',
    field: 'bronzage',
    values: ['Progressif', 'Rapide', 'Difficile', 'Inexistant']
  },
  {
    label: 'Coups de soleil',
    field: 'coupsDeSoleil',
    values: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours']
  },
  {
    label: 'Acné',
    field: 'acne',
    values: ['Oui']
  },
  {
    label: 'Couperose / Rosacée',
    field: 'couperoseRosacee',
    values: ['Oui']
  },
  {
    label: 'Dermite séborrhéique',
    field: 'dermiteSeborrheique',
    values: ['Oui']
  },
  {
    label: 'Eczéma',
    field: 'eczema',
    values: ['Oui']
  },
  {
    label: 'Psoriasis',
    field: 'psoriasis',
    values: ['Oui']
  }
];
