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

const MultiSelectGroup = ({
  options,
  title,
  selected,
  onToggle,
}: {
  options: string[];
  title: string;
  selected: string[];
  onToggle: (option: string) => void;
}) => (
  <>
    <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
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
  </>
);

const PeauSection = ({ formData, errors, onChange }: any) => {
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

  const celluliteIds = ['celluliteBras', 'celluliteFessesHanches', 'celluliteJambes', 'celluliteVentreTaille', 'celluliteAucun'];

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

  const secheresseOptions = ["Aucune", "Lèvres", "Cou", "Poitrine / Décolleté", "Ventre / Taille", "Fesses / Hanches", "Bras", "Mains", "Avant-bras", "Jambes", "Pieds"];
  const yeuxOptions = ["Aucun", "Cernes pigmentaires", "Cernes vasculaires", "Poches"];
  const fermeteOptions = ["Aucune", "Visage", "Cou", "Décolleté / Poitrine", "Avant-bras"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.skinCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="sensibiliteCutanee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.skinSensitivity')}
          </label>
          <select
            id="sensibiliteCutanee"
            name="sensibiliteCutanee"
            value={formData.sensibiliteCutanee}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Peau sensible">{t('volunteers.skinSensitivityOptions.Peau sensible')}</option>
            <option value="Peau non sensible">{t('volunteers.skinSensitivityOptions.Peau non sensible')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="carnation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.complexion')}
          </label>
          <select
            id="carnation"
            name="carnation"
            value={formData.carnation}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Très claire">{t('volunteers.complexionOptions.Très claire')}</option>
            <option value="Claire">{t('volunteers.complexionOptions.Claire')}</option>
            <option value="Moyenne">{t('volunteers.complexionOptions.Moyenne')}</option>
            <option value="Mate">{t('volunteers.complexionOptions.Mate')}</option>
            <option value="Foncée">{t('volunteers.complexionOptions.Foncée')}</option>
            <option value="Très foncée">{t('volunteers.complexionOptions.Très foncée')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="typePeau"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.skinType')} <span className="text-red-500">*</span>
          </label>
          <select
            id="typePeau"
            name="typePeauVisage"
            value={formData.typePeauVisage || ""}
            onChange={onChange}
            className={`form-select block w-full ${errors.typePeauVisage ? "border-red-500" : ""}`}
            required
          >
            <option value="">{t('common.select')}</option>
            <option value="Normale">{t('volunteers.skinTypeOptions.Normale')}</option>
            <option value="Sèche">{t('volunteers.skinTypeOptions.Sèche')}</option>
            <option value="Grasse">{t('volunteers.skinTypeOptions.Grasse')}</option>
            <option value="Mixte">{t('volunteers.skinTypeOptions.Mixte')}</option>
            <option value="Mixte à tendance grasse">{t('volunteers.skinTypeOptions.Mixte à tendance grasse')}</option>
            <option value="Mixte à tendance sèche">{t('volunteers.skinTypeOptions.Mixte à tendance sèche')}</option>
          </select>
          {errors.typePeauVisage && (
            <p className="mt-1 text-sm text-red-500">{errors.typePeauVisage}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="teintInhomogene"
            name="teintInhomogene"
            checked={formData.teintInhomogene === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="teintInhomogene"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.unevenComplexion')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="teintTerne"
            name="teintTerne"
            checked={formData.teintTerne === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="teintTerne"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.dullComplexion')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="poresVisibles"
            name="poresVisibles"
            checked={formData.poresVisibles === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="poresVisibles"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.visiblePores')}
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.sunExposure')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="expositionSolaire"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.sunExposure')}
          </label>
          <select
            id="expositionSolaire"
            name="expositionSolaire"
            value={formData.expositionSolaire}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Faiblement">{t('volunteers.sunExposureOptions.Faiblement')}</option>
            <option value="Moyennement">{t('volunteers.sunExposureOptions.Moyennement')}</option>
            <option value="Fortement">{t('volunteers.sunExposureOptions.Fortement')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="bronzage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.tanning')}
          </label>
          <select
            id="bronzage"
            name="bronzage"
            value={formData.bronzage}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Progressif">{t('volunteers.tanningOptions.Progressif')}</option>
            <option value="Rapide">{t('volunteers.tanningOptions.Rapide')}</option>
            <option value="Difficile">{t('volunteers.tanningOptions.Difficile')}</option>
            <option value="Inexistant">{t('volunteers.tanningOptions.Inexistant')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="coupsDeSoleil"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.sunburns')}
          </label>
          <select
            id="coupsDeSoleil"
            name="coupsDeSoleil"
            value={formData.coupsDeSoleil}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Jamais">{t('volunteers.sunburnOptions.Jamais')}</option>
            <option value="Rarement">{t('volunteers.sunburnOptions.Rarement')}</option>
            <option value="Parfois">{t('volunteers.sunburnOptions.Parfois')}</option>
            <option value="Souvent">{t('volunteers.sunburnOptions.Souvent')}</option>
            <option value="Toujours">{t('volunteers.sunburnOptions.Toujours')}</option>
          </select>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.cellulite')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox
          noneId="celluliteAucun"
          checked={formData.celluliteAucun === 'Oui'}
          onToggle={() => handleNoneToggle(celluliteIds, 'celluliteAucun', 'celluliteAucun', formData.celluliteAucun === 'Oui')}
        />
        <GroupCheckbox
          id="celluliteBras"
          label={t('volunteers.celluliteArms')}
          checked={formData.celluliteBras === 'Oui'}
          onToggle={() => handleNoneToggle(celluliteIds, 'celluliteAucun', 'celluliteBras', formData.celluliteBras === 'Oui')}
        />
        <GroupCheckbox
          id="celluliteFessesHanches"
          label={t('volunteers.celluliteButtocksHips')}
          checked={formData.celluliteFessesHanches === 'Oui'}
          onToggle={() => handleNoneToggle(celluliteIds, 'celluliteAucun', 'celluliteFessesHanches', formData.celluliteFessesHanches === 'Oui')}
        />
        <GroupCheckbox
          id="celluliteJambes"
          label={t('volunteers.celluliteLegs')}
          checked={formData.celluliteJambes === 'Oui'}
          onToggle={() => handleNoneToggle(celluliteIds, 'celluliteAucun', 'celluliteJambes', formData.celluliteJambes === 'Oui')}
        />
        <GroupCheckbox
          id="celluliteVentreTaille"
          label={t('volunteers.celluliteBellyWaist')}
          checked={formData.celluliteVentreTaille === 'Oui'}
          onToggle={() => handleNoneToggle(celluliteIds, 'celluliteAucun', 'celluliteVentreTaille', formData.celluliteVentreTaille === 'Oui')}
        />
      </div>

      <MultiSelectGroup
        options={secheresseOptions}
        title={t('volunteers.skinDryness')}
        selected={getSelectedArray('secheressePeau')}
        onToggle={(opt) => toggleMulti('secheressePeau', opt)}
      />

      <MultiSelectGroup
        options={fermeteOptions}
        title={t('volunteers.lossOfFirmness')}
        selected={getSelectedArray('perteDeFermete')}
        onToggle={(opt) => toggleMulti('perteDeFermete', opt)}
      />

      <MultiSelectGroup
        options={yeuxOptions}
        title={t('volunteers.eyeProblems')}
        selected={getSelectedArray('problemesYeux')}
        onToggle={(opt) => toggleMulti('problemesYeux', opt)}
      />

      </CardContent>
    </Card>
  );
};

export default PeauSection;
