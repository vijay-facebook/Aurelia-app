import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Check,
  Gift,
  History,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  LOYALTY_UPDATED_EVENT,
  LoyaltyAccountRecord,
  LoyaltyActivityItem,
  fetchLoyaltyAccount,
  recordLoyaltyEvent,
} from '../services/loyaltyService';
import { REFERRAL_UPDATED_EVENT } from '../services/referralService';

interface LoyaltyDashboardProps {
  user: User;
}

type HistoryFilter = 'all' | 'earned' | 'spent';

function formatTransactionDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderActivityIcon(type: LoyaltyActivityItem['type'], pointsDelta: number) {
  if (pointsDelta < 0 || type === 'redemption') {
    return <Gift className="w-3.5 h-3.5 text-[#6F5F51]" />;
  }
  switch (type) {
    case 'referral':
      return <Users className="w-3.5 h-3.5 text-[#8C6A43]" />;
    case 'purchase':
      return <ShoppingBag className="w-3.5 h-3.5 text-[#8C6A43]" />;
    case 'engagement':
    default:
      return <Sparkles className="w-3.5 h-3.5 text-[#8C6A43]" />;
  }
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ user }) => {
  const { config } = useConfig();

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
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
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
      // Ignore aborted or transient fetch errors on unmount
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user.id, rewardThresholdPoints, rewardLabel]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handleSync = () => {
      void loadDashboard();
    };
    window.addEventListener(LOYALTY_UPDATED_EVENT, handleSync);
    window.addEventListener(REFERRAL_UPDATED_EVENT, handleSync);
    return () => {
      window.removeEventListener(LOYALTY_UPDATED_EVENT, handleSync);
      window.removeEventListener(REFERRAL_UPDATED_EVENT, handleSync);
    };
  }, [loadDashboard]);

  const { totalEarned, totalSpent, filteredActivities } = useMemo(() => {
    let earned = 0;
    let spent = 0;
    for (const item of activities) {
      if (item.pointsDelta >= 0) {
        earned += item.pointsDelta;
      } else {
        spent += Math.abs(item.pointsDelta);
      }
    }

    const effectiveEarned = Math.max(earned, account.available_points + spent);
    const matching = activities.filter((item) => {
      if (filter === 'earned') return item.pointsDelta >= 0;
      if (filter === 'spent') return item.pointsDelta < 0;
      return true;
    });

    return {
      totalEarned: effectiveEarned,
      totalSpent: spent,
      filteredActivities: matching,
    };
  }, [activities, account.available_points, filter]);

  const threshold = Math.max(1, account.threshold_points || rewardThresholdPoints);
  const nextRewardTitle = account.reward_label || rewardLabel;
  const canRedeem = account.available_points >= threshold;
  const pointsIntoCurrentTier = canRedeem ? threshold : account.available_points % threshold;
  const progressPercent = canRedeem
    ? 100
    : Math.min(100, Math.round((pointsIntoCurrentTier / threshold) * 100));
  const pointsRemaining = canRedeem ? 0 : Math.max(0, threshold - pointsIntoCurrentTier);

  const handleRedeem = async () => {
    if (!canRedeem || isRedeeming) return;
    setRedeemError(null);
    setRedeemFeedback(null);
    setIsRedeeming(true);
    try {
      const snapshot = await recordLoyaltyEvent(user.id, {
        type: 'redemption',
        label: `Redeemed: ${nextRewardTitle}`,
        pointsDelta: -threshold,
        defaults: { thresholdPoints: rewardThresholdPoints, rewardLabel },
      });
      setAccount(snapshot.account);
      setActivities(snapshot.activities);
      setRedeemFeedback(`Reward unlocked & redeemed (-${threshold} pts).`);
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : 'Unable to redeem reward right now.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <section
      aria-labelledby="loyalty-dashboard-heading"
      className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-4 space-y-4 text-xs"
    >
      {/* Header & Total Points Balance */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#1D1612] text-[#D9B98F] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4
              id="loyalty-dashboard-heading"
              className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold"
            >
              Loyalty Dashboard
            </h4>
            <p className="text-[11px] text-[#6F5F51]">
              {account.completed_appointments}{' '}
              {account.completed_appointments === 1 ? 'studio visit' : 'studio visits'} completed
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            data-testid="loyalty-total-points"
            className="font-mono text-3xl font-medium text-[#1D1612] tabular-nums leading-none block"
          >
            {isLoading ? '—' : account.available_points}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#8C6A43] mt-1 block">
            Total Points
          </span>
        </div>
      </div>

      {/* Earned vs. Spent Breakdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] px-3 py-2.5 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] block">
              Earned
            </span>
            <span className="font-mono text-base font-medium text-[#8C6A43] tabular-nums">
              {isLoading ? '—' : `+${totalEarned}`}
            </span>
          </div>
          <ArrowDownLeft className="w-4 h-4 text-[#8C6A43] shrink-0" />
        </div>

        <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] px-3 py-2.5 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] block">
              Spent
            </span>
            <span className="font-mono text-base font-medium text-[#1D1612] tabular-nums">
              {isLoading ? '—' : totalSpent > 0 ? `-${totalSpent}` : '0'}
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#6F5F51] shrink-0" />
        </div>
      </div>

      {/* Progress Bar Toward Next Reward */}
      <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-[#1D1612] font-medium flex items-center gap-1.5 min-w-0">
            <Gift className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
            <span className="truncate">Next Reward: {nextRewardTitle}</span>
          </span>
          <span className="font-mono text-[10px] text-[#8C6A43] font-semibold tabular-nums shrink-0">
            {progressPercent}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Progress toward next loyalty reward"
          aria-valuemin={0}
          aria-valuemax={threshold}
          aria-valuenow={pointsIntoCurrentTier}
          className="w-full h-2.5 rounded-full bg-[#D8C8B4]/70 overflow-hidden"
        >
          <div
            className="h-full bg-[#8C6A43] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-[#6F5F51]">
            {canRedeem
              ? `Reward ready! (${account.available_points} / ${threshold} pts)`
              : `${pointsRemaining} more pts needed (${pointsIntoCurrentTier} / ${threshold} pts)`}
          </span>

          {canRedeem && (
            <button
              type="button"
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="px-3 py-1 rounded-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-60"
            >
              {isRedeeming ? 'Redeeming…' : `Redeem (-${threshold})`}
            </button>
          )}
        </div>
      </div>

      {redeemError && (
        <div
          role="alert"
          className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3 py-2 rounded-[6px] text-[11px]"
        >
          {redeemError}
        </div>
      )}

      {redeemFeedback && (
        <div
          role="status"
          className="bg-[#F6F1EA] border border-[#8C6A43]/40 text-[#1D1612] px-3 py-2 rounded-[6px] text-[11px] flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
          <span>{redeemFeedback}</span>
        </div>
      )}

      {/* History of Earned & Spent Points */}
      <div className="space-y-2.5 pt-1 border-t border-[#D8C8B4]/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Points History</span>
          </span>

          <div className="flex items-center gap-1" role="tablist" aria-label="Filter points history">
            {(['all', 'earned', 'spent'] as HistoryFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-[#1D1612] text-[#F6F1EA]'
                    : 'bg-[#F6F1EA] text-[#6F5F51] hover:text-[#1D1612] border border-[#D8C8B4]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="bg-[#F6F1EA]/70 border border-[#D8C8B4]/60 rounded-[6px] px-3 py-4 text-center text-[11px] text-[#6F5F51]">
            {filter === 'spent'
              ? 'No spent points yet. Redeem rewards once you reach the milestone.'
              : filter === 'earned'
                ? 'No earned points recorded yet. Book a ritual, check in, or refer a friend.'
                : 'No points activity yet. Your bookings, referrals, and redemptions appear here.'}
          </div>
        ) : (
          <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {filteredActivities.map((item) => {
              const isPositive = item.pointsDelta >= 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 bg-[#F6F1EA] px-3 py-2 rounded-[6px] border border-[#D8C8B4]/70"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#EFE6DA] border border-[#D8C8B4] flex items-center justify-center shrink-0">
                      {renderActivityIcon(item.type, item.pointsDelta)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#1D1612] truncate">
                        {item.label}
                      </p>
                      <span className="text-[10px] text-[#6F5F51]">
                        {formatTransactionDate(item.createdAt)} •{' '}
                        {isPositive ? 'Earned' : 'Spent'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                      isPositive ? 'text-[#8C6A43]' : 'text-[#1D1612]'
                    }`}
                  >
                    {isPositive ? `+${item.pointsDelta}` : item.pointsDelta} pts
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
