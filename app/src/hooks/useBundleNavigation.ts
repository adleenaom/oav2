import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from './useCredits';
import type { ApiBundleSummary } from '../services/types';

/**
 * Hook for handling bundle thumbnail clicks:
 * - Purchased or free → go directly to player (/play/:bundleId/0)
 * - Not purchased → show purchase modal
 */
export function useBundleNavigation() {
  const navigate = useNavigate();
  const { isBundleAccessible } = useCredits();
  const [modalBundle, setModalBundle] = useState<ApiBundleSummary | null>(null);

  const handleBundleClick = useCallback((bundle: ApiBundleSummary) => {
    const accessible = isBundleAccessible(bundle.id, bundle.is_free);
    if (accessible) {
      // Purchased → go directly to player
      navigate(`/play/${bundle.id}/0`);
    } else {
      // Not purchased → show purchase modal
      setModalBundle(bundle);
    }
  }, [isBundleAccessible, navigate]);

  const closeModal = useCallback(() => {
    setModalBundle(null);
  }, []);

  return {
    modalBundle,
    handleBundleClick,
    closeModal,
  };
}
