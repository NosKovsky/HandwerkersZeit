-- Erweiterung der Materialien-Tabelle um Bestandsverwaltung

-- Hinzufügen von Spalten für Bestandsverwaltung
ALTER TABLE materials ADD COLUMN IF NOT EXISTS current_stock NUMERIC DEFAULT 0;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS min_stock NUMERIC DEFAULT 10;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Tabelle für Bestandsbewegungen
CREATE TABLE IF NOT EXISTS material_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('add', 'remove', 'adjust')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger für automatische Bestandsaktualisierung
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'add' THEN
    UPDATE materials SET 
      current_stock = current_stock + NEW.quantity,
      last_updated = NOW()
    WHERE id = NEW.material_id;
  ELSIF NEW.transaction_type = 'remove' THEN
    UPDATE materials SET 
      current_stock = GREATEST(0, current_stock - NEW.quantity),
      last_updated = NOW()
    WHERE id = NEW.material_id;
  ELSIF NEW.transaction_type = 'adjust' THEN
    UPDATE materials SET 
      current_stock = NEW.quantity,
      last_updated = NOW()
    WHERE id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS material_transaction_trigger ON material_transactions;
CREATE TRIGGER material_transaction_trigger
AFTER INSERT ON material_transactions
FOR EACH ROW
EXECUTE FUNCTION update_material_stock();

-- Automatische Bestandsreduzierung bei Verwendung von Materialien in Einträgen
CREATE OR REPLACE FUNCTION reduce_material_stock_on_entry()
RETURNS TRIGGER AS $$
DECLARE
  material_item RECORD;
BEGIN
  -- Für jedes Material im Eintrag
  FOR material_item IN 
    SELECT material_id, quantity FROM entry_materials WHERE entry_id = NEW.id
  LOOP
    -- Bestandstransaktion erstellen
    INSERT INTO material_transactions (
      material_id, 
      project_id, 
      quantity, 
      transaction_type, 
      notes, 
      created_by
    ) VALUES (
      material_item.material_id,
      NEW.project_id,
      material_item.quantity,
      'remove',
      'Automatisch abgezogen durch Eintrag ID: ' || NEW.id,
      NEW.created_by
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entry_material_stock_trigger ON entries;
CREATE TRIGGER entry_material_stock_trigger
AFTER INSERT ON entries
FOR EACH ROW
EXECUTE FUNCTION reduce_material_stock_on_entry();

-- Beispieldaten für Materialbestand
UPDATE materials SET current_stock = 100, min_stock = 20, unit_price = 2.50 WHERE name LIKE '%Dachziegel%';
UPDATE materials SET current_stock = 50, min_stock = 10, unit_price = 5.75 WHERE name LIKE '%Dachlatten%';
UPDATE materials SET current_stock = 200, min_stock = 50, unit_price = 0.25 WHERE name LIKE '%Schrauben%';
UPDATE materials SET current_stock = 15, min_stock = 5, unit_price = 12.99 WHERE name LIKE '%Dichtung%';
