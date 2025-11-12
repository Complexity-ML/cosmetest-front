import React from 'react';
import { EtudeData } from '../../../types/etude.types';

interface MassAssignmentHeaderProps {
  etudeDetails: EtudeData | null;
  selectedEtudeId: number | null;
  onBack: () => void;
}

const MassAssignmentHeader: React.FC<MassAssignmentHeaderProps> = ({ 
  etudeDetails, 
  selectedEtudeId, 
  onBack 
}) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Gestion des rendez-vous</h1>
      {selectedEtudeId && etudeDetails && (
        <p className="text-gray-600 mt-1">
          Étude :
          <span className="font-medium ml-1">
            {etudeDetails.ref ?? 'N/A'} - {etudeDetails.titre ?? 'Sans titre'}
          </span>
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={onBack}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
    >
      Retour aux RDV
    </button>
  </div>
);

export default MassAssignmentHeader;
