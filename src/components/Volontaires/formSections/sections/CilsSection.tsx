import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const CilsSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const cilsIds = ['cilsAbimes', 'cilsBroussailleux', 'chuteDeCils', 'cilsProblemeAucun'];

  const handleNoneToggle = useCallback((
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    if (clickedId === 'cilsProblemeAucun') {
      if (!isCurrentlyChecked) {
        cilsIds.forEach(id => {
          if (id !== 'cilsProblemeAucun' && formData[id] === 'Oui') {
            onChange(createSyntheticEvent(id, ''));
          }
        });
        onChange(createSyntheticEvent('cilsProblemeAucun', 'Oui'));
      } else {
        onChange(createSyntheticEvent('cilsProblemeAucun', ''));
      }
    } else {
      if (!isCurrentlyChecked && formData.cilsProblemeAucun === 'Oui') {
        onChange(createSyntheticEvent('cilsProblemeAucun', ''));
      }
      onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
    }
  }, [formData, onChange]);

  const GroupCheckbox = ({ id, label }: { id: string, label: string }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={formData[id] === "Oui"}
        onChange={() => handleNoneToggle(id, formData[id] === "Oui")}
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
        <CardTitle>{t('volunteers.eyelashesAndEyebrows')}</CardTitle>
      </CardHeader>
      <CardContent>

      <h3 className="text-md font-medium text-gray-800 mt-2 mb-3">
        {t('volunteers.lashCharacteristics')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="epaisseurCils" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.lashThickness')}
          </label>
          <select id="epaisseurCils" name="epaisseurCils" value={formData.epaisseurCils} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.lashThicknessOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.lashThicknessOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.lashThicknessOptions.Épais')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="longueurCils" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.lashLength')}
          </label>
          <select id="longueurCils" name="longueurCils" value={formData.longueurCils} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Courts">{t('volunteers.lashLengthOptions.Courts')}</option>
            <option value="Moyens">{t('volunteers.lashLengthOptions.Moyens')}</option>
            <option value="Longs">{t('volunteers.lashLengthOptions.Longs')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="courbureCils" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.lashCurvature')}
          </label>
          <select id="courbureCils" name="courbureCils" value={formData.courbureCils} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Droit">{t('volunteers.lashCurvatureOptions.Droit')}</option>
            <option value="Courbé">{t('volunteers.lashCurvatureOptions.Courbé')}</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Problèmes des cils
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center col-span-full">
          <input
            type="checkbox"
            id="cilsProblemeAucun"
            name="cilsProblemeAucun"
            checked={formData.cilsProblemeAucun === "Oui"}
            onChange={() => handleNoneToggle('cilsProblemeAucun', formData.cilsProblemeAucun === "Oui")}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label htmlFor="cilsProblemeAucun" className="ml-2 block text-sm font-medium text-gray-700">
            Aucun
          </label>
        </div>
        <GroupCheckbox id="cilsAbimes" label={t('volunteers.damagedLashes')} />
        <GroupCheckbox id="cilsBroussailleux" label={t('volunteers.bushyLashes')} />
        <GroupCheckbox id="chuteDeCils" label={t('volunteers.lashLoss')} />
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.eyebrows')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="caracteristiqueSourcils" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.eyebrowCharacteristics')}
          </label>
          <select id="caracteristiqueSourcils" name="caracteristiqueSourcils" value={formData.caracteristiqueSourcils} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Clairsemés">{t('volunteers.eyebrowOptions.Clairsemés')}</option>
            <option value="Fournis">{t('volunteers.eyebrowOptions.Fournis')}</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.lips')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="levres" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.lipType')}
          </label>
          <select id="levres" name="levres" value={formData.levres} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Fines">{t('volunteers.lipTypeOptions.Fines')}</option>
            <option value="Moyennes">{t('volunteers.lipTypeOptions.Moyennes')}</option>
            <option value="Pulpeuses">{t('volunteers.lipTypeOptions.Pulpeuses')}</option>
            <option value="Asymétriques">{t('volunteers.lipTypeOptions.Asymétriques')}</option>
          </select>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default CilsSection;
