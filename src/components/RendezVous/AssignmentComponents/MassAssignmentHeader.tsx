import React from 'react';
import { useTranslation } from 'react-i18next';
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
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('appointments.title')}</h1>
        {selectedEtudeId && etudeDetails && (
          <p className="text-gray-600 mt-1">
            {t('appointments.study')} :
            <span className="font-medium ml-1">
              {etudeDetails.ref ?? 'N/A'} - {etudeDetails.titre ?? t('studies.noTitle')}
            </span>
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
      >
        {t('appointments.backToAppointments')}
      </button>
    </div>
  );
};

export default MassAssignmentHeader;
