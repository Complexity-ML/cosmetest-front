import { useTranslation } from 'react-i18next';
import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const NotesSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.notesAndComments')}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">{t('volunteers.notes')}</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.commentairesVol)}
        </p>
      </div>
    </CardContent>
  </Card>
  );
};

export default NotesSection;
