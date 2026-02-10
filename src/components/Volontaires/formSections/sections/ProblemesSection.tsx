import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const ProblemesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const problemesIds = [
    'acne', 'couperoseRosacee', 'dermiteSeborrheique', 'eczema', 'psoriasis', 'problemesAucun',
  ];

  const handleNoneToggle = useCallback((
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    if (clickedId === 'problemesAucun') {
      if (!isCurrentlyChecked) {
        problemesIds.forEach(id => {
          if (id !== 'problemesAucun' && formData[id] === 'Oui') {
            onChange(createSyntheticEvent(id, ''));
          }
        });
        onChange(createSyntheticEvent('problemesAucun', 'Oui'));
      } else {
        onChange(createSyntheticEvent('problemesAucun', ''));
      }
    } else {
      if (!isCurrentlyChecked && formData.problemesAucun === 'Oui') {
        onChange(createSyntheticEvent('problemesAucun', ''));
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
        <CardTitle>{t('volunteers.specificProblems')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center col-span-full">
          <input
            type="checkbox"
            id="problemesAucun"
            name="problemesAucun"
            checked={formData.problemesAucun === "Oui"}
            onChange={() => handleNoneToggle('problemesAucun', formData.problemesAucun === "Oui")}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label htmlFor="problemesAucun" className="ml-2 block text-sm font-medium text-gray-700">
            Aucun
          </label>
        </div>
        <GroupCheckbox id="acne" label={t('volunteers.acne')} />
        <GroupCheckbox id="couperoseRosacee" label={t('volunteers.couperoseRosacea')} />
        <GroupCheckbox id="dermiteSeborrheique" label={t('volunteers.seborrheicDermatitis')} />
        <GroupCheckbox id="eczema" label={t('volunteers.eczema')} />
        <GroupCheckbox id="psoriasis" label={t('volunteers.psoriasis')} />
      </div>
      </CardContent>
    </Card>
  );
};

export default ProblemesSection;
