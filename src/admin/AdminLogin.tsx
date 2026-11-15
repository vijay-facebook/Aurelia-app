import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { setToken } from './api';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const modeFromPath = (): AuthMode => {
  const path = window.location.pathname;
  if (path.endsWith('/signup')) return 'signup';
  if (path.endsWith('/forgot-password')) return 'forgot';
  if (path.endsWith('/reset-password')) return 'reset';
  return 'login';
};

const getRecoveryAccessToken = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const search = new URLSearchParams(window.location.search);
  return hash.get('access_token') || search.get('access_token') || '';
};

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(modeFromPath);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recoveryAccessToken = useMemo(getRecoveryAccessToken, []);
  const isResetLinkValid = mode !== 'reset' || Boolean(recoveryAccessToken);

  const switchMode = (nextMode: AuthMode) => {
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
    setMode(nextMode);
    const path = nextMode === 'login'
      ? '/admin'
      : '/admin/' + (nextMode === 'reset' ? 'reset-password' : nextMode === 'signup' ? 'signup' : 'forgot-password');
    window.history.replaceState({}, '', path + (nextMode === 'reset' ? window.location.hash : ''));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if ((mode === 'signup' || mode === 'reset') && password.length < 12) {
      setError('Use a password with at least 12 characters.');
      return;
    }
    if (mode === 'reset' && !recoveryAccessToken) {
      setError('This password reset link is invalid or expired. Request a new link.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
        setToken(data.access_token, data.refresh_token);
        onLoginSuccess();
        return;
      }

      if (mode === 'signup') {
        const response = await fetch('/api/admin/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ fullName, email, password, setupKey }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to create admin account.');
        setPassword('');
        setConfirmPassword('');
        setSetupKey('');
        setMode('login');
        window.history.replaceState({}, '', '/admin');
        setSuccess(data.message || 'Admin account created. Sign in to continue.');
        return;
      }

      if (mode === 'forgot') {
        const response = await fetch('/api/admin/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to send the reset email.');
        setSuccess(data.message || 'If the administrator account exists, a reset link has been sent.');
        return;
      }

      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ accessToken: recoveryAccessToken, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to reset password.');

      setPassword('');
      setConfirmPassword('');
      setMode('login');
      window.history.replaceState({}, '', '/admin');
      setSuccess(data.message || 'Password updated. Sign in with your new password.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const title = {
    login: 'Salon Admin Panel',
    signup: 'Create Admin Account',
    forgot: 'Forgot Password',
    reset: 'Reset Password',
  }[mode];

  const description = {
    login: 'Sign in securely to manage your salon website.',
    signup: 'Set up the first secure administrator account.',
    forgot: 'Enter your admin email and we will send a password reset link.',
    reset: 'Choose a new secure password for your admin account.',
  }[mode];

  const primaryLabel = {
    login: 'Sign In to Admin',
    signup: 'Create Admin Account',
    forgot: 'Send Reset Link',
    reset: 'Update Password',
  }[mode];

  const inputClass = 'w-full min-w-0 bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] px-4 py-3 rounded-lg text-sm placeholder:text-[#6E7681] focus:outline-none focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/15 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#C9D1D9] mb-1.5';

  const passwordField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    visible: boolean,
    toggleVisible: () => void,
    autoComplete: string,
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#C9D1D9]">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          required
          minLength={mode === 'login' ? undefined : 12}
          autoComplete={autoComplete}
          placeholder={mode === 'login' ? 'Enter your password' : 'At least 12 characters'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass + ' pr-12'}
        />
        <button
          type="button"
          onClick={toggleVisible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F2F4F8] p-1"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F2F4F8] flex items-center justify-center px-4 py-8 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#21262D] border border-[#30363D] text-[#58A6FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight font-serif">{title}</h1>
          <p className="text-xs leading-5 text-[#8B949E]">{description}</p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div role="status" className="p-3 bg-green-950/40 border border-green-500/30 text-green-200 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
            <span>{success}</span>
          </div>
        )}

        {mode === 'reset' && !isResetLinkValid ? (
          <div className="space-y-4">
            <p className="text-sm text-[#C9D1D9]">This reset link is missing its recovery token or has expired.</p>
            <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-[#58A6FF] hover:underline">
              Request a new reset link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="admin-full-name" className={labelClass}>Full Name</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
                  <input id="admin-full-name" type="text" required autoComplete="name" placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass + ' pl-10'} />
                </div>
              </div>
            )}

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className={labelClass}>Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
                  <input id="admin-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass + ' pl-10'} />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="admin-setup-key" className={labelClass}>Private Admin Setup Key</label>
                <input id="admin-setup-key" type="password" required autoComplete="off" placeholder="Enter your one-time setup key" value={setupKey} onChange={(event) => setSetupKey(event.target.value)} className={inputClass} />
                <p className="text-[11px] leading-4 text-[#8B949E]">The key is used once for the server-side bootstrap and is never saved to your account.</p>
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') &&
              passwordField(
                mode === 'reset' ? 'New Password' : 'Password',
                password,
                setPassword,
                showPassword,
                () => setShowPassword((value) => !value),
                mode === 'login' ? 'current-password' : 'new-password',
              )}

            {(mode === 'signup' || mode === 'reset') &&
              passwordField(
                'Confirm Password',
                confirmPassword,
                setConfirmPassword,
                showConfirmPassword,
                () => setShowConfirmPassword((value) => !value),
                'new-password',
              )}

            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <a href="/admin/forgot-password" className="text-xs text-[#58A6FF] hover:text-[#79B8FF] transition-colors">
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Please wait...' : primaryLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-[#30363D] text-[11px] text-[#8B949E] space-y-3">
          {mode === 'login' && (
            <>
              <p>Protected administrator access for Aurelia Salon CMS.</p>
              <a href="/admin/signup" className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:text-[#79B8FF]">
                Create First Admin Account <ArrowRight className="w-3 h-3" />
              </a>
            </>
          )}
          {mode === 'signup' && (
            <>
              <p>First-admin setup is protected by a private key and closes after the first admin is created.</p>
              <button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:text-[#79B8FF]">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:text-[#79B8FF]">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>
          )}
          {mode === 'reset' && (
            <button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:text-[#79B8FF]">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
