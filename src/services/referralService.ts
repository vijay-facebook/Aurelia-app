import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  LOYALTY_UPDATED_EVENT,
  buildDefaultReferralCode,
  fetchLoyaltyAccount,
  loadLocalAccount,
  recordLoyaltyEvent,
  saveLocalAccount,
} from './loyaltyService';

export const REFERRER_BONUS_POINTS = 150;
export const REFERRED_BONUS_POINTS = 100;

export const REFERRAL_UPDATED_EVENT = 'aurelia:referral-updated';

const PENDING_REFERRAL_KEY = 'aurelia_pending_referral_code';
const REFERRAL_DIRECTORY_KEY = 'aurelia_referral_directory_v1';
const REFERRAL_CLAIMS_KEY = 'aurelia_referral_claims_v1';

interface ReferralDirectoryEntry {
  code: string;
  userId: string;
  displayName: string;
}

export interface ReferralClaimRecord {
  referredUserId: string;
  referredLabel: string;
  referrerUserId: string;
  referralCode: string;
  referrerPoints: number;
  referredPoints: number;
  createdAt: string;
}

export interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  totalPointsEarned: number;
  referrerBonusPoints: number;
  referredBonusPoints: number;
  referredByCode?: string | null;
  recentReferrals: ReferralClaimRecord[];
}

export interface ReferralAwardOutcome {
  awarded: boolean;
  alreadyClaimed?: boolean;
  reason?: string;
  referrerPoints: number;
  referredPoints: number;
  source?: 'supabase' | 'local';
}

export function normalizeReferralCode(raw?: string | null): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function buildReferralLink(referralCode: string): string {
  const cleanCode = normalizeReferralCode(referralCode);
  if (typeof window === 'undefined') return `/?ref=${encodeURIComponent(cleanCode)}`;
  return `${window.location.origin}/?ref=${encodeURIComponent(cleanCode)}`;
}

export function getPendingReferralCode(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeReferralCode(localStorage.getItem(PENDING_REFERRAL_KEY));
  } catch {
    return '';
  }
}

export function setPendingReferralCode(code: string): void {
  const clean = normalizeReferralCode(code);
  if (typeof window === 'undefined') return;
  try {
    if (clean) {
      localStorage.setItem(PENDING_REFERRAL_KEY, clean);
    } else {
      localStorage.removeItem(PENDING_REFERRAL_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearPendingReferralCode(): void {
  setPendingReferralCode('');
}

export function captureReferralCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    const code = normalizeReferralCode(params.get('ref'));
    if (code && code.length >= 4) {
      setPendingReferralCode(code);
      return code;
    }
  } catch {
    // Ignore URL parse issues
  }
  return '';
}

function readDirectory(): Record<string, ReferralDirectoryEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REFERRAL_DIRECTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function registerCodeInDirectory(entry: ReferralDirectoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const dir = readDirectory();
    dir[normalizeReferralCode(entry.code)] = {
      ...entry,
      code: normalizeReferralCode(entry.code),
    };
    localStorage.setItem(REFERRAL_DIRECTORY_KEY, JSON.stringify(dir));
  } catch {
    // Ignore
  }
}

function readLocalClaims(): ReferralClaimRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REFERRAL_CLAIMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalClaim(claim: ReferralClaimRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = readLocalClaims().filter(
      (item) => item.referredUserId !== claim.referredUserId
    );
    localStorage.setItem(REFERRAL_CLAIMS_KEY, JSON.stringify([claim, ...existing].slice(0, 50)));
  } catch {
    // Ignore
  }
}

function emitReferralAndLoyaltySync(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(REFERRAL_UPDATED_EVENT));
  window.dispatchEvent(new CustomEvent(LOYALTY_UPDATED_EVENT));
}

export async function getReferralSummary(
  user: User,
  defaults: { thresholdPoints: number; rewardLabel: string }
): Promise<ReferralSummary> {
  const snapshot = await fetchLoyaltyAccount(user.id, defaults);
  const referralCode = normalizeReferralCode(
    snapshot.account.referral_code || buildDefaultReferralCode(user.id)
  );
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Studio Member';

  registerCodeInDirectory({
    code: referralCode,
    userId: user.id,
    displayName,
  });

  let recentReferrals: ReferralClaimRecord[] = readLocalClaims().filter(
    (c) => c.referrerUserId === user.id
  );
  let referralCount = Math.max(
    Number(snapshot.account.referral_count ?? 0),
    recentReferrals.length
  );

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referred_user_id, referrer_user_id, referral_code, referrer_points, referred_points, created_at')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        recentReferrals = data.map((row) => ({
          referredUserId: String(row.referred_user_id),
          referredLabel: 'Invited Member',
          referrerUserId: String(row.referrer_user_id),
          referralCode: String(row.referral_code),
          referrerPoints: Number(row.referrer_points) || REFERRER_BONUS_POINTS,
          referredPoints: Number(row.referred_points) || REFERRED_BONUS_POINTS,
          createdAt: String(row.created_at),
        }));
        referralCount = Math.max(referralCount, recentReferrals.length);
      }
    } catch {
      // Keep local fallback summary if referrals table isn't created yet
    }
  }

  const totalPointsEarned = recentReferrals.reduce(
    (sum, r) => sum + (r.referrerPoints || REFERRER_BONUS_POINTS),
    0
  );

  return {
    referralCode,
    referralLink: buildReferralLink(referralCode),
    referralCount,
    totalPointsEarned: Math.max(totalPointsEarned, referralCount * REFERRER_BONUS_POINTS),
    referrerBonusPoints: REFERRER_BONUS_POINTS,
    referredBonusPoints: REFERRED_BONUS_POINTS,
    recentReferrals,
  };
}

export async function regenerateReferralCode(
  user: User,
  defaults: { thresholdPoints: number; rewardLabel: string }
): Promise<string> {
  const randomToken = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'A');
  const nextCode = `AUR-${randomToken}`;
  const current = loadLocalAccount(user.id, defaults);

  saveLocalAccount({
    ...current,
    referral_code: nextCode,
    updated_at: new Date().toISOString(),
  });

  if (supabase) {
    try {
      await supabase
        .from('loyalty_accounts')
        .upsert(
          {
            user_id: user.id,
            referral_code: nextCode,
            threshold_points: current.threshold_points || defaults.thresholdPoints,
            reward_label: current.reward_label || defaults.rewardLabel,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    } catch {
      // Keep local override if Supabase column isn't synced yet
    }
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Studio Member';

  registerCodeInDirectory({
    code: nextCode,
    userId: user.id,
    displayName,
  });

  emitReferralAndLoyaltySync();
  return nextCode;
}

export async function awardReferralPointsOnSignup({
  newUser,
  referralCode,
  defaults,
}: {
  newUser: User;
  referralCode: string;
  defaults: { thresholdPoints: number; rewardLabel: string };
}): Promise<ReferralAwardOutcome> {
  const cleanCode = normalizeReferralCode(referralCode);
  if (!cleanCode) {
    return {
      awarded: false,
      reason: 'No referral code supplied.',
      referrerPoints: 0,
      referredPoints: 0,
    };
  }

  const newMemberName =
    (newUser.user_metadata?.full_name as string | undefined) ||
    newUser.email?.split('@')[0] ||
    'New Member';

  // 1. Try authoritative Supabase RPC + server trigger check first
  if (supabase) {
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('claim_referral_reward', {
        p_referral_code: cleanCode,
      });

      if (!rpcError && rpcResult && typeof rpcResult === 'object') {
        const resultObj = rpcResult as Record<string, unknown>;
        if (resultObj.awarded === true) {
          clearPendingReferralCode();
          emitReferralAndLoyaltySync();
          return {
            awarded: true,
            referrerPoints: Number(resultObj.referrer_points) || REFERRER_BONUS_POINTS,
            referredPoints: Number(resultObj.referred_points) || REFERRED_BONUS_POINTS,
            source: 'supabase',
          };
        }

        if (resultObj.reason === 'already_claimed') {
          // Verify if the signup auth trigger already credited both accounts cleanly
          const { data: existingClaim } = await supabase
            .from('referrals')
            .select('referrer_points, referred_points, referral_code')
            .eq('referred_user_id', newUser.id)
            .maybeSingle();

          clearPendingReferralCode();
          emitReferralAndLoyaltySync();
          return {
            awarded: Boolean(existingClaim),
            alreadyClaimed: true,
            referrerPoints: existingClaim?.referrer_points ?? REFERRER_BONUS_POINTS,
            referredPoints: existingClaim?.referred_points ?? REFERRED_BONUS_POINTS,
            source: 'supabase',
          };
        }

        if (resultObj.reason === 'self_referral') {
          clearPendingReferralCode();
          return {
            awarded: false,
            reason: 'Self-referrals are not eligible for bonus points.',
            referrerPoints: 0,
            referredPoints: 0,
            source: 'supabase',
          };
        }
      }
    } catch {
      // Fall through to resilient local / loyaltyService attribution
    }
  }

  // 2. Resilient local attribution via LoyaltyPointManager & loyaltyService
  const existingClaims = readLocalClaims();
  const duplicate = existingClaims.find((c) => c.referredUserId === newUser.id);
  if (duplicate) {
    clearPendingReferralCode();
    return {
      awarded: false,
      alreadyClaimed: true,
      referrerPoints: duplicate.referrerPoints,
      referredPoints: duplicate.referredPoints,
      source: 'local',
    };
  }

  const directory = readDirectory();
  const referrerEntry = directory[cleanCode];

  if (referrerEntry && referrerEntry.userId === newUser.id) {
    clearPendingReferralCode();
    return {
      awarded: false,
      reason: 'Self-referrals are not eligible for bonus points.',
      referrerPoints: 0,
      referredPoints: 0,
      source: 'local',
    };
  }

  const referrerUserId = referrerEntry?.userId || `referrer-${cleanCode}`;

  // Award points to the new customer via LoyaltyPointManager service
  await recordLoyaltyEvent(newUser.id, {
    type: 'referral',
    label: `Welcome Referral Bonus (${cleanCode})`,
    pointsDelta: REFERRED_BONUS_POINTS,
    referredBy: referrerUserId,
    defaults,
  });

  // Award points to the referring customer if their user ID is known locally
  if (referrerEntry?.userId) {
    await recordLoyaltyEvent(referrerEntry.userId, {
      type: 'referral',
      label: `Referral Bonus: ${newMemberName} Joined`,
      pointsDelta: REFERRER_BONUS_POINTS,
      incrementReferrals: true,
      defaults,
    });
  }

  saveLocalClaim({
    referredUserId: newUser.id,
    referredLabel: newMemberName,
    referrerUserId,
    referralCode: cleanCode,
    referrerPoints: REFERRER_BONUS_POINTS,
    referredPoints: REFERRED_BONUS_POINTS,
    createdAt: new Date().toISOString(),
  });

  clearPendingReferralCode();
  emitReferralAndLoyaltySync();

  return {
    awarded: true,
    referrerPoints: REFERRER_BONUS_POINTS,
    referredPoints: REFERRED_BONUS_POINTS,
    source: 'local',
  };
}
