import { Link } from 'react-router-dom'
import { useMemo, useState, Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../utils/dateUtils'
import AppointmentViewer from '../../../pages/RendezVous/AppointmentViewer'
import { RendezVousProvider } from '../../../pages/RendezVous/context/RendezVousContext'
import GroupEmailSender from '../../../components/Etudes/GroupEmailSender'
import VolunteerExcelExport from '../../../components/Etudes/VolunteerExcelExport'
import RdvExcelExport from '../../../components/Etudes/RdvExcelExport'
import RecrutementExcelExport from '../../../components/Etudes/RecrutementExcelExport'
import VolontairesCommunsExport from '../../../components/Etudes/VolontairesCommunsExport'
import { timeToMinutes, normalizeTime } from '../../../utils/timeUtils'
import { EtudeData } from '../../../types/etude.types'
import etudeVolontaireService from '../../../services/etudeVolontaireService'
import groupeService from '../../../services/groupeService'
import volontaireService from '../../../services/volontaireService'
import rdvService from '../../../services/rdvService'
import TimeChangeModal from './TimeChangeModal'
import AppointmentSwitcher from '../../RendezVous/AppointmentSwitcher'

const AppointmentEditor = lazy(() => import('../../../components/RendezVous/AppointmentComponents/AppointmentEditor'))

interface RendezVousData {
  id?: number;
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  date?: string;
  heure?: string;
  etat?: string;
  [key: string]: any;
}

interface RendezVousSectionProps {
  etude: EtudeData;
  rdvs: RendezVousData[];
  isLoadingRdvs: boolean;
  showEmailSender: boolean;
  handleCloseEmailSender: () => void;
  showRdvViewer: boolean;
  selectedRdv: RendezVousData | null;
  handleBackToRdvList: () => void;
  handleRdvUpdate: () => void;
  navigate: (path: string) => void;
  getUniqueVolunteerIds: () => number[];
  handleOpenEmailSender: () => void;
  showActionsMenu: boolean;
  setShowActionsMenu: (show: boolean) => void;
  getNomVolontaire: (rdv: RendezVousData) => string;
  handleSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleRdvClick: (rdv: RendezVousData) => void;
  sortedRdvs: RendezVousData[] | (() => RendezVousData[]);
}

const RendezVousSection = ({
  etude,
  rdvs,
  isLoadingRdvs,
  showEmailSender,
  handleCloseEmailSender,
  showRdvViewer,
  selectedRdv,
  handleBackToRdvList,
  handleRdvUpdate,
  navigate,
  getUniqueVolunteerIds,
  handleOpenEmailSender,
  showActionsMenu,
  setShowActionsMenu,
  getNomVolontaire,
  handleSort,
  sortField,
  sortDirection,
  handleRdvClick,
  sortedRdvs,
}: RendezVousSectionProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [editedRdv, setEditedRdv] = useState<RendezVousData | null>(null)

  // Multi-sélection
  const [selectedRdvIds, setSelectedRdvIds] = useState<Set<string>>(new Set())
  const [showTimeChangeModal, setShowTimeChangeModal] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [newDate, setNewDate] = useState('')
  const [changeMode, setChangeMode] = useState<'time' | 'date' | 'both'>('time')
  const [isUpdatingTime, setIsUpdatingTime] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [showSwitcher, setShowSwitcher] = useState(false)

  const handleEditClick = async (rdv: RendezVousData) => {
    // Créer une copie du RDV pour ne pas muter l'objet original
    const rdvCopy = { ...rdv }

    // Charger les volontaires de l'étude pour le mode édition
    if (rdvCopy.idEtude) {
      try {
        const response = await etudeVolontaireService.getVolontairesByEtude(rdvCopy.idEtude)
        // Gérer le cas où le retour est paginé (objet avec content) ou un tableau direct
        const etudeVolontaires = Array.isArray(response) ? response : (response?.content || response?.data || [])
        const volunteerList = (etudeVolontaires || []).map((ev: any) => ({
          id: ev.idVol || ev.volontaire?.idVol || ev.volontaireId,
          nom: ev.volontaire?.nom || ev.nom || '',
          prenom: ev.volontaire?.prenom || ev.prenom || '',
        })).filter((v: any) => v.id)
        setVolunteers(volunteerList)
      } catch (err) {
        console.error('Erreur lors du chargement des volontaires:', err)
        setVolunteers([])
      }

      // Charger les infos du groupe si idGroupe existe
      if (rdvCopy.idGroupe && !rdvCopy.groupe) {
        try {
          const groupeData = await groupeService.getById(rdvCopy.idGroupe)
          if (groupeData) {
            rdvCopy.groupe = {
              id: groupeData.idGroupe || groupeData.id,
              idGroupe: groupeData.idGroupe || groupeData.id,
              nom: groupeData.nom || groupeData.intitule || `Groupe ${rdvCopy.idGroupe}`,
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement du groupe:', err)
        }
      }

      // Charger les infos du volontaire si idVolontaire existe
      if (rdvCopy.idVolontaire && !rdvCopy.volontaire) {
        try {
          const response = await volontaireService.getById(rdvCopy.idVolontaire)
          const volontaireData = response?.data
          if (volontaireData) {
            rdvCopy.volontaire = {
              id: volontaireData.idVol || volontaireData.id,
              idVol: volontaireData.idVol || volontaireData.id,
              nom: volontaireData.nom || volontaireData.nomVol || '',
              prenom: volontaireData.prenom || volontaireData.prenomVol || '',
              nomVol: volontaireData.nomVol || volontaireData.nom || '',
              prenomVol: volontaireData.prenomVol || volontaireData.prenom || '',
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement du volontaire:', err)
        }
      }

      // S'assurer que le volontaire actuel est dans la liste des volontaires
      if (rdvCopy.volontaire && rdvCopy.volontaire.id) {
        setVolunteers(prev => {
          const exists = prev.some(v => v.id === rdvCopy.volontaire?.id || v.id === rdvCopy.volontaire?.idVol)
          if (!exists) {
            return [...prev, {
              id: rdvCopy.volontaire?.id || rdvCopy.volontaire?.idVol,
              nom: rdvCopy.volontaire?.nom || '',
              prenom: rdvCopy.volontaire?.prenom || '',
            }]
          }
          return prev
        })
      }
    }
    setEditedRdv(rdvCopy)
    setIsEditing(true)
  }

  const handleEditBack = () => {
    setIsEditing(false)
    setEditedRdv(null)
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    setEditedRdv(null)
    handleRdvUpdate()
    // Retourner à la liste pour voir les changements (selectedRdv sera mis à jour lors du prochain clic)
    handleBackToRdvList()
  }

  // Génération d'un ID unique pour chaque RDV
  const getRdvKey = (rdv: RendezVousData) => rdv.id?.toString() || `${rdv.idEtude}-${rdv.idRdv}`

  // Sélectionner/Désélectionner tous les RDV affichés
  const handleSelectAll = () => {
    if (selectedRdvIds.size === finalRdvs.length) {
      setSelectedRdvIds(new Set())
    } else {
      const allKeys = finalRdvs.map((rdv: RendezVousData) => getRdvKey(rdv))
      setSelectedRdvIds(new Set(allKeys))
    }
  }

  // Récupérer les RDV sélectionnés
  const getSelectedRdvs = () => {
    return finalRdvs.filter((rdv: RendezVousData) => selectedRdvIds.has(getRdvKey(rdv)))
  }

  // Ouvrir le modal de changement d'heure/date
  const openTimeChangeModal = () => {
    setNewTime('')
    setNewDate('')
    setChangeMode('time')
    setUpdateError(null)
    setShowTimeChangeModal(true)
  }

  // Fermer le modal
  const closeTimeChangeModal = () => {
    setShowTimeChangeModal(false)
    setNewTime('')
    setNewDate('')
    setChangeMode('time')
    setUpdateError(null)
  }

  // Mettre à jour l'heure/date des RDV sélectionnés
  const handleTimeChange = async () => {
    const shouldUpdateTime = changeMode === 'time' || changeMode === 'both'
    const shouldUpdateDate = changeMode === 'date' || changeMode === 'both'

    if (shouldUpdateTime && !newTime) {
      setUpdateError(t('appointments.pleaseSelectTime') || 'Veuillez sélectionner une heure')
      return
    }
    if (shouldUpdateDate && !newDate) {
      setUpdateError(t('appointments.pleaseSelectDate') || 'Veuillez sélectionner une date')
      return
    }

    setIsUpdatingTime(true)
    setUpdateError(null)

    const selectedRdvsList = getSelectedRdvs()
    let successCount = 0
    let errorCount = 0

    for (const rdv of selectedRdvsList) {
      try {
        const idEtude = rdv.idEtude
        const idRdv = rdv.idRdv || rdv.id
        if (idEtude && idRdv) {
          const updateData: any = { ...rdv }
          if (shouldUpdateTime) {
            updateData.heure = newTime
          }
          if (shouldUpdateDate) {
            updateData.date = newDate
          }
          await rdvService.update(idEtude, idRdv, updateData)
          successCount++
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour du RDV:', err)
        errorCount++
      }
    }

    setIsUpdatingTime(false)

    if (errorCount > 0) {
      setUpdateError(`${successCount} RDV mis à jour, ${errorCount} erreur(s)`)
    } else {
      closeTimeChangeModal()
      setSelectedRdvIds(new Set())
      handleRdvUpdate() // Rafraîchir la liste
    }
  }

  // Supprimer les RDV sélectionnés
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    const selectedRdvsList = getSelectedRdvs()
    let successCount = 0
    let errorCount = 0

    for (const rdv of selectedRdvsList) {
      try {
        const idEtude = rdv.idEtude
        const idRdv = rdv.idRdv || rdv.id
        if (idEtude && idRdv) {
          await rdvService.delete(idEtude, idRdv)
          successCount++
        }
      } catch (err) {
        console.error('Erreur lors de la suppression du RDV:', err)
        errorCount++
      }
    }

    setIsDeleting(false)
    setShowDeleteConfirm(false)

    if (errorCount > 0) {
      setUpdateError(`${successCount} RDV supprimé(s), ${errorCount} erreur(s)`)
    } else {
      setSelectedRdvIds(new Set())
      handleRdvUpdate() // Rafraîchir la liste
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // Dates disponibles et filtre par date
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set((rdvs || []).map((r: RendezVousData) => r.date))).filter(Boolean) as string[]
    return dates.sort((a, b) => new Date(a || '').getTime() - new Date(b || '').getTime())
  }, [rdvs])

  const [selectedDate, setSelectedDate] = useState('')

  // Liste finale affichée: filtre par date (si sélectionnée) puis tri par heure quand une seule date
  const finalRdvs = useMemo(() => {
    const base = typeof sortedRdvs === 'function' ? sortedRdvs() : (sortedRdvs || rdvs || [])
    const filtered = selectedDate ? base.filter((r: RendezVousData) => r.date === selectedDate) : base
    // Si une seule date (ou une date sélectionnée), trier par heure de façon numérique
    const onlyOneDate = selectedDate || uniqueDates.length === 1
    if (onlyOneDate) {
      return [...filtered].sort((a: RendezVousData, b: RendezVousData) => timeToMinutes(a.heure) - timeToMinutes(b.heure))
    }
    return filtered
  }, [rdvs, sortedRdvs, selectedDate, uniqueDates.length])

  return (
    <div>
      {showEmailSender ? (
        <GroupEmailSender
          studyId={etude.idEtude || 0}
          studyRef={etude.ref || ''}
          studyTitle={etude.titre || ''}
          onClose={handleCloseEmailSender}
        />
      ) : showRdvViewer && editedRdv && isEditing ? (
        <Suspense fallback={
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        }>
          <AppointmentEditor
            appointment={editedRdv}
            volunteers={volunteers}
            onBack={handleEditBack}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      ) : showRdvViewer && selectedRdv ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{t('appointments.appointmentDetails')}</h3>
            <button
              onClick={handleBackToRdvList}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {t('studyDetails.backToList')}
            </button>
          </div>
          <RendezVousProvider>
            <AppointmentViewer
              appointment={selectedRdv}
              onEdit={() => handleEditClick(selectedRdv)}
              onBack={handleBackToRdvList}
              onRefresh={handleRdvUpdate}
            />
          </RendezVousProvider>
        </div>
      ) : (
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{t('studies.appointments')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('studyDetails.appointmentManagementFor')} {etude.ref}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/rdvs" className="btn btn-outline-primary inline-flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('studyDetails.newAppointment')}
              </Link>

              {rdvs.length > 0 && (
                <>
                  {getUniqueVolunteerIds().length > 0 && (
                    <button
                      onClick={handleOpenEmailSender}
                      className="btn btn-outline-blue inline-flex items-center"
                      title={t('studyDetails.sendEmailToVolunteers', { count: getUniqueVolunteerIds().length })}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">{t('studyDetails.groupEmail')}</span>
                      <span className="sm:hidden">Email</span>
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {getUniqueVolunteerIds().length}
                      </span>
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="btn btn-outline-gray inline-flex items-center"
                      title={t('studyDetails.exportData')}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">{t('common.export')}</span>
                      <span className="sm:hidden">Export</span>
                      <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showActionsMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900">{t('studyDetails.exportData')}</h4>
                          <p className="text-xs text-gray-600 mt-1">{t('studyDetails.downloadExcelFormat')}</p>
                        </div>

                        <div className="py-2">
                          <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                            <RdvExcelExport
                              rdvs={rdvs}
                              studyRef={etude.ref}
                              studyId={etude.idEtude}
                              studyTitle={etude.titre}
                              getNomVolontaire={getNomVolontaire}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('studyDetails.completeAppointmentsList', { count: rdvs.length })}
                            </p>
                          </div>

                          <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                            <VolunteerExcelExport
                              volunteerIds={getUniqueVolunteerIds()}
                              studyId={etude.idEtude}
                              studyRef={etude.ref}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('studyDetails.detailedVolunteersInfo', { count: getUniqueVolunteerIds().length })}
                            </p>
                          </div>

                          <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                            <RecrutementExcelExport
                              volunteerIds={getUniqueVolunteerIds()}
                              rdvs={rdvs}
                              studyRef={etude.ref}
                              studyId={etude.idEtude}
                              studyTitle={etude.titre}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('studyDetails.pivotSheetVolunteers', { count: getUniqueVolunteerIds().length })}
                            </p>
                          </div>

                          <div className="px-4 py-3 hover:bg-gray-50">
                            <VolontairesCommunsExport
                              studyRef={etude.ref}
                              studyId={etude.idEtude}
                              studyTitle={etude.titre}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Volontaires présents dans plusieurs études de même référence
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {rdvs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">{t('studies.volunteers')}</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {getUniqueVolunteerIds().length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">{t('studies.appointments')}</p>
                    <p className="text-lg font-semibold text-green-600">
                      {rdvs.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-900">{t('studyDetails.unassigned')}</p>
                    <p className="text-lg font-semibold text-yellow-600">
                      {rdvs.filter((rdv: RendezVousData) => !rdv.idVolontaire).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtre par date quand plusieurs dates sont présentes */}
          {uniqueDates.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointments.filterByDate')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded border ${!selectedDate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setSelectedDate('')}
                >
                  {t('appointments.allDates')}
                </button>
                {uniqueDates.map((d: string) => (
                  <button
                    key={d}
                    className={`px-3 py-1 text-sm rounded border ${selectedDate === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setSelectedDate(d || '')}
                  >
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoadingRdvs ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : rdvs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('appointments.noAppointments')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('studyDetails.startByCreatingAppointment')}</p>
              <div className="mt-6">
                <Link
                  to="/rdvs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('studyDetails.createAppointment')}
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t('studyDetails.tip')}:</strong> {t('studyDetails.clickToViewAppointmentDetails')}
                </p>
              </div>

              {/* Barre d'actions pour les RDV sélectionnés */}
              {selectedRdvIds.size > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-yellow-800">
                    <strong>{selectedRdvIds.size}</strong> {t('appointments.appointmentsSelected') || 'rendez-vous sélectionné(s)'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRdvIds(new Set())}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {t('common.cancel') || 'Annuler'}
                    </button>
                    <button
                      onClick={openTimeChangeModal}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md inline-flex items-center gap-1 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('appointments.changeTime') || 'Changer l\'heure'}
                    </button>
                    {selectedRdvIds.size === 2 && (
                      <button
                        onClick={() => setShowSwitcher(true)}
                        className="px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {t('appointments.switchVolunteers') || 'Échanger volontaires'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md inline-flex items-center gap-1 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('common.delete') || 'Supprimer'}
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                        <span className="flex items-center">
                          {t('appointments.date')}
                          {renderSortIcon('date')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('heure')}>
                        <span className="flex items-center">
                          {t('appointments.time')}
                          {renderSortIcon('heure')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('volontaire')}>
                        <span className="flex items-center">
                          {t('appointments.volunteer')}
                          {renderSortIcon('volontaire')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('etat')}>
                        <span className="flex items-center">
                          {t('appointments.status')}
                          {renderSortIcon('etat')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={finalRdvs.length > 0 && selectedRdvIds.size === finalRdvs.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          title={t('common.selectAll') || 'Tout sélectionner'}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {finalRdvs.map((rdv: RendezVousData) => (
                      <tr key={rdv.id || `${rdv.idEtude}-${rdv.idRdv}`} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRdvClick(rdv)} title={t('studyDetails.clickToViewDetails')}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(rdv.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{normalizeTime(rdv.heure)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getNomVolontaire(rdv)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rdv.etat === 'CONFIRME' ? 'bg-green-100 text-green-800' : rdv.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' : rdv.etat === 'ANNULE' ? 'bg-red-100 text-red-800' : rdv.etat === 'COMPLETE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rdv.etat || 'PLANIFIE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRdvIds.has(getRdvKey(rdv))}
                            onChange={(e) => {
                              e.stopPropagation()
                              const key = getRdvKey(rdv)
                              setSelectedRdvIds(prev => {
                                const newSet = new Set(prev)
                                if (newSet.has(key)) {
                                  newSet.delete(key)
                                } else {
                                  newSet.add(key)
                                }
                                return newSet
                              })
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}
        </div>
      )}

      {/* Modal de changement d'heure/date */}
      <TimeChangeModal
        isOpen={showTimeChangeModal}
        onClose={closeTimeChangeModal}
        selectedCount={selectedRdvIds.size}
        newTime={newTime}
        setNewTime={setNewTime}
        newDate={newDate}
        setNewDate={setNewDate}
        changeMode={changeMode}
        setChangeMode={setChangeMode}
        onConfirm={handleTimeChange}
        isLoading={isUpdatingTime}
        error={updateError}
      />

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {t('appointments.deleteAppointments') || 'Supprimer les rendez-vous'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('appointments.confirmDeleteSelected') || 'Êtes-vous sûr de vouloir supprimer les rendez-vous sélectionnés ?'}
                      </p>
                      <p className="text-sm text-red-600 mt-2 font-medium">
                        <strong>{selectedRdvIds.size}</strong> {t('appointments.appointmentsWillBeDeleted') || 'rendez-vous seront supprimés'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.loading') || 'Suppression...'}
                    </>
                  ) : (
                    t('common.delete') || 'Supprimer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {t('common.cancel') || 'Annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour échanger les volontaires */}
      {showSwitcher && (
        <AppointmentSwitcher
          onClose={() => setShowSwitcher(false)}
          onSwitchComplete={() => {
            setSelectedRdvIds(new Set())
            handleRdvUpdate()
          }}
          preSelectedRdvs={getSelectedRdvs() as any}
          etudeId={etude.idEtude}
        />
      )}
    </div>
  )
}

export default RendezVousSection
