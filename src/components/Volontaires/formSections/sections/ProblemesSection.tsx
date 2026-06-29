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

  const toggleCheckbox = useCallback((
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
  }, [onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.specificProblems')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GroupCheckbox
          id="acne"
          label={t('volunteers.acne')}
          checked={formData.acne === 'Oui'}
          onToggle={() => toggleCheckbox('acne', formData.acne === 'Oui')}
        />
        <GroupCheckbox
          id="couperoseRosacee"
          label={t('volunteers.couperoseRosacea')}
          checked={formData.couperoseRosacee === 'Oui'}
          onToggle={() => toggleCheckbox('couperoseRosacee', formData.couperoseRosacee === 'Oui')}
        />
        <GroupCheckbox
          id="dermiteSeborrheique"
          label={t('volunteers.seborrheicDermatitis')}
          checked={formData.dermiteSeborrheique === 'Oui'}
          onToggle={() => toggleCheckbox('dermiteSeborrheique', formData.dermiteSeborrheique === 'Oui')}
        />
        <GroupCheckbox
          id="eczema"
          label={t('volunteers.eczema')}
          checked={formData.eczema === 'Oui'}
          onToggle={() => toggleCheckbox('eczema', formData.eczema === 'Oui')}
        />
        <GroupCheckbox
          id="psoriasis"
          label={t('volunteers.psoriasis')}
          checked={formData.psoriasis === 'Oui'}
          onToggle={() => toggleCheckbox('psoriasis', formData.psoriasis === 'Oui')}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default ProblemesSection;
