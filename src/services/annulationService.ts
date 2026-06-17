// ============================================================
// annulationService.ts - Version corrigée pour l'encodage UTF-8
// ============================================================

import api from './api';

interface Annulation {
  id?: number;
  idAnnuler?: number;
  idVol: number;
  idEtude: number;
  idRdv?: number;
  dateAnnulation: string;
  commentaire: string;
  annulePar?: string;
}

interface PaginatedAnnulations {
  content: Annulation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface PaginationOptions {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

/**
 * Nettoie le texte pour éviter les problèmes d'encodage UTF-8
 */
const cleanTextForDatabase = (text: string | null | undefined): string => {
  if (!text) return text || '';

  return text
    // Remplacer les caractères spéciaux par du texte
    .replace(/→/g, ' vers ')
    .replace(/←/g, ' depuis ')
    .replace(/↑/g, ' haut ')
    .replace(/↓/g, ' bas ')
    .replace(/✓/g, ' OK ')
    .replace(/✗/g, ' ERREUR ')
    .replace(/⚠/g, ' ATTENTION ')
    .replace(/🚫/g, ' INTERDIT ')
    .replace(/📝/g, ' NOTE ')
    .replace(/💾/g, ' SAUVEGARDE ')
    .replace(/🗑️/g, ' SUPPRIMER ')
    .replace(/❌/g, ' ANNULE ')
    .replace(/📈/g, ' SURBOOK ')
    .replace(/🤝/g, ' PARRAINAGE ')
    .replace(/❓/g, ' INCONNU ')
    // Nettoyer les emojis et caractères non-ASCII problématiques
    .replace(/[^\x20-\x7E]/g, '')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Service pour gérer les annulations
 * Interactions avec l'API REST des annulations
 */
const annulationService = {

  /**
   * Créer une nouvelle annulation
   */
  create: async (annulationData: Annulation): Promise<Annulation> => {
    try {
      // Nettoyer le commentaire avant envoi
      const cleanedData = {
        ...annulationData,
        commentaire: cleanTextForDatabase(annulationData.commentaire)
      };

      const response = await api.post<Annulation>('/annulations', cleanedData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'annulation:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les annulations
   */
  getAll: async (): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>('/annulations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des annulations:', error);
      throw error;
    }
  },

  /**
   * Récupérer une annulation par son ID
   */
  getById: async (id: number): Promise<Annulation> => {
    try {
      const response = await api.get<Annulation>(`/annulations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annulation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations d'un volontaire
   */
  getByVolontaire: async (idVol: number): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>(`/annulations/volontaire/${idVol}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annulations du volontaire ${idVol}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations d'une étude
   */
  getByEtude: async (idEtude: number): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>(`/annulations/etude/${idEtude}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annulations de l'étude ${idEtude}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations d'un volontaire pour une étude spécifique
   */
  getByVolontaireAndEtude: async (idVol: number, idEtude: number): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>(`/annulations/volontaire/${idVol}/etude/${idEtude}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annulations du volontaire ${idVol} pour l'étude ${idEtude}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations récentes d'un volontaire (triées par date décroissante)
   */
  getRecentByVolontaire: async (idVol: number): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>(`/annulations/volontaire/${idVol}/recent`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annulations récentes du volontaire ${idVol}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations à une date spécifique
   */
  getByDate: async (date: string): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>(`/annulations/date/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annulations du ${date}:`, error);
      throw error;
    }
  },

  /**
   * Rechercher des annulations par mot-clé dans les commentaires
   */
  searchByCommentaire: async (keyword: string): Promise<Annulation[]> => {
    try {
      const response = await api.get<Annulation[]>('/annulations/search', {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la recherche d'annulations avec le mot-clé "${keyword}":`, error);
      throw error;
    }
  },

  /**
   * Récupérer les annulations avec pagination
   */
  getAllPaginated: async (options: PaginationOptions = {}): Promise<PaginatedAnnulations> => {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'dateAnnulation',
        direction = 'DESC'
      } = options;

      const response = await api.get<PaginatedAnnulations>('/annulations/paginated', {
        params: { page, size, sortBy, direction }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des annulations paginées:', error);
      throw error;
    }
  },

  /**
   * Compter le nombre d'annulations par volontaire
   */
  countByVolontaire: async (idVol: number): Promise<number> => {
    try {
      const response = await api.get<number>(`/annulations/count/volontaire/${idVol}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du comptage des annulations du volontaire ${idVol}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour une annulation existante
   */
  update: async (id: number, annulationData: Partial<Annulation>): Promise<Annulation> => {
    try {
      // Nettoyer le commentaire avant envoi
      const cleanedData = {
        ...annulationData,
        commentaire: annulationData.commentaire ? cleanTextForDatabase(annulationData.commentaire) : undefined
      };

      const response = await api.put<Annulation>(`/annulations/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'annulation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une annulation
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/annulations/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annulation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifier si un volontaire a des annulations pour une étude
   */
  hasAnnulationForEtude: async (idVol: number, idEtude: number): Promise<boolean> => {
    try {
      const annulations = await annulationService.getByVolontaireAndEtude(idVol, idEtude);
      return annulations && annulations.length > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification des annulations:`, error);
      return false;
    }
  },

  /**
   * Créer une annulation avec validation et nettoyage automatique
   */
  createWithValidation: async (data: Partial<Annulation>): Promise<Annulation> => {
    // Validation des données requises
    if (!data.idVol || !data.idEtude) {
      throw new Error('ID volontaire et ID étude sont requis');
    }

    // Validation de la date
    if (!data.dateAnnulation) {
      data.dateAnnulation = new Date().toISOString().split('T')[0];
    }

    // Validation et nettoyage du commentaire
    if (!data.commentaire) {
      data.commentaire = 'Annulation sans commentaire';
    } else {
      // Nettoyer le commentaire pour éviter les problèmes d'encodage
      data.commentaire = cleanTextForDatabase(data.commentaire);
    }

    // S'assurer que le commentaire n'est pas vide après nettoyage
    if (!data.commentaire || data.commentaire.trim() === '') {
      data.commentaire = 'Annulation automatique';
    }

    return await annulationService.create(data as Annulation);
  }
};

// Exporter aussi la fonction de nettoyage pour usage externe si besoin
export { cleanTextForDatabase };
export default annulationService;
