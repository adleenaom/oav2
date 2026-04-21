import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiPost } from '../services/api';

export function useCredits() {
  const { user, refreshUser } = useAuth();

  const credits = user?.credits ?? 0;

  const purchaseBundle = useCallback(async (bundleId: number): Promise<boolean> => {
    try {
      await apiPost('/v3/bundles/purchase', { bundle_id: bundleId });
      await refreshUser();
      return true;
    } catch {
      return false;
    }
  }, [refreshUser]);

  const purchasePlan = useCallback(async (planId: number): Promise<boolean> => {
    try {
      await apiPost('/v3/plans/purchase', { plan_id: planId });
      await refreshUser();
      return true;
    } catch {
      return false;
    }
  }, [refreshUser]);

  // For now, purchased status is tracked locally until we wire engagement-status endpoints
  const purchasedBundleIds: number[] = [];
  const purchasedPlanIds: number[] = [];

  const isBundlePurchased = useCallback((_bundleId: number): boolean => {
    return false; // TODO: wire to /v3/bundles/engagement-status
  }, []);

  const isBundleAccessible = useCallback((_bundleId: number, isFree: boolean): boolean => {
    return isFree; // TODO: wire to engagement-status for owned bundles
  }, []);

  return {
    credits,
    purchasedBundleIds,
    purchasedPlanIds,
    purchaseBundle,
    purchasePlan,
    isBundlePurchased,
    isBundleAccessible,
  };
}
