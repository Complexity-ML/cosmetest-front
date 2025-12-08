import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

// Import des icônes
import arrowLeftSvg from '../../assets/icons/arrow-left.svg';
import userSvg from '../../assets/icons/user.svg';
import editSvg from '../../assets/icons/edit.svg';
import trashSvg from '../../assets/icons/trash.svg';
import shoppingBagSvg from '../../assets/icons/shopping-bag.svg';
import brushSvg from '../../assets/icons/brush.svg';
import dropletSvg from '../../assets/icons/droplet.svg';
import scissorsSvg from '../../assets/icons/scissors.svg';
import alertCircleSvg from '../../assets/icons/alert-circle.svg';
import printSvg from '../../assets/icons/printer.svg';
import plusSvg from '../../assets/icons/plus.svg';

// Import de la configuration du formulaire pour réutiliser les sections
import { getFormSections } from '../../components/VolontaireHc/formConfig';
import { initializeFormDataWithNon, normalizeFormData } from '../../components/VolontaireHc/initializers';

// Composants d'icônes
const IconArrowLeft = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={arrowLeftSvg} width={width} height={height} className={className} alt="Arrow Left" {...props} />
);

const IconUser = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={userSvg} width={width} height={height} className={className} alt="User" {...props} />
);

const IconEdit = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={editSvg} width={width} height={height} className={className} alt="Edit" {...props} />
);

const IconTrash = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={trashSvg} width={width} height={height} className={className} alt="Trash" {...props} />
);

const IconShoppingBag = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={shoppingBagSvg} width={width} height={height} className={className} alt="Shopping Bag" {...props} />
);

const IconBrush = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={brushSvg} width={width} height={height} className={className} alt="Brush" {...props} />
);

const IconDroplet = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={dropletSvg} width={width} height={height} className={className} alt="Droplet" {...props} />
);

const IconScissors = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={scissorsSvg} width={width} height={height} className={className} alt="Scissors" {...props} />
);

const IconAlertCircle = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={alertCircleSvg} width={width} height={height} className={className} alt="Alert Circle" {...props} />
);

const IconPrint = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={printSvg} width={width} height={height} className={className} alt="Print" {...props} />
);

const IconPlus = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={plusSvg} width={width} height={height} className={className} alt="Plus" {...props} />
);

// Composant pour afficher une section d'informations
const DetailSection = ({ title, icon, children }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="mb-6">
      <button
        type="button"
        className="w-full flex justify-between items-center text-left px-6 py-4 focus:outline-none hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center text-lg font-medium">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
        <svg className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <CardContent className="px-6 pb-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Composant pour afficher un groupe d'éléments
const DetailGroup = ({ title, items }: any) => (
  <div className="mb-4">
    {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
      {items.map((item: any) => (
        <div key={item.id} className="flex items-center">
          <div 
            className={`mr-2 h-3 w-3 rounded-full ${
              item.value === 'oui' 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`} 
          />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// Fonction utilitaire pour obtenir l'icône correcte
const getIconComponent = (iconName: any) => {
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

// Composant principal VolontaireHcDetail
const VolontaireHcDetail = () => {
  const { t } = useTranslation();
  const { idVol } = useParams();
  const navigate = useNavigate();
  const [volontaireHc, setVolontaireHc] = useState<any>(null);
  const [volontaireInfo, setVolontaireInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setDataFetchError(false);

        // Convertir idVol en nombre pour s'assurer que l'API reçoit le bon type
        const numericId = parseInt(idVol || '', 10);

        if (isNaN(numericId)) {
          throw new Error(t('volunteers.invalidId'));
        }

        // Récupérer les informations du volontaire d'abord
        let volInfo = null;
        try {
          const volResponse = await api.get(`/volontaires/${numericId}`);
          if (volResponse.data) {
            volInfo = volResponse.data;
            setVolontaireInfo(volResponse.data);
          }
        } catch (volErr) {
          console.error('Erreur lors de la récupération des informations du volontaire:', volErr);
          throw new Error(t('volunteers.notFound'));
        }

        // Si on a réussi à récupérer les infos du volontaire, créer une entrée vide si elle n'existe pas
        if (volInfo) {
          try {
            // Tentative de récupération des données existantes
            const hcResponse = await api.get(`/volontaires-hc/volontaire/${numericId}`);

            if (hcResponse.data) {
              const hcData = hcResponse.data;

              // Vérifier si idVol est null, si oui, l'assigner explicitement
              if (hcData.idVol === null) {
                hcData.idVol = numericId;
              }

              // Initialiser avec les valeurs par défaut pour s'assurer qu'aucune propriété ne manque
              const initialData = initializeFormDataWithNon(numericId);

              // Fusionner les données de l'API avec nos valeurs par défaut
              const mergedData = { ...initialData, ...hcData };
              
              // Normaliser les données pour garantir la cohérence d'affichage
              const normalizedData = normalizeFormData(mergedData);

              setVolontaireHc(normalizedData);
              setNotFound(false);
            }
          } catch (hcErr: any) {
            console.error('Erreur lors du chargement des habitudes cosmétiques:', hcErr);
            
            // Si l'erreur est 404, on indique que les habitudes cosmétiques n'existent pas
            if (hcErr.response && hcErr.response.status === 404) {
              setNotFound(true);
              console.log("Aucune habitude cosmétique trouvée, initialisation avec données par défaut");
              
              // Créer un objet de données initial vide (toutes les valeurs à "non")
              const initialData = initializeFormDataWithNon(numericId);
              setVolontaireHc(initialData);

              // Option: créer automatiquement une entrée vide pour ce volontaire
              try {
                // Pour éviter l'erreur 404 à l'avenir, on pourrait créer une entrée vide
                // Mais cette approche n'est pas mise en œuvre ici pour éviter de modifier la DB sans action explicite
                // await api.post('/volontaires-hc', initialData);
                // console.log("Entrée vide créée automatiquement");
              } catch (createErr) {
                console.error("Erreur lors de la création d'une entrée vide:", createErr);
              }
            } else {
              // Pour d'autres erreurs, on note simplement l'erreur mais on continue
              setDataFetchError(true);
              setError(t('volunteers.loadHcError'));
              
              // Créer un objet de données initial vide comme fallback
              const initialData = initializeFormDataWithNon(numericId);
              setVolontaireHc(initialData);
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idVol, t]);

  const handlePrint = () => {
    window.print();
  };

  // Fonction pour créer une entrée vide si elle n'existe pas
  const handleCreateEmptyEntry = async () => {
    try {
      setLoading(true);
      const numericId = parseInt(idVol || '', 10);

      if (isNaN(numericId)) {
        throw new Error(t('volunteers.invalidId'));
      }
      
      // Créer l'objet avec des données initiales (tout à "non")
      const initialData = initializeFormDataWithNon(numericId);
      
      // Envoyer la requête de création
      await api.post('/volontaires-hc', initialData);
      
      // Recharger la page
      navigate(0);
    } catch (err) {
      console.error('Erreur lors de la création d\'une entrée vide:', err);
      setError(t('volunteers.loadHcError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const numericId = parseInt(idVol || '', 10);
      if (isNaN(numericId)) {
        throw new Error("ID du volontaire invalide");
      }

      await api.delete(`/volontaires-hc/volontaire/${numericId}`);
      navigate('/volontaires-hc');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(t('common.deleteError'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !volontaireHc) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <IconAlertCircle width={20} height={20} className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link to="/volontaires-hc" className="text-blue-600 hover:text-blue-800 flex items-center">
            <IconArrowLeft width={16} height={16} className="mr-1" />
            {t('common.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  // Si les habitudes cosmétiques n'ont pas été trouvées mais que le volontaire existe
  if (notFound && volontaireInfo) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link to="/volontaires-hc" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <IconArrowLeft width={16} height={16} className="mr-1" />
              {t('common.back')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{t('volunteers.cosmeticHabits')}</h1>
          </div>
        </div>

        <DetailSection
          title={t('volunteers.volunteerInformation')}
          icon={<IconUser width={20} height={20} className="text-blue-600" />}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
              <IconUser width={24} height={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{volontaireInfo.nom} {volontaireInfo.prenom}</h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <p><span className="font-medium">ID:</span> {idVol}</p>
                <p><span className="font-medium">{t('volunteers.gender')}:</span> {volontaireInfo.sexe}</p>
                <p><span className="font-medium">{t('volunteers.age')}:</span> {volontaireInfo.age} {t('dates.years')}</p>
                {volontaireInfo.phototype && (
                  <p><span className="font-medium">{t('volunteers.phototype')}:</span> {volontaireInfo.phototype}</p>
                )}
                {volontaireInfo.email && (
                  <p><span className="font-medium">{t('volunteers.email')}:</span> {volontaireInfo.email}</p>
                )}
                {volontaireInfo.telephone && (
                  <p><span className="font-medium">{t('volunteers.phone')}:</span> {volontaireInfo.telephone}</p>
                )}
              </div>
            </div>
          </div>
        </DetailSection>

        <Alert className="my-6 border-yellow-500 bg-yellow-50">
          <IconAlertCircle width={24} height={24} className="h-5 w-5 text-yellow-500" />
          <AlertDescription className="ml-2">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">{t('volunteers.noCosmeticHabitsFound')}</h3>
            <p className="text-yellow-700 mb-4">
              {t('volunteers.noCosmeticHabitsMessage')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to={`/volontaires-hc/nouveau?idVol=${idVol}`}>
                  <IconPlus width={20} height={20} className="mr-2" />
                  {t('volunteers.createAndDefineCosmeticHabits')}
                </Link>
              </Button>

              <Button variant="outline" onClick={handleCreateEmptyEntry}>
                <IconPlus width={20} height={20} className="mr-2" />
                {t('volunteers.initializeEmptyEntry')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!volontaireHc) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <p className="text-yellow-700">{t('volunteers.noCosmeticHabitsFound')}</p>
        </div>
        <div className="mt-4">
          <Link to="/volontaires-hc" className="text-blue-600 hover:text-blue-800 flex items-center">
            <IconArrowLeft width={16} height={16} className="mr-1" />
            {t('common.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* En-tête avec actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/volontaires-hc" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
            <IconArrowLeft width={16} height={16} className="mr-1" />
            {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t('volunteers.cosmeticHabits')}</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            <IconPrint width={16} height={16} className="mr-2" />
            {t('volunteers.print')}
          </Button>
          <Button asChild>
            <Link to={`/volontaires-hc/${idVol}/edit`}>
              <IconEdit width={16} height={16} className="mr-2" />
              {t('common.edit')}
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
            <IconTrash width={16} height={16} className="mr-2" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Affichage de message d'erreur s'il y en a un */}
      {dataFetchError && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <IconAlertCircle width={20} height={20} className="h-5 w-5 text-yellow-500" />
          <AlertDescription>
            {t('volunteers.dataLoadWarning')}
          </AlertDescription>
        </Alert>
      )}

      {/* Informations du volontaire */}
      <DetailSection
        title={t('volunteers.volunteerInformation')}
        icon={<IconUser width={20} height={20} className="text-blue-600" />}
      >
        {volontaireInfo ? (
          <div className="flex items-start">
            <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
              <IconUser width={24} height={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{volontaireInfo.nom} {volontaireInfo.prenom}</h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <p><span className="font-medium">ID:</span> {idVol}</p>
                <p><span className="font-medium">{t('volunteers.gender')}:</span> {volontaireInfo.sexe}</p>
                <p><span className="font-medium">{t('volunteers.age')}:</span> {volontaireInfo.age} {t('dates.years')}</p>
                {volontaireInfo.phototype && (
                  <p><span className="font-medium">{t('volunteers.phototype')}:</span> {volontaireInfo.phototype}</p>
                )}
                {volontaireInfo.email && (
                  <p><span className="font-medium">{t('volunteers.email')}:</span> {volontaireInfo.email}</p>
                )}
                {volontaireInfo.telephone && (
                  <p><span className="font-medium">{t('volunteers.phone')}:</span> {volontaireInfo.telephone}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">{t('volunteers.volunteerInfoUnavailable')}</p>
        )}
      </DetailSection>

      {/* Affichage dynamique des sections d'habitudes cosmétiques */}
      {getFormSections(t).map((section) => (
        <DetailSection
          key={section.title}
          title={section.title}
          icon={getIconComponent(section.icon)}
        >
          {section.groups.map((group, groupIndex) => (
            <DetailGroup
              key={`${section.title}-group-${groupIndex}`}
              title={group.title}
              items={group.items.map(item => ({
                id: item.id,
                label: item.label,
                value: volontaireHc[item.id] || 'non'
              }))}
            />
          ))}
        </DetailSection>
      ))}

      {/* Section commentaires */}
      {volontaireHc.commentaires && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <IconDroplet width={20} height={20} className="text-blue-600 mr-2" />
              {t('common.comments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm whitespace-pre-line">{volontaireHc.commentaires}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle>{t('common.confirmDelete')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                {t('common.deleteWarning')}
              </p>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {t('common.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Styles spécifiques pour l'impression */}
      <style>{`
        @media print {
          button, a, .no-print {
            display: none !important;
          }
          .shadow, .rounded-lg {
            box-shadow: none !important;
            border: 1px solid #eee;
          }
          body {
            font-size: 12pt;
          }
          h1 {
            font-size: 18pt;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 16pt;
          }
          h3 {
            font-size: 14pt;
          }
        }
      `}</style>
    </div>
  );
};

export default VolontaireHcDetail;
