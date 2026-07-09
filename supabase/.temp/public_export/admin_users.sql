SET session_replication_role = replica;
INSERT INTO public.admin_users (auth_user_id, created_at, email, full_name, id, is_active, last_login_at, name, role, updated_at) VALUES ('0c1d28bc-9220-4afd-8e8a-03ac16567af1', '2026-06-29T23:55:37.352168+00:00', 'admin@foodvault.io', 'System Administrator', '69c5c9d2-8f80-4a44-bba6-0add17de5115', TRUE, NULL, 'System Administrator', 'super_admin', '2026-06-29T23:55:37.352168+00:00');
INSERT INTO public.admin_users (auth_user_id, created_at, email, full_name, id, is_active, last_login_at, name, role, updated_at) VALUES (NULL, '2026-06-29T18:57:32.021587+00:00', 'mark@benchmark-int.com', NULL, '8c9a47a1-f925-4341-9ac4-0d2aae131140', TRUE, NULL, 'Mark Coulston', 'super_admin', '2026-06-29T18:57:32.021587+00:00');
RESET ALL;
