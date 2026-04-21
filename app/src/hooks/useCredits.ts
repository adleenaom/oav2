import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiPost } from '../services/api';

const DEMO_EMAIL = 'demo@openacademy.org';
const DEMO_CREDITS_KEY = 'oa_demo_credits';
const PURCHASED_KEY = 'oa_purchased_bundles';

function getDemoCredits(): number {
  try {
    const val = localStorage.getItem(DEMO_CREDITS_KEY);
    return val !== null ? Number(val) : 1000;
  } catch { return 1000; }
}

function setDemoCredits(n: number) {
  localStorage.setItem(DEMO_CREDITS_KEY, String(n));
}

function getPurchasedIds(): number[] {
  try {
    const raw = localStorage.getItem(PURCHASED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePurchasedIds(ids: number[]) {
  localStorage.setItem(PURCHASED_KEY, JSON.stringify(ids));
}

export function useCredits() {
  const { user, refreshUser } = useAuth();
  const isDemo = user?.email === DEMO_EMAIL;

  const [demoCredits, setDemoCreditsState] = useState(getDemoCredits);
  const [purchasedIds, setPurchasedIds] = useState<number[]>(getPurchasedIds);

  // Credits: demo uses local mock, real users use server value
  const credits = isDemo ? demoCredits : (user?.credits ?? 0);

  const purchaseBundle = useCallback(async (bundleId: number, cost?: number): Promise<boolean> => {
    if (isDemo) {
      // Demo: local mock purchase
      const price = cost ?? 0;
      if (price > demoCredits) return false;
      const newCredits = demoCredits - price;
      setDemoCredits(newCredits);
      setDemoCreditsState(newCredits);
      const newIds = [...new Set([...purchasedIds, bundleId])];
      savePurchasedIds(newIds);
      setPurchasedIds(newIds);
      return true;
    }
    // Real user: call API
    try {
      await apiPost('/v3/bundles/purchase', { bundle_id: bundleId });
      await refreshUser();
      return true;
    } catch {
      return false;
    }
  }, [isDemo, demoCredits, purchasedIds, refreshUser]);

  const purchasePlan = useCallback(async (planId: number, cost?: number): Promise<boolean> => {
    if (isDemo) {
      const price = cost ?? 0;
      if (price > demoCredits) return false;
      const newCredits = demoCredits - price;
      setDemoCredits(newCredits);
      setDemoCreditsState(newCredits);
      return true;
    }
    try {
      await apiPost('/v3/plans/purchase', { plan_id: planId });
      await refreshUser();
      return true;
    } catch {
      return false;
    }
  }, [isDemo, demoCredits, refreshUser]);

  const isBundlePurchased = useCallback((bundleId: number): boolean => {
    return purchasedIds.includes(bundleId);
  }, [purchasedIds]);

  const isBundleAccessible = useCallback((bundleId: number, isFree: boolean): boolean => {
    if (isFree) return true;
    return purchasedIds.includes(bundleId);
  }, [purchasedIds]);

  return {
    credits,
    purchasedBundleIds: purchasedIds,
    purchasedPlanIds: [] as number[],
    purchaseBundle,
    purchasePlan,
    isBundlePurchased,
    isBundleAccessible,
  };
}
