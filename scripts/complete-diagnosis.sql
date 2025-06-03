-- KOMPLETTE DIAGNOSE UND REPARATUR
-- Schritt 1: Aktuelle Situation analysieren

SELECT '=== AKTUELLE BENUTZER ANALYSE ===' as info;

-- Prüfe auth.users Tabelle
SELECT 
  'AUTH.USERS:' as table_name,
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email = 'flixebaumann@gmail.com';

-- Prüfe profiles Tabelle
SELECT 
  'PROFILES:' as table_name,
  id,
  email,
  full_name,
  role,
  position,
  created_at
FROM profiles 
WHERE email = 'flixebaumann@gmail.com';

SELECT '=== ALLE POLICIES PRÜFEN ===' as info;

-- Zeige alle aktiven Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '=== RLS STATUS PRÜFEN ===' as info;

-- Prüfe RLS Status für alle Tabellen
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
