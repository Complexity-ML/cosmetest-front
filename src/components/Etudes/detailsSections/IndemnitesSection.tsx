import IndemniteManager from '../../../components/Etudes/IndemniteManager'

interface IndemnitiesSectionProps {
  etudeId: number;
  etudeTitle: string;
  etudeRef: string;
  onError?: (error: Error | string) => void;
  rdvs?: any[];
}

const IndemnitesSection = ({ etudeId, etudeTitle, etudeRef, onError, rdvs }: IndemnitiesSectionProps) => {
  return (
    <IndemniteManager
      etudeId={etudeId}
      etudeTitre={etudeTitle}
      etudeRef={etudeRef}
      onError={onError}
      showDebugInfo={false}
      rdvs={rdvs}
    />
  )
}

export default IndemnitesSection

