import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { id: "infos-personnelles", label: "Informations personnelles" },
  { id: "caracteristiques", label: "Caracteristiques physiques" },
  { id: "peau", label: "Peau" },
  { id: "marques-cutanees", label: "Marques cutanees" },
  { id: "cheveux", label: "Cheveux & ongles" },
  { id: "cils", label: "Cils & sourcils" },
  { id: "problemes", label: "Problemes specifiques" },
  { id: "medical", label: "Informations medicales" },
  { id: "mesures", label: "Mesures" },
  { id: "notes", label: "Notes" },
  { id: "RIB", label: "RIB" },
  { id: "evaluation", label: "Evaluation" }
];

interface FormTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const FormTabs = ({ activeTab, setActiveTab }: FormTabsProps) => {
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
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

export { TABS };
export default FormTabs;
