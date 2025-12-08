import React from 'react';
import { useTranslation } from 'react-i18next';
import { GroupeData } from '../../../types/etude.types';

interface AssignmentSummaryProps {
  visible: boolean;
  actionMode: 'assign' | 'unassign';
  assignmentMode: 'manual' | 'auto';
  selectedAppointmentsCount: number;
  selectedVolunteersCount: number;
  selectedGroupeId: number | null;
  selectedGroupeDetails: GroupeData | null;
  loading: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({
  visible,
  actionMode,
  assignmentMode,
  selectedAppointmentsCount,
  selectedVolunteersCount,
  selectedGroupeId,
  selectedGroupeDetails,
  loading,
  onReset,
  onSubmit,
}) => {
  const { t } = useTranslation();
  if (!visible) {
    return null;
  }

  const isAssignMode = actionMode === 'assign';

  return (
    <div
      className={`mt-6 border rounded-lg p-4 ${
        isAssignMode ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3
            className={`text-lg font-semibold ${isAssignMode ? 'text-blue-800' : 'text-red-800'}`}
          >
            {isAssignMode ? t('appointments.assignInProgress') : t('appointments.unassignInProgress')}
          </h3>
          <p className={`text-sm ${isAssignMode ? 'text-blue-600' : 'text-red-600'}`}>
            {selectedAppointmentsCount} {t('appointments.list')}
            {isAssignMode && ` • ${selectedVolunteersCount} ${t('volunteers.title').toLowerCase()}`}
            {isAssignMode && selectedGroupeId && (
              <span>
                {' • '}{t('groups.group')} {': '}
                {selectedGroupeDetails?.intitule ?? `#${selectedGroupeId}`}
                {selectedGroupeDetails?.iv ? (
                  <span className="text-green-600 font-medium"> ({t('studies.visitAllowance')} : {selectedGroupeDetails.iv}€)</span>
                ) : null}
              </span>
            )}
          </p>
          {isAssignMode && assignmentMode === 'auto' && selectedAppointmentsCount > 0 && selectedVolunteersCount > 0 && (
            <p className={`text-xs mt-1 ${isAssignMode ? 'text-blue-500' : 'text-red-500'}`}>
              {Math.min(selectedAppointmentsCount, selectedVolunteersCount)} {t('appointments.assignmentsWillBeMade')}
              {selectedGroupeDetails?.iv ? (
                <span className="text-green-600"> {t('appointments.withAllowanceEach', { amount: selectedGroupeDetails.iv })}</span>
              ) : null}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onReset}
            className={`px-4 py-2 border rounded-md ${
              isAssignMode
                ? 'border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'border-red-300 text-red-700 hover:bg-red-100'
            }`}
          >
            {t('common.reset')}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : isAssignMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? (isAssignMode ? t('appointments.assigning') : t('appointments.unassigning')) : isAssignMode ? t('appointments.assign') : t('appointments.unassign')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSummary;
