// ============================================================
// emailService.test.ts - Tests pour le service email
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import emailService from '../emailService';

describe('EmailService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const apiModule = await import('../api');
    const api = apiModule.default;
    mockAxios = new MockAdapter(api);

    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    document.createElement = vi.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
          remove: vi.fn()
        } as any;
      }
      if (tag === 'textarea') {
        return {
          value: '',
          select: vi.fn(),
          remove: vi.fn()
        } as any;
      }
      return {} as any;
    });
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('generateOutlookMailto', () => {
    it('devrait générer un lien mailto avec les destinataires', () => {
      const volontaires = [
        { email: 'test1@example.com', nom: 'Test1' },
        { email: 'test2@example.com', nom: 'Test2' }
      ];

      const emailData = {
        subject: 'Test Subject',
        message: 'Test Message'
      };

      const result = emailService.generateOutlookMailto(volontaires, emailData);

      expect(result).toContain('mailto:test1@example.com;test2@example.com');
      expect(result).toContain('subject=Test%20Subject');
      expect(result).toContain('body=Test%20Message');
    });

    it('devrait filtrer les emails vides', () => {
      const volontaires = [
        { email: 'test@example.com', nom: 'Test' },
        { email: '', nom: 'NoEmail' },
        { email: '  ', nom: 'WhitespaceEmail' }
      ];

      const emailData = { subject: 'Test', message: 'Test' };
      const result = emailService.generateOutlookMailto(volontaires, emailData);

      expect(result).toContain('mailto:test@example.com');
      expect(result).not.toContain('NoEmail');
    });

    it('devrait encoder correctement les caractères spéciaux', () => {
      const volontaires = [{ email: 'test@example.com' }];
      const emailData = {
        subject: 'Test & Spécial',
        message: 'Message avec & et /'
      };

      const result = emailService.generateOutlookMailto(volontaires, emailData);

      expect(result).toContain('Test%20%26%20Sp');
      expect(result).toContain('Message%20avec');
    });
  });

  describe('generateEmlFile', () => {
    it('devrait générer un fichier EML correct', () => {
      const volontaires = [
        { email: 'test@example.com', nom: 'Doe', prenom: 'John' }
      ];

      const emailData = {
        subject: 'Test Subject',
        message: 'Bonjour {{prenom}} {{nom}}',
        senderEmail: 'sender@example.com',
        senderName: 'Sender'
      };

      const result = emailService.generateEmlFile(volontaires, emailData);

      expect(result).toContain('Subject: Test Subject');
      expect(result).toContain('To: test@example.com');
      expect(result).toContain('From: Sender <sender@example.com>');
      expect(result).toContain('Bonjour John Doe');
      expect(result).toContain('ATTENTION: Personnalisez le message');
    });

    it('devrait utiliser des valeurs par défaut pour l\'expéditeur', () => {
      const volontaires = [{ email: 'test@example.com' }];
      const emailData = { subject: 'Test', message: 'Test' };

      const result = emailService.generateEmlFile(volontaires, emailData);

      expect(result).toContain('From: CosmeTest <noreply@cosmetest.com>');
    });

    it('devrait gérer les placeholders manquants', () => {
      const volontaires = [{ email: 'test@example.com' }];
      const emailData = {
        subject: 'Test',
        message: 'Bonjour {{prenom}} {{nom}}, email: {{email}}'
      };

      const result = emailService.generateEmlFile(volontaires, emailData);

      expect(result).toContain('Bonjour [Prénom] [Nom], email: test@example.com');
    });
  });

  describe('openOutlookWithRecipients', () => {
    it('devrait créer et télécharger un fichier EML', () => {
      const volontaires = [{ email: 'test@example.com', nom: 'Test' }];
      const emailData = { subject: 'Test', message: 'Test Message' };

      const result = emailService.openOutlookWithRecipients(volontaires, emailData);

      expect(result).toBe(true);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de création de fichier', () => {
      global.URL.createObjectURL = vi.fn(() => { throw new Error('Blob error'); });

      const volontaires = [{ email: 'test@example.com' }];
      const emailData = { subject: 'Test', message: 'Test' };

      expect(() => emailService.openOutlookWithRecipients(volontaires, emailData))
        .toThrow('Blob error');
    });
  });

  describe('copyEmailsToClipboard', () => {
    it('devrait copier les emails dans le presse-papiers', async () => {
      const volontaires = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];

      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: {
          writeText: vi.fn().mockResolvedValue(undefined)
        }
      });

      const result = await emailService.copyEmailsToClipboard(volontaires);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test1@example.com; test2@example.com');
    });

    it('devrait utiliser le fallback si clipboard API n\'est pas disponible', async () => {
      const volontaires = [{ email: 'test@example.com' }];

      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Not supported'))
        }
      });

      document.execCommand = vi.fn();

      const result = await emailService.copyEmailsToClipboard(volontaires);

      expect(result).toBe(true);
    });
  });

  describe('splitIntoGroups', () => {
    it('devrait diviser une liste en groupes de taille maximale', () => {
      const volontaires = Array.from({ length: 250 }, (_, i) => ({
        email: `test${i}@example.com`
      }));

      const groups = emailService.splitIntoGroups(volontaires, 100);

      expect(groups).toHaveLength(3);
      expect(groups[0]).toHaveLength(100);
      expect(groups[1]).toHaveLength(100);
      expect(groups[2]).toHaveLength(50);
    });

    it('devrait retourner un seul groupe si la liste est petite', () => {
      const volontaires = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];

      const groups = emailService.splitIntoGroups(volontaires, 100);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
    });

    it('devrait gérer une liste vide', () => {
      const groups = emailService.splitIntoGroups([], 100);

      expect(groups).toHaveLength(0);
    });
  });

  describe('sendBulkEmail', () => {
    it('devrait envoyer un email groupé', async () => {
      const volontaireIds = [1, 2, 3];
      const emailData = {
        subject: 'Test',
        message: 'Test Message'
      };

      mockAxios.onPost('/emails/bulk').reply(200, { success: true });

      const response = await emailService.sendBulkEmail(volontaireIds, emailData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });

    it('devrait utiliser les valeurs par défaut pour l\'expéditeur', async () => {
      mockAxios.onPost('/emails/bulk').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.senderEmail).toBe('noreply@cosmetest.com');
        expect(data.senderName).toBe('CosmeTest');
        return [200, { success: true }];
      });

      await emailService.sendBulkEmail([1], {
        subject: 'Test',
        message: 'Test'
      });
    });

    it('devrait gérer les erreurs d\'envoi', async () => {
      mockAxios.onPost('/emails/bulk').reply(500);

      await expect(emailService.sendBulkEmail([1], {
        subject: 'Test',
        message: 'Test'
      })).rejects.toThrow();
    });
  });

  describe('sendSingleEmail', () => {
    it('devrait envoyer un email à un volontaire', async () => {
      const emailData = {
        subject: 'Test',
        message: 'Test Message'
      };

      mockAxios.onPost('/emails/single').reply(200, { success: true });

      const response = await emailService.sendSingleEmail(1, emailData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });

    it('devrait gérer les erreurs d\'envoi', async () => {
      mockAxios.onPost('/emails/single').reply(500);

      await expect(emailService.sendSingleEmail(1, {
        subject: 'Test',
        message: 'Test'
      })).rejects.toThrow();
    });
  });

  describe('getEmailHistory', () => {
    it('devrait récupérer l\'historique des emails', async () => {
      const mockHistory = [
        { id: 1, subject: 'Email 1', sentAt: '2024-01-15' },
        { id: 2, subject: 'Email 2', sentAt: '2024-01-16' }
      ];

      mockAxios.onGet('/emails/history').reply(200, mockHistory);

      const response = await emailService.getEmailHistory();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockHistory);
    });

    it('devrait passer les paramètres de requête', async () => {
      mockAxios.onGet('/emails/history').reply(200, []);

      await emailService.getEmailHistory({ page: 1, limit: 10 });

      expect(mockAxios.history.get[0].params).toEqual({ page: 1, limit: 10 });
    });
  });

  describe('validateEmailData', () => {
    it('devrait valider des données d\'email correctes', () => {
      const emailData = {
        subject: 'Test Subject',
        message: 'Test Message',
        senderEmail: 'test@example.com'
      };

      const result = emailService.validateEmailData(emailData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait détecter un sujet manquant', () => {
      const emailData = {
        subject: '',
        message: 'Test Message'
      };

      const result = emailService.validateEmailData(emailData);

      expect(result.isValid).toBe(false);
      expect(result.errors.subject).toBe('Le sujet est obligatoire');
    });

    it('devrait détecter un message manquant', () => {
      const emailData = {
        subject: 'Test',
        message: ''
      };

      const result = emailService.validateEmailData(emailData);

      expect(result.isValid).toBe(false);
      expect(result.errors.message).toBe('Le message est obligatoire');
    });

    it('devrait détecter un email expéditeur invalide', () => {
      const emailData = {
        subject: 'Test',
        message: 'Test',
        senderEmail: 'invalid-email'
      };

      const result = emailService.validateEmailData(emailData);

      expect(result.isValid).toBe(false);
      expect(result.errors.senderEmail).toBe('Format d\'email expéditeur invalide');
    });

    it('devrait accepter un email expéditeur vide', () => {
      const emailData = {
        subject: 'Test',
        message: 'Test'
      };

      const result = emailService.validateEmailData(emailData);

      expect(result.isValid).toBe(true);
    });
  });

  describe('generatePreview', () => {
    it('devrait générer un aperçu avec personnalisation', () => {
      const emailData = {
        subject: 'Bonjour {{prenom}}',
        message: 'Cher {{prenom}} {{nom}}, votre email est {{email}}',
        senderEmail: 'test@example.com',
        senderName: 'Test Sender'
      };

      const volontaire = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com'
      };

      const result = emailService.generatePreview(emailData, volontaire);

      expect(result.subject).toBe('Bonjour John');
      expect(result.message).toBe('Cher John Doe, votre email est john@example.com');
      expect(result.recipient).toBe('john@example.com');
      expect(result.sender).toBe('Test Sender <test@example.com>');
    });

    it('devrait utiliser des placeholders si le volontaire est vide', () => {
      const emailData = {
        subject: 'Bonjour {{prenom}}',
        message: 'Cher {{prenom}} {{nom}}',
        senderEmail: 'test@example.com'
      };

      const result = emailService.generatePreview(emailData);

      expect(result.subject).toBe('Bonjour [Prénom]');
      expect(result.message).toBe('Cher [Prénom] [Nom]');
      expect(result.recipient).toBe('[Email destinataire]');
    });

    it('devrait utiliser des valeurs par défaut pour l\'expéditeur', () => {
      const emailData = {
        subject: 'Test',
        message: 'Test'
      };

      const result = emailService.generatePreview(emailData);

      expect(result.sender).toBe('CosmeTest <noreply@cosmetest.com>');
    });
  });
});
