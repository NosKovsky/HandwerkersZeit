-- Entferne restriktive Policies nur für existierende Tabellen
-- Prüfe zuerst welche Tabellen existieren

-- 1. Mache flixebaumann@gmail.com definitiv zum Admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'), 
  '{role}', 
  '"admin"'
)
WHERE email = 'flixebaumann@gmail.com';

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'flixebaumann@gmail.com';

-- 2. Entferne restriktive Policies für Projekte (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
    DROP POLICY IF EXISTS "Users can view projects" ON projects;
    DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
    DROP POLICY IF EXISTS "Users can view own projects" ON projects;
    DROP POLICY IF EXISTS "Users can create projects" ON projects;
    DROP POLICY IF EXISTS "Users can update own projects" ON projects;
    DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

    -- Neue liberale Policies für Projekte
    CREATE POLICY "Authenticated users can do everything with projects" ON projects
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. Entferne restriktive Policies für Materialien (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'materials') THEN
    DROP POLICY IF EXISTS "Users can view materials" ON materials;
    DROP POLICY IF EXISTS "Admins can manage materials" ON materials;
    DROP POLICY IF EXISTS "Users can view own materials" ON materials;
    DROP POLICY IF EXISTS "Users can create materials" ON materials;
    DROP POLICY IF EXISTS "Users can update own materials" ON materials;
    DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

    -- Neue liberale Policies für Materialien
    CREATE POLICY "Authenticated users can do everything with materials" ON materials
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 4. Entferne restriktive Policies für Einträge (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'entries') THEN
    DROP POLICY IF EXISTS "Users can view own entries" ON entries;
    DROP POLICY IF EXISTS "Users can create entries" ON entries;
    DROP POLICY IF EXISTS "Users can update own entries" ON entries;
    DROP POLICY IF EXISTS "Users can delete own entries" ON entries;
    DROP POLICY IF EXISTS "Users can view entries" ON entries;

    -- Neue liberale Policies für Einträge
    CREATE POLICY "Authenticated users can do everything with entries" ON entries
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5. Entferne restriktive Policies für Quittungen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
    DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can create receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can view receipts" ON receipts;

    -- Neue liberale Policies für Quittungen
    CREATE POLICY "Authenticated users can do everything with receipts" ON receipts
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 6. Entferne restriktive Policies für Kommentare (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
    DROP POLICY IF EXISTS "Users can view related comments" ON comments;
    DROP POLICY IF EXISTS "Users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
    DROP POLICY IF EXISTS "Users can view comments" ON comments;

    -- Neue liberale Policies für Kommentare
    CREATE POLICY "Authenticated users can do everything with comments" ON comments
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 7. Profile für alle sichtbar machen
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

    -- Neue liberale Policies für Profile
    CREATE POLICY "Authenticated users can view all profiles" ON profiles
      FOR SELECT USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can update own profile" ON profiles
      FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id);
  END IF;
END $$;

-- 8. Zeige existierende Tabellen
SELECT 'Existierende Tabellen:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 9. Bestätigung
SELECT 'Alle Beschränkungen für existierende Tabellen entfernt!' as status;
SELECT email, role, position FROM profiles WHERE email IN ('flixebaumann@gmail.com', 'manfred@chef.de');
