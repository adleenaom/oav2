import useSWR from 'swr';
import { fetcher } from '../services/api';

/**
 * Generic API data hook. Wraps SWR with our fetcher.
 * Returns { data, error, isLoading, mutate }.
 */
export function useApi<T>(path: string | null) {
  return useSWR<T>(path, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}
