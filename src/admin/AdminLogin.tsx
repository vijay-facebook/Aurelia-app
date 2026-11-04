import React, { useState } from 'react';
import { setToken } from './api';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      setToken(data.token || '');
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F2F4F8] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#21262D] border border-[#30363D] text-[#58A6FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Salon Admin Panel</h1>
          <p className="text-xs text-[#8B949E]">
            Enter your secure administrator password to manage site configuration.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#C9D1D9]">Admin Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#30363D] text-[11px] text-[#8B949E]">
          Protected White-Level Salon CMS. Default password: <code className="text-[#58A6FF] font-mono">admin123</code> (or set <code className="text-[#58A6FF] font-mono">ADMIN_PASSWORD</code> in .env)
        </div>

      </div>
    </div>
  );
};
