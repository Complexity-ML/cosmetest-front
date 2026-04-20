import { useTranslation } from 'react-i18next';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const formatDate = (date: any) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch {
    return String(date);
  }
};

const MedecineEsthetiqueSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.resume.groups.medecineEsthetique', 'Médecine esthétique')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">
            {t('volunteers.resume.fields.injectionsVisage', 'Injections sur le visage')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.injectionsVisage', 'Injections sur le visage')}
              </p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.injectionsVisage)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.injectionsVisageZone', 'Zone des injections')}
              </p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.injectionsVisageZone)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.injectionsVisageDate', 'Date de la dernière injection')}
              </p>
              <p className="text-sm text-gray-900">{formatDate(volontaireDisplayData.injectionsVisageDate)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">
            {t('volunteers.resume.fields.maquillagePermanentVisage', 'Maquillage permanent sur le visage')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.maquillagePermanentVisage', 'Maquillage permanent sur le visage')}
              </p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.maquillagePermanentVisage)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.maquillagePermanentVisageZone', 'Zone du maquillage permanent')}
              </p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.maquillagePermanentVisageZone)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">
                {t('volunteers.resume.fields.maquillagePermanentVisageDate', 'Date du dernier maquillage permanent')}
              </p>
              <p className="text-sm text-gray-900">{formatDate(volontaireDisplayData.maquillagePermanentVisageDate)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedecineEsthetiqueSection;
