import { useMemo } from 'react';

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
            Sélectionner une étude
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedEtudeId ?? ''}
            onChange={(event) => onStudyChange(event.target.value)}
            disabled={disabled}
          >
            <option value="">-- Choisir une étude --</option>
            {orderedStudies.map((study) => (
              <option key={`study-${study.id ?? study.idEtude}`} value={study.id ?? study.idEtude}>
                {study.ref ?? 'N/A'} - {study.titre ?? 'Sans titre'}
              </option>
            ))}
          </select>
        </div>

        {selectedEtudeId && (
          <>
            {/* Groupe à assigner */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Groupe à assigner
                {selectedGroupeDetails?.iv ? (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    IV : {selectedGroupeDetails.iv}
                  </span>
                ) : null}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedGroupeId ?? ''}
                onChange={(event) => onGroupeChange(event.target.value)}
                required
              >
                <option value="">-- Choisir un groupe --</option>
                {groupes.map((group: Groupe) => {
                  const id = group.id ?? group.idGroupe;
                  return (
                    <option key={`group-${id}`} value={id}>
                      {group.nom ?? `Groupe ${id}`}
                      {group.iv !== undefined ? ` (IV: ${group.iv}€)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Mode d'assignation */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode d'assignation</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={assignmentMode}
                onChange={(event) => onAssignmentModeChange(event.target.value)}
              >
                <option value="auto">Automatique (1 volontaire par RDV)</option>
                <option value="manual" disabled>
                  Manuel (à implémenter)
                </option>
              </select>
            </div>
          </>
        )}
      </div>

      {selectedEtudeId && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <span className="block text-sm text-gray-500">Total RDV</span>
            <span className="text-xl font-semibold text-gray-900">{stats.totalAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">RDV sans volontaire</span>
            <span className="text-xl font-semibold text-orange-600">{stats.unassignedAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">RDV avec volontaire</span>
            <span className="text-xl font-semibold text-green-600">{stats.assignedAppointments}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">Volontaires totaux</span>
            <span className="text-xl font-semibold text-blue-600">{stats.totalVolunteers}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">Groupes disponibles</span>
            <span className="text-xl font-semibold text-purple-600">{stats.totalGroups}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyControlsPanel;
