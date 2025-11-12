import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const RibSection = ({ infoBankData }: { infoBankData: { iban?: string; bic?: string } }) => (
  <Card>
    <CardHeader>
      <CardTitle>Informations bancaires (RIB)</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">IBAN</p>
          <p className="text-sm text-gray-900 font-mono">{displayValue(infoBankData.iban)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">BIC / Code SWIFT</p>
          <p className="text-sm text-gray-900 font-mono">{displayValue(infoBankData.bic)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RibSection;
