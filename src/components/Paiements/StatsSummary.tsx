import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Statistics {
  total?: number;
  annulesCount?: number;
  payes?: number;
  montantPaye?: number;
  nonPayes?: number;
  montantRestant?: number;
  enAttente?: number;
  montantAnnules?: number;
}

interface StatsSummaryProps {
  statistics?: Statistics;
}

const currency = (n?: number): string => `${Number(n || 0).toFixed(0)} EUR`;

const StatsSummary: React.FC<StatsSummaryProps> = ({ statistics }) => {
  const { t } = useTranslation();
  const s = statistics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-blue-50 border-blue-100 p-4">
        <h3 className="text-sm font-medium text-blue-800">{t('payments.totalActivePayments')}</h3>
        <p className="text-2xl font-bold text-blue-900">{s.total || 0}</p>
        {(s.annulesCount ?? 0) > 0 && (
          <p className="text-xs text-blue-700">{t('payments.cancelledExcluded', { count: s.annulesCount })}</p>
        )}
      </Card>

      <Card className="bg-green-50 border-green-100 p-4">
        <h3 className="text-sm font-medium text-green-800">{t('payments.paid')}</h3>
        <p className="text-2xl font-bold text-green-900">{s.payes || 0}</p>
        <p className="text-sm text-green-700">{currency(s.montantPaye)}</p>
      </Card>

      <Card className="bg-red-50 border-red-100 p-4">
        <h3 className="text-sm font-medium text-red-800">{t('payments.unpaid')}</h3>
        <p className="text-2xl font-bold text-red-900">{s.nonPayes || 0}</p>
        <p className="text-sm text-red-700">{currency(s.montantRestant)}</p>
      </Card>

      <Card className="bg-yellow-50 border-yellow-100 p-4">
        <h3 className="text-sm font-medium text-yellow-800">{t('payments.pending')}</h3>
        <p className="text-2xl font-bold text-yellow-900">{s.enAttente || 0}</p>
      </Card>

      <Card className="bg-gray-50 border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-800">{t('payments.cancelled')}</h3>
        <p className="text-2xl font-bold text-gray-900">{s.annulesCount || 0}</p>
        <p className="text-sm text-gray-700">{currency(s.montantAnnules)}</p>
      </Card>
    </div>
  );
};

export default StatsSummary;
