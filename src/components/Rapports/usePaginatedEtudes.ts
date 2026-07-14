import { useCallback, useEffect, useRef, useState } from 'react';
import type { Etude } from '@/types/types';
import etudeService from '../../services/etudeService';

const PAGE_SIZE = 50;

const getEtudeKey = (etude: Etude) => etude.idEtude ?? etude.id ?? etude.ref;

export const usePaginatedEtudes = (enabled: boolean) => {
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initialLoadStarted = useRef(false);

  const loadPage = useCallback(async (pageToLoad: number, append: boolean) => {
    setLoading(true);
    setError('');

    try {
      const response = await etudeService.getPaginated(pageToLoad, PAGE_SIZE, 'dateDebut', 'DESC');
      const incoming = response.content || [];

      setEtudes((current) => {
        if (!append) return incoming;

        const existingKeys = new Set(current.map(getEtudeKey));
        return [...current, ...incoming.filter((etude) => !existingKeys.has(getEtudeKey(etude)))];
      });
      setPage(pageToLoad);
      setHasMore(
        typeof response.last === 'boolean'
          ? !response.last
          : typeof response.totalPages === 'number'
            ? pageToLoad + 1 < response.totalPages
            : incoming.length === PAGE_SIZE
      );
    } catch (loadError) {
      console.error('Erreur lors du chargement des études à exclure:', loadError);
      setError('Impossible de charger les études.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void loadPage(0, false);
  }, [enabled, loadPage]);

  const loadMore = useCallback(() => loadPage(page + 1, true), [loadPage, page]);

  return { etudes, hasMore, loading, error, loadMore };
};
