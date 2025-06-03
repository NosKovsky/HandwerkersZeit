-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_project_id ON entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entry_images_entry_id ON entry_images(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_entry_id ON comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project_id ON receipts(project_id);

SELECT 'Indizes erfolgreich erstellt!' AS status;
