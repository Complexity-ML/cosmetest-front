import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const CilsSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

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
          <label
            htmlFor="epaisseurCils"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.lashThickness')}
          </label>
          <select
            id="epaisseurCils"
            name="epaisseurCils"
            value={formData.epaisseurCils}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.lashThicknessOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.lashThicknessOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.lashThicknessOptions.Épais')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="longueurCils"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.lashLength')}
          </label>
          <select
            id="longueurCils"
            name="longueurCils"
            value={formData.longueurCils}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Courts">{t('volunteers.lashLengthOptions.Courts')}</option>
            <option value="Moyens">{t('volunteers.lashLengthOptions.Moyens')}</option>
            <option value="Longs">{t('volunteers.lashLengthOptions.Longs')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="courbureCils"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.lashCurvature')}
          </label>
          <select
            id="courbureCils"
            name="courbureCils"
            value={formData.courbureCils}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Droits">{t('volunteers.lashCurvatureOptions.Droits')}</option>
            <option value="Légèrement courbés">{t('volunteers.lashCurvatureOptions.Légèrement courbés')}</option>
            <option value="Très courbés">{t('volunteers.lashCurvatureOptions.Très courbés')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cilsAbimes"
            name="cilsAbimes"
            checked={formData.cilsAbimes === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cilsAbimes"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.damagedLashes')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="cilsBroussailleux"
            name="cilsBroussailleux"
            checked={formData.cilsBroussailleux === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cilsBroussailleux"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.bushyLashes')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="chuteDeCils"
            name="chuteDeCils"
            checked={formData.chuteDeCils === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="chuteDeCils"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.lashLoss')}
          </label>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.eyebrows')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="caracteristiqueSourcils"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.eyebrowCharacteristics')}
          </label>
          <select
            id="caracteristiqueSourcils"
            name="caracteristiqueSourcils"
            value={formData.caracteristiqueSourcils}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.eyebrowOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.eyebrowOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.eyebrowOptions.Épais')}</option>
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
          <label
            htmlFor="levres"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.lipType')}
          </label>
          <select
            id="levres"
            name="levres"
            value={formData.levres}
            onChange={onChange}
            className="form-select block w-full"
          >
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
