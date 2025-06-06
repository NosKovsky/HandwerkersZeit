-- Finale Erweiterungen für Voice Control Features
-- Nur ausführen wenn die Spalten noch nicht existieren

-- Erweitere project_todos um Voice Control Features
DO $$ 
BEGIN
    -- Füge priority Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_todos' AND column_name = 'priority') THEN
        ALTER TABLE project_todos ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;
    
    -- Füge category Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_todos' AND column_name = 'category') THEN
        ALTER TABLE project_todos ADD COLUMN category VARCHAR(50) DEFAULT 'work';
    END IF;
    
    -- Füge is_hidden_until Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_todos' AND column_name = 'is_hidden_until') THEN
        ALTER TABLE project_todos ADD COLUMN is_hidden_until TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Füge completed_at Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_todos' AND column_name = 'completed_at') THEN
        ALTER TABLE project_todos ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Erweitere time_entries um Pausenzeit
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'break_minutes') THEN
        ALTER TABLE time_entries ADD COLUMN break_minutes INTEGER DEFAULT 0;
    END IF;
END $$;

-- Erstelle Indizes für bessere Performance (nur wenn nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_project_todos_priority_category 
ON project_todos(priority, category, is_completed);

CREATE INDEX IF NOT EXISTS idx_project_todos_hidden_until 
ON project_todos(is_hidden_until) WHERE is_hidden_until IS NOT NULL;

-- Beispiel-Daten für Demo
INSERT INTO project_todos (project_id, content, priority, category, is_completed, created_by)
SELECT 
    p.id,
    '🛒 HÄNDLER: 3 Frankfurter Pfannen besorgen',
    'urgent',
    'urgent_material',
    false,
    (SELECT id FROM auth.users LIMIT 1)
FROM projects p 
WHERE p.name ILIKE '%schulze%' 
AND NOT EXISTS (
    SELECT 1 FROM project_todos pt 
    WHERE pt.content LIKE '%Frankfurter Pfannen%'
)
LIMIT 1;

-- Erfolgsmeldung
DO $$ 
BEGIN
    RAISE NOTICE 'Voice Control Features erfolgreich installiert! 🎤✅';
END $$;
