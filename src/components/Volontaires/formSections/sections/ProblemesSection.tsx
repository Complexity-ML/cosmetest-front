import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const GroupCheckbox = ({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onToggle}
      className="form-checkbox h-5 w-5 text-primary-600"
    />
    <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
      {label}
    </label>
  </div>
);

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
        <GroupCheckbox
          id="acne"
          label={t('volunteers.acne')}
          checked={formData.acne === 'Oui'}
          onToggle={() => handleNoneToggle('acne', formData.acne === 'Oui')}
        />
        <GroupCheckbox
          id="couperoseRosacee"
          label={t('volunteers.couperoseRosacea')}
          checked={formData.couperoseRosacee === 'Oui'}
          onToggle={() => handleNoneToggle('couperoseRosacee', formData.couperoseRosacee === 'Oui')}
        />
        <GroupCheckbox
          id="dermiteSeborrheique"
          label={t('volunteers.seborrheicDermatitis')}
          checked={formData.dermiteSeborrheique === 'Oui'}
          onToggle={() => handleNoneToggle('dermiteSeborrheique', formData.dermiteSeborrheique === 'Oui')}
        />
        <GroupCheckbox
          id="eczema"
          label={t('volunteers.eczema')}
          checked={formData.eczema === 'Oui'}
          onToggle={() => handleNoneToggle('eczema', formData.eczema === 'Oui')}
        />
        <GroupCheckbox
          id="psoriasis"
          label={t('volunteers.psoriasis')}
          checked={formData.psoriasis === 'Oui'}
          onToggle={() => handleNoneToggle('psoriasis', formData.psoriasis === 'Oui')}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default ProblemesSection;
