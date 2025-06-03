-- Prüfe die Profiles Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'profiles') AS profiles_table_exists,
  COUNT(*) AS profiles_count
FROM profiles;

-- Prüfe die Projects Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'projects') AS projects_table_exists,
  COUNT(*) AS projects_count
FROM projects;

-- Prüfe die Materials Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'materials') AS materials_table_exists,
  COUNT(*) AS materials_count
FROM materials;

-- Prüfe die Entries Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'entries') AS entries_table_exists,
  COUNT(*) AS entries_count
FROM entries;

-- Prüfe die Entry_Images Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'entry_images') AS entry_images_table_exists,
  COUNT(*) AS entry_images_count
FROM entry_images;

-- Prüfe die Comments Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'comments') AS comments_table_exists,
  COUNT(*) AS comments_count
FROM comments;

-- Prüfe die Receipts Tabelle
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'receipts') AS receipts_table_exists,
  COUNT(*) AS receipts_count
FROM receipts;

-- Prüfe Foreign Keys in Entries
SELECT 
  COUNT(*) AS entries_without_valid_project
FROM entries e
LEFT JOIN projects p ON e.project_id = p.id
WHERE e.project_id IS NOT NULL AND p.id IS NULL;

-- Prüfe Foreign Keys in Entry_Images
SELECT 
  COUNT(*) AS images_without_valid_entry
FROM entry_images ei
LEFT JOIN entries e ON ei.entry_id = e.id
WHERE e.id IS NULL;

-- Prüfe auf verwaiste Materials
SELECT 
  COUNT(*) AS materials_used_count
FROM materials m
WHERE EXISTS (
  SELECT 1 FROM entries e
  WHERE e.materials_used::jsonb @> json_build_array(json_build_object('material_id', m.id))::jsonb
);
