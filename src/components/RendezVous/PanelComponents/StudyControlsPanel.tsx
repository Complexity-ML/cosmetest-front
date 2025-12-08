import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Types
interface Study {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
}

interface Groupe {
  id?: number;
  idGroupe?: number;
  nom?: string;
  iv?: number;
}

interface GroupeDetails {
  iv?: number;
}

interface Stats {
  totalAppointments: number;
  unassignedAppointments: number;
  assignedAppointments: number;
  totalVolunteers: number;
  totalGroups: number;
}

interface StudyControlsPanelProps {
  studies: Study[];
  selectedEtudeId: number | null;
  onStudyChange: (value: string) => void;
  assignmentMode: string;
  onAssignmentModeChange: (value: string) => void;
  groupes: Groupe[];
  selectedGroupeId: number | null;
  onGroupeChange: (value: string) => void;
  selectedGroupeDetails: GroupeDetails | null;
  stats: Stats;
  disabled?: boolean;
}

const StudyControlsPanel = ({
  studies,
  selectedEtudeId,
  onStudyChange,
  assignmentMode,
  onAssignmentModeChange,
  groupes,
  selectedGroupeId,
  onGroupeChange,
  selectedGroupeDetails,
  stats,
  disabled,
}: StudyControlsPanelProps) => {
  const { t } = useTranslation();
  const orderedStudies = useMemo(() => {
    if (!Array.isArray(studies)) {
      return [];
    }
    return [...studies].reverse();
  }, [studies]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Mise en page à 3 colonnes (étude / groupe / mode) pour remplacer l'ancien layout à 4 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Sélection étude */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('appointments.selectStudy')}
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedEtudeId ?? ''}
            onChange={(event) => onStudyChange(event.target.value)}
            disabled={disabled}
          >
            <option value="">-- {t('studies.chooseStudy')} --</option>
            {orderedStudies.map((study) => (
              <option key={`study-${study.id ?? study.idEtude}`} value={study.id ?? study.idEtude}>
                {study.ref ?? 'N/A'} - {study.titre ?? t('studies.noTitle')}
              </option>
            ))}
          </select>
        </div>

        {selectedEtudeId && (
          <>
            {/* Groupe à assigner */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('appointments.groupToAssign')}
                {selectedGroupeDetails?.iv ? (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    {t('studies.visitAllowance')} : {selectedGroupeDetails.iv}
                  </span>
                ) : null}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedGroupeId ?? ''}
                onChange={(event) => onGroupeChange(event.target.value)}
                required
              >
                <option value="">-- {t('groups.chooseGroup')} --</option>
                {groupes.map((group: Groupe) => {
                  const id = group.id ?? group.idGroupe;
                  return (
                    <option key={`group-${id}`} value={id}>
                      {group.nom ?? `${t('groups.group')} ${id}`}
                      {group.iv !== undefined ? ` (${t('studies.visitAllowance')}: ${group.iv}€)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Mode d'assignation */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.assignmentMode')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={assignmentMode}
                onChange={(event) => onAssignmentModeChange(event.target.value)}
              >
                <option value="auto">{t('appointments.automatic')}</option>
                <option value="manual" disabled>
                  {t('appointments.manualToImplement')}
                </option>
              </select>
            </div>
          </>
        )}
      </div>

      {selectedEtudeId && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.totalAppointments')}</span>
            <span className="text-xl font-semibold text-gray-900">{stats.totalAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.appointmentsWithoutVolunteer')}</span>
            <span className="text-xl font-semibold text-orange-600">{stats.unassignedAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.appointmentsWithVolunteer')}</span>
            <span className="text-xl font-semibold text-green-600">{stats.assignedAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.totalVolunteers')}</span>
            <span className="text-xl font-semibold text-blue-600">{stats.totalVolunteers}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.availableGroups')}</span>
            <span className="text-xl font-semibold text-purple-600">{stats.totalGroups}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyControlsPanel;
