import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '../../ui/alert';
import { Button } from '../../ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onReturnToAppointments: () => void;
}

const ErrorMessage = ({ error, onReturnToAppointments }: ErrorMessageProps) => {
  const { t } = useTranslation();
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p>{error}</p>
        <Button
          type="button"
          onClick={onReturnToAppointments}
          variant="destructive"
          className="mt-4"
        >
          {t('appointments.backToAppointments')}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;