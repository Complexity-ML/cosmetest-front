import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lazy, Suspense } from 'react'
import { useEtudeDetail } from './hooks/useEtudeDetail'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const DetailsSection = lazy(() => import('../../components/Etudes/detailsSections/DetailsSection'))
const RendezVousSection = lazy(() => import('../../components/Etudes/detailsSections/RendezVousSection'))
const GroupesSection = lazy(() => import('../../components/Etudes/detailsSections/GroupesSection'))
const IndemnitesSection = lazy(() => import('../../components/Etudes/detailsSections/IndemnitesSection'))
const ObservationSection = lazy(() => import('../../components/Etudes/detailsSections/ObservationSection'))

const SectionLoader = () => (
  <div className="flex justify-center items-center h-32" role="status" aria-label="Chargement de la section">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

const EtudeDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  // Vérification que l'ID existe
  if (!id) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('studies.studyIdMissing')}</AlertDescription>
      </Alert>
    )
  }

  const {
    etude,
    rdvs,
    groupes,
    isLoading,
    isLoadingRdvs,
    isLoadingGroupes,
    error,
    setError,
    activeTab,
    setActiveTab,
    selectedRdv,
    showRdvViewer,
    sortField,
    sortDirection,
    showEmailSender,
    showActionsMenu,
    setShowActionsMenu,
    showGroupeForm,
    setShowGroupeForm,
    newGroupe,
    ethniesDisponibles,
    phototypesDisponibles,
    handleRdvClick,
    handleBackToRdvList,
    handleRdvUpdate,
    handleIndemniteError,
    getUniqueVolunteerIds,
    handleDelete,
    handleSort,
    sortedRdvs,
    getNomVolontaire,
    handleOpenEmailSender,
    handleCloseEmailSender,
    handleGroupeChange,
    handleEthnieChange,
    handlePhototypeChange,
    handleCreateGroupe,
    fetchGroupes,
  } = useEtudeDetail({ id, navigate })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="relative">
        <AlertDescription>{error}</AlertDescription>
        <button
          onClick={() => setError(null)}
          className="absolute top-2 right-2 text-destructive-foreground hover:text-destructive-foreground/80"
          aria-label={t('common.close')}
        >
          ×
        </button>
      </Alert>
    )
  }

  if (!etude) {
    return (
      <Alert>
        <AlertDescription>{t('studies.notFound')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('studies.studyDetails')}: {etude.titre}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/etudes/${etude.idEtude}/edit`}>{t('common.edit')}</Link>
          </Button>
          {etude.archive && (
            <Button onClick={handleDelete} variant="destructive">
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('details')}
            >
              {t('studies.details')}
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'rdvs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('rdvs')}
            >
              {t('studies.appointments')}
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'groupes'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('groupes')}
            >
              {t('studies.groups')}
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'indemnites'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('indemnites')}
            >
              {t('studies.compensations')}
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'observations'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('observations')}
            >
              Observations
            </button>
          </nav>
        </div>

        <div className="p-6">
          <Suspense fallback={<SectionLoader />}>
          {activeTab === 'details' && (
            <DetailsSection etude={etude} />
          )}

          {activeTab === 'indemnites' && (
            <IndemnitesSection
              etudeId={Number(id)}
              etudeTitle={etude.titre || ''}
              etudeRef={etude.ref}
              onError={(error) => handleIndemniteError(typeof error === 'string' ? error : error.message)}
              rdvs={rdvs}
            />
          )}

          {activeTab === 'groupes' && (
            <GroupesSection
              etude={etude}
              showGroupeForm={showGroupeForm}
              setShowGroupeForm={setShowGroupeForm}
              newGroupe={newGroupe}
              handleGroupeChange={handleGroupeChange}
              ethniesDisponibles={ethniesDisponibles}
              handleEthnieChange={handleEthnieChange}
              phototypesDisponibles={phototypesDisponibles}
              handlePhototypeChange={handlePhototypeChange}
              handleCreateGroupe={handleCreateGroupe}
              isLoadingGroupes={isLoadingGroupes}
              groupes={groupes}
              fetchGroupes={fetchGroupes}
            />
          )}

          {activeTab === 'observations' && (
            <ObservationSection etudeId={Number(id)} />
          )}

          {activeTab === 'rdvs' && (
            <RendezVousSection
              etude={etude}
              rdvs={rdvs}
              isLoadingRdvs={isLoadingRdvs}
              showEmailSender={showEmailSender}
              handleCloseEmailSender={handleCloseEmailSender}
              showRdvViewer={showRdvViewer}
              selectedRdv={selectedRdv}
              handleBackToRdvList={handleBackToRdvList}
              handleRdvUpdate={handleRdvUpdate}
              getUniqueVolunteerIds={getUniqueVolunteerIds}
              handleOpenEmailSender={handleOpenEmailSender}
              showActionsMenu={showActionsMenu}
              setShowActionsMenu={setShowActionsMenu}
              getNomVolontaire={getNomVolontaire}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRdvClick={handleRdvClick}
              sortedRdvs={sortedRdvs}
            />
          )}
          </Suspense>
        </div>
      </div>

      {showActionsMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowActionsMenu(false)}></div>
      )}

      <div className="mt-4">
        <Link to="/etudes" className="text-primary-600 hover:text-primary-800">
          ← {t('studies.backToStudies')}
        </Link>
      </div>
    </div>
  )
}

export default EtudeDetail
