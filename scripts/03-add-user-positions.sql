-- Erstelle Beispielbenutzer für verschiedene Positionen mit Prüfung auf Duplikate

-- 1. Alt Geselle
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Prüfe, ob der Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'altgeselle@beispiel.de') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Benutzer altgeselle@beispiel.de existiert bereits. Überspringe Erstellung.';
    -- Hole die ID des bestehenden Benutzers
    SELECT id INTO user_id FROM auth.users WHERE email = 'altgeselle@beispiel.de';
  ELSE
    -- Erstelle einen neuen Benutzer
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
    ) RETURNING id INTO user_id;
    
    RAISE NOTICE 'Benutzer altgeselle@beispiel.de wurde erstellt.';
  END IF;
  
  -- Prüfe, ob das Profil bereits existiert
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Aktualisiere das bestehende Profil
    UPDATE profiles 
    SET 
      full_name = 'Hans Müller',
      position = 'Alt Geselle',
      updated_at = now()
    WHERE id = user_id;
    
    RAISE NOTICE 'Profil für altgeselle@beispiel.de wurde aktualisiert.';
  ELSE
    -- Erstelle ein neues Profil
    INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
    VALUES (user_id, 'altgeselle@beispiel.de', 'Hans Müller', 'user', 'Alt Geselle', now(), now());
    
    RAISE NOTICE 'Profil für altgeselle@beispiel.de wurde erstellt.';
  END IF;
END $$;

-- 2. Fach Helfer
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Prüfe, ob der Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'fachhelfer@beispiel.de') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Benutzer fachhelfer@beispiel.de existiert bereits. Überspringe Erstellung.';
    -- Hole die ID des bestehenden Benutzers
    SELECT id INTO user_id FROM auth.users WHERE email = 'fachhelfer@beispiel.de';
  ELSE
    -- Erstelle einen neuen Benutzer
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
    ) RETURNING id INTO user_id;
    
    RAISE NOTICE 'Benutzer fachhelfer@beispiel.de wurde erstellt.';
  END IF;
  
  -- Prüfe, ob das Profil bereits existiert
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Aktualisiere das bestehende Profil
    UPDATE profiles 
    SET 
      full_name = 'Peter Schmidt',
      position = 'Fach Helfer',
      updated_at = now()
    WHERE id = user_id;
    
    RAISE NOTICE 'Profil für fachhelfer@beispiel.de wurde aktualisiert.';
  ELSE
    -- Erstelle ein neues Profil
    INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
    VALUES (user_id, 'fachhelfer@beispiel.de', 'Peter Schmidt', 'user', 'Fach Helfer', now(), now());
    
    RAISE NOTICE 'Profil für fachhelfer@beispiel.de wurde erstellt.';
  END IF;
END $$;

-- 3. Azubi
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Prüfe, ob der Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'azubi@beispiel.de') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Benutzer azubi@beispiel.de existiert bereits. Überspringe Erstellung.';
    -- Hole die ID des bestehenden Benutzers
    SELECT id INTO user_id FROM auth.users WHERE email = 'azubi@beispiel.de';
  ELSE
    -- Erstelle einen neuen Benutzer
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
    ) RETURNING id INTO user_id;
    
    RAISE NOTICE 'Benutzer azubi@beispiel.de wurde erstellt.';
  END IF;
  
  -- Prüfe, ob das Profil bereits existiert
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Aktualisiere das bestehende Profil
    UPDATE profiles 
    SET 
      full_name = 'Max Lehmann',
      position = 'Azubi',
      updated_at = now()
    WHERE id = user_id;
    
    RAISE NOTICE 'Profil für azubi@beispiel.de wurde aktualisiert.';
  ELSE
    -- Erstelle ein neues Profil
    INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
    VALUES (user_id, 'azubi@beispiel.de', 'Max Lehmann', 'user', 'Azubi', now(), now());
    
    RAISE NOTICE 'Profil für azubi@beispiel.de wurde erstellt.';
  END IF;
END $$;

-- 4. Geselle
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Prüfe, ob der Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'geselle@beispiel.de') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Benutzer geselle@beispiel.de existiert bereits. Überspringe Erstellung.';
    -- Hole die ID des bestehenden Benutzers
    SELECT id INTO user_id FROM auth.users WHERE email = 'geselle@beispiel.de';
  ELSE
    -- Erstelle einen neuen Benutzer
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
    ) RETURNING id INTO user_id;
    
    RAISE NOTICE 'Benutzer geselle@beispiel.de wurde erstellt.';
  END IF;
  
  -- Prüfe, ob das Profil bereits existiert
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Aktualisiere das bestehende Profil
    UPDATE profiles 
    SET 
      full_name = 'Thomas Weber',
      position = 'Geselle',
      updated_at = now()
    WHERE id = user_id;
    
    RAISE NOTICE 'Profil für geselle@beispiel.de wurde aktualisiert.';
  ELSE
    -- Erstelle ein neues Profil
    INSERT INTO profiles (id, email, full_name, role, position, created_at, updated_at)
    VALUES (user_id, 'geselle@beispiel.de', 'Thomas Weber', 'user', 'Geselle', now(), now());
    
    RAISE NOTICE 'Profil für geselle@beispiel.de wurde erstellt.';
  END IF;
END $$;

-- Aktualisiere bestehende Benutzer mit Standardposition, falls noch nicht gesetzt
UPDATE profiles SET position = 'Mitarbeiter' WHERE position IS NULL;

-- Überprüfe alle Benutzer und ihre Positionen
SELECT email, full_name, role, position FROM profiles ORDER BY position;
