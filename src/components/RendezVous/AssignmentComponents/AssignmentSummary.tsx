import React from 'react';
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
            {isAssignMode ? 'Assignation en cours' : 'Désassignation en cours'}
          </h3>
          <p className={`text-sm ${isAssignMode ? 'text-blue-600' : 'text-red-600'}`}>
            {selectedAppointmentsCount} rendez-vous
            {isAssignMode && ` • ${selectedVolunteersCount} volontaires`}
            {isAssignMode && selectedGroupeId && (
              <span>
                {' • Groupe : '}
                {selectedGroupeDetails?.intitule ?? `#${selectedGroupeId}`}
                {selectedGroupeDetails?.iv ? (
                  <span className="text-green-600 font-medium"> (IV : {selectedGroupeDetails.iv}€)</span>
                ) : null}
              </span>
            )}
          </p>
          {isAssignMode && assignmentMode === 'auto' && selectedAppointmentsCount > 0 && selectedVolunteersCount > 0 && (
            <p className={`text-xs mt-1 ${isAssignMode ? 'text-blue-500' : 'text-red-500'}`}>
              {Math.min(selectedAppointmentsCount, selectedVolunteersCount)} assignation(s) seront effectuée(s)
              {selectedGroupeDetails?.iv ? (
                <span className="text-green-600"> avec IV de {selectedGroupeDetails.iv}€ chacune</span>
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
            Réinitialiser
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
            {loading ? (isAssignMode ? 'Assignation...' : 'Désassignation...') : isAssignMode ? 'Assigner' : 'Désassigner'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSummary;
