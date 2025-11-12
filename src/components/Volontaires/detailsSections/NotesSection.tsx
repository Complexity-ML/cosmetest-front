import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const NotesSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Notes et commentaires</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">Notes</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.commentairesVol)}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default NotesSection;
