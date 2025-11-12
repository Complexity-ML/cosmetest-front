import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const CilsSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Caractéristiques des cils</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Épaisseur des cils</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.epaisseurCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Longueur des cils</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.longueurCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Courbure des cils</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.courbureCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Cils abîmés</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cilsAbimes)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Cils broussailleux</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cilsBroussailleux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Chute de cils</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.chuteDeCils)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Sourcils</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Caractéristiques des sourcils</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.caracteristiqueSourcils)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Lèvres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Type de lèvres</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.levres)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CilsSection;
