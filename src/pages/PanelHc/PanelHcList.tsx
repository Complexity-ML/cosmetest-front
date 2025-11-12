import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

// Types
interface Panel {
  idPanel: number;
  nom: string;
  prenom: string;
  email?: string;
  [key: string]: any;
}

interface PanelHc {
  idPanel: number;
  panelId?: number;
  panel?: Panel;
  achatPharmacieParapharmacie?: string;
  achatGrandesSurfaces?: string;
  achatInstitutParfumerie?: string;
  achatInternet?: string;
  produitsBio?: string;
  rasoir?: string;
  epilateurElectrique?: string;
  cire?: string;
  cremeDepilatoire?: string;
  institut?: string;
  epilationDefinitive?: string;
  fondDeTeint?: string;
  mascara?: string;
  soinHydratantVisage?: string;
  soinAntiAgeVisage?: string;
  soinHydratantCorps?: string;
  soinAntiCellulite?: string;
  [key: string]: any;
}

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface FilterPanelHcProps {
  lieuAchatFilter: string;
  setLieuAchatFilter: (value: string) => void;
  produitsBioFilter: string;
  setProduitsBioFilter: (value: string) => void;
  methodeEpilationFilter: string;
  setMethodeEpilationFilter: (value: string) => void;
  onApplyFilters: () => void;
}

// Import des icônes
import clipboardSvg from '../../assets/icons/clipboard.svg';
import filterSvg from '../../assets/icons/filter.svg';
import searchSvg from '../../assets/icons/search.svg';
import editSvg from '../../assets/icons/edit.svg';
import trashSvg from '../../assets/icons/trash.svg';
import userSvg from '../../assets/icons/user.svg';
import shoppingBagSvg from '../../assets/icons/shopping-bag.svg';
import leafSvg from '../../assets/icons/leaf.svg';
import scissorsSvg from '../../assets/icons/scissors.svg';
import brushSvg from '../../assets/icons/brush.svg';

const IconClipboard: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={clipboardSvg} width={width} height={height} className={className} alt="Clipboard" {...props} />
);

const IconFilter: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={filterSvg} width={width} height={height} className={className} alt="Filter" {...props} />
);

const IconSearch: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={searchSvg} width={width} height={height} className={className} alt="Search" {...props} />
);

const IconEdit: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={editSvg} width={width} height={height} className={className} alt="Edit" {...props} />
);

const IconTrash: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={trashSvg} width={width} height={height} className={className} alt="Trash" {...props} />
);

const IconUser: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={userSvg} width={width} height={height} className={className} alt="User" {...props} />
);

const IconShoppingBag: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={shoppingBagSvg} width={width} height={height} className={className} alt="Shopping Bag" {...props} />
);

const IconLeaf: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={leafSvg} width={width} height={height} className={className} alt="Leaf" {...props} />
);

const IconScissors: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={scissorsSvg} width={width} height={height} className={className} alt="Scissors" {...props} />
);

const IconBrush: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={brushSvg} width={width} height={height} className={className} alt="Brush" {...props} />
);

// Composant de filtres pour panels HC
const FilterPanelHc: React.FC<FilterPanelHcProps> = ({
  lieuAchatFilter, setLieuAchatFilter, 
  produitsBioFilter, setProduitsBioFilter, 
  methodeEpilationFilter, setMethodeEpilationFilter, 
  onApplyFilters 
}) => {
  const lieuAchatOptions = ['Tous', 'Pharmacie', 'Parapharmacie', 'Grande surface', 'Magasin bio', 'Internet', 'Autre'];
  const produitsBioOptions = ['Tous', 'Oui', 'Non', 'Parfois'];
  const epilationOptions = ['Tous', 'Rasoir', 'Épilateur électrique', 'Cire chaude', 'Cire froide', 'Crème dépilatoire', 'Laser', 'Autre'];

  const [localLieuAchat, setLocalLieuAchat] = useState(lieuAchatFilter);
  const [localProduitsBio, setLocalProduitsBio] = useState(produitsBioFilter);
  const [localMethodeEpilation, setLocalMethodeEpilation] = useState(methodeEpilationFilter);

  const handleApplyFilters = () => {
    setLieuAchatFilter(localLieuAchat);
    setProduitsBioFilter(localProduitsBio);
    setMethodeEpilationFilter(localMethodeEpilation);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    setLocalLieuAchat('Tous');
    setLocalProduitsBio('Tous');
    setLocalMethodeEpilation('Tous');
    setLieuAchatFilter('Tous');
    setProduitsBioFilter('Tous');
    setMethodeEpilationFilter('Tous');
    onApplyFilters();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="font-medium text-gray-700 mb-4 flex items-center">
        <IconFilter width={18} height={18} className="mr-2" />
        Filtres avancés
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lieu d'achat</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localLieuAchat}
            onChange={(e) => setLocalLieuAchat(e.target.value)}
          >
            {lieuAchatOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Utilisation produits bio</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localProduitsBio}
            onChange={(e) => setLocalProduitsBio(e.target.value)}
          >
            {produitsBioOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Méthode d'épilation</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localMethodeEpilation}
            onChange={(e) => setLocalMethodeEpilation(e.target.value)}
          >
            {epilationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};

// Composant principal PanelHcList
const PanelHcList = () => {
  const location = useLocation();
  const [panelsHc, setPanelsHc] = useState<PanelHc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [lieuAchatFilter, setLieuAchatFilter] = useState('Tous');
  const [produitsBioFilter, setProduitsBioFilter] = useState('Tous');
  const [methodeEpilationFilter, setMethodeEpilationFilter] = useState('Tous');
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  const fetchPanelsHc = async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les filtres
      let url = '/panels-hc';
      const params = new URLSearchParams();
      
      if (lieuAchatFilter !== 'Tous') {
        url = '/panels-hc/lieu-achat';
        params.append('lieu', lieuAchatFilter);
      } else if (produitsBioFilter !== 'Tous') {
        url = '/panels-hc/produits-bio';
        params.append('valeur', produitsBioFilter);
      } else if (methodeEpilationFilter !== 'Tous') {
        url = '/panels-hc/epilation';
        params.append('methode', methodeEpilationFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      
      // Filtrer les résultats par le terme de recherche côté client
      let filteredPanelsHc = response.data;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredPanelsHc = filteredPanelsHc.filter((panelHc: PanelHc) => 
          (panelHc.panel?.nom || '').toLowerCase().includes(query) || 
          (panelHc.panel?.prenom || '').toLowerCase().includes(query) ||
          (panelHc.panel?.email || '').toLowerCase().includes(query)
        );
      }
      
      // Calculer la pagination
      const total = Math.ceil(filteredPanelsHc.length / pageSize);
      setTotalPages(total > 0 ? total : 1);
      
      // Paginer les résultats
      const start = (currentPage - 1) * pageSize;
      const paginatedPanelsHc = filteredPanelsHc.slice(start, start + pageSize);
      
      setPanelsHc(paginatedPanelsHc);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des panels HC:', err);
      setError('Impossible de charger la liste des panels HC. Veuillez réessayer plus tard.');
      setPanelsHc([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPanelsHc();
  }, [currentPage, lieuAchatFilter, produitsBioFilter, methodeEpilationFilter]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
    fetchPanelsHc();
  };
  
  const handleDeletePanelHc = async (idPanel: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce panel HC ?')) {
      return;
    }
    
    try {
      await api.delete(`/panels-hc/${idPanel}`);
      
      // Rafraîchir la liste
      fetchPanelsHc();
      
      // Afficher une notification de succès (à implémenter)
      alert('Panel HC supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du panel HC:', err);
      alert('Erreur lors de la suppression du panel HC');
    }
  };
  
  // Fonction pour générer la pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center mt-4">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            &laquo;
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 border-t border-b border-gray-300 ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            &raquo;
          </button>
        </nav>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Panels</h1>
        
        {/* Switch pour basculer entre Panels et Panels HC */}
        <div className="mt-2 inline-flex bg-gray-100 rounded-lg p-1">
          <Link
            to="/panels"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/panels' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Panels
          </Link>
          <Link
            to="/panels-hc"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/panels-hc' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Habitudes Cosmétiques
          </Link>
        </div>
        
        <h2 className="text-sm text-gray-600 mt-1">Informations sur les habitudes cosmétiques des panels</h2>
      </div>
      
      <Link
        to="/panels-hc/nouveau"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Ajouter un panel HC
      </Link>
    </div>
      
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </form>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
        >
          <IconFilter className="h-5 w-5 text-gray-400 mr-2" />
          <span>Filtres</span>
        </button>
      </div>
      
      {showFilters && (
        <FilterPanelHc
          lieuAchatFilter={lieuAchatFilter}
          setLieuAchatFilter={setLieuAchatFilter}
          produitsBioFilter={produitsBioFilter}
          setProduitsBioFilter={setProduitsBioFilter}
          methodeEpilationFilter={methodeEpilationFilter}
          setMethodeEpilationFilter={setMethodeEpilationFilter}
          onApplyFilters={fetchPanelsHc}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          {error}
        </div>
      ) : panelsHc.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <IconClipboard className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun panel HC trouvé</h3>
          <p className="mt-1 text-gray-500">Aucun panel HC ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Panel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitudes d'achat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soins
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitudes d'épilation
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panelsHc.map((panelHc) => (
                  <tr key={panelHc.idPanel} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <IconUser className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {panelHc.panel?.nom} {panelHc.panel?.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {panelHc.idPanel} / Panel: {panelHc.panelId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-2">
                          <IconShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                        <div className="text-sm text-gray-900">
                          {(panelHc.achatPharmacieParapharmacie === 'Oui' ? 'Pharmacie/Parapharmacie' : '') ||
                          (panelHc.achatGrandesSurfaces === 'Oui' ? 'Grandes surfaces' : '') ||
                          (panelHc.achatInstitutParfumerie === 'Oui' ? 'Institut/Parfumerie' : '') ||
                          (panelHc.achatInternet === 'Oui' ? 'Internet' : '') ||
                          'Non spécifié'}
                        </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <IconLeaf className="h-4 w-4 mr-1 text-green-500" />
                            Produits bio: {panelHc.produitsBio || 'Non spécifié'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <IconBrush className="h-4 w-4 mr-1 text-blue-500" />
                          Maquillage: {(panelHc.fondDeTeint === 'Oui' || panelHc.mascara === 'Oui') ? 'Oui' : 'Non spécifié'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Visage: {(panelHc.soinHydratantVisage === 'Oui') ? 'Hydratant' : 
                                  (panelHc.soinAntiAgeVisage === 'Oui') ? 'Anti-âge' : 'Non spécifié'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Corps: {(panelHc.soinHydratantCorps === 'Oui') ? 'Hydratant' : 
                                (panelHc.soinAntiCellulite === 'Oui') ? 'Anti-cellulite' : 'Non spécifié'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-2">
                          <IconScissors className="h-4 w-4" />
                        </div>
                        <div className="text-sm text-gray-900">
                          {(panelHc.rasoir === 'Oui') ? 'Rasoir' : 
                          (panelHc.epilateurElectrique === 'Oui') ? 'Épilateur électrique' : 
                          (panelHc.cire === 'Oui') ? 'Cire' : 
                          (panelHc.cremeDepilatoire === 'Oui') ? 'Crème dépilatoire' : 
                          (panelHc.institut === 'Oui') ? 'Institut' : 
                          (panelHc.epilationDefinitive === 'Oui') ? 'Épilation définitive' : 'Non spécifié'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/panels-hc/${panelHc.idPanel}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/panels-hc/${panelHc.idPanel}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <IconEdit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeletePanelHc(panelHc.idPanel)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <IconTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default PanelHcList;