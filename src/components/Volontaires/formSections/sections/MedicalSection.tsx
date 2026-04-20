import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback, KeyboardEvent } from "react";

const CONTRACEPTION_OPTIONS = [
  "Pilule",
  "Stérilet",
  "Implant",
  "Patch",
  "Anneau vaginal",
  "Préservatif",
  "Abstinence",
  "Aucune",
  "Autre",
] as const;

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const MedicalSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const handleContraceptionKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const k = e.key;
      const current = formData.contraception || "";

      if (k === "Backspace" || k === "Delete") {
        e.preventDefault();
        onChange({ target: { name: "contraception", value: "", type: "text" } } as any);
        return;
      }

      if (k === "ArrowDown" || k === "ArrowRight") {
        e.preventDefault();
        const idx = CONTRACEPTION_OPTIONS.indexOf(current as any);
        const next = idx === -1 ? 0 : (idx + 1) % CONTRACEPTION_OPTIONS.length;
        onChange({ target: { name: "contraception", value: CONTRACEPTION_OPTIONS[next], type: "text" } } as any);
        return;
      }

      if (k === "ArrowUp" || k === "ArrowLeft") {
        e.preventDefault();
        const idx = CONTRACEPTION_OPTIONS.indexOf(current as any);
        const prev = idx <= 0 ? CONTRACEPTION_OPTIONS.length - 1 : idx - 1;
        onChange({ target: { name: "contraception", value: CONTRACEPTION_OPTIONS[prev], type: "text" } } as any);
        return;
      }

      if (k === "Tab" || k === "Enter" || k === "Shift") return;

      if (k.length === 1 && /[a-zA-ZÀ-ÿ]/.test(k)) {
        e.preventDefault();
        const letter = stripAccents(k).toLowerCase();
        const matches = CONTRACEPTION_OPTIONS.filter(
          (o) => stripAccents(o).toLowerCase().charAt(0) === letter,
        );
        if (matches.length === 0) return;
        const curIdx = matches.indexOf(current as any);
        const next = curIdx === -1 ? matches[0] : matches[(curIdx + 1) % matches.length];
        onChange({ target: { name: "contraception", value: next, type: "text" } } as any);
        return;
      }

      e.preventDefault();
    },
    [formData.contraception, onChange],
  );

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
          <input
            type="text"
            id="contraception"
            name="contraception"
            value={formData.contraception || ""}
            readOnly
            onKeyDown={handleContraceptionKey}
            placeholder="Tapez la 1ère lettre (P, S, I, A...)"
            title={`Options: ${CONTRACEPTION_OPTIONS.join(", ")}`}
            className="form-input block w-full"
          />
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
            {t('volunteers.hotFlashes', 'Bouffées de chaleur (ménopause)')}
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
