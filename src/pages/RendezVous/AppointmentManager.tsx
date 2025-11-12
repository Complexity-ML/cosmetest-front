import { RendezVousProvider } from './context/RendezVousContext';
import RendezVousLayout from './RendezVousLayout';

const AppointmentManager = () => (
  <RendezVousProvider>
    <RendezVousLayout />
  </RendezVousProvider>
);

export default AppointmentManager;
