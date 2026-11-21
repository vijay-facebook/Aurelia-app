import { Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AdminProfile {
  id: string;
  role: 'admin' | 'customer' | string;
  full_name: string;
  email: string;
}

export type AdminVerificationResult =
  | { status: 'authorized'; profile: AdminProfile; session: Session }
  | { status: 'unauthenticated'; message?: string }
  | { status: 'denied'; message: string }
  | { status: 'unconfigured'; message: string };

async function extractFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (!error || typeof error !== 'object') return fallback;
  const errObj = error as { message?: string; context?: Response };

  if (errObj.context && typeof errObj.context.json === 'function') {
    try {
      const payload = await errObj.context.clone().json();
      if (payload && typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error;
      }
    } catch {
      // Ignore JSON parsing failures and fall back to message
    }
  }

  return errObj.message || fallback;
}

export async function verifyAdminAccess(): Promise<AdminVerificationResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      status: 'unconfigured',
      message:
        'Supabase authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.',
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { status: 'unauthenticated' };
    }

    // Re-validate the user against Supabase Auth (detects revoked/expired tokens after refresh)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await supabase.auth.signOut().catch(() => {});
      return {
        status: 'unauthenticated',
        message: 'Your administrator session expired. Please sign in again.',
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin') {
      await supabase.auth.signOut().catch(() => {});
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      return {
        status: 'denied',
        message: 'Access Denied: This account does not have administrator privileges.',
      };
    }

    return {
      status: 'authorized',
      profile: profile as AdminProfile,
      session,
    };
  } catch {
    return { status: 'unauthenticated' };
  }
}

export async function signInAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ profile: AdminProfile }> {
  const client = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message || 'Invalid administrator email or password.');
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    await client.auth.signOut().catch(() => {});
    throw new Error('Unable to verify administrator profile permissions.');
  }

  if (!profile || profile.role !== 'admin') {
    await client.auth.signOut().catch(() => {});
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    throw new Error('Access Denied: Only authorized administrator accounts may enter the Admin Panel.');
  }

  return { profile: profile as AdminProfile };
}

export async function checkInitialAdminSetupAvailable(): Promise<{
  setupAvailable: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      setupAvailable: false,
      error: 'Supabase environment variables are not configured yet.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('admin-bootstrap', {
      body: { action: 'status' },
    });

    if (error) {
      return {
        setupAvailable: false,
        error: await extractFunctionErrorMessage(
          error,
          'Admin bootstrap Edge Function is unreachable.'
        ),
      };
    }

    return {
      setupAvailable: Boolean(data?.setupAvailable),
    };
  } catch (err: unknown) {
    return {
      setupAvailable: false,
      error: err instanceof Error ? err.message : 'Unable to check initial setup status.',
    };
  }
}

export async function registerFirstAdmin({
  fullName,
  email,
  password,
  setupKey,
}: {
  fullName: string;
  email: string;
  password: string;
  setupKey: string;
}): Promise<{ email: string; fullName: string }> {
  const client = getSupabaseClient();

  const { data, error } = await client.functions.invoke('admin-bootstrap', {
    body: {
      action: 'register',
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      setupKey: setupKey.trim(),
    },
  });

  if (error) {
    throw new Error(
      await extractFunctionErrorMessage(error, 'Failed to register the first administrator account.')
    );
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }

  if (!data?.success) {
    throw new Error('Unexpected response from administrator setup service.');
  }

  return {
    email: data.user?.email || email.trim().toLowerCase(),
    fullName: data.user?.fullName || fullName.trim(),
  };
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  const client = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await client.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function logoutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
}
