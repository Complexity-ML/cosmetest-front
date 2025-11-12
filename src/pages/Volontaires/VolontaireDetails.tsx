import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import PhotoViewer from '../../components/Volontaires/PhotoViewer.jsx';
import VolontaireDetailsTabs from '../../components/Volontaires/VolontaireDetailsTabs.jsx';
import renderVolontaireDetailsSection from '../../components/Volontaires/detailsSections';
import { useVolontaireDetails } from './hooks/useVolontaireDetails';

const VolontaireDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Early return if id is undefined
  if (!id) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Identifiant du volontaire manquant.
          <Link to="/volontaires" className="block mt-2 underline">
            Retour à la liste des volontaires
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const {
    volontaire,
    volontaireDisplayData,
    infoBankData,
    rdvs,
    etudesCount,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    annulationsEtudes,
    showAllAnnulations,
    setShowAllAnnulations,
    isUploadingPhoto,
    photoUploadError,
    selectedPhoto,
    setSelectedPhoto,
    handlePhotoUpload,
    handleAssignmentComplete,
    handleDelete,
    handleArchive,
    handleUnarchive,
  } = useVolontaireDetails({ id, navigate });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Link to="/volontaires" className="block mt-2 underline">
            Retour à la liste des volontaires
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (!volontaire) {
    return (
      <Alert>
        <AlertDescription>
          Volontaire non trouvé. Il est possible qu'il ait été supprimé ou que l'identifiant soit incorrect.
          <Link to="/volontaires" className="block mt-2 underline">
            Retour à la liste des volontaires
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const handleToggleAnnulations = (): void => {
    setShowAllAnnulations(!showAllAnnulations);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/volontaires">Volontaires</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {volontaire.prenom} {volontaire.nom}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Badge d'alerte pour les annulations */}
          {annulationsEtudes && annulationsEtudes.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 text-sm px-3 py-1.5">
              <AlertTriangle className="h-4 w-4" />
              {annulationsEtudes.length} annulation{annulationsEtudes.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/volontaires/${id}/edit`}>
              Modifier
            </Link>
          </Button>

          {volontaire.archive ? (
            <Button onClick={handleUnarchive} variant="outline">
              Désarchiver
            </Button>
          ) : (
            <Button onClick={handleArchive} variant="outline">
              Archiver
            </Button>
          )}

          <Button onClick={handleDelete} variant="destructive">
            Supprimer
          </Button>
        </div>
      </div>

      {volontaire.archive && (
        <Alert>
          <AlertDescription>
            Ce volontaire est archivé et n'apparaîtra pas dans les recherches par défaut.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <VolontaireDetailsTabs
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as any)}
            rdvCount={(rdvs ? rdvs.length : 0)}
            etudesCount={etudesCount}
          />
        </CardContent>

        <CardContent className="p-6">
          {renderVolontaireDetailsSection({
            activeTab,
            volontaire,
            volontaireDisplayData,
            annulationsEtudes,
            showAllAnnulations,
            onToggleAnnulations: handleToggleAnnulations,
            onSelectPhoto: setSelectedPhoto,
            infoBankData,
            volontaireId: id,
            rdvs,
            onAssignmentComplete: handleAssignmentComplete,
            isUploadingPhoto,
            photoUploadError,
            onPhotoUpload: handlePhotoUpload,
          })}
        </CardContent>
      </Card>

      {selectedPhoto && (
        <PhotoViewer
          photoUrl={selectedPhoto.url}
          alt={selectedPhoto.alt || selectedPhoto.nom || 'Photo du volontaire'}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default VolontaireDetails;
