import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const CheveuxSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Caractéristiques des cheveux</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Couleur des cheveux</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.couleurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Longueur des cheveux</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.longueurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Nature des cheveux</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.natureCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">épaisseur des cheveux</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.epaisseurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Nature du cuir chevelu</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.natureCuirChevelu)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Cuir chevelu sensible</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cuirCheveluSensible)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Chute de cheveux</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.chuteDeCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Cheveux cassants</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cheveuxCassants)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Ongles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Ongles cassants</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.onglesCassants)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Ongles dédoublés</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.onglesDedoubles)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CheveuxSection;
