import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  login: string;
  role: number;
  [key: string]: any;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  initAttempted: boolean;
  login: (loginData: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isAdmin: () => boolean;
  isUser: () => boolean;
  hasPermission: (requiredRole: number | number[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initAttempted, setInitAttempted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let initializationDone = false;

    const initAuth = async (attempt = 1, maxAttempts = 3) => {
      // Éviter les appels multiples
      if (initializationDone) return;

      try {
        // Vérifier l'authentification
        const authenticated = await authService.isAuthenticated();

        if (!isMounted) return;

        if (authenticated === true) {
          try {
            const userData = await authService.getCurrentUser();

            if (!isMounted) return;

            if (userData && userData.login) {

              // S'assurer que le rôle est un nombre
              let userRole = userData.role;
              if (typeof userRole === 'string') {
                userRole = parseInt(userRole, 10);
              }
              if (isNaN(userRole) || userRole === null || userRole === undefined) {
                userRole = 1;
              }

              // Créer un objet utilisateur normalisé
              const normalizedUser = {
                ...userData,
                role: userRole
              };


              setUser(normalizedUser);
              setIsAuthenticated(true);
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (userError) {
            console.error('❌ Erreur récupération utilisateur:', userError);
            if (isMounted) {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          // Authentification échouée
          setUser(null);
          setIsAuthenticated(false);
        }

        // Succès - terminer l'initialisation
        setAuthError(null);
        initializationDone = true;

      } catch (error) {
        console.error(`❌ Erreur lors de l'initialisation (tentative ${attempt}/${maxAttempts}):`, error);

        if (!isMounted) return;

        // Gérer les erreurs réseau avec des tentatives
        if (attempt < maxAttempts) {
          // Programmer une nouvelle tentative
          setTimeout(() => {
            if (isMounted && !initializationDone) {
              initAuth(attempt + 1, maxAttempts);
            }
          }, 2000);

          return; // Ne pas terminer l'initialisation maintenant
        }

        // Après toutes les tentatives, supposer non authentifié
        setIsAuthenticated(false);
        setUser(null);
        setAuthError('Impossible de vérifier l\'authentification. Veuillez réessayer.');
        initializationDone = true;
      } finally {
        if (isMounted && initializationDone) {
          setIsLoading(false);
          setInitAttempted(true);
          // Utiliser un setTimeout pour accéder aux valeurs d'état mises à jour
          setTimeout(() => {
            console.log('📊 État final vérifié:', {
              isAuthenticated: isAuthenticated,
              hasUser: !!user,
              userLogin: user?.login
            });
          }, 100);
        }
      }
    };

    // Démarrer l'initialisation
    initAuth();

    // Nettoyage en cas de démontage du composant
    return () => {
      isMounted = false;
    };
  }, []); // Dépendances vides pour éviter les re-exécutions

  const login = async (loginData: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const result = await authService.login(loginData, password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setAuthError(result.message || 'Échec de connexion');
        setIsAuthenticated(false);
        setUser(null);
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Échec de connexion';
      console.error('❌ Erreur de connexion:', errorMsg, error);
      setAuthError(errorMsg);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      // TOUJOURS réinitialiser l'état même en cas d'erreur
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setIsLoading(false);

      // Rediriger vers la page de connexion après déconnexion
      window.location.href = '/cosmetest/login';
    }
  };

  const refreshAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();

      if (authenticated === true && !isAuthenticated) {
        // Était déconnecté, maintenant connecté
        const userData = await authService.getCurrentUser();
        if (userData && userData.login) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else if (authenticated === false && isAuthenticated) {
        // Était connecté, maintenant déconnecté
        setUser(null);
        setIsAuthenticated(false);
      }

      return authenticated;
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement de l\'authentification:', error);
      return isAuthenticated; // Conserver l'état actuel en cas d'erreur
    }
  };

  // Fonctions utilitaires pour les rôles
  const isAdmin = () => {
    const result = user?.role === 2;
    return result;
  };

  const isUser = () => {
    const result = user?.role === 1;
    return result;
  };

  const hasPermission = (requiredRole: number | number[]) => {
    if (!user?.role) {
      return false;
    }
    let result = false;
    if (Array.isArray(requiredRole)) {
      result = requiredRole.includes(user.role);
    } else {
      if (requiredRole === 1 && user.role >= 1) result = true;
      if (requiredRole === 2 && user.role === 2) result = true;
    }
    return result;
  };

  const value = {
    user,
    isAuthenticated, // Sera TOUJOURS true ou false, jamais undefined
    isLoading,
    authError,
    initAttempted,
    login,
    logout,
    refreshAuth,
    isAdmin,
    isUser,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;