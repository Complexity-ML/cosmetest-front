// ============================================================
// api.ts - Service de base pour les requêtes API
// ============================================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// URL de l'API
// - En production avec proxy IIS: utiliser '/api' (same-origin)
// - Sans proxy: utiliser l'URL complète du backend
const API_HOST = 'http://192.168.127.36:8888';
const baseApiUrl = `${API_HOST}/api`;

// Créer une instance d'axios avec la configuration de base
const api: AxiosInstance = axios.create({
  baseURL: baseApiUrl,
  withCredentials: true,               // indispensable pour cookies cross-site
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur de requête : log pour debug
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    console.error('Erreur de requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : log pour debug et gestion des erreurs d'authentification
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('Erreur de réponse API:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Gérer à la fois 401 (Unauthorized) et 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Ne pas rediriger si on est déjà sur la page de connexion ou en train de tenter une connexion
      const isAuthPath = window.location.pathname.includes('/cosmetest/login') ||
                         error.config?.url?.includes('/auth/login') ||
                         error.config?.url?.includes('/auth/validate');

      if (!isAuthPath) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
