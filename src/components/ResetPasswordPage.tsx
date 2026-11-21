import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { resetPassword } from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const { config } = useConfig();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(newPassword);
      setCompleted(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Unable to update password.';
      setErrorMessage(
        raw.toLowerCase().includes('environment variables are missing')
          ? 'Member accounts are currently unavailable until studio backend credentials are configured.'
          : raw
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#1D1612] font-sans flex items-center justify-center px-6 py-16">
      <div className="bg-[#EFE6DA]/60 border border-[#D8C8B4] rounded-[12px] max-w-md w-full p-8 shadow-xl space-y-6">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
            {config.brand.name} Sanctuary
          </span>
          <h1 className="font-serif text-3xl font-light text-[#1D1612]">
            Set New Password
          </h1>
          <p className="text-xs text-[#6F5F51]">
            Choose a new password for your {config.brand.name} member account.
          </p>
        </div>

        {completed ? (
          <div className="bg-[#F6F1EA] border border-[#8C6A43]/40 rounded-[8px] p-5 space-y-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#8C6A43] mx-auto" />
            <p className="text-xs text-[#1D1612] font-medium">
              Your password has been updated successfully.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Studio</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3.5 py-2.5 rounded-[6px]">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                New Password *
              </label>
              <input
                required
                minLength={6}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#F6F1EA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                Confirm New Password *
              </label>
              <input
                required
                minLength={6}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#F6F1EA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#D9B98F]" />
              <span>{isSubmitting ? 'Updating…' : 'Update Password'}</span>
            </button>

            <div className="text-center pt-1">
              <Link
                to="/"
                className="text-[11px] uppercase tracking-wider text-[#8C6A43] hover:text-[#1D1612] underline underline-offset-4"
              >
                Back to Homepage
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
