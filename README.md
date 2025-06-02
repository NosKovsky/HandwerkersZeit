# AI Work Tracker - Baustellendokumentation

Eine moderne Web-Anwendung zur digitalen Dokumentation von Baustellen mit KI-unterstützten Features.

## 🚀 Features

- **Benutzerauthentifizierung** mit Supabase Auth
- **Projektmanagement** - Verwaltung von Baustellen
- **Zeiterfassung** - Dokumentation von Arbeitszeiten und Tätigkeiten
- **Materialverwaltung** - Erfassung verwendeter Materialien
- **Bildupload** - Dokumentation mit Fotos
- **Quittungsmanagement** - Digitale Belegverwaltung
- **Aufgaben & Kommentare** - Kommunikation und Aufgabenverfolgung
- **Galerie** - Zentrale Bildübersicht
- **Responsive Design** - Optimiert für Desktop und Mobile
- **Dark/Light Mode** - Anpassbare Benutzeroberfläche

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod Validation
- **State Management**: React Context
- **Icons**: Lucide React

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- (Optional) OpenAI API Key für KI-Features

## 🚀 Installation

1. **Repository klonen**
   \`\`\`bash
   git clone https://github.com/yourusername/ai-work-tracker.git
   cd ai-work-tracker
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   npm install
   # oder
   yarn install
   \`\`\`

3. **Umgebungsvariablen konfigurieren**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Füllen Sie die `.env.local` mit Ihren Supabase-Daten:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

4. **Supabase Datenbank einrichten**
   
   Führen Sie das SQL-Script aus `database.sql` in Ihrem Supabase SQL Editor aus.

5. **Storage Buckets erstellen**
   
   Erstellen Sie in Supabase Storage folgende Buckets:
   - `entryimages` (public)
   - `receiptimages` (public)

6. **Entwicklungsserver starten**
   \`\`\`bash
   npm run dev
   # oder
   yarn dev
   \`\`\`

   Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 📁 Projektstruktur

\`\`\`
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentifizierung
│   ├── dashboard/         # Dashboard
│   ├── entries/           # Einträge
│   ├── projects/          # Projekte
│   ├── materials/         # Materialien
│   ├── tasks/             # Aufgaben
│   ├── receipts/          # Quittungen
│   ├── gallery/           # Galerie
│   └── settings/          # Einstellungen
├── components/            # React Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   ├── auth/             # Auth Komponenten
│   ├── layout/           # Layout Komponenten
│   └── [feature]/        # Feature-spezifische Komponenten
├── contexts/             # React Contexts
├── lib/                  # Utilities und Konfiguration
│   └── supabase/         # Supabase Client Setup
├── types/                # TypeScript Typen
└── database.sql          # Datenbank Schema
\`\`\`

## 🗄️ Datenbank Schema

Das Projekt verwendet folgende Haupttabellen:

- `profiles` - Benutzerprofile
- `projects` - Baustellen/Projekte
- `materials` - Materialstammdaten
- `entries` - Arbeitseinträge
- `entry_images` - Bilder zu Einträgen
- `receipts` - Quittungen
- `comments` - Aufgaben und Kommentare

## 🔐 Authentifizierung

- Registrierung und Anmeldung über Supabase Auth
- Rollenbasierte Zugriffskontrolle (Admin/User)
- Row Level Security (RLS) für Datenschutz

## 📱 Deployment

### Vercel (Empfohlen)

1. Repository zu GitHub pushen
2. Vercel Account verbinden
3. Umgebungsvariablen in Vercel konfigurieren
4. Automatisches Deployment bei Git Push

### Andere Plattformen

Das Projekt kann auf jeder Next.js-kompatiblen Plattform deployed werden:
- Netlify
- Railway
- DigitalOcean App Platform

## 🔧 Konfiguration

### Supabase Setup

1. Neues Projekt in Supabase erstellen
2. SQL Schema aus `database.sql` ausführen
3. Storage Buckets erstellen
4. RLS Policies aktivieren
5. API Keys kopieren

### Optional: OpenAI Integration

Für KI-Features (Spracheingabe, automatische Kategorisierung):
\`\`\`env
OPENAI_API_KEY=sk-your_openai_api_key
\`\`\`

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe `LICENSE` Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- Dokumentation prüfen
- Supabase Docs konsultieren

## 🚧 Roadmap

- [ ] KI-gestützte Spracheingabe
- [ ] Export-Funktionen (PDF, Excel)
- [ ] Push-Benachrichtigungen
- [ ] Erweiterte Kalenderansicht
- [ ] Mobile App (React Native)
- [ ] Offline-Funktionalität
\`\`\`

\`\`\`plaintext file="LICENSE"
MIT License

Copyright (c) 2024 AI Work Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
