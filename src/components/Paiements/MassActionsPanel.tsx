import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Paiement {
  idVolontaire: string | number;
  idEtude: string | number;
  paye: number;
}

interface Statistics {
  annulesCount?: number;
}

interface MassActionsPanelProps {
  selectedEtudeRef: string;
  paiements: Paiement[];
  isVolontaireAnnule?: (idVolontaire: string | number, idEtude: string | number) => boolean;
  isMassUpdating: boolean;
  statistics?: Statistics;
  onMarkAll: () => void;
}

const MassActionsPanel: React.FC<MassActionsPanelProps> = ({
  selectedEtudeRef,
  paiements,
  isVolontaireAnnule,
  isMassUpdating,
  statistics,
  onMarkAll,
}) => {
  const { t } = useTranslation();
  const { unpaidCount, allPaidCount, annulesCount } = useMemo(() => {
    const actifs = (paiements || []).filter(p => !isVolontaireAnnule?.(p.idVolontaire, p.idEtude));
    return {
      unpaidCount: actifs.filter(p => p.paye !== 1).length,
      allPaidCount: actifs.filter(p => p.paye === 1).length,
      annulesCount: statistics?.annulesCount || 0,
    };
  }, [paiements, isVolontaireAnnule, statistics]);

  if (!paiements || paiements.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('payments.massActions')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('payments.study')}: <span className="font-medium">{selectedEtudeRef || '-'}</span>
              <span className="ml-2">• {t('payments.unpaidCount', { count: unpaidCount })}</span>
              <span className="ml-2">• {t('payments.paidCount', { count: allPaidCount })}</span>
              {annulesCount > 0 && (
                <span className="ml-2 text-red-600">• {t('payments.cancelledCount', { count: annulesCount })}</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {unpaidCount === 0 && (
              <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200">
                {t('payments.allActivePaymentsPaid')}
              </Badge>
            )}

            <Button
              onClick={onMarkAll}
              disabled={isMassUpdating || unpaidCount === 0}
            >
              {isMassUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.updating')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('payments.markAllAsPaid')}
                  {unpaidCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-500 text-white text-xs">
                      {unpaidCount}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>

        {annulesCount > 0 && (
          <>
            <Separator className="my-3" />
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                <strong>{t('common.importantInfo')}:</strong> {t('payments.cancelledVolunteersExcluded', { count: annulesCount })}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MassActionsPanel;
