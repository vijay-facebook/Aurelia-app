import { supabase } from '../lib/supabase';

export interface LoyaltyAccountRecord {
  user_id: string;
  completed_appointments: number;
  available_points: number;
  threshold_points: number;
  reward_label: string;
  referral_code?: string;
  referred_by?: string | null;
  referral_count?: number;
  updated_at?: string;
}

export interface LoyaltyActivityItem {
  id: string;
  type: 'purchase' | 'engagement' | 'redemption' | 'referral';
  label: string;
  pointsDelta: number;
  createdAt: string;
}

export interface LoyaltyAccountSnapshot {
  account: LoyaltyAccountRecord;
  activities: LoyaltyActivityItem[];
  source: 'supabase' | 'local';
}

export const LOYALTY_UPDATED_EVENT = 'aurelia:supabase-loyalty-updated';

export function buildDefaultReferralCode(userId: string): string {
  const cleaned = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const suffix = (cleaned.slice(0, 6) || 'STUDIO').padEnd(6, 'X');
  return `AUR-${suffix}`;
}

function accountStorageKey(userId: string): string {
  return `aurelia_loyalty_account_v1_${userId}`;
}

function activityStorageKey(userId: string): string {
  return `aurelia_loyalty_activity_v1_${userId}`;
}

export function loadLocalAccount(
  userId: string,
  defaults: { thresholdPoints: number; rewardLabel: string }
): LoyaltyAccountRecord {
  const defaultCode = buildDefaultReferralCode(userId);
  if (typeof window === 'undefined') {
    return {
      user_id: userId,
      completed_appointments: 0,
      available_points: 0,
      threshold_points: defaults.thresholdPoints,
      reward_label: defaults.rewardLabel,
      referral_code: defaultCode,
      referred_by: null,
      referral_count: 0,
    };
  }
  try {
    const raw = localStorage.getItem(accountStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user_id: userId,
        completed_appointments: Number(parsed.completed_appointments) || 0,
        available_points: Number(parsed.available_points) || 0,
        threshold_points: Number(parsed.threshold_points) || defaults.thresholdPoints,
        reward_label: parsed.reward_label || defaults.rewardLabel,
        referral_code: parsed.referral_code || defaultCode,
        referred_by: parsed.referred_by ?? null,
        referral_count: Number(parsed.referral_count) || 0,
        updated_at: parsed.updated_at,
      };
    }
  } catch {
    // Ignore parse error
  }
  return {
    user_id: userId,
    completed_appointments: 0,
    available_points: 0,
    threshold_points: defaults.thresholdPoints,
    reward_label: defaults.rewardLabel,
    referral_code: defaultCode,
    referred_by: null,
    referral_count: 0,
  };
}

export function saveLocalAccount(account: LoyaltyAccountRecord): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(accountStorageKey(account.user_id), JSON.stringify(account));
  } catch {
    // Ignore
  }
}

export function loadLoyaltyActivities(userId: string): LoyaltyActivityItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(activityStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLoyaltyActivity(
  userId: string,
  item: LoyaltyActivityItem
): LoyaltyActivityItem[] {
  const current = loadLoyaltyActivities(userId);
  const next = [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 20);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(activityStorageKey(userId), JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(LOYALTY_UPDATED_EVENT));
    } catch {
      // Ignore
    }
  }
  return next;
}

function mergeActivities(
  remote: LoyaltyActivityItem[],
  local: LoyaltyActivityItem[]
): LoyaltyActivityItem[] {
  const map = new Map<string, LoyaltyActivityItem>();
  for (const item of [...remote, ...local]) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
}

async function fetchRemoteActivities(userId: string): Promise<LoyaltyActivityItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('loyalty_activities')
      .select('id, type, label, points_delta, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return null;

    return data.map((row) => ({
      id: String(row.id),
      type: (row.type as LoyaltyActivityItem['type']) || 'engagement',
      label: String(row.label),
      pointsDelta: Number(row.points_delta) || 0,
      createdAt: String(row.created_at),
    }));
  } catch {
    return null;
  }
}

const LOYALTY_SELECT_FIELDS =
  'user_id, completed_appointments, available_points, threshold_points, reward_label, referral_code, referred_by, referral_count, updated_at';

export async function fetchLoyaltyAccount(
  userId: string,
  defaults: { thresholdPoints: number; rewardLabel: string }
): Promise<LoyaltyAccountSnapshot> {
  const localAccount = loadLocalAccount(userId, defaults);
  const localActivities = loadLoyaltyActivities(userId);

  if (!supabase) {
    return { account: localAccount, activities: localActivities, source: 'local' };
  }

  try {
    const [{ data, error }, remoteActivities] = await Promise.all([
      supabase
        .from('loyalty_accounts')
        .select(LOYALTY_SELECT_FIELDS)
        .eq('user_id', userId)
        .maybeSingle(),
      fetchRemoteActivities(userId),
    ]);

    const mergedActivities = remoteActivities
      ? mergeActivities(remoteActivities, localActivities)
      : localActivities;

    if (error) {
      throw error;
    }

    if (!data) {
      const referralCode = localAccount.referral_code || buildDefaultReferralCode(userId);
      const { data: inserted, error: insertError } = await supabase
        .from('loyalty_accounts')
        .upsert(
          {
            user_id: userId,
            completed_appointments: localAccount.completed_appointments,
            available_points: localAccount.available_points,
            threshold_points: defaults.thresholdPoints,
            reward_label: defaults.rewardLabel,
            referral_code: referralCode,
            referral_count: localAccount.referral_count ?? 0,
          },
          { onConflict: 'user_id' }
        )
        .select(LOYALTY_SELECT_FIELDS)
        .maybeSingle();

      if (!insertError && inserted) {
        saveLocalAccount(inserted);
        return { account: inserted, activities: mergedActivities, source: 'supabase' };
      }

      return { account: localAccount, activities: mergedActivities, source: 'local' };
    }

    // Ensure legacy rows get a referral_code populated cleanly
    const resolvedAccount: LoyaltyAccountRecord = {
      ...data,
      referral_code: data.referral_code || localAccount.referral_code || buildDefaultReferralCode(userId),
      referral_count: Number(data.referral_count ?? localAccount.referral_count ?? 0),
    };

    if (!data.referral_code) {
      supabase
        .from('loyalty_accounts')
        .update({ referral_code: resolvedAccount.referral_code })
        .eq('user_id', userId)
        .then(
          () => {},
          () => {}
        );
    }

    saveLocalAccount(resolvedAccount);
    return { account: resolvedAccount, activities: mergedActivities, source: 'supabase' };
  } catch {
    return { account: localAccount, activities: localActivities, source: 'local' };
  }
}

export async function recordLoyaltyEvent(
  userId: string,
  params: {
    type: LoyaltyActivityItem['type'];
    label: string;
    pointsDelta: number;
    incrementAppointments?: boolean;
    incrementReferrals?: boolean;
    referredBy?: string | null;
    referralCodeOverride?: string;
    defaults: { thresholdPoints: number; rewardLabel: string };
  }
): Promise<LoyaltyAccountSnapshot> {
  const snapshot = await fetchLoyaltyAccount(userId, params.defaults);
  const current = snapshot.account;

  const nextPoints = Math.max(0, current.available_points + params.pointsDelta);
  const nextCompleted = params.incrementAppointments
    ? current.completed_appointments + 1
    : current.completed_appointments;
  const nextReferrals = params.incrementReferrals
    ? (current.referral_count ?? 0) + 1
    : (current.referral_count ?? 0);

  const updatedAccount: LoyaltyAccountRecord = {
    ...current,
    available_points: nextPoints,
    completed_appointments: nextCompleted,
    referral_count: nextReferrals,
    referral_code:
      params.referralCodeOverride || current.referral_code || buildDefaultReferralCode(userId),
    referred_by: params.referredBy !== undefined ? params.referredBy : current.referred_by,
    threshold_points: current.threshold_points || params.defaults.thresholdPoints,
    reward_label: current.reward_label || params.defaults.rewardLabel,
    updated_at: new Date().toISOString(),
  };

  saveLocalAccount(updatedAccount);

  const activityEntry: LoyaltyActivityItem = {
    id: `ly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: params.type,
    label: params.label,
    pointsDelta: params.pointsDelta,
    createdAt: new Date().toISOString(),
  };
  const activities = saveLoyaltyActivity(userId, activityEntry);

  if (!supabase) {
    return { account: updatedAccount, activities, source: 'local' };
  }

  try {
    const [{ data, error }] = await Promise.all([
      supabase
        .from('loyalty_accounts')
        .upsert(
          {
            user_id: userId,
            completed_appointments: updatedAccount.completed_appointments,
            available_points: updatedAccount.available_points,
            threshold_points: updatedAccount.threshold_points,
            reward_label: updatedAccount.reward_label,
            referral_code: updatedAccount.referral_code,
            referred_by: updatedAccount.referred_by ?? null,
            referral_count: updatedAccount.referral_count ?? 0,
            updated_at: updatedAccount.updated_at,
          },
          { onConflict: 'user_id' }
        )
        .select(LOYALTY_SELECT_FIELDS)
        .maybeSingle(),
      supabase.from('loyalty_activities').insert({
        user_id: userId,
        type: params.type,
        label: params.label,
        points_delta: params.pointsDelta,
      }),
    ]);

    if (error || !data) {
      return { account: updatedAccount, activities, source: 'local' };
    }

    saveLocalAccount(data);
    return { account: data, activities, source: 'supabase' };
  } catch {
    return { account: updatedAccount, activities, source: 'local' };
  }
}
