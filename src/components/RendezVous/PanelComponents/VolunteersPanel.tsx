import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  [key: string]: any;
}

interface VolunteersPanelProps {
  volunteers: Volunteer[];
  selectedVolunteers: Volunteer[];
  onSelectVolunteer: (volunteer: Volunteer) => void;
  onSelectAll: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  volunteerFilterOption: string;
  onVolunteerFilterChange: (value: string) => void;
  getVolunteerAppointmentCount?: (id: number | undefined) => number;
}

const getVolunteerId = (volunteer: Volunteer) => volunteer?.id ?? volunteer?.volontaireId ?? null;

const VolunteersPanel = ({
  volunteers,
  selectedVolunteers,
  onSelectVolunteer,
  onSelectAll,
  searchQuery,
  onSearchQueryChange,
  volunteerFilterOption,
  onVolunteerFilterChange,
  getVolunteerAppointmentCount,
}: VolunteersPanelProps) => {
  const selectedIds = new Set(selectedVolunteers.map((volunteer) => getVolunteerId(volunteer)));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Volontaires ({volunteers.length})</CardTitle>
          <Select value={volunteerFilterOption} onValueChange={onVolunteerFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="noAppointments">Sans RDV</SelectItem>
              <SelectItem value="hasAppointments">Avec RDV déjà</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Rechercher un volontaire..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{selectedVolunteers.length} sélectionné(s)</span>
          <Button
            type="button"
            onClick={onSelectAll}
            variant="outline"
            size="sm"
            disabled={volunteers.length === 0}
          >
            Sélectionner tous
          </Button>
        </div>
      </CardHeader>

      <CardContent className="max-h-96 overflow-y-auto p-0">
        {volunteers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucun volontaire trouvé</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {volunteers.map((volunteer) => {
              const id = getVolunteerId(volunteer);
              const isSelected = selectedIds.has(id);
              const appointmentCount = getVolunteerAppointmentCount?.(id ?? undefined) ?? 0;

              return (
                <div
                  key={`volunteer-${id}`}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => onSelectVolunteer(volunteer)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectVolunteer(volunteer)}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {volunteer.prenom} {volunteer.nom}
                      </div>
                      <div className="text-xs text-gray-500">
                        {volunteer.email ?? 'Pas d\'email'}
                        {appointmentCount > 0 ? (
                          <span className="ml-2 text-blue-600">• {appointmentCount} RDV</span>
                        ) : (
                          <span className="ml-2 text-gray-400">• Aucun RDV</span>
                        )}
                      </div>
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

export default VolunteersPanel;
