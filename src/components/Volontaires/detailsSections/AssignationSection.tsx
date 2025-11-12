import VolontaireAppointmentAssigner from '../VolontaireAppointmentAssigner';
import { VolontaireData } from '../../../types/volontaire.types';

interface AssignationSectionProps {
  volontaireId: number;
  volontaire: VolontaireData;
  onAssignmentComplete: () => void;
}

const AssignationSection = ({ volontaireId, volontaire, onAssignmentComplete }: AssignationSectionProps) => (
  <VolontaireAppointmentAssigner
    volontaireId={volontaireId}
    volontaire={volontaire}
    onAssignmentComplete={onAssignmentComplete}
  />
);

export default AssignationSection;
