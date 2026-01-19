import { useTranslation } from 'react-i18next'

type ChangeMode = 'time' | 'date' | 'both'

interface TimeChangeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  newTime: string
  setNewTime: (time: string) => void
  newDate: string
  setNewDate: (date: string) => void
  changeMode: ChangeMode
  setChangeMode: (mode: ChangeMode) => void
  onConfirm: () => void
  isLoading: boolean
  error: string | null
}

const TimeChangeModal = ({
  isOpen,
  onClose,
  selectedCount,
  newTime,
  setNewTime,
  newDate,
  setNewDate,
  changeMode,
  setChangeMode,
  onConfirm,
  isLoading,
  error
}: TimeChangeModalProps) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  const showTimeInput = changeMode === 'time' || changeMode === 'both'
  const showDateInput = changeMode === 'date' || changeMode === 'both'

  const isConfirmDisabled = isLoading ||
    (showTimeInput && !newTime) ||
    (showDateInput && !newDate)

  const getModalTitle = () => {
    switch (changeMode) {
      case 'time':
        return t('appointments.changeTime') || 'Changer l\'heure'
      case 'date':
        return t('appointments.changeDate') || 'Changer la date'
      case 'both':
        return t('appointments.changeDateAndTime') || 'Changer la date et l\'heure'
    }
  }

  const getModalDescription = () => {
    switch (changeMode) {
      case 'time':
        return t('appointments.changeTimeForSelected') || 'Modifier l\'heure pour les rendez-vous sélectionnés'
      case 'date':
        return t('appointments.changeDateForSelected') || 'Modifier la date pour les rendez-vous sélectionnés'
      case 'both':
        return t('appointments.changeDateAndTimeForSelected') || 'Modifier la date et l\'heure pour les rendez-vous sélectionnés'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {changeMode === 'time' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {getModalTitle()}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {getModalDescription()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>{selectedCount}</strong> {t('appointments.appointmentsSelected') || 'rendez-vous sélectionné(s)'}
                  </p>
                </div>

                {/* Sélecteur de mode */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments.whatToChange') || 'Que souhaitez-vous modifier ?'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setChangeMode('time')}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        changeMode === 'time'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {t('appointments.timeOnly') || 'Heure seulement'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeMode('date')}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        changeMode === 'date'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {t('appointments.dateOnly') || 'Date seulement'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeMode('both')}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        changeMode === 'both'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {t('appointments.dateAndTime') || 'Date et heure'}
                    </button>
                  </div>
                </div>

                {/* Input Date */}
                {showDateInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('appointments.newDate') || 'Nouvelle date'}
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Input Heure */}
                {showTimeInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('appointments.newTime') || 'Nouvelle heure'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTime.split(':')[0] || ''}
                        onChange={(e) => {
                          const hours = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const minutes = newTime.split(':')[1] || '00'
                          setNewTime(`${hours}:${minutes}`)
                        }}
                        placeholder="HH"
                        maxLength={2}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
                        disabled={isLoading}
                        autoFocus={changeMode === 'time'}
                      />
                      <span className="text-2xl font-bold text-gray-500">:</span>
                      <input
                        type="text"
                        value={newTime.split(':')[1] || ''}
                        onChange={(e) => {
                          const hours = newTime.split(':')[0] || '00'
                          const minutes = e.target.value.replace(/\D/g, '').slice(0, 2)
                          setNewTime(`${hours}:${minutes}`)
                        }}
                        placeholder="MM"
                        maxLength={2}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading') || 'Chargement...'}
                </>
              ) : (
                t('common.confirm') || 'Confirmer'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {t('common.cancel') || 'Annuler'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeChangeModal
