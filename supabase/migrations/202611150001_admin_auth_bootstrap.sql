-- Aurelia: enforce one initial owner-admin during first-admin bootstrap.
-- Apply after the profiles table and app_role enum have been created.
-- If this fails, inspect and resolve duplicate admin profiles before retrying.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_single_admin_bootstrap_idx
ON public.profiles ((role))
WHERE role = 'admin'::public.app_role;
