import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

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

  const NoneCheckbox = ({ groupIds, noneId }: { groupIds: string[], noneId: string }) => (
    <div className="flex items-center col-span-full">
      <input
        type="checkbox"
        id={noneId}
        name={noneId}
        checked={formData[noneId] === "Oui"}
        onChange={() => handleNoneToggle(groupIds, noneId, noneId, formData[noneId] === "Oui")}
        className="form-checkbox h-5 w-5 text-primary-600"
      />
      <label htmlFor={noneId} className="ml-2 block text-sm font-medium text-gray-700">
        Aucun
      </label>
    </div>
  );

  const GroupCheckbox = ({ id, label, groupIds, noneId }: { id: string, label: string, groupIds: string[], noneId: string }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={formData[id] === "Oui"}
        onChange={() => handleNoneToggle(groupIds, noneId, id, formData[id] === "Oui")}
        className="form-checkbox h-5 w-5 text-primary-600"
      />
      <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
    </div>
  );

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
        <NoneCheckbox groupIds={tachesIds} noneId="tachesPigmentairesAucun" />
        <GroupCheckbox id="tachesPigmentairesVisage" label={t('volunteers.face')} groupIds={tachesIds} noneId="tachesPigmentairesAucun" />
        <GroupCheckbox id="tachesPigmentairesCou" label={t('volunteers.neck')} groupIds={tachesIds} noneId="tachesPigmentairesAucun" />
        <GroupCheckbox id="tachesPigmentairesDecollete" label={t('volunteers.neckline')} groupIds={tachesIds} noneId="tachesPigmentairesAucun" />
        <GroupCheckbox id="tachesPigmentairesMains" label={t('volunteers.hands')} groupIds={tachesIds} noneId="tachesPigmentairesAucun" />
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.stretchMarks')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={vergeturesIds} noneId="vergeturesAucun" />
        <GroupCheckbox id="vergeturesJambes" label={t('volunteers.legs')} groupIds={vergeturesIds} noneId="vergeturesAucun" />
        <GroupCheckbox id="vergeturesFessesHanches" label={t('volunteers.buttocksHips')} groupIds={vergeturesIds} noneId="vergeturesAucun" />
        <GroupCheckbox id="vergeturesVentreTaille" label={t('volunteers.bellyWaist')} groupIds={vergeturesIds} noneId="vergeturesAucun" />
        <GroupCheckbox id="vergeturesPoitrineDecollete" label={t('volunteers.chestNeckline')} groupIds={vergeturesIds} noneId="vergeturesAucun" />
      </div>
      </CardContent>
    </Card>
  );
};

export default MarquesCutaneesSection;
