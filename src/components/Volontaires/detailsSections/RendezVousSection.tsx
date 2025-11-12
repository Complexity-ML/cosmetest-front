import VolontaireDetailRdv from '../VolontaireDetailRdv';

interface RendezVousSectionProps {
  volontaireId: number | string;
  rdvs: any[];
}

const RendezVousSection = ({ rdvs, volontaireId }: RendezVousSectionProps) => (
  <VolontaireDetailRdv rdvs={rdvs} volontaireId={volontaireId} />
);

export default RendezVousSection;
