import IndemniteManager from '../../../components/Etudes/IndemniteManager.jsx'

interface IndemnitiesSectionProps {
  etudeId: number;
  etudeTitle: string;
  etudeRef: string;
  onError?: (error: Error | string) => void;
}

const IndemnitesSection = ({ etudeId, etudeTitle, etudeRef, onError }: IndemnitiesSectionProps) => {
  return (
    <IndemniteManager
      etudeId={etudeId}
      etudeTitre={etudeTitle}
      etudeRef={etudeRef}
      onError={onError}
      showDebugInfo={false}
    />
  )
}

export default IndemnitesSection

