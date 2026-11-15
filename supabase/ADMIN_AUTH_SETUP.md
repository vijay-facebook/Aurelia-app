# Aurelia Supabase Admin Auth Setup

1. Apply `supabase/migrations/202611150001_admin_auth_bootstrap.sql` in the Supabase SQL Editor.
2. In the application host, configure these server-only values:
   - `SUPABASE_URL=https://hcrypnkcinvxattgfzwa.supabase.co`
   - `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`): the project's public key.
   - `SUPABASE_SERVICE_ROLE_KEY`: the service-role secret. Server only; never expose it in the browser.
   - `ADMIN_SIGNUP_SECRET`: a long random secret known only to the site owner.
   - `PUBLIC_APP_URL`: the deployed website origin, with no trailing slash.
3. In Supabase Dashboard > Authentication > URL Configuration:
   - Set Site URL to the public website origin.
   - Add `http://localhost:3000/admin/reset-password` for local development.
   - Add `https://YOUR_DOMAIN/admin/reset-password` for production.
4. Open `/admin/signup`, enter the admin name, email, password, and the private setup key.
5. After the initial admin is created, signup is automatically closed. Use `/admin` to sign in.
6. Use `/admin/forgot-password` to request a recovery email. The email link opens `/admin/reset-password`.

The admin signup endpoint uses the Supabase service role only on the server to create the initial account and assign its role. No service-role key belongs in frontend variables or source files.
