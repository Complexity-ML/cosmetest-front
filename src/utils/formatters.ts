// src/utils/formatters.ts

/**
 * Formate le genre du volontaire pour l'affichage
 */
export const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return 'Non spécifié';

  const genderMap: Record<string, string> = {
    'M': 'Homme',
    'F': 'Femme',
    'O': 'Autre',
    'HOMME': 'Homme',
    'FEMME': 'Femme',
    'AUTRE': 'Autre'
  };

  return genderMap[gender.toUpperCase()] || gender;
};

/**
 * Formate un numéro de téléphone français pour l'affichage
 * Ajoute le 0 au début et groupe les chiffres par paires
 * Exemples:
 * "660243431" -> "06 60 24 34 31"
 * "0660243431" -> "06 60 24 34 31"
 * "145678901" -> "01 45 67 89 01"
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Nettoyer le numéro (enlever espaces, points, tirets, etc.)
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  
  // Si le numéro est vide après nettoyage
  if (!cleaned || cleaned.length === 0) return '-';
  
  // Si le numéro ne commence pas par 0, l'ajouter
  const withZero = cleaned.startsWith('0') ? cleaned : '0' + cleaned;
  
  // Formater par groupes de 2 chiffres
  // Format: XX XX XX XX XX (pour 10 chiffres)
  if (withZero.length === 10) {
    return withZero.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }
  
  // Si le numéro n'a pas 10 chiffres, le retourner tel quel avec espaces
  return withZero.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

/**
 * Formate le type de peau pour l'affichage
 */
export const formatSkinType = (skinType: string | null | undefined): string => {
  if (!skinType) return 'Non spécifié';

  const skinTypeMap: Record<string, string> = {
    'NORMALE': 'Normale',
    'SECHE': 'Sèche',
    'GRASSE': 'Grasse',
    'MIXTE': 'Mixte',
    'SENSIBLE': 'Sensible',
    'N': 'Normale',
    'S': 'Sèche',
    'G': 'Grasse',
    'M': 'Mixte',
    'SE': 'Sensible'
  };

  return skinTypeMap[skinType?.toUpperCase()] || skinType;
};

/**
 * Formate une date au format français (JJ/MM/AAAA)
 */
export const formatDateToFrench = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
};

/**
 * Formate un phototype pour l'affichage
 */
export const formatPhototype = (phototype: string | number | null | undefined): string => {
  if (!phototype) return 'Non spécifié';

  const phototypes: Record<string, string> = {
    '1': 'I - Peau très claire, cheveux blonds ou roux, yeux clairs, taches de rousseur',
    '2': 'II - Peau claire, cheveux blonds à châtains, yeux clairs à noisette',
    '3': 'III - Peau claire à mate, cheveux châtains, yeux de toutes couleurs',
    '4': 'IV - Peau mate, cheveux châtains foncés à bruns, yeux foncés',
    '5': 'V - Peau foncée, cheveux foncés, yeux foncés',
    '6': 'VI - Peau noire, cheveux noirs, yeux foncés',
    'I': 'I - Peau très claire, cheveux blonds ou roux, yeux clairs, taches de rousseur',
    'II': 'II - Peau claire, cheveux blonds à châtains, yeux clairs à noisette',
    'III': 'III - Peau claire à mate, cheveux châtains, yeux de toutes couleurs',
    'IV': 'IV - Peau mate, cheveux châtains foncés à bruns, yeux foncés',
    'V': 'V - Peau foncée, cheveux foncés, yeux foncés',
    'VI': 'VI - Peau noire, cheveux noirs, yeux foncés'
  };

  // Si c'est un nombre ou une chaîne numérique
  const photoKey = String(phototype).trim();
  return phototypes[photoKey] || String(phototype);
};

/**
 * Formate une ethnie pour l'affichage
 */
export const formatEthnie = (ethnicity: string | null | undefined): string => {
  if (!ethnicity) return 'Non spécifiée';

  const ethnicityMap: Record<string, string> = {
    'CAUCASIEN': 'Caucasien(ne)',
    'AFRICAIN': 'Africain(e)',
    'ASIATIQUE': 'Asiatique',
    'HISPANIQUE': 'Hispanique',
    'MOYEN_ORIENT': 'Moyen-Orient',
    'AUTRE': 'Autre',
    'INCONNU': 'Non spécifiée'
  };

  return ethnicityMap[ethnicity?.toUpperCase()] || ethnicity;
};

/**
 * Formate le statut d'un rendez-vous
 */
export const formatRdvStatus = (status: string | null | undefined): string => {
  if (!status) return 'Non spécifié';

  const statusMap: Record<string, string> = {
    'CONFIRME': 'Confirmé',
    'EN_ATTENTE': 'En attente',
    'ANNULE': 'Annulé',
    'COMPLETE': 'Complété',
    'ABSENT': 'Absent'
  };

  return statusMap[status?.toUpperCase()] || status;
};

/**
 * Formate le statut d'une étude
 */
export const formatEtudeStatus = (status: string | null | undefined): string => {
  if (!status) return 'Non spécifié';

  const statusMap: Record<string, string> = {
    'EN_COURS': 'En cours',
    'PLANIFIEE': 'Planifiée',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée',
    'EN_PAUSE': 'En pause'
  };

  return statusMap[status?.toUpperCase()] || status;
};

/**
 * Retourne la classe CSS pour un statut de rendez-vous
 */
export const getRdvStatusClass = (status: string | null | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800';

  const statusClassMap: Record<string, string> = {
    'CONFIRME': 'bg-green-100 text-green-800',
    'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
    'ANNULE': 'bg-red-100 text-red-800',
    'COMPLETE': 'bg-blue-100 text-blue-800',
    'ABSENT': 'bg-gray-100 text-gray-800'
  };

  return statusClassMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

export default {
  formatGender,
  formatSkinType,
  formatDateToFrench,
  formatPhototype,
  formatEthnie,
  formatRdvStatus,
  formatEtudeStatus,
  getRdvStatusClass
};
