import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface VolunteerData {
  titreVol?: string;
  titre?: string;
  prenomVol?: string;
  prenom?: string;
  firstName?: string;
  nomVol?: string;
  nom?: string;
  lastName?: string;
  [key: string]: any;
}

interface RendezVousData {
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  volontaire?: VolunteerData;
  [key: string]: any;
}

interface VolunteerInfoProps {
  rdv: RendezVousData;
  getVolunteerInfo: (id: number) => Promise<VolunteerData>;
}

// Composant pour afficher les infos du volontaire
const VolunteerInfo = ({ rdv, getVolunteerInfo }: VolunteerInfoProps) => {
  const { t } = useTranslation();
  const [volunteerInfo, setVolunteerInfo] = useState<VolunteerData | null>(null);
  const [loadingVolunteer, setLoadingVolunteer] = useState(false);

  useEffect(() => {
    const loadVolunteerInfo = async () => {
      // Si on a déjà toutes les infos du volontaire
      if (rdv.volontaire && rdv.volontaire.prenom && rdv.volontaire.nom) {
        console.log("✅ Infos volontaire déjà disponibles:", rdv.volontaire);
        setVolunteerInfo(rdv.volontaire);
        return;
      }

      // Si on a seulement l'ID, récupérer les infos
      if (rdv.idVolontaire && getVolunteerInfo) {
        setLoadingVolunteer(true);
        try {
          console.log("🔍 Récupération infos pour ID:", rdv.idVolontaire);
          const info = await getVolunteerInfo(rdv.idVolontaire);
          console.log("📋 Infos reçues:", info);
          setVolunteerInfo(info);
        } catch (error) {
          console.error("❌ Erreur récupération volontaire:", error);
        } finally {
          setLoadingVolunteer(false);
        }
      }
    };

    loadVolunteerInfo();
  }, [rdv.idVolontaire, rdv.volontaire, getVolunteerInfo]);

  if (loadingVolunteer) {
    return (
      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
        {t('common.loading')}
      </span>
    );
  }

  if (volunteerInfo) {
    console.log("📝 Structure des données volontaire:", Object.keys(volunteerInfo));

    // Essayer différentes combinaisons de noms de propriétés
    const title = volunteerInfo.titreVol || volunteerInfo.titre;
    const firstName = volunteerInfo.prenomVol || volunteerInfo.prenom || volunteerInfo.firstName;
    const lastName = volunteerInfo.nomVol || volunteerInfo.nom || volunteerInfo.lastName;
    const volunteerId = volunteerInfo.idVol || volunteerInfo.id || rdv.idVolontaire;

    if (firstName && lastName) {
      const displayName = title ? `${title} ${firstName} ${lastName}` : `${firstName} ${lastName}`;
      return (
        <Link
          to={`/volontaires/${volunteerId}`}
          state={{ activeTab: 'info' }}
          className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 px-2 py-1 rounded text-xs inline-block transition-colors underline"
          onClick={(e) => e.stopPropagation()}
        >
          {displayName}
        </Link>
      );
    }

    // Si on a au moins un nom
    if (firstName || lastName) {
      return (
        <Link
          to={`/volontaires/${volunteerId}`}
          state={{ activeTab: 'info' }}
          className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 px-2 py-1 rounded text-xs inline-block transition-colors underline"
          onClick={(e) => e.stopPropagation()}
        >
          {firstName || lastName}
        </Link>
      );
    }

    // Fallback: afficher l'ID et les propriétés disponibles
    return (
      <Link
        to={`/volontaires/${volunteerId}`}
        state={{ activeTab: 'info' }}
        className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 px-2 py-1 rounded text-xs inline-block transition-colors underline"
        onClick={(e) => e.stopPropagation()}
      >
        ID: {rdv.idVolontaire} (Données: {Object.keys(volunteerInfo).join(', ')})
      </Link>
    );
  }

  // Fallback si on a que l'ID
  if (rdv.idVolontaire) {
    return (
      <Link
        to={`/volontaires/${rdv.idVolontaire}`}
        state={{ activeTab: 'info' }}
        className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 px-2 py-1 rounded text-xs inline-block transition-colors underline"
        onClick={(e) => e.stopPropagation()}
      >
        {t('appointments.volunteerIdLabel')}: {rdv.idVolontaire}
      </Link>
    );
  }

  return null;
};

interface AppointmentItemProps {
  rdv: RendezVousData;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: ((rdv: RendezVousData) => void) | null;
  onUnassign?: ((rdv: RendezVousData) => void) | null;
  onUpdateComment?: ((rdv: RendezVousData, comment: string) => Promise<void>) | null;
  onSwitch?: ((rdv: RendezVousData) => void) | null;
  getAppointmentId: (rdv: RendezVousData) => string | number;
  getVolunteerInfo: (id: number) => Promise<VolunteerData>;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

const AppointmentItem = ({
  rdv,
  isSelectable = false,
  isSelected = false,
  onSelect = null,
  onUnassign = null,
  onUpdateComment = null,
  onSwitch = null,
  getVolunteerInfo,
  formatDate,
  formatTime,
  getStatusColor,
  loading = false
}: AppointmentItemProps) => {
  const { t } = useTranslation();
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editComment, setEditComment] = useState(rdv.commentaires || '');

  // Utiliser getAppointmentId si nécessaire pour un identifiant unique
  // const appointmentId = getAppointmentId(rdv);

  const handleStartEdit = () => {
    setIsEditingComment(true);
    setEditComment(rdv.commentaires || '');
  };

  const handleCancelEdit = () => {
    setIsEditingComment(false);
    setEditComment(rdv.commentaires || '');
  };

  const handleSaveEdit = async () => {
    if (editComment.trim() !== (rdv.commentaires || '').trim()) {
      if (onUpdateComment) {
        await onUpdateComment(rdv, editComment.trim());
      }
    }
    setIsEditingComment(false);
  };

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) onSelect(rdv);
  };

  const handleItemClick = () => {
    if (isSelectable && onSelect) {
      onSelect(rdv);
    }
  };

  return (
    <div
      className={`p-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={handleItemClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {isSelectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxClick}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          )}

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(rdv.date || '')} à {formatTime(rdv.heure || '')}
            </div>

            <div className="text-xs text-gray-500">
              {rdv.volontaire || rdv.idVolontaire ? (
                <div className="text-orange-600">
                  <span className="font-medium">👤 {t('appointments.assignedTo')}:</span>
                  <div className="mt-1">
                    <VolunteerInfo rdv={rdv} getVolunteerInfo={getVolunteerInfo} />
                  </div>
                </div>
              ) : (
                <span className="text-green-600">
                  {isSelectable ? `✅ ${t('appointments.available')}` : `👤 ${t('appointments.assignedToThisVolunteer')}`}
                </span>
              )}
            </div>

            {/* Zone d'édition du commentaire */}
            {isEditingComment ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder={t('appointments.addCommentPlaceholder')}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit();
                    }}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={loading}
                  >
                    {t('common.save')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                    className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                {rdv.commentaires ? (
                  <div className="text-xs text-blue-600 font-medium">
                    💬 {rdv.commentaires}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    {t('appointments.noComment')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-3">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rdv.etat || '')}`}>
            {rdv.etat || 'N/A'}
          </span>

          {onUpdateComment && !isEditingComment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit();
              }}
              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
              disabled={loading}
              title={t('appointments.editComment')}
            >
              ✏️
            </button>
          )}

          {onSwitch && (rdv.volontaire || rdv.idVolontaire) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwitch(rdv);
              }}
              className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-300 rounded hover:bg-purple-50"
              disabled={loading}
              title={t('appointments.switchAppointment')}
            >
              ⇄
            </button>
          )}

          {onUnassign && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnassign(rdv);
              }}
              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
              disabled={loading}
            >
              {t('appointments.unassign')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentItem;