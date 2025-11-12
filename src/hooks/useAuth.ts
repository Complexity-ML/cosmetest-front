import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

// Types pour l'utilisateur (aligné avec AuthContext)
export interface User {
  login: string;
  role: number;
  [key: string]: any;
}

// Types pour les helpers de rôles
interface RoleHelpers {
  isAdmin: () => boolean;
  isUser: () => boolean;
  canAccess: (requiredRole?: string | null) => boolean;
}

// Type de retour du hook useAuth
export interface UseAuthReturn {
  // États
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  initAttempted: boolean;
  
  // Actions
  login: (loginData: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  
  // Fonctions utilitaires pour les permissions
  isAdmin: () => boolean;
  isUser: () => boolean;
  hasPermission: (permission: number | number[]) => boolean;
  canAccess: (requiredRole?: string | null) => boolean;
  
  // États dérivés
  isReady: boolean;
  hasUser: boolean;
  userRole: number | null;
  username: string | null;
  
  // Informations de débogage
  debugInfo: {
    userRole: number | undefined;
    isAuthenticated: boolean;
    hasPermissionFunc: boolean;
    contextAvailable: boolean;
  };
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * @returns {UseAuthReturn} Objet avec toutes les propriétés et méthodes d'authentification
 */
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  // Ajouter des vérifications de sécurité
  const {
    user,
    isAuthenticated,
    isLoading,
    authError,
    initAttempted,
    login,
    logout,
    refreshAuth,
    hasPermission
  } = context;

  // S'assurer que isAuthenticated est toujours un booléen
  const safeIsAuthenticated = Boolean(isAuthenticated);

  // Fonctions utilitaires memoizées pour les rôles
  const roleHelpers = useMemo((): RoleHelpers => {
    const userRole = user?.role;
    
    return {
      isAdmin: (): boolean => {
        if (!safeIsAuthenticated || !user) return false;
        
        // Vérifications multiples pour la robustesse
        // userRole est un nombre (2 pour admin)
        const isAdminByRole = userRole === 2;
        const isAdminByPermission = hasPermission && hasPermission(2);
        
        return isAdminByRole || isAdminByPermission;
      },
      
      isUser: (): boolean => {
        if (!safeIsAuthenticated || !user) return false;
        return userRole === 1;
      },
      
      canAccess: (requiredRole: string | null = null): boolean => {
        if (!safeIsAuthenticated) return false;
        if (!requiredRole) return true;
        
        // Normaliser le rôle requis
        const normalizedRequired = requiredRole.toLowerCase();
        
        // Vérifier par rôle direct
        if (normalizedRequired === 'admin' || normalizedRequired === 'administrateur') {
          return roleHelpers.isAdmin();
        }
        
        if (normalizedRequired === 'user' || normalizedRequired === 'utilisateur') {
          return roleHelpers.isUser();
        }
        
        // Convertir en nombre si possible
        const roleNumber = parseInt(requiredRole, 10);
        if (!isNaN(roleNumber) && hasPermission) {
          return hasPermission(roleNumber);
        }
        
        return false;
      }
    };
  }, [safeIsAuthenticated, user, hasPermission]);

  return {
    // États
    user,
    isAuthenticated: safeIsAuthenticated,
    isLoading: Boolean(isLoading),
    authError,
    initAttempted: Boolean(initAttempted),
    
    // Actions
    login,
    logout,
    refreshAuth,
    
    // Fonctions utilitaires pour les permissions
    isAdmin: roleHelpers.isAdmin,
    isUser: roleHelpers.isUser,
    hasPermission: hasPermission || (() => false),
    canAccess: roleHelpers.canAccess,
    
    // États dérivés
    isReady: Boolean(initAttempted && !isLoading),
    hasUser: Boolean(user && user.login),
    userRole: user?.role || null,
    username: user?.login || null,
    
    // Informations de débogage
    debugInfo: {
      userRole: user?.role,
      isAuthenticated: safeIsAuthenticated,
      hasPermissionFunc: !!hasPermission,
      contextAvailable: !!context
    }
  };
};

export default useAuth;
