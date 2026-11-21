import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { AdminAuthLayout } from './AdminAuthLayout';
import { sendAdminPasswordReset } from './adminAuthService';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        'Supabase authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid registered administrator email address.');
      return;
    }

    setLoading(true);
    try {
      await sendAdminPasswordReset(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('rate limit')) {
        setError('Too many reset requests. Please wait a few minutes before trying again.');
      } else {
        // Confirm neutrally without leaking whether a specific email exists
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout
      title="Reset Admin Access"
      subtitle="Enter your registered administrator email and we will send a secure password recovery link."
      icon={<Mail className="w-5 h-5" />}
      footer={
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#58A6FF] hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Sign In</span>
        </Link>
      }
    >
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-start gap-2.5"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {submitted ? (
        <div
          role="status"
          className="p-4 bg-emerald-950/50 border border-emerald-500/30 text-emerald-100 text-xs rounded-lg space-y-2"
        >
          <div className="flex items-center gap-2 font-medium text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Recovery Request Sent</span>
          </div>
          <p className="leading-relaxed text-[#C9D1D9]">
            If an administrator account is registered with{' '}
            <span className="text-white font-medium">{email.trim().toLowerCase()}</span>, a
            password reset link has been sent to that inbox. Follow the link to set a new
            password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="admin-forgot-email"
              className="block text-xs font-medium text-[#C9D1D9]"
            >
              Registered Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-forgot-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@aureliastudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset Link…</span>
              </>
            ) : (
              <>
                <span>Send Password Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </AdminAuthLayout>
  );
};
