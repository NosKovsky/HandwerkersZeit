-- Füge typische Dachdecker-Materialien hinzu
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Hole einen Admin-Benutzer für die Erstellung der Materialien
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Wenn kein Admin gefunden, nimm den ersten Benutzer
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM profiles LIMIT 1;
  END IF;

  -- 1. Dachziegel & Dachsteine
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Tondachziegel Standard', 'Stück', 'Klassischer Tondachziegel in Rot', admin_id, now(), now()),
    (gen_random_uuid(), 'Tondachziegel Engobiert', 'Stück', 'Engobierter Tondachziegel in Anthrazit', admin_id, now(), now()),
    (gen_random_uuid(), 'Betondachstein', 'Stück', 'Betondachstein in verschiedenen Farben', admin_id, now(), now()),
    (gen_random_uuid(), 'Biberschwanzziegel', 'Stück', 'Traditioneller Biberschwanzziegel', admin_id, now(), now()),
    (gen_random_uuid(), 'Firstziegel', 'Stück', 'Ziegel für den Dachfirst', admin_id, now(), now()),
    (gen_random_uuid(), 'Gratziegel', 'Stück', 'Ziegel für den Dachgrat', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 2. Dachbahnen & Folien
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Bitumenbahn V13', 'Rolle', 'Unterspannbahn mit Glasvlieseinlage', admin_id, now(), now()),
    (gen_random_uuid(), 'Bitumenbahn G200 S4', 'Rolle', 'Schweißbahn mit Polyestervlieseinlage', admin_id, now(), now()),
    (gen_random_uuid(), 'EPDM-Folie 1,2mm', 'm²', 'Synthetische Gummidachbahn', admin_id, now(), now()),
    (gen_random_uuid(), 'Dampfsperre', 'Rolle', 'PE-Folie als Dampfbremse', admin_id, now(), now()),
    (gen_random_uuid(), 'Unterspannbahn diffusionsoffen', 'Rolle', 'Atmungsaktive Unterspannbahn', admin_id, now(), now()),
    (gen_random_uuid(), 'Nageldichtband', 'Rolle', 'Selbstklebendes Dichtband für Nagelstellen', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 3. Dämmung
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Mineralwolle 100mm', 'm²', 'Dämmplatte aus Mineralwolle, 100mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'Mineralwolle 140mm', 'm²', 'Dämmplatte aus Mineralwolle, 140mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'Mineralwolle 180mm', 'm²', 'Dämmplatte aus Mineralwolle, 180mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'PIR-Dämmplatte 80mm', 'm²', 'Polyisocyanurat-Dämmplatte, 80mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'PIR-Dämmplatte 100mm', 'm²', 'Polyisocyanurat-Dämmplatte, 100mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'PIR-Dämmplatte 120mm', 'm²', 'Polyisocyanurat-Dämmplatte, 120mm stark', admin_id, now(), now()),
    (gen_random_uuid(), 'Holzfaserdämmplatte 60mm', 'm²', 'Ökologische Dämmplatte aus Holzfasern', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 4. Metalle & Bleche
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Titanzink 0,7mm', 'm²', 'Titanzinkblech für Dacheindeckung und Verblechung', admin_id, now(), now()),
    (gen_random_uuid(), 'Kupferblech 0,6mm', 'm²', 'Kupferblech für hochwertige Verblechungen', admin_id, now(), now()),
    (gen_random_uuid(), 'Aluminium-Verbundblech', 'm²', 'Leichtes Verbundblech für Dachränder', admin_id, now(), now()),
    (gen_random_uuid(), 'Dachrinne Titanzink 333mm', 'Meter', 'Halbrunde Dachrinne aus Titanzink', admin_id, now(), now()),
    (gen_random_uuid(), 'Fallrohr Titanzink DN 100', 'Meter', 'Fallrohr aus Titanzink, Durchmesser 100mm', admin_id, now(), now()),
    (gen_random_uuid(), 'Rinnenhaken verzinkt', 'Stück', 'Rinnenhalter aus verzinktem Stahl', admin_id, now(), now()),
    (gen_random_uuid(), 'Rohrschelle Titanzink', 'Stück', 'Befestigung für Fallrohre', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 5. Befestigungsmaterial
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Sturmklammer Typ 435', 'Stück', 'Sturmklammer für Dachziegel', admin_id, now(), now()),
    (gen_random_uuid(), 'Dachhaken verzinkt', 'Stück', 'Dachhaken für Solaranlagen', admin_id, now(), now()),
    (gen_random_uuid(), 'Nagel verzinkt 3,1x80mm', 'kg', 'Verzinkte Nägel für Dachlatten', admin_id, now(), now()),
    (gen_random_uuid(), 'Schrauben 4,5x35mm A2', 'Stück', 'Edelstahlschrauben für Außenbereich', admin_id, now(), now()),
    (gen_random_uuid(), 'Firstklammer', 'Stück', 'Klammer zur Befestigung von Firstziegeln', admin_id, now(), now()),
    (gen_random_uuid(), 'Schneefanggitter 200cm', 'Stück', 'Schneefangsystem für Dachziegel', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 6. Holz
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Dachlatte 30x50mm', 'Meter', 'Imprägnierte Dachlatte', admin_id, now(), now()),
    (gen_random_uuid(), 'Konterlatte 40x60mm', 'Meter', 'Imprägnierte Konterlatte', admin_id, now(), now()),
    (gen_random_uuid(), 'OSB-Platte 18mm', 'm²', 'Oriented Strand Board für Dachschalung', admin_id, now(), now()),
    (gen_random_uuid(), 'Rauspund 19mm', 'm²', 'Profilholz für sichtbare Dachuntersichten', admin_id, now(), now()),
    (gen_random_uuid(), 'Konstruktionsholz 60x80mm', 'Meter', 'KVH für Dachkonstruktionen', admin_id, now(), now()),
    (gen_random_uuid(), 'Konstruktionsholz 100x120mm', 'Meter', 'KVH für Dachkonstruktionen', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 7. Zubehör
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Entlüftungsziegel', 'Stück', 'Lüftungsziegel für Dachentlüftung', admin_id, now(), now()),
    (gen_random_uuid(), 'Dachfenster 78x118cm', 'Stück', 'Dachfenster mit Eindeckrahmen', admin_id, now(), now()),
    (gen_random_uuid(), 'Dunstrohr DN 100', 'Stück', 'Durchführung für Entlüftung', admin_id, now(), now()),
    (gen_random_uuid(), 'Traufblech 2m', 'Stück', 'Tropfblech für Dachtraufe', admin_id, now(), now()),
    (gen_random_uuid(), 'Vogelschutzgitter 5m', 'Rolle', 'Schutzgitter gegen Vogeleinflug', admin_id, now(), now()),
    (gen_random_uuid(), 'Kaminanschlussband', 'Rolle', 'Flexibles Band für Kaminanschlüsse', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- 8. Kleber & Dichtmassen
  INSERT INTO materials (id, name, unit, description, created_by, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Bitumenkleber', 'Dose', 'Kaltkleber für Bitumenbahnen', admin_id, now(), now()),
    (gen_random_uuid(), 'Dachdichtstoff', 'Kartusche', 'Elastischer Dichtstoff für Dachanschlüsse', admin_id, now(), now()),
    (gen_random_uuid(), 'PU-Schaum', 'Dose', 'Montageschaum für Dachfenster', admin_id, now(), now()),
    (gen_random_uuid(), 'Nageldichtmasse', 'Kartusche', 'Dichtmasse für Durchdringungen', admin_id, now(), now()),
    (gen_random_uuid(), 'Silikon', 'Kartusche', 'Witterungsbeständiges Silikon', admin_id, now(), now()),
    (gen_random_uuid(), 'Flüssigkunststoff', 'kg', 'Für komplizierte Abdichtungen', admin_id, now(), now())
  ON CONFLICT (name) DO NOTHING;

  -- Überprüfe die Anzahl der eingefügten Materialien
  RAISE NOTICE 'Dachdecker-Materialien wurden hinzugefügt.';
END $$;

-- Zeige alle Materialien an
SELECT name, unit, description FROM materials ORDER BY name;
