import React, { useState } from 'react';
import { Mail, Copy, Download, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import emailService from '../../services/emailService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface Volontaire {
  id: string | number;
  nom: string;
  prenom: string;
  email: string;
}

interface EmailData {
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
}

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVolontaires?: Volontaire[];
  onEmailSent?: (data: { count: number; subject: string; method: string }) => void;
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  isOpen,
  onClose,
  selectedVolontaires = [],
  onEmailSent
}) => {
  const { t } = useTranslation();
  const [emailData, setEmailData] = useState<EmailData>({
    subject: '',
    message: '',
    senderName: 'CosmeTest',
    senderEmail: 'noreply@cosmetest.com'
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewVolontaire, setPreviewVolontaire] = useState<any>(null);

  // Helper function to filter out archived volunteers
  const filterActiveVolontaires = (volontaires: any[]) => {
    return volontaires.filter((vol: any) => {
      const archiveValue = vol.archive || vol.details?.archive;
      return !(archiveValue === true ||
               archiveValue === 1 ||
               archiveValue === '1' ||
               archiveValue === 'true' ||
               archiveValue === 'TRUE');
    });
  };

  const handleOutlookSend = () => {
    setError('');

    // Validation
    const validation = emailService.validateEmailData(emailData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    // Filter out archived volunteers
    const activeVolontaires = filterActiveVolontaires(selectedVolontaires);

    if (activeVolontaires.length === 0) {
      setError(t('reports.email.noVolunteerSelected'));
      return;
    }

    if (activeVolontaires.length < selectedVolontaires.length) {
      console.warn(`${selectedVolontaires.length - activeVolontaires.length} volontaires archivés ont été exclus de l'envoi`);
    }

    try {
      // Si trop de destinataires, diviser en groupes
      if (activeVolontaires.length > 500) {
        const groups = emailService.splitIntoGroups(activeVolontaires, 500);

        if (confirm(t('reports.email.splitConfirm', { count: activeVolontaires.length, groups: groups.length }))) {
          groups.forEach((group, index) => {
            emailService.openOutlookWithRecipients(group, {
              ...emailData,
              subject: `${emailData.subject} (Groupe ${index + 1}/${groups.length})`
            });
          });

          onEmailSent && onEmailSent({
            count: activeVolontaires.length,
            subject: emailData.subject,
            method: 'outlook'
          });

          handleClose();
        }
      } else {
        emailService.openOutlookWithRecipients(activeVolontaires, emailData);

        onEmailSent && onEmailSent({
          count: activeVolontaires.length,
          subject: emailData.subject,
          method: 'outlook'
        });

        handleClose();
      }
    } catch (err: any) {
      console.error('Erreur ouverture Outlook:', err);
      setError(err.message || 'Erreur lors de l\'ouverture d\'Outlook');
    }
  };

  const handleCreateTxtFiles = () => {
    setError('');

    // Filter out archived volunteers
    const activeVolontaires = filterActiveVolontaires(selectedVolontaires);

    if (activeVolontaires.length === 0) {
      setError(t('reports.email.noVolunteerSelected'));
      return;
    }

    if (activeVolontaires.length < selectedVolontaires.length) {
      console.warn(`${selectedVolontaires.length - activeVolontaires.length} volontaires archivés ont été exclus de l'export`);
    }

    try {
      // Filtrer les emails valides et exclure "non défini", "undefined", etc.
      const emailsList = activeVolontaires
        .map(vol => vol.email)
        .filter(email => {
          if (!email) return false;
          const emailLower = String(email).toLowerCase().trim();
          // Exclure les valeurs comme "non défini", "undefined", "null", etc.
          return emailLower !== 'non défini' &&
                 emailLower !== 'non defini' &&
                 emailLower !== 'undefined' &&
                 emailLower !== 'null' &&
                 emailLower !== '';
        });

      if (emailsList.length === 0) {
        setError(t('reports.email.noEmailFound'));
        return;
      }

      // Diviser en groupes de 500
      const groups = [];
      for (let i = 0; i < emailsList.length; i += 500) {
        groups.push(emailsList.slice(i, i + 500));
      }

      // Créer les fichiers TXT
      groups.forEach((group, index) => {
        const content = group.join('\n');
        const fileName = `recrutement_${index + 1}.txt`;

        // Créer un blob avec le contenu
        const blob = new Blob([content], { type: 'text/plain' });

        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL
        window.URL.revokeObjectURL(url);
      });

      alert(t('reports.email.txtFilesCreated', { count: groups.length, total: emailsList.length }));

      onEmailSent && onEmailSent({
        count: emailsList.length,
        subject: 'Fichiers TXT créés',
        method: 'txt_files'
      });

      handleClose();
    } catch (err: any) {
      console.error('Erreur création fichiers TXT:', err);
      setError(err.message || 'Erreur lors de la création des fichiers TXT');
    }
  };

  const handleApiSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const validation = emailService.validateEmailData(emailData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    // Filter out archived volunteers
    const activeVolontaires = filterActiveVolontaires(selectedVolontaires);

    if (activeVolontaires.length === 0) {
      setError(t('reports.email.noVolunteerSelected'));
      return;
    }

    if (activeVolontaires.length < selectedVolontaires.length) {
      console.warn(`${selectedVolontaires.length - activeVolontaires.length} volontaires archivés ont été exclus de l'envoi`);
    }

    setSending(true);

    try {
      const volontaireIds = activeVolontaires.map(v => typeof v.id === 'string' ? parseInt(v.id, 10) : v.id);
      await emailService.sendBulkEmail(volontaireIds, emailData);

      onEmailSent && onEmailSent({
        count: activeVolontaires.length,
        subject: emailData.subject,
        method: 'api'
      });

      handleClose();
    } catch (err) {
      console.error('Erreur envoi email:', err);
      setError(t('reports.email.sendingError'));
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmailData({
      subject: '',
      message: '',
      senderName: 'CosmeTest',
      senderEmail: 'noreply@cosmetest.com'
    });
    setError('');
    setShowPreview(false);
    setPreviewVolontaire(null);
    onClose();
  };

  const handlePreview = () => {
    const sample = selectedVolontaires[0] || {} as Volontaire;
    const preview = emailService.generatePreview(emailData, {
      nom: sample.nom || 'Dupont',
      prenom: sample.prenom || 'Jean',
      email: sample.email || 'jean.dupont@example.com'
    });
    setPreviewVolontaire(preview);
    setShowPreview(true);
  };

  const insertTemplate = (template: 'etude' | 'rappel' | 'suivi') => {
    const templates = {
      etude: t('reports.email.studyEmailTemplate'),
      rappel: t('reports.email.reminderEmailTemplate'),
      suivi: t('reports.email.followUpEmailTemplate')
    };

    setEmailData(prev => ({
      ...prev,
      message: templates[template]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('reports.email.bulkEmailTitle', { count: selectedVolontaires.length })}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showPreview ? (
          <form onSubmit={handleApiSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">{t('reports.email.senderName')}</Label>
                <Input
                  id="senderName"
                  value={emailData.senderName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="CosmeTest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">{t('reports.email.senderEmail')}</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={emailData.senderEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder="noreply@cosmetest.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t('reports.email.subjectRequired')}</Label>
              <Input
                id="subject"
                required
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Nouvelle étude cosmétique disponible"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="message">{t('reports.email.messageRequired')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('etude')}
                  >
                    {t('reports.email.studyTemplate')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('rappel')}
                  >
                    {t('reports.email.reminderTemplate')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('suivi')}
                  >
                    {t('reports.email.followUpTemplate')}
                  </Button>
                </div>
              </div>
              <Textarea
                id="message"
                required
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={10}
                placeholder={t('reports.email.messageTemplate')}
              />
              <p className="text-xs text-muted-foreground">
                {t('reports.email.variablesInfo')}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-sm mb-2">{t('reports.email.recipientsTitle')} ({selectedVolontaires.length})</h4>
                <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground space-y-1">
                  {selectedVolontaires.slice(0, 10).map((vol) => (
                    <div key={vol.id} className="flex justify-between py-1">
                      <span>{vol.prenom} {vol.nom}</span>
                      <span>{vol.email}</span>
                    </div>
                  ))}
                  {selectedVolontaires.length > 10 && (
                    <div className="text-xs mt-2">
                      {t('reports.email.andOthers', { count: selectedVolontaires.length - 10 })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePreview}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('reports.email.preview')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      // Filter out archived volunteers before copying
                      const activeVolontaires = filterActiveVolontaires(selectedVolontaires);
                      await emailService.copyEmailsToClipboard(activeVolontaires);
                      alert(t('reports.email.emailsCopied'));
                    } catch (err) {
                      alert(t('reports.email.emailsCopyError'));
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('reports.email.copyEmails')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCreateTxtFiles}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('reports.email.txtFiles')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleOutlookSend}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('reports.email.downloadDraft')} ({selectedVolontaires.length})
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">{t('reports.email.emailPreviewTitle')}</h4>
            <Card>
              <CardContent className="pt-6">
                <div className="border-b pb-3 mb-3 space-y-1">
                  <div className="text-sm text-muted-foreground">{t('reports.email.from')} {previewVolontaire?.sender}</div>
                  <div className="text-sm text-muted-foreground">{t('reports.email.to')} {previewVolontaire?.recipient}</div>
                  <div className="font-medium mt-2">{t('reports.email.subject')}: {previewVolontaire?.subject}</div>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {previewVolontaire?.message}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(false)}
                >
                  {t('reports.email.modify')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      // Filter out archived volunteers before copying
                      const activeVolontaires = filterActiveVolontaires(selectedVolontaires);
                      await emailService.copyEmailsToClipboard(activeVolontaires);
                      alert(t('reports.email.emailsCopied'));
                    } catch (err) {
                      alert(t('reports.email.emailsCopyError'));
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('reports.email.copyEmails')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateTxtFiles}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('reports.email.txtFiles')}
                </Button>
              </div>
              <Button onClick={handleOutlookSend}>
                <Mail className="w-4 h-4 mr-2" />
                {t('reports.email.downloadDraft')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmailModal;
