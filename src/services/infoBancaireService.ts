import api from './api';
import { InfoBancaire } from '../types/types';

/**
 * Service pour la gestion des informations bancaires
 * Compatible avec InfobancaireController.java
 */
const infoBancaireService = {
  // ==================== MÉTHODES CRUD PRINCIPALES ====================

  /**
   * Récupère toutes les informations bancaires
   * @returns {Promise} Promesse contenant la liste des informations bancaires
   */
  getAll: (): Promise<any> => {
    return api.get('/infobancaires');
  },

  /**
   * Récupère une information bancaire par son identifiant composite
   * @param {string} bic - Le code BIC
   * @param {string} iban - Le numéro IBAN
   * @param {number} idVol - L'identifiant du volontaire
   * @returns {Promise} Promesse contenant l'information bancaire
   */
  getById: (bic: string, iban: string, idVol: number): Promise<any> => {
    return api.get('/infobancaires/id', {
      params: { bic, iban, idVol }
    });
  },

  /**
   * Récupère les informations bancaires d'un volontaire
   * @param {number} idVol - L'identifiant du volontaire
   * @returns {Promise} Promesse contenant la liste des informations bancaires du volontaire
   */
  getByVolontaireId: (idVol: number): Promise<any> => {
    return api.get(`/infobancaires/volontaire/${idVol}`);
  },

  /**
   * Crée une nouvelle information bancaire
   * @param {Object} infoBancaireData - Les données de l'information bancaire
   * @param {string} infoBancaireData.iban - Le numéro IBAN
   * @param {string} infoBancaireData.bic - Le code BIC
   * @param {number} infoBancaireData.idVol - L'identifiant du volontaire
   * @returns {Promise} Promesse contenant l'information bancaire créée
   */
  create: (infoBancaireData: Partial<InfoBancaire>): Promise<any> => {
    // Validation avant envoi
    const validationResult = infoBancaireService.validation.validateInfoBancaire(infoBancaireData);
    if (!validationResult.isValid) {
      return Promise.reject(new Error(`Données invalides: ${Object.values(validationResult.errors).join(', ')}`));
    }

    return api.post('/infobancaires', {
      iban: infoBancaireData.iban?.toUpperCase().replace(/\s/g, ''),
      bic: infoBancaireData.bic?.toUpperCase().replace(/\s/g, ''),
      idVol: infoBancaireData.idVol
    });
  },

  /**
   * Met à jour une information bancaire existante
   * @param {string} bic - Le code BIC actuel
   * @param {string} iban - Le numéro IBAN actuel
   * @param {number} idVol - L'identifiant du volontaire actuel
   * @param {Object} infoBancaireData - Les nouvelles données
   * @returns {Promise} Promesse contenant l'information bancaire mise à jour
   */
  update: (bic: string, iban: string, idVol: number, infoBancaireData: Partial<InfoBancaire>): Promise<any> => {
    // Validation avant envoi
    const validationResult = infoBancaireService.validation.validateInfoBancaire(infoBancaireData);
    if (!validationResult.isValid) {
      return Promise.reject(new Error(`Données invalides: ${Object.values(validationResult.errors).join(', ')}`));
    }

    return api.put('/infobancaires', {
      iban: infoBancaireData.iban?.toUpperCase().replace(/\s/g, ''),
      bic: infoBancaireData.bic?.toUpperCase().replace(/\s/g, ''),
      idVol: infoBancaireData.idVol || idVol
    }, {
      params: { bic, iban, idVol }
    });
  },

  /**
   * Supprime une information bancaire
   * @param {string} bic - Le code BIC
   * @param {string} iban - Le numéro IBAN
   * @param {number} idVol - L'identifiant du volontaire
   * @returns {Promise} Promesse de suppression
   */
  delete: (bic: string, iban: string, idVol: number): Promise<any> => {
    return api.delete('/infobancaires', {
      params: { bic, iban, idVol }
    });
  },

  // ==================== MÉTHODES DE VÉRIFICATION ====================

  /**
   * Vérifie si une information bancaire existe
   * @param {string} bic - Le code BIC
   * @param {string} iban - Le numéro IBAN
   * @param {number} idVol - L'identifiant du volontaire
   * @returns {Promise<boolean>} Promesse contenant un booléen
   */
  exists: async (bic: string, iban: string, idVol: number): Promise<boolean> => {
    try {
      const response = await api.get('/infobancaires/exists', {
        params: { bic, iban, idVol }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'existence:', error);
      return false;
    }
  },

  // ==================== MÉTHODES DE RECHERCHE ====================

  /**
   * Récupère les informations bancaires par IBAN
   * @param {string} iban - Le numéro IBAN
   * @returns {Promise} Promesse contenant la liste des informations bancaires
   */
  getByIban: (iban: string): Promise<any> => {
    const cleanIban = iban?.toUpperCase().replace(/\s/g, '');
    return api.get(`/infobancaires/by-iban/${cleanIban}`);
  },

  /**
   * Récupère les informations bancaires par BIC
   * @param {string} bic - Le code BIC
   * @returns {Promise} Promesse contenant la liste des informations bancaires
   */
  getByBic: (bic: string): Promise<any> => {
    const cleanBic = bic?.toUpperCase().replace(/\s/g, '');
    return api.get(`/infobancaires/by-bic/${cleanBic}`);
  },

  /**
   * Récupère les informations bancaires par BIC et IBAN
   * @param {string} bic - Le code BIC
   * @param {string} iban - Le numéro IBAN
   * @returns {Promise} Promesse contenant la liste des informations bancaires
   */
  getByBicAndIban: (bic: string, iban: string): Promise<any> => {
    const cleanBic = bic?.toUpperCase().replace(/\s/g, '');
    const cleanIban = iban?.toUpperCase().replace(/\s/g, '');
    return api.get('/infobancaires/by-bic-and-iban', {
      params: { bic: cleanBic, iban: cleanIban }
    });
  },

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Crée ou met à jour intelligemment les informations bancaires d'un volontaire
   * @param {number} idVol - L'identifiant du volontaire
   * @param {Object} bankData - Les données bancaires
   * @returns {Promise} Promesse de sauvegarde
   */
  saveForVolontaire: async (idVol: number, bankData: Partial<InfoBancaire>): Promise<any> => {
    try {
      // Vérifier s'il existe déjà des informations
      const existingResponse = await infoBancaireService.getByVolontaireId(idVol);
      
      if (existingResponse.data && existingResponse.data.length > 0) {
        // Mettre à jour l'information existante
        const existing = existingResponse.data[0];
        return await infoBancaireService.update(
          existing.bic,
          existing.iban,
          idVol,
          { ...bankData, idVol }
        );
      } else {
        // Créer une nouvelle information
        return await infoBancaireService.create({ ...bankData, idVol });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Aucune information existante, créer
        return await infoBancaireService.create({ ...bankData, idVol });
      }
      throw error;
    }
  },

  /**
   * Supprime toutes les informations bancaires d'un volontaire
   * @param {number} idVol - L'identifiant du volontaire
   * @returns {Promise} Promesse de suppression
   */
  deleteAllForVolontaire: async (idVol: number): Promise<any> => {
    try {
      const existingResponse = await infoBancaireService.getByVolontaireId(idVol);
      
      if (existingResponse.data && existingResponse.data.length > 0) {
        const deletePromises = existingResponse.data.map((info: InfoBancaire) =>
          infoBancaireService.delete(info.bic, info.iban, idVol)
        );
        return await Promise.all(deletePromises);
      }
      
      return Promise.resolve();
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return Promise.resolve();
      }
      throw error;
    }
  },

  // ==================== MÉTHODES DE VALIDATION ====================

  validation: {
    /**
     * Valide un IBAN français
     * @param {string} iban - L'IBAN à valider
     * @returns {boolean} True si l'IBAN est valide
     */
    validateIban: (iban: string): boolean => {
      if (!iban || typeof iban !== 'string') return false;
      
      // Supprime les espaces et convertit en majuscules
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      
      // IBAN français : FR + 2 chiffres de contrôle + 23 caractères
      const frenchIbanRegex = /^FR[0-9]{2}[A-Z0-9]{23}$/;
      
      return frenchIbanRegex.test(cleanIban);
    },

    /**
     * Valide un BIC/SWIFT
     * @param {string} bic - Le BIC à valider
     * @returns {boolean} True si le BIC est valide
     */
    validateBic: (bic: string): boolean => {
      if (!bic || typeof bic !== 'string') return false;
      
      // Supprime les espaces et convertit en majuscules
      const cleanBic = bic.replace(/\s/g, '').toUpperCase();
      
      // BIC : 8, 10 ou 11 caractères alphanumériques
      // Format: 4 lettres (banque) + 2 lettres (pays) + 2 caractères (ville) + optionnel 2-3 caractères (succursale)
      const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{2,3})?$/;
      
      return bicRegex.test(cleanBic);
    },

    /**
     * Valide un objet d'information bancaire complet
     * @param {Object} infoBancaire - L'objet à valider
     * @returns {Object} Résultat de validation avec erreurs détaillées
     */
    validateInfoBancaire: (infoBancaire: Partial<InfoBancaire> | null | undefined): { isValid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      if (!infoBancaire) {
        return { isValid: false, errors: { general: 'Données manquantes' } };
      }

      // Validation IBAN
      if (!infoBancaire.iban) {
        errors.iban = 'IBAN requis';
      } else if (!infoBancaireService.validation.validateIban(infoBancaire.iban)) {
        errors.iban = 'Format IBAN invalide (format français attendu: FR + 25 caractères)';
      }

      // Validation BIC
      if (!infoBancaire.bic) {
        errors.bic = 'BIC requis';
      } else if (!infoBancaireService.validation.validateBic(infoBancaire.bic)) {
        errors.bic = 'Format BIC invalide (8 ou 11 caractères alphanumériques)';
      }

      // Validation ID volontaire
      if (!infoBancaire.idVol || !Number.isInteger(Number(infoBancaire.idVol))) {
        errors.idVol = 'ID volontaire requis et doit être un nombre';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    /**
     * Formate un IBAN avec des espaces pour l'affichage
     * @param {string} iban - L'IBAN à formater
     * @returns {string} L'IBAN formaté
     */
    formatIban: (iban: string): string => {
      if (!iban || typeof iban !== 'string') return '';
      
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      
      // Ajoute un espace tous les 4 caractères
      return cleanIban.replace(/(.{4})/g, '$1 ').trim();
    },

    /**
     * Nettoie et formate un IBAN pour la saisie
     * @param {string} iban - L'IBAN à nettoyer
     * @returns {string} L'IBAN nettoyé
     */
    cleanIban: (iban: string): string => {
      if (!iban || typeof iban !== 'string') return '';
      return iban.replace(/\s/g, '').toUpperCase();
    },

    /**
     * Nettoie et formate un BIC pour la saisie
     * @param {string} bic - Le BIC à nettoyer
     * @returns {string} Le BIC nettoyé
     */
    cleanBic: (bic: string): string => {
      if (!bic || typeof bic !== 'string') return '';
      return bic.replace(/\s/g, '').toUpperCase();
    }
  },

  // ==================== MÉTHODES D'AIDE POUR L'UI ====================

  /**
   * Retourne les codes de banques françaises les plus courants pour l'autocomplétion
   * @returns {Array} Liste des codes BIC courants
   */
  getCommonFrenchBicCodes: () => {
    return [
      { code: 'BREDFRPPXXX', name: 'Banque Populaire' },
      { code: 'CCBPFRPPXXX', name: 'Crédit Coopératif' },
      { code: 'CEPAFRPP', name: 'Crédit Épargne de France' },
      { code: 'CHATEFR2XXX', name: 'Crédit Agricole' },
      { code: 'CMCIFRPP', name: 'CIC' },
      { code: 'SOGEFRPP', name: 'Société Générale' },
      { code: 'BNPAFRPP', name: 'BNP Paribas' },
      { code: 'BDFEFRPPCCT', name: 'Banque de France' },
      { code: 'CRLYFRPP', name: 'Crédit Lyonnais (LCL)' },
      { code: 'AGRIFRPP', name: 'Crédit Agricole' },
      { code: 'PSSTFRPPPAR', name: 'Banque Postale' },
      { code: 'BOUSFRPPXXX', name: 'Boursorama Bank' },
      { code: 'REVOLT21XXX', name: 'Revolut' }
    ];
  },

  /**
   * Retourne des messages d'aide pour l'utilisateur
   * @returns {Object} Messages d'aide
   */
  getHelpMessages: () => {
    return {
      iban: {
        format: 'Format français : FR76 1234 5678 9012 3456 7890 123',
        help: 'L\'IBAN remplace l\'ancien RIB et permet les virements européens',
        where: 'Vous le trouverez sur votre RIB ou relevé bancaire'
      },
      bic: {
        format: '8 ou 11 caractères : BREDFRPPXXX',
        help: 'Le BIC (Bank Identifier Code) identifie votre banque au niveau international',
        where: 'Il figure également sur votre RIB, parfois appelé code SWIFT'
      }
    };
  }
};

export default infoBancaireService;