import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

// Import des icônes
import clipboardSvg from '../../assets/icons/clipboard.svg';
import filterSvg from '../../assets/icons/filter.svg';
import searchSvg from '../../assets/icons/search.svg';
import editSvg from '../../assets/icons/edit.svg';
import trashSvg from '../../assets/icons/trash.svg';
import userSvg from '../../assets/icons/user.svg';

// Types
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface Panel {
  idPanel: number;
  nom: string;
  prenom: string;
  sexe: string;
  age: number;
  email: string;
  telephone: string;
  groupe?: string;
  phototype: string;
  typePeauVisage: string;
}

interface FilterPanelProps {
  sexeFilter: string;
  setSexeFilter: (value: string) => void;
  typePeauFilter: string;
  setTypePeauFilter: (value: string) => void;
  phototypeFilter: string;
  setPhototypeFilter: (value: string) => void;
  onApplyFilters: () => void;
}

const IconClipboard = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={clipboardSvg} width={width} height={height} className={className} alt="Clipboard" {...props} />
);

const IconFilter = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={filterSvg} width={width} height={height} className={className} alt="Filter" {...props} />
);

const IconSearch = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={searchSvg} width={width} height={height} className={className} alt="Search" {...props} />
);

const IconEdit = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={editSvg} width={width} height={height} className={className} alt="Edit" {...props} />
);

const IconTrash = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={trashSvg} width={width} height={height} className={className} alt="Trash" {...props} />
);

const IconUser = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={userSvg} width={width} height={height} className={className} alt="User" {...props} />
);

// Composant de filtres
const FilterPanel = ({ sexeFilter, setSexeFilter, typePeauFilter, setTypePeauFilter, phototypeFilter, setPhototypeFilter, onApplyFilters }: FilterPanelProps) => {
  const sexeOptions = ['Tous', 'Homme', 'Femme'];
  const typePeauOptions = ['Tous', 'Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible'];
  const phototypeOptions = ['Tous', 'I', 'II', 'III', 'IV', 'V', 'VI'];

  const [localSexe, setLocalSexe] = useState(sexeFilter);
  const [localTypePeau, setLocalTypePeau] = useState(typePeauFilter);
  const [localPhototype, setLocalPhototype] = useState(phototypeFilter);

  const handleApplyFilters = () => {
    setSexeFilter(localSexe);
    setTypePeauFilter(localTypePeau);
    setPhototypeFilter(localPhototype);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    setLocalSexe('Tous');
    setLocalTypePeau('Tous');
    setLocalPhototype('Tous');
    setSexeFilter('Tous');
    setTypePeauFilter('Tous');
    setPhototypeFilter('Tous');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localSexe}
            onChange={(e) => setLocalSexe(e.target.value)}
          >
            {sexeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de peau</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localTypePeau}
            onChange={(e) => setLocalTypePeau(e.target.value)}
          >
            {typePeauOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phototype</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localPhototype}
            onChange={(e) => setLocalPhototype(e.target.value)}
          >
            {phototypeOptions.map(option => (
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

// Composant principal PanelList
const PanelList = () => {
  const location = useLocation();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [sexeFilter, setSexeFilter] = useState('Tous');
  const [typePeauFilter, setTypePeauFilter] = useState('Tous');
  const [phototypeFilter, setPhototypeFilter] = useState('Tous');
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  const fetchPanels = async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les filtres
      let url = '/panels';
      
      // Si des filtres sont appliqués, utiliser l'endpoint de recherche
      if (sexeFilter !== 'Tous' || typePeauFilter !== 'Tous' || phototypeFilter !== 'Tous') {
        url = '/panels/search';
        
        const params = new URLSearchParams();
        if (sexeFilter !== 'Tous') params.append('sexe', sexeFilter);
        if (typePeauFilter !== 'Tous') params.append('typePeauVisage', typePeauFilter);
        if (phototypeFilter !== 'Tous') params.append('phototype', phototypeFilter);
        
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      
      // Filtrer les résultats par le terme de recherche côté client
      let filteredPanels: Panel[] = response.data;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredPanels = filteredPanels.filter((panel: Panel) => 
          panel.nom.toLowerCase().includes(query) || 
          panel.prenom.toLowerCase().includes(query) ||
          panel.email.toLowerCase().includes(query)
        );
      }
      
      // Calculer la pagination
      const total = Math.ceil(filteredPanels.length / pageSize);
      setTotalPages(total > 0 ? total : 1);
      
      // Paginer les résultats
      const start = (currentPage - 1) * pageSize;
      const paginatedPanels = filteredPanels.slice(start, start + pageSize);
      
      setPanels(paginatedPanels);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des panels:', err);
      setError('Impossible de charger la liste des panels. Veuillez réessayer plus tard.');
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPanels();
  }, [currentPage, sexeFilter, typePeauFilter, phototypeFilter]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
    fetchPanels();
  };

  const handleDeletePanel = async (idPanel: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce panel ?')) {
      return;
    }
    
    try {
      await api.delete(`/api/panels/${idPanel}`);
      
      // Rafraîchir la liste
      fetchPanels();
      
      // Afficher une notification de succès (à implémenter)
      alert('Panel supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du panel:', err);
      alert('Erreur lors de la suppression du panel');
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
  
  const getPhototypeColorClass = (phototype: string) => {
    switch (phototype) {
      case 'I': return 'bg-rose-50 text-rose-700';
      case 'II': return 'bg-orange-50 text-orange-700';
      case 'III': return 'bg-amber-50 text-amber-700';
      case 'IV': return 'bg-yellow-50 text-yellow-700';
      case 'V': return 'bg-lime-50 text-lime-700';
      case 'VI': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panels</h1>
          
          {/* Ajout du switch pour basculer entre Panels et Panels HC */}
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
        </div>
        
        <Link
          to="/panels/nouveau"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ajouter un panel
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
        <FilterPanel
          sexeFilter={sexeFilter}
          setSexeFilter={setSexeFilter}
          typePeauFilter={typePeauFilter}
          setTypePeauFilter={setTypePeauFilter}
          phototypeFilter={phototypeFilter}
          setPhototypeFilter={setPhototypeFilter}
          onApplyFilters={fetchPanels}
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
      ) : panels.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <IconClipboard className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun panel trouvé</h3>
          <p className="mt-1 text-gray-500">Aucun panel ne correspond à vos critères de recherche.</p>
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
                    Profil
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caractéristiques
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panels.map((panel) => (
                  <tr key={panel.idPanel} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <IconUser className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {panel.nom} {panel.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {panel.idPanel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {panel.sexe}, {panel.age} ans
                      </div>
                      {panel.groupe && (
                        <div className="text-sm text-gray-500">
                          Groupe: {panel.groupe}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{panel.email}</div>
                      <div className="text-sm text-gray-500">{panel.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPhototypeColorClass(panel.phototype)}`}>
                          Phototype {panel.phototype}
                        </span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {panel.typePeauVisage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/panels/${panel.idPanel}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/panels/${panel.idPanel}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <IconEdit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeletePanel(panel.idPanel)}
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

export default PanelList;