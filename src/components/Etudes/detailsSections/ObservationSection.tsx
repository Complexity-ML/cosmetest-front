import { useEffect, useState } from 'react';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import volontaireService from '../../../services/volontaireService';

interface VolontaireObservation {
  idVolontaire: number;
  nom: string;
  prenom: string;
  observations: string;
  saving: boolean;
  saved: boolean;
}

interface ObservationSectionProps {
  etudeId: number;
}

const ObservationSection = ({ etudeId }: ObservationSectionProps) => {
  const [volontaires, setVolontaires] = useState<VolontaireObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const associations = await etudeVolontaireService.getVolontairesByEtude(etudeId);
        const assocArray = Array.isArray(associations) ? associations : (associations?.data || []);

        const uniqueIds: number[] = [...new Set<number>(
          assocArray.map((a: any) => Number(a.idVolontaire)).filter((id: number) => id > 0)
        )];

        const items: VolontaireObservation[] = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const res = await volontaireService.getById(id);
              const v = res.data;
              return {
                idVolontaire: id,
                nom: v.nom || v.nomVol || '',
                prenom: v.prenom || v.prenomVol || '',
                observations: v.observations ?? '',
                saving: false,
                saved: false,
              };
            } catch {
              return { idVolontaire: id, nom: '?', prenom: '?', observations: '', saving: false, saved: false };
            }
          })
        );

        items.sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom));
        setVolontaires(items);
      } catch (err: any) {
        setError(err?.message || 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [etudeId]);

  const handleChange = (idVolontaire: number, value: string) => {
    setVolontaires(prev =>
      prev.map(v => v.idVolontaire === idVolontaire ? { ...v, observations: value, saved: false } : v)
    );
  };

  const handleSave = async (idVolontaire: number) => {
    const vol = volontaires.find(v => v.idVolontaire === idVolontaire);
    if (!vol) return;

    setVolontaires(prev =>
      prev.map(v => v.idVolontaire === idVolontaire ? { ...v, saving: true } : v)
    );

    try {
      await volontaireService.updateObservations(idVolontaire, vol.observations);
      setVolontaires(prev =>
        prev.map(v => v.idVolontaire === idVolontaire ? { ...v, saving: false, saved: true } : v)
      );
      setTimeout(() => {
        setVolontaires(prev =>
          prev.map(v => v.idVolontaire === idVolontaire ? { ...v, saved: false } : v)
        );
      }, 2000);
    } catch (err: any) {
      setVolontaires(prev =>
        prev.map(v => v.idVolontaire === idVolontaire ? { ...v, saving: false } : v)
      );
      alert(`Erreur lors de la sauvegarde : ${err?.message || 'Erreur inconnue'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm p-4">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Observations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Observations individuelles des volontaires sur cette étude
        </p>
      </div>

      {volontaires.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun volontaire inscrit à cette étude</p>
        </div>
      ) : (
        <div className="space-y-4">
          {volontaires.map(vol => (
            <div key={vol.idVolontaire} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-48">
                  <div className="font-semibold text-gray-900">
                    {vol.nom} {vol.prenom}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">ID #{vol.idVolontaire}</div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={vol.observations}
                    onChange={e => handleChange(vol.idVolontaire, e.target.value)}
                    rows={3}
                    placeholder="Aucune observation..."
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex-shrink-0 flex items-start pt-1">
                  <button
                    onClick={() => handleSave(vol.idVolontaire)}
                    disabled={vol.saving}
                    className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                      vol.saved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                    }`}
                  >
                    {vol.saving ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : vol.saved ? (
                      <>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enregistré
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObservationSection;
