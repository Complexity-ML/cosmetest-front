import React, { useState } from 'react';
import { Mail, Copy, Download, Eye } from 'lucide-react';
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

  const handleOutlookSend = () => {
    setError('');

    // Validation
    const validation = emailService.validateEmailData(emailData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    if (selectedVolontaires.length === 0) {
      setError('Aucun volontaire sélectionné');
      return;
    }

    try {
      // Si trop de destinataires, diviser en groupes
      if (selectedVolontaires.length > 100) {
        const groups = emailService.splitIntoGroups(selectedVolontaires, 100);

        if (confirm(`${selectedVolontaires.length} destinataires seront divisés en ${groups.length} fichiers .eml. Continuer ?`)) {
          groups.forEach((group, index) => {
            emailService.openOutlookWithRecipients(group, {
              ...emailData,
              subject: `${emailData.subject} (Groupe ${index + 1}/${groups.length})`
            });
          });

          onEmailSent && onEmailSent({
            count: selectedVolontaires.length,
            subject: emailData.subject,
            method: 'outlook'
          });

          handleClose();
        }
      } else {
        emailService.openOutlookWithRecipients(selectedVolontaires, emailData);

        onEmailSent && onEmailSent({
          count: selectedVolontaires.length,
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

    if (selectedVolontaires.length === 0) {
      setError('Aucun volontaire sélectionné');
      return;
    }

    try {
      const emailsList = selectedVolontaires.map(vol => vol.email).filter(email => email);

      if (emailsList.length === 0) {
        setError('Aucune adresse email trouvée');
        return;
      }

      // Diviser en groupes de 100
      const groups = [];
      for (let i = 0; i < emailsList.length; i += 100) {
        groups.push(emailsList.slice(i, i + 100));
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

      alert(`${groups.length} fichiers TXT créés avec ${emailsList.length} adresses email au total.`);

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

    if (selectedVolontaires.length === 0) {
      setError('Aucun volontaire sélectionné');
      return;
    }

    setSending(true);

    try {
      const volontaireIds = selectedVolontaires.map(v => typeof v.id === 'string' ? parseInt(v.id, 10) : v.id);
      await emailService.sendBulkEmail(volontaireIds, emailData);

      onEmailSent && onEmailSent({
        count: selectedVolontaires.length,
        subject: emailData.subject,
        method: 'api'
      });

      handleClose();
    } catch (err) {
      console.error('Erreur envoi email:', err);
      setError('Erreur lors de l\'envoi des emails. Veuillez réessayer.');
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
      etude: `Bonjour {{prenom}} {{nom}},

Nous avons une nouvelle étude cosmétique qui pourrait vous intéresser.

Votre profil correspond parfaitement aux critères recherchés pour cette étude.

Pour plus d'informations, n'hésitez pas à nous contacter.

Cordialement,
L'équipe CosmeTest`,
      rappel: `Bonjour {{prenom}} {{nom}},

Nous souhaitons vous rappeler votre participation à notre étude cosmétique.

Merci de confirmer votre disponibilité dans les plus brefs délais.

Cordialement,
L'équipe CosmeTest`,
      suivi: `Bonjour {{prenom}} {{nom}},

Nous espérons que vous allez bien.

Suite à votre participation à notre dernière étude, nous aimerions avoir vos retours.

Cordialement,
L'équipe CosmeTest`
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
            Envoi groupé d'emails ({selectedVolontaires.length} destinataires)
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
                <Label htmlFor="senderName">Nom de l'expéditeur</Label>
                <Input
                  id="senderName"
                  value={emailData.senderName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="CosmeTest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Email de l'expéditeur</Label>
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
              <Label htmlFor="subject">Sujet *</Label>
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
                <Label htmlFor="message">Message *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('etude')}
                  >
                    Modèle Étude
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('rappel')}
                  >
                    Modèle Rappel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertTemplate('suivi')}
                  >
                    Modèle Suivi
                  </Button>
                </div>
              </div>
              <Textarea
                id="message"
                required
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={10}
                placeholder="Votre message ici... Utilisez {{nom}} et {{prenom}} pour personnaliser"
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {'{nom}'}, {'{prenom}'}, {'{email}'}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-sm mb-2">Destinataires ({selectedVolontaires.length})</h4>
                <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground space-y-1">
                  {selectedVolontaires.slice(0, 10).map((vol) => (
                    <div key={vol.id} className="flex justify-between py-1">
                      <span>{vol.prenom} {vol.nom}</span>
                      <span>{vol.email}</span>
                    </div>
                  ))}
                  {selectedVolontaires.length > 10 && (
                    <div className="text-xs mt-2">
                      ... et {selectedVolontaires.length - 10} autres destinataires
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
                  Aperçu
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await emailService.copyEmailsToClipboard(selectedVolontaires);
                      alert('Emails copiés dans le presse-papiers !');
                    } catch (err) {
                      alert('Erreur lors de la copie des emails');
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier emails
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCreateTxtFiles}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fichiers TXT (100/batch)
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleOutlookSend}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Télécharger brouillon ({selectedVolontaires.length})
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">Aperçu de l'email</h4>
            <Card>
              <CardContent className="pt-6">
                <div className="border-b pb-3 mb-3 space-y-1">
                  <div className="text-sm text-muted-foreground">De: {previewVolontaire?.sender}</div>
                  <div className="text-sm text-muted-foreground">À: {previewVolontaire?.recipient}</div>
                  <div className="font-medium mt-2">Sujet: {previewVolontaire?.subject}</div>
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
                  Modifier
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await emailService.copyEmailsToClipboard(selectedVolontaires);
                      alert('Emails copiés dans le presse-papiers !');
                    } catch (err) {
                      alert('Erreur lors de la copie des emails');
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier emails
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateTxtFiles}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fichiers TXT (100/batch)
                </Button>
              </div>
              <Button onClick={handleOutlookSend}>
                <Mail className="w-4 h-4 mr-2" />
                Télécharger brouillon
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmailModal;
