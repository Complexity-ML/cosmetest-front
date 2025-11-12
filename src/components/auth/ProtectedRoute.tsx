import React, { useContext, useEffect, useState, ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRole?: number | null;
  redirectTo?: string;
}

type RenderState = 'loading' | 'redirect-login' | 'redirect-unauthorized' | 'authorized' | 'error';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = null,
  redirectTo = '/login'
}) => {
  const authContext = useContext(AuthContext);
  const [shouldRender, setShouldRender] = useState<RenderState>('loading');

  useEffect(() => {
    if (!authContext) {
      console.error('ProtectedRoute doit être utilisé dans un AuthProvider');
      setShouldRender('error');
      return;
    }

    const {
      isAuthenticated,
      isLoading,
      initAttempted,
      user,
      hasPermission
    } = authContext;

    console.log('🔐 ProtectedRoute - État:', {
      isAuthenticated, isLoading, initAttempted,
      hasUser: !!user, userRole: user?.role, requiredRole
    });

    if (!initAttempted || isLoading) {
      setShouldRender('loading');
      return;
    }

    if (isAuthenticated === false) {
      setShouldRender('redirect-login');
      return;
    }

    if (isAuthenticated === true && requiredRole && !hasPermission(requiredRole)) {
      setShouldRender('redirect-unauthorized');
      return;
    }

    if (isAuthenticated === true) {
      setShouldRender('authorized');
    } else {
      setShouldRender('error');
    }

  }, [authContext, requiredRole, redirectTo]);

  if (shouldRender === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-gray-600">Vérification de l'authentification...</div>
      </div>
    );
  }

  if (shouldRender === 'redirect-login') {
    return <Navigate to={redirectTo} replace />;
  }

  if (shouldRender === 'redirect-unauthorized') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (shouldRender === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-gray-700">Erreur d'authentification</div>
        <Button onClick={() => window.location.reload()}>Recharger</Button>
      </div>
    );
  }

  if (shouldRender === 'authorized') {
    if (children) {
      return <>{children}</>;
    }
    return <Outlet />;
  }

  return null;
};

export default ProtectedRoute;
