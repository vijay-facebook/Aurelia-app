import React, { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Award,
  Check,
  Gift,
  PlusCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { HISTORY_UPDATED_EVENT } from '../utils/bookingHistory';
import { SERVICE_FEEDBACK_UPDATED_EVENT } from '../utils/serviceReviews';
import {
  LOYALTY_UPDATED_EVENT,
  LoyaltyAccountRecord,
  LoyaltyActivityItem,
  fetchLoyaltyAccount,
  recordLoyaltyEvent,
} from '../services/loyaltyService';
import { REFERRAL_UPDATED_EVENT } from '../services/referralService';

interface LoyaltyPointManagerProps {
  user: User;
  hideSummary?: boolean;
}

function formatActivityDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const LoyaltyPointManager: React.FC<LoyaltyPointManagerProps> = ({
  user,
  hideSummary = false,
}) => {
  const { config } = useConfig();

  const pointsPerAppointment = config.booking.pointsPerAppointment ?? 100;
  const rewardThresholdPoints = config.booking.rewardThresholdPoints ?? 500;
  const rewardLabel =
    (config.booking.rewardLabel || '').trim() ||
    'Complimentary Studio Blowout or 20% Off Next Ritual';

  const [account, setAccount] = useState<LoyaltyAccountRecord>({
    user_id: user.id,
    completed_appointments: 0,
    available_points: 0,
    threshold_points: rewardThresholdPoints,
    reward_label: rewardLabel,
  });
  const [activities, setActivities] = useState<LoyaltyActivityItem[]>([]);
  const [purchaseNote, setPurchaseNote] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await fetchLoyaltyAccount(user.id, {
        thresholdPoints: rewardThresholdPoints,
        rewardLabel,
      });
      if (!isMountedRef.current) return;
      setAccount(snapshot.account);
      setActivities(snapshot.activities);
    } catch {
      // Ignore aborted/cancelled account fetches
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user.id, rewardThresholdPoints, rewardLabel]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    const onBookingCreated = () => {
      void recordLoyaltyEvent(user.id, {
        type: 'purchase',
        label: 'Studio Appointment Booked',
        pointsDelta: pointsPerAppointment,
        incrementAppointments: true,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      })
        .then((snapshot) => {
          if (!isMountedRef.current) return;
          setAccount(snapshot.account);
          setActivities(snapshot.activities);
        })
        .catch(() => {});
    };

    const onServiceReviewLeft = () => {
      void recordLoyaltyEvent(user.id, {
        type: 'engagement',
        label: 'Service Feedback Submitted',
        pointsDelta: 25,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      })
        .then((snapshot) => {
          if (!isMountedRef.current) return;
          setAccount(snapshot.account);
          setActivities(snapshot.activities);
        })
        .catch(() => {});
    };

    const onLoyaltySync = () => {
      void loadAccount();
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, onBookingCreated);
    window.addEventListener(SERVICE_FEEDBACK_UPDATED_EVENT, onServiceReviewLeft);
    window.addEventListener(LOYALTY_UPDATED_EVENT, onLoyaltySync);
    window.addEventListener(REFERRAL_UPDATED_EVENT, onLoyaltySync);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, onBookingCreated);
      window.removeEventListener(SERVICE_FEEDBACK_UPDATED_EVENT, onServiceReviewLeft);
      window.removeEventListener(LOYALTY_UPDATED_EVENT, onLoyaltySync);
      window.removeEventListener(REFERRAL_UPDATED_EVENT, onLoyaltySync);
    };
  }, [user.id, pointsPerAppointment, rewardThresholdPoints, rewardLabel, loadAccount]);

  const handleLogPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);
    setIsUpdating(true);

    try {
      const parsedAmount = Number(purchaseAmount);
      const earnedPoints =
        Number.isFinite(parsedAmount) && parsedAmount > 0
          ? Math.max(10, Math.round(parsedAmount / 50))
          : pointsPerAppointment;
      const label = purchaseNote.trim()
        ? `${purchaseNote.trim()}${parsedAmount > 0 ? ` (${config.brand.currencySymbol}${parsedAmount})` : ''}`
        : parsedAmount > 0
          ? `Studio Purchase (${config.brand.currencySymbol}${parsedAmount})`
          : 'Studio Service Purchase';

      const snapshot = await recordLoyaltyEvent(user.id, {
        type: 'purchase',
        label,
        pointsDelta: earnedPoints,
        incrementAppointments: true,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      });

      setAccount(snapshot.account);
      setActivities(snapshot.activities);
      setPurchaseNote('');
      setPurchaseAmount('');
      setFeedbackMsg(`Added +${earnedPoints} loyalty points.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to record points.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackEngagement = async (label: string, points: number) => {
    setErrorMsg(null);
    setFeedbackMsg(null);
    setIsUpdating(true);
    try {
      const snapshot = await recordLoyaltyEvent(user.id, {
        type: 'engagement',
        label,
        pointsDelta: points,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      });
      setAccount(snapshot.account);
      setActivities(snapshot.activities);
      setFeedbackMsg(`Earned +${points} pts for ${label}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to record engagement.');
    } finally {
      setIsUpdating(false);
    }
  };

  const threshold = Math.max(1, account.threshold_points || rewardThresholdPoints);
  const canRedeem = account.available_points >= threshold;
  const pointsTowardNext = account.available_points % threshold;
  const progressPercent = canRedeem
    ? 100
    : Math.min(100, Math.round((pointsTowardNext / threshold) * 100));
  const pointsRemaining = canRedeem ? 0 : Math.max(0, threshold - pointsTowardNext);

  const handleRedeemReward = async () => {
    if (!canRedeem || isUpdating) return;
    setErrorMsg(null);
    setFeedbackMsg(null);
    setIsUpdating(true);
    try {
      const snapshot = await recordLoyaltyEvent(user.id, {
        type: 'redemption',
        label: `Redeemed: ${account.reward_label || rewardLabel}`,
        pointsDelta: -threshold,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      });
      setAccount(snapshot.account);
      setActivities(snapshot.activities);
      setFeedbackMsg(`Reward redeemed (-${threshold} pts).`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to redeem reward.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-4 space-y-4 text-xs">
      {!hideSummary && (
        <>
          {/* Header & Current Points */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1D1612] text-[#D9B98F] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold block">
                  Loyalty Points
                </span>
                <p className="text-[11px] text-[#6F5F51]">
                  {account.completed_appointments}{' '}
                  {account.completed_appointments === 1 ? 'visit' : 'visits'} recorded
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-2xl font-medium text-[#1D1612] tabular-nums">
                {isLoading ? '—' : account.available_points}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C6A43] block">
                Current Pts
              </span>
            </div>
          </div>

          {/* Progress Bar Towards Next Reward */}
          <div className="space-y-1.5">
            <div
              role="progressbar"
              aria-label="Member loyalty points progress"
              aria-valuemin={0}
              aria-valuemax={threshold}
              aria-valuenow={canRedeem ? threshold : pointsTowardNext}
              className="w-full h-2 rounded-full bg-[#D8C8B4]/70 overflow-hidden"
            >
              <div
                className="h-full bg-[#8C6A43] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[#6F5F51] flex items-center gap-1 min-w-0">
                <Gift className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
                <span className="truncate">
                  {canRedeem
                    ? `Unlocked: ${account.reward_label || rewardLabel}`
                    : `${pointsRemaining} pts to ${account.reward_label || rewardLabel}`}
                </span>
              </span>

              {canRedeem && (
                <button
                  type="button"
                  onClick={handleRedeemReward}
                  disabled={isUpdating}
                  className="px-3 py-1 rounded-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                >
                  Redeem (-{threshold})
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {errorMsg && (
        <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3 py-2 rounded-[6px] text-[11px]">
          {errorMsg}
        </div>
      )}

      {feedbackMsg && (
        <div className="bg-[#F6F1EA] border border-[#8C6A43]/40 text-[#1D1612] px-3 py-2 rounded-[6px] text-[11px] flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-[#8C6A43]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Record Purchase or Engagement */}
      <form
        onSubmit={handleLogPurchase}
        className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] p-3 space-y-2.5"
      >
        <span className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold flex items-center gap-1.5">
          <ShoppingBag className="w-3 h-3" />
          <span>Record Purchase or Visit</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={purchaseNote}
            onChange={(e) => setPurchaseNote(e.target.value)}
            placeholder="Service or retail item"
            className="bg-[#EFE6DA] text-[#1D1612] px-2.5 py-2 rounded-[6px] border border-[#D8C8B4] text-[11px] focus:outline-none focus:border-[#8C6A43]"
          />
          <input
            type="number"
            min={0}
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            placeholder={`Amount (${config.brand.currencySymbol})`}
            className="bg-[#EFE6DA] text-[#1D1612] px-2.5 py-2 rounded-[6px] border border-[#D8C8B4] text-[11px] font-mono focus:outline-none focus:border-[#8C6A43]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-3.5 py-1.5 rounded-[6px] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer disabled:opacity-60"
          >
            <PlusCircle className="w-3 h-3 text-[#D9B98F]" />
            <span>Add Purchase Points</span>
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleTrackEngagement('Style Profile Check-In', 25)}
            className="inline-flex items-center gap-1.5 bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] border border-[#D8C8B4] px-3 py-1.5 rounded-[6px] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3 h-3 text-[#8C6A43]" />
            <span>Check-In (+25 pts)</span>
          </button>
        </div>
      </form>

      {/* Activity Feed */}
      {!hideSummary && activities.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-[#D8C8B4]/70">
          <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] font-medium block">
            Recent Points Activity
          </span>
          <ul className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {activities.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-[11px] bg-[#F6F1EA]/80 px-2.5 py-1.5 rounded-[6px] border border-[#D8C8B4]/50"
              >
                <span className="text-[#1D1612] truncate">{item.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#6F5F51] font-mono tabular-nums">
                    {formatActivityDate(item.createdAt)}
                  </span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      item.pointsDelta >= 0 ? 'text-[#8C6A43]' : 'text-[#6F5F51]'
                    }`}
                  >
                    {item.pointsDelta >= 0 ? `+${item.pointsDelta}` : item.pointsDelta}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
