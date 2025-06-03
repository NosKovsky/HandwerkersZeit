-- Entferne restriktive Policies und erlaube allen authentifizierten Benutzern Zugriff
-- Die Autorschaft wird trotzdem korrekt verfolgt

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

-- 2. Entferne restriktive Policies für Projekte
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;

-- Neue liberale Policies für Projekte
CREATE POLICY "Authenticated users can view all projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Entferne restriktive Policies für Materialien
DROP POLICY IF EXISTS "Users can view materials" ON materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON materials;

-- Neue liberale Policies für Materialien
CREATE POLICY "Authenticated users can view all materials" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create materials" ON materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update materials" ON materials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete materials" ON materials
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Entferne restriktive Policies für Einträge
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
DROP POLICY IF EXISTS "Users can create entries" ON entries;
DROP POLICY IF EXISTS "Users can update own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON entries;

-- Neue liberale Policies für Einträge
CREATE POLICY "Authenticated users can view all entries" ON entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create entries" ON entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update entries" ON entries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete entries" ON entries
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Entferne restriktive Policies für Quittungen
DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can create receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;

-- Neue liberale Policies für Quittungen
CREATE POLICY "Authenticated users can view all receipts" ON receipts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create receipts" ON receipts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update receipts" ON receipts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete receipts" ON receipts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Entferne restriktive Policies für Aufgaben/Kommentare
DROP POLICY IF EXISTS "Users can view related comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Neue liberale Policies für Aufgaben/Kommentare
CREATE POLICY "Authenticated users can view all comments" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update comments" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete comments" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Entferne restriktive Policies für Zeiterfassung
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON time_entries;

-- Neue liberale Policies für Zeiterfassung
CREATE POLICY "Authenticated users can view all time entries" ON time_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update time entries" ON time_entries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete time entries" ON time_entries
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Profile für alle sichtbar machen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own profile" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Bestätigung
SELECT 'Alle Beschränkungen entfernt! Alle authentifizierten Benutzer haben jetzt vollen Zugriff.' as status;
SELECT email, role FROM profiles WHERE email IN ('flixebaumann@gmail.com', 'manfred@chef.de');
