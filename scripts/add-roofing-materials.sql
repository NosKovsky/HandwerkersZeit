-- Füge typische Materialien für das Dachdecker-Handwerk hinzu

-- Dachziegel und Dachsteine
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Tondachziegel Standard', 'Stück', 'Klassische Tondachziegel für Steildächer', now(), now()),
  (gen_random_uuid(), 'Betondachstein', 'Stück', 'Robuste Betondachsteine', now(), now()),
  (gen_random_uuid(), 'Biberschwanzziegel', 'Stück', 'Traditionelle Biberschwanzziegel', now(), now()),
  (gen_random_uuid(), 'Schiefer', 'm²', 'Naturschieferplatten für hochwertige Dacheindeckungen', now(), now()),
  (gen_random_uuid(), 'Frankfurter Pfanne', 'Stück', 'Beliebte Dachpfannenform', now(), now()),
  (gen_random_uuid(), 'Firstziegel', 'Stück', 'Ziegel für den Dachfirst', now(), now());

-- Dachbahnen und Folien
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Bitumenbahn V13', 'Rolle (10m²)', 'Unterspannbahn mit Glasvlieseinlage', now(), now()),
  (gen_random_uuid(), 'Bitumenschweißbahn', 'Rolle (5m²)', 'Schweißbahn für Flachdächer', now(), now()),
  (gen_random_uuid(), 'EPDM-Folie', 'm²', 'Synthetische Gummibahn für Flachdächer', now(), now()),
  (gen_random_uuid(), 'Dampfsperre', 'Rolle (75m²)', 'PE-Folie als Dampfbremse', now(), now()),
  (gen_random_uuid(), 'Unterspannbahn diffusionsoffen', 'Rolle (75m²)', 'Atmungsaktive Unterspannbahn', now(), now()),
  (gen_random_uuid(), 'Nageldichtband', 'Rolle (30m)', 'Selbstklebendes Dichtband für Nagelstellen', now(), now());

-- Dämmung
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Mineralwolle 100mm', 'm²', 'Dämmplatten aus Mineralwolle, 100mm stark', now(), now()),
  (gen_random_uuid(), 'Mineralwolle 140mm', 'm²', 'Dämmplatten aus Mineralwolle, 140mm stark', now(), now()),
  (gen_random_uuid(), 'Mineralwolle 200mm', 'm²', 'Dämmplatten aus Mineralwolle, 200mm stark', now(), now()),
  (gen_random_uuid(), 'PIR-Dämmplatte 100mm', 'm²', 'Hochleistungsdämmung aus Polyisocyanurat', now(), now()),
  (gen_random_uuid(), 'PIR-Dämmplatte 140mm', 'm²', 'Hochleistungsdämmung aus Polyisocyanurat', now(), now()),
  (gen_random_uuid(), 'Holzfaserdämmplatte', 'm²', 'Ökologische Dämmung aus Holzfasern', now(), now());

-- Metalle und Bleche
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Titanzinkblech 0,7mm', 'm²', 'Hochwertiges Titanzinkblech für Dacheindeckungen', now(), now()),
  (gen_random_uuid(), 'Kupferblech 0,6mm', 'm²', 'Kupferblech für langlebige Dacheindeckungen', now(), now()),
  (gen_random_uuid(), 'Aluminium-Dachrinne', 'Meter', 'Dachrinne aus Aluminium, verschiedene Größen', now(), now()),
  (gen_random_uuid(), 'Titanzink-Dachrinne', 'Meter', 'Dachrinne aus Titanzink, verschiedene Größen', now(), now()),
  (gen_random_uuid(), 'Fallrohr DN 100', 'Meter', 'Fallrohr für Regenwasserableitung', now(), now()),
  (gen_random_uuid(), 'Rinneneisen', 'Stück', 'Halterung für Dachrinnen', now(), now());

-- Befestigungsmaterial
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Sturmklammer', 'Stück', 'Zur Befestigung von Dachziegeln bei starkem Wind', now(), now()),
  (gen_random_uuid(), 'Dachhaken', 'Stück', 'Zur Befestigung von Solarpanelen oder Schneefanggittern', now(), now()),
  (gen_random_uuid(), 'Nageldichtschrauben', 'Packung (100 Stück)', 'Schrauben mit Dichtung für Wellplatten', now(), now()),
  (gen_random_uuid(), 'Lattennägel 4,0x120mm', 'Packung (5kg)', 'Verzinkte Nägel für Dachlatten', now(), now()),
  (gen_random_uuid(), 'Schrauben 6x120mm', 'Packung (100 Stück)', 'Holzschrauben für Dachkonstruktionen', now(), now());

-- Holz
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Dachlatten 30x50mm', 'Meter', 'Imprägnierte Dachlatten', now(), now()),
  (gen_random_uuid(), 'Dachlatten 40x60mm', 'Meter', 'Imprägnierte Dachlatten, verstärkt', now(), now()),
  (gen_random_uuid(), 'Konterlatte 40x60mm', 'Meter', 'Imprägnierte Konterlatten', now(), now()),
  (gen_random_uuid(), 'OSB-Platte 22mm', 'm²', 'OSB-Platten für Dachschalung', now(), now()),
  (gen_random_uuid(), 'Konstruktionsholz 60x80mm', 'Meter', 'KVH für Dachkonstruktionen', now(), now()),
  (gen_random_uuid(), 'Konstruktionsholz 100x120mm', 'Meter', 'KVH für Dachkonstruktionen', now(), now());

-- Zubehör
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Entlüftungsziegel', 'Stück', 'Spezialziegel zur Dachentlüftung', now(), now()),
  (gen_random_uuid(), 'Schneefanggitter', 'Meter', 'Gitter zum Schutz vor Dachlawinen', now(), now()),
  (gen_random_uuid(), 'Dachfenster 78x118cm', 'Stück', 'Standardgröße für Dachfenster', now(), now()),
  (gen_random_uuid(), 'Laufrost', 'Meter', 'Sicherheitssteg für Schornsteinfeger', now(), now()),
  (gen_random_uuid(), 'Vogelschutzgitter', 'Meter', 'Gitter zum Schutz vor Vogeleinflug am Traufbereich', now(), now()),
  (gen_random_uuid(), 'Kaminanschlussblech', 'Stück', 'Anschlussblech für Schornsteine', now(), now());

-- Kleber und Dichtmassen
INSERT INTO materials (id, name, unit, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Bitumenkleber', 'Eimer (5kg)', 'Kaltkleber für Bitumenbahnen', now(), now()),
  (gen_random_uuid(), 'Dachdichtstoff', 'Kartusche (310ml)', 'Elastischer Dichtstoff für Dachanschlüsse', now(), now()),
  (gen_random_uuid(), 'PU-Schaum', 'Dose (750ml)', 'Montageschaum für Dacharbeiten', now(), now()),
  (gen_random_uuid(), 'Flüssigkunststoff', 'Eimer (5kg)', 'Zur Abdichtung von Details und Anschlüssen', now(), now()),
  (gen_random_uuid(), 'Bitumendichtmasse', 'Eimer (5kg)', 'Spachtelmasse für Bitumenabdichtungen', now(), now());

-- Überprüfe die hinzugefügten Materialien
SELECT name, unit, description FROM materials ORDER BY name;
