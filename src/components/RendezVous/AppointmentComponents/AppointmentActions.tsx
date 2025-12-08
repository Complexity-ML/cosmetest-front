import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';

interface AppointmentActionsProps {
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

const AppointmentActions = ({ onBack, onEdit, onDelete, deleting }: AppointmentActionsProps) => {
  const { t } = useTranslation();
  return (
    <section className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={onBack}
        variant="outline"
      >
        {t('common.back')}
      </Button>
      <Button
        type="button"
        onClick={onEdit}
        variant="default"
      >
        {t('common.edit')}
      </Button>
      <Button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        variant="destructive"
      >
        {deleting ? t('common.deleting') : t('common.delete')}
      </Button>
    </section>
  );
};

export default AppointmentActions;
