import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Appointment {
  idRdv?: number;
  id?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  idVolontaire?: number;
  volontaire?: {
    prenom?: string;
    nom?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AppointmentsPanelProps {
  appointments: Appointment[];
  actionMode: 'assign' | 'unassign';
  filterOption: string;
  onFilterChange: (value: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
  selectedAppointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectAllAppointments: () => void;
  onUnassignSingle: (appointment: Appointment) => void;
}

const formatDate = (value?: string) => {
  if (!value) return 'Date inconnue';
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (error) {
    return value;
  }
};

const formatTime = (value?: string) => value ?? 'Heure inconnue';

const getStatusColor = (status?: string) => {
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

const getAppointmentId = (appointment: Appointment) => appointment?.idRdv ?? appointment?.id ?? null;

const AppointmentsPanel = ({
  appointments,
  actionMode,
  filterOption,
  onFilterChange,
  sortOption,
  onSortChange,
  selectedAppointments,
  onSelectAppointment,
  onSelectAllAppointments,
  onUnassignSingle,
}: AppointmentsPanelProps) => {
  const selectedIds = useMemo(() => new Set(selectedAppointments.map((item) => getAppointmentId(item))), [selectedAppointments]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CardTitle>Rendez-vous ({appointments.length})</CardTitle>
            <Badge variant={actionMode === 'assign' ? 'default' : 'destructive'}>
              {actionMode === 'assign' ? 'Mode assignation' : 'Mode désassignation'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filterOption} onValueChange={onFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unassigned">Sans volontaire</SelectItem>
                <SelectItem value="assigned">Avec volontaire</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Trier par date</SelectItem>
                <SelectItem value="time">Trier par heure</SelectItem>
                <SelectItem value="status">Trier par statut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedAppointments.length} sélectionné(s)
          </span>
          <Button
            type="button"
            onClick={onSelectAllAppointments}
            variant="outline"
            size="sm"
          >
            {actionMode === 'assign'
              ? 'Sélectionner tous (sans volontaire)'
              : 'Sélectionner tous (avec volontaire)'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="max-h-96 overflow-y-auto p-0">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucun rendez-vous trouvé</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const id = getAppointmentId(appointment);
              const hasVolunteer = Boolean(appointment.volontaire || appointment.idVolontaire);
              const isSelected = selectedIds.has(id);
              const canSelect =
                (actionMode === 'assign' && !hasVolunteer) || (actionMode === 'unassign' && hasVolunteer);

              return (
                <div
                  key={`appointment-${id}`}
                  className={`p-3 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${
                    canSelect ? 'cursor-pointer' : 'opacity-60'
                  }`}
                  onClick={() => canSelect && onSelectAppointment(appointment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => canSelect && onSelectAppointment(appointment)}
                        onClick={(event) => event.stopPropagation()}
                        disabled={!canSelect}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.date)} à {formatTime(appointment.heure)}
                        </div>
                        <div className="text-xs text-gray-500">
                          RDV #{appointment.idRdv ?? appointment.id}
                          {appointment.commentaires ? ` • ${appointment.commentaires}` : ''}
                        </div>
                        {hasVolunteer && appointment.volontaire && (
                          <div className="text-xs text-gray-500 mt-1">
                            Volontaire : {appointment.volontaire.prenom} {appointment.volontaire.nom}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.etat)}>
                        {appointment.etat ?? 'STATUT ?'}
                      </Badge>
                      {actionMode === 'unassign' && hasVolunteer && (
                        <Button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUnassignSingle(appointment);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Désassigner
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsPanel;
