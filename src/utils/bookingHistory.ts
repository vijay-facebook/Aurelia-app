import { supabase } from '../lib/supabase';

export interface BookingHistoryEntry {
  id: string;
  services: string[];
  date?: string;
  timeSlot?: string;
  bookedAt: string;
  customerName?: string;
  bookingRef?: string;
  meetUrl?: string;
  meetStylist?: string;
  meetTopic?: string;
  meetAttachedAt?: string;
}

export interface GuestPreferences {
  focusGoals: string[];
  sessionVibe: 'express' | 'ritual' | 'indulgence';
  budgetTier: 'all' | 'under-3000' | 'mid-tier';
  preferredTime: 'Morning' | 'Afternoon' | 'Evening';
}

const HISTORY_STORAGE_KEY = 'aurelia_booking_history_v1';
const PREFS_STORAGE_KEY = 'aurelia_guest_preferences_v1';
export const HISTORY_UPDATED_EVENT = 'aurelia:booking-history-updated';

export const DEFAULT_PREFERENCES: GuestPreferences = {
  focusGoals: ['Hair Artistry', 'Skin Radiance'],
  sessionVibe: 'ritual',
  budgetTier: 'all',
  preferredTime: 'Afternoon',
};

export function normalizeGoogleMeetUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith('meet.google.com/')
      ? `https://${trimmed}`
      : trimmed;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('meet.google.com')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function loadBookingHistory(): BookingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordBookingHistory(
  entry: Omit<BookingHistoryEntry, 'id' | 'bookedAt'>
): BookingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const current = loadBookingHistory();
  const next: BookingHistoryEntry[] = [
    {
      id: `bk-${Date.now()}`,
      services: entry.services,
      date: entry.date,
      timeSlot: entry.timeSlot,
      customerName: entry.customerName,
      bookingRef: entry.bookingRef,
      meetUrl: entry.meetUrl,
      meetStylist: entry.meetStylist,
      meetTopic: entry.meetTopic,
      meetAttachedAt: entry.meetUrl ? entry.meetAttachedAt || new Date().toISOString() : undefined,
      bookedAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 12);

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore storage quota errors cleanly
  }

  void syncAppointmentToSupabase(next[0]);
  return next;
}

async function syncAppointmentToSupabase(item: BookingHistoryEntry): Promise<void> {
  if (!supabase || !item.bookingRef) return;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;
    await supabase.from('bookings').upsert(
      {
        user_id: userId,
        booking_ref: item.bookingRef,
        services: item.services,
        appointment_date: item.date || 'Flexible',
        time_slot: item.timeSlot || '10:30 AM',
        status: 'confirmed',
      },
      { onConflict: 'booking_ref' }
    );
  } catch {
    // Non-blocking sync when Supabase tables/policies are provisioned
  }
}

export function attachMeetLinkToAppointment(
  appointmentId: string,
  details: {
    meetUrl: string;
    meetStylist?: string;
    meetTopic?: string;
  }
): BookingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const current = loadBookingHistory();
  const now = new Date().toISOString();
  let updated = false;

  const next = current.map((item) => {
    if (item.id !== appointmentId) return item;
    updated = true;
    return {
      ...item,
      meetUrl: details.meetUrl,
      meetStylist: details.meetStylist || item.meetStylist,
      meetTopic: details.meetTopic || item.meetTopic,
      meetAttachedAt: now,
    };
  });

  if (!updated) return current;

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore storage quota errors cleanly
  }
  return next;
}

export function removeMeetLinkFromAppointment(appointmentId: string): BookingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const current = loadBookingHistory();
  const next = current.map((item) => {
    if (item.id !== appointmentId) return item;
    const rest = { ...item };
    delete rest.meetUrl;
    delete rest.meetStylist;
    delete rest.meetTopic;
    delete rest.meetAttachedAt;
    return rest;
  });

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore
  }
  return next;
}

export function clearBookingHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore
  }
}

export function loadGuestPreferences(): GuestPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      focusGoals:
        Array.isArray(parsed?.focusGoals) && parsed.focusGoals.length > 0
          ? parsed.focusGoals
          : DEFAULT_PREFERENCES.focusGoals,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveGuestPreferences(prefs: GuestPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

const REDEEMED_POINTS_KEY = 'aurelia_loyalty_redeemed_points_v1';

export interface LoyaltySummary {
  completedAppointments: number;
  pointsPerAppointment: number;
  rewardThresholdPoints: number;
  totalEarnedPoints: number;
  redeemedPoints: number;
  availablePoints: number;
  pointsTowardsNext: number;
  pointsNeeded: number;
  progressPercent: number;
  unlockedRewards: number;
}

export function loadRedeemedLoyaltyPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(REDEEMED_POINTS_KEY);
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch {
    return 0;
  }
}

export function redeemLoyaltyReward(thresholdPoints: number): number {
  if (typeof window === 'undefined') return 0;
  const current = loadRedeemedLoyaltyPoints();
  const next = current + Math.max(1, thresholdPoints);
  try {
    localStorage.setItem(REDEEMED_POINTS_KEY, String(next));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore
  }
  return next;
}

export function clearLoyaltyRedemptions(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(REDEEMED_POINTS_KEY);
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    // Ignore
  }
}

export function calculateLoyaltySummary(
  history: BookingHistoryEntry[],
  pointsPerAppointment = 100,
  rewardThresholdPoints = 500,
  redeemedPoints = loadRedeemedLoyaltyPoints()
): LoyaltySummary {
  const ptsPerVisit = Math.max(1, pointsPerAppointment);
  const threshold = Math.max(ptsPerVisit, rewardThresholdPoints);
  const completedAppointments = history.length;
  const totalEarnedPoints = completedAppointments * ptsPerVisit;
  const safeRedeemed = Math.min(totalEarnedPoints, Math.max(0, redeemedPoints));
  const availablePoints = Math.max(0, totalEarnedPoints - safeRedeemed);
  const unlockedRewards = Math.floor(availablePoints / threshold);
  const pointsTowardsNext =
    unlockedRewards > 0 && availablePoints % threshold === 0
      ? threshold
      : availablePoints % threshold;
  const pointsNeeded =
    unlockedRewards > 0 && availablePoints % threshold === 0
      ? 0
      : Math.max(0, threshold - pointsTowardsNext);
  const progressPercent = Math.min(
    100,
    Math.round((pointsTowardsNext / threshold) * 100)
  );

  return {
    completedAppointments,
    pointsPerAppointment: ptsPerVisit,
    rewardThresholdPoints: threshold,
    totalEarnedPoints,
    redeemedPoints: safeRedeemed,
    availablePoints,
    pointsTowardsNext,
    pointsNeeded,
    progressPercent,
    unlockedRewards,
  };
}
