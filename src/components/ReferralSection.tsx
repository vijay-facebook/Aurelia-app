import React, { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Check, Copy, RefreshCw, Share2, Users } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { LOYALTY_UPDATED_EVENT, buildDefaultReferralCode } from '../services/loyaltyService';
import {
  REFERRAL_UPDATED_EVENT,
  REFERRER_BONUS_POINTS,
  REFERRED_BONUS_POINTS,
  ReferralSummary,
  buildReferralLink,
  getReferralSummary,
  regenerateReferralCode,
} from '../services/referralService';

interface ReferralSectionProps {
  user: User;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
  const { config } = useConfig();

  const rewardThresholdPoints = config.booking.rewardThresholdPoints ?? 500;
  const rewardLabel =
    (config.booking.rewardLabel || '').trim() ||
    'Complimentary Studio Blowout or 20% Off Next Ritual';

  const defaultCode = buildDefaultReferralCode(user.id);

  const [summary, setSummary] = useState<ReferralSummary>({
    referralCode: defaultCode,
    referralLink: buildReferralLink(defaultCode),
    referralCount: 0,
    totalPointsEarned: 0,
    referrerBonusPoints: REFERRER_BONUS_POINTS,
    referredBonusPoints: REFERRED_BONUS_POINTS,
    recentReferrals: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextSummary = await getReferralSummary(user, {
        thresholdPoints: rewardThresholdPoints,
        rewardLabel,
      });
      if (!isMountedRef.current) return;
      setSummary(nextSummary);
    } catch {
      // Ignore aborted/cancelled referral fetches
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, rewardThresholdPoints, rewardLabel]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const onSync = () => {
      void loadSummary();
    };
    window.addEventListener(REFERRAL_UPDATED_EVENT, onSync);
    window.addEventListener(LOYALTY_UPDATED_EVENT, onSync);
    return () => {
      window.removeEventListener(REFERRAL_UPDATED_EVENT, onSync);
      window.removeEventListener(LOYALTY_UPDATED_EVENT, onSync);
    };
  }, [loadSummary]);

  const handleCopyToClipboard = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(summary.referralLink);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = summary.referralLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      setStatusMessage('Referral link copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMessage('Unable to copy automatically. Select the link above and copy manually.');
    }
  };

  const handleShareInvite = async () => {
    const shareText = `Join me at ${config.brand.name} and receive +${summary.referredBonusPoints} Welcome Loyalty Points on signup: ${summary.referralLink}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${config.brand.name} Referral Invite`,
          text: shareText,
          url: summary.referralLink,
        });
        return;
      } catch {
        // Fall back to clipboard when Web Share is unavailable or dismissed
      }
    }

    await handleCopyToClipboard();
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const nextCode = await regenerateReferralCode(user, {
        thresholdPoints: rewardThresholdPoints,
        rewardLabel,
      });
      setSummary((prev) => ({
        ...prev,
        referralCode: nextCode,
        referralLink: buildReferralLink(nextCode),
      }));
      setStatusMessage(`Generated new referral code: ${nextCode}`);
    } catch {
      setErrorMessage('Could not generate a new referral code right now.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <section
      aria-labelledby="profile-referral-heading"
      className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-4 space-y-3.5 text-xs"
    >
      {/* Header & Code Badge */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1D1612] text-[#D9B98F] flex items-center justify-center shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4
              id="profile-referral-heading"
              className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold"
            >
              Refer &amp; Earn Rewards
            </h4>
            <p className="text-[11px] text-[#6F5F51] mt-0.5 leading-snug">
              Earn{' '}
              <strong className="font-mono text-[#1D1612]">
                +{summary.referrerBonusPoints} pts
              </strong>{' '}
              and gift your friend{' '}
              <strong className="font-mono text-[#1D1612]">
                +{summary.referredBonusPoints} pts
              </strong>{' '}
              when they join with your link.
            </p>
          </div>
        </div>

        <span className="font-mono text-[10px] font-semibold text-[#1D1612] bg-[#F6F1EA] border border-[#D8C8B4] px-2 py-1 rounded-[4px] shrink-0">
          {summary.referralCode}
        </span>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] px-3 py-2.5">
          <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] block">
            Friends Joined
          </span>
          <span className="font-mono text-lg font-medium text-[#1D1612] tabular-nums">
            {isLoading ? '—' : summary.referralCount}
          </span>
        </div>

        <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[8px] px-3 py-2.5">
          <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] block">
            Points Earned
          </span>
          <span className="font-mono text-lg font-medium text-[#8C6A43] tabular-nums">
            {isLoading ? '—' : `+${summary.totalPointsEarned}`}
          </span>
        </div>
      </div>

      {/* Unique Referral Link + Copy to Clipboard */}
      <div className="space-y-2">
        <label
          htmlFor="user-referral-link-input"
          className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block"
        >
          Your Unique Referral Link
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            id="user-referral-link-input"
            type="text"
            readOnly
            value={summary.referralLink}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 bg-[#F6F1EA] text-[#1D1612] px-3 py-2.5 rounded-[6px] border border-[#D8C8B4] text-[11px] font-mono focus:outline-none focus:border-[#8C6A43]"
          />
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="inline-flex items-center justify-center gap-1.5 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-3.5 py-2.5 rounded-[6px] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D9B98F]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#D9B98F]" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3 py-2 rounded-[6px] text-[11px]"
        >
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="bg-[#F6F1EA] border border-[#8C6A43]/40 text-[#1D1612] px-3 py-2 rounded-[6px] text-[11px] flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D8C8B4]/60">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6F5F51] hover:text-[#1D1612] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Generate New Link</span>
        </button>

        <button
          type="button"
          onClick={handleShareInvite}
          className="inline-flex items-center gap-1.5 bg-[#F6F1EA] hover:bg-[#E3D7C7] text-[#1D1612] border border-[#D8C8B4] px-3 py-1.5 rounded-[6px] text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
        >
          <Share2 className="w-3 h-3 text-[#8C6A43]" />
          <span>Share Invite</span>
        </button>
      </div>
    </section>
  );
};
