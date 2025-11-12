import { formatSkinType } from '../../../utils/formatters';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const PeauSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Caractéristiques de la peau</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Type de peau</p>
          <p className="text-sm text-gray-900">
            {formatSkinType(volontaireDisplayData.typePeauVisage) || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Carnation</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.carnation)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Sensibilité cutanée</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.sensibiliteCutanee)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Teint inhomogène</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.teintInhomogene)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Teint terne</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.teintTerne)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Pores visibles</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.poresVisibles)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Exposition au soleil</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Exposition solaire</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.expositionSolaire)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Bronzage</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.bronzage)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Coups de soleil</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.coupsDeSoleil)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Cellulite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Bras</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteBras)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Fesses/Hanches</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteFessesHanches)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Jambes</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteJambes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Ventre/Taille</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteVentreTaille)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Sécheresse de la peau</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Lèvres</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseLevres)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Cou</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseCou)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Poitrine/Décolleté</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheressePoitrineDecollete)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Ventre/Taille</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseVentreTaille)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Fesses/Hanches</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseFessesHanches)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Bras</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseBras)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Mains</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseMains)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Jambes</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseJambes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Pieds</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheressePieds)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Problèmes autour des yeux</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Cernes pigmentaires</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cernesPigmentaires)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Cernes vasculaires</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cernesVasculaires)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Poches</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.poches)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Perte de fermeté</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Visage</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteVisage)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Cou</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteCou)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Décolleté</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteDecollete)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PeauSection;
