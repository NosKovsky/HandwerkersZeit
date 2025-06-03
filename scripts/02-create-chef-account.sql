-- Prüfe zuerst, ob der Benutzer bereits existiert
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'manfred@chef.de') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Benutzer mit E-Mail manfred@chef.de existiert bereits. Überspringe Erstellung.';
  ELSE
    -- 1. Erstelle den Benutzer in auth.users
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
    );
    
    RAISE NOTICE 'Benutzer manfred@chef.de wurde erstellt.';
  END IF;
END $$;

-- 2. Erstelle das Profil mit normalen Benutzerrechten (NICHT Admin)
DO $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Hole die ID des Benutzers
  SELECT id INTO user_id FROM auth.users WHERE email = 'manfred@chef.de';
  
  -- Prüfe, ob das Profil bereits existiert
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF profile_exists THEN
    -- Aktualisiere das bestehende Profil
    UPDATE profiles 
    SET 
      full_name = 'Manfred Chef',
      role = 'user',
      position = 'Chef',
      updated_at = now()
    WHERE id = user_id;
    
    RAISE NOTICE 'Profil für manfred@chef.de wurde aktualisiert.';
  ELSE
    -- Erstelle ein neues Profil
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
    
    RAISE NOTICE 'Profil für manfred@chef.de wurde erstellt.';
  END IF;
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
