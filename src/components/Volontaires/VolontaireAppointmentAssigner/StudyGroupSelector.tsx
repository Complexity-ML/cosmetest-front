import { useTranslation } from 'react-i18next';

interface EtudeData {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
  [key: string]: any;
}

interface GroupeData {
  nom?: string;
  iv?: number;
  [key: string]: any;
}

interface RendezVousData {
  [key: string]: any;
}

interface StudyGroupSelectorProps {
  etudes: EtudeData[];
  selectedEtudeId: number | null;
  onEtudeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  groupes: GroupeData[];
  selectedGroupeId: number | null;
  onGroupeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedGroupeDetails: GroupeData | null;
  getGroupeId: (groupe: GroupeData) => string | number;
  appointments: RendezVousData[];
  availableAppointments: RendezVousData[];
  volunteerCurrentAppointments: RendezVousData[];
  loading?: boolean;
}

const StudyGroupSelector = ({
  etudes,
  selectedEtudeId,
  onEtudeChange,
  groupes,
  selectedGroupeId,
  onGroupeChange,
  selectedGroupeDetails,
  getGroupeId,
  appointments,
  availableAppointments,
  volunteerCurrentAppointments,
  loading = false
}: StudyGroupSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.selectStudy')}</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedEtudeId || ''}
            onChange={onEtudeChange}
            disabled={loading}
          >
            <option value="">-- {t('appointments.chooseStudy')} --</option>
            {[...etudes].reverse().map((etude: EtudeData) => (
              <option key={`etude-${etude.id || etude.idEtude}`} value={etude.id || etude.idEtude}>
                {etude.ref || 'N/A'} - {etude.titre || t('appointments.noTitle')}
              </option>
            ))}
          </select>
        </div>

        {selectedEtudeId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('appointments.groupToAssign')}
              {selectedGroupeDetails && selectedGroupeDetails.iv !== undefined && selectedGroupeDetails.iv > 0 && (
                <span className="ml-2 text-sm text-green-600 font-medium">
                  IV: {selectedGroupeDetails.iv}€
                </span>
              )}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedGroupeId || ''}
              onChange={onGroupeChange}
              required
            >
              <option value="">-- {t('appointments.chooseGroup')} --</option>
              {groupes.map((groupe: GroupeData, index: number) => (
                <option key={`groupe-${getGroupeId(groupe)}-${index}`} value={getGroupeId(groupe)}>
                  {groupe.nom || `${t('appointments.group')} ${getGroupeId(groupe)}`}
                  {groupe.iv !== undefined && ` (IV: ${groupe.iv}€)`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {selectedEtudeId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.totalAppointments')}</span>
            <span className="text-xl font-semibold text-gray-900">{appointments.length}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.availableAppointments')}</span>
            <span className="text-xl font-semibold text-green-600">{availableAppointments.length}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.volunteerAppointments')}</span>
            <span className="text-xl font-semibold text-blue-600">{volunteerCurrentAppointments.length}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">{t('appointments.availableGroups')}</span>
            <span className="text-xl font-semibold text-purple-600">{groupes.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupSelector;