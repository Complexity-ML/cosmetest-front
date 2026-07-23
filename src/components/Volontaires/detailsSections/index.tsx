import { lazy, Suspense, type ComponentType } from 'react';

const SECTION_COMPONENTS = {
  info: lazy(() => import('./InfoSection')),
  caracteristiques: lazy(() => import('./CaracteristiquesSection')),
  peau: lazy(() => import('./PeauSection')),
  cheveux: lazy(() => import('./CheveuxSection')),
  cils: lazy(() => import('./CilsSection')),
  marques: lazy(() => import('./MarquesCutaneesSection')),
  problemes: lazy(() => import('./ProblemesSection')),
  medical: lazy(() => import('./MedicalSection')),
  medecineEsthetique: lazy(() => import('./MedecineEsthetiqueSection')),
  rib: lazy(() => import('./RibSection')),
  evaluation: lazy(() => import('./EvaluationSection')),
  notes: lazy(() => import('./NotesSection')),
  rdvs: lazy(() => import('./RendezVousSection')),
  etudes: lazy(() => import('./EtudesSection')),
  assignation: lazy(() => import('./AssignationSection')),
  photos: lazy(() => import('./PhotosSection')),
  annulations: lazy(() => import('./AnnulationsSection')),
} as const;

export type SectionKey = keyof typeof SECTION_COMPONENTS;

export const isSectionKey = (value: string): value is SectionKey =>
  Object.prototype.hasOwnProperty.call(SECTION_COMPONENTS, value);

interface RenderVolontaireDetailsSectionProps {
  activeTab: SectionKey;
  [key: string]: unknown;
}

export const renderVolontaireDetailsSection = ({
  activeTab,
  ...props
}: RenderVolontaireDetailsSectionProps) => {
  const Section = SECTION_COMPONENTS[activeTab] as unknown as ComponentType<Record<string, unknown>>;

  return (
    <Suspense
      fallback={(
        <div className="flex justify-center items-center h-32" role="status" aria-label="Chargement de la section">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
        </div>
      )}
    >
      <Section {...props} />
    </Suspense>
  );
};

export default renderVolontaireDetailsSection;
