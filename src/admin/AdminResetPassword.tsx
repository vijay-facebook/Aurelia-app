import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { AdminAuthLayout } from './AdminAuthLayout';
import { logoutAdmin, updateAdminPassword } from './adminAuthService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AdminResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError(
        'Supabase authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
      setCheckingRecovery(false);
      return;
    }

    const client = supabase;
    let active = true;

    const inspectRecoverySession = async () => {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!active) return;
        if (session) {
          setHasRecoverySession(true);
        }
      } catch {
        // Ignore aborted/cancelled recovery checks during unmount
      } finally {
        if (active) {
          setCheckingRecovery(false);
        }
      }
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasRecoverySession(true);
        setError(null);
      }
    });

    void inspectRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (!hasRecoverySession) {
      setError(
        'No active password recovery session was detected. Request a fresh link from Forgot Password.'
      );
      return;
    }

    setLoading(true);
    try {
      await updateAdminPassword(newPassword);
      await logoutAdmin();
      setSuccess('Your administrator password has been updated. Redirecting to Sign In…');
      setTimeout(() => {
        navigate('/admin/login', {
          replace: true,
          state: {
            success: 'Password reset complete. Sign in with your new administrator password.',
          },
        });
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update administrator password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout
      title="Set New Password"
      subtitle="Choose a strong new password for your Aurelia administrator account."
      icon={<KeyRound className="w-5 h-5" />}
      footer={
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#58A6FF] hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Admin Sign In</span>
        </Link>
      }
    >
      {checkingRecovery ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-[#8B949E]">
          <Loader2 className="w-5 h-5 animate-spin text-[#58A6FF]" />
          <span>Validating recovery session…</span>
        </div>
      ) : (
        <>
          {!hasRecoverySession && !error && (
            <div
              role="alert"
              className="p-3 bg-amber-950/50 border border-amber-500/30 text-amber-200 text-xs rounded-lg space-y-1.5"
            >
              <div className="flex items-center gap-2 font-medium text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Recovery Link Required</span>
              </div>
              <p className="text-[#C9D1D9] leading-relaxed">
                Open this page using the password reset email link from Supabase, or{' '}
                <Link to="/admin/forgot-password" className="text-[#58A6FF] hover:underline">
                  request a new reset link
                </Link>
                .
              </p>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="admin-reset-new-password"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-11 py-3 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F2F4F8] p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-reset-confirm-password"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-11 py-3 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F2F4F8] p-1 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasRecoverySession}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password…</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </AdminAuthLayout>
  );
};
