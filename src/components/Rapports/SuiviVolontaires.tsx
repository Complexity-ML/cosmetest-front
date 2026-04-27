import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import volontaireService from '../../services/volontaireService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Search, ExternalLink } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatters';

interface VolontaireRow {
  id?: number;
  idVol?: number;
  nom?: string;
  nomVol?: string;
  prenom?: string;
  prenomVol?: string;
  email?: string;
  emailVol?: string;
  telephone?: string;
  telPortableVol?: string;
  dateModif?: string;
}

const SuiviVolontaires = () => {
  const [dateModifFrom, setDateModifFrom] = useState('');
  const [dateModifTo, setDateModifTo] = useState('');
  const [sansEtude, setSansEtude] = useState(false);
  const [sansEtudeAnneeEnCours, setSansEtudeAnneeEnCours] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const [volontaires, setVolontaires] = useState<VolontaireRow[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async (targetPage = 0) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await volontaireService.searchSuivi({
        dateModifFrom: dateModifFrom || undefined,
        dateModifTo: dateModifTo || undefined,
        sansEtude,
        sansEtudeAnneeEnCours,
        includeArchived,
        page: targetPage,
        size,
      });
      setVolontaires(response.data?.content || []);
      setTotal(response.data?.totalElements || 0);
      setPageCount(response.data?.totalPages || 0);
      setPage(targetPage);
      setHasSearched(true);
    } catch (err) {
      console.error('Erreur recherche suivi:', err);
      setError('Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  }, [dateModifFrom, dateModifTo, sansEtude, sansEtudeAnneeEnCours, includeArchived, size]);

  useEffect(() => {
    if (hasSearched) fetchResults(0);
  }, [sansEtude, sansEtudeAnneeEnCours, includeArchived]);

  const formatDate = (s?: string) => {
    if (!s) return '-';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
  };

  const isOlderThan2Years = (s?: string) => {
    if (!s) return true;
    const d = new Date(s);
    if (isNaN(d.getTime())) return true;
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return d.getTime() < twoYearsAgo.getTime();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Suivi des volontaires
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Trouve les volontaires à mettre à jour, sans étude récente, ou jamais utilisés.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dateModifFrom" className="text-xs font-medium">Mise à jour du</Label>
              <Input
                id="dateModifFrom"
                type="date"
                value={dateModifFrom}
                onChange={(e) => setDateModifFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateModifTo" className="text-xs font-medium">au</Label>
              <Input
                id="dateModifTo"
                type="date"
                value={dateModifTo}
                onChange={(e) => setDateModifTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sansEtude"
                checked={sansEtude}
                onCheckedChange={(c) => setSansEtude(c as boolean)}
              />
              <Label htmlFor="sansEtude" className="font-normal text-sm">Aucune étude</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sansEtudeAnnee"
                checked={sansEtudeAnneeEnCours}
                onCheckedChange={(c) => setSansEtudeAnneeEnCours(c as boolean)}
              />
              <Label htmlFor="sansEtudeAnnee" className="font-normal text-sm">
                Aucune étude cette année ({new Date().getFullYear()})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="suiviIncludeArchived"
                checked={includeArchived}
                onCheckedChange={(c) => setIncludeArchived(c as boolean)}
              />
              <Label htmlFor="suiviIncludeArchived" className="font-normal text-sm">
                Inclure les archivés
              </Label>
            </div>

            <Button
              onClick={() => fetchResults(0)}
              disabled={isLoading}
              size="sm"
              className="ml-auto"
            >
              <Search className="h-4 w-4 mr-1" />
              {isLoading ? 'Recherche…' : 'Rechercher'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasSearched && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {total} volontaire{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volontaires.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun résultat</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Nom</th>
                      <th className="text-left p-2 font-medium">Prénom</th>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Téléphone</th>
                      <th className="text-left p-2 font-medium">Dernière mise à jour</th>
                      <th className="text-right p-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volontaires.map((v) => {
                      const id = v.id || v.idVol;
                      const stale = isOlderThan2Years(v.dateModif);
                      return (
                        <tr key={id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{id}</td>
                          <td className="p-2 font-medium">{v.nom || v.nomVol || '-'}</td>
                          <td className="p-2">{v.prenom || v.prenomVol || '-'}</td>
                          <td className="p-2 text-gray-600">{v.email || v.emailVol || '-'}</td>
                          <td className="p-2 text-gray-600">{formatPhoneNumber(v.telephone || v.telPortableVol)}</td>
                          <td className={`p-2 ${stale ? 'text-amber-700 font-semibold' : 'text-gray-600'}`}>
                            {stale && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                            {formatDate(v.dateModif)}
                          </td>
                          <td className="p-2 text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/volontaires/${id}`}>
                                Ouvrir <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pageCount > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} sur {pageCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => fetchResults(page - 1)}
                  >
                    &laquo; Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount - 1}
                    onClick={() => fetchResults(page + 1)}
                  >
                    Suivant &raquo;
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuiviVolontaires;
