import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const CheveuxSection = ({ formData, onChange }: any) => {
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

  const cheveuxIds = ['cuirCheveluSensible', 'chuteDeCheveux', 'cheveuxCassants', 'cheveuxProblemeAucun'];
  const onglesIds = ['onglesCassants', 'onglesDedoubles', 'onglesProblemeAucun'];

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
        <CardTitle>{t('volunteers.hairCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="couleurCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairColor')}
          </label>
          <select id="couleurCheveux" name="couleurCheveux" value={formData.couleurCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Blonds">{t('volunteers.hairColorOptions.Blonds')}</option>
            <option value="Bruns">{t('volunteers.hairColorOptions.Bruns')}</option>
            <option value="Chatains">{t('volunteers.hairColorOptions.Chatains')}</option>
            <option value="Noirs">{t('volunteers.hairColorOptions.Noirs')}</option>
            <option value="Roux">{t('volunteers.hairColorOptions.Roux')}</option>
            <option value="Gris">{t('volunteers.hairColorOptions.Gris')}</option>
            <option value="Blancs">{t('volunteers.hairColorOptions.Blancs')}</option>
            <option value="Colorés">{t('volunteers.hairColorOptions.Colorés')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="longueurCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairLength')}
          </label>
          <select id="longueurCheveux" name="longueurCheveux" value={formData.longueurCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Courts">{t('volunteers.hairLengthOptions.Courts')}</option>
            <option value="Mi-longs">{t('volunteers.hairLengthOptions.Mi-longs')}</option>
            <option value="Longs">{t('volunteers.hairLengthOptions.Longs')}</option>
            <option value="Très longs">{t('volunteers.hairLengthOptions.Très longs')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="natureCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairNature')}
          </label>
          <select id="natureCheveux" name="natureCheveux" value={formData.natureCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Lisses">{t('volunteers.hairNatureOptions.Lisses')}</option>
            <option value="Ondulés">{t('volunteers.hairNatureOptions.Ondulés')}</option>
            <option value="Bouclés">{t('volunteers.hairNatureOptions.Bouclés')}</option>
            <option value="Crépus">{t('volunteers.hairNatureOptions.Crépus')}</option>
            <option value="Frisés">{t('volunteers.hairNatureOptions.Frisés')}</option>
            <option value="Normaux">{t('volunteers.hairNatureOptions.Normaux')}</option>
            <option value="Secs">{t('volunteers.hairNatureOptions.Secs')}</option>
            <option value="Gras">{t('volunteers.hairNatureOptions.Gras')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="epaisseurCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairThickness')}
          </label>
          <select id="epaisseurCheveux" name="epaisseurCheveux" value={formData.epaisseurCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.hairThicknessOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.hairThicknessOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.hairThicknessOptions.Épais')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="natureCuirChevelu" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.scalpNature')}
          </label>
          <select id="natureCuirChevelu" name="natureCuirChevelu" value={formData.natureCuirChevelu} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Normal">{t('volunteers.scalpNatureOptions.Normal')}</option>
            <option value="Sec">{t('volunteers.scalpNatureOptions.Sec')}</option>
            <option value="Gras">{t('volunteers.scalpNatureOptions.Gras')}</option>
            <option value="Mixte">{t('volunteers.scalpNatureOptions.Mixte')}</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Problèmes capillaires
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={cheveuxIds} noneId="cheveuxProblemeAucun" />
        <GroupCheckbox id="cuirCheveluSensible" label={t('volunteers.sensitiveScalp')} groupIds={cheveuxIds} noneId="cheveuxProblemeAucun" />
        <GroupCheckbox id="chuteDeCheveux" label={t('volunteers.hairLoss')} groupIds={cheveuxIds} noneId="cheveuxProblemeAucun" />
        <GroupCheckbox id="cheveuxCassants" label={t('volunteers.brittleHair')} groupIds={cheveuxIds} noneId="cheveuxProblemeAucun" />
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.nails')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={onglesIds} noneId="onglesProblemeAucun" />
        <GroupCheckbox id="onglesCassants" label={t('volunteers.brittleNails')} groupIds={onglesIds} noneId="onglesProblemeAucun" />
        <GroupCheckbox id="onglesDedoubles" label={t('volunteers.splitNails')} groupIds={onglesIds} noneId="onglesProblemeAucun" />
      </div>
      </CardContent>
    </Card>
  );
};

export default CheveuxSection;
