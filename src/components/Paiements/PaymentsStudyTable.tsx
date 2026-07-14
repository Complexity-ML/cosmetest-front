import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Etude } from '../../types/types';
import type { PaiementSummary } from '../../pages/Paiements/paymentPageTypes';

interface PaymentsStudyTableProps {
  etudes: Etude[];
  summaries: Record<string | number, PaiementSummary>;
  isEtudeOverdue: (etude: Etude) => boolean;
  formatDate: (date?: string) => string;
  onSelect: (idEtude: number) => void;
}

const PaymentsStudyTable = ({
  etudes,
  summaries,
  isEtudeOverdue,
  formatDate,
  onSelect,
}: PaymentsStudyTableProps) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Date début</TableHead>
          <TableHead>Date fin</TableHead>
          <TableHead className="text-center">Volontaires</TableHead>
          <TableHead className="text-center">Payés</TableHead>
          <TableHead className="text-center">Non payés</TableHead>
          <TableHead className="text-center">Annulés</TableHead>
          <TableHead className="text-right">Montant total</TableHead>
          <TableHead className="text-center">Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {etudes.map((etude) => {
          const summary = summaries[etude.idEtude as string | number];
          const payes = summary?.payes ?? 0;
          const nonPayes = summary?.nonPayes ?? 0;
          const annules = summary?.annules ?? 0;
          const totalVol = payes + nonPayes + (summary?.enAttente ?? 0);
          const montantTotal = summary?.montantTotal ?? summary?.montantPaye ?? 0;
          const overdue = isEtudeOverdue(etude);
          const allPaid = Number(etude.paye) === 2;

          return (
            <TableRow
              key={etude.idEtude}
              className={`cursor-pointer hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50 hover:bg-red-100' : ''}`}
              onClick={() => onSelect(Number(etude.idEtude))}
            >
              <TableCell className={`font-medium ${overdue ? 'text-red-700' : ''}`}>
                {etude.ref || `#${etude.idEtude}`}
              </TableCell>
              <TableCell className={overdue ? 'text-red-600' : ''}>
                {formatDate(etude.dateDebut)}
              </TableCell>
              <TableCell className={overdue ? 'text-red-600' : ''}>
                {formatDate(etude.dateFin)}
              </TableCell>
              <TableCell className="text-center">{totalVol}</TableCell>
              <TableCell className="text-center">
                {payes > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    {payes}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="text-center">
                {nonPayes > 0 ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                    {nonPayes}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="text-center">
                {annules > 0 ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    {annules}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {montantTotal > 0 ? `${montantTotal} EUR` : '-'}
              </TableCell>
              <TableCell className="text-center">
                {allPaid ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    Payé
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className={overdue
                      ? 'bg-red-200 text-red-800 border-red-300'
                      : 'bg-red-100 text-red-700 border-red-200'}
                  >
                    Non payé
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Card>
);

export default PaymentsStudyTable;
