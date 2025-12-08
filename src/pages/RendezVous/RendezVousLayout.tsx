import { useState, lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentViewer from './AppointmentViewer';
import { useRendezVousContext } from './context/RendezVousContext';
import { Button } from '../../components/ui/button';
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
  const { t } = useTranslation();
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
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(true);
  };

  const handleBackClick = () => {
    setIsEditing(false);
    setView('calendar');
    setSelectedAppointment(null);
  };

  const handleEditBackClick = () => {
    setIsEditing(false);
  };

  const handleOperationSuccess = () => {
    requestRefresh();
    setIsEditing(false);
    setView('calendar');
    setSelectedAppointment(null);
  };

  const handleEditSuccess = () => {
    requestRefresh();
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  if (isLoading) {
    return (
      <div className="m-4 bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 bg-white rounded-lg border border-gray-200 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            {error.message || t('appointments.loadError')}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={handleRefresh} variant="default">
            {t('errors.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {t('appointments.title')}
          </h2>
        </div>
        <div className="p-6">
          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('appointments.calendar')}
              </TabsTrigger>
              <TabsTrigger value="byStudy" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                {t('appointments.byStudy')}
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('appointments.createOne')}
              </TabsTrigger>
              <TabsTrigger value="createBatch" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('appointments.createMultiple')}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                {view === 'calendar' && (
                  <div className="space-y-4">
                    <AppointmentCalendar {...({ onAppointmentClick: handleAppointmentClick } as any)} />
                  </div>
                )}

                {view === 'byStudy' && (
                  <div className="space-y-4">
                    <AppointmentsByStudy
                      {...({ studies, onAppointmentClick: handleAppointmentClick, onBack: handleBackClick } as any)}
                    />
                  </div>
                )}

                {view === 'create' && (
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
                )}

                {view === 'createBatch' && (
                  <div className="space-y-4">
                    <AppointmentBatchCreator
                      studies={studies as any}
                      selectedStudy={selectedStudy as any}
                      onStudySelect={handleStudySelect as any}
                      onBack={handleBackClick}
                      onSuccess={handleOperationSuccess}
                    />
                  </div>
                )}
              </Suspense>
            </div>
          </Tabs>

          {view === 'view' && selectedAppointment && !isEditing && (
            <div className="mt-6">
              <AppointmentViewer
                appointment={selectedAppointment}
                onEdit={() => handleEditClick(selectedAppointment)}
                onBack={handleBackClick}
                onRefresh={handleRefresh}
              />
            </div>
          )}

          {view === 'view' && selectedAppointment && isEditing && (
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <div className="mt-6">
                <AppointmentEditor
                  appointment={selectedAppointment}
                  volunteers={volunteers}
                  onBack={handleEditBackClick}
                  onSuccess={handleEditSuccess}
                />
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default RendezVousLayout;

