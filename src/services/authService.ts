import { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient, supabase } from '../lib/supabase';

function requireSupabase(): SupabaseClient {
  if (supabase) return supabase;
  return getSupabaseClient();
}

export interface SignUpParams {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  referralCode?: string;
}

// SIGN UP
export async function signUp({
  fullName,
  phone,
  email,
  password,
  referralCode,
}: SignUpParams) {
  const client = requireSupabase();
  const normalizedCode = referralCode ? referralCode.trim().toUpperCase() : '';
  const redirectUrl = normalizedCode
    ? `${window.location.origin}/?ref=${encodeURIComponent(normalizedCode)}`
    : window.location.origin;

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        ...(normalizedCode ? { referred_by_code: normalizedCode } : {}),
      },
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) throw error;

  return data;
}

// SIGN IN
export async function signIn(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

// FORGOT PASSWORD
export async function forgotPassword(email: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;

  return data;
}

// RESET PASSWORD
export async function resetPassword(newPassword: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  return data;
}

// LOGOUT
export async function logout() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) throw error;
}

export async function getCurrentSessionUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}
