import React, { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Gift } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  HISTORY_UPDATED_EVENT,
  calculateLoyaltySummary,
  loadBookingHistory,
  loadRedeemedLoyaltyPoints,
  redeemLoyaltyReward,
} from '../utils/bookingHistory';

interface LoyaltyPointsTrackerProps {
  variant?: 'light' | 'dark';
  justEarnedPoints?: number;
  rewardApplied?: boolean;
  onApplyReward?: (rewardLabel: string) => void;
}

export const LoyaltyPointsTracker: React.FC<LoyaltyPointsTrackerProps> = ({
  variant = 'light',
  justEarnedPoints = 0,
  rewardApplied = false,
  onApplyReward,
}) => {
  const { config } = useConfig();
  const [history, setHistory] = useState(() => loadBookingHistory());
  const [redeemedPoints, setRedeemedPoints] = useState(() => loadRedeemedLoyaltyPoints());

  useEffect(() => {
    const sync = () => {
      setHistory(loadBookingHistory());
      setRedeemedPoints(loadRedeemedLoyaltyPoints());
    };
    window.addEventListener(HISTORY_UPDATED_EVENT, sync);
    return () => window.removeEventListener(HISTORY_UPDATED_EVENT, sync);
  }, []);

  const enabled = config.booking.loyaltyEnabled !== false;
  const pointsPerAppointment = config.booking.pointsPerAppointment ?? 100;
  const rewardThresholdPoints = config.booking.rewardThresholdPoints ?? 500;
  const rewardLabel =
    (config.booking.rewardLabel || '').trim() ||
    'Complimentary Studio Blowout or 20% Off Next Ritual';

  const summary = useMemo(
    () =>
      calculateLoyaltySummary(
        history,
        pointsPerAppointment,
        rewardThresholdPoints,
        redeemedPoints
      ),
    [history, pointsPerAppointment, rewardThresholdPoints, redeemedPoints]
  );

  if (!enabled) return null;

  const isDark = variant === 'dark';
  const remainingVisits = Math.ceil(summary.pointsNeeded / summary.pointsPerAppointment);
  const milestoneCount = Math.min(
    8,
    Math.max(2, Math.round(summary.rewardThresholdPoints / summary.pointsPerAppointment))
  );

  const handleClaimReward = () => {
    if (summary.unlockedRewards <= 0 || rewardApplied) return;
    redeemLoyaltyReward(summary.rewardThresholdPoints);
    onApplyReward?.(rewardLabel);
  };

  return (
    <div
      className={`rounded-[10px] border p-4 text-left space-y-3 ${
        isDark
          ? 'bg-[#15100D] border-[#D8C8B4]/25 text-[#F6F1EA]'
          : 'bg-[#EFE6DA]/70 border-[#D8C8B4] text-[#1D1612]'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#8C6A43] shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C6A43]">
            Loyalty Points
          </span>
          <span className={`text-[11px] ${isDark ? 'text-[#E3D7C7]/70' : 'text-[#6F5F51]'}`}>
            · {summary.completedAppointments}{' '}
            {summary.completedAppointments === 1 ? 'appointment' : 'appointments'}
          </span>
        </div>

        <span
          className={`text-xs font-mono font-semibold tabular-nums ${
            isDark ? 'text-[#D9B98F]' : 'text-[#1D1612]'
          }`}
        >
          {summary.pointsTowardsNext} / {summary.rewardThresholdPoints} pts
        </span>
      </div>

      {/* Just Earned Callout */}
      {justEarnedPoints > 0 && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-medium ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>+{justEarnedPoints} loyalty points added from this booking</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-label="Loyalty points progress towards next reward"
          aria-valuemin={0}
          aria-valuemax={summary.rewardThresholdPoints}
          aria-valuenow={summary.pointsTowardsNext}
          className={`w-full h-2.5 rounded-full overflow-hidden ${
            isDark ? 'bg-[#2A211B]' : 'bg-[#D8C8B4]/60'
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${summary.progressPercent}%`,
              backgroundColor: isDark ? '#D9B98F' : '#8C6A43',
            }}
          />
        </div>

        {/* Step Ticks */}
        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums opacity-75">
          {Array.from({ length: milestoneCount + 1 }).map((_, idx) => {
            const stepPoints = Math.round((summary.rewardThresholdPoints / milestoneCount) * idx);
            const reached = summary.pointsTowardsNext >= stepPoints && (idx === 0 || summary.pointsTowardsNext > 0);
            return (
              <span
                key={idx}
                className={reached ? (isDark ? 'text-[#D9B98F]' : 'text-[#8C6A43] font-semibold') : ''}
              >
                {stepPoints}
              </span>
            );
          })}
        </div>
      </div>

      {/* Next Reward & Redemption */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D8C8B4]/25">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Gift className="w-3.5 h-3.5 text-[#8C6A43] shrink-0 mt-0.5" />
          <p className={`text-[11px] leading-snug ${isDark ? 'text-[#E3D7C7]/85' : 'text-[#6F5F51]'}`}>
            {rewardApplied ? (
              <span className={isDark ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-medium'}>
                Reward applied: {rewardLabel}
              </span>
            ) : summary.unlockedRewards > 0 ? (
              <span className={isDark ? 'text-[#F6F1EA] font-medium' : 'text-[#1D1612] font-medium'}>
                Reward ready ({summary.unlockedRewards} unlocked): {rewardLabel}
              </span>
            ) : (
              <>
                <strong className={`font-mono tabular-nums ${isDark ? 'text-[#F6F1EA]' : 'text-[#1D1612]'}`}>
                  {summary.pointsNeeded} pts
                </strong>{' '}
                ({remainingVisits} more {remainingVisits === 1 ? 'visit' : 'visits'}) to unlock{' '}
                <span className={isDark ? 'text-[#F6F1EA]' : 'text-[#1D1612]'}>{rewardLabel}</span>
              </>
            )}
          </p>
        </div>

        {summary.unlockedRewards > 0 && !rewardApplied && onApplyReward && (
          <button
            type="button"
            onClick={handleClaimReward}
            className={`px-3 py-1.5 rounded-[6px] text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-[#D9B98F] text-[#1D1612] hover:bg-[#E3D7C7]'
                : 'bg-[#1D1612] text-[#F6F1EA] hover:bg-[#8C6A43]'
            }`}
          >
            Claim Reward
          </button>
        )}
      </div>
    </div>
  );
};
