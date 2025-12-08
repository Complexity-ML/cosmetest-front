import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const DETAILS_TABS = [
    { id: "info", label: t('volunteers.personalInformation') },
    { id: "caracteristiques", label: t('volunteers.characteristics') },
    { id: "peau", label: t('volunteers.skin') },
    { id: "cheveux", label: t('volunteers.hair') },
    { id: "cils", label: t('volunteers.eyelashes') },
    { id: "marques", label: t('volunteers.skinMarks') },
    { id: "problemes", label: t('volunteers.specificProblems') },
    { id: "medical", label: t('volunteers.medicalInformation') },
    { id: "mesures", label: t('volunteers.measurements') },
    { id: "rib", label: t('volunteers.bankDetails') },
    { id: "evaluation", label: t('volunteers.evaluation') },
    { id: "notes", label: t('volunteers.comments') },
    { id: "rdvs", label: t('appointments.title') },
    { id: "etudes", label: t('studies.studies') },
    { id: "assignation", label: t('volunteers.rdvAssignment') },
    { id: "photos", label: t('volunteers.photos') },
  ];
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

export default VolontaireDetailsTabs;
