import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VolontairePhoto from '../VolontairePhoto';
import { formatDate, calculateAgeFromDate } from '../../../utils/dateUtils';
import { formatGender, formatPhoneNumber } from '../../../utils/formatters';
import { displayValue, formatCompactDate } from '../../../pages/Volontaires/utils/detailsHelpers';
import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { AlertTriangle, XCircle, Calendar, FileText, BookOpen, CheckCircle, Copy, Check } from 'lucide-react';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import volontaireService from '../../../services/volontaireService';
import api from '../../../services/api';

interface AnnulationEtude {
  idEtude?: number;
  nomEtude?: string;
  referenceEtude?: string;
  dateEtude?: string;
  dateAnnulation?: string;
  motif?: string;
  annulePar?: 'COSMETEST' | 'VOLONTAIRE' | string;
}

interface EtudeEnCours {
  idEtude: number;
  ref: string;
  titre: string;
  statut: string;
  dateDebut?: string;
  dateFin?: string;
}

interface InfoSectionProps {
  volontaire: any;
  volontaireDisplayData: VolontaireData;
  annulationsEtudes: AnnulationEtude[];
  showAllAnnulations: boolean;
  onToggleAnnulations: () => void;
  onSelectPhoto: (photo: { url: string; alt: string }) => void;
  volontaireId?: string | number;
}

const InfoSection = ({
  volontaire,
  volontaireDisplayData,
  annulationsEtudes,
  showAllAnnulations,
  onToggleAnnulations,
  onSelectPhoto,
  volontaireId,
}: InfoSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [etudesEnCours, setEtudesEnCours] = useState<EtudeEnCours[]>([]);
  const [isLoadingEtudes, setIsLoadingEtudes] = useState(false);
  const [showAllEtudes, setShowAllEtudes] = useState(false);

  // Date de mise à jour gérée localement pour que l'alerte disparaisse dès clic
  const [localDateModif, setLocalDateModif] = useState<string | undefined>(volontaireDisplayData.dateModif);
  const [isTouchingDateModif, setIsTouchingDateModif] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Identifiant normalisé type "_dupont150395"
  // nom en minuscules, sans accents, parts de noms composés jointes par "_"
  // Date de naissance au format JJMMAA
  const fileId = (() => {
    const nom = volontaireDisplayData.nomVol;
    const dob = volontaireDisplayData.dateNaissance;
    if (!nom || !dob) return null;
    const normalizedNom = nom
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .split(/[\s\-']+/)
      .filter(Boolean)
      .join('_');
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `_${normalizedNom}${dd}${mm}${yy}`;
  })();

  const handleCopyId = (value: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value);
    } else {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(value);
    setTimeout(() => setCopiedId(null), 2000);
  };
  useEffect(() => {
    setLocalDateModif(volontaireDisplayData.dateModif);
  }, [volontaireDisplayData.dateModif]);

  const needsUpdate = (() => {
    // L'alerte n'apparaît qu'à partir de 2 ans après la date d'inscription (dateI)
    const dateI = volontaireDisplayData.dateI;
    if (!dateI) return false;
    const inscrit = new Date(dateI);
    if (isNaN(inscrit.getTime())) return false;
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (inscrit.getTime() > twoYearsAgo.getTime()) return false;

    // Volontaire inscrit depuis plus de 2 ans : alerte si pas de dateModif ou dateModif > 2 ans
    if (!localDateModif) return true;
    const modif = new Date(localDateModif);
    if (isNaN(modif.getTime())) return true;
    return modif.getTime() < twoYearsAgo.getTime();
  })();

  const handleTouchDateModif = async () => {
    if (!volontaireId) return;
    setIsTouchingDateModif(true);
    try {
      await volontaireService.touchDateModif(volontaireId);
      setLocalDateModif(new Date().toISOString());
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la date:', err);
      alert('Impossible de mettre à jour la date. Réessaye.');
    } finally {
      setIsTouchingDateModif(false);
    }
  };

  // Filtrer les annulations pour exclure celles faites par Cosmetest (sécurité : déjà filtré au niveau du hook)
  const annulationsParVolontaire = annulationsEtudes.filter(
    (annulation) => (annulation.annulePar || '').toString().toUpperCase() !== 'COSMETEST'
  );

  // Pour l'alerte/compteur sur la fiche principale : année en cours uniquement
  const currentYear = new Date().getFullYear();
  const annulationsRecentes = annulationsParVolontaire.filter((a) => {
    const year = new Date(a.dateAnnulation || '').getFullYear();
    return year === currentYear;
  });

  useEffect(() => {
    const fetchEtudesEnCours = async () => {
      if (!volontaireId) return;

      try {
        setIsLoadingEtudes(true);
        // Récupérer les associations étude-volontaire
        const associationsResponse = await etudeVolontaireService.getEtudesByVolontaire(volontaireId);
        const associationsArray = associationsResponse?.data || [];

        // Récupérer les détails de chaque étude
        const etudesDetails = await Promise.all(
          associationsArray.map(async (assoc: any) => {
            try {
              const etudeResponse = await api.get(`/etudes/${assoc.idEtude}`);
              const detailsEtude = etudeResponse.data;
              return {
                idEtude: assoc.idEtude,
                ref: detailsEtude.ref || `Étude #${assoc.idEtude}`,
                titre: detailsEtude.titre || 'Titre non disponible',
                statut: assoc.statut,
                dateDebut: detailsEtude.dateDebut,
                dateFin: detailsEtude.dateFin,
              };
            } catch (error) {
              console.warn(`Erreur lors de la récupération de l'étude ${assoc.idEtude}:`, error);
              return null;
            }
          })
        );

        // Filtrer pour ne garder que les études en cours (commencées et non terminées)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const etudesEnCoursFiltered = (etudesDetails.filter(Boolean) as EtudeEnCours[]).filter((etude) => {
          // Si pas de date de fin, l'étude est considérée comme en cours
          if (!etude.dateFin) {
            return true;
          }

          const dateFin = new Date(etude.dateFin);
          dateFin.setHours(0, 0, 0, 0);

          // L'étude est en cours si elle n'est pas encore terminée
          return today <= dateFin;
        });

        setEtudesEnCours(etudesEnCoursFiltered);
      } catch (error) {
        console.error('Erreur lors de la récupération des études en cours:', error);
      } finally {
        setIsLoadingEtudes(false);
      }
    };

    fetchEtudesEnCours();
  }, [volontaireId]);

  return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('volunteers.photos')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-48 h-48 mx-auto border rounded-lg overflow-hidden shadow-sm bg-gray-50">
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

      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{t('volunteers.volunteerId')}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{volontaire.id}</p>
      </div>

      {fileId && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between gap-2 px-2 py-1 bg-white rounded border border-gray-200">
            <code className="text-xs font-mono text-gray-800 truncate" title={fileId}>
              {fileId}
            </code>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => handleCopyId(fileId)}
              title="Copier"
            >
              {copiedId === fileId ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>

    <div className="lg:col-span-2 space-y-6">
      {needsUpdate && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between gap-3">
            <span className="text-sm text-amber-800">
              <strong>Fiche à mettre à jour :</strong>{' '}
              {localDateModif
                ? `dernière maj le ${formatDate(localDateModif)} (plus de 2 ans)`
                : 'aucune date de mise à jour enregistrée'}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 bg-white text-amber-800 hover:bg-amber-100 shrink-0"
              onClick={handleTouchDateModif}
              disabled={isTouchingDateModif}
            >
              {isTouchingDateModif ? 'Mise à jour…' : 'J\'ai mis à jour la fiche'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('volunteers.contact')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lastName')}</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.nomVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.firstName')}</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.prenomVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.email')}</p>
              <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.emailVol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.mobilePhone')}</p>
              <p className="text-sm text-gray-900 font-mono tracking-wide">
                {formatPhoneNumber(volontaireDisplayData.telPortableVol)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.landlinePhone')}</p>
              <p className="text-sm text-gray-900 font-mono tracking-wide">
                {formatPhoneNumber(volontaireDisplayData.telDomicileVol)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.dateOfBirth')}</p>
              <p className="text-sm text-gray-900">
                {volontaireDisplayData.dateNaissance ? formatDate(volontaireDisplayData.dateNaissance) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.age')}</p>
              <p className="text-sm text-gray-900">
                {calculateAgeFromDate(volontaireDisplayData.dateNaissance)
                  ? `${calculateAgeFromDate(volontaireDisplayData.dateNaissance)} ${t('dates.years')}`
                  : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.gender')}</p>
              <p className="text-sm text-gray-900">{formatGender(volontaireDisplayData.sexe)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.address')}</p>
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
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Date de mise à jour</p>
              <p className="text-sm text-gray-900">
                {localDateModif ? formatDate(localDateModif) : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('volunteers.comments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.comments')}</p>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {displayValue(volontaireDisplayData.commentairesVol)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">Observations</p>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {displayValue(volontaireDisplayData.observations)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingEtudes ? (
        <Card className="border-blue-300 bg-blue-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 italic text-center">{t('common.loading')}</p>
          </CardContent>
        </Card>
      ) : etudesEnCours.length > 0 && (
        <Card className="border-blue-300 bg-blue-50/50 shadow-lg">
          <CardHeader className="bg-blue-100 border-b border-blue-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('volunteers.currentStudies')}
                <Badge variant="secondary" className="ml-2 text-base px-3 py-1 bg-blue-600 text-white">
                  {etudesEnCours.length}
                </Badge>
              </CardTitle>
              {etudesEnCours.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllEtudes(!showAllEtudes)}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-200"
                >
                  {showAllEtudes ? t('common.seeLess') : `${t('common.seeAll')} (${etudesEnCours.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              {(showAllEtudes ? etudesEnCours : etudesEnCours.slice(0, 3)).map((etude: EtudeEnCours) => (
                <Card
                  key={etude.idEtude}
                  className="border-blue-300 bg-white hover:shadow-md transition-shadow cursor-pointer hover:border-blue-500"
                  onClick={() => navigate(`/etudes/${etude.idEtude}`)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-semibold text-blue-700 mb-1">
                              {etude.titre || t('volunteers.unknownStudy')}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {t('volunteers.reference')} : {etude.ref || 'N/A'}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              etude.statut === 'CONFIRME' ? 'bg-green-500 text-white' :
                              etude.statut === 'INSCRIT' ? 'bg-blue-500 text-white' :
                              'bg-orange-500 text-white'
                            }
                          >
                            {etude.statut}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {annulationsRecentes.length > 0 && (
        <Card className="border-red-300 bg-red-50/50 shadow-lg">
          <CardHeader className="bg-red-100 border-b border-red-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('volunteers.studyCancellations')}
                <Badge variant="destructive" className="ml-2 text-base px-3 py-1">
                  {annulationsRecentes.length}
                </Badge>
                {annulationsParVolontaire.length > annulationsRecentes.length && (
                  <span className="text-xs text-red-600 font-normal">
                    ({annulationsParVolontaire.length} au total)
                  </span>
                )}
              </CardTitle>
              {annulationsRecentes.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAnnulations}
                  className="text-red-700 hover:text-red-900 hover:bg-red-200"
                >
                  {showAllAnnulations ? t('common.seeLess') : `${t('common.seeAll')} (${annulationsRecentes.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {annulationsRecentes.length >= 2 && (
            <Alert variant="destructive" className="bg-red-100 border-red-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between text-sm">
                <span className="font-bold">{t('common.warning')} : {t('volunteers.manyStudyCancellations', { count: annulationsRecentes.length })}</span>
                <span className="text-xs">
                  {t('volunteers.lastCancellation')} : {formatCompactDate(annulationsRecentes[0]?.dateAnnulation)}
                </span>
              </AlertDescription>
            </Alert>
            )}

            <div className="space-y-3">
              {(showAllAnnulations ? annulationsRecentes : annulationsRecentes.slice(0, 3)).map((annulation: AnnulationEtude, index: number) => (
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
                              {annulation.nomEtude || t('volunteers.unknownStudy')}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {t('volunteers.reference')} : {annulation.referenceEtude || 'N/A'}
                            </p>
                            {annulation.dateEtude && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {t('studies.studyDate')} : {formatCompactDate(annulation.dateEtude)}
                              </p>
                            )}
                          </div>
                          <div className="text-right bg-red-100 px-3 py-2 rounded-md">
                            <p className="text-xs text-gray-600 font-medium">{t('volunteers.cancelledOn')}</p>
                            <p className="text-sm font-bold text-red-700">
                              {formatCompactDate(annulation.dateAnnulation)}
                            </p>
                          </div>
                        </div>
                        {annulation.annulePar && (
                          <div className="mt-2 mb-2">
                            <Badge
                              variant={annulation.annulePar === 'VOLONTAIRE' ? 'default' : 'secondary'}
                              className={annulation.annulePar === 'VOLONTAIRE' ? 'bg-orange-500' : 'bg-blue-500'}
                            >
                              {t('volunteers.cancelledBy')} : {annulation.annulePar === 'VOLONTAIRE' ? t('volunteers.volunteer') : 'Cosmetest'}
                            </Badge>
                          </div>
                        )}
                        {annulation.motif && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-red-400">
                            <p className="text-xs font-medium text-gray-500 mb-1">{t('volunteers.reason')} :</p>
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
            <CardTitle>{t('volunteers.systemInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-brand-cyan">{t('volunteers.addedOn')}</p>
                <p className="text-sm text-gray-900">
                  {formatDate(volontaireDisplayData.dateAjout)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
  );
};

export default InfoSection;
