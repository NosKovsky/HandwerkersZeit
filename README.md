# HandwerksZeit - Digitale Baustellendokumentation

Eine moderne, KI-gestützte Web-Anwendung zur digitalen Dokumentation und Verwaltung von Baustellen für Handwerksbetriebe.

## 🚀 Features

### ✅ Implementiert
- **🔐 Benutzerauthentifizierung** - Sichere Anmeldung mit Supabase Auth
- **📊 Dashboard** - Übersichtliches Dashboard mit Statistiken und Schnellzugriff
- **🎤 Sprachsteuerung** - KI-gestützte Sprachbefehle für Navigation und Eingaben
- **⏰ Arbeitszeit-Tracking** - Ein-Klick Arbeitszeit beenden
- **📝 Zeiterfassung** - Detaillierte Arbeitszeit- und Tätigkeitsdokumentation
- **👥 Benutzerverwaltung** - Admin-Panel für Benutzer und Gruppen
- **🌓 Dark/Light Mode** - Umschaltbare Themes
- **📱 Responsive Design** - Optimiert für Desktop und Mobile

### 🚧 In Entwicklung
- **🏗️ Baustellen-Management** - Verwaltung von Projekten und Baustellen
- **📦 Materialverwaltung** - Erfassung und Verwaltung verwendeter Materialien
- **🧾 Belegverwaltung** - Digitale Quittungs- und Rechnungsverwaltung
- **👥 Kundenverwaltung** - Zentrale Kundendatenbank
- **📅 Kalender** - Termin- und Projektplanung
- **📊 Berichte** - Detaillierte Auswertungen und Analytics
- **💰 Rechnungsstellung** - Automatische Rechnungserstellung

### 🔮 Geplant
- **📸 Bildupload** - Dokumentation mit Fotos
- **💬 Aufgaben & Kommentare** - Team-Kommunikation
- **🖼️ Galerie** - Zentrale Bildübersicht
- **📱 PWA** - Progressive Web App Funktionalität
- **🔄 Offline-Modus** - Arbeiten ohne Internetverbindung
- **📤 Export-Funktionen** - PDF, Excel Export
- **🔔 Push-Benachrichtigungen** - Echtzeit-Updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **KI**: OpenAI GPT-4 für Sprachverarbeitung
- **Forms**: React Hook Form + Zod Validation
- **State Management**: React Context
- **Icons**: Lucide React
- **Maps**: Google Maps API (geplant)

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- OpenAI API Key (für KI-Features)
- Google Maps API Key (optional, für Standort-Features)

## 🚀 Installation

1. **Repository klonen**
   \`\`\`bash
   git clone https://github.com/yourusername/handwerks-zeit.git
   cd handwerks-zeit
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   npm install
   # oder
   yarn install
   \`\`\`

3. **Umgebungsvariablen konfigurieren**
   
   Erstellen Sie eine `.env.local` Datei im Projektroot:
   
   \`\`\`env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI (für KI-Features)
   OPENAI_API_KEY=sk-your_openai_api_key
   
   # Google Maps (optional)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Firebase (optional, für erweiterte Features)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

4. **Supabase Datenbank einrichten**
   
   Führen Sie die SQL-Scripts in folgender Reihenfolge aus:
   \`\`\`bash
   # Basis-Setup
   scripts/01-initialize-database.sql
   scripts/02-setup-security.sql
   scripts/03-setup-triggers.sql
   scripts/04-create-indexes.sql
   scripts/05-seed-data.sql
   
   # Admin-Account erstellen
   scripts/06-make-admin.sql
   
   # Erweiterte Features
   scripts/09-add-document-storage.sql
   scripts/10-add-groups-permissions.sql
   scripts/11-add-todo-enhancements.sql
   scripts/12-final-voice-features.sql
   scripts/13-add-invoicing-tables.sql
   scripts/14-add-material-inventory.sql
   scripts/15-add-meters-per-piece.sql
   \`\`\`

5. **Storage Buckets erstellen**
   
   Erstellen Sie in Supabase Storage folgende Buckets:
   - `entryimages` (public) - Für Arbeitsfotos
   - `receiptimages` (public) - Für Belege
   - `documents` (public) - Für Dokumente

6. **Entwicklungsserver starten**
   \`\`\`bash
   npm run dev
   # oder
   yarn dev
   \`\`\`

  Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🛠️ Entwicklungsumgebung einrichten

Damit Tests und Linting reibungslos funktionieren, müssen nach der Installation
alle Abhängigkeiten und die Playwright-Browser eingerichtet werden.

1. **Pakete installieren**

   Falls noch nicht geschehen, installiere zunächst alle npm-Pakete (inklusive
   `next`):

   ```bash
   npm install
   ```

2. **Playwright-Browser installieren**

   Richte anschließend die von Playwright benötigten Browser ein:

   ```bash
   npx playwright install
   ```

Ohne diese Schritte schlagen `npm test` und `npm run lint` fehl.

## 📁 Projektstruktur

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard
│   ├── entries/           # Zeiterfassung
│   ├── baustellen/        # Baustellen-Management
│   ├── materials/         # Materialverwaltung
│   ├── customers/         # Kundenverwaltung
│   ├── receipts/          # Belegverwaltung
│   ├── calendar/          # Kalender
│   ├── reports/           # Berichte
│   ├── invoicing/         # Rechnungsstellung
│   ├── settings/          # Einstellungen
│   └── users/             # Benutzerverwaltung
├── components/            # React Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   ├── auth/             # Authentifizierung
│   ├── layout/           # Layout Komponenten
│   ├── dashboard/        # Dashboard Widgets
│   ├── entries/          # Zeiterfassung
│   ├── baustellen/       # Baustellen
│   ├── materials/        # Materialien
│   ├── customers/        # Kunden
│   └── [feature]/        # Feature-spezifische Komponenten
├── contexts/             # React Contexts
├── lib/                  # Utilities und Konfiguration
│   ├── supabase/         # Supabase Client Setup
│   ├── openai.ts         # OpenAI Integration
│   └── utils.ts          # Utility Funktionen
├── types/                # TypeScript Typen
├── scripts/              # Datenbank Scripts
└── public/               # Statische Assets
\`\`\`

## 🗄️ Datenbank Schema

### Haupttabellen:
- **`profiles`** - Benutzerprofile und Rollen
- **`projects`** - Baustellen/Projekte
- **`materials`** - Materialstammdaten
- **`entries`** - Arbeitseinträge und Zeiterfassung
- **`entry_images`** - Bilder zu Einträgen
- **`receipts`** - Quittungen und Belege
- **`customers`** - Kundendaten
- **`comments`** - Aufgaben und Kommentare
- **`invoices`** - Rechnungen (geplant)
- **`time_entries`** - Detaillierte Zeiterfassung (optional)

## 🔐 Authentifizierung & Sicherheit

- **Supabase Auth** - Sichere Benutzerauthentifizierung
- **Row Level Security (RLS)** - Datenschutz auf Datenbankebene
- **Rollenbasierte Zugriffskontrolle** - Admin/User/Viewer Rollen
- **JWT Tokens** - Sichere Session-Verwaltung
- **API Key Management** - Sichere Verwaltung von API-Schlüsseln

## 🎤 KI-Features

### Sprachsteuerung:
- **Dashboard Navigation** - "Gehe zu Zeiterfassung"
- **Eintrag erstellen** - "Neuer Eintrag für Projekt X"
- **Arbeitszeit beenden** - "Arbeitszeit beenden"
- **Suche** - "Suche Projekt Musterhaus"

### Geplante KI-Features:
- **Automatische Kategorisierung** - Intelligente Zuordnung von Einträgen
- **Sprache-zu-Text** - Diktat für Notizen und Beschreibungen
- **Kostenschätzung** - KI-basierte Projektkalkulationen
- **Anomalie-Erkennung** - Ungewöhnliche Arbeitszeiten oder Kosten

## 📱 Deployment

### Vercel (Empfohlen)
1. Repository zu GitHub pushen
2. Vercel Account mit GitHub verbinden
3. Projekt importieren
4. Umgebungsvariablen konfigurieren
5. Automatisches Deployment bei Git Push

### Andere Plattformen
- **Netlify** - Statische Deployment-Option
- **Railway** - Full-Stack Deployment
- **DigitalOcean App Platform** - Container-basiert
- **AWS Amplify** - AWS-native Lösung

## 🔧 Entwicklung

### Verfügbare Scripts:
\`\`\`bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # Code Linting
npm run type-check   # TypeScript Überprüfung
\`\`\`

### Code-Qualität:
- **TypeScript** - Typsicherheit
- **ESLint** - Code-Qualität
- **Prettier** - Code-Formatierung
- **Husky** - Git Hooks (geplant)

## 🧪 Testing (Geplant)

- **Jest** - Unit Tests
- **React Testing Library** - Component Tests
- **Cypress** - E2E Tests
- **Playwright** - Browser Tests

## 📊 Monitoring & Analytics (Geplant)

- **Vercel Analytics** - Performance Monitoring
- **Sentry** - Error Tracking
- **PostHog** - User Analytics
- **Supabase Metrics** - Database Monitoring

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

### Entwicklungsrichtlinien:
- Verwenden Sie TypeScript für alle neuen Dateien
- Folgen Sie den bestehenden Code-Konventionen
- Schreiben Sie aussagekräftige Commit-Messages
- Testen Sie Ihre Änderungen gründlich
- Dokumentieren Sie neue Features

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support & Hilfe

### Dokumentation:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Support-Kanäle:
- **GitHub Issues** - Bug Reports und Feature Requests
- **Discussions** - Community Support
- **Wiki** - Erweiterte Dokumentation (geplant)

## 🚧 Roadmap

### Version 1.0 (Q1 2024)
- ✅ Basis-Dashboard
- ✅ Benutzerauthentifizierung
- ✅ Sprachsteuerung
- ✅ Vollständige Zeiterfassung
- 🚧 Baustellen-Management
- 🚧 Materialverwaltung

### Version 1.1 (Q2 2024)
- 📋 Kalender-Integration
- 📋 Erweiterte Berichte
- 📋 Mobile App (PWA)
- 📋 Offline-Funktionalität

### Version 1.2 (Q3 2024)
- 📋 Rechnungsstellung
- 📋 Export-Funktionen
- 📋 Team-Kollaboration
- 📋 API für Drittanbieter

### Version 2.0 (Q4 2024)
- 📋 KI-Assistenten
- 📋 Erweiterte Analytics
- 📋 Multi-Mandanten-Fähigkeit
- 📋 Enterprise Features

## 🏆 Acknowledgments

- **Supabase** - Backend-as-a-Service
- **Vercel** - Hosting und Deployment
- **OpenAI** - KI-Integration
- **shadcn/ui** - UI-Komponenten
- **Lucide** - Icons
- **Tailwind CSS** - Styling Framework

---

**HandwerksZeit** - Digitalisierung für das moderne Handwerk 🔨⚡
\`\`\`

Die README ist jetzt vollständig aktualisiert mit:

1. **Aktueller Projektstatus** - Was funktioniert, was in Entwicklung ist
2. **Vollständige Installation** - Schritt-für-Schritt Anleitung
3. **Detaillierte Projektstruktur** - Übersicht aller Komponenten
4. **KI-Features** - Sprachsteuerung und geplante Features
5. **Deployment-Optionen** - Verschiedene Hosting-Möglichkeiten
6. **Entwicklungs-Roadmap** - Klare Versionsplanung
7. **Support & Dokumentation** - Hilfe-Ressourcen
