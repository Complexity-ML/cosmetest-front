import api from './api';
import { handleError } from '../utils/errorUtils';
import { Groupe } from '../types/types';

const API_URL = '/groupes';

/**
 * Service pour gérer les opérations liées aux groupes
 */
const groupeService = {
  /**
   * Récupère tous les groupes
   * @returns {Promise<Array>} Liste des groupes
   */
  getAll: async (): Promise<Groupe[]> => {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Récupère un groupe par son ID
   * @param {number} id - L'ID du groupe
   * @returns {Promise<Object>} Le groupe correspondant
   */
  getById: async (id: string | number): Promise<Groupe> => {
    try {
      // Vérifier si l'ID est valide avant d'envoyer la requête
      if (!id || id === 'undefined') {
        return Promise.reject(new Error('ID de groupe non valide'));
      }
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error as any, `Erreur lors de la récupération du groupe avec l'ID: ${id}`);
    }
  },

  /**
   * Récupère les groupes d'une étude spécifique
   * @param {number} idEtude - L'ID de l'étude
   * @returns {Promise<Array>} Liste des groupes de l'étude
   */
  getGroupesByIdEtude: async (idEtude: string | number): Promise<Groupe[]> => {
    try {
      const response = await api.get(`${API_URL}/etude/${idEtude}`);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Récupère les groupes par tranche d'âge
   * @param {number|null} ageMin - L'âge minimum (optionnel)
   * @param {number|null} ageMax - L'âge maximum (optionnel)
   * @returns {Promise<Array>} Liste des groupes correspondants
   */
  getGroupesByAgeRange: async (ageMin: number | null, ageMax: number | null): Promise<Groupe[]> => {
    try {
      let url = `${API_URL}/filtrerParAge`;
      const params = new URLSearchParams();

      if (ageMin !== null) params.append('ageMin', String(ageMin));
      if (ageMax !== null) params.append('ageMax', String(ageMax));

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Récupère les groupes par ethnie
   * @param {string} ethnie - L'ethnie recherchée
   * @returns {Promise<Array>} Liste des groupes correspondants
   */
  getGroupesByEthnie: async (ethnie: string): Promise<Groupe[]> => {
    try {
      const response = await api.get(`${API_URL}/ethnie/${ethnie}`);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Recherche des groupes selon un critère
   * @param {string} query - Le critère de recherche
   * @returns {Promise<Array>} Liste des groupes correspondants
   */
  search: async (query: string): Promise<Groupe[]> => {
    try {
      // Supposons qu'il y a un endpoint de recherche, sinon on fait une recherche côté client
      // sur tous les groupes
      const response = await api.get(`${API_URL}?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      // Si l'endpoint de recherche n'existe pas, on récupère tous les groupes
      // et on filtre côté client
      console.warn("Endpoint de recherche non disponible, filtrage côté client");

      const allGroupes = await groupeService.getAll();
      const searchLower = query.toLowerCase();

      return allGroupes.filter((groupe: Groupe) =>
        (groupe.nom && groupe.nom.toLowerCase().includes(searchLower)) ||
        (groupe.ethnie && groupe.ethnie.toLowerCase().includes(searchLower)) ||
        (groupe.description && groupe.description.toLowerCase().includes(searchLower))
      );
    }
  },

  /**
   * Récupère les groupes avec pagination
   * @param {number} page - Numéro de page
   * @param {number} size - Nombre d'éléments par page
   * @param {string} sortBy - Champ de tri
   * @param {string} direction - Direction du tri ('ASC' ou 'DESC')
   * @returns {Promise<Object>} Page de groupes
   */
  getPaginated: async (page: number, size: number, sortBy: string = 'id', direction: string = 'ASC'): Promise<any> => {
    try {
      console.log(`getPaginated appelé avec: page=${page}, size=${size}, sortBy=${sortBy}, direction=${direction}`);
      const response = await api.get(
        `${API_URL}?page=${page}&size=${size}&sort=${sortBy},${direction}`
      );
      console.log('Réponse backend:', response.data);
      
      // Vérifier si le backend a retourné un format paginé ou un simple tableau
      if (Array.isArray(response.data)) {
        // Le backend ne supporte pas la pagination, simulation côté client
        console.warn("Backend a retourné un tableau simple, simulation de la pagination côté client");
        const allGroupes = response.data;
        console.log(`Total groupes récupérés: ${allGroupes.length}`);
        console.log('Groupes avant tri:', allGroupes.slice(0, 3).map((g: any) => ({ idGroupe: g.idGroupe, nom: g.nom || g.intitule })));

        // Tri
        allGroupes.sort((a: any, b: any) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];

          if (direction.toUpperCase() === 'ASC') {
            // ASC : petites valeurs d'abord (1, 2, 3...)
            return aValue > bValue ? 1 : -1;
          } else {
            // DESC : grandes valeurs d'abord (3, 2, 1...)
            return aValue > bValue ? -1 : 1;
          }
        });

        console.log('Groupes après tri:', allGroupes.slice(0, 3).map((g: any) => ({ idGroupe: g.idGroupe, nom: g.nom || g.intitule })));

        // Pagination
        const start = page * size;
        const end = start + size;
        const paginatedGroupes = allGroupes.slice(start, end);

        return {
          content: paginatedGroupes,
          totalElements: allGroupes.length,
          totalPages: Math.ceil(allGroupes.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: (page + 1) * size >= allGroupes.length
        };
      }
      
      // Le backend supporte la pagination
      console.log('Réponse backend (pagination supportée):', response.data);
      return response.data;
    } catch (error) {
      // Si la pagination n'est pas disponible sur le backend, on simule côté client
      console.warn("Pagination non disponible, simulation côté client");
      console.log('Erreur backend:', error);

      const allGroupes = await groupeService.getAll();
      console.log(`Total groupes récupérés: ${allGroupes.length}`);
      console.log('Groupes avant tri:', allGroupes.slice(0, 3).map((g: any) => ({ idGroupe: g.idGroupe, nom: g.nom || g.intitule })));

      // Tri
      allGroupes.sort((a: any, b: any) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (direction.toUpperCase() === 'ASC') {
          // ASC : petites valeurs d'abord (1, 2, 3...)
          return aValue > bValue ? 1 : -1;
        } else {
          // DESC : grandes valeurs d'abord (3, 2, 1...)
          return aValue > bValue ? -1 : 1;
        }
      });

      console.log('Groupes après tri:', allGroupes.slice(0, 3).map((g: any) => ({ idGroupe: g.idGroupe, nom: g.nom || g.intitule })));

      // Pagination
      const start = page * size;
      const end = start + size;
      const paginatedGroupes = allGroupes.slice(start, end);

      return {
        content: paginatedGroupes,
        totalElements: allGroupes.length,
        totalPages: Math.ceil(allGroupes.length / size),
        size: size,
        number: page,
        first: page === 0,
        last: (page + 1) * size >= allGroupes.length
      };
    }
  },

  /**
   * Crée un nouveau groupe
   * @param {Object} groupe - Données du groupe à créer
   * @returns {Promise<Object>} Le groupe créé
   */
  create: async (groupe: Partial<Groupe>): Promise<Groupe> => {
    try {
      const response = await api.post(API_URL, groupe);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Met à jour un groupe existant
   * @param {number} id - L'ID du groupe à mettre à jour
   * @param {Object} groupe - Nouvelles données du groupe
   * @returns {Promise<Object>} Le groupe mis à jour
   */
  update: async (id: string | number, groupe: Partial<Groupe>): Promise<Groupe> => {
    try {
      const response = await api.put(`${API_URL}/${id}`, groupe);
      return response.data;
    } catch (error) {
      return handleError(error as any);
    }
  },

  /**
   * Supprime un groupe
   * @param {number} id - L'ID du groupe à supprimer
   * @returns {Promise<boolean>} Statut de la suppression
   */
  delete: async (id: string | number): Promise<boolean> => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      handleError(error as any);
      return false;
    }
  }
};

export default groupeService;