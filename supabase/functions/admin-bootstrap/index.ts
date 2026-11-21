// Supabase Edge Function: Initial First-Admin Registration (One-Time Setup)
// Environment secrets required on Supabase Edge Function:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   ADMIN_SIGNUP_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function timingSafeEquals(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const adminSignupSecret = Deno.env.get('ADMIN_SIGNUP_SECRET') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, {
      error: 'Edge Function is missing Supabase server credentials.',
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check whether any admin profile already exists
  const { count: adminCount, error: countError } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (countError) {
    return jsonResponse(500, { error: 'Failed to inspect administrator setup state.' });
  }

  const setupAvailable = (adminCount ?? 0) === 0;

  if (req.method === 'GET') {
    return jsonResponse(200, { setupAvailable });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON request body.' });
  }

  if (body.action === 'status') {
    return jsonResponse(200, { setupAvailable });
  }

  if (!setupAvailable) {
    return jsonResponse(403, {
      error: 'Initial admin setup is closed because an administrator account already exists.',
    });
  }

  if (!adminSignupSecret) {
    return jsonResponse(500, {
      error: 'Server secret ADMIN_SIGNUP_SECRET is not configured.',
    });
  }

  const setupKey = typeof body.setupKey === 'string' ? body.setupKey.trim() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!setupKey || !timingSafeEquals(setupKey, adminSignupSecret)) {
    return jsonResponse(403, {
      error: 'Unauthorized: Invalid admin setup key.',
    });
  }

  if (!fullName || !email || !email.includes('@')) {
    return jsonResponse(400, {
      error: 'Full name and a valid administrator email are required.',
    });
  }

  if (password.length < 8) {
    return jsonResponse(400, {
      error: 'Password must be at least 8 characters long.',
    });
  }

  // Create the Supabase Auth user securely with email confirmation enabled
  const { data: createdUserData, error: createUserError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (createUserError || !createdUserData.user) {
    return jsonResponse(400, {
      error: createUserError?.message || 'Could not create administrator user.',
    });
  }

  // Double-check race condition safety before promoting role = 'admin'
  const { count: recheckCount } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin');

  if ((recheckCount ?? 0) > 0) {
    await supabaseAdmin.auth.admin.deleteUser(createdUserData.user.id);
    return jsonResponse(403, {
      error: 'Initial admin setup was already completed by another request.',
    });
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: createdUserData.user.id,
        full_name: fullName,
        email,
        role: 'admin',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(createdUserData.user.id);
    return jsonResponse(500, {
      error: 'Failed to assign administrator profile role.',
    });
  }

  return jsonResponse(201, {
    success: true,
    user: {
      id: createdUserData.user.id,
      email: createdUserData.user.email,
      fullName,
      role: 'admin',
    },
  });
});
