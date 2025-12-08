import { MAKEUP_FIELD_MAPPING, EVALUATION_FIELDS } from './constants';

export interface DemographicsFilters {
  ageMin: number;
  ageMax: number;
  phototypes: string[];
  ethnies: string[];
  sexe: string;
}

export interface MakeupFilters {
  visage: string[];
  yeux: string[];
  levres: string[];
}

export interface EvaluationRange {
  min: number | null;
  max: number | null;
}

export interface EvaluationFilters {
  globale: EvaluationRange;
  yeux: EvaluationRange;
  levres: EvaluationRange;
  teint: EvaluationRange;
  cynetique: EvaluationRange;
}

export interface Filters {
  demographics: DemographicsFilters;
  makeup: MakeupFilters;
  evaluations: EvaluationFilters;
}

export const createInitialFilters = (): Filters => ({
  demographics: {
    ageMin: 18,
    ageMax: 65,
    phototypes: [],
    ethnies: [],
    sexe: ''
  },
  makeup: {
    visage: [],
    yeux: [],
    levres: []
  },
  evaluations: {
    globale: { min: null, max: null },
    yeux: { min: null, max: null },
    levres: { min: null, max: null },
    teint: { min: null, max: null },
    cynetique: { min: null, max: null }
  }
});

export const removeDiacritics = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const normaliserTexte = (value: any): string => removeDiacritics(value).trim().toUpperCase();

export const normaliserPhototype = (value: any): string => {
  if (!value) return '';

  const normalized = normaliserTexte(value);

  // Extract number from "Phototype X" format
  const match = normalized.match(/PHOTOTYPE\s*(\d+)/);
  if (match) {
    return match[1];
  }

  // If it's already just a number, return it
  if (/^\d+$/.test(normalized)) {
    return normalized;
  }

  return normalized;
};

export const normaliserSexe = (value: any): string => {
  const normalized = normaliserTexte(value);
  if (!normalized) {
    return '';
  }
  if (normalized === 'FEMININ' || normalized === 'F') {
    return 'FEMININ';
  }
  if (normalized === 'MASCULIN' || normalized === 'M') {
    return 'MASCULIN';
  }
  return normalized;
};

export const normaliserEthnie = (value: any): string => {
  if (!value) return '';

  const normalized = normaliserTexte(value);

  // Map variations to standard values
  const ethnicityMap: Record<string, string> = {
    'CAUCASIEN': 'CAUCASIEN',
    'CAUCASIENNE': 'CAUCASIEN',
    'AFRICAIN': 'AFRICAIN',
    'AFRICAINE': 'AFRICAIN',
    'ASIATIQUE': 'ASIATIQUE',
    'INDIENNE': 'INDIENNE',
    'INDIEN': 'INDIENNE',
    'ANTILLAISE': 'ANTILLAISE',
    'ANTILLAIS': 'ANTILLAISE'
  };

  return ethnicityMap[normalized] || normalized;
};

export const isAffirmative = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  const normalized = normaliserTexte(value);
  return ['OUI', 'YES', 'TRUE', '1'].includes(normalized);
};

export const parseEvaluation = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const normalized = value.toString().replace(',', '.');
  const note = parseFloat(normalized);
  return Number.isFinite(note) ? note : null;
};

export const calculerAge = (dateNaissance: string | Date): number => {
  if (!dateNaissance) {
    return NaN;
  }
  const today = new Date();
  const birth = new Date(dateNaissance);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

export const calculerScoreMaquillage = (habitudes: any, makeupFilters: MakeupFilters): number => {
  const selections = [
    ...makeupFilters.visage,
    ...makeupFilters.yeux,
    ...makeupFilters.levres
  ];

  if (selections.length === 0 || !habitudes) {
    return 0;
  }

  let matches = 0;

  selections.forEach((label) => {
    const field = MAKEUP_FIELD_MAPPING[label];
    if (field && isAffirmative(habitudes[field])) {
      matches += 1;
    }
  });

  return matches / selections.length;
};

export interface Resultat {
  scoreTotal: number;
  evaluations: Record<string, number | null>;
}

export interface Stats {
  high: number;
  mid: number;
  low: number;
  avgScore: string;
  avgNotes: Record<string, string | null>;
}

export const computeStats = (resultats: Resultat[]): Stats => {
  const emptyNotes = Object.fromEntries(
    EVALUATION_FIELDS.map(({ key }) => [key, null])
  );

  if (!resultats.length) {
    return {
      high: 0,
      mid: 0,
      low: 0,
      avgScore: '0.0',
      avgNotes: emptyNotes
    };
  }

  let high = 0;
  let mid = 0;
  let low = 0;
  let scoreSum = 0;
  const noteSum: Record<string, number> = Object.fromEntries(
    EVALUATION_FIELDS.map(({ key }) => [key, 0])
  );
  const noteCount: Record<string, number> = Object.fromEntries(
    EVALUATION_FIELDS.map(({ key }) => [key, 0])
  );

  resultats.forEach((resultat) => {
    scoreSum += resultat.scoreTotal;

    if (resultat.scoreTotal >= 80) {
      high += 1;
    } else if (resultat.scoreTotal >= 60) {
      mid += 1;
    } else if (resultat.scoreTotal >= 40) {
      low += 1;
    }

    EVALUATION_FIELDS.forEach(({ key }) => {
      const note = resultat.evaluations[key];
      if (typeof note === 'number') {
        noteSum[key] += note;
        noteCount[key] += 1;
      }
    });
  });

  const avgNotes: Record<string, string | null> = Object.fromEntries(
    EVALUATION_FIELDS.map(({ key }) => [
      key,
      noteCount[key] ? (noteSum[key] / noteCount[key]).toFixed(1) : null
    ])
  );

  return {
    high,
    mid,
    low,
    avgScore: (scoreSum / resultats.length).toFixed(1),
    avgNotes
  };
};
