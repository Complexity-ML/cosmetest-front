// initializers.ts - Version améliorée avec TypeScript
import { FORM_SECTIONS } from './formConfig';

// Type definitions
export interface FormData {
  idVol: string | number | null;
  commentaires?: string;
  [key: string]: any;
}

/**
 * Crée un objet FormData avec toutes les options du formulaire initialisées à "non"
 * @param idVol - ID du volontaire (optionnel)
 * @returns Un objet FormData avec toutes les options initialisées à "non"
 */
export const initializeFormDataWithNon = (idVol?: string | number | null): FormData => {
  // Créer l'objet initial avec idVol
  const initialData: FormData = { 
    idVol: idVol || null,
    commentaires: ''
  };
  
  // Parcourir toutes les sections et groupes du formulaire pour initialiser les champs
  FORM_SECTIONS.forEach(section => {
    section.groups.forEach(group => {
      group.items.forEach(item => {
        // S'assurer que toutes les valeurs sont initialisées à "non" de manière explicite
        initialData[item.id] = "non";
      });
    });
  });
  
  return initialData;
};

/**
 * Normalise toutes les valeurs d'un objet FormData
 * Transforme toutes les valeurs en "oui" ou "non" pour une cohérence avec l'API
 * 
 * @param formData - Les données du formulaire à normaliser
 * @returns Le formData avec toutes les valeurs normalisées
 */
export const normalizeFormData = (formData: FormData): FormData => {
  const normalizedData: FormData = { ...formData };
  
  // Parcourir toutes les données et normaliser les valeurs
  Object.keys(normalizedData).forEach(key => {
    // Ne pas toucher à idVol et commentaires
    if (key !== 'idVol' && key !== 'commentaires') {
      if (normalizedData[key] === null || normalizedData[key] === undefined || normalizedData[key] === '') {
        normalizedData[key] = "non";
      } else if (typeof normalizedData[key] === 'string') {
        const value = normalizedData[key].toLowerCase();
        if (value === 'oui' || value === 'yes' || value === 'true' || value === '1') {
          normalizedData[key] = "oui";
        } else {
          normalizedData[key] = "non";
        }
      } else if (typeof normalizedData[key] === 'boolean') {
        normalizedData[key] = normalizedData[key] ? "oui" : "non";
      }
    }
  });
  
  return normalizedData;
};

/**
 * Vérifie si une entrée existe pour un volontaire donné
 * @param formData - Les données du formulaire
 * @returns true si au moins un champ est à "oui", false sinon
 */
export const hasActiveEntries = (formData: FormData): boolean => {
  return Object.entries(formData).some(([key, value]) => {
    return key !== 'idVol' && key !== 'commentaires' && value === 'oui';
  });
};

/**
 * Création de l'objet initial pour les formulaires avec valeurs booléennes
 * Utilisé pour les interfaces où les checkbox sont manipulées comme booléennes
 * @param idVol - ID du volontaire (optionnel)
 * @returns Un objet FormData avec toutes les options initialisées à false
 */
export const initializeAllFieldsBoolean = (idVol?: string | number | null): FormData => {
  const initialData: FormData = { 
    idVol: idVol || null,
    commentaires: ''
  };

  // Parcourir toutes les sections et groupes pour initialiser tous les champs à false
  FORM_SECTIONS.forEach(section => {
    section.groups.forEach(group => {
      group.items.forEach(item => {
        initialData[item.id] = false;
      });
    });
  });

  return initialData;
};

/**
 * Convertit les valeurs "oui"/"non" en booléens pour l'affichage dans le formulaire
 * @param formData - Les données du formulaire à convertir
 * @returns Le formData avec les valeurs converties en booléens
 */
export const convertToBooleanValues = (formData: FormData): FormData => {
  const convertedData: FormData = { ...formData };
  
  Object.keys(convertedData).forEach(key => {
    // Ne pas toucher à idVol et commentaires
    if (key !== 'idVol' && key !== 'commentaires') {
      if (typeof convertedData[key] === 'string') {
        const value = convertedData[key].toLowerCase();
        convertedData[key] = value === 'oui' || value === 'yes' || value === 'true' || value === '1';
      } else if (convertedData[key] === null || convertedData[key] === undefined || convertedData[key] === '') {
        convertedData[key] = false;
      }
    }
  });
  
  return convertedData;
};

/**
 * Convertit les valeurs booléennes en "oui"/"non" pour l'envoi à l'API
 * @param formData - Les données du formulaire à convertir
 * @returns Le formData avec les valeurs converties en "oui"/"non"
 */
export const convertToStringValues = (formData: FormData): FormData => {
  const convertedData: FormData = { ...formData };
  
  Object.keys(convertedData).forEach(key => {
    // Ne pas toucher à idVol et commentaires
    if (key !== 'idVol' && key !== 'commentaires') {
      if (typeof convertedData[key] === 'boolean') {
        convertedData[key] = convertedData[key] ? "oui" : "non";
      } else if (convertedData[key] === null || convertedData[key] === undefined || convertedData[key] === '') {
        convertedData[key] = "non";
      }
    }
  });
  
  return convertedData;
};
