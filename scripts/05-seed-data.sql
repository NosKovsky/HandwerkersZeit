-- Beispiel-Materialien hinzufügen
INSERT INTO materials (name, unit, description) VALUES
('Zement', 'Sack', 'Portland Zement 25kg'),
('Sand', 'm³', 'Bausand gewaschen'),
('Kies', 'm³', 'Rundkies 8-16mm'),
('Bewehrungsstahl', 'kg', 'Betonstahl BSt 500'),
('Schalungsbretter', 'm²', 'Fichtenbretter 24mm'),
('Isolierung', 'm²', 'Dämmplatten XPS'),
('Ziegel', 'Stk', 'Hochlochziegel 17,5cm'),
('Mörtel', 'Sack', 'Dünnbettmörtel 25kg')
ON CONFLICT DO NOTHING;

-- Beispiel-Projekt hinzufügen
INSERT INTO projects (name, address, description) VALUES
('Einfamilienhaus Mustermann', 'Musterstraße 123, 12345 Musterstadt', 'Neubau eines Einfamilienhauses mit Keller und Garage')
ON CONFLICT DO NOTHING;

SELECT 'Beispieldaten erfolgreich eingefügt!' AS status;
