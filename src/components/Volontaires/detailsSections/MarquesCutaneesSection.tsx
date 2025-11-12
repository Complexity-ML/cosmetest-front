import { displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const MarquesCutaneesSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Marques cutanées</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Cicatrices</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cicatrices)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Tatouages</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tatouages)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Piercings</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.piercings)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Taches pigmentaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Visage</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesVisage)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Cou</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesCou)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Décolleté</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesDecollete)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Mains</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesMains)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Vergetures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Jambes</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesJambes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Fesses/Hanches</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesFessesHanches)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Ventre/Taille</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesVentreTaille)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Poitrine/Décolleté</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesPoitrineDecollete)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MarquesCutaneesSection;
