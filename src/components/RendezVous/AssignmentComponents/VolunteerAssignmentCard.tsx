import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import StudyOverlapAlert from './StudyOverlapAlert';


interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  titre?: string;
  email?: string;
  ethnie?: string;
  [key: string]: any;
}

interface Group {
  id?: number;
  idGroupe?: number;
  nom?: string;
  ethnie?: string;
  [key: string]: any;
}

interface VolunteerAssignmentCardProps {
  volunteer?: Volunteer | null;
  volunteers: Volunteer[];
  group?: Group | null;
  assigning: boolean;
  onAssign: (volunteerId: string) => Promise<void>;
  onUnassign: () => void;
  etudeId?: number | string;
}

/**
 * Vérifie si l'ethnie du volontaire correspond aux critères d'ethnie du groupe
 */
const checkEthnicityMatch = (groupEthnie: string | undefined, volunteerEthnie: string | undefined): boolean => {
  if (!groupEthnie || groupEthnie.trim() === '') {
    return true;
  }
  if (!volunteerEthnie || volunteerEthnie.trim() === '') {
    return false;
  }
  const normalizedVolunteerEthnie = volunteerEthnie.trim().toLowerCase();
  const groupEthnies = groupEthnie.split(';').map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0);
  if (groupEthnies.length === 0) {
    return true;
  }
  return groupEthnies.some((ge) => normalizedVolunteerEthnie.includes(ge) || ge.includes(normalizedVolunteerEthnie));
}

const getVolunteerId = (volunteer?: Volunteer | null): number | undefined => volunteer?.id ?? volunteer?.volontaireId;

const VolunteerAssignmentCard = ({ volunteer, volunteers, group, assigning, onAssign, onUnassign, etudeId }: VolunteerAssignmentCardProps) => {
  const { t } = useTranslation();
  const [isSelectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
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

    // Vérifier la correspondance d'ethnie avec le groupe
    if (group?.ethnie) {
      const selectedVolunteer = volunteers.find((v) => `${getVolunteerId(v)}` === selectedVolunteerId);
      if (selectedVolunteer) {
        const ethnicityMatches = checkEthnicityMatch(group.ethnie, selectedVolunteer.ethnie);
        if (!ethnicityMatches) {
          const volunteerName = `${selectedVolunteer.prenom || ''} ${selectedVolunteer.nom || ''}`.trim() || t('appointments.thisVolunteer');
          const volunteerEthnie = selectedVolunteer.ethnie || t('appointments.ethnicityNotDefined');
          const groupEthnie = group.ethnie;

          const proceed = window.confirm(
            `${t('appointments.ethnicityWarningTitle')}\n\n` +
            `${t('appointments.ethnicityWarningMessage', { volunteerName, volunteerEthnie, groupEthnie })}\n\n` +
            `${t('appointments.ethnicityWarningConfirm')}`
          );

          if (!proceed) {
            return;
          }
        }
      }
    }

    await onAssign(selectedVolunteerId);
    setSelectorOpen(false);
  };

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

            {/* Alerte de chevauchement d'études */}
            {etudeId && volunteerId && (
              <div className="mt-3">
                <StudyOverlapAlert
                  volontaireId={volunteerId}
                  targetEtudeId={etudeId}
                  showInlineAlert={true}
                  autoCheck={true}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('appointments.noVolunteerAssignedToAppointment')}</p>
        )}

        <div className="flex flex-col gap-2 mt-4">
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
