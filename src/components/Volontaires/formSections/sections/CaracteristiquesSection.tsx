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
    'MEDITERRANEEN/MAGHREBIN',
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

  // Helpers pour origine père/mère (multi-select stocké en CSV)
  const parseCsv = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val).split(',').map((s) => s.trim()).filter(Boolean);
  };
  const toggleParent = (field: 'originePere' | 'origineMere', option: string) => {
    const current = parseCsv(formData[field]);
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange({ target: { name: field, value: next.join(','), type: 'text' } } as any);
  };

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
            <option value="Phototype 1">Phototype 1 - Peau très claire</option>
            <option value="Phototype 2">Phototype 2 - Peau claire</option>
            <option value="Phototype 3">Phototype 3 - Peau claire à mate</option>
            <option value="Phototype 4">Phototype 4 - Peau mate</option>
            <option value="Phototype 5">Phototype 5 - Peau foncée</option>
            <option value="Phototype 6">Phototype 6 - Peau noire</option>
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

        {/* Section Sous-ethnie avec checkboxes filtrées (multi-sélection illimitée) */}
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('volunteers.fatherOrigin')}
          </label>
          <div className="flex flex-wrap gap-4">
            {ETHNIES_PRINCIPALES.map((ethnie) => {
              const isSelected = parseCsv(formData.originePere).includes(ethnie);
              return (
                <div key={`pere-${ethnie}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`originePere-${ethnie}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleParent('originePere', ethnie)}
                  />
                  <Label
                    htmlFor={`originePere-${ethnie}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(`volunteers.ethnicityOptions.${ethnie}`)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('volunteers.motherOrigin')}
          </label>
          <div className="flex flex-wrap gap-4">
            {ETHNIES_PRINCIPALES.map((ethnie) => {
              const isSelected = parseCsv(formData.origineMere).includes(ethnie);
              return (
                <div key={`mere-${ethnie}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`origineMere-${ethnie}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleParent('origineMere', ethnie)}
                  />
                  <Label
                    htmlFor={`origineMere-${ethnie}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(`volunteers.ethnicityOptions.${ethnie}`)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cicatrices"
              name="cicatrices"
              checked={!!formData.cicatrices}
              onChange={(e) => {
                onChange({ target: { name: 'cicatrices', value: e.target.checked ? (formData.cicatrices || '\u200B') : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="cicatrices"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.scars')}
            </label>
          </div>
          {!!formData.cicatrices && (
            <input
              type="text"
              name="cicatrices"
              value={formData.cicatrices.replace(/\u200B/g, '')}
              onChange={(e) => {
                onChange({ target: { name: 'cicatrices', value: e.target.value || '\u200B', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tatouages"
              name="tatouages"
              checked={!!formData.tatouages}
              onChange={(e) => {
                onChange({ target: { name: 'tatouages', value: e.target.checked ? (formData.tatouages || '\u200B') : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="tatouages"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.tattoos')}
            </label>
          </div>
          {!!formData.tatouages && (
            <input
              type="text"
              name="tatouages"
              value={formData.tatouages.replace(/\u200B/g, '')}
              onChange={(e) => {
                onChange({ target: { name: 'tatouages', value: e.target.value || '\u200B', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="piercings"
              name="piercings"
              checked={!!formData.piercings}
              onChange={(e) => {
                onChange({ target: { name: 'piercings', value: e.target.checked ? (formData.piercings || '\u200B') : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="piercings"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.piercings')}
            </label>
          </div>
          {!!formData.piercings && (
            <input
              type="text"
              name="piercings"
              value={formData.piercings.replace(/\u200B/g, '')}
              onChange={(e) => {
                onChange({ target: { name: 'piercings', value: e.target.value || '\u200B', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maquillagePermanent"
              name="maquillagePermanent"
              checked={!!formData.maquillagePermanent}
              onChange={(e) => {
                onChange({ target: { name: 'maquillagePermanent', value: e.target.checked ? (formData.maquillagePermanent || '\u200B') : '', type: 'text' } } as any);
              }}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="maquillagePermanent"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t('volunteers.permanentMakeup', 'Maquillage permanent')}
            </label>
          </div>
          {!!formData.maquillagePermanent && (
            <input
              type="text"
              name="maquillagePermanent"
              value={formData.maquillagePermanent.replace(/\u200B/g, '')}
              onChange={(e) => {
                onChange({ target: { name: 'maquillagePermanent', value: e.target.value || '\u200B', type: 'text' } } as any);
              }}
              placeholder={t('volunteers.locationPlaceholder')}
              className="form-input block w-full mt-2"
            />
          )}
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default CaracteristiquesSection;
