import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  LogOut,
  Mail,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  forgotPassword,
  logout,
  signIn,
  signUp,
} from '../services/authService';
import {
  REFERRED_BONUS_POINTS,
  REFERRER_BONUS_POINTS,
  awardReferralPointsOnSignup,
  getPendingReferralCode,
  normalizeReferralCode,
  setPendingReferralCode,
} from '../services/referralService';
import { LoyaltyDashboard } from './LoyaltyDashboard';
import { LoyaltyPointManager } from './LoyaltyPointManager';
import { ReferralSection } from './ReferralSection';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User | null) => void;
  onOpenBooking?: () => void;
  initialMode?: AuthMode;
  initialReferralCode?: string;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onOpenBooking,
  initialMode,
  initialReferralCode,
}) => {
  const { config } = useConfig();
  const [mode, setMode] = useState<AuthMode>(initialMode || 'signin');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(
    () => normalizeReferralCode(initialReferralCode) || getPendingReferralCode()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialMode) setMode(initialMode);
    const activeCode = normalizeReferralCode(initialReferralCode) || getPendingReferralCode();
    if (activeCode) {
      setReferralCode(activeCode);
      if (!currentUser && !initialMode) {
        setMode('signup');
      }
    }
  }, [isOpen, initialMode, initialReferralCode, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatAuthError = (err: unknown, fallback: string): string => {
    const raw = err instanceof Error ? err.message : fallback;
    if (raw.toLowerCase().includes('environment variables are missing')) {
      return 'Member accounts are currently unavailable. Please configure your studio backend credentials first.';
    }
    return raw || fallback;
  };

  const loyaltyDefaults = {
    thresholdPoints: config.booking.rewardThresholdPoints ?? 500,
    rewardLabel:
      (config.booking.rewardLabel || '').trim() ||
      'Complimentary Studio Blowout or 20% Off Next Ritual',
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await signIn(email.trim(), password);
      const signedInUser = data.user ?? null;
      if (signedInUser) {
        const pendingOrMetaCode =
          getPendingReferralCode() ||
          normalizeReferralCode(signedInUser.user_metadata?.referred_by_code as string | undefined);
        if (pendingOrMetaCode) {
          await awardReferralPointsOnSignup({
            newUser: signedInUser,
            referralCode: pendingOrMetaCode,
            defaults: loyaltyDefaults,
          });
        }
      }
      onAuthSuccess(signedInUser);
      setSuccessMessage('Welcome back to Aurelia Studio.');
      setPassword('');
    } catch (err) {
      setErrorMessage(formatAuthError(err, 'Unable to sign in. Please check your credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const cleanReferralCode = normalizeReferralCode(referralCode);
    if (cleanReferralCode) {
      setPendingReferralCode(cleanReferralCode);
    }

    try {
      const data = await signUp({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        referralCode: cleanReferralCode || undefined,
      });

      const createdUser = data.session?.user ?? data.user ?? null;

      if (data.session?.user) {
        let referralOutcomeMsg = '';
        if (cleanReferralCode) {
          const outcome = await awardReferralPointsOnSignup({
            newUser: data.session.user,
            referralCode: cleanReferralCode,
            defaults: loyaltyDefaults,
          });
          if (outcome.awarded) {
            referralOutcomeMsg = ` +${outcome.referredPoints} Welcome Bonus Points awarded (+${outcome.referrerPoints} pts to your referrer)!`;
          }
        }
        onAuthSuccess(data.session.user);
        setSuccessMessage(`Your studio account is ready.${referralOutcomeMsg}`);
      } else {
        setSuccessMessage(
          cleanReferralCode
            ? `Account created with referral code ${cleanReferralCode}! Confirm your email to activate your +${REFERRED_BONUS_POINTS} bonus points.`
            : 'Account created! Please check your email inbox to confirm your address before signing in.'
        );
        if (createdUser && !cleanReferralCode) {
          // No referral pending
        }
      }
      setPassword('');
    } catch (err) {
      setErrorMessage(formatAuthError(err, 'Unable to create your account right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await forgotPassword(email.trim());
      setSuccessMessage(
        'Password reset instructions have been sent to your email address.'
      );
    } catch (err) {
      setErrorMessage(formatAuthError(err, 'Unable to send password reset email.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await logout();
      onAuthSuccess(null);
      setSuccessMessage('Signed out safely.');
    } catch (err) {
      setErrorMessage(formatAuthError(err, 'Unable to sign out cleanly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const userFullName =
    (currentUser?.user_metadata?.full_name as string | undefined) ||
    currentUser?.email?.split('@')[0] ||
    'Studio Member';
  const userPhone = currentUser?.user_metadata?.phone as string | undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1612]/70 backdrop-blur-md font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-5 ${
          currentUser ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] rounded-full transition-colors cursor-pointer"
          aria-label="Close member account dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#1D1612] text-[#D9B98F] flex items-center justify-center font-serif text-xl">
                {userFullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
                  {config.brand.name} Member
                </span>
                <h3
                  id="member-auth-title"
                  className="font-serif text-2xl font-light text-[#1D1612]"
                >
                  {userFullName}
                </h3>
              </div>
            </div>

            <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[8px] p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[#6F5F51]">Email</span>
                <span className="text-[#1D1612] font-medium">{currentUser.email}</span>
              </div>
              {userPhone && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#6F5F51]">Phone</span>
                  <span className="text-[#1D1612] font-mono tabular-nums">{userPhone}</span>
                </div>
              )}
            </div>

            <LoyaltyDashboard user={currentUser} />

            <LoyaltyPointManager user={currentUser} hideSummary />

            <ReferralSection user={currentUser} />

            {errorMessage && (
              <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3.5 py-2.5 rounded-[6px] text-xs">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {onOpenBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="flex-1 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 px-4 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 border border-[#D8C8B4] bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] py-3 px-4 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Signing out…' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
                {config.brand.name} Sanctuary
              </span>
              <h3
                id="member-auth-title"
                className="font-serif text-3xl font-light text-[#1D1612]"
              >
                {mode === 'signin'
                  ? 'Member Sign In'
                  : mode === 'signup'
                    ? 'Create Studio Account'
                    : 'Reset Password'}
              </h3>
            </div>

            {mode !== 'forgot' && (
              <div className="flex items-center gap-2 border-b border-[#D8C8B4] pb-3 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`px-4 py-1.5 rounded-full uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#1D1612] text-[#F6F1EA]'
                      : 'bg-[#EFE6DA] text-[#6F5F51] hover:text-[#1D1612]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`px-4 py-1.5 rounded-full uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#1D1612] text-[#F6F1EA]'
                      : 'bg-[#EFE6DA] text-[#6F5F51] hover:text-[#1D1612]'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3.5 py-2.5 rounded-[6px] text-xs">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-[#EFE6DA] border border-[#8C6A43]/50 text-[#1D1612] px-3.5 py-2.5 rounded-[6px] text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6A43] shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#8C6A43] hover:text-[#1D1612] underline underline-offset-2 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#D9B98F]" />
                  <span>{isSubmitting ? 'Signing In…' : 'Sign In'}</span>
                </button>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                {referralCode && (
                  <div className="bg-[#EFE6DA] border border-[#8C6A43]/50 text-[#1D1612] px-3.5 py-2.5 rounded-[6px] text-[11px] flex items-start gap-2">
                    <Gift className="w-4 h-4 text-[#8C6A43] shrink-0 mt-0.5" />
                    <span>
                      Referral invite <strong className="font-mono">{referralCode}</strong> applied —
                      you earn <strong>+{REFERRED_BONUS_POINTS} pts</strong> and your friend earns{' '}
                      <strong>+{REFERRER_BONUS_POINTS} pts</strong> when you join.
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Password *
                  </label>
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(normalizeReferralCode(e.target.value))}
                    placeholder="AUR-XXXXXX"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] font-mono uppercase focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Creating Account…' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <p className="text-[#6F5F51] leading-relaxed">
                  Enter the email address associated with your studio account and we will send a
                  secure password reset link.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D9B98F]" />
                    <span>{isSubmitting ? 'Sending…' : 'Send Reset Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="px-4 py-3 rounded-[6px] border border-[#D8C8B4] bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] text-xs uppercase tracking-wider font-medium cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
