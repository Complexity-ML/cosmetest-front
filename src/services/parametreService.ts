import api from './api';

/**
 * Service for managing user identifiers/parameters
 * Maps to /identifiants API endpoints
 */
const parametreService = {
    /**
     * Get all parameters/identifiers
     * @returns {Promise<Array>} Array of parameters
     */
    getParametres: async () => {
        try {
            const response = await api.get('/identifiants');
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching parametres:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paramètres');
        }
    },

    /**
     * Get parameters by role
     * @param {string} role - The role to filter by
     * @returns {Promise<Array>} Array of parameters for the specified role
     */
    getParametresByRole: async (role: string) => {
        try {
            if (!role) throw new Error('Le rôle est requis');
            const response = await api.get(`/identifiants/by-role/${encodeURIComponent(role)}`);
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching parametres by role:', error);
            throw new Error(error.response?.data?.message || `Erreur lors de la récupération des paramètres pour le rôle ${role}`);
        }
    },

    /**
     * Create a new parameter
     * @param {Object} parametres - The parameter data to create
     * @returns {Promise<Object>} Created parameter
     */
    createParametre: async (parametres: any) => {
        try {
            if (!parametres) throw new Error('Les données du paramètre sont requises');
            const response = await api.post('/identifiants', parametres);
            return response.data;
        } catch (error: any) {
            console.error('Error creating parametre:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la création du paramètre');
        }
    },

    /**
     * Get parameter by login
     * @param {string} login - The login to search for
     * @returns {Promise<Object>} Parameter data
     */
    getParametreByLogin: async (login: string) => {
        try {
            if (!login) throw new Error('Le login est requis');
            const response = await api.get(`/identifiants/by-login/${encodeURIComponent(login)}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching parametre by login:', error);
            throw new Error(error.response?.data?.message || `Erreur lors de la récupération du paramètre pour le login ${login}`);
        }
    },

    /**
     * Update parameter
     * @param {number|string} idVolontaire - The ID of the parameter to update
     * @param {Object} parametres - The updated parameter data
     * @returns {Promise<Object>} Updated parameter
     */
    updateParametres: async (idVolontaire: number | string, parametres: any) => {
        try {
            if (!idVolontaire) throw new Error('L\'ID est requis');
            if (!parametres) throw new Error('Les données du paramètre sont requises');
            const response = await api.put(`/identifiants/${idVolontaire}`, parametres);
            return response.data;
        } catch (error: any) {
            console.error('Error updating parametre:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du paramètre');
        }
    },

    /**
     * Get parameter by ID
     * @param {number|string} idVolontaire - The ID of the parameter
     * @returns {Promise<Object>} Parameter data
     */
    getParametreById: async (idVolontaire: number | string) => {
        try {
            if (!idVolontaire) throw new Error('L\'ID est requis');
            const response = await api.get(`/identifiants/${idVolontaire}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching parametre by ID:', error);
            if (error.response?.status === 404) {
                throw new Error('Paramètre non trouvé');
            }
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du paramètre');
        }
    },

    /**
     * Delete parameter
     * @param {number|string} idVolontaire - The ID of the parameter to delete
     * @returns {Promise<Object>} Deletion result
     */
    deleteParametre: async (idVolontaire: number | string) => {
        try {
            if (!idVolontaire) throw new Error('L\'ID est requis');
            const response = await api.delete(`/identifiants/${idVolontaire}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting parametre:', error);
            if (error.response?.status === 404) {
                throw new Error('Paramètre non trouvé');
            }
            throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du paramètre');
        }
    },

    /**
     * Change password for a parameter
     * @param {number|string} idVolontaire - The ID of the parameter
     * @param {string} mdp - The new password
     * @returns {Promise<Object>} Password change result
     */
    changeMdp: async (idVolontaire: number | string, mdp: string) => {
        try {
            if (!idVolontaire) throw new Error('L\'ID est requis');
            if (!mdp) throw new Error('Le mot de passe est requis');
            if (mdp.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            
            const response = await api.put(`/identifiants/${idVolontaire}/changer-mot-de-passe`, { mdp });
            return response.data;
        } catch (error: any) {
            console.error('Error changing password:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
        }
    },

    /**
     * Check if login exists
     * @param {string} login - The login to check
     * @returns {Promise<boolean>} True if login exists, false otherwise
     */
    checkLoginExists: async (login: string) => {
        try {
            if (!login) throw new Error('Le login est requis');
            const response = await api.get(`/identifiants/check-login/${encodeURIComponent(login)}`);
            return response.data?.exists || false;
        } catch (error: any) {
            console.error('Error checking login existence:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du login');
        }
    },

    /**
     * Check if email exists
     * @param {string} email - The email to check
     * @returns {Promise<boolean>} True if email exists, false otherwise
     */
    checkEmailExists: async (email: string) => {
        try {
            if (!email) throw new Error('L\'email est requis');
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format d\'email invalide');
            }
            
            const response = await api.get(`/identifiants/check-email/${encodeURIComponent(email)}`);
            return response.data?.exists || false;
        } catch (error: any) {
            console.error('Error checking email existence:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la vérification de l\'email');
        }
    },

    /**
     * Get parameters with pagination
     * @param {number} page - Page number (1-based)
     * @param {number} limit - Number of items per page
     * @param {string} search - Optional search term
     * @returns {Promise<Object>} Paginated results
     */
    getParametresPaginated: async (page = 1, limit = 10, search = '') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            });
            
            const response = await api.get(`/identifiants/paginated?${params}`);
            return {
                data: response.data?.data || [],
                total: response.data?.total || 0,
                page: response.data?.page || 1,
                limit: response.data?.limit || limit,
                totalPages: response.data?.totalPages || 0
            };
        } catch (error: any) {
            console.error('Error fetching paginated parametres:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paramètres paginés');
        }
    }
};

export default parametreService;