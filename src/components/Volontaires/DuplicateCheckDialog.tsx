import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, UserCheck, UserPlus, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import volontaireService from '../../services/volontaireService';

interface DuplicateCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DuplicateResult {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  archive?: boolean;
}

const DuplicateCheckDialog = ({ open, onOpenChange }: DuplicateCheckDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateResult[]>([]);

  const canCheck = keyword.trim().length > 0;

  const handleCheck = async () => {
    if (!canCheck) return;

    setIsChecking(true);
    setHasChecked(false);
    setDuplicates([]);

    try {
      const results = await volontaireService.checkDuplicate({
        keyword: keyword.trim(),
      });

      setDuplicates(results.map((v: any) => ({
        id: v.id,
        nom: v.nom || '',
        prenom: v.prenom || '',
        email: v.email || '',
        archive: v.archive,
      })));
      setHasChecked(true);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canCheck) {
      e.preventDefault();
      handleCheck();
    }
  };

  const handleGoToEdit = (id: number) => {
    onOpenChange(false);
    resetForm();
    navigate(`/volontaires/${id}/edit`);
  };

  const handleCreateNew = () => {
    onOpenChange(false);
    resetForm();
    navigate('/volontaires/nouveau');
  };

  const resetForm = () => {
    setKeyword('');
    setIsChecking(false);
    setHasChecked(false);
    setDuplicates([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {t('volunteers.duplicateCheck.title', 'Vérification de doublon')}
          </DialogTitle>
          <DialogDescription>
            {t('volunteers.duplicateCheck.description', 'Vérifiez si le volontaire existe déjà avant de créer un nouveau compte.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="check-keyword">{t('volunteers.duplicateCheck.searchLabel', 'Nom, prénom ou email')}</Label>
            <Input
              id="check-keyword"
              placeholder={t('volunteers.duplicateCheck.searchPlaceholder', 'Ex: Dupont, Marie, dupont@email.com...')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            onClick={handleCheck}
            disabled={!canCheck || isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('volunteers.duplicateCheck.checking', 'Vérification en cours...')}
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                {t('volunteers.duplicateCheck.check', 'Vérifier')}
              </>
            )}
          </Button>

          {/* Résultats */}
          {hasChecked && duplicates.length > 0 && (
            <Alert variant="destructive" className="bg-orange-50 border-orange-300 text-orange-800">
              <AlertDescription>
                <p className="font-semibold mb-2">
                  {duplicates.length} {t('volunteers.duplicateCheck.found', 'volontaire(s) trouvé(s) :')}
                </p>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {duplicates.map((dup) => (
                    <div
                      key={dup.id}
                      className="flex items-center justify-between bg-white rounded-md p-2.5 border border-orange-200"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {dup.prenom} {dup.nom}
                          {dup.archive && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                              {t('volunteers.archived', 'Archivé')}
                            </span>
                          )}
                        </p>
                        {dup.email && (
                          <p className="text-sm text-gray-500 truncate">{dup.email}</p>
                        )}
                        <p className="text-xs text-gray-400">ID: {dup.id}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGoToEdit(dup.id)}
                        className="ml-2 shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        {t('volunteers.duplicateCheck.editProfile', 'Modifier')}
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {hasChecked && duplicates.length === 0 && (
            <Alert className="bg-green-50 border-green-300">
              <AlertDescription className="text-green-800">
                {t('volunteers.duplicateCheck.noDuplicate', 'Aucun doublon trouvé. Vous pouvez créer le volontaire.')}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button
              onClick={handleCreateNew}
              disabled={!hasChecked}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('volunteers.duplicateCheck.createNew', 'Créer le volontaire')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateCheckDialog;
