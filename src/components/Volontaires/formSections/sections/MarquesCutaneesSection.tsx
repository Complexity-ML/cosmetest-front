import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const NoneCheckbox = ({
  noneId,
  checked,
  onToggle,
}: {
  noneId: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center col-span-full">
    <input
      type="checkbox"
      id={noneId}
      name={noneId}
      checked={checked}
      onChange={onToggle}
      className="form-checkbox h-5 w-5 text-primary-600"
    />
    <label htmlFor={noneId} className="ml-2 block text-sm font-medium text-gray-700">
      Aucun
    </label>
  </div>
);

const GroupCheckbox = ({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onToggle}
      className="form-checkbox h-5 w-5 text-primary-600"
    />
    <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
      {label}
    </label>
  </div>
);

const MarquesCutaneesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const handleNoneToggle = useCallback((
    groupIds: string[],
    noneId: string,
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    if (clickedId === noneId) {
      if (!isCurrentlyChecked) {
        groupIds.forEach(id => {
          if (id !== noneId && formData[id] === 'Oui') {
            onChange(createSyntheticEvent(id, ''));
          }
        });
        onChange(createSyntheticEvent(noneId, 'Oui'));
      } else {
        onChange(createSyntheticEvent(noneId, ''));
      }
    } else {
      if (!isCurrentlyChecked && formData[noneId] === 'Oui') {
        onChange(createSyntheticEvent(noneId, ''));
      }
      onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
    }
  }, [formData, onChange]);

  const tachesIds = ['tachesPigmentairesVisage', 'tachesPigmentairesCou', 'tachesPigmentairesDecollete', 'tachesPigmentairesMains', 'tachesPigmentairesAucun'];
  const vergeturesIds = ['vergeturesJambes', 'vergeturesFessesHanches', 'vergeturesVentreTaille', 'vergeturesPoitrineDecollete', 'vergeturesAucun'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.skinMarks')}</CardTitle>
      </CardHeader>
      <CardContent>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.pigmentSpots')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox
          noneId="tachesPigmentairesAucun"
          checked={formData.tachesPigmentairesAucun === 'Oui'}
          onToggle={() => handleNoneToggle(tachesIds, 'tachesPigmentairesAucun', 'tachesPigmentairesAucun', formData.tachesPigmentairesAucun === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesVisage"
          label={t('volunteers.face')}
          checked={formData.tachesPigmentairesVisage === 'Oui'}
          onToggle={() => handleNoneToggle(tachesIds, 'tachesPigmentairesAucun', 'tachesPigmentairesVisage', formData.tachesPigmentairesVisage === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesCou"
          label={t('volunteers.neck')}
          checked={formData.tachesPigmentairesCou === 'Oui'}
          onToggle={() => handleNoneToggle(tachesIds, 'tachesPigmentairesAucun', 'tachesPigmentairesCou', formData.tachesPigmentairesCou === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesDecollete"
          label={t('volunteers.neckline')}
          checked={formData.tachesPigmentairesDecollete === 'Oui'}
          onToggle={() => handleNoneToggle(tachesIds, 'tachesPigmentairesAucun', 'tachesPigmentairesDecollete', formData.tachesPigmentairesDecollete === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesMains"
          label={t('volunteers.hands')}
          checked={formData.tachesPigmentairesMains === 'Oui'}
          onToggle={() => handleNoneToggle(tachesIds, 'tachesPigmentairesAucun', 'tachesPigmentairesMains', formData.tachesPigmentairesMains === 'Oui')}
        />
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.stretchMarks')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox
          noneId="vergeturesAucun"
          checked={formData.vergeturesAucun === 'Oui'}
          onToggle={() => handleNoneToggle(vergeturesIds, 'vergeturesAucun', 'vergeturesAucun', formData.vergeturesAucun === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesJambes"
          label={t('volunteers.legs')}
          checked={formData.vergeturesJambes === 'Oui'}
          onToggle={() => handleNoneToggle(vergeturesIds, 'vergeturesAucun', 'vergeturesJambes', formData.vergeturesJambes === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesFessesHanches"
          label={t('volunteers.buttocksHips')}
          checked={formData.vergeturesFessesHanches === 'Oui'}
          onToggle={() => handleNoneToggle(vergeturesIds, 'vergeturesAucun', 'vergeturesFessesHanches', formData.vergeturesFessesHanches === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesVentreTaille"
          label={t('volunteers.bellyWaist')}
          checked={formData.vergeturesVentreTaille === 'Oui'}
          onToggle={() => handleNoneToggle(vergeturesIds, 'vergeturesAucun', 'vergeturesVentreTaille', formData.vergeturesVentreTaille === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesPoitrineDecollete"
          label={t('volunteers.chestNeckline')}
          checked={formData.vergeturesPoitrineDecollete === 'Oui'}
          onToggle={() => handleNoneToggle(vergeturesIds, 'vergeturesAucun', 'vergeturesPoitrineDecollete', formData.vergeturesPoitrineDecollete === 'Oui')}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default MarquesCutaneesSection;
