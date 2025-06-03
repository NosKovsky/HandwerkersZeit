-- Finale Prüfung des Projekts

-- 1. Prüfe alle Tabellen
SELECT 
  table_name, 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = table_name::text) AS exists
FROM (
  VALUES 
    ('profiles'),
    ('projects'),
    ('materials'),
    ('entries'),
    ('entry_images'),
    ('comments'),
    ('receipts'),
    ('tasks')
) AS t(table_name);

-- 2. Prüfe Admin-Benutzer
SELECT 
  email, 
  full_name, 
  role 
FROM 
  profiles 
WHERE 
  role = 'admin';

-- 3. Prüfe Beispieldaten
SELECT 
  'projects' AS table_name, 
  COUNT(*) AS count 
FROM 
  projects
UNION ALL
SELECT 
  'materials' AS table_name, 
  COUNT(*) AS count 
FROM 
  materials
UNION ALL
SELECT 
  'entries' AS table_name, 
  COUNT(*) AS count 
FROM 
  entries;

-- 4. Prüfe Berechtigungen und Policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
ORDER BY
  tablename, policyname;

-- 5. Prüfe Indizes für Performance
SELECT
  tablename,
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
ORDER BY
  tablename, indexname;
