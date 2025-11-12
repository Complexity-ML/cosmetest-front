import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

// Types
interface Panel {
  idPanel: number;
  nom: string;
  prenom: string;
  sexe: string;
  age: number;
  phototype: string;
  [key: string]: any;
}

interface PanelHcFormData {
  panelId: string;
  achatPharmacieParapharmacie: string;
  achatGrandesSurfaces: string;
  achatInstitutParfumerie: string;
  achatInternet: string;
  produitsBio: string;
  rasoir: string;
  epilateurElectrique: string;
  cire: string;
  cremeDepilatoire: string;
  institut: string;
  epilationDefinitive: string;
  soinHydratantVisage: string;
  soinAntiAgeVisage: string;
  soinAntiRidesVisage: string;
  soinAntiTachesVisage: string;
  soinMatifiantVisage: string;
  soinNourissantVisage: string;
  soinRaffermissantVisage: string;
  soinAntiRougeursVisage: string;
  soinEclatDuTeint: string;
  soinContourDesYeux: string;
  soinContourDesLevres: string;
  demaquillantVisage: string;
  demaquillantYeux: string;
  demaquillantWaterproof: string;
  gelNettoyant: string;
  lotionMicellaire: string;
  tonique: string;
  soinHydratantCorps: string;
  soinNourrissantCorps: string;
  soinRaffermissantCorps: string;
  soinAmincissant: string;
  soinAntiCellulite: string;
  soinAntiVergetures: string;
  soinAntiAgeCorps: string;
  gommageCorps: string;
  masqueCorps: string;
  soinHydratantMains: string;
  soinNourrissantMains: string;
  soinAntiAgeMains: string;
  soinAntiTachesMains: string;
  soinPieds: string;
  soinOngles: string;
  gelDouche: string;
  laitDouche: string;
  savon: string;
  produitsBain: string;
  nettoyantIntime: string;
  deodorant: string;
  antiTranspirant: string;
  shampoing: string;
  apresShampoing: string;
  masqueCapillaire: string;
  produitCoiffantFixant: string;
  colorationMeches: string;
  permanente: string;
  lissageDefrisage: string;
  extensionsCapillaires: string;
  fondDeTeint: string;
  poudreLibre: string;
  blushFardAJoues: string;
  correcteurTeint: string;
  anticerne: string;
  baseMaquillage: string;
  cremeTeintee: string;
  mascara: string;
  mascaraWaterproof: string;
  crayonsYeux: string;
  eyeliner: string;
  fardAPaupieres: string;
  maquillageDesSourcils: string;
  fauxCils: string;
  rougeALevres: string;
  gloss: string;
  crayonLevres: string;
  vernisAOngles: string;
  dissolvantOngles: string;
  fauxOngles: string;
  manucures: string;
  maquillagePermanentYeux: string;
  maquillagePermanentLevres: string;
  maquillagePermanentSourcils: string;
  protecteurSolaireVisage: string;
  protecteurSolaireCorps: string;
  protecteurSolaireLevres: string;
  soinApresSoleil: string;
  autobronzant: string;
  parfum: string;
  eauDeToilette: string;
  commentaires: string;
  budgetMensuelCosmetiques?: string;
  [key: string]: any;
}

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string | null;
  options?: Array<string | { value: string | number; label: string }> | null;
  placeholder?: string;
  infoTooltip?: string | null;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  icon?: React.ReactNode | null;
}

interface CheckboxFieldProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

// Import des icônes
import saveSvg from '../../assets/icons/save.svg';
import arrowLeftSvg from '../../assets/icons/arrow-left.svg';
import userPlusSvg from '../../assets/icons/user-plus.svg';
import userEditSvg from '../../assets/icons/user-edit.svg';
import infoSvg from '../../assets/icons/info.svg';
import alertCircleSvg from '../../assets/icons/alert-circle.svg';
import shoppingBagSvg from '../../assets/icons/shopping-bag.svg';
import brushSvg from '../../assets/icons/brush.svg';
import dropletSvg from '../../assets/icons/droplet.svg';
import scissorsSvg from '../../assets/icons/scissors.svg';
import userSvg from '../../assets/icons/user.svg'; // Important: ajout de l'import manquant

const IconSave: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={saveSvg} width={width} height={height} className={className} alt="Save" {...props} />
);

const IconArrowLeft: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={arrowLeftSvg} width={width} height={height} className={className} alt="Arrow Left" {...props} />
);

const IconUserPlus: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={userPlusSvg} width={width} height={height} className={className} alt="User Plus" {...props} />
);

const IconUserEdit: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={userEditSvg} width={width} height={height} className={className} alt="User Edit" {...props} />
);

const IconInfo: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={infoSvg} width={width} height={height} className={className} alt="Info" {...props} />
);

const IconAlertCircle: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={alertCircleSvg} width={width} height={height} className={className} alt="Alert Circle" {...props} />
);

const IconShoppingBag: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={shoppingBagSvg} width={width} height={height} className={className} alt="Shopping Bag" {...props} />
);

const IconBrush: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={brushSvg} width={width} height={height} className={className} alt="Brush" {...props} />
);

const IconDroplet: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={dropletSvg} width={width} height={height} className={className} alt="Droplet" {...props} />
);

const IconScissors: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={scissorsSvg} width={width} height={height} className={className} alt="Scissors" {...props} />
);

const IconUser: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={userSvg} width={width} height={height} className={className} alt="User" {...props} />
);

// Options pour les sélections
const produitsBioOptions: string[] = ['Oui', 'Non', 'Parfois'];


// Ajout du composant FormField manquant
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required = false,
  error = null,
  options = null,
  placeholder = '',
  infoTooltip = null,
  className = ''
}) => {
  const inputClasses = `mt-1 block w-full rounded-md ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    } shadow-sm sm:text-sm`;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          {infoTooltip && (
            <span className="ml-1 inline-block">
              <div className="group relative">
                <IconInfo width={16} height={16} className="inline text-gray-400 hover:text-gray-500" />
                <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -mt-1 ml-6">
                  {infoTooltip}
                </div>
              </div>
            </span>
          )}
        </label>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          className={inputClasses}
          required={required}
        >
          <option value="">Sélectionner...</option>
          {Array.isArray(options) ? (
            options.map((option: string | { value: string | number; label: string }) => (
              <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label}
              </option>
            ))
          ) : null}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          rows={3}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

// Composant CollapsibleSection (déjà présent dans PanelForm.jsx)
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpen = false, icon = null }) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="mb-6">
      <button
        type="button"
        className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-3 focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </span>
        <svg className={`h-5 w-5 transform ${open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className={`transition-all duration-200 ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

// Composant CheckboxField pour les options oui/non
const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, id, checked, onChange, className = "" }) => {
  return (
    <div className={`flex items-center mb-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

// Composant principal PanelHcForm
const PanelHcForm = () => {
  const { idPanel } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(idPanel);

  // État du formulaire étendu avec tous les champs
  const [formData, setFormData] = useState<PanelHcFormData>({
    panelId: '',
    // Lieux d'achat
    achatPharmacieParapharmacie: '',
    achatGrandesSurfaces: '',
    achatInstitutParfumerie: '',
    achatInternet: '',
    produitsBio: '',

    // Épilation
    rasoir: '',
    epilateurElectrique: '',
    cire: '',
    cremeDepilatoire: '',
    institut: '',
    epilationDefinitive: '',

    // Soins du visage
    soinHydratantVisage: '',
    soinAntiAgeVisage: '',
    soinAntiRidesVisage: '',
    soinAntiTachesVisage: '',
    soinMatifiantVisage: '',
    soinNourissantVisage: '',
    soinRaffermissantVisage: '',
    soinAntiRougeursVisage: '',
    soinEclatDuTeint: '',
    soinContourDesYeux: '',
    soinContourDesLevres: '',

    // Démaquillage et nettoyage
    demaquillantVisage: '',
    demaquillantYeux: '',
    demaquillantWaterproof: '',
    gelNettoyant: '',
    lotionMicellaire: '',
    tonique: '',

    // Soins du corps
    soinHydratantCorps: '',
    soinNourrissantCorps: '',
    soinRaffermissantCorps: '',
    soinAmincissant: '',
    soinAntiCellulite: '',
    soinAntiVergetures: '',
    soinAntiAgeCorps: '',
    gommageCorps: '',
    masqueCorps: '',

    // Soins spécifiques
    soinHydratantMains: '',
    soinNourrissantMains: '',
    soinAntiAgeMains: '',
    soinAntiTachesMains: '',
    soinPieds: '',
    soinOngles: '',

    // Produits d'hygiène
    gelDouche: '',
    laitDouche: '',
    savon: '',
    produitsBain: '',
    nettoyantIntime: '',
    deodorant: '',
    antiTranspirant: '',

    // Soins capillaires
    shampoing: '',
    apresShampoing: '',
    masqueCapillaire: '',
    produitCoiffantFixant: '',
    colorationMeches: '',
    permanente: '',
    lissageDefrisage: '',
    extensionsCapillaires: '',

    // Maquillage visage
    fondDeTeint: '',
    poudreLibre: '',
    blushFardAJoues: '',
    correcteurTeint: '',
    anticerne: '',
    baseMaquillage: '',
    cremeTeintee: '',

    // Maquillage yeux
    mascara: '',
    mascaraWaterproof: '',
    crayonsYeux: '',
    eyeliner: '',
    fardAPaupieres: '',
    maquillageDesSourcils: '',
    fauxCils: '',

    // Maquillage lèvres et ongles
    rougeALevres: '',
    gloss: '',
    crayonLevres: '',
    vernisAOngles: '',
    dissolvantOngles: '',
    fauxOngles: '',
    manucures: '',

    // Maquillage permanent
    maquillagePermanentYeux: '',
    maquillagePermanentLevres: '',
    maquillagePermanentSourcils: '',

    // Solaire
    protecteurSolaireVisage: '',
    protecteurSolaireCorps: '',
    protecteurSolaireLevres: '',
    soinApresSoleil: '',
    autobronzant: '',

    // Parfums
    parfum: '',
    eauDeToilette: '',

    // Commentaires
    commentaires: '',
    budgetMensuelCosmetiques: ''
  });

  // État pour la liste des panels disponibles et autres états inchangés
  const [availablePanels, setAvailablePanels] = useState<Panel[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Charger les panels disponibles
  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const response = await api.get('/panels');
        setAvailablePanels(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des panels:', error);
        setSubmitError('Impossible de charger la liste des panels.');
      }
    };

    fetchPanels();
  }, []);

  // Charger les données du panel HC en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchPanelHcData = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/panels-hc/${idPanel}`);
          setFormData(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des données du panel HC:', error);
          setSubmitError('Impossible de charger les données du panel HC.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPanelHcData();
    }
  }, [idPanel, isEditMode]);

  // Gestion des changements dans le formulaire - adaptée pour checkboxes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked ? 'Oui' : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Valider les champs obligatoires
    if (!formData.panelId) newErrors.panelId = 'Le panel est obligatoire';
    //if (!formData.lieuAchatPrincipal) newErrors.lieuAchatPrincipal = 'Le lieu d\'achat principal est obligatoire';

    // Validation du budget mensuel (doit être un nombre)
    if (formData.budgetMensuelCosmetiques && isNaN(Number(formData.budgetMensuelCosmetiques))) {
      newErrors.budgetMensuelCosmetiques = 'Le budget doit être un nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification de la validité du formulaire
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setSubmitError('');

    try {
      if (isEditMode) {
        const response = await api.put(`/panels-hc/${idPanel}`, formData);
        console.log('Réponse de l\'API:', response);
        navigate(`/panels-hc/${idPanel}`);
      } else {
        const response = await api.post('/panels-hc', formData);
        console.log('Réponse de l\'API:', response);
        navigate(`/panels-hc/${response.data.idPanel}`);
      }
    } catch (error: unknown) {
      console.error('Erreur complète:', error);
      const err = error as any;
      console.error('Message d\'erreur:', err.message);
      console.error('Réponse d\'erreur:', err.response);
      setSubmitError(err.response?.data?.message || 'Une erreur est survenue lors de la soumission du formulaire.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Trouver les informations du panel sélectionné
  const selectedPanel = availablePanels.find(p => p.idPanel === parseInt(formData.panelId));

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/panels-hc" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
            <IconArrowLeft width={16} height={16} className="mr-1" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {isEditMode ? (
              <>
                <IconUserEdit width={24} height={24} className="mr-2 text-blue-600" />
                Modifier un panel HC
              </>
            ) : (
              <>
                <IconUserPlus width={24} height={24} className="mr-2 text-blue-600" />
                Ajouter un panel HC
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Switch pour basculer entre Panels et Panels HC */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <Link
            to="/panels"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.includes('/panels') && !location.pathname.includes('/panels-hc')
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Panels
          </Link>
          <Link
            to="/panels-hc"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.includes('/panels-hc')
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Habitudes Cosmétiques
          </Link>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <IconAlertCircle width={20} height={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Section sélection du panel */}
        <CollapsibleSection
          title="Sélection du panel"
          isOpen={true}
          icon={<IconUser width={20} height={20} className="text-blue-600" />}
        >
          <div className="mb-6">
            <FormField
              label="Panel associé"
              id="panelId"
              type="select"
              value={formData.panelId}
              onChange={handleChange}
              options={availablePanels.map(panel => ({
                value: panel.idPanel,
                label: `${panel.nom} ${panel.prenom} (ID: ${panel.idPanel})`
              }))}
              required
              error={errors.panelId}
            />

            {selectedPanel && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                    <IconUser width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-medium">{selectedPanel.nom} {selectedPanel.prenom}</p>
                    <p className="text-sm text-gray-600">
                      {selectedPanel.sexe}, {selectedPanel.age} ans - Phototype {selectedPanel.phototype}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Section habitudes d'achat */}
        <CollapsibleSection
          title="Habitudes d'achat"
          isOpen={true}
          icon={<IconShoppingBag width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <p className="mb-2 font-medium text-gray-700">Lieux d'achat préférés</p>
              <CheckboxField
                label="Pharmacie/Parapharmacie"
                id="achatPharmacieParapharmacie"
                checked={formData.achatPharmacieParapharmacie === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Grandes surfaces"
                id="achatGrandesSurfaces"
                checked={formData.achatGrandesSurfaces === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Institut/Parfumerie"
                id="achatInstitutParfumerie"
                checked={formData.achatInstitutParfumerie === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Internet"
                id="achatInternet"
                checked={formData.achatInternet === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="Utilisation de produits bio"
              id="produitsBio"
              type="select"
              value={formData.produitsBio}
              onChange={handleChange}
              options={produitsBioOptions}
            />
          </div>
        </CollapsibleSection>

        {/* Section épilation */}
        <CollapsibleSection
          title="Méthodes d'épilation"
          icon={<IconScissors width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <p className="mb-2 font-medium text-gray-700">Méthodes utilisées</p>
              <CheckboxField
                label="Rasoir"
                id="rasoir"
                checked={formData.rasoir === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Épilateur électrique"
                id="epilateurElectrique"
                checked={formData.epilateurElectrique === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Cire"
                id="cire"
                checked={formData.cire === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Crème dépilatoire"
                id="cremeDepilatoire"
                checked={formData.cremeDepilatoire === 'Oui'}
                onChange={handleChange}
              />
            </div>
            <div>
              <p className="mb-2 font-medium text-gray-700">Méthodes professionnelles</p>
              <CheckboxField
                label="Institut"
                id="institut"
                checked={formData.institut === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Épilation définitive (laser, lumière pulsée...)"
                id="epilationDefinitive"
                checked={formData.epilationDefinitive === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section soins du visage */}
        <CollapsibleSection
          title="Soins du visage"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
            <div>
              <p className="mb-2 font-medium text-gray-700">Soins de base</p>
              <CheckboxField
                label="Soin hydratant"
                id="soinHydratantVisage"
                checked={formData.soinHydratantVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin nourrissant"
                id="soinNourissantVisage"
                checked={formData.soinNourissantVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin matifiant"
                id="soinMatifiantVisage"
                checked={formData.soinMatifiantVisage === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">Soins spécifiques</p>
              <CheckboxField
                label="Soin anti-âge"
                id="soinAntiAgeVisage"
                checked={formData.soinAntiAgeVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin anti-rides"
                id="soinAntiRidesVisage"
                checked={formData.soinAntiRidesVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin anti-taches"
                id="soinAntiTachesVisage"
                checked={formData.soinAntiTachesVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin anti-rougeurs"
                id="soinAntiRougeursVisage"
                checked={formData.soinAntiRougeursVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin éclat du teint"
                id="soinEclatDuTeint"
                checked={formData.soinEclatDuTeint === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin raffermissant"
                id="soinRaffermissantVisage"
                checked={formData.soinRaffermissantVisage === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">Zones spécifiques</p>
              <CheckboxField
                label="Contour des yeux"
                id="soinContourDesYeux"
                checked={formData.soinContourDesYeux === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Contour des lèvres"
                id="soinContourDesLevres"
                checked={formData.soinContourDesLevres === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section démaquillage et nettoyage */}
        <CollapsibleSection
          title="Démaquillage et nettoyage"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <CheckboxField
                label="Démaquillant visage"
                id="demaquillantVisage"
                checked={formData.demaquillantVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Démaquillant yeux"
                id="demaquillantYeux"
                checked={formData.demaquillantYeux === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Démaquillant waterproof"
                id="demaquillantWaterproof"
                checked={formData.demaquillantWaterproof === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <CheckboxField
                label="Gel nettoyant"
                id="gelNettoyant"
                checked={formData.gelNettoyant === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Lotion micellaire"
                id="lotionMicellaire"
                checked={formData.lotionMicellaire === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Tonique"
                id="tonique"
                checked={formData.tonique === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section soins du corps */}
        <CollapsibleSection
          title="Soins du corps"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
            <div>
              <p className="mb-2 font-medium text-gray-700">Soins de base</p>
              <CheckboxField
                label="Soin hydratant"
                id="soinHydratantCorps"
                checked={formData.soinHydratantCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin nourrissant"
                id="soinNourrissantCorps"
                checked={formData.soinNourrissantCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Gommage"
                id="gommageCorps"
                checked={formData.gommageCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Masque"
                id="masqueCorps"
                checked={formData.masqueCorps === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">Soins spécifiques</p>
              <CheckboxField
                label="Soin anti-âge"
                id="soinAntiAgeCorps"
                checked={formData.soinAntiAgeCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin raffermissant"
                id="soinRaffermissantCorps"
                checked={formData.soinRaffermissantCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin amincissant"
                id="soinAmincissant"
                checked={formData.soinAmincissant === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Anti-cellulite"
                id="soinAntiCellulite"
                checked={formData.soinAntiCellulite === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Anti-vergetures"
                id="soinAntiVergetures"
                checked={formData.soinAntiVergetures === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">Zones spécifiques</p>
              <CheckboxField
                label="Soin des mains hydratant"
                id="soinHydratantMains"
                checked={formData.soinHydratantMains === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin des mains nourrissant"
                id="soinNourrissantMains"
                checked={formData.soinNourrissantMains === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin des mains anti-âge"
                id="soinAntiAgeMains"
                checked={formData.soinAntiAgeMains === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin des mains anti-taches"
                id="soinAntiTachesMains"
                checked={formData.soinAntiTachesMains === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin des pieds"
                id="soinPieds"
                checked={formData.soinPieds === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Soin des ongles"
                id="soinOngles"
                checked={formData.soinOngles === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section hygiène */}
        <CollapsibleSection
          title="Produits d'hygiène"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <CheckboxField
                label="Gel douche"
                id="gelDouche"
                checked={formData.gelDouche === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Lait douche"
                id="laitDouche"
                checked={formData.laitDouche === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Savon"
                id="savon"
                checked={formData.savon === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Produits pour le bain"
                id="produitsBain"
                checked={formData.produitsBain === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <CheckboxField
                label="Nettoyant intime"
                id="nettoyantIntime"
                checked={formData.nettoyantIntime === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Déodorant"
                id="deodorant"
                checked={formData.deodorant === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Anti-transpirant"
                id="antiTranspirant"
                checked={formData.antiTranspirant === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section capillaire */}
        <CollapsibleSection
          title="Soins capillaires"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <p className="mb-2 font-medium text-gray-700">Produits d'entretien</p>
              <CheckboxField
                label="Shampooing"
                id="shampoing"
                checked={formData.shampoing === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Après-shampooing"
                id="apresShampoing"
                checked={formData.apresShampoing === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Masque capillaire"
                id="masqueCapillaire"
                checked={formData.masqueCapillaire === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Produit coiffant/fixant"
                id="produitCoiffantFixant"
                checked={formData.produitCoiffantFixant === 'Oui'}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">Traitements</p>
              <CheckboxField
                label="Coloration/Mèches"
                id="colorationMeches"
                checked={formData.colorationMeches === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Permanente"
                id="permanente"
                checked={formData.permanente === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Lissage/Défrisage"
                id="lissageDefrisage"
                checked={formData.lissageDefrisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Extensions capillaires"
                id="extensionsCapillaires"
                checked={formData.extensionsCapillaires === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section maquillage */}
        <CollapsibleSection
          title="Maquillage"
          icon={<IconBrush width={20} height={20} className="text-blue-600" />}
        >
          {/* Maquillage visage */}
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Maquillage du visage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <div>
                <CheckboxField
                  label="Fond de teint"
                  id="fondDeTeint"
                  checked={formData.fondDeTeint === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Poudre libre"
                  id="poudreLibre"
                  checked={formData.poudreLibre === 'Oui'}
                  onChange={handleChange}
                />
              </div>
              <div>
                <CheckboxField
                  label="Blush/Fard à joues"
                  id="blushFardAJoues"
                  checked={formData.blushFardAJoues === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Correcteur de teint"
                  id="correcteurTeint"
                  checked={formData.correcteurTeint === 'Oui'}
                  onChange={handleChange}
                />
              </div>
              <div>
                <CheckboxField
                  label="Anti-cerne"
                  id="anticerne"
                  checked={formData.anticerne === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Base de maquillage"
                  id="baseMaquillage"
                  checked={formData.baseMaquillage === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Crème teintée"
                  id="cremeTeintee"
                  checked={formData.cremeTeintee === 'Oui'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Maquillage yeux */}
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Maquillage des yeux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <div>
                <CheckboxField
                  label="Mascara"
                  id="mascara"
                  checked={formData.mascara === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Mascara waterproof"
                  id="mascaraWaterproof"
                  checked={formData.mascaraWaterproof === 'Oui'}
                  onChange={handleChange}
                />
              </div>
              <div>
                <CheckboxField
                  label="Crayons à yeux"
                  id="crayonsYeux"
                  checked={formData.crayonsYeux === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Eyeliner"
                  id="eyeliner"
                  checked={formData.eyeliner === 'Oui'}
                  onChange={handleChange}
                />
              </div>
              <div>
                <CheckboxField
                  label="Fard à paupières"
                  id="fardAPaupieres"
                  checked={formData.fardAPaupieres === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Maquillage des sourcils"
                  id="maquillageDesSourcils"
                  checked={formData.maquillageDesSourcils === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Faux cils"
                  id="fauxCils"
                  checked={formData.fauxCils === 'Oui'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Maquillage lèvres et ongles */}
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Maquillage des lèvres et ongles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <div>
                <CheckboxField
                  label="Rouge à lèvres"
                  id="rougeALevres"
                  checked={formData.rougeALevres === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Gloss"
                  id="gloss"
                  checked={formData.gloss === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Crayon à lèvres"
                  id="crayonLevres"
                  checked={formData.crayonLevres === 'Oui'}
                  onChange={handleChange}
                />
              </div>
              <div>
                <CheckboxField
                  label="Vernis à ongles"
                  id="vernisAOngles"
                  checked={formData.vernisAOngles === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Dissolvant"
                  id="dissolvantOngles"
                  checked={formData.dissolvantOngles === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Faux ongles"
                  id="fauxOngles"
                  checked={formData.fauxOngles === 'Oui'}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Manucures"
                  id="manucures"
                  checked={formData.manucures === 'Oui'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Maquillage permanent */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Maquillage permanent</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <CheckboxField
                label="Maquillage permanent des yeux"
                id="maquillagePermanentYeux"
                checked={formData.maquillagePermanentYeux === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Maquillage permanent des lèvres"
                id="maquillagePermanentLevres"
                checked={formData.maquillagePermanentLevres === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Maquillage permanent des sourcils"
                id="maquillagePermanentSourcils"
                checked={formData.maquillagePermanentSourcils === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section solaire */}
        <CollapsibleSection
          title="Produits solaires"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <CheckboxField
                label="Protecteur solaire visage"
                id="protecteurSolaireVisage"
                checked={formData.protecteurSolaireVisage === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Protecteur solaire corps"
                id="protecteurSolaireCorps"
                checked={formData.protecteurSolaireCorps === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Protecteur solaire lèvres"
                id="protecteurSolaireLevres"
                checked={formData.protecteurSolaireLevres === 'Oui'}
                onChange={handleChange}
              />
            </div>
            <div>
              <CheckboxField
                label="Soin après-soleil"
                id="soinApresSoleil"
                checked={formData.soinApresSoleil === 'Oui'}
                onChange={handleChange}
              />
              <CheckboxField
                label="Autobronzant"
                id="autobronzant"
                checked={formData.autobronzant === 'Oui'}
                onChange={handleChange}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section parfums */}
        <CollapsibleSection
          title="Parfums"
          icon={<IconDroplet width={20} height={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <CheckboxField
              label="Parfum"
              id="parfum"
              checked={formData.parfum === 'Oui'}
              onChange={handleChange}
            />
            <CheckboxField
              label="Eau de toilette"
              id="eauDeToilette"
              checked={formData.eauDeToilette === 'Oui'}
              onChange={handleChange}
            />
          </div>
        </CollapsibleSection>

        {/* Section commentaires */}
        <div className="mt-6">
          <FormField
            label="Commentaires supplémentaires"
            id="commentaires"
            type="textarea"
            value={formData.commentaires}
            onChange={handleChange}
            placeholder="Ajoutez des commentaires ou des notes spécifiques..."
          />
        </div>

        {/* Boutons d'action */}
        <div className="mt-8 flex justify-end space-x-3">
          <Link
            to={isEditMode ? `/panels-hc/${idPanel}` : '/panels-hc'}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <IconSave width={16} height={16} className="mr-2" />
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PanelHcForm;