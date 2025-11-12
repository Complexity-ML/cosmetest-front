import api from './api';
import rdvService from './rdvService';
import type { Etude, PaginatedResponse } from '@/types/types';

const ETUDES_ENDPOINT = '/etudes';

interface SearchParams {
  [key: string]: any;
}

interface EtudeWithRdvCount extends Etude {
  rdvCount: number;
}

const etudeService = {
  getById: async (id: number): Promise<Etude> => {
    try {
      const response = await api.get<Etude>(`/etudes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'étude ${id}:`, error);
      throw error;
    }
  },

  getAll: async (params: SearchParams = {}): Promise<Etude[]> => {
    try {
      const response = await api.get<Etude[]>('/etudes', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des études:', error);
      throw error;
    }
  },

  getPaginated: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'dateDebut',
    direction: string = 'DESC'
  ): Promise<PaginatedResponse<Etude>> => {
    try {
      const response = await api.get<PaginatedResponse<Etude>>('/etudes/paginated', {
        params: { page, size, sortBy, direction }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération paginée des études:', error);
      throw error;
    }
  },

  search: async (searchTerm: string): Promise<Etude[]> => {
    try {
      const response = await api.get<Etude[]>('/etudes/search', {
        params: { searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'études:', error);
      throw error;
    }
  },

  create: async (etudeData: Partial<Etude>): Promise<Etude> => {
    try {
      const response = await api.post<Etude>('/etudes', etudeData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'étude:', error);
      throw error;
    }
  },

  update: async (id: number, etudeData: Partial<Etude>): Promise<Etude> => {
    try {
      const response = await api.put<Etude>(`/etudes/${id}`, etudeData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'étude ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/etudes/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'étude ${id}:`, error);
      throw error;
    }
  },

  getByRef: async (ref: string): Promise<Etude> => {
    const response = await api.get<Etude>(`${ETUDES_ENDPOINT}/ref/${ref}`);
    return response.data;
  },

  getByType: async (type: string): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/type/${type}`);
    return response.data;
  },

  getByPaymentStatus: async (paye: number): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/paye/${paye}`);
    return response.data;
  },

  getActive: async (date: string | null = null): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/actives`, {
      params: date ? { date } : {}
    });
    return response.data;
  },

  getUpcoming: async (): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/upcoming`);
    return response.data;
  },

  getCurrent: async (): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/current`);
    return response.data;
  },

  getCompleted: async (): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/completed`);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Etude[]> => {
    const response = await api.get<Etude[]>(`${ETUDES_ENDPOINT}/date-range`, {
      params: { debut: startDate, fin: endDate }
    });
    return response.data;
  },

  checkRefExists: async (ref: string): Promise<boolean> => {
    const response = await api.get<boolean>(`${ETUDES_ENDPOINT}/check-ref/${ref}`);
    return response.data;
  },

  countByType: async (type: string): Promise<number> => {
    const response = await api.get<number>(`${ETUDES_ENDPOINT}/count/type/${type}`);
    return response.data;
  },

  getAllWithRdvCount: async (): Promise<EtudeWithRdvCount[]> => {
    try {
      const response = await api.get<Etude[]>(ETUDES_ENDPOINT);
      const etudes = response.data;

      const promises = etudes.map(async (etude): Promise<EtudeWithRdvCount> => {
        const idEtude = etude.idEtude || etude.id;
        if (typeof idEtude !== 'number' || idEtude <= 0) {
          console.warn('Étude sans ID valide détectée :', etude);
          return { ...etude, rdvCount: 0 };
        }

        try {
          const rdvs = await rdvService.searchByEtude(idEtude);
          const rdvCount = Array.isArray(rdvs) ? rdvs.length : (rdvs.content?.length || 0);
          return { ...etude, rdvCount };
        } catch (error) {
          console.error(`Erreur pour l'étude ${idEtude}:`, error);
          return { ...etude, rdvCount: 0 };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors du chargement des études avec RDV count:', error);
      throw error;
    }
  },

  updatePayeStatus: async (idEtude: number, payeStatus: number): Promise<Etude> => {
    try {
      const response = await api.patch<Etude>(`/etudes/${idEtude}/paye`, payeStatus);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur mise à jour statut PAYE étude ${idEtude}:`, error);
      throw error;
    }
  },

  checkAndUpdatePayeStatus: async (idEtude: number, paiements: any[]): Promise<number> => {
    try {
      if (!paiements || paiements.length === 0) {
        await etudeService.updatePayeStatus(idEtude, 0);
        return 0;
      }

      // Vérifier si tous les paiements sont payés (paye = 1)
      const allPaid = paiements.every(p => p.paye === 1);
      const newPayeStatus = allPaid ? 2 : 0;
      await etudeService.updatePayeStatus(idEtude, newPayeStatus);
      return newPayeStatus;
    } catch (error) {
      console.error(`❌ Erreur vérification statut PAYE étude ${idEtude}:`, error);
      throw error;
    }
  },
};

export default etudeService;