// hooks/useVolunteerNotifications.ts
import { useNotifications } from './useNotifications';

export interface AppointmentDetails {
  date: string;
  [key: string]: any;
}

export interface UseVolunteerNotificationsReturn {
  notifyVolunteerAdded: (volunteerName?: string) => void;
  notifyAppointmentScheduled: (details: AppointmentDetails) => void;
  notifyStudyCreated: (studyName: string) => void;
}

export const useVolunteerNotifications = (): UseVolunteerNotificationsReturn => {
  const { addNotification } = useNotifications();

  const notifyVolunteerAdded = (volunteerName: string = 'Anonyme'): void => {
    addNotification({
      type: 'volunteer_added',
      title: 'Nouveau volontaire',
      message: `${volunteerName} s'est inscrit comme volontaire`,
      icon: 'user-plus',
      priority: 'normal'
    });
  };

  const notifyAppointmentScheduled = (details: AppointmentDetails): void => {
    addNotification({
      type: 'appointment_scheduled',
      title: 'Rendez-vous planifié',
      message: `Nouveau RDV planifié pour ${details.date}`,
      icon: 'calendar-plus',
      priority: 'high'
    });
  };

  const notifyStudyCreated = (studyName: string): void => {
    addNotification({
      type: 'study_created',
      title: 'Nouvelle étude',
      message: `L'étude "${studyName}" a été créée`,
      icon: 'file-text',
      priority: 'normal'
    });
  };

  return {
    notifyVolunteerAdded,
    notifyAppointmentScheduled,
    notifyStudyCreated
  };
};

export default useVolunteerNotifications;
