// ============================================================
// api.ts - Service de base pour les requêtes API
// ============================================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// URL de l'API : proxy same-origin en développement, serveur WinSW en production.
const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const baseApiUrl = configuredApiUrl
  ? configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`
  : import.meta.env.DEV
    ? '/api'
    : 'http://192.168.127.36:8888/api';

// Créer une instance d'axios avec la configuration de base
const api: AxiosInstance = axios.create({
  baseURL: baseApiUrl,
  withCredentials: true,               // indispensable pour cookies cross-site
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur de requête : ne jamais journaliser la configuration ou le corps.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    console.error('Erreur de requête API:', {
      url: error.config?.url,
      method: error.config?.method,
      code: error.code
    });
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
      code: error.code
    });

    // 401 = session absente/expirée. Un 403 signale seulement un droit insuffisant.
    if (error.response?.status === 401) {
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
