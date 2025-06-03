-- FINALE LÖSUNG: Komplette Bereinigung und Neuaufbau

-- Schritt 1: Prüfe aktuelles Profil
SELECT 'AKTUELLER PROFIL STATUS:' as info;
SELECT * FROM profiles WHERE id = '6ed0f273-97f0-4ea9-995a-29762cb4f93c';

-- Schritt 2: Lösche ALLE widersprüchlichen Policies
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Entferne alle bestehenden Policies...';
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Policy entfernt: % auf %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- Schritt 3: Erstelle/Update Profil für den Benutzer
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    position,
    created_at,
    updated_at
) VALUES (
    '6ed0f273-97f0-4ea9-995a-29762cb4f93c',
    'flixebaumann@gmail.com',
    'Dennis Büscher',
    'admin',
    'Administrator',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    position = 'Administrator',
    full_name = 'Dennis Büscher',
    updated_at = NOW();

-- Schritt 4: Erstelle EINFACHE Policies für alle Tabellen
-- Profiles
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');

-- Projects  
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Materials
CREATE POLICY "allow_all_materials" ON materials FOR ALL USING (auth.role() = 'authenticated');

-- Entries
CREATE POLICY "allow_all_entries" ON entries FOR ALL USING (auth.role() = 'authenticated');

-- Entry Images
CREATE POLICY "allow_all_entry_images" ON entry_images FOR ALL USING (auth.role() = 'authenticated');

-- Receipts
CREATE POLICY "allow_all_receipts" ON receipts FOR ALL USING (auth.role() = 'authenticated');

-- Comments
CREATE POLICY "allow_all_comments" ON comments FOR ALL USING (auth.role() = 'authenticated');

-- Tasks
CREATE POLICY "allow_all_tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');

-- Time Entries
CREATE POLICY "allow_all_time_entries" ON time_entries FOR ALL USING (auth.role() = 'authenticated');

-- Schritt 5: Verifikation
SELECT '=== FINALE VERIFIKATION ===' as status;

SELECT 'BENUTZER PROFIL:' as check_type, 
       id, email, full_name, role, position 
FROM profiles 
WHERE id = '6ed0f273-97f0-4ea9-995a-29762cb4f93c';

SELECT 'POLICIES NACH BEREINIGUNG:' as check_type;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

SELECT '=== REPARATUR ABGESCHLOSSEN ===' as final_status;
SELECT 'Alle Beschränkungen entfernt - jeder authentifizierte Benutzer kann alles machen' as info;
