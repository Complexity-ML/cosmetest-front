import api from './api';
import { AxiosResponse } from 'axios';

interface Volontaire {
  email?: string;
  nom?: string;
  prenom?: string;
  [key: string]: any;
}

interface EmailData {
  subject: string;
  message: string;
  htmlMessage?: string;
  senderEmail?: string;
  senderName?: string;
}

interface EmailValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

interface EmailPreview {
  subject: string;
  message: string;
  recipient: string;
  sender: string;
}

const emailService = {
  /**
   * Génère un fichier mailto pour Outlook avec tous les destinataires
   */
  generateOutlookMailto: (volontaires: Volontaire[], emailData: EmailData): string => {
    const emails = volontaires
      .filter(v => v.email && v.email.trim())
      .map(v => v.email!.trim())
      .join(';');

    const subject = encodeURIComponent(emailData.subject || '');
    const body = encodeURIComponent(emailData.message || '');

    return `mailto:${emails}?subject=${subject}&body=${body}`;
  },

  /**
   * Génère et télécharge un fichier .eml (brouillon Outlook) avec les destinataires
   */
  openOutlookWithRecipients: (volontaires: Volontaire[], emailData: EmailData): boolean => {
    try {
      // Générer le contenu du fichier .eml
      const emlContent = emailService.generateEmlFile(volontaires, emailData);

      // Créer et télécharger le fichier
      const blob = new Blob([emlContent], { type: 'message/rfc822' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Brouillons/brouillon_recrutement/brouillon_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.eml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du brouillon:', error);
      throw error;
    }
  },

  /**
   * Génère le contenu d'un fichier .eml
   */
  generateEmlFile: (volontaires: Volontaire[], emailData: EmailData): string => {
    const emails = volontaires
      .filter(v => v.email && v.email.trim())
      .map(v => v.email!.trim())
      .join('; ');

    // Personnaliser le message pour le premier volontaire comme exemple
    const sampleVolontaire = volontaires[0] || {};
    const personalizedMessage = emailData.message
      .replace(/\{\{nom\}\}/g, sampleVolontaire.nom || '[Nom]')
      .replace(/\{\{prenom\}\}/g, sampleVolontaire.prenom || '[Prénom]')
      .replace(/\{\{email\}\}/g, sampleVolontaire.email || '[Email]');

    const finalMessage = personalizedMessage + '\n\n--- ATTENTION: Personnalisez le message pour chaque destinataire ---';

    return `Subject: ${emailData.subject}
To: ${emails}
From: ${emailData.senderName || 'CosmeTest'} <${emailData.senderEmail || 'noreply@cosmetest.com'}>
Content-Type: text/plain; charset=utf-8

${finalMessage}`;
  },

  /**
   * Copie la liste des emails dans le presse-papiers
   */
  copyEmailsToClipboard: async (volontaires: Volontaire[]): Promise<boolean> => {
    try {
      const emails = volontaires
        .filter(v => v.email && v.email.trim())
        .map(v => v.email!.trim())
        .join('; ');

      await navigator.clipboard.writeText(emails);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie des emails:', error);

      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = volontaires
        .filter(v => v.email && v.email.trim())
        .map(v => v.email!.trim())
        .join('; ');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  },

  /**
   * Divise une liste de volontaires en groupes pour éviter les limitations URL
   */
  splitIntoGroups: (volontaires: Volontaire[], maxGroupSize: number = 100): Volontaire[][] => {
    const groups: Volontaire[][] = [];
    for (let i = 0; i < volontaires.length; i += maxGroupSize) {
      groups.push(volontaires.slice(i, i + maxGroupSize));
    }
    return groups;
  },

  /**
   * Envoie un email à une liste de volontaires (via API backend)
   */
  sendBulkEmail: async (volontaireIds: number[], emailData: EmailData): Promise<AxiosResponse> => {
    try {
      const response = await api.post('/emails/bulk', {
        volontaireIds,
        subject: emailData.subject,
        message: emailData.message,
        htmlMessage: emailData.htmlMessage,
        senderEmail: emailData.senderEmail || 'noreply@cosmetest.com',
        senderName: emailData.senderName || 'CosmeTest'
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email groupé:', error);
      throw error;
    }
  },

  /**
   * Envoie un email à un volontaire spécifique
   */
  sendSingleEmail: async (volontaireId: number, emailData: EmailData): Promise<AxiosResponse> => {
    try {
      const response = await api.post('/emails/single', {
        volontaireId,
        subject: emailData.subject,
        message: emailData.message,
        htmlMessage: emailData.htmlMessage,
        senderEmail: emailData.senderEmail || 'noreply@cosmetest.com',
        senderName: emailData.senderName || 'CosmeTest'
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des emails envoyés
   */
  getEmailHistory: async (params: Record<string, any> = {}): Promise<AxiosResponse> => {
    try {
      const response = await api.get('/emails/history', { params });
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des emails:', error);
      throw error;
    }
  },

  /**
   * Valide les données d'email avant envoi
   */
  validateEmailData: (emailData: EmailData): EmailValidation => {
    const errors: Record<string, string> = {};

    if (!emailData.subject || !emailData.subject.trim()) {
      errors.subject = 'Le sujet est obligatoire';
    }

    if (!emailData.message || !emailData.message.trim()) {
      errors.message = 'Le message est obligatoire';
    }

    if (emailData.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.senderEmail)) {
      errors.senderEmail = 'Format d\'email expéditeur invalide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Génère un aperçu de l'email avant envoi
   */
  generatePreview: (emailData: EmailData, volontaire: Volontaire = {}): EmailPreview => {
    const personalizedSubject = emailData.subject
      .replace('{{nom}}', volontaire.nom || '[Nom]')
      .replace('{{prenom}}', volontaire.prenom || '[Prénom]');

    const personalizedMessage = emailData.message
      .replace('{{nom}}', volontaire.nom || '[Nom]')
      .replace('{{prenom}}', volontaire.prenom || '[Prénom]')
      .replace('{{email}}', volontaire.email || '[Email]');

    return {
      subject: personalizedSubject,
      message: personalizedMessage,
      recipient: volontaire.email || '[Email destinataire]',
      sender: `${emailData.senderName || 'CosmeTest'} <${emailData.senderEmail || 'noreply@cosmetest.com'}>`
    };
  }
};

export default emailService;
