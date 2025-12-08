import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../utils/dateUtils'
import { EtudeData } from '../../../types/etude.types'

interface DetailsSectionProps {
  etude: EtudeData;
}

const DetailsSection = ({ etude }: DetailsSectionProps) => {
  const { t } = useTranslation()
  const getStatusBadge = (currentEtude: EtudeData) => {
    if (!currentEtude || !currentEtude.dateDebut || !currentEtude.dateFin) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{t('studies.unknown')}</span>
    }

    const now = new Date()
    const startDate = new Date(currentEtude.dateDebut)
    const endDate = new Date(currentEtude.dateFin)

    let statusConfig = {
      label: t('studies.unknown'),
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    }

    if (now < startDate) {
      statusConfig = {
        label: t('studies.upcoming'),
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      }
    } else if (now > endDate) {
      statusConfig = {
        label: t('studies.completed'),
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      }
    } else {
      statusConfig = {
        label: t('studies.ongoing'),
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      }
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
        {statusConfig.label}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-2 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase text-gray-500">{t('studies.reference')}</span>
          <h2 className="text-xl font-semibold">{etude.ref}</h2>
        </div>
        <div>
          {getStatusBadge(etude)}
        </div>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">{t('studies.title')}</span>
        <p className="text-lg">{etude.titre}</p>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">{t('studies.description')}</span>
        <p className="mt-1 whitespace-pre-line">{etude.description || etude.commentaires || t('studyDetails.noDescription')}</p>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">{t('studies.products')}</span>
        {etude.produits ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {etude.produits.split(',').map((produit: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-300"
              >
                {produit.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-gray-500">{t('studyDetails.noProductSpecified')}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">{t('studies.exams')}</span>
        <p className="mt-1">{etude.examens || t('studyDetails.noSpecificExam')}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studies.type')}</span>
        <p className="mt-1">{etude.type}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studies.capacity')}</span>
        <p className="mt-1">{etude.capaciteVolontaires} {t('studies.volunteers')}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studies.startDate')}</span>
        <p className="mt-1">{formatDate(etude.dateDebut)}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studies.endDate')}</span>
        <p className="mt-1">{formatDate(etude.dateFin)}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studies.compensation')}</span>
        <p className="mt-1">
          {etude.iv ? `${t('common.yes')} - ${etude.iv} €` : t('common.no')}
        </p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">{t('studyDetails.paid')}</span>
        <p className="mt-1">
          {etude.paye ? `${t('common.yes')} - ${etude.paye}` : t('common.no')}
        </p>
      </div>
    </div>
  )
}

export default DetailsSection

