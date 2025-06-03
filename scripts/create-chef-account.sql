-- Erstelle einen Chef-Account (OHNE Admin-Rechte)
-- HINWEIS: In einer echten Produktionsumgebung sollte man Passwörter niemals im Klartext speichern!
-- Dies ist nur für Demo-Zwecke.

-- 1. Erstelle den Benutzer in auth.users (dies funktioniert nur mit Service Role Key)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manfred@chef.de',
  crypt('kawasaki', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Manfred Chef", "position":"Chef"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) RETURNING id;

-- 2. Erstelle das Profil mit normalen Benutzerrechten (NICHT Admin)
-- Wir müssen die ID aus dem vorherigen INSERT verwenden
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Hole die ID des gerade erstellten Benutzers
  SELECT id INTO user_id FROM auth.users WHERE email = 'manfred@chef.de';
  
  -- Erstelle das Profil mit normalen Benutzerrechten
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    position,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'manfred@chef.de',
    'Manfred Chef',
    'user',  -- Normale Benutzerrechte, NICHT Admin
    'Chef',  -- Position als Chef
    now(),
    now()
  );
END $$;

-- 3. Überprüfe, ob alles korrekt erstellt wurde
SELECT 
  au.email, 
  au.id, 
  p.role, 
  p.full_name,
  p.position
FROM 
  auth.users au
JOIN 
  profiles p ON au.id = p.id
WHERE 
  au.email = 'manfred@chef.de';
