import InfosPersonnellesSection from './sections/InfosPersonnellesSection';
import CaracteristiquesSection from './sections/CaracteristiquesSection';
import PeauSection from './sections/PeauSection';
import CheveuxSection from './sections/CheveuxSection';
import ProblemesSection from './sections/ProblemesSection';
import MedicalSection from './sections/MedicalSection';
import NotesSection from './sections/NotesSection';
import CilsSection from './sections/CilsSection';
import MesuresSection from './sections/MesuresSection';
import MarquesCutaneesSection from './sections/MarquesCutaneesSection';
import RibSection from './sections/RibSection';
import EvaluationSection from './sections/EvaluationSection';

const SECTION_COMPONENTS = {
  'infos-personnelles': InfosPersonnellesSection,
  caracteristiques: CaracteristiquesSection,
  peau: PeauSection,
  cheveux: CheveuxSection,
  problemes: ProblemesSection,
  medical: MedicalSection,
  notes: NotesSection,
  cils: CilsSection,
  mesures: MesuresSection,
  'marques-cutanees': MarquesCutaneesSection,
  RIB: RibSection,
  evaluation: EvaluationSection,
} as const;

type SectionKey = keyof typeof SECTION_COMPONENTS;

export const renderVolontaireFormSection = ({ activeTab, ...props }: any) => {
  const Section = SECTION_COMPONENTS[activeTab as SectionKey];
  if (!Section) {
    return null;
  }

  return <Section {...props} />;
};

export default renderVolontaireFormSection;
