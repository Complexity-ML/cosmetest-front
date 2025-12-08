import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

const currency = (n: number | undefined) => `${Number(n || 0).toFixed(0)} EUR`;

interface Payment {
  idEtude: string | number;
  idVolontaire: string | number;
  idGroupe?: string | number;
  numsujet?: string;
  iv: number;
  paye: number;
}

interface StatusConfig {
  label: string;
  icon: string;
  style: string;
  bgColor: string;
}

interface PaymentsTableProps {
  rows?: Payment[];
  paiementStatusMap?: Record<number, StatusConfig>;
  getEtudeName?: (id: string | number) => string;
  getVolontaireName?: (id: string | number) => string;
  getGroupeName?: (groupeId: string | number, etudeId: string | number) => string;
  isVolontaireAnnule?: (volontaireId: string | number, etudeId: string | number) => boolean;
  updatePaiementStatus?: (payment: Payment, status: number) => void;
  updateStatus?: Record<string, string>;
}

const PaymentsTable = ({
  rows = [],
  paiementStatusMap = {},
  getEtudeName,
  getVolontaireName,
  getGroupeName,
  isVolontaireAnnule,
  updatePaiementStatus,
  updateStatus = {},
}: PaymentsTableProps) => {
  const { t } = useTranslation();
  const getStatusBadgeVariant = (payeStatus: number) => {
    // Map status to badge variants: 1 = Payé (vert), 0 = Non payé (rouge)
    if (payeStatus === 1) return 'success' as const
    if (payeStatus === 2) return 'secondary' as const
    return 'destructive' as const // Non payé en rouge
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payments.study')}</TableHead>
              <TableHead>{t('payments.volunteer')}</TableHead>
              <TableHead>{t('payments.group')}</TableHead>
              <TableHead>{t('payments.subjectNumber')}</TableHead>
              <TableHead>{t('payments.amount')} (EUR)</TableHead>
              <TableHead>{t('payments.status')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('payments.noPayments')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p, index) => {
                const statutConfig = paiementStatusMap[p.paye] || paiementStatusMap[0] || {
                  label: t('payments.unpaid'),
                  icon: '',
                  style: 'border-gray-300 text-gray-600',
                  bgColor: ''
                };
                const key = `${p.idEtude}_${p.idVolontaire}`;
                const estAnnule = isVolontaireAnnule ? isVolontaireAnnule(p.idVolontaire, p.idEtude) : false;
                
                return (
                  <TableRow 
                    key={`${p.idEtude}-${p.idVolontaire}-${index}`}
                    className={estAnnule ? 'bg-red-50/50 opacity-75' : ''}
                  >
                    <TableCell className="font-medium">
                      {getEtudeName ? getEtudeName(p.idEtude) : p.idEtude}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {getVolontaireName ? getVolontaireName(p.idVolontaire) : p.idVolontaire}
                        {estAnnule && (
                          <Badge variant="destructive" className="text-xs">
                            {t('payments.cancelledBadge')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {p.idVolontaire}</div>
                    </TableCell>
                    <TableCell>
                      {getGroupeName && p.idGroupe !== undefined ? getGroupeName(p.idGroupe, p.idEtude) : (p.idGroupe ?? 'N/A')}
                    </TableCell>
                    <TableCell>{p.numsujet || t('common.notDefined')}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${estAnnule ? 'line-through text-muted-foreground' : ''}`}>
                        {currency(p.iv)}
                      </span>
                      {estAnnule && (
                        <div className="text-xs text-destructive">({t('payments.excludedFromCalculations')})</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(p.paye)}>
                        <span className="mr-1">{statutConfig.icon}</span>
                        {statutConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.paye.toString()}
                        onValueChange={(value) => updatePaiementStatus && updatePaiementStatus(p, parseInt(value))}
                        disabled={(updateStatus && updateStatus[key] === 'loading') || estAnnule}
                      >
                        <SelectTrigger
                          className="w-[140px]"
                          disabled={estAnnule}
                          title={estAnnule ? t('payments.cannotModifyCancelledPayment') : ''}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paiementStatusMap).map(([value, config]) => (
                            <SelectItem key={value} value={value}>
                              {config.icon} {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default PaymentsTable;

