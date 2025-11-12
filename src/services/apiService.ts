import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Si l'erreur est 401 (Unauthorized), rediriger vers la page de connexion
    if (error.response && error.response.status === 401) {
      Cookies.remove('jwt');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
