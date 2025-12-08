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
            <option value="Blonds">Blonds</option>
            <option value="Bruns">Bruns</option>
            <option value="Chatains">Châtains</option>
            <option value="Noirs">Noirs</option>
            <option value="Roux">Roux</option>
            <option value="Gris">Gris</option>
            <option value="Blancs">Blancs</option>
            <option value="Colorés">Colorés</option>
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
            <option value="Courts">Courts</option>
            <option value="Mi-longs">Mi-longs</option>
            <option value="Longs">Longs</option>
            <option value="Très longs">Très longs</option>
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
            <option value="Lisses">Lisses</option>
            <option value="Ondulés">Ondulés</option>
            <option value="Bouclés">Bouclés</option>
            <option value="Crépus">Crépus</option>
            <option value="Frisés">Frisés</option>
            <option value="Normaux">Normaux</option>
            <option value="Secs">Secs</option>
            <option value="Gras">Gras</option>
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
            <option value="Fins">Fins</option>
            <option value="Moyens">Moyens</option>
            <option value="Épais">Épais</option>
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
            <option value="Normal">Normal</option>
            <option value="Sec">Sec</option>
            <option value="Gras">Gras</option>
            <option value="Mixte">Mixte</option>
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
