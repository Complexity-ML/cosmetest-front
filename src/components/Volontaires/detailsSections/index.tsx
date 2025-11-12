import InfoSection from './InfoSection';
import CaracteristiquesSection from './CaracteristiquesSection';
import PeauSection from './PeauSection';
import CheveuxSection from './CheveuxSection';
import CilsSection from './CilsSection';
import MarquesCutaneesSection from './MarquesCutaneesSection';
import ProblemesSection from './ProblemesSection';
import MedicalSection from './MedicalSection';
import MesuresSection from './MesuresSection';
import RibSection from './RibSection';
import EvaluationSection from './EvaluationSection';
import NotesSection from './NotesSection';
import RendezVousSection from './RendezVousSection';
import EtudesSection from './EtudesSection';
import AssignationSection from './AssignationSection';
import PhotosSection from './PhotosSection';

const SECTION_COMPONENTS = {
  info: InfoSection,
  caracteristiques: CaracteristiquesSection,
  peau: PeauSection,
  cheveux: CheveuxSection,
  cils: CilsSection,
  marques: MarquesCutaneesSection,
  problemes: ProblemesSection,
  medical: MedicalSection,
  mesures: MesuresSection,
  rib: RibSection,
  evaluation: EvaluationSection,
  notes: NotesSection,
  rdvs: RendezVousSection,
  etudes: EtudesSection,
  assignation: AssignationSection,
  photos: PhotosSection,
} as const;

type SectionKey = keyof typeof SECTION_COMPONENTS;

interface RenderVolontaireDetailsSectionProps {
  activeTab: SectionKey;
  [key: string]: any;
}

export const renderVolontaireDetailsSection = ({ activeTab, ...props }: RenderVolontaireDetailsSectionProps) => {
  const Section = SECTION_COMPONENTS[activeTab] as React.ComponentType<any>;
  if (!Section) {
    return null;
  }

  return <Section {...props} />;
};

export default renderVolontaireDetailsSection;
