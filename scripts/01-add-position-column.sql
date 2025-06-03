-- Füge die Position-Spalte zur profiles-Tabelle hinzu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position TEXT;

-- Überprüfe, ob die Spalte erfolgreich hinzugefügt wurde
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'position';
