import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';

interface DateSummary {
  date: string;
  totalForDate: number;
  slots: { time: string; volume: number }[];
}

interface AppointmentData {
  totalAppointments: number;
  datesSummary: DateSummary[];
  studyInfo?: { ref?: string; titre?: string };
  groupInfo?: { intitule?: string; nbSujet?: number };
  comments?: string;
}

interface AppointmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointmentData?: AppointmentData | null;
  isSubmitting?: boolean;
}

const AppointmentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentData,
  isSubmitting = false
}: AppointmentConfirmationModalProps) => {
  if (!isOpen || !appointmentData) return null;

  const {
    totalAppointments,
    datesSummary,
    studyInfo,
    groupInfo,
    comments
  } = appointmentData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmation de création</DialogTitle>
        </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Résumé de la création</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Étude :</strong> {studyInfo?.ref} - {studyInfo?.titre}</p>
                <p><strong>Groupe :</strong> {groupInfo?.intitule} ({groupInfo?.nbSujet || 0} sujets)</p>
                <p className="text-lg font-bold text-blue-900 mt-3">
                  🗓️ <strong>{totalAppointments} rendez-vous</strong> seront créés
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Détail par date :</h4>
              {datesSummary.map((dateSummary, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-medium text-gray-800 mb-2">
                    📅 {dateSummary.date} - {dateSummary.totalForDate} rendez-vous
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {dateSummary.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="bg-white px-2 py-1 rounded border">
                        {slot.time}: <strong>{slot.volume}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {comments && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-medium text-yellow-800 mb-1">Commentaires :</h4>
                <p className="text-sm text-yellow-700">{comments}</p>
              </div>
            )}
          </div>

        <DialogFooter className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outline"
          >
            ↩️ Retour aux paramètres
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création en cours...' : '✅ Confirmer et créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentConfirmationModal;