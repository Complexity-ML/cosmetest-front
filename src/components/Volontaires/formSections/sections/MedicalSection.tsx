import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const CONTRACEPTION_OPTIONS = [
  "Preservatif",
  "Pilule",
  "Implant",
  "Patch",
  "Anneau vaginal",
  "Abstinence",
  "Aucun",
  "Autre",
] as const;

const MedicalSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const selectContraception = (option: string) => {
    onChange({ target: { name: "contraception", value: option, type: "text" } } as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("volunteers.medicalInformation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="traitement" className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteers.currentTreatment")}
            </label>
            <textarea
              id="traitement"
              name="traitement"
              rows={2}
              value={formData.traitement}
              onChange={onChange}
              className="form-textarea block w-full"
              placeholder={t("volunteers.currentTreatment")}
            />
          </div>

          <div>
            <label htmlFor="anamnese" className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteers.anamnesis")}
            </label>
            <textarea
              id="anamnese"
              name="anamnese"
              rows={2}
              value={formData.anamnese}
              onChange={onChange}
              className="form-textarea block w-full"
              placeholder={t("volunteers.anamnesis")}
            />
          </div>

          <div className="md:col-span-2">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              {t("volunteers.contraception")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTRACEPTION_OPTIONS.map((option) => {
                const isSelected = formData.contraception === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectContraception(option)}
                    className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                      isSelected
                        ? "bg-blue-100 border-blue-400 text-blue-800 font-medium"
                        : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
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
            <label htmlFor="menopause" className="ml-2 block text-sm font-medium text-gray-700">
              {t("volunteers.menopause")}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="bouffeeChaleurMenaupose"
              name="bouffeeChaleurMenaupose"
              checked={formData.bouffeeChaleurMenaupose === "Oui"}
              onChange={onChange}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="bouffeeChaleurMenaupose"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t("volunteers.hotFlashes", "Bouffees de chaleur (menopause)")}
            </label>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="allergiesCommentaires"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("volunteers.knownAllergies")}
            </label>
            <textarea
              id="allergiesCommentaires"
              name="allergiesCommentaires"
              rows={2}
              value={formData.allergiesCommentaires}
              onChange={onChange}
              className="form-textarea block w-full"
              placeholder={t("volunteers.knownAllergies")}
            />
          </div>

          <div>
            <label htmlFor="santeCompatible" className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteers.compatibleHealth")}
            </label>
            <select
              id="santeCompatible"
              name="santeCompatible"
              value={formData.santeCompatible}
              onChange={onChange}
              className="form-select block w-full"
            >
              <option value="Oui">{t("common.yes")}</option>
              <option value="Non">{t("common.no")}</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalSection;
