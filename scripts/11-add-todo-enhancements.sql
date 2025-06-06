-- Erweitere project_todos Tabelle um neue Felder
ALTER TABLE project_todos 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'work',
ADD COLUMN IF NOT EXISTS is_hidden_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Erweitere time_entries um Pausenzeit
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;

-- Index für bessere Performance bei wichtigen Todos
CREATE INDEX IF NOT EXISTS idx_project_todos_priority_category 
ON project_todos(priority, category, is_completed);

-- Index für ausgeblendete Todos
CREATE INDEX IF NOT EXISTS idx_project_todos_hidden_until 
ON project_todos(is_hidden_until) WHERE is_hidden_until IS NOT NULL;

-- Kommentar für bessere Dokumentation
COMMENT ON COLUMN project_todos.priority IS 'Priorität: low, medium, high, urgent';
COMMENT ON COLUMN project_todos.category IS 'Kategorie: work, material, urgent_material';
COMMENT ON COLUMN project_todos.is_hidden_until IS 'Ausgeblendet bis zu diesem Zeitpunkt';
