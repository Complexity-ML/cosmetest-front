import { formatDate } from '../../../utils/dateUtils'
import { EtudeData } from '../../../types/etude.types'

interface DetailsSectionProps {
  etude: EtudeData;
}

const DetailsSection = ({ etude }: DetailsSectionProps) => {
  const getStatusBadge = (currentEtude: EtudeData) => {
    if (!currentEtude || !currentEtude.dateDebut || !currentEtude.dateFin) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu</span>
    }

    const now = new Date()
    const startDate = new Date(currentEtude.dateDebut)
    const endDate = new Date(currentEtude.dateFin)

    let statusConfig = {
      label: 'Inconnu',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    }

    if (now < startDate) {
      statusConfig = {
        label: 'À venir',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      }
    } else if (now > endDate) {
      statusConfig = {
        label: 'Terminée',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      }
    } else {
      statusConfig = {
        label: 'En cours',
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
          <span className="text-xs uppercase text-gray-500">Référence</span>
          <h2 className="text-xl font-semibold">{etude.ref}</h2>
        </div>
        <div>
          {getStatusBadge(etude)}
        </div>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">Titre</span>
        <p className="text-lg">{etude.titre}</p>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">Description</span>
        <p className="mt-1 whitespace-pre-line">{etude.description || etude.commentaires || 'Aucune description'}</p>
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">Produits</span>
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
          <p className="mt-1 text-gray-500">Aucun produit spécifié</p>
        )}
      </div>

      <div className="md:col-span-2">
        <span className="text-xs uppercase text-gray-500">Examen</span>
        <p className="mt-1">{etude.examens || 'Aucun examen spécifique'}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Type</span>
        <p className="mt-1">{etude.type}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Capacité</span>
        <p className="mt-1">{etude.capaciteVolontaires} volontaires</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Date de début</span>
        <p className="mt-1">{formatDate(etude.dateDebut)}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Date de fin</span>
        <p className="mt-1">{formatDate(etude.dateFin)}</p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Rémunération</span>
        <p className="mt-1">
          {etude.iv ? `Oui - ${etude.iv} €` : 'Non'}
        </p>
      </div>

      <div>
        <span className="text-xs uppercase text-gray-500">Payer</span>
        <p className="mt-1">
          {etude.paye ? `Oui - ${etude.paye}` : 'Non'}
        </p>
      </div>
    </div>
  )
}

export default DetailsSection

