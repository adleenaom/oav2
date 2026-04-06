import { useCallback } from 'react';
import { useApi } from './useApi';
import { apiFetch } from '../services/api';

interface CreditsData {
  credits: number;
}

interface PurchasesData {
  bundle_ids: number[];
  plan_ids: number[];
}

export function useCredits() {
  const { data: creditsData, mutate: mutateCredits } = useApi<CreditsData>('/credits');
  const { data: purchasesData, mutate: mutatePurchases } = useApi<PurchasesData>('/credits/purchases');

  const credits = creditsData?.credits ?? 1000;
  const purchasedBundleIds = purchasesData?.bundle_ids ?? [];
  const purchasedPlanIds = purchasesData?.plan_ids ?? [];

  const purchaseBundle = useCallback(async (bundleId: number): Promise<boolean> => {
    try {
      await apiFetch('/credits/purchase', {
        method: 'POST',
        body: JSON.stringify({ bundle_id: bundleId }),
      });
      mutateCredits();
      mutatePurchases();
      return true;
    } catch {
      return false;
    }
  }, [mutateCredits, mutatePurchases]);

  const purchasePlan = useCallback(async (planId: number): Promise<boolean> => {
    try {
      await apiFetch('/credits/purchase', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId }),
      });
      mutateCredits();
      mutatePurchases();
      return true;
    } catch {
      return false;
    }
  }, [mutateCredits, mutatePurchases]);

  const isBundlePurchased = useCallback((bundleId: number): boolean => {
    return purchasedBundleIds.includes(bundleId);
  }, [purchasedBundleIds]);

  const isBundleAccessible = useCallback((bundleId: number, isFree: boolean): boolean => {
    return isFree || purchasedBundleIds.includes(bundleId);
  }, [purchasedBundleIds]);

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
