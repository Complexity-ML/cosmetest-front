import { Button } from '../../ui/button';

interface AppointmentActionsProps {
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

const AppointmentActions = ({ onBack, onEdit, onDelete, deleting }: AppointmentActionsProps) => (
  <section className="flex flex-wrap gap-2">
    <Button
      type="button"
      onClick={onBack}
      variant="outline"
    >
      Retour
    </Button>
    <Button
      type="button"
      onClick={onEdit}
      variant="default"
    >
      Modifier
    </Button>
    <Button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      variant="destructive"
    >
      {deleting ? 'Suppression...' : 'Supprimer'}
    </Button>
  </section>
);

export default AppointmentActions;
