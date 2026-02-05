import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const MarquesCutaneesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.skinMarks')}</CardTitle>
      </CardHeader>
      <CardContent>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.characteristics')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cicatrices"
              name="cicatrices"
              checked={!!formData.cicatrices && formData.cicatrices !== "Non"}
              onChange={(e) => {
                onChange({ target: { name: 'cicatrices', value: e.target.checked ? 'Oui' : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="cicatrices"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.scars')}
            </label>
          </div>
          {!!formData.cicatrices && formData.cicatrices !== "Non" && (
            <input
              type="text"
              name="cicatrices"
              value={formData.cicatrices === "Oui" ? "" : formData.cicatrices}
              onChange={(e) => {
                onChange({ target: { name: 'cicatrices', value: e.target.value || 'Oui', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tatouages"
              name="tatouages"
              checked={!!formData.tatouages && formData.tatouages !== "Non"}
              onChange={(e) => {
                onChange({ target: { name: 'tatouages', value: e.target.checked ? 'Oui' : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="tatouages"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.tattoos')}
            </label>
          </div>
          {!!formData.tatouages && formData.tatouages !== "Non" && (
            <input
              type="text"
              name="tatouages"
              value={formData.tatouages === "Oui" ? "" : formData.tatouages}
              onChange={(e) => {
                onChange({ target: { name: 'tatouages', value: e.target.value || 'Oui', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="piercings"
              name="piercings"
              checked={!!formData.piercings && formData.piercings !== "Non"}
              onChange={(e) => {
                onChange({ target: { name: 'piercings', value: e.target.checked ? 'Oui' : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="piercings"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.piercings')}
            </label>
          </div>
          {!!formData.piercings && formData.piercings !== "Non" && (
            <input
              type="text"
              name="piercings"
              value={formData.piercings === "Oui" ? "" : formData.piercings}
              onChange={(e) => {
                onChange({ target: { name: 'piercings', value: e.target.value || 'Oui', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.pigmentSpots')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesVisage"
            name="tachesPigmentairesVisage"
            checked={formData.tachesPigmentairesVisage === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesVisage"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.face')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesCou"
            name="tachesPigmentairesCou"
            checked={formData.tachesPigmentairesCou === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesCou"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.neck')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesDecollete"
            name="tachesPigmentairesDecollete"
            checked={formData.tachesPigmentairesDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.neckline')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesMains"
            name="tachesPigmentairesMains"
            checked={formData.tachesPigmentairesMains === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesMains"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.hands')}
          </label>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.stretchMarks')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesJambes"
            name="vergeturesJambes"
            checked={formData.vergeturesJambes === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesJambes"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.legs')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesFessesHanches"
            name="vergeturesFessesHanches"
            checked={formData.vergeturesFessesHanches === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesFessesHanches"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.buttocksHips')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesVentreTaille"
            name="vergeturesVentreTaille"
            checked={formData.vergeturesVentreTaille === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesVentreTaille"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.bellyWaist')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesPoitrineDecollete"
            name="vergeturesPoitrineDecollete"
            checked={formData.vergeturesPoitrineDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesPoitrineDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.chestNeckline')}
          </label>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default MarquesCutaneesSection;
