-- Row Level Security aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies für profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- RLS Policies für projects
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::uuid = created_by);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid()::uuid = created_by);

DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- RLS Policies für materials
DROP POLICY IF EXISTS "Users can view all materials" ON materials;
CREATE POLICY "Users can view all materials" ON materials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage materials" ON materials;
CREATE POLICY "Admins can manage materials" ON materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- RLS Policies für entries
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
CREATE POLICY "Users can view own entries" ON entries
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can create own entries" ON entries;
CREATE POLICY "Users can create own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON entries;
CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON entries;
CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can view all entries" ON entries;
CREATE POLICY "Admins can view all entries" ON entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- RLS Policies für entry_images
DROP POLICY IF EXISTS "Users can view own entry images" ON entry_images;
CREATE POLICY "Users can view own entry images" ON entry_images
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can create own entry images" ON entry_images;
CREATE POLICY "Users can create own entry images" ON entry_images
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can delete own entry images" ON entry_images;
CREATE POLICY "Users can delete own entry images" ON entry_images
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- RLS Policies für comments
DROP POLICY IF EXISTS "Users can view relevant comments" ON comments;
CREATE POLICY "Users can view relevant comments" ON comments
  FOR SELECT USING (
    auth.uid()::uuid = author_id OR 
    auth.uid()::uuid = ANY(recipient_ids) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid()::uuid = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid()::uuid = author_id);

-- RLS Policies für receipts
DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can create own receipts" ON receipts;
CREATE POLICY "Users can create own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
CREATE POLICY "Users can update own receipts" ON receipts
  FOR UPDATE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;
CREATE POLICY "Users can delete own receipts" ON receipts
  FOR DELETE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can view all receipts" ON receipts;
CREATE POLICY "Admins can view all receipts" ON receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

SELECT 'Security Policies erfolgreich erstellt!' AS status;
