import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface AgeWarningDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AgeWarningDialog = ({ open, message, onConfirm, onCancel }: AgeWarningDialogProps) => (
  <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Incompatibilité d'âge détectée
        </DialogTitle>
        <DialogDescription asChild>
          <div className="space-y-2 pt-1">
            <p className="text-gray-800">{message}</p>
            <p className="text-sm text-gray-500">
              L'assignation reste possible si vous le jugez nécessaire.
            </p>
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={onConfirm}
        >
          Continuer quand même
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AgeWarningDialog;
