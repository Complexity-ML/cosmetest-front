import { useState, lazy, Suspense, useMemo } from 'react';
import AppointmentViewer from './AppointmentViewer';
import { useRendezVousContext } from './context/RendezVousContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Calendar, Plus, ListChecks, AlertCircle, Loader2 } from 'lucide-react';

// Lazy load des composants lourds
const AppointmentCreator = lazy(() => import('../../components/RendezVous/AppointmentComponents/index').then(module => ({ default: module.AppointmentCreator })));
const AppointmentEditor = lazy(() => import('../../components/RendezVous/AppointmentComponents/index').then(module => ({ default: module.AppointmentEditor })));
const AppointmentBatchCreator = lazy(() => import('../../components/RendezVous/AppointmentBatchCreator'));
const AppointmentCalendar = lazy(() => import('../../components/RendezVous/Calendar'));
const AppointmentsByStudy = lazy(() => import('../../components/RendezVous/AppointmentsByStudy'));

// Type definitions
interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  idVolontaire?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  etude?: {
    id?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Study {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
  [key: string]: any;
}

interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  [key: string]: any;
}

interface ContextError {
  message?: string;
}

const RendezVousLayout = () => {
  const context = useRendezVousContext() as any;
  
  // Mémoïser les données pour éviter les re-renders inutiles
  const volunteers: Volunteer[] = useMemo(() => context?.volunteers ?? [], [context?.volunteers]);
  const studies: Study[] = useMemo(() => context?.studies ?? [], [context?.studies]);
  
  const isLoading: boolean = context?.isLoading ?? false;
  const error: ContextError | null = context?.error ?? null;
  const refresh = context?.refresh ?? (async () => {});
  const requestRefresh = context?.requestRefresh ?? (() => {});

  const [view, setView] = useState('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  const handleAppointmentClick = (appointment: Appointment) => {
    if (!appointment.idEtude || !appointment.idRdv) {
      appointment.idEtude = appointment.idEtude || appointment.etude?.id;
      appointment.idRdv = appointment.idRdv || appointment.id;
    }

    setSelectedAppointment(appointment);
    setView('view');
  };

  const handleStudySelect = (study: Study | null) => setSelectedStudy(study);
  const handleVolunteerSelect = (volunteer: Volunteer | null) => setSelectedVolunteer(volunteer);

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setView('edit');
  };

  const handleBackClick = () => {
    setView('calendar');
    setSelectedAppointment(null);
  };

  const handleOperationSuccess = () => {
    requestRefresh();
    setView('calendar');
    setSelectedAppointment(null);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  if (isLoading) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              {error.message || 'Erreur lors du chargement des données.'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={handleRefresh} variant="default">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Gestion des Rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="byStudy" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Par étude
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer un RDV
              </TabsTrigger>
              <TabsTrigger value="createBatch" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer plusieurs
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {view === 'calendar' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <div className="space-y-4">
                    <AppointmentCalendar {...({ onAppointmentClick: handleAppointmentClick } as any)} />
                  </div>
                </Suspense>
              )}

              {view === 'byStudy' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <div className="space-y-4">
                    <AppointmentsByStudy
                      {...({ studies, onAppointmentClick: handleAppointmentClick, onBack: handleBackClick } as any)}
                    />
                  </div>
                </Suspense>
              )}

              {view === 'create' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <div className="space-y-4">
                    <AppointmentCreator
                      volunteers={[]}
                      studies={studies}
                      selectedVolunteer={selectedVolunteer}
                      selectedStudy={selectedStudy}
                      onVolunteerSelect={handleVolunteerSelect}
                      onStudySelect={handleStudySelect}
                      onBack={handleBackClick}
                      onSuccess={handleOperationSuccess}
                    />
                  </div>
                </Suspense>
              )}

              {view === 'createBatch' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <div className="space-y-4">
                    <AppointmentBatchCreator
                      studies={studies as any}
                      selectedStudy={selectedStudy as any}
                      onStudySelect={handleStudySelect as any}
                      onBack={handleBackClick}
                      onSuccess={handleOperationSuccess}
                    />
                  </div>
                </Suspense>
              )}
            </div>
          </Tabs>

          {view === 'view' && selectedAppointment && (
            <div className="mt-6">
              <AppointmentViewer
                appointment={selectedAppointment}
                onEdit={() => handleEditClick(selectedAppointment)}
                onBack={handleBackClick}
                onRefresh={handleRefresh}
              />
            </div>
          )}

          {view === 'edit' && selectedAppointment && (
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <div className="mt-6">
                <AppointmentEditor
                  appointment={selectedAppointment}
                  volunteers={[]}
                  onBack={handleBackClick}
                  onSuccess={handleOperationSuccess}
                />
              </div>
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RendezVousLayout;

