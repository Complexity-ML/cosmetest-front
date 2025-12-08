import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';


interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  titre?: string;
  email?: string;
  [key: string]: any;
}

interface VolunteerAssignmentCardProps {
  volunteer?: Volunteer | null;
  volunteers: Volunteer[];
  assigning: boolean;
  onAssign: (volunteerId: string) => Promise<void>;
  onUnassign: () => void;
}

const getVolunteerId = (volunteer?: Volunteer | null): number | undefined => volunteer?.id ?? volunteer?.volontaireId;

const VolunteerAssignmentCard = ({ volunteer, volunteers, assigning, onAssign, onUnassign }: VolunteerAssignmentCardProps) => {
  const [isSelectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSelectorOpen) {
      setSelectedVolunteerId('');
      setSearchTerm('');
    }
  }, [isSelectorOpen]);

  const filteredVolunteers = useMemo(() => {
    if (!Array.isArray(volunteers)) {
      return [];
    }

    const value = searchTerm.trim().toLowerCase();
    if (!value) {
      return volunteers.slice(0, 50);
    }

    return volunteers
      .filter((item) => {
        const target = `${item.prenom ?? ''} ${item.nom ?? ''} ${item.email ?? ''}`.toLowerCase();
        return target.includes(value);
      })
      .slice(0, 50);
  }, [searchTerm, volunteers]);

  const handleAssign = async () => {
    if (!selectedVolunteerId) {
      return;
    }
    await onAssign(selectedVolunteerId);
    setSelectorOpen(false);
  };

  const { t } = useTranslation();
  const volunteerId = getVolunteerId(volunteer);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('appointments.volunteer')}</h3>
        {volunteer && (
          <Button
            type="button"
            onClick={onUnassign}
            disabled={assigning}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            {t('appointments.unassign')}
          </Button>
        )}
      </div>

      <div>
        {volunteer ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              {volunteer.titre ? `${volunteer.titre} ` : ''}
              {volunteer.prenom} {volunteer.nom}
            </p>
            {volunteer.email && <p className="text-xs text-gray-500">{volunteer.email}</p>}
            <div className="text-xs text-gray-500">{t('volunteers.identifier')} : {volunteerId}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('appointments.noVolunteerAssignedToAppointment')}</p>
        )}

        <div className="flex flex-col gap-2 mt-4" ref={selectorRef}>
          <Button
            type="button"
            onClick={() => setSelectorOpen((prev) => !prev)}
            variant="outline"
            disabled={assigning}
          >
            {volunteer ? t('appointments.changeVolunteer') : t('appointments.assignVolunteer')}
          </Button>

          {isSelectorOpen && (
            <div className="border border-gray-200 rounded-md p-3 space-y-3">
              <div>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('appointments.searchVolunteerPlaceholder')}
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-md divide-y">
                {filteredVolunteers.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">{t('common.noResults')}</div>
                ) : (
                  filteredVolunteers.map((item) => {
                    const id = getVolunteerId(item);
                    const isSelected = `${id}` === selectedVolunteerId;

                    return (
                      <Button
                        key={id}
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedVolunteerId(`${id}`)}
                        className={`w-full justify-start text-left ${isSelected ? 'bg-blue-50 text-blue-700' : ''}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.prenom} {item.nom}</span>
                          {item.email && <span className="text-xs text-gray-500">{item.email}</span>}
                        </div>
                      </Button>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAssign}
                  disabled={!selectedVolunteerId || assigning}
                  className="flex-1"
                >
                  {t('appointments.assign')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setSelectorOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignmentCard;
