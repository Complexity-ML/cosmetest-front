import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

const MedicalSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Informations médicales</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">Traitement en cours</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.traitement)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">Anamnèse</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.anamnese)}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Contraception</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.contraception)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Ménopause</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.menopause)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Santé compatible</p>
          <div className="mt-1">
            {volontaireDisplayData.santeCompatible ? (
              <Badge variant="default" className="bg-green-500">Oui</Badge>
            ) : (
              <Badge variant="destructive">Non</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">Allergies connues</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.allergiesCommentaires)}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default MedicalSection;
