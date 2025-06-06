-- Erweitere materials Tabelle um meters_per_piece für bessere Materialverwaltung
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS meters_per_piece DECIMAL(10,2) DEFAULT NULL;

-- Kommentar hinzufügen
COMMENT ON COLUMN materials.meters_per_piece IS 'Meter pro Stück für Materialien wie Dachrinnen (z.B. 3m pro 6tlg Rinne)';

-- Beispiel-Daten für Dachrinnen aktualisieren
UPDATE materials 
SET meters_per_piece = 3.0 
WHERE name ILIKE '%dachrinne%' AND name ILIKE '%6tlg%';

UPDATE materials 
SET meters_per_piece = 2.0 
WHERE name ILIKE '%dachrinne%' AND name ILIKE '%4tlg%';

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_materials_meters_per_piece ON materials(meters_per_piece) WHERE meters_per_piece IS NOT NULL;
