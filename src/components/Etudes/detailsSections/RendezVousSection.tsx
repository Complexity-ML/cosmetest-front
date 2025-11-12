import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { formatDate } from '../../../utils/dateUtils'
import AppointmentViewer from '../../../pages/RendezVous/AppointmentViewer'
import { RendezVousProvider } from '../../../pages/RendezVous/context/RendezVousContext'
import GroupEmailSender from '../../../components/Etudes/GroupEmailSender'
import VolunteerExcelExport from '../../../components/Etudes/VolunteerExcelExport'
import RdvExcelExport from '../../../components/Etudes/RdvExcelExport'
import RecrutementExcelExport from '../../../components/Etudes/RecrutementExcelExport'
import { timeToMinutes, normalizeTime } from '../../../utils/timeUtils'
import { EtudeData } from '../../../types/etude.types'

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
      ) : showRdvViewer && selectedRdv ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Détails du rendez-vous</h3>
            <button
              onClick={handleBackToRdvList}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Retour à la liste
            </button>
          </div>
          <RendezVousProvider>
            <AppointmentViewer
              appointment={selectedRdv}
              onEdit={() => { navigate(`/rdvs`) }}
              onBack={handleBackToRdvList}
              onRefresh={handleRdvUpdate}
            />
          </RendezVousProvider>
        </div>
      ) : (
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Rendez-vous</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des rendez-vous pour l'étude {etude.ref}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/rdvs" className="btn btn-outline-primary inline-flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Nouveau RDV
              </Link>

              {rdvs.length > 0 && (
                <>
                  {getUniqueVolunteerIds().length > 0 && (
                    <button
                      onClick={handleOpenEmailSender}
                      className="btn btn-outline-blue inline-flex items-center"
                      title={`Envoyer un email aux ${getUniqueVolunteerIds().length} volontaires`}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Email de groupe</span>
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
                      title="Exporter les données"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Exporter</span>
                      <span className="sm:hidden">Export</span>
                      <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showActionsMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900">Exporter les données</h4>
                          <p className="text-xs text-gray-600 mt-1">Téléchargez les données au format Excel</p>
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
                              Liste complète des {rdvs.length} rendez-vous avec détails
                            </p>
                          </div>

                          <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                            <VolunteerExcelExport
                              volunteerIds={getUniqueVolunteerIds()}
                              studyId={etude.idEtude}
                              studyRef={etude.ref}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Informations détaillées des {getUniqueVolunteerIds().length} volontaires
                            </p>
                          </div>

                          <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                            <RecrutementExcelExport
                              volunteerIds={getUniqueVolunteerIds()}
                              studyRef={etude.ref}
                              studyId={etude.idEtude}
                              studyTitle={etude.titre}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Feuille pivot avec tous les {getUniqueVolunteerIds().length} volontaires
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
                    <p className="text-sm font-medium text-blue-900">Volontaires</p>
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
                    <p className="text-sm font-medium text-green-900">Rendez-vous</p>
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
                    <p className="text-sm font-medium text-yellow-900">Non assignés</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par date</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded border ${!selectedDate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setSelectedDate('')}
                >
                  Toutes les dates
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier rendez-vous pour cette étude.</p>
              <div className="mt-6">
                <Link
                  to="/rdvs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer un rendez-vous
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Astuce :</strong> Cliquez sur n'importe quelle ligne pour voir les détails du rendez-vous et le modifier.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                        <span className="flex items-center">
                          Date
                          {renderSortIcon('date')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('heure')}>
                        <span className="flex items-center">
                          Heure
                          {renderSortIcon('heure')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('volontaire')}>
                        <span className="flex items-center">
                          Volontaire
                          {renderSortIcon('volontaire')}
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('etat')}>
                        <span className="flex items-center">
                          Statut
                          {renderSortIcon('etat')}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {finalRdvs.map((rdv: RendezVousData) => (
                      <tr key={rdv.id || `${rdv.idEtude}-${rdv.idRdv}`} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRdvClick(rdv)} title="Cliquer pour voir les détails">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(rdv.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{normalizeTime(rdv.heure)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getNomVolontaire(rdv)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rdv.etat === 'CONFIRME' ? 'bg-green-100 text-green-800' : rdv.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' : rdv.etat === 'ANNULE' ? 'bg-red-100 text-red-800' : rdv.etat === 'COMPLETE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rdv.etat || 'PLANIFIE'}
                          </span>
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
    </div>
  )
}

export default RendezVousSection
