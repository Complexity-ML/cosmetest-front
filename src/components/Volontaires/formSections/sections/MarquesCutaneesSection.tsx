import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

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

  const toggleCheckbox = useCallback((
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
  }, [onChange]);

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
        <GroupCheckbox
          id="tachesPigmentairesVisage"
          label={t('volunteers.face')}
          checked={formData.tachesPigmentairesVisage === 'Oui'}
          onToggle={() => toggleCheckbox('tachesPigmentairesVisage', formData.tachesPigmentairesVisage === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesCou"
          label={t('volunteers.neck')}
          checked={formData.tachesPigmentairesCou === 'Oui'}
          onToggle={() => toggleCheckbox('tachesPigmentairesCou', formData.tachesPigmentairesCou === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesDecollete"
          label={t('volunteers.neckline')}
          checked={formData.tachesPigmentairesDecollete === 'Oui'}
          onToggle={() => toggleCheckbox('tachesPigmentairesDecollete', formData.tachesPigmentairesDecollete === 'Oui')}
        />
        <GroupCheckbox
          id="tachesPigmentairesMains"
          label={t('volunteers.hands')}
          checked={formData.tachesPigmentairesMains === 'Oui'}
          onToggle={() => toggleCheckbox('tachesPigmentairesMains', formData.tachesPigmentairesMains === 'Oui')}
        />
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.stretchMarks')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GroupCheckbox
          id="vergeturesJambes"
          label={t('volunteers.legs')}
          checked={formData.vergeturesJambes === 'Oui'}
          onToggle={() => toggleCheckbox('vergeturesJambes', formData.vergeturesJambes === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesFessesHanches"
          label={t('volunteers.buttocksHips')}
          checked={formData.vergeturesFessesHanches === 'Oui'}
          onToggle={() => toggleCheckbox('vergeturesFessesHanches', formData.vergeturesFessesHanches === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesVentreTaille"
          label={t('volunteers.bellyWaist')}
          checked={formData.vergeturesVentreTaille === 'Oui'}
          onToggle={() => toggleCheckbox('vergeturesVentreTaille', formData.vergeturesVentreTaille === 'Oui')}
        />
        <GroupCheckbox
          id="vergeturesPoitrineDecollete"
          label={t('volunteers.chestNeckline')}
          checked={formData.vergeturesPoitrineDecollete === 'Oui'}
          onToggle={() => toggleCheckbox('vergeturesPoitrineDecollete', formData.vergeturesPoitrineDecollete === 'Oui')}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default MarquesCutaneesSection;
