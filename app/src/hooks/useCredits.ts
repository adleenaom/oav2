import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiPost } from '../services/api';

const DEMO_EMAIL = 'demo@openacademy.org';
const DEMO_CREDITS_KEY = 'oa_demo_credits';
const PURCHASED_KEY = 'oa_purchased_bundles';
const TRANSACTIONS_KEY = 'oa_credit_transactions';

export interface CreditTransaction {
  id: string;
  type: 'topup' | 'purchase';
  amount: number; // positive for topup, negative for purchase
  balance: number; // balance after transaction
  label: string; // e.g. "Purchased: Management Techniques" or "Top Up: 500 credits"
  timestamp: number;
}

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

function getTransactions(): CreditTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    const txns = raw ? JSON.parse(raw) : [];
    // Seed initial demo credit if no transactions exist
    if (txns.length === 0 && getDemoCredits() === 1000) {
      const seed: CreditTransaction = {
        id: 'txn-seed',
        type: 'topup',
        amount: 1000,
        balance: 1000,
        label: 'Welcome bonus: 1000 credits',
        timestamp: Date.now() - 86400000, // 1 day ago
      };
      txns.push(seed);
      saveTransactions(txns);
    }
    return txns;
  } catch { return []; }
}

function saveTransactions(txns: CreditTransaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

function addTransaction(txn: Omit<CreditTransaction, 'id' | 'timestamp'>): CreditTransaction {
  const full: CreditTransaction = {
    ...txn,
    id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  const all = getTransactions();
  all.unshift(full); // newest first
  saveTransactions(all);
  return full;
}

export function useCredits() {
  const { user, refreshUser } = useAuth();
  const isDemo = user?.email === DEMO_EMAIL;

  const [demoCredits, setDemoCreditsState] = useState(getDemoCredits);
  const [purchasedIds, setPurchasedIds] = useState<number[]>(getPurchasedIds);
  const [transactions, setTransactions] = useState<CreditTransaction[]>(getTransactions);

  const credits = isDemo ? demoCredits : (user?.credits ?? 0);

  const purchaseBundle = useCallback(async (bundleId: number, cost?: number, bundleTitle?: string): Promise<boolean> => {
    if (isDemo) {
      const price = cost ?? 0;
      if (price > demoCredits) return false;
      const newCredits = demoCredits - price;
      setDemoCredits(newCredits);
      setDemoCreditsState(newCredits);
      const newIds = [...new Set([...purchasedIds, bundleId])];
      savePurchasedIds(newIds);
      setPurchasedIds(newIds);
      // Record transaction
      const txn = addTransaction({
        type: 'purchase',
        amount: -price,
        balance: newCredits,
        label: bundleTitle ? `Purchased: ${bundleTitle}` : `Purchased bundle #${bundleId}`,
      });
      setTransactions(prev => [txn, ...prev]);
      return true;
    }
    try {
      await apiPost('/v3/bundles/purchase', { bundle_id: bundleId });
      await refreshUser();
      return true;
    } catch {
      return false;
    }
  }, [isDemo, demoCredits, purchasedIds, refreshUser]);

  const purchasePlan = useCallback(async (planId: number, cost?: number, planTitle?: string): Promise<boolean> => {
    if (isDemo) {
      const price = cost ?? 0;
      if (price > demoCredits) return false;
      const newCredits = demoCredits - price;
      setDemoCredits(newCredits);
      setDemoCreditsState(newCredits);
      const txn = addTransaction({
        type: 'purchase',
        amount: -price,
        balance: newCredits,
        label: planTitle ? `Purchased: ${planTitle}` : `Purchased lesson #${planId}`,
      });
      setTransactions(prev => [txn, ...prev]);
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

  const topUpCredits = useCallback((amount: number) => {
    if (!isDemo) return;
    const newCredits = demoCredits + amount;
    setDemoCredits(newCredits);
    setDemoCreditsState(newCredits);
    const txn = addTransaction({
      type: 'topup',
      amount,
      balance: newCredits,
      label: `Top Up: ${amount} credits`,
    });
    setTransactions(prev => [txn, ...prev]);
  }, [isDemo, demoCredits]);

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
    topUpCredits,
    isBundlePurchased,
    isBundleAccessible,
    transactions,
  };
}
