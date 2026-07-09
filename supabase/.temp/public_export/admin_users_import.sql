SET session_replication_role = replica;
INSERT INTO public.admin_users (auth_user_id, created_at, email, full_name, id, role) VALUES ('0c1d28bc-9220-4afd-8e8a-03ac16567af1', '2026-06-29T23:55:37.352168+00:00', 'admin@foodvault.io', 'System Administrator', '69c5c9d2-8f80-4a44-bba6-0add17de5115', 'super_admin');
INSERT INTO public.admin_users (auth_user_id, created_at, email, full_name, id, role) VALUES ('e805657f-2dfe-44f6-8794-3c14db6735f2', '2026-06-29T18:57:32.021587+00:00', 'mark@benchmark-int.com', 'Mark Coulston', '8c9a47a1-f925-4341-9ac4-0d2aae131140', 'super_admin');
RESET ALL;
