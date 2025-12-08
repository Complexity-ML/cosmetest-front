import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

interface FormTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const FormTabs = ({ activeTab, setActiveTab }: FormTabsProps) => {
  const { t } = useTranslation();

  const TABS = [
    { id: "infos-personnelles", label: t('volunteers.personalInformation') },
    { id: "caracteristiques", label: t('volunteers.physicalCharacteristics') },
    { id: "peau", label: t('volunteers.skin') },
    { id: "marques-cutanees", label: t('volunteers.skinMarks') },
    { id: "cheveux", label: t('volunteers.hairAndNails') },
    { id: "cils", label: t('volunteers.eyelashesAndEyebrows') },
    { id: "problemes", label: t('volunteers.specificProblems') },
    { id: "medical", label: t('volunteers.medicalInformation') },
    { id: "mesures", label: t('volunteers.measurements') },
    { id: "notes", label: t('volunteers.comments') },
    { id: "RIB", label: t('volunteers.bankDetails') },
    { id: "evaluation", label: t('volunteers.evaluation') }
  ];
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start flex-wrap gap-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FormTabs;
