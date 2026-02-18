import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PaiementStatusConfig {
  label: string;
  [key: string]: any;
}

interface FiltersPanelProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statutPaiement: string;
  setStatutPaiement: (value: string) => void;
  allPaiementsLoaded: boolean;
  paiementStatusMap?: Record<string, PaiementStatusConfig>;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  searchQuery,
  setSearchQuery,
  statutPaiement,
  setStatutPaiement,
  allPaiementsLoaded,
  paiementStatusMap = {},
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('common.filter')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">
              Recherche par ID ou Référence
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-query"
                type="text"
                placeholder="Ex: 2024-001 ou 123..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut-select">
              {t('payments.status')}
            </Label>
            <Select
              value={statutPaiement}
              onValueChange={setStatutPaiement}
              disabled={statutPaiement !== 'all' && !allPaiementsLoaded}
            >
              <SelectTrigger id="statut-select">
                <SelectValue placeholder={t('payments.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('payments.allStatuses')}</SelectItem>
                {Object.entries(paiementStatusMap).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;
