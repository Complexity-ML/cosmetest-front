import AppointmentFilter from './AppointmentFilter';
import AppointmentItem from './AppointmentItem';
import { timeToMinutes, normalizeTime } from '../../../utils/timeUtils';

interface RendezVousData {
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  volontaire?: any;
  [key: string]: any;
}

interface VolunteerData {
  [key: string]: any;
}

interface AvailableAppointmentsListProps {
  appointments: RendezVousData[];
  selectedAppointments: RendezVousData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  availableDates: string[];
  onSelectAppointment: (rdv: RendezVousData) => void;
  onSelectAllAppointments: () => void;
  onUpdateComment: (rdv: RendezVousData, comment: string) => Promise<void>;
  onSwitch: (rdv: RendezVousData) => void;
  getAppointmentId: (rdv: RendezVousData) => string | number;
  getVolunteerInfo: (id: number) => Promise<VolunteerData>;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

const AvailableAppointmentsList = ({
  appointments,
  selectedAppointments,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  selectedDate,
  setSelectedDate,
  availableDates,
  onSelectAppointment,
  onSelectAllAppointments,
  onUpdateComment,
  onSwitch,
  getAppointmentId,
  getVolunteerInfo,
  formatDate,
  formatTime,
  getStatusColor,
  loading = false
}: AvailableAppointmentsListProps) => {
  // time helpers importés depuis utils/timeUtils

  // Filtrage et tri des rendez-vous disponibles
  const filteredAppointments = appointments
    .filter((rdv: RendezVousData) => {
      // Filtre par date sélectionnée
      if (selectedDate && rdv.date !== selectedDate) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery.trim() === '') return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        formatDate(rdv.date || '').toLowerCase().includes(searchLower) ||
        formatTime(rdv.heure || '').toLowerCase().includes(searchLower) ||
        (rdv.etat || '').toLowerCase().includes(searchLower) ||
        (rdv.commentaires || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a: RendezVousData, b: RendezVousData) => {
      // Debug tri (désactiver si trop verbeux)
      // console.log('Tri - A:', a.heure, 'minutes:', timeToMinutes(a.heure), '- B:', b.heure, 'minutes:', timeToMinutes(b.heure));

      // Si aucune date sélectionnée, trier par date d'abord
      if (!selectedDate) {
        const dateCompare = new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        if (dateCompare !== 0) return dateCompare;
      }

      // Tri principal par heure (chronologique) - FORCÉ
      const timeA = timeToMinutes(a.heure || '');
      const timeB = timeToMinutes(b.heure || '');

      // console.log(`Comparaison: ${a.heure} (${timeA}) vs ${b.heure} (${timeB}) = ${timeA - timeB}`);

      if (timeA !== timeB) return timeA - timeB;

      // En cas d'égalité d'heure, trier selon l'option choisie
      switch (sortOption) {
        case 'status':
          return (a.etat || '').localeCompare(b.etat || '');
        case 'comment':
          return (a.commentaires || '').localeCompare(b.commentaires || '');
        default:
          return 0;
      }
    });

  const selectedCount = selectedAppointments.length;

  // Compter uniquement les RDV disponibles (non assignés)
  const availableCount = filteredAppointments.filter(
    (rdv: RendezVousData) => !rdv.volontaire && !rdv.idVolontaire
  ).length;

  // Regrouper les rendez-vous par heure
  const groupedByTime = filteredAppointments.reduce((groups: { [key: string]: RendezVousData[] }, rdv: RendezVousData) => {
    const normalizedTime = normalizeTime(rdv.heure || '');
    if (!groups[normalizedTime]) {
      groups[normalizedTime] = [];
    }
    groups[normalizedTime].push(rdv);
    return groups;
  }, {} as { [key: string]: RendezVousData[] });

  // Trier les heures
  const sortedTimeGroups = Object.keys(groupedByTime).sort((a, b) => {
    return timeToMinutes(a) - timeToMinutes(b);
  });

  // console.log('Groupes triés par heure:', sortedTimeGroups);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <AppointmentFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableDates={availableDates}
        formatDate={formatDate}
        selectedCount={selectedCount}
        totalCount={filteredAppointments.length}
        availableCount={availableCount}
        onSelectAll={onSelectAllAppointments}
        disabled={loading}
      />

      <div className="max-h-96 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun rendez-vous disponible
          </div>
        ) : (
          <div>
            {sortedTimeGroups.map((timeGroup) => (
              <div key={timeGroup} className="border-b border-gray-100 last:border-b-0">
                {/* En-tête de groupe d'heure */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-700">
                      🕐 {timeGroup}
                    </h4>
                    <div className="text-xs text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {groupedByTime[timeGroup].length} RDV
                      </span>
                      <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                        {groupedByTime[timeGroup].filter((rdv: RendezVousData) => !rdv.volontaire && !rdv.idVolontaire).length} disponibles
                      </span>
                      <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {groupedByTime[timeGroup].filter((rdv: RendezVousData) => rdv.volontaire || rdv.idVolontaire).length} assignés
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rendez-vous de cette heure */}
                <div className="divide-y divide-gray-100">
                  {groupedByTime[timeGroup].map((rdv: RendezVousData, index: number) => {
                    const id = getAppointmentId(rdv);
                    const isSelected = selectedAppointments.some((selected: RendezVousData) => getAppointmentId(selected) === id);

                    return (
                      <AppointmentItem
                        key={`rdv-${timeGroup}-${id}-${index}`}
                        rdv={rdv}
                        isSelectable={true}
                        isSelected={isSelected}
                        onSelect={onSelectAppointment}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableAppointmentsList;
