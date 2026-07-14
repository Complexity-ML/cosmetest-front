// ============================================================
// authService.ts - Service d'authentification avec cookies HttpOnly et debug
// ============================================================

import api from './api';
import { AxiosError } from 'axios';

export interface User {
  login: string;
  nom: string;
  email?: string | null;
  role: number;
  authorities?: Authority[];
}

export interface Authority {
  authority?: string | number;
  role?: string | number;
}

type WireRole = Authority | string | number;

export interface WireUser {
  login?: string | null;
  nom?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | number | null;
  roles?: WireRole[] | WireRole | null;
  authorities?: WireRole[] | WireRole | null;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  role?: number;
  isAdmin?: boolean;
  message?: string;
}

interface JwtResponse {
  username: string;
  user?: WireUser;
}

interface ValidateResponse {
  valid?: boolean;
  user?: WireUser;
}

const roleFromWireValue = (value: WireRole[] | WireRole | null | undefined): number | null => {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];

  for (const item of values) {
    const role = typeof item === 'object' ? item.authority ?? item.role : item;
    if (typeof role === 'number' && Number.isFinite(role)) return role;
    if (typeof role !== 'string') continue;

    if (role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_2') return 2;
    if (role === 'ROLE_USER' || role === 'USER' || role === 'ROLE_1') return 1;

    const numericRole = Number.parseInt(role, 10);
    if (Number.isFinite(numericRole)) return numericRole;
  }

  return null;
};

/** Transforme la réponse variable du backend en utilisateur applicatif stable. */
export const normalizeUser = (wireUser: WireUser | null | undefined): User | null => {
  if (!wireUser || typeof wireUser.login !== 'string' || wireUser.login.length === 0) return null;

  const authorities = Array.isArray(wireUser.authorities)
    ? wireUser.authorities.filter((item): item is Authority => typeof item === 'object' && item !== null)
    : [];
  const role = roleFromWireValue(wireUser.roles)
    ?? roleFromWireValue(wireUser.authorities)
    ?? roleFromWireValue(wireUser.role)
    ?? 1;

  return {
    login: wireUser.login,
    nom: wireUser.nom || wireUser.name || wireUser.login,
    email: wireUser.email || null,
    role,
    authorities,
  };
};

class AuthService {
  // Stockage temporaire des infos utilisateur en mémoire
  private _currentUser: User | null = null;
  private _debugMode: boolean = import.meta.env.DEV;

  private log(message: string, ...data: unknown[]): void {
    if (this._debugMode) {
      console.log(`🔐 AuthService: ${message}`, ...data);
    }
  }

  private error(message: string, ...error: unknown[]): void {
    console.error(`❌ AuthService: ${message}`, ...error);
  }

  /**
   * Envoie les identifiants (login + motDePasse) au backend.
   * Le backend renvoie un cookie HttpOnly (Set-Cookie: jwt=...).
   */
  async login(login: string, motDePasse: string): Promise<LoginResponse> {
    try {
      this.log('Tentative de connexion avec:', { login });

      // Format JSON attendu par le backend
      const loginData = { login, motDePasse };

      this.log('URL de connexion:', '/auth/login');

      // Requête d'authentification
      const response = await api.post<JwtResponse>('/auth/login', loginData);


      // Si le backend répond 200 => connexion réussie
      if (response.status === 200) {
        // Vérifier la structure de la réponse
        if (response.data && response.data.user) {
          // Nouvelle structure de réponse (avec objet user)
          const normalizedUser = normalizeUser(response.data.user);
          if (!normalizedUser) {
            this.error('Données utilisateur invalides dans la réponse de connexion');
            return { success: false, message: 'Réponse serveur inattendue' };
          }
          this._currentUser = normalizedUser;
          this.log('Utilisateur mis en cache (nouvelle structure):', this._currentUser);

          return {
            success: true,
            user: normalizedUser,
            role: normalizedUser.role,
            isAdmin: normalizedUser.role === 2
          };
        } else if (response.data && response.data.username) {
          // Ancienne structure de réponse (JwtResponse)

          // Faire un appel pour récupérer les infos utilisateur
          try {
            // IMPORTANT: Utiliser getCurrentUser() qui normalise les rôles
            const normalizedUser = await this.getCurrentUser();

            if (normalizedUser) {
              this.log('Utilisateur récupéré et normalisé après login:', normalizedUser);

              return {
                success: true,
                user: normalizedUser,
                role: normalizedUser.role,
                isAdmin: normalizedUser.role === 2
              };
            } else {
              this.error('Erreur: getCurrentUser a retourné null');
              return { success: false, message: 'Impossible de récupérer les données utilisateur' };
            }
          } catch (userError) {
            this.error('Erreur récupération utilisateur après connexion');
            // Créer un utilisateur minimal
            const minimalUser: User = {
              login: response.data.username,
              nom: response.data.username,
              role: 1
            };
            this._currentUser = minimalUser;

            return {
              success: true,
              user: minimalUser,
              role: 1,
              isAdmin: false
            };
          }
        } else {
          this.error('Structure de réponse inattendue');
          return {
            success: false,
            message: 'Réponse serveur inattendue'
          };
        }
      } else {
        this.error('Statut de réponse inattendu:', response.status);
        return {
          success: false,
          message: `Erreur serveur: ${response.status}`
        };
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      this.error('Échec de connexion:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText
      });

      // Gestion détaillée des différents types d'erreur
      let errorMessage = 'Échec de connexion';

      if (axiosError.response) {
        // Le serveur a répondu avec un code d'erreur
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        this.log('Erreur de réponse serveur:', { status });

        if (status === 401) {
          errorMessage = 'Identifiants incorrects';
        } else if (status === 403) {
          errorMessage = 'Accès interdit';
        } else if (status === 404) {
          errorMessage = 'Service non trouvé';
        } else if (status === 500) {
          errorMessage = 'Erreur interne du serveur';
        } else if (status >= 400 && status < 500) {
          errorMessage = 'Erreur de requête';
        } else if (status >= 500) {
          errorMessage = 'Erreur du serveur';
        }

        // Essayer d'extraire le message d'erreur du serveur
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          const errorData = data as Record<string, unknown>;
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        }

      } else if (axiosError.request) {
        // La requête a été faite mais pas de réponse
        this.error('Pas de réponse du serveur');
        errorMessage = 'Impossible de contacter le serveur';
      } else {
        // Erreur lors de la configuration de la requête
        this.error('Erreur de configuration:', axiosError.message);
        errorMessage = 'Erreur de configuration: ' + axiosError.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Informe le backend qu'on se déconnecte.
   * Le backend doit expirer le cookie JWT (Set-Cookie: jwt=; Max-Age=0).
   */
  async logout(): Promise<boolean> {
    try {
      this.log('Début de la déconnexion');
      await api.post('/auth/logout');
      // Vider le cache utilisateur
      this._currentUser = null;
      this.log('Déconnexion réussie');
      return true;
    } catch (error) {
      this.error('Erreur lors de la déconnexion');
      // Même en cas d'erreur, vider le cache
      this._currentUser = null;
      return false;
    }
  }

  /**
   * Récupère l'utilisateur actuel.
   * Utilise le cache si disponible, sinon fait un appel API à /users/me.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Si on a déjà l'utilisateur en cache, le retourner
      if (this._currentUser) {
        this.log('Utilisateur récupéré depuis le cache:', this._currentUser);
        return this._currentUser;
      }

      this.log('Appel API /users/me pour récupérer l\'utilisateur');

      // Faire un appel API à /users/me qui renvoie maintenant le rôle numérique
      const response = await api.get<WireUser>('/users/me');


      this.log('Analyse de la réponse /users/me:', {
        status: response.status,
        dataType: typeof response.data,
        hasLogin: !!(response.data && response.data.login),
        hasRole: !!(response.data && response.data.role),
        roleValue: response.data?.role,
        roleType: typeof response.data?.role,
        hasAuthorities: !!(response.data && response.data.authorities),
        authorities: response.data?.authorities,
        allDataKeys: response.data ? Object.keys(response.data) : 'no data'
      });

      // Normaliser les données utilisateur
      const rawUser = response.data;
      if (!rawUser || !rawUser.login) {
        this.error('Données utilisateur invalides');
        this._currentUser = null;
        return null;
      }

      const normalizedUser = normalizeUser(rawUser);
      if (!normalizedUser) {
        this.error('Données utilisateur invalides');
        this._currentUser = null;
        return null;
      }

      this.log('Utilisateur normalisé:', normalizedUser);

      // Mettre en cache
      this._currentUser = normalizedUser;
      return normalizedUser;
    } catch (error) {
      this.error('Impossible de récupérer l\'utilisateur');
      // Vider le cache en cas d'erreur
      this._currentUser = null;
      return null;
    }
  }


  /**
   * Vérifie si on est authentifié, en interrogeant /auth/validate.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      this.log('Vérification de l\'authentification via /auth/validate');

      const response = await api.get<ValidateResponse | string>('/auth/validate');
      this.log('Réponse /auth/validate:', { status: response.status });

      // Le backend peut retourner soit:
      // - Un objet {valid: true}
      // - Une string "Token valide"
      // - Un objet avec des données utilisateur

      let isAuth = false;

      if (response.status === 200) {
        if (typeof response.data === 'string') {
          // Si c'est une string, vérifier si ce n'est pas "Non authentifié"
          isAuth = response.data !== "Non authentifié" && response.data.includes("valide");
          this.log('Authentification basée sur string:', isAuth);
        } else if (response.data && typeof response.data === 'object') {
          // Si c'est un objet, vérifier la propriété 'valid' ou des données utilisateur
          const data = response.data as ValidateResponse;
          isAuth = data.valid === true || !!data.user;
          this.log('Authentification basée sur objet:', isAuth);

          // Si on a des données utilisateur, les mettre en cache
          if (data.user) {
            this._currentUser = normalizeUser(data.user);
            this.log('Utilisateur mis en cache depuis /auth/validate:', this._currentUser);
          }
        } else {
          this.log('Type de réponse inattendu:', typeof response.data);
        }
      }

      if (!isAuth) {
        this._currentUser = null;
        this.log('Non authentifié, cache vidé');
      }

      this.log('Résultat final isAuthenticated:', isAuth);
      return isAuth;
    } catch (error) {
      this.error('Erreur de validation d\'authentification');
      // Vider le cache en cas d'erreur
      this._currentUser = null;
      return false;
    }
  }

  /**
   * Récupère le rôle de l'utilisateur
   * @returns {number|null} - 1 pour user, 2 pour admin, null si pas connecté
   */
  async getUserRole(): Promise<number | null> {
    try {
      const user = await this.getCurrentUser();
      const role = user?.role || null;
      this.log('Rôle utilisateur:', role);
      return role;
    } catch (error) {
      this.error('Erreur lors de la récupération du rôle');
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    const isAdmin = role === 2;
    this.log('isAdmin():', isAdmin);
    return isAdmin;
  }

  /**
   * Vérifie si l'utilisateur est un utilisateur normal
   */
  async isUser(): Promise<boolean> {
    const role = await this.getUserRole();
    const isUser = role === 1;
    this.log('isUser():', isUser);
    return isUser;
  }

  /**
   * Vérifie si l'utilisateur a les permissions pour accéder à une ressource
   * @param requiredRole - Rôle(s) requis (1 pour user, 2 pour admin)
   */
  async hasPermission(requiredRole: number | number[]): Promise<boolean> {
    const userRole = await this.getUserRole();
    if (!userRole) {
      this.log('hasPermission(): false (pas de rôle utilisateur)');
      return false;
    }

    let hasAccess = false;

    if (Array.isArray(requiredRole)) {
      hasAccess = requiredRole.includes(userRole);
    } else {
      // Les admins (2) ont accès aux ressources utilisateur (1)
      if (requiredRole === 1 && userRole >= 1) hasAccess = true;
      if (requiredRole === 2 && userRole === 2) hasAccess = true;
    }

    this.log(`hasPermission(${JSON.stringify(requiredRole)}):`, hasAccess, `(userRole: ${userRole})`);
    return hasAccess;
  }

  /**
   * Vide le cache utilisateur (utile lors du rechargement de page)
   */
  clearCache(): void {
    this.log('Cache utilisateur vidé');
    this._currentUser = null;
  }

  /**
   * Active/désactive le mode debug
   */
  setDebugMode(enabled: boolean): void {
    this._debugMode = enabled;
    this.log('Mode debug:', enabled ? 'activé' : 'désactivé');
  }
}

const authService = new AuthService();
export default authService;
