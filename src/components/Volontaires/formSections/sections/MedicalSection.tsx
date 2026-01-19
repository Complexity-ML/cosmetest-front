import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const MedicalSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.medicalInformation')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="traitement"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.currentTreatment')}
          </label>
          <textarea
            id="traitement"
            name="traitement"
            rows={2}
            value={formData.traitement}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder={t('volunteers.currentTreatment')}
          />
        </div>

        <div>
          <label
            htmlFor="anamnese"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.anamnesis')}
          </label>
          <textarea
            id="anamnese"
            name="anamnese"
            rows={2}
            value={formData.anamnese}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder={t('volunteers.anamnesis')}
          />
        </div>

        <div>
          <label
            htmlFor="contraception"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.contraception')}
          </label>
          <select
            id="contraception"
            name="contraception"
            value={formData.contraception}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Pilule">{t('volunteers.contraceptionOptions.Pilule')}</option>
            <option value="Stérilet">{t('volunteers.contraceptionOptions.Stérilet')}</option>
            <option value="Implant">{t('volunteers.contraceptionOptions.Implant')}</option>
            <option value="Patch">{t('volunteers.contraceptionOptions.Patch')}</option>
            <option value="Anneau vaginal">{t('volunteers.contraceptionOptions.Anneau vaginal')}</option>
            <option value="Préservatif">{t('volunteers.contraceptionOptions.Préservatif')}</option>
            <option value="Autre">{t('volunteers.contraceptionOptions.Autre')}</option>
            <option value="Aucune">{t('volunteers.contraceptionOptions.Aucune')}</option>
            <option value="Abstinence">{t('volunteers.contraceptionOptions.Abstinence')}</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="menopause"
            name="menopause"
            checked={formData.menopause === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="menopause"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.menopause')}
          </label>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="allergiesCommentaires"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.knownAllergies')}
          </label>
          <textarea
            id="allergiesCommentaires"
            name="allergiesCommentaires"
            rows={2}
            value={formData.allergiesCommentaires}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder={t('volunteers.knownAllergies')}
          />
        </div>

        <div>
          <label
            htmlFor="santeCompatible"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.compatibleHealth')}
          </label>
          <select
            id="santeCompatible"
            name="santeCompatible"
            value={formData.santeCompatible}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="Oui">{t('common.yes')}</option>
            <option value="Non">{t('common.no')}</option>
          </select>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default MedicalSection;
