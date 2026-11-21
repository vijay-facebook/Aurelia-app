import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AdminAuthLayout } from './AdminAuthLayout';
import {
  checkInitialAdminSetupAvailable,
  registerFirstAdmin,
} from './adminAuthService';

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSetupKey, setShowSetupKey] = useState(false);

  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    checkInitialAdminSetupAvailable()
      .then((res) => {
        if (!active) return;
        setSetupAvailable(res.setupAvailable);
        if (res.error) setStatusError(res.error);
      })
      .finally(() => {
        if (active) setCheckingSetup(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }
    if (!setupKey.trim()) {
      setError('Admin Setup / Invitation Key is required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await registerFirstAdmin({
        fullName,
        email,
        password,
        setupKey,
      });

      setSuccess('First administrator account created. Redirecting to sign in…');
      setTimeout(() => {
        navigate('/admin/login', {
          replace: true,
          state: {
            email: created.email,
            success: 'Administrator account registered successfully. Sign in to access the Admin Panel.',
          },
        });
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to complete administrator registration.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthLayout
      title="First Admin Setup"
      subtitle="Initialize the primary Salon Administrator account using your server-issued setup key."
      icon={<ShieldCheck className="w-5 h-5" />}
      footer={
        <span>
          Already registered?{' '}
          <Link to="/admin/login" className="text-[#58A6FF] hover:underline font-medium">
            Sign In to Admin
          </Link>
        </span>
      }
    >
      {checkingSetup ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-[#8B949E]">
          <Loader2 className="w-5 h-5 animate-spin text-[#58A6FF]" />
          <span>Checking administrator setup eligibility…</span>
        </div>
      ) : !setupAvailable ? (
        <div className="space-y-4">
          <div
            role="alert"
            className="p-4 bg-amber-950/40 border border-amber-500/30 text-amber-100 text-xs rounded-lg space-y-1.5"
          >
            <div className="flex items-center gap-2 font-medium text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Initial Admin Registration Locked</span>
            </div>
            <p className="text-[#C9D1D9] leading-relaxed">
              {statusError
                ? statusError
                : 'An administrator account already exists. Public first-admin registration is permanently disabled, and additional admins must be provisioned through a protected invitation workflow.'}
            </p>
          </div>

          <Link
            to="/admin/login"
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span>Return to Admin Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
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
                htmlFor="admin-signup-name"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Elena Rostova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-signup-email"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="owner@aureliastudio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-signup-password"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-11 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F2F4F8] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-signup-confirm-password"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-11 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
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

            <div className="space-y-1.5">
              <label
                htmlFor="admin-signup-key"
                className="block text-xs font-medium text-[#C9D1D9]"
              >
                Admin Setup / Invitation Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-signup-key"
                  type={showSetupKey ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  placeholder="Enter server ADMIN_SIGNUP_SECRET"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-11 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupKey((prev) => !prev)}
                  aria-label={showSetupKey ? 'Hide setup key' : 'Show setup key'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F2F4F8] p-1 cursor-pointer"
                >
                  {showSetupKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Administrator…</span>
                </>
              ) : (
                <>
                  <span>Create First Admin Account</span>
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
