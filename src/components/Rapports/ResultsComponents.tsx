import React from 'react';
import { useTranslation } from 'react-i18next';
import { EVALUATION_FIELDS } from './constants';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatsCardProps {
  title: string;
  value: number;
  valueClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, valueClass }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
    <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
    <div className="text-sm text-gray-600 mt-1">{title}</div>
  </div>
);

interface EvaluationSummaryCardProps {
  stats: {
    avgScore: number;
    avgNotes: Record<string, number>;
  };
  formatNote: (note: number, defaultValue?: string) => string;
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({ stats, formatNote }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="text-2xl font-bold text-center">{stats.avgScore}%</div>
      <div className="text-sm text-gray-600 text-center mb-3">{t('reports.matching.totalAverageScore')}</div>
      <div className="text-xs space-y-1">
        {EVALUATION_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-600">{label}:</span>
            <span className="font-medium">{formatNote(stats.avgNotes[key], 'NC')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatsGridProps {
  stats: {
    high: number;
    mid: number;
    low: number;
    avgScore: number;
    avgNotes: Record<string, number>;
  };
  formatNote: (note: number, defaultValue?: string) => string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, formatNote }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatsCard title="Score >= 80%" value={stats.high} valueClass="text-green-600" />
    <StatsCard title="Score 60-79%" value={stats.mid} valueClass="text-blue-600" />
    <StatsCard title="Score 40-59%" value={stats.low} valueClass="text-yellow-600" />
    <EvaluationSummaryCard stats={stats} formatNote={formatNote} />
  </div>
);

interface Volontaire {
  id: string | number;
  nom: string;
  prenom: string;
  email?: string;
  age?: number;
  phototype: string;
  scoreTotal: number;
  evaluations: Record<string, number>;
}

interface ResultRowProps {
  volontaire: Volontaire;
  formatNote: (note: number, defaultValue?: string) => string;
}

export const ResultRow: React.FC<ResultRowProps> = ({ volontaire, formatNote }) => {
  const { t } = useTranslation();
  const rowColorClass =
    volontaire.scoreTotal >= 80
      ? 'bg-green-50'
      : volontaire.scoreTotal >= 60
      ? 'bg-blue-50'
      : volontaire.scoreTotal >= 40
      ? 'bg-yellow-50'
      : 'bg-gray-50';

  const scoreColorClass =
    volontaire.scoreTotal >= 80
      ? 'text-green-600'
      : volontaire.scoreTotal >= 60
      ? 'text-blue-600'
      : volontaire.scoreTotal >= 40
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <TableRow className={rowColorClass}>
      <TableCell>
        <div className="font-medium">
          {volontaire.nom} {volontaire.prenom}
        </div>
        <div className="text-sm text-muted-foreground">ID: {volontaire.id}</div>
        <div className="text-sm text-muted-foreground">
          {volontaire.email || t('reports.matching.emailNotProvided')}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {typeof volontaire.age === 'number' ? `${volontaire.age} ${t('reports.matching.years')}` : t('reports.matching.notProvided')}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{volontaire.phototype}</Badge>
      </TableCell>
      <TableCell>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {EVALUATION_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground">{label.replace('Evaluation ', '')}:</span>
              <span className="font-medium">{formatNote(volontaire.evaluations[key])}</span>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className={`text-lg font-bold ${scoreColorClass}`}>
          {volontaire.scoreTotal}%
        </span>
      </TableCell>
    </TableRow>
  );
};

interface ResultsTableProps {
  results: Volontaire[];
  formatNote: (note: number, defaultValue?: string) => string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, formatNote }) => {
  const { t } = useTranslation();
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('reports.matching.volunteer')}</TableHead>
            <TableHead>{t('reports.matching.age')}</TableHead>
            <TableHead>{t('reports.matching.phototype')}</TableHead>
            <TableHead>{t('reports.matching.evaluations')}</TableHead>
            <TableHead className="text-center">{t('reports.matching.score')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((volontaire) => (
            <ResultRow key={volontaire.id} volontaire={volontaire} formatNote={formatNote} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
