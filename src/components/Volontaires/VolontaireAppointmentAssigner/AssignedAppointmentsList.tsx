import AppointmentItem from './AppointmentItem';

interface RendezVousData {
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  [key: string]: any;
}

interface VolunteerData {
  [key: string]: any;
}

interface AssignedAppointmentsListProps {
  appointments: RendezVousData[];
  onUnassignAppointment: (rdv: RendezVousData) => void;
  onUpdateComment: (rdv: RendezVousData, comment: string) => Promise<void>;
  onSwitch: (rdv: RendezVousData) => void;
  getAppointmentId: (rdv: RendezVousData) => string | number;
  getVolunteerInfo: (id: number) => Promise<VolunteerData>;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

const AssignedAppointmentsList = ({
  appointments,
  onUnassignAppointment,
  onUpdateComment,
  onSwitch,
  getAppointmentId,
  getVolunteerInfo,
  formatDate,
  formatTime,
  getStatusColor,
  loading = false
}: AssignedAppointmentsListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Rendez-vous actuels ({appointments.length})
        </h3>
        <p className="text-sm text-gray-600">Rendez-vous déjà assignés à ce volontaire dans cette étude</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun rendez-vous assigné dans cette étude
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((rdv: RendezVousData, index: number) => {
              const id = getAppointmentId(rdv);

              return (
                <AppointmentItem
                  key={`current-rdv-${id}-${index}`}
                  rdv={rdv}
                  isSelectable={false}
                  onUnassign={onUnassignAppointment}
                  onUpdateComment={onUpdateComment}
                  onSwitch={onSwitch}
                  getAppointmentId={getAppointmentId}
                  getVolunteerInfo={getVolunteerInfo}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusColor={getStatusColor}
                  loading={loading}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedAppointmentsList;