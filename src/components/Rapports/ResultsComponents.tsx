import React from 'react';
import { EVALUATION_FIELDS } from './constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatsCardProps {
  title: string;
  value: number;
  valueClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, valueClass }) => (
  <Card>
    <CardContent className="pt-6 text-center">
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </CardContent>
  </Card>
);

interface EvaluationSummaryCardProps {
  stats: {
    avgScore: number;
    avgNotes: Record<string, number>;
  };
  formatNote: (note: number, defaultValue?: string) => string;
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({ stats, formatNote }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-2xl font-bold text-center">{stats.avgScore}%</div>
      <div className="text-sm text-muted-foreground text-center mb-3">Score total moyen</div>
      <div className="text-xs space-y-1">
        {EVALUATION_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex justify-between">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{formatNote(stats.avgNotes[key], 'NC')}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

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
          {volontaire.email || 'Email non renseigné'}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {typeof volontaire.age === 'number' ? `${volontaire.age} ans` : 'Non renseigne'}
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

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, formatNote }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Volontaire</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phototype</TableHead>
            <TableHead>Evaluations</TableHead>
            <TableHead className="text-center">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((volontaire) => (
            <ResultRow key={volontaire.id} volontaire={volontaire} formatNote={formatNote} />
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
