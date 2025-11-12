import VolontairePhoto from '../VolontairePhoto';
import { formatDate, calculateAgeFromDate } from '../../../utils/dateUtils';
import { formatGender, formatPhoneNumber } from '../../../utils/formatters';
import { displayValue, formatCompactDate } from '../../../pages/Volontaires/utils/detailsHelpers';
import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { AlertTriangle, XCircle, Calendar, FileText } from 'lucide-react';

interface AnnulationEtude {
  idEtude?: number;
  nomEtude?: string;
  referenceEtude?: string;
  dateEtude?: string;
  dateAnnulation?: string;
  motif?: string;
}

interface InfoSectionProps {
  volontaire: any;
  volontaireDisplayData: VolontaireData;
  annulationsEtudes: AnnulationEtude[];
  showAllAnnulations: boolean;
  onToggleAnnulations: () => void;
  onSelectPhoto: (photo: { url: string; alt: string }) => void;
}

const InfoSection = ({
  volontaire,
  volontaireDisplayData,
  annulationsEtudes,
  showAllAnnulations,
  onToggleAnnulations,
  onSelectPhoto,
}: InfoSectionProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-48 h-48 mx-auto lg:mx-0 border rounded-lg overflow-hidden shadow-sm bg-gray-50">
            <VolontairePhoto
              volontaireId={volontaire.id}
              photoType="face"
              className="w-full h-full"
              onPhotoLoad={() => console.log('Photo de face chargee')}
              onPhotoError={() => console.log('Erreur photo face')}
              onPhotoClick={(photo: { url: string; type?: string }) =>
                onSelectPhoto({
                  url: photo.url,
                  alt: `Photo de face de ${volontaire.nomVol} ${volontaire.prenomVol}`,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coordonnees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Nom</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.nomVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Prenom</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.prenomVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Email</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.emailVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Telephone portable</p>
              <p className="text-sm text-gray-900 font-mono tracking-wide">
                {formatPhoneNumber(volontaireDisplayData.telPortableVol)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Telephone fixe</p>
              <p className="text-sm text-gray-900 font-mono tracking-wide">
                {formatPhoneNumber(volontaireDisplayData.telDomicileVol)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Date de naissance</p>
              <p className="text-sm text-gray-900">
                {volontaireDisplayData.dateNaissance ? formatDate(volontaireDisplayData.dateNaissance, 'dd/MM/yyyy') : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Age</p>
              <p className="text-sm text-gray-900">
                {calculateAgeFromDate(volontaireDisplayData.dateNaissance)
                  ? `${calculateAgeFromDate(volontaireDisplayData.dateNaissance)} ans`
                  : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Sexe</p>
              <p className="text-sm text-gray-900">{formatGender(volontaireDisplayData.sexe)}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Adresse</p>
              <p className="text-sm text-gray-900">
                {volontaireDisplayData.adresseVol ? (
                  <>
                    {volontaireDisplayData.adresseVol}
                    <br />
                    {volontaireDisplayData.cpVol} {volontaireDisplayData.villeVol}
                    <br />
                    {volontaireDisplayData.pays && `${volontaireDisplayData.pays}`}
                  </>
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commentaires</CardTitle>
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

      {annulationsEtudes.length > 0 && (
        <Card className="border-red-300 bg-red-50/50 shadow-lg">
          <CardHeader className="bg-red-100 border-b border-red-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Annulations d'études
                <Badge variant="destructive" className="ml-2 text-base px-3 py-1">
                  {annulationsEtudes.length}
                </Badge>
              </CardTitle>
              {annulationsEtudes.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAnnulations}
                  className="text-red-700 hover:text-red-900 hover:bg-red-200"
                >
                  {showAllAnnulations ? 'Voir moins' : `Voir toutes (${annulationsEtudes.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {annulationsEtudes.length >= 5 && (
              <Alert variant="destructive" className="bg-red-100 border-red-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between text-sm">
                  <span className="font-bold">⚠️ Attention : nombre important d'annulations ({annulationsEtudes.length})</span>
                  <span className="text-xs">
                    Dernière : {formatCompactDate(annulationsEtudes[0]?.dateAnnulation)}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {(showAllAnnulations ? annulationsEtudes : annulationsEtudes.slice(0, 3)).map((annulation: AnnulationEtude, index: number) => (
                <Card key={`${annulation.idEtude}-${index}`} className="border-red-300 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-semibold text-red-700 mb-1">
                              {annulation.nomEtude || 'Étude inconnue'}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Référence : {annulation.referenceEtude || 'N/A'}
                            </p>
                            {annulation.dateEtude && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                Date étude : {formatCompactDate(annulation.dateEtude)}
                              </p>
                            )}
                          </div>
                          <div className="text-right bg-red-100 px-3 py-2 rounded-md">
                            <p className="text-xs text-gray-600 font-medium">Annulée le</p>
                            <p className="text-sm font-bold text-red-700">
                              {formatCompactDate(annulation.dateAnnulation)}
                            </p>
                          </div>
                        </div>
                        {annulation.motif && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-red-400">
                            <p className="text-xs font-medium text-gray-500 mb-1">Motif :</p>
                            <p className="text-sm text-gray-700">{annulation.motif}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {volontaireDisplayData.dateAjout && (
        <Card>
          <CardHeader>
            <CardTitle>Informations systeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-brand-cyan">Date d'ajout</p>
                <p className="text-sm text-gray-900">
                  {formatDate(volontaireDisplayData.dateAjout, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

export default InfoSection;
