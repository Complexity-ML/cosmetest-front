import { displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const ProblemesSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Problèmes spécifiques</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Acné</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.acne)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Couperose / Rosacée</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.couperoseRosacee)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Dermite séborrhéique</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.dermiteSeborrheique)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Eczéma</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.eczema)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Psoriasis</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.psoriasis)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProblemesSection;
