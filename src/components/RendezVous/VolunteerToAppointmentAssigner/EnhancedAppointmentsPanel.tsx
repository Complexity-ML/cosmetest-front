import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import volontaireService from '../../../services/volontaireService';
import { timeToMinutes, normalizeTime } from '../../../utils/timeUtils';

interface Appointment {
  idRdv?: number;
  id?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  idVolontaire?: number;
  prenomVol?: string;
  nomVol?: string;
  prenomVolontaire?: string;
  nomVolontaire?: string;
  volontaire?: {
    id?: number;
    prenomVol?: string;
    nomVol?: string;
    prenom?: string;
    nom?: string;
  };
}

interface VolunteerInfo {
  prenomVol?: string;
  nomVol?: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  civilite?: string;
}

interface EnhancedAppointmentsPanelProps {
  appointments: Appointment[];
  selectedAppointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectAllAppointments: () => void;
  onUnassignSingle?: (appointment: Appointment) => void;
  onSwitch?: (appointment: Appointment) => void;
}

const EnhancedAppointmentsPanel: React.FC<EnhancedAppointmentsPanelProps> = ({
  appointments,
  selectedAppointments,
  onSelectAppointment,
  onSelectAllAppointments,
  onUnassignSingle,
  onSwitch,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('time');
  const [selectedDate, setSelectedDate] = useState('');
  const [volunteerCache, setVolunteerCache] = useState<Record<number, VolunteerInfo>>({});

  // Fonction pour récupérer les infos d'un volontaire avec cache
  const getVolunteerInfo = async (volunteerIdToFetch: number): Promise<VolunteerInfo | null> => {
    if (!volunteerIdToFetch) return null;

    // Vérifier le cache d'abord
    if (volunteerCache[volunteerIdToFetch]) {
      return volunteerCache[volunteerIdToFetch];
    }

    try {
      const response = await volontaireService.getDetails(volunteerIdToFetch);
      const volunteerInfo: VolunteerInfo = response.data || response;

      // Mettre en cache
      setVolunteerCache(prev => ({
        ...prev,
        [volunteerIdToFetch]: volunteerInfo
      }));

      return volunteerInfo;
    } catch (err) {
      console.error(`Erreur lors de la récupération du volontaire ${volunteerIdToFetch}:`, err);
      return null;
    }
  };

  // Fonctions utilitaires
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      return dateString || t('appointments.dateUnknown');
    }
  };

  const formatTime = (timeString: string): string => {
    return timeString || t('appointments.timeUnknown');
  };

  const getStatusColor = (status?: string): string => {
    switch ((status ?? '').toUpperCase()) {
      case 'CONFIRME':
        return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
      case 'COMPLETE':
        return 'bg-blue-100 text-blue-800';
      case 'PLANIFIE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentId = (appointment: Appointment): number | null => appointment?.idRdv ?? appointment?.id ?? null;

  // time helpers importés depuis utils/timeUtils

  // Extraire les dates uniques disponibles
  const getAvailableDates = (): string[] => {
    const dates = [...new Set(appointments.map(rdv => rdv.date).filter((date): date is string => typeof date === 'string'))];
    return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  // Filtrage et tri des rendez-vous
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(rdv => {
        // Filtre par date sélectionnée
        if (selectedDate && rdv.date !== selectedDate) {
          return false;
        }

        // Filtre par recherche
        if (searchQuery.trim() === '') return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          (rdv.date && formatDate(rdv.date).toLowerCase().includes(searchLower)) ||
          (rdv.heure && formatTime(rdv.heure).toLowerCase().includes(searchLower)) ||
          (rdv.etat || '').toLowerCase().includes(searchLower) ||
          (rdv.commentaires || '').toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        // Si aucune date sélectionnée, trier par date d'abord
        if (!selectedDate && a.date && b.date) {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;
        }

        // Tri principal par heure (chronologique) - FORCÉ
        const timeA = timeToMinutes(a.heure || '');
        const timeB = timeToMinutes(b.heure || '');

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
  }, [appointments, selectedDate, searchQuery, sortOption]);

  // Grouper les rendez-vous par heure quand une date est sélectionnée
  const groupedAppointments = useMemo(() => {
    if (!selectedDate) return null;

    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(rdv => {
      const time = rdv.heure ? normalizeTime(rdv.heure) : t('appointments.timeUnknown');
      if (!groups[time]) {
        groups[time] = [];
      }
      groups[time].push(rdv);
    });

    return Object.entries(groups).sort(([timeA], [timeB]) =>
      timeToMinutes(timeA) - timeToMinutes(timeB)
    );
  }, [filteredAppointments, selectedDate]);

  const selectedIds = useMemo(() =>
    new Set(selectedAppointments.map(item => getAppointmentId(item))),
    [selectedAppointments]
  );

  const availableDates = getAvailableDates();

  // Composant pour afficher un rendez-vous
  const AppointmentItem = ({ rdv }: { rdv: Appointment }) => {
    const appointmentId = getAppointmentId(rdv);
    const isSelected = selectedIds.has(appointmentId);
    const [volunteerInfo, setVolunteerInfo] = useState<VolunteerInfo | null>(null);

    // Charger les infos du volontaire si assigné
    React.useEffect(() => {
      const loadVolunteerInfo = async () => {
        const volunteerId = rdv.idVolontaire || rdv.volontaire?.id;
        if (volunteerId) {
          const info = await getVolunteerInfo(volunteerId);
          setVolunteerInfo(info);
        }
      };
      loadVolunteerInfo();
    }, [rdv.idVolontaire, rdv.volontaire]);

    return (
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSelectAppointment(rdv)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-gray-900">
                {!selectedDate && rdv.date && formatDate(rdv.date)} {rdv.heure && formatTime(rdv.heure)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rdv.etat)}`}>
                {rdv.etat || 'PLANIFIE'}
              </span>
              {(rdv.idVolontaire || rdv.volontaire) && (
                <>
                  {onSwitch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitch(rdv);
                      }}
                      className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                      title={t('appointments.switchWith')}
                    >
                      {t('appointments.switch')}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUnassignSingle) {
                        onUnassignSingle(rdv);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    title={t('appointments.unassignTooltip')}
                  >
                    {t('appointments.unassign')}
                  </button>
                </>
              )}
            </div>

            {volunteerInfo ? (
              <div className="text-sm text-green-600 mb-1 flex items-center justify-between">
                {(() => {
                  const first = volunteerInfo.prenomVol || volunteerInfo.prenom || volunteerInfo.firstName || '';
                  const last = volunteerInfo.nomVol || volunteerInfo.nom || volunteerInfo.lastName || '';
                  const civ = volunteerInfo.civilite ? `${volunteerInfo.civilite} ` : '';
                  const label = `${civ}${first} ${last}`.trim();
                  const volunteerId = rdv.idVolontaire || rdv.volontaire?.id;
                  return (
                    <Link
                      to={`/volontaires/${volunteerId}`}
                      state={{ activeTab: 'info' }}
                      className="hover:underline hover:text-green-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      👤 {label || t('appointments.volunteer')}
                    </Link>
                  );
                })()}
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{t('appointments.assigned')}</span>
              </div>
            ) : rdv.idVolontaire || rdv.volontaire ? (
              <div className="text-sm text-orange-600 mb-1 flex items-center justify-between">
                {(() => {
                  const first = rdv.prenomVol || rdv.prenomVolontaire || rdv.volontaire?.prenomVol || rdv.volontaire?.prenom || '';
                  const last = rdv.nomVol || rdv.nomVolontaire || rdv.volontaire?.nomVol || rdv.volontaire?.nom || '';
                  const idPart = rdv.idVolontaire || rdv.volontaire?.id;
                  const label = (first || last) ? `${first} ${last}`.trim() : `${t('appointments.volunteer')} ID: ${idPart}`;
                  return (
                    <Link
                      to={`/volontaires/${idPart}`}
                      state={{ activeTab: 'info' }}
                      className="hover:underline hover:text-orange-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      👤 {label}
                    </Link>
                  );
                })()}
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">{t('appointments.loadingInProgress')}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                <span>👤 {t('appointments.notAssigned')}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{t('appointments.available')}</span>
              </div>
            )}

            {rdv.commentaires && (
              <div className="text-sm text-gray-600 italic">
                💭 {rdv.commentaires}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête avec filtres */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('appointments.appointmentsCount')} ({filteredAppointments.length})
            {selectedDate && <span className="text-blue-600 ml-2">- {formatDate(selectedDate)}</span>}
          </h2>
          <select
            className="text-sm px-2 py-1 border border-gray-300 rounded"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="time">{t('appointments.sortByTime')}</option>
            <option value="status">{t('appointments.thenByStatus')}</option>
            <option value="comment">{t('appointments.thenByComment')}</option>
          </select>
        </div>

        {/* Sélecteur de date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('appointments.filterByDate')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedDate('')}
              className={`px-3 py-2 text-sm rounded border ${
                !selectedDate
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('appointments.allDates')}
            </button>
            {availableDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-2 text-sm rounded border ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder={t('appointments.searchPlaceholderAppointments')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedAppointments.length} {t('appointments.selected')}
          </span>
          <button
            onClick={onSelectAllAppointments}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            disabled={filteredAppointments.length === 0}
          >
            {t('appointments.selectAll')}
          </button>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {t('appointments.noAppointmentsFound')}
          </div>
        ) : selectedDate && groupedAppointments ? (
          // Affichage groupé par heure quand une date est sélectionnée
          <div className="space-y-4">
            {groupedAppointments.map(([time, appointments]) => (
              <div key={time}>
                <h4 className="font-medium text-gray-700 mb-2 border-b pb-1">
                  🕐 {time} ({appointments.length} {t('appointments.rdvLabel')})
                </h4>
                <div className="space-y-2 ml-4">
                  {appointments.map(rdv => (
                    <AppointmentItem key={getAppointmentId(rdv)} rdv={rdv} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Affichage normal
          <div className="space-y-2">
            {filteredAppointments.map(rdv => (
              <AppointmentItem key={getAppointmentId(rdv)} rdv={rdv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAppointmentsPanel;
