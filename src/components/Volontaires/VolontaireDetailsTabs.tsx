import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const DETAILS_TABS = [
  { id: "info", label: "Informations personnelles" },
  { id: "caracteristiques", label: "Caracteristiques" },
  { id: "peau", label: "Peau" },
  { id: "cheveux", label: "Cheveux" },
  { id: "cils", label: "Cils" },
  { id: "marques", label: "Marques cutanees" },
  { id: "problemes", label: "Problemes specifiques" },
  { id: "medical", label: "Informations medicales" },
  { id: "mesures", label: "Mesures" },
  { id: "rib", label: "RIB" },
  { id: "evaluation", label: "Evaluation" },
  { id: "notes", label: "Notes" },
  { id: "rdvs", label: "Rendez-vous" },
  { id: "etudes", label: "Etudes" },
  { id: "assignation", label: "Assignation RDV" },
  { id: "photos", label: "Photos" },
];

interface VolontaireDetailsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  rdvCount?: number;
  etudesCount?: number;
}

const VolontaireDetailsTabs: React.FC<VolontaireDetailsTabsProps> = ({
  activeTab,
  onTabChange,
  rdvCount = 0,
  etudesCount = 0
}) => {
  const getLabel = (id: string, baseLabel: string) => {
    if (id === "rdvs" && rdvCount > 0) {
      return (
        <span className="flex items-center gap-2">
          {baseLabel}
          <Badge variant="secondary" className="ml-1">{rdvCount}</Badge>
        </span>
      );
    }
    if (id === "etudes" && etudesCount > 0) {
      return (
        <span className="flex items-center gap-2">
          {baseLabel}
          <Badge variant="secondary" className="ml-1">{etudesCount}</Badge>
        </span>
      );
    }
    return baseLabel;
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
        {DETAILS_TABS.map(({ id, label }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="whitespace-nowrap"
          >
            {getLabel(id, label)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export { DETAILS_TABS };
export default VolontaireDetailsTabs;
