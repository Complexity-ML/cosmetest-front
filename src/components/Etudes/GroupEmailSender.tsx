import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface Volunteer {
  idVolontaire: string | number;
  nom?: string;
  prenom?: string;
  email: string;
  numsujet?: string;
  statut?: string;
}

interface GroupEmailSenderProps {
  studyId: string | number;
  studyRef?: string;
  studyTitle?: string;
  onClose: () => void;
}

const GroupEmailSender = ({ studyId, studyRef, studyTitle, onClose }: GroupEmailSenderProps) => {
  const { t } = useTranslation();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState(new Set<string>());
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les volontaires de l'étude
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setIsLoadingVolunteers(true);
        setError(null);

        // Récupérer les associations étude-volontaire
        const associationsResponse = await api.get(`/etude-volontaires/etude/${studyId}`);
        const associations = associationsResponse.data.data || [];

        // Récupérer les détails de chaque volontaire
        const volunteersPromises = associations.map(async (assoc: any) => {
          try {
            const volunteerResponse = await api.get(`/volontaires/${assoc.idVolontaire}`);
            return {
              ...volunteerResponse.data,
              // Convertir l'ID en string pour assurer la cohérence
              idVolontaire: String(volunteerResponse.data.idVolontaire || assoc.idVolontaire),
              numsujet: assoc.numsujet,
              statut: assoc.statut
            };
          } catch (error) {
            console.error(`Erreur pour volontaire ${assoc.idVolontaire}:`, error);
            return null;
          }
        });

        const volunteersData = await Promise.all(volunteersPromises);
        const validVolunteers = volunteersData
          .filter((volunteer: any) => volunteer && volunteer.email)
          .sort((a: any, b: any) => (a.nom || '').localeCompare(b.nom || ''));

        setVolunteers(validVolunteers);
        
        // Sélectionner tous les volontaires par défaut - convertir les IDs en string
        setSelectedVolunteers(new Set(validVolunteers.map((v: any) => String(v.idVolontaire))));

        // Initialiser le sujet avec la référence de l'étude
        setEmailData(prev => ({
          ...prev,
          subject: `${t('groupEmail.studyInfo')} ${studyRef || studyId}${studyTitle ? ` - ${studyTitle}` : ''}`
        }));

      } catch (error) {
        console.error('Erreur lors du chargement des volontaires:', error);
        setError(t('groupEmail.loadVolunteersError'));
      } finally {
        setIsLoadingVolunteers(false);
      }
    };

    if (studyId) {
      fetchVolunteers();
    }
  }, [studyId, studyRef, studyTitle]);

  const handleVolunteerToggle = (volunteerId: string | number) => {
    // S'assurer que l'ID est une string pour la cohérence
    const volunteerIdStr = String(volunteerId);
    
    setSelectedVolunteers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(volunteerIdStr)) {
        newSet.delete(volunteerIdStr);
      } else {
        newSet.add(volunteerIdStr);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedVolunteers.size === volunteers.length) {
      setSelectedVolunteers(new Set());
    } else {
      setSelectedVolunteers(new Set(volunteers.map(v => String(v.idVolontaire))));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateMailtoLink = () => {
    const selectedVolunteerData = volunteers.filter(v =>
      selectedVolunteers.has(String(v.idVolontaire))
    );

    if (selectedVolunteerData.length === 0) {
      setError(t('groupEmail.selectAtLeastOneVolunteer'));
      return null;
    }

    if (!emailData.subject.trim()) {
      setError(t('groupEmail.fillSubject'));
      return null;
    }

    // Construire la liste des emails
    const emails = selectedVolunteerData.map(volunteer => volunteer.email).join(';');
    
    // Encoder le sujet et le message pour l'URL
    const encodedSubject = encodeURIComponent(emailData.subject);
    const encodedMessage = encodeURIComponent(emailData.message || '');
    
    // Construire le lien mailto
    const mailtoLink = `mailto:${emails}?subject=${encodedSubject}&body=${encodedMessage}`;
    
    return mailtoLink;
  };

  const handleOpenOutlook = () => {
    setError(null);
    
    const mailtoLink = generateMailtoLink();
    if (mailtoLink) {
      // Ouvrir Outlook avec le lien mailto
      window.location.href = mailtoLink;
      
      // Fermer le composant après un court délai
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const getSelectedEmails = () => {
    return volunteers
      .filter(v => selectedVolunteers.has(String(v.idVolontaire)))
      .map(v => v.email)
      .join('; ');
  };

  if (isLoadingVolunteers) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex justify-center items-center h-32 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t('groupEmail.loadingVolunteers')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('groupEmail.composeGroupEmail')}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sujet */}
        <div className="space-y-2">
          <Label htmlFor="subject">{t('groupEmail.subject')} *</Label>
          <Input
            type="text"
            id="subject"
            name="subject"
            value={emailData.subject}
            onChange={handleInputChange}
            required
            placeholder={t('groupEmail.subjectPlaceholder')}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">{t('groupEmail.messageOptional')}</Label>
          <Textarea
            id="message"
            name="message"
            value={emailData.message}
            onChange={handleInputChange}
            rows={6}
            placeholder={t('groupEmail.messagePlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('groupEmail.messageHint')}
          </p>
        </div>

        {/* Sélection des destinataires */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>
              {t('groupEmail.recipients')} ({volunteers.length} {t('groupEmail.volunteersAvailable')})
            </Label>
            <Button
              type="button"
              variant="link"
              onClick={handleSelectAll}
              className="h-auto p-0"
            >
              {selectedVolunteers.size === volunteers.length ? t('common.deselectAll') : t('common.selectAll')}
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-muted/30">
            {volunteers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {t('groupEmail.noVolunteerWithEmail')}
              </p>
            ) : (
              <div className="space-y-2">
                {volunteers.map((volunteer) => (
                  <div key={volunteer.idVolontaire} className="flex items-center space-x-2">
                    <Checkbox
                      id={`volunteer-${volunteer.idVolontaire}`}
                      checked={selectedVolunteers.has(String(volunteer.idVolontaire))}
                      onCheckedChange={() => handleVolunteerToggle(volunteer.idVolontaire)}
                    />
                    <Label
                      htmlFor={`volunteer-${volunteer.idVolontaire}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className="font-medium">
                        {volunteer.prenom} {volunteer.nom}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({volunteer.email})
                      </span>
                      {volunteer.numsujet && (
                        <Badge variant="secondary" className="ml-2">
                          {t('groupEmail.subject')} #{volunteer.numsujet}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedVolunteers.size > 0 && (
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-1">
                  {selectedVolunteers.size} {t('groupEmail.volunteersSelected')}
                </p>
                <p className="text-xs break-all">
                  <strong>{t('groupEmail.emails')}:</strong> {getSelectedEmails()}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Aperçu du lien mailto */}
        {selectedVolunteers.size > 0 && emailData.subject && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {t('groupEmail.readyToOpenOutlook', { count: selectedVolunteers.size })}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleOpenOutlook}
            disabled={selectedVolunteers.size === 0 || !emailData.subject.trim()}
          >
            <Mail className="h-4 w-4 mr-2" />
            {t('groupEmail.openInOutlook')} ({selectedVolunteers.size})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupEmailSender;