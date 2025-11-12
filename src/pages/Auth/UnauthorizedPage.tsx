import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Lock className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Accès refusé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>

            {user && (
              <Alert>
                <AlertDescription>
                  <div className="text-sm">
                    <p><strong>Utilisateur connecté :</strong> {user.login}</p>
                    <p><strong>Rôle :</strong> {user.role === 2 ? 'Administrateur' : 'Utilisateur'}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              Retour à la page précédente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
