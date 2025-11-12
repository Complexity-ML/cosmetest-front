
// ============================================================
// PaiementActions.tsx - Version mise à jour pour exclure les annulés
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import paiementService from '../../services/PaiementService';
import annulationService from '../../services/annulationService';
import { PAIEMENT_STATUS } from '../../hooks/usePaiements';

// Type definitions
interface PaiementActionsProps {
  idEtude: string | number;
  idVolontaire: string | number;
  statutActuel: number;
  montant?: number;
  onStatusChange?: (newStatus: number) => void;
  size?: 'small' | 'normal';
  variant?: 'dropdown' | 'buttons' | 'badge';
}

/**
 * Composant pour les actions rapides de paiement
 * MODIFIÉ pour vérifier les annulations
 */
const PaiementActions = ({ 
  idEtude, 
  idVolontaire, 
  statutActuel, 
  montant = 0,
  onStatusChange,
  size = 'normal',
  variant = 'dropdown'
}: PaiementActionsProps) => {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnnule, setIsAnnule] = useState(false); // NOUVEAU : état d'annulation

  // NOUVEAU : Vérifier si le volontaire est annulé
  useEffect(() => {
    const checkAnnulation = async () => {
      if (!idEtude || !idVolontaire) return;

      try {
        const numericVolontaireId = typeof idVolontaire === 'string' ? parseInt(idVolontaire, 10) : idVolontaire;
        const numericEtudeId = typeof idEtude === 'string' ? parseInt(idEtude, 10) : idEtude;
        const annulations = await annulationService.getByVolontaireAndEtude(numericVolontaireId, numericEtudeId);
        setIsAnnule(annulations && annulations.length > 0);
      } catch (error) {
        console.error('Erreur lors de la vérification d\'annulation:', error);
        // En cas d'erreur, on considère que le volontaire n'est pas annulé
        setIsAnnule(false);
      }
    };

    checkAnnulation();
  }, [idEtude, idVolontaire]);

  // Vérifier les permissions
  if (!isAdmin()) {
    // Mode lecture seule pour les non-admins
    if (variant === 'badge') {
      const status = (PAIEMENT_STATUS as any)[statutActuel] || (PAIEMENT_STATUS as any)[0];
      return (
        <div className="flex items-center space-x-2">
          <span className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${status.color === 'green' ? 'bg-green-100 text-green-800' : ''}
            ${status.color === 'red' ? 'bg-red-100 text-red-800' : ''}
            ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
            ${isAnnule ? 'opacity-50' : ''}
          `}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </span>
          {/* NOUVEAU : Badge annulé */}
          {isAnnule && (
            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
              ANNULÉ
            </span>
          )}
        </div>
      );
    }
    return null;
  }

  const handleStatusChange = async (nouveauStatut: number) => {
    if (nouveauStatut === statutActuel) return;

    // NOUVEAU : Empêcher les modifications si annulé
    if (isAnnule) {
      setError('Impossible de modifier le paiement d\'un volontaire annulé');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const numericEtudeId = typeof idEtude === 'string' ? parseInt(idEtude, 10) : idEtude;
      const numericVolontaireId = typeof idVolontaire === 'string' ? parseInt(idVolontaire, 10) : idVolontaire;
      await paiementService.updateStatutPaiement(numericEtudeId, numericVolontaireId, nouveauStatut);
      
      if (onStatusChange) {
        onStatusChange(nouveauStatut);
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // MODIFIÉ : Rendu avec gestion des annulés
  if (variant === 'badge') {
    const status = (PAIEMENT_STATUS as any)[statutActuel] || (PAIEMENT_STATUS as any)[0];
    return (
      <div className="flex items-center space-x-2">
        <span className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer
          ${status.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
          ${status.color === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
          ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
          ${status.color === 'gray' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
          ${isAnnule ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <span className="mr-1">{status.icon}</span>
          {status.label}
        </span>
        {montant > 0 && (
          <span className={`text-xs text-gray-600 font-medium ${isAnnule ? 'line-through' : ''}`}>
            {montant.toFixed(0)} €
          </span>
        )}
        {/* NOUVEAU : Badge annulé */}
        {isAnnule && (
          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
            ANNULÉ
          </span>
        )}
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(PAIEMENT_STATUS).map(([value, config]) => {
          const isActive = parseInt(value) === statutActuel;
          const buttonSize = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
          
          return (
            <button
              key={value}
              onClick={() => handleStatusChange(parseInt(value))}
              disabled={isLoading || isActive || isAnnule}
              className={`
                ${buttonSize} rounded-full font-medium transition-all duration-200
                ${isActive 
                  ? `bg-${config.color}-100 text-${config.color}-800 border-${config.color}-300 border-2`
                  : `bg-gray-100 text-gray-700 hover:bg-${config.color}-50 border border-gray-300`
                }
                ${isLoading || isAnnule ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={isAnnule ? 'Volontaire annulé - Paiement bloqué' : ''}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </button>
          );
        })}
        {/* NOUVEAU : Affichage d'erreur et statut annulé */}
        {isAnnule && (
          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
            ANNULÉ - BLOQUÉ
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
      </div>
    );
  }

  // Variante dropdown (par défaut) - MODIFIÉE
  return (
    <div className="relative">
      <select
        value={statutActuel}
        onChange={(e) => handleStatusChange(parseInt(e.target.value))}
        disabled={isLoading || isAnnule}
        className={`
          ${size === 'small' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}
          border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${isLoading || isAnnule ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
        `}
        title={isAnnule ? 'Volontaire annulé - Paiement bloqué' : ''}
      >
        {Object.entries(PAIEMENT_STATUS).map(([value, config]) => (
          <option key={value} value={value}>
            {config.icon} {config.label}
          </option>
        ))}
      </select>
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Affichage du montant */}
      {montant > 0 && (
        <div className={`mt-1 text-xs text-gray-600 text-center ${isAnnule ? 'line-through' : ''}`}>
          {montant.toFixed(0)} €
          {isAnnule && <span className="block text-red-600">(Exclu)</span>}
        </div>
      )}
      
      {/* NOUVEAU : Indicateur d'annulation */}
      {isAnnule && (
        <div className="mt-1 text-xs text-red-600 text-center">
          Volontaire annulé
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="mt-1 text-xs text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaiementActions;