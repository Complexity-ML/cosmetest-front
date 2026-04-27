import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const NoneCheckbox = ({
  noneId,
  checked,
  onToggle,
}: {
  noneId: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center col-span-full">
    <input
      type="checkbox"
      id={noneId}
      name={noneId}
      checked={checked}
      onChange={onToggle}
      className="form-checkbox h-5 w-5 text-primary-600"
    />
    <label htmlFor={noneId} className="ml-2 block text-sm font-medium text-gray-700">
      Aucun
    </label>
  </div>
);

const GroupCheckbox = ({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onToggle}
      className="form-checkbox h-5 w-5 text-primary-600"
    />
    <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
      {label}
    </label>
  </div>
);

const CheveuxSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const handleNoneToggle = useCallback((
    groupIds: string[],
    noneId: string,
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    if (clickedId === noneId) {
      if (!isCurrentlyChecked) {
        groupIds.forEach(id => {
          if (id !== noneId && formData[id] === 'Oui') {
            onChange(createSyntheticEvent(id, ''));
          }
        });
        onChange(createSyntheticEvent(noneId, 'Oui'));
      } else {
        onChange(createSyntheticEvent(noneId, ''));
      }
    } else {
      if (!isCurrentlyChecked && formData[noneId] === 'Oui') {
        onChange(createSyntheticEvent(noneId, ''));
      }
      onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
    }
  }, [formData, onChange]);

  // Multi-select helpers
  const getSelectedArray = (fieldName: string): string[] => {
    const val = formData[fieldName];
    if (!val) return [];
    return val.split(', ').filter(Boolean);
  };

  const toggleMulti = (fieldName: string, option: string) => {
    const selected = getSelectedArray(fieldName);
    let next: string[];
    if (selected.includes(option)) {
      next = selected.filter((s: string) => s !== option);
    } else {
      next = [...selected, option];
    }
    onChange(createSyntheticEvent(fieldName, next.join(', ')));
  };

  const problemesCapillairesOptions = ["Aucun", "Cuir chevelu sensible", "Chute de cheveux", "Cheveux cassants"];

  const onglesIds = ['onglesCassants', 'onglesDedoubles', 'onglesProblemeAucun'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.hairCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="couleurCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairColor')}
          </label>
          <select id="couleurCheveux" name="couleurCheveux" value={formData.couleurCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Blonds">{t('volunteers.hairColorOptions.Blonds')}</option>
            <option value="Bruns">{t('volunteers.hairColorOptions.Bruns')}</option>
            <option value="Chatains">{t('volunteers.hairColorOptions.Chatains')}</option>
            <option value="Noirs">{t('volunteers.hairColorOptions.Noirs')}</option>
            <option value="Roux">{t('volunteers.hairColorOptions.Roux')}</option>
            <option value="Gris">{t('volunteers.hairColorOptions.Gris')}</option>
            <option value="Blancs">{t('volunteers.hairColorOptions.Blancs')}</option>
            <option value="Colorés">{t('volunteers.hairColorOptions.Colorés')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="natureCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairNature')}
          </label>
          <div className="flex flex-wrap gap-3 mt-1">
            {['Lisse', 'Ondulé', 'Bouclé', 'Crêpu', 'Frisé'].map((opt) => {
              const selected = getSelectedArray('natureCheveux');
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti('natureCheveux', opt)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    isSelected
                      ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                      : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="epaisseurCheveux" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.hairThickness')}
          </label>
          <select id="epaisseurCheveux" name="epaisseurCheveux" value={formData.epaisseurCheveux} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Fins">{t('volunteers.hairThicknessOptions.Fins')}</option>
            <option value="Moyens">{t('volunteers.hairThicknessOptions.Moyens')}</option>
            <option value="Épais">{t('volunteers.hairThicknessOptions.Épais')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="natureCuirChevelu" className="block text-sm font-medium text-gray-700 mb-1">
            {t('volunteers.scalpNature')}
          </label>
          <select id="natureCuirChevelu" name="natureCuirChevelu" value={formData.natureCuirChevelu} onChange={onChange} className="form-select block w-full">
            <option value="">{t('common.select')}</option>
            <option value="Normal">{t('volunteers.scalpNatureOptions.Normal')}</option>
            <option value="Sec">{t('volunteers.scalpNatureOptions.Sec')}</option>
            <option value="Gras">{t('volunteers.scalpNatureOptions.Gras')}</option>
            <option value="Mixte">{t('volunteers.scalpNatureOptions.Mixte')}</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.resume.fields.problemesCapillaires', 'Problèmes capillaires')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {problemesCapillairesOptions.map((option) => {
          const selected = getSelectedArray('problemesCapillaires');
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleMulti('problemesCapillaires', option)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                isSelected
                  ? "bg-blue-100 border-blue-400 text-blue-800 font-medium"
                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="calvitie"
            name="calvitie"
            checked={formData.calvitie === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label htmlFor="calvitie" className="ml-2 block text-sm font-medium text-gray-700">
            {t('volunteers.resume.fields.calvitie', 'Calvitie')}
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pellicules"
            name="pellicules"
            checked={formData.pellicules === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label htmlFor="pellicules" className="ml-2 block text-sm font-medium text-gray-700">
            {t('volunteers.resume.fields.pellicules', 'Pellicules')}
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="demangeaisonsCuirChevelu"
            name="demangeaisonsCuirChevelu"
            checked={formData.demangeaisonsCuirChevelu === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label htmlFor="demangeaisonsCuirChevelu" className="ml-2 block text-sm font-medium text-gray-700">
            {t('volunteers.resume.fields.demangeaisonsCuirChevelu', 'Démangeaisons du cuir chevelu')}
          </label>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.nails')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox
          noneId="onglesProblemeAucun"
          checked={formData.onglesProblemeAucun === 'Oui'}
          onToggle={() => handleNoneToggle(onglesIds, 'onglesProblemeAucun', 'onglesProblemeAucun', formData.onglesProblemeAucun === 'Oui')}
        />
        <GroupCheckbox
          id="onglesCassants"
          label={t('volunteers.brittleNails')}
          checked={formData.onglesCassants === 'Oui'}
          onToggle={() => handleNoneToggle(onglesIds, 'onglesProblemeAucun', 'onglesCassants', formData.onglesCassants === 'Oui')}
        />
        <GroupCheckbox
          id="onglesDedoubles"
          label={t('volunteers.splitNails')}
          checked={formData.onglesDedoubles === 'Oui'}
          onToggle={() => handleNoneToggle(onglesIds, 'onglesProblemeAucun', 'onglesDedoubles', formData.onglesDedoubles === 'Oui')}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default CheveuxSection;
