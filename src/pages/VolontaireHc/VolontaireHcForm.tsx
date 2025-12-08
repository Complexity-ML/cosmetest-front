import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

// Import des sections de formulaire et fonctions d'initialisation
import { getFormSections, FormItem } from '../../components/VolontaireHc/formConfig';
import { initializeFormDataWithNon } from '../../components/VolontaireHc/initializers';

// Import des icônes SVG
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
import userSvg from '../../assets/icons/user.svg';

// Type definitions
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface VolontaireInfo {
  id?: number;
  idVol?: number;
  nom: string;
  prenom: string;
  sexe?: string;
  age?: number;
  phototype?: string;
  [key: string]: any;
}

interface CheckboxFieldProps {
  label: string;
  id: string;
  checked: string;
  onChange: (id: string, value: string) => void;
  className?: string;
}

interface CheckboxItem extends FormItem {
  value: string;
}

interface CheckboxGroupProps {
  title?: string;
  items: CheckboxItem[];
  onChange: (id: string, value: string) => void;
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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

// Composants d'icônes
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

// Composant CheckboxField amélioré
const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, id, checked, onChange, className = "" }) => {
  // On convertit en booléen pour le composant React
  // Mais gardons des strings "oui"/"non" pour l'API
  const isChecked = checked === "oui";

  return (
    <div className={`flex items-center mb-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={isChecked}
        onChange={(e) => {
          // On convertit explicitement en "oui" ou "non"
          onChange(id, e.target.checked ? "oui" : "non");
        }}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

// CheckboxGroup adapté
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, items, onChange }) => (
  <div className="mb-4">
    {title && <p className="mb-2 font-medium text-gray-700">{title}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      {items.map((item: CheckboxItem) => (
        <CheckboxField
          key={item.id}
          label={item.label}
          id={item.id}
          checked={item.value}
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Composant FormField
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
  const { t } = useTranslation();
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
          <option value="">{t('common.select')}...</option>
          {Array.isArray(options) && options.length > 0 ? (
            options.map((option: string | { value: string | number; label: string }, index: number) => (
              <option key={typeof option === 'object' ? option.value : option || index} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
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

// Composant CollapsibleSection
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

// Composant principal
const VolontaireHcForm = () => {
  const { t } = useTranslation();
  const formSections = useMemo(() => getFormSections(t), [t]);
  const { idVol } = useParams<{ idVol?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Récupérer idVol des paramètres de requête si présent (pour la création)
  const queryIdVol = searchParams.get('idVol');
  
  // Déterminer si nous sommes en mode édition
  const isEditMode = Boolean(idVol);

  // États - initialisation avec "non" pour tous les champs
  const [formData, setFormData] = useState<any>(() => {
    // Initialiser avec le idVol de l'URL ou des paramètres de requête
    const initialIdVol = isEditMode && idVol ? parseInt(idVol, 10) : (queryIdVol ? parseInt(queryIdVol, 10) : null);
    return initializeFormDataWithNon(initialIdVol);
  });
  
  const [volontaireInfo, setVolontaireInfo] = useState<VolontaireInfo | null>(null);
  const [availableVolontaires, setAvailableVolontaires] = useState<VolontaireInfo[]>([]);
  const [filteredVolontaires, setFilteredVolontaires] = useState<VolontaireInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [formSuccess, setFormSuccess] = useState(''); 

  useEffect(() => {
    // Si nous avons un idVol dans les paramètres de requête, pré-sélectionner ce volontaire
    if (!isEditMode && queryIdVol) {
      const numIdVol = parseInt(queryIdVol, 10);
      if (!isNaN(numIdVol)) {
        setFormData((prev: any) => ({
          ...prev,
          idVol: numIdVol
        }));
        
        // Charger les informations de ce volontaire
        const fetchVolontaireInfo = async () => {
          try {
            const response = await api.get(`/volontaires/${numIdVol}`);
            if (response.data) {
              setVolontaireInfo(response.data);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des informations du volontaire:', error);
          }
        };
        
        fetchVolontaireInfo();
      }
    }
  }, [isEditMode, queryIdVol]);

  // Charger la liste des volontaires disponibles (sans HC)
  useEffect(() => {
    const fetchVolontaires = async () => {
      try {
        // Récupérer tous les volontaires
        const volontairesResponse = await api.get('/volontaires');
        // Gérer les réponses paginées (objet avec content) ou tableaux directs
        const allVolontaires = Array.isArray(volontairesResponse.data)
          ? volontairesResponse.data
          : (volontairesResponse.data?.content || []);

        // Récupérer tous les volontaires qui ont déjà des HC
        let volontairesWithHC: number[] = [];
        try {
          const hcResponse = await api.get('/volontaires-hc');

          if (Array.isArray(hcResponse.data)) {
            // Convertir tous les IDs en nombres pour éviter les problèmes de comparaison string/number
            volontairesWithHC = hcResponse.data
              .map((hc: any) => Number(hc.idVol))
              .filter((id: number) => !isNaN(id) && id !== 0);          }
        } catch (hcError) {
          console.warn('Impossible de récupérer les HC existants, tous les volontaires seront affichés:', hcError);
        }

        // Filtrer les volontaires sans HC
        const volontairesSansHC = allVolontaires.filter((vol: any) => {
          const volId = Number(vol.id || vol.idVol);
          return !isNaN(volId) && !volontairesWithHC.includes(volId);
        });

        setAvailableVolontaires(volontairesSansHC);
        setFilteredVolontaires(volontairesSansHC);
      } catch (error) {
        console.error('Erreur lors du chargement des volontaires:', error);
        setSubmitError(t('volunteers.loadListError'));
        setAvailableVolontaires([]);
        setFilteredVolontaires([]);
      }
    };

    fetchVolontaires();
  }, []);

  // Filtrer les volontaires en fonction du terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVolontaires(availableVolontaires);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = availableVolontaires.filter((vol: any) => {
      const nom = (vol.nom || vol.nomVol || '').toLowerCase();
      const prenom = (vol.prenom || vol.prenomVol || '').toLowerCase();
      const email = (vol.email || vol.emailVol || '').toLowerCase();
      const id = String(vol.id || vol.idVol || '');

      return (
        nom.includes(term) ||
        prenom.includes(term) ||
        email.includes(term) ||
        id.includes(term) ||
        `${nom} ${prenom}`.includes(term) ||
        `${prenom} ${nom}`.includes(term)
      );
    });

    setFilteredVolontaires(filtered);
  }, [searchTerm, availableVolontaires]);

  // Charger les données du volontaire HC en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchVolontaireHcData = async () => {
        try {
          setIsLoading(true);

          // Convertir idVol en nombre pour s'assurer que l'API reçoit le bon type
          const numericId = idVol ? parseInt(idVol, 10) : 0;

          if (isNaN(numericId) || numericId === 0) {
            throw new Error("ID du volontaire invalide");
          }

          // Récupérer les informations du volontaire d'abord
          try {
            const volResponse = await api.get(`/volontaires/${numericId}`);
            if (volResponse.data) {
              setVolontaireInfo(volResponse.data);
            }
          } catch (volErr) {
            console.error('Erreur lors de la récupération des informations du volontaire:', volErr);
          }

          // Récupérer ou créer les habitudes cosmétiques
          try {
            // Essayer de récupérer les données existantes
            const hcResponse = await api.get(`/volontaires-hc/volontaire/${numericId}`);

            if (hcResponse.data) {
              // Données existantes trouvées, les normaliser
              const hcData = hcResponse.data;

              // Vérifier si idVol est null, si oui, l'assigner explicitement
              if (hcData.idVol === null) {
                hcData.idVol = numericId;
              }

              // Initialiser avec les valeurs par défaut
              const initialData = initializeFormDataWithNon(numericId);

              // Fusionner les données de l'API avec nos valeurs par défaut
              const mergedData = { ...initialData, ...hcData };

              // Normaliser les valeurs à "oui" ou "non" pour faciliter l'affichage
              Object.keys(mergedData).forEach(key => {
                if (key !== 'idVol' && key !== 'commentaires') {
                  // Si c'est une string, convertir à lowercase pour la comparaison
                  if (typeof mergedData[key] === 'string') {
                    const value = mergedData[key].toLowerCase();
                    // Normaliser en "oui" ou "non"
                    if (value === 'oui' || value === 'yes' || value === 'true' || value === '1') {
                      mergedData[key] = "oui";
                    } else {
                      mergedData[key] = "non";
                    }
                  } else if (mergedData[key] === null || mergedData[key] === undefined || mergedData[key] === '') {
                    // Traiter explicitement les valeurs null et undefined
                    mergedData[key] = "non";
                  }
                }
              });

              // Mettre à jour le formulaire avec les données normalisées
              setFormData(mergedData);
            }
          } catch (hcErr: unknown) {
            console.error('Erreur lors du chargement des habitudes cosmétiques:', hcErr);
            // Si l'erreur est 404, on utilise les valeurs par défaut
            if (hcErr && typeof hcErr === 'object' && 'response' in hcErr && (hcErr as any).response?.status === 404) {
              console.log('Aucune habitude cosmétique trouvée, initialisation avec les valeurs par défaut');
              // Déjà initialisé avec les valeurs par défaut
            } else {
              setSubmitError("Erreur lors du chargement des habitudes cosmétiques.");
            }
          }

        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          setSubmitError('Impossible de charger les données. Veuillez réessayer.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchVolontaireHcData();
    }
  }, [idVol, isEditMode]);

  // Gestion des changements dans le formulaire
  const handleCheckboxChange = (id: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [id]: value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[id]) {
      setErrors((prev: any) => ({
        ...prev,
        [id]: null
      }));
    }
  };

  // Gestion des changements de champs select et text
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Si c'est le champ idVol, essayer de charger les informations du volontaire
    if (name === 'idVol' && value) {
      const fetchVolontaireInfo = async () => {
        try {
          const response = await api.get(`/volontaires/${value}`);
          if (response.data) {
            setVolontaireInfo(response.data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des informations du volontaire:', error);
        }
      };
      
      fetchVolontaireInfo();
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Valider les champs obligatoires
    if (!isEditMode && !formData.idVol) {
      newErrors.idVol = t('volunteers.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour normaliser toutes les valeurs du formulaire avant soumission
  const normalizeFormData = (data: any) => {
    const normalizedData = { ...data };
    
    // Parcourir toutes les données et normaliser les valeurs
    Object.keys(normalizedData).forEach(key => {
      // Ne pas toucher à idVol et commentaires
      if (key !== 'idVol' && key !== 'commentaires') {
        if (normalizedData[key] === null || normalizedData[key] === undefined || normalizedData[key] === '') {
          normalizedData[key] = "non";
        } else if (typeof normalizedData[key] === 'string') {
          const value = normalizedData[key].toLowerCase();
          if (value === 'oui' || value === 'yes' || value === 'true' || value === '1') {
            normalizedData[key] = "oui";
          } else {
            normalizedData[key] = "non";
          }
        } else if (typeof normalizedData[key] === 'boolean') {
          normalizedData[key] = normalizedData[key] ? "oui" : "non";
        }
      }
    });
    
    return normalizedData;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Vérification de la validité du formulaire
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');

      // Utiliser idVol du formulaire en mode création, params.idVol en mode édition
      const submissionIdVol = isEditMode ? parseInt(idVol || '0', 10) : parseInt(formData.idVol, 10);

      // Vérifier que l'ID est un nombre valide
      if (isNaN(submissionIdVol)) {
        setSubmitError('ID de volontaire invalide');
        setLoading(false);
        return;
      }

      // Normaliser toutes les valeurs du formulaire
      const normalizedFormData = normalizeFormData(formData);

      // Préparer les données à soumettre
      const formDataToSubmit = {
        ...normalizedFormData,
        idVol: submissionIdVol
      };

      console.log('Form data being submitted:', formDataToSubmit);

      // Envoi des données - utiliser le même endpoint pour création et modification
      const response = await api.post('/volontaires-hc', formDataToSubmit);

      // Message de succès
      setFormSuccess(isEditMode
        ? t('volunteers.hcUpdated')
        : t('volunteers.hcCreated'));

      // Navigation après succès 
      setTimeout(() => {
        navigate(`/volontaires-hc/${response.data?.idVol || submissionIdVol}`);
      }, 1500);

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitError(error.response?.data?.message || t('volunteers.submitError'));
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

  // Fonction helper pour obtenir le bon composant d'icône
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'shopping-bag':
        return <IconShoppingBag width={20} height={20} className="text-blue-600" />;
      case 'scissors':
        return <IconScissors width={20} height={20} className="text-blue-600" />;
      case 'droplet':
        return <IconDroplet width={20} height={20} className="text-blue-600" />;
      case 'brush':
        return <IconBrush width={20} height={20} className="text-blue-600" />;
      case 'user':
        return <IconUser width={20} height={20} className="text-blue-600" />;
      default:
        return <IconDroplet width={20} height={20} className="text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/volontaires-hc" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
            <IconArrowLeft width={16} height={16} className="mr-1" />
            {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {isEditMode ? (
              <>
                <IconUserEdit width={24} height={24} className="mr-2 text-blue-600" />
                {t('volunteers.editHabits')}
              </>
            ) : (
              <>
                <IconUserPlus width={24} height={24} className="mr-2 text-blue-600" />
                {t('volunteers.addHabits')}
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Switch pour basculer entre Volontaires et Habitudes Cosmétiques */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <Link
            to="/volontaires-hc"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.includes('/volontaires-hc') && !location.pathname.includes('/volontaires-hc')
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            {t('volunteers.title')}
          </Link>
          <Link
            to="/volontaires-hc"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.includes('/volontaires-hc')
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            {t('volunteers.cosmeticHabits')}
          </Link>
        </div>
      </div>

      {/* Messages de succès et d'erreur */}
      {formSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700">{formSuccess}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <IconAlertCircle width={20} height={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Section sélection du volontaire */}
        <CollapsibleSection
          title={t('volunteers.volunteerSelection')}
          isOpen={true}
          icon={<IconUser width={20} height={20} className="text-blue-600" />}
        >
          <div className="mb-6">
            {isEditMode || volontaireInfo ? (
              // Afficher les infos du volontaire en mode édition ou si nous avons déjà les infos
              volontaireInfo && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                      <IconUser width={20} height={20} />
                    </div>
                    <div>
                      <p className="font-medium">{volontaireInfo.nom} {volontaireInfo.prenom}</p>
                      <p className="text-sm text-gray-600">
                        ID: {isEditMode ? idVol : formData.idVol} • {volontaireInfo.sexe}, {volontaireInfo.age} ans
                        {volontaireInfo.phototype && ` - Phototype ${volontaireInfo.phototype}`}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // En mode création, permettre de sélectionner un volontaire
              <>
                {/* Message d'information */}
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="flex items-start">
                    <IconInfo width={20} height={20} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">{t('volunteers.onlyVolunteersWithoutHc')}</p>
                      <p className="mt-1">{t('volunteers.useSearchToFilter')}</p>
                    </div>
                  </div>
                </div>

                {availableVolontaires.length === 0 ? (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <IconAlertCircle width={20} height={20} className="text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        {t('volunteers.noVolunteerAvailable')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('volunteers.searchVolunteer')}
                      </label>
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('volunteers.searchByNameEmailId')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {searchTerm && (
                        <p className="mt-1 text-sm text-gray-500">
                          {filteredVolontaires.length} {t('volunteers.volunteersFound')} {availableVolontaires.length} {t('volunteers.available')}
                        </p>
                      )}
                    </div>
                    <FormField
                      label={t('volunteers.associatedVolunteer')}
                      id="idVol"
                      type="select"
                      value={formData.idVol}
                      onChange={handleInputChange}
                      options={Array.isArray(filteredVolontaires) ? filteredVolontaires.map(vol => ({
                        value: vol.id || vol.idVol || 0,
                        label: `${vol.nom || vol.nomVol} ${vol.prenom || vol.prenomVol} (ID: ${vol.id || vol.idVol}${vol.email || vol.emailVol ? ` - ${vol.email || vol.emailVol}` : ''})`
                      })) : []}
                      required
                      error={errors.idVol}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* Sections dynamiques du formulaire */}
        {formSections.map(section => (
          <CollapsibleSection
            key={section.title}
            title={section.title}
            isOpen={false}
            icon={getIconComponent(section.icon)}
          >
            {section.groups.map((group, groupIndex) => (
              <CheckboxGroup
                key={`${section.title}-group-${groupIndex}`}
                title={group.title}
                items={group.items.map(item => ({
                  id: item.id,
                  label: item.label,
                  value: formData[item.id] || "non"
                }))}
                onChange={handleCheckboxChange}
              />
            ))}
          </CollapsibleSection>
        ))}

        {/* Section commentaires */}
        <div className="mt-6">
          <FormField
            label={t('volunteers.additionalComments')}
            id="commentaires"
            type="textarea"
            value={formData.commentaires}
            onChange={handleInputChange}
            placeholder={t('volunteers.commentsPlaceholder')}
          />
        </div>

        {/* Boutons d'action */}
        <div className="mt-8 flex justify-end space-x-3">
          <Link
            to={isEditMode ? `/volontaires-hc/${idVol}` : '/volontaires-hc'}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {t('common.cancel')}
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
                {t('common.saving')}
              </>
            ) : (
              <>
                <IconSave width={16} height={16} className="mr-2" />
                {isEditMode ? t('common.update') : t('common.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolontaireHcForm;
