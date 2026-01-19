import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const CheveuxSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.hairCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="couleurCheveux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairColor')}
          </label>
          <select
            id="couleurCheveux"
            name="couleurCheveux"
            value={formData.couleurCheveux}
            onChange={onChange}
            className="form-select block w-full"
          >
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
          <label
            htmlFor="longueurCheveux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairLength')}
          </label>
          <select
            id="longueurCheveux"
            name="longueurCheveux"
            value={formData.longueurCheveux}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Courts">{t('volunteers.hairLengthOptions.Courts')}</option>
            <option value="Mi-longs">{t('volunteers.hairLengthOptions.Mi-longs')}</option>
            <option value="Longs">{t('volunteers.hairLengthOptions.Longs')}</option>
            <option value="Très longs">{t('volunteers.hairLengthOptions.Très longs')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="natureCheveux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairNature')}
          </label>
          <select
            id="natureCheveux"
            name="natureCheveux"
            value={formData.natureCheveux}
            onChange={onChange}
            className="form-select block w-full"
          >
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
          <label
            htmlFor="epaisseurCheveux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairThickness')}
          </label>
          <select
            id="epaisseurCheveux"
            name="epaisseurCheveux"
            value={formData.epaisseurCheveux}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.hairThicknessOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.hairThicknessOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.hairThicknessOptions.Épais')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="natureCuirChevelu"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.scalpNature')}
          </label>
          <select
            id="natureCuirChevelu"
            name="natureCuirChevelu"
            value={formData.natureCuirChevelu}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Normal">{t('volunteers.scalpNatureOptions.Normal')}</option>
            <option value="Sec">{t('volunteers.scalpNatureOptions.Sec')}</option>
            <option value="Gras">{t('volunteers.scalpNatureOptions.Gras')}</option>
            <option value="Mixte">{t('volunteers.scalpNatureOptions.Mixte')}</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="cuirCheveluSensible"
            name="cuirCheveluSensible"
            checked={formData.cuirCheveluSensible === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cuirCheveluSensible"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.sensitiveScalp')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="chuteDeCheveux"
            name="chuteDeCheveux"
            checked={formData.chuteDeCheveux === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="chuteDeCheveux"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.hairLoss')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="cheveuxCassants"
            name="cheveuxCassants"
            checked={formData.cheveuxCassants === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cheveuxCassants"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.brittleHair')}
          </label>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.nails')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="onglesCassants"
            name="onglesCassants"
            checked={formData.onglesCassants === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="onglesCassants"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.brittleNails')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="onglesDedoubles"
            name="onglesDedoubles"
            checked={formData.onglesDedoubles === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="onglesDedoubles"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.splitNails')}
          </label>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default CheveuxSection;
