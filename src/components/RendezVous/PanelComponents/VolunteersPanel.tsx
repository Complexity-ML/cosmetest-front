import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const selectedIds = new Set(selectedVolunteers.map((volunteer) => getVolunteerId(volunteer)));

  return (
    <div className="border rounded-lg">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('volunteers.title')} ({volunteers.length})</h3>
          <Select value={volunteerFilterOption} onValueChange={onVolunteerFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="noAppointments">{t('appointments.withoutAppointments')}</SelectItem>
              <SelectItem value="hasAppointments">{t('appointments.withAppointments')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder={t('appointments.searchVolunteerPlaceholder')}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{selectedVolunteers.length} {t('common.selected')}</span>
          <Button
            type="button"
            onClick={onSelectAll}
            variant="outline"
            size="sm"
            disabled={volunteers.length === 0}
          >
            {t('common.selectAll')}
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-0">
        {volunteers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{t('volunteers.noVolunteerFound')}</div>
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
                        {volunteer.email ?? t('volunteers.noEmail')}
                        {appointmentCount > 0 ? (
                          <span className="ml-2 text-blue-600">• {appointmentCount} {t('appointments.rdvCount')}</span>
                        ) : (
                          <span className="ml-2 text-gray-400">• {t('appointments.noAppointment')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteersPanel;
