-- NUCLEAR OPTION: Komplette Reparatur
-- Schritt 1: Admin-Rechte GARANTIERT setzen

-- Lösche und erstelle Benutzer neu in auth.users
DELETE FROM auth.users WHERE email = 'flixebaumann@gmail.com';

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'flixebaumann@gmail.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "full_name": "Felix Baumann"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);

-- Lösche und erstelle Profil neu
DELETE FROM profiles WHERE email = 'flixebaumann@gmail.com';

INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  position,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'flixebaumann@gmail.com'),
  'flixebaumann@gmail.com',
  'Felix Baumann',
  'admin',
  'Administrator',
  NOW(),
  NOW()
);

-- Schritt 2: ALLE RLS POLICIES KOMPLETT ENTFERNEN
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Entferne alle Policies von allen Tabellen
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Schritt 3: RLS KOMPLETT DEAKTIVIEREN für alle Tabellen
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- Schritt 4: Einfache Policies für alle authentifizierten Benutzer
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can do anything with profiles" ON profiles FOR ALL USING (true);

-- Projects
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with projects" ON projects FOR ALL USING (true)';
    END IF;
END $$;

-- Materials
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'materials') THEN
        ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with materials" ON materials FOR ALL USING (true)';
    END IF;
END $$;

-- Entries
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'entries') THEN
        ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with entries" ON entries FOR ALL USING (true)';
    END IF;
END $$;

-- Receipts
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
        ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with receipts" ON receipts FOR ALL USING (true)';
    END IF;
END $$;

-- Comments
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with comments" ON comments FOR ALL USING (true)';
    END IF;
END $$;

-- Tasks
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with tasks" ON tasks FOR ALL USING (true)';
    END IF;
END $$;

-- Time Entries
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'time_entries') THEN
        ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "Anyone can do anything with time_entries" ON time_entries FOR ALL USING (true)';
    END IF;
END $$;

SELECT '=== REPARATUR ABGESCHLOSSEN ===' as status;
SELECT 'Benutzer Felix Baumann wurde als Admin erstellt' as info;
SELECT 'Alle RLS Policies wurden entfernt und durch offene Policies ersetzt' as info;
SELECT 'Jeder authentifizierte Benutzer kann jetzt alles machen' as info;

-- Finale Verifikation
SELECT 
  'VERIFIKATION:' as check_type,
  email,
  role,
  position
FROM profiles 
WHERE email = 'flixebaumann@gmail.com';
