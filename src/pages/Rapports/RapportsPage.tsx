import React, { useState } from 'react';
import MatchingSystem from '../../components/Rapports/MatchingSystem';

// Icônes simples
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const RapportsPage = () => {
  const [activeTab, setActiveTab] = useState('matching');

  // Types de rapports disponibles
  const rapportTypes = [
    {
      id: 'matching',
      title: 'Matching Volontaires',
      icon: <UsersIcon />,
      description: 'Trouvez les volontaires les plus adaptés selon vos critères de maquillage et profil démographique.',
      available: true
    },
    {
      id: 'stats',
      title: 'Statistiques',
      icon: <ChartIcon />,
      description: 'Analyse des données des volontaires et tendances cosmétiques.',
      available: false
    },
    {
      id: 'activity',
      title: 'Activité Études',
      icon: <ClipboardIcon />,
      description: 'Suivi des études en cours et historique des participations.',
      available: false
    },
    {
      id: 'planning',
      title: 'Planning',
      icon: <CalendarIcon />,
      description: 'Gestion des créneaux et disponibilités.',
      available: false
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'matching':
        return <MatchingSystem />;
      
      case 'stats':
      case 'activity':
      case 'planning':
        return (
          <div className="text-center py-16">
            <div className="mb-4">
              {rapportTypes.find(r => r.id === activeTab)?.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {rapportTypes.find(r => r.id === activeTab)?.title}
            </h2>
            <p className="text-gray-500 mb-6">
              Ce module sera disponible dans une prochaine version.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                {rapportTypes.find(r => r.id === activeTab)?.description}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <ChartIcon />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Centre de Rapports</h1>
          </div>
          <p className="text-gray-600">
            Outils d'analyse et de matching pour optimiser la gestion de vos volontaires et études cosmétiques.
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 -mb-px">
              {rapportTypes.map(type => (
                <button
                  key={type.id}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === type.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${!type.available ? 'opacity-50' : ''}`}
                  onClick={() => setActiveTab(type.id)}
                  disabled={!type.available}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.title}
                  {!type.available && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Bientôt
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Cartes de présentation (affichées uniquement sur l'onglet matching) */}
        {activeTab === 'matching' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {rapportTypes.map(type => (
              <div 
                key={type.id}
                className={`bg-white p-4 rounded-lg shadow-sm border ${
                  activeTab === type.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                } ${type.available ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}`}
                onClick={() => type.available && setActiveTab(type.id)}
              >
                <div className="flex items-center mb-2">
                  <span className={activeTab === type.id ? 'text-blue-600' : 'text-gray-600'}>
                    {type.icon}
                  </span>
                  <h3 className={`ml-2 font-medium ${
                    activeTab === type.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {type.title}
                  </h3>
                </div>
                <p className={`text-sm ${
                  activeTab === type.id ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {type.description}
                </p>
                {!type.available && (
                  <div className="mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      En développement
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RapportsPage;
