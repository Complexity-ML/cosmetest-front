import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppointmentDetailsCard, AppointmentActions } from '../../components/RendezVous/AppointmentComponents/index';
import { VolunteerAssignmentCard } from '../../components/RendezVous/AssignmentComponents/index';
import useAppointmentDetails from './hooks/useAppointmentDetails';

// Type definitions
interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  idVolontaire?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  [key: string]: any;
}

interface AppointmentViewerProps {
  appointment: Appointment | null;
  onEdit?: (appointment: Appointment) => void;
  onBack?: () => void;
  onRefresh?: () => void;
}

const AppointmentViewer: React.FC<AppointmentViewerProps> = ({ appointment, onEdit, onBack, onRefresh }) => {
  const { t } = useTranslation();
  const {
    appointment: currentAppointment,
    group,
    volunteer,
    volunteerOptions,
    loading,
    assigning,
    deleting,
    error,
    assignVolunteer,
    unassignVolunteer,
    deleteAppointment,
  } = useAppointmentDetails(appointment);

  const handleAssignVolunteer = useCallback(
    async (volunteerId: number | string) => {
      await assignVolunteer({ volunteerId });
      onRefresh?.();
    },
    [assignVolunteer, onRefresh],
  );

  const handleUnassignVolunteer = useCallback(
    async () => {
      await unassignVolunteer();
      onRefresh?.();
    },
    [unassignVolunteer, onRefresh],
  );

  const handleDelete = useCallback(async () => {
    const confirmation = window.confirm(t('appointments.deleteConfirm'));
    if (!confirmation) {
      return;
    }

    await deleteAppointment();
    onRefresh?.();
    onBack?.();
  }, [deleteAppointment, onBack, onRefresh, t]);

  if (loading && !currentAppointment) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">{t('appointments.loadError')}</p>
        <p className="text-sm mt-1">{error.message ?? t('errors.unknownError')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-3 py-1 border border-red-400 rounded-md text-sm"
        >
          {t('appointments.reloadPage')}
        </button>
      </div>
    );
  }

  if (!currentAppointment) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        {t('appointments.noAppointmentSelected')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AppointmentActions
        onBack={onBack || (() => {})}
        onEdit={() => onEdit?.(currentAppointment)}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <AppointmentDetailsCard appointment={currentAppointment} group={group ?? undefined} />

      <VolunteerAssignmentCard
        volunteer={volunteer}
        volunteers={volunteerOptions}
        group={group}
        assigning={assigning}
        onAssign={handleAssignVolunteer}
        onUnassign={handleUnassignVolunteer}
        etudeId={currentAppointment?.idEtude}
      />
    </div>
  );
};

export default AppointmentViewer;

