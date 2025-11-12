import api from './api';

interface PaiementFilters {
  idEtude?: number;
  dateDebut?: string;
  dateFin?: string;
  statutPaiement?: number;
}

/**
 * Service pour gerer les operations de paiement
 */
class PaiementService {
  /**
   * Recuperer tous les paiements avec filtres optionnels.
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getAllPaiements(filters: PaiementFilters = {}) {
    try {
      const params: any = {};

      if (filters.idEtude) params.idEtude = filters.idEtude;
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;
      if (filters.statutPaiement !== undefined) params.statutPaiement = filters.statutPaiement;

      const response = await api.get('/etude-volontaires/paiements', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recuperation des paiements:', error);
      throw error;
    }
  }

  /**
   * Recuperer le resume agrege des paiements pour chaque etude.
   * @returns {Promise<Array>}
   */
  async getPaiementsSummaryParEtude() {
    try {
      const response = await api.get('/paiements/etudes/summary');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recuperation du resume des paiements par etude:', error);
      throw error;
    }
  }

  /**
   * Recuperer le resume agrege des paiements pour une etude donnee.
   * @param {number} idEtude
   * @returns {Promise<Object>}
   */
  async getPaiementsSummaryPourEtude(idEtude: number) {
    try {
      const response = await api.get(`/paiements/etudes/${idEtude}/summary`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la recuperation du resume de paiement pour l'etude ${idEtude}:`, error);
      throw error;
    }
  }

  /**
   * Recuperer les paiements pour une etude specifique.
   * @param {number} idEtude
   * @returns {Promise<Array>}
   */
  async getPaiementsByEtude(idEtude: number) {
    try {
      const response = await api.get(`/etude-volontaires/etude/${idEtude}/paiements`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la recuperation des paiements pour l'etude ${idEtude}:`, error);
      throw error;
    }
  }

  /**
   * Mettre a jour le statut de paiement d'un volontaire dans une etude.
   */
  async updateStatutPaiement(idEtude: number, idVolontaire: number, nouveauStatut: number) {
    try {
      const response = await api.patch('/etude-volontaires/update-paiement', null, {
        params: {
          idEtude,
          idVolontaire,
          nouveauStatutPaiement: nouveauStatut,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise a jour du statut de paiement:', error);
      throw error;
    }
  }

  /**
   * Mettre a jour plusieurs paiements en lot.
   */
  async updateMultiplePaiements(paiements: any[]) {
    try {
      const response = await api.patch('/etude-volontaires/update-paiements-batch', { paiements });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise a jour en lot des paiements:', error);
      throw error;
    }
  }

  /**
   * Marquer tous les paiements d'une etude comme payes.
   */
  async marquerTousPayesParEtude(idEtude: number) {
    try {
      const response = await api.patch(`/etude-volontaires/etude/${idEtude}/marquer-tous-payes`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage de tous les paiements comme payes pour l'etude ${idEtude}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de paiement.
   */
  async getStatistiquesPaiements(filters: PaiementFilters = {}) {
    try {
      const params: any = {};

      if (filters.idEtude) params.idEtude = filters.idEtude;
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;

      const response = await api.get('/etude-volontaires/paiements/statistiques', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recuperation des statistiques de paiement:', error);
      throw error;
    }
  }

  /**
   * Generer un rapport de paiements.
   */
  async genererRapportPaiements(filters: PaiementFilters = {}, format = 'excel') {
    try {
      const response = await api.get('/etude-volontaires/paiements/rapport', {
        params: { ...filters, format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la generation du rapport de paiements:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des paiements d'un volontaire.
   */
  async getHistoriquePaiementsVolontaire(idVolontaire: number) {
    try {
      const response = await api.get(`/volontaires/${idVolontaire}/paiements`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la recuperation de l'historique des paiements pour le volontaire ${idVolontaire}:`, error);
      throw error;
    }
  }

  /**
   * Calculer le montant total des paiements avec filtres.
   */
  async calculerMontantsPaiements(filters: PaiementFilters = {}) {
    try {
      const params: any = {};

      if (filters.idEtude) params.idEtude = filters.idEtude;
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;
      if (filters.statutPaiement !== undefined) params.statutPaiement = filters.statutPaiement;

      const response = await api.get('/etude-volontaires/paiements/montants', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul des montants de paiement:', error);
      throw error;
    }
  }

  /**
   * Verifier si un utilisateur a les permissions pour gerer les paiements.
   */
  async checkPermissionsPaiements() {
    try {
      const response = await api.get('/auth/check-permissions/paiements');
      return response.data.hasPermission;
    } catch (error) {
      console.error('Erreur lors de la verification des permissions:', error);
      return false;
    }
  }
}

const paiementService = new PaiementService();
export default paiementService;
