-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Tabelle (erweitert für Baustellendokumentation)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Tabelle (Baustellen)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Tabelle (Materialstammdaten)
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT, -- z.B. "m", "Stk", "kg"
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entries Tabelle (Arbeitseinträge)
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  activity TEXT NOT NULL,
  materials_used JSONB, -- [{ material_id: UUID, quantity: number, name: string, unit: string }]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entry Images Tabelle
CREATE TABLE IF NOT EXISTS entry_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_path TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Tabelle (für Aufgaben und Kommentare)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_ids UUID[], -- Array von User IDs für Empfänger
  content TEXT NOT NULL,
  status TEXT DEFAULT 'NEU' CHECK (status IN ('NEU', 'OFFEN', 'ERLEDIGT')),
  is_procurement BOOLEAN DEFAULT FALSE, -- Besorgung ja/nein
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Für Antworten
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts Tabelle (Quittungen)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  company_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  receipt_date DATE NOT NULL,
  category TEXT, -- z.B. "Tankquittung", "Material", "Werkzeug"
  description TEXT,
  image_path TEXT, -- Pfad zum Quittungsbild
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funktion zum automatischen Erstellen eines Profils bei Registrierung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische Profilerstellung
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_project_id ON entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entry_images_entry_id ON entry_images(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_entry_id ON comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project_id ON receipts(project_id);
