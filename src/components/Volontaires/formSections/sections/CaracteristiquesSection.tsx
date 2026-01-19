import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

// Définition des ethnies principales
const ETHNIES_PRINCIPALES = [
  'Caucasienne',
  'Africaine',
  'Antillaise',
  'Indienne',
  'Asiatique'
] as const;

// Mapping des sous-ethnies par ethnie principale (clés de traduction)
const SOUS_ETHNIES_PAR_ETHNIE: Record<string, string[]> = {
  'Caucasienne': [
    'EUROP_OUEST',
    'EUROP_EST',
    'MEDITERRANEEN',
    'NORD_AMERICAIN_CAUCASIEN',
    'SUD_AMERICAIN_CAUCASIEN'
  ],
  'Africaine': [
    'AF_SUBSAHARIEN',
    'AF_OUEST',
    'AF_EST',
    'AF_CENTRALE',
    'AF_NORD'
  ],
  'Antillaise': [
    'AFRO_CARABEEN',
    'ANTILLAIS_METISSE',
    'CARIBEENNE',
    'AFRO_DESCENDANT_CARAIBES'
  ],
  'Indienne': [
    'IND_NORD',
    'IND_SUD',
    'INDO_ARYENNE',
    'DRAVIDIENNE',
    'INDO_PAKISTANAISE'
  ],
  'Asiatique': [
    'AS_EST',
    'AS_SUD_EST',
    'AS_SUD',
    'AS_CENTRALE'
  ]
};

const CaracteristiquesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  // Parser les ethnies (peut être un string séparé par des virgules ou un tableau)
  const getEthniesArray = (): string[] => {
    if (!formData.ethnie) return [];
    if (Array.isArray(formData.ethnie)) return formData.ethnie;
    return formData.ethnie.split(',').filter((e: string) => e.trim() !== '');
  };

  // Parser les sous-ethnies (peut être un string séparé par des virgules ou un tableau)
  const getSousEthniesArray = (): string[] => {
    if (!formData.sousEthnie) return [];
    if (Array.isArray(formData.sousEthnie)) return formData.sousEthnie;
    return formData.sousEthnie.split(',').filter((e: string) => e.trim() !== '');
  };

  const ethniesSelectionnees = getEthniesArray();
  const sousEthniesSelectionnees = getSousEthniesArray();

  // Gérer le changement d'ethnie principale (max 2 ethnies)
  const handleEthnieChange = (ethnie: string) => {
    let newEthnies: string[];

    if (ethniesSelectionnees.includes(ethnie)) {
      // Désélectionner l'ethnie
      newEthnies = ethniesSelectionnees.filter(e => e !== ethnie);
      // Retirer les sous-ethnies liées à cette ethnie
      const sousEthniesDeEthnie = SOUS_ETHNIES_PAR_ETHNIE[ethnie] || [];
      const newSousEthnies = sousEthniesSelectionnees.filter(
        se => !sousEthniesDeEthnie.includes(se)
      );
      onChange({ target: { name: 'sousEthnie', value: newSousEthnies.join(',') } });
    } else {
      // Ajouter l'ethnie (max 2)
      if (ethniesSelectionnees.length >= 2) {
        // Déjà 2 ethnies, on ne peut pas en ajouter plus
        return;
      }
      newEthnies = [...ethniesSelectionnees, ethnie];
    }

    onChange({ target: { name: 'ethnie', value: newEthnies.join(',') } });
  };

  // Gérer le changement de sous-ethnie (toggle)
  const handleSousEthnieChange = (sousEthnie: string) => {
    let newSousEthnies: string[];

    if (sousEthniesSelectionnees.includes(sousEthnie)) {
      // Désélectionner
      newSousEthnies = sousEthniesSelectionnees.filter(se => se !== sousEthnie);
    } else {
      // Sélectionner
      newSousEthnies = [...sousEthniesSelectionnees, sousEthnie];
    }

    onChange({ target: { name: 'sousEthnie', value: newSousEthnies.join(',') } });
  };

  // Obtenir les sous-ethnies disponibles basées sur les ethnies sélectionnées
  const getSousEthniesDisponibles = (): string[] => {
    if (ethniesSelectionnees.length === 0) return [];

    // Combiner les sous-ethnies de toutes les ethnies sélectionnées
    const toutesLesSousEthnies: string[] = [];
    ethniesSelectionnees.forEach(ethnie => {
      const sousEthnies = SOUS_ETHNIES_PAR_ETHNIE[ethnie] || [];
      toutesLesSousEthnies.push(...sousEthnies);
    });

    return toutesLesSousEthnies;
  };

  const sousEthniesDisponibles = getSousEthniesDisponibles();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.physicalCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="taille"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.height')} (cm)
          </label>
          <input
            type="number"
            id="taille"
            name="taille"
            value={formData.taille}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="poids"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.weight')} (kg)
          </label>
          <input
            type="number"
            id="poids"
            name="poids"
            value={formData.poids}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="phototype"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.phototype')}
          </label>
          <select
            id="phototype"
            name="phototype"
            value={formData.phototype}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="I">{t('volunteers.phototypeOptions.I')}</option>
            <option value="II">{t('volunteers.phototypeOptions.II')}</option>
            <option value="III">{t('volunteers.phototypeOptions.III')}</option>
            <option value="IV">{t('volunteers.phototypeOptions.IV')}</option>
            <option value="V">{t('volunteers.phototypeOptions.V')}</option>
            <option value="VI">{t('volunteers.phototypeOptions.VI')}</option>
          </select>
        </div>

        {/* Section Ethnie principale avec checkboxes (max 2) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('volunteers.ethnicity')} <span className="text-xs text-gray-500">(max 2)</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {ETHNIES_PRINCIPALES.map((ethnie) => {
              const isSelected = ethniesSelectionnees.includes(ethnie);
              const isDisabled = !isSelected && ethniesSelectionnees.length >= 2;
              return (
                <div key={ethnie} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ethnie-${ethnie}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => handleEthnieChange(ethnie)}
                  />
                  <Label
                    htmlFor={`ethnie-${ethnie}`}
                    className={`text-sm font-normal cursor-pointer ${isDisabled ? 'text-gray-400' : ''}`}
                  >
                    {t(`volunteers.ethnicityOptions.${ethnie}`)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Sous-ethnie avec checkboxes filtrées (multi-sélection) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('volunteers.subEthnicity')}
          </label>
          {sousEthniesDisponibles.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {sousEthniesDisponibles.map((sousEthnie) => (
                <div key={sousEthnie} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sousEthnie-${sousEthnie}`}
                    checked={sousEthniesSelectionnees.includes(sousEthnie)}
                    onCheckedChange={() => handleSousEthnieChange(sousEthnie)}
                  />
                  <Label
                    htmlFor={`sousEthnie-${sousEthnie}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(`volunteers.subEthnicityOptions.${sousEthnie}`, sousEthnie)}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {t('volunteers.selectEthnicityFirst') || 'Sélectionnez d\'abord une origine ethnique'}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="yeux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.eyeColor')}
          </label>
          <select
            id="yeux"
            name="yeux"
            value={formData.yeux}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Bleus">{t('volunteers.eyeColorOptions.Bleus')}</option>
            <option value="Verts">{t('volunteers.eyeColorOptions.Verts')}</option>
            <option value="Marrons">{t('volunteers.eyeColorOptions.Marrons')}</option>
            <option value="Noisette">{t('volunteers.eyeColorOptions.Noisette')}</option>
            <option value="Gris">{t('volunteers.eyeColorOptions.Gris')}</option>
            <option value="Noirs">{t('volunteers.eyeColorOptions.Noirs')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="pilosite"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairiness')}
          </label>
          <select
            id="pilosite"
            name="pilosite"
            value={formData.pilosite}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Faible_pilosite">{t('volunteers.hairinessOptions.Faible_pilosite')}</option>
            <option value="Moyenne_pilosite">{t('volunteers.hairinessOptions.Moyenne_pilosite')}</option>
            <option value="Forte_pilosite">{t('volunteers.hairinessOptions.Forte_pilosite')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="originePere"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.fatherOrigin')}
          </label>
          <input
            type="text"
            id="originePere"
            name="originePere"
            value={formData.originePere}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="origineMere"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.motherOrigin')}
          </label>
          <input
            type="text"
            id="origineMere"
            name="origineMere"
            value={formData.origineMere}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default CaracteristiquesSection;
