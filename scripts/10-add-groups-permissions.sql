-- Tabelle für Benutzergruppen (Azubi, Geselle, Meister, etc.)
CREATE TABLE IF NOT EXISTS public.user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex-Farbe für UI
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Berechtigungen
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL, -- z.B. 'entries', 'projects', 'users', 'reports'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verknüpfungstabelle zwischen Gruppen und Berechtigungen
CREATE TABLE IF NOT EXISTS public.group_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, permission_id)
);

-- Erweitere profiles Tabelle um Gruppe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'group_id'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN group_id UUID REFERENCES public.user_groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Weitere Profilfelder hinzufügen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN phone VARCHAR(50),
        ADD COLUMN address TEXT,
        ADD COLUMN birth_date DATE,
        ADD COLUMN hire_date DATE,
        ADD COLUMN hourly_rate DECIMAL(10,2),
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Standard-Berechtigungen einfügen
INSERT INTO public.permissions (name, description, category) VALUES
    ('entries.create', 'Arbeitszeiten erfassen', 'entries'),
    ('entries.edit_own', 'Eigene Arbeitszeiten bearbeiten', 'entries'),
    ('entries.edit_all', 'Alle Arbeitszeiten bearbeiten', 'entries'),
    ('entries.delete_own', 'Eigene Arbeitszeiten löschen', 'entries'),
    ('entries.delete_all', 'Alle Arbeitszeiten löschen', 'entries'),
    ('entries.view_all', 'Alle Arbeitszeiten einsehen', 'entries'),
    
    ('projects.create', 'Baustellen erstellen', 'projects'),
    ('projects.edit', 'Baustellen bearbeiten', 'projects'),
    ('projects.delete', 'Baustellen löschen', 'projects'),
    ('projects.view_all', 'Alle Baustellen einsehen', 'projects'),
    
    ('customers.create', 'Kunden erstellen', 'customers'),
    ('customers.edit', 'Kunden bearbeiten', 'customers'),
    ('customers.delete', 'Kunden löschen', 'customers'),
    ('customers.view_all', 'Alle Kunden einsehen', 'customers'),
    
    ('users.create', 'Benutzer erstellen', 'users'),
    ('users.edit', 'Benutzer bearbeiten', 'users'),
    ('users.delete', 'Benutzer löschen', 'users'),
    ('users.view_all', 'Alle Benutzer einsehen', 'users'),
    
    ('reports.view', 'Berichte einsehen', 'reports'),
    ('reports.export', 'Daten exportieren', 'reports'),
    
    ('materials.create', 'Materialien erstellen', 'materials'),
    ('materials.edit', 'Materialien bearbeiten', 'materials'),
    ('materials.delete', 'Materialien löschen', 'materials')
ON CONFLICT (name) DO NOTHING;

-- Standard-Gruppen erstellen
INSERT INTO public.user_groups (name, description, color, sort_order) VALUES
    ('Azubi', 'Auszubildende mit eingeschränkten Rechten', '#10B981', 1),
    ('Geselle', 'Gesellen mit Standard-Arbeitsrechten', '#3B82F6', 2),
    ('Meister', 'Meister mit erweiterten Rechten', '#F59E0B', 3),
    ('Bauleiter', 'Bauleiter mit Projektverantwortung', '#EF4444', 4),
    ('Administrator', 'Vollzugriff auf alle Funktionen', '#8B5CF6', 5)
ON CONFLICT (name) DO NOTHING;

-- Standard-Berechtigungen für Gruppen zuweisen
DO $$
DECLARE
    azubi_id UUID;
    geselle_id UUID;
    meister_id UUID;
    bauleiter_id UUID;
    admin_id UUID;
BEGIN
    -- Gruppen-IDs abrufen
    SELECT id INTO azubi_id FROM public.user_groups WHERE name = 'Azubi';
    SELECT id INTO geselle_id FROM public.user_groups WHERE name = 'Geselle';
    SELECT id INTO meister_id FROM public.user_groups WHERE name = 'Meister';
    SELECT id INTO bauleiter_id FROM public.user_groups WHERE name = 'Bauleiter';
    SELECT id INTO admin_id FROM public.user_groups WHERE name = 'Administrator';
    
    -- Azubi-Berechtigungen (nur eigene Einträge)
    INSERT INTO public.group_permissions (group_id, permission_id)
    SELECT azubi_id, id FROM public.permissions 
    WHERE name IN ('entries.create', 'entries.edit_own', 'entries.view_all', 'projects.view_all')
    ON CONFLICT DO NOTHING;
    
    -- Geselle-Berechtigungen (erweiterte Eintragsrechte)
    INSERT INTO public.group_permissions (group_id, permission_id)
    SELECT geselle_id, id FROM public.permissions 
    WHERE name IN (
        'entries.create', 'entries.edit_own', 'entries.delete_own', 'entries.view_all',
        'projects.view_all', 'customers.view_all', 'materials.create'
    )
    ON CONFLICT DO NOTHING;
    
    -- Meister-Berechtigungen (Projektrechte)
    INSERT INTO public.group_permissions (group_id, permission_id)
    SELECT meister_id, id FROM public.permissions 
    WHERE name IN (
        'entries.create', 'entries.edit_own', 'entries.edit_all', 'entries.delete_own', 'entries.view_all',
        'projects.create', 'projects.edit', 'projects.view_all',
        'customers.create', 'customers.edit', 'customers.view_all',
        'materials.create', 'materials.edit', 'reports.view'
    )
    ON CONFLICT DO NOTHING;
    
    -- Bauleiter-Berechtigungen (fast alle Rechte)
    INSERT INTO public.group_permissions (group_id, permission_id)
    SELECT bauleiter_id, id FROM public.permissions 
    WHERE name NOT IN ('users.create', 'users.edit', 'users.delete')
    ON CONFLICT DO NOTHING;
    
    -- Administrator-Berechtigungen (alle Rechte)
    INSERT INTO public.group_permissions (group_id, permission_id)
    SELECT admin_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;
END $$;

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON public.profiles(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON public.group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id ON public.group_permissions(permission_id);

-- Trigger für updated_at
CREATE TRIGGER set_user_groups_updated_at
BEFORE UPDATE ON public.user_groups
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Kommentare
COMMENT ON TABLE public.user_groups IS 'Benutzergruppen wie Azubi, Geselle, Meister etc.';
COMMENT ON TABLE public.permissions IS 'Systemberechtigungen für verschiedene Aktionen';
COMMENT ON TABLE public.group_permissions IS 'Verknüpfung zwischen Gruppen und Berechtigungen';
