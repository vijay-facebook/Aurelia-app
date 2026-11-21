import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logoutAdmin, verifyAdminAccess } from './adminAuthService';

interface AdminProtectedRouteProps {
  children: (props: { onLogout: () => void }) => React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const [redirectError, setRedirectError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const runVerification = async () => {
      try {
        const result = await verifyAdminAccess();
        if (!active) return;

        if (result.status === 'authorized') {
          setStatus('authorized');
          setRedirectError(undefined);
        } else {
          setRedirectError(result.message);
          setStatus('unauthorized');
        }
      } catch (err: unknown) {
        if (!active) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setRedirectError(undefined);
        setStatus('unauthorized');
      }
    };

    void runVerification();

    const authSubscription = supabase?.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setRedirectError('Your session has ended. Please sign in again.');
        setStatus('unauthorized');
        return;
      }
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        void runVerification();
      }
    });

    return () => {
      active = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login', {
      replace: true,
      state: { success: 'You have been signed out of the Admin Panel.' },
    });
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center gap-3 text-xs text-[#8B949E]">
        <Loader2 className="w-5 h-5 animate-spin text-[#58A6FF]" />
        <span>Verifying administrator permissions…</span>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={redirectError ? { error: redirectError } : undefined}
      />
    );
  }

  return <>{children({ onLogout: handleLogout })}</>;
};
