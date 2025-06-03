-- Füge die Position-Spalte zur profiles-Tabelle hinzu, falls sie noch nicht existiert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN position TEXT;
  END IF;
END $$;

-- Aktualisiere bestehende Benutzer mit Standardposition
UPDATE profiles SET position = 'Mitarbeiter' WHERE position IS NULL;

-- Erstelle Beispielbenutzer für verschiedene Positionen
-- 1. Alt Geselle
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'altgeselle@beispiel.de',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Hans Müller"}',
  now(),
  now()
) RETURNING id;

DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'altgeselle@beispiel.de';
  INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
  VALUES (user_id, 'altgeselle@beispiel.de', 'Hans Müller', 'user', 'Alt Geselle', now(), now());
END $$;

-- 2. Fach Helfer
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'fachhelfer@beispiel.de',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Peter Schmidt"}',
  now(),
  now()
) RETURNING id;

DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'fachhelfer@beispiel.de';
  INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
  VALUES (user_id, 'fachhelfer@beispiel.de', 'Peter Schmidt', 'user', 'Fach Helfer', now(), now());
END $$;

-- 3. Azubi
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'azubi@beispiel.de',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Max Lehmann"}',
  now(),
  now()
) RETURNING id;

DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'azubi@beispiel.de';
  INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
  VALUES (user_id, 'azubi@beispiel.de', 'Max Lehmann', 'user', 'Azubi', now(), now());
END $$;

-- 4. Geselle
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'geselle@beispiel.de',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Thomas Weber"}',
  now(),
  now()
) RETURNING id;

DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'geselle@beispiel.de';
  INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
  VALUES (user_id, 'geselle@beispiel.de', 'Thomas Weber', 'user', 'Geselle', now(), now());
END $$;

-- Überprüfe alle Benutzer und ihre Positionen
SELECT email, full_name, role, position FROM profiles ORDER BY position;
