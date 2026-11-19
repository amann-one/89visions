# Bucket List

Eine kleine, mobile-first Bucket-List-App mit **Expo / React Native**. Datenbank und Fotos liegen beide in **Supabase** (Postgres + Storage).

Ziele anlegen, planen, abhaken – und aus erledigten Zielen werden Erinnerungen mit Foto, Datum und Bewertung.

## Features

- **Bucket List** mit Suche, Kategorien, Favoriten und Fortschrittsanzeige
- **Status-Workflow**: Idee → Geplant → Erledigt
- **Zieltermin** mit Countdown („in 43 Tagen")
- **Fotos** per Galerie oder Kamera, automatisch verkleinert (1600 px + Thumbnail)
- **Erinnerungen**: erledigte Ziele nach Jahr gruppiert, als große Fotokarten
- **Statistik**: Fortschritt, Kategorien, Erlebnisse pro Jahr, offenes Budget
- **Zufalls-Ziel** (🎲) für Entscheidungsschwierigkeiten
- **Demo-Daten** per Knopfdruck in der leeren Liste
- Geräteübergreifend, sobald Supabase verbunden ist

## Schnellstart

```bash
npm install
Copy-Item .env.example .env   # macOS/Linux: cp .env.example .env
npm start
```

Ohne ausgefüllte `.env` zeigt die App einen Einrichtungs-Screen mit den nächsten Schritten. Sobald die Supabase-Werte gesetzt sind, läuft alles normal.

> Alle verwendeten nativen Module (`expo-image-picker`, `expo-image-manipulator`, `expo-crypto`) sind in Expo Go enthalten. Ein Development Build ist erst nötig, wenn du eigene native Module ergänzt.

## Supabase einrichten

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im **SQL Editor** den kompletten Inhalt von [`supabase/schema.sql`](supabase/schema.sql) ausführen. Das legt an:
   - die Tabellen `items` und `photos` (inkl. Indizes, Constraints, Cascade-Delete)
   - Row Level Security (Ausgangsbasis) und den öffentlichen Storage-Bucket `bucket-list`
   Danach den Inhalt von [`supabase/migration-multi-user.sql`](supabase/migration-multi-user.sql) ausführen: Das macht aus der App eine Multi-User-App (siehe unten).
3. Unter **Project Settings → API** die **Project URL** und den **anon public Key** kopieren.
4. `.env` ausfüllen:

```env
EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
EXPO_PUBLIC_SUPABASE_BUCKET=bucket-list
```

5. Dev-Server neu starten (Env-Variablen werden nur beim Start gelesen).

### Wie die Daten liegen

- `items` – ein Ziel pro Zeile (Titel, Notiz, Kategorie, Status, Zieltermin, Ort, Budget, Bewertung, Favorit, `deleted_at` für Soft-Delete).
- `photos` – ein Foto pro Zeile mit öffentlicher URL, Thumbnail-URL, Storage-Pfad und Maßen.
- Storage – jedes Foto liegt als `<userId>/<itemId>/<uuid>.jpg` plus `-thumb.jpg`. In der Datenbank stehen nur URLs und Pfade, nie Bild-Binärdaten.

### Konten und Sicherheit

Jede Person registriert sich mit E-Mail und Passwort und hat ihre eigene, private Bucket List.

- `items` und `photos` haben eine Spalte `user_id` (Standard `auth.uid()`). Row Level Security erlaubt nur Zugriff auf eigene Zeilen.
- Storage-Uploads, -Änderungen und -Löschungen sind nur im eigenen Ordner `<userId>/…` erlaubt. Lesen ist öffentlich (die URLs sind nicht erratbar).
- Vorhandene Einträge aus der Zeit vor den Konten gehören dem ersten Konto, das sich registriert.
- In Supabase unter **Authentication → Providers → Email** lässt sich die E-Mail-Bestätigung ein- oder ausschalten. Bei eingeschalteter Bestätigung muss jede neue Person erst den Link in der Mail öffnen.
- Für die Web-Version unter **Authentication → URL Configuration** die Adresse der gehosteten App als Site URL eintragen.

## Projektstruktur

```
src/
  app/
    _layout.tsx           Root-Stack, Setup-Guard über Stack.Protected
    setup.tsx             Einrichtungs-Screen bei fehlender .env
    (tabs)/
      _layout.tsx         Native Tabs
      index.tsx           Bucket List
      memories.tsx        Erledigte Ziele als Erinnerungen
      stats.tsx           Statistik
    item/[id].tsx         Detailansicht
    edit.tsx              Anlegen/Bearbeiten (Modal)
  components/bucket/      ItemCard, Chips, Foto-Strip, EmptyState …
  components/setup/       SupabaseSetup
  components/ui/          Screen, Button
  hooks/use-bucket-data.ts
  lib/
    supabase.ts           Client, Env-Konfiguration, isSupabaseConfigured
    models.ts             Typen, Kategorien, Status
    repository.ts         Alle Postgres-Queries (supabase-js)
    storage.ts            Bildaufbereitung + Storage-Upload/Delete
    format.ts             Datum, Countdown, Euro
supabase/
  schema.sql              Tabellen, RLS, Bucket + Policies
  migration-multi-user.sql  Konten: user_id, Policies pro Nutzer, Storage-Schutz
```

## Bewusste Entscheidungen

| Entscheidung | Warum |
| --- | --- |
| Supabase für DB **und** Storage | Ein Anbieter, ein Client, ein Key. Kein zweites System zum Pflegen. |
| `supabase-js` statt eigener HTTP-Aufrufe | Eingebaute Fehlerbehandlung, Storage-API und späterer Auth-Anschluss ohne Umbau. |
| Offene RLS-Policies ohne Login | Persönliche App, kein Multi-Tenant. Dokumentierter Upgrade-Pfad über `user_id`. |
| Client-seitige Suche/Filterung | Kleine Datenmengen, sofortige Suche ohne Query pro Tastendruck. |
| Nur URLs in der DB | Postgres bleibt schlank, Bilder werden über CDN ausgeliefert. |
| Soft-Delete (`deleted_at`) | Erleichtert späteres Undo und Sync. |
| Zwei Bildgrößen pro Foto | Listen laden Thumbnails (480 px), Detailansicht das große Bild (1600 px). |

## Nächste Schritte (Ideen)

- Erinnerungen/Benachrichtigungen für Zieltermine (`expo-notifications`)
- Karte mit geplanten und erlebten Orten (`react-native-maps`)
- Teilen als Poster-Bild (`react-native-view-shot`)
- Gemeinsame Listen per Invite-Code (Supabase Auth + `list_id`)
- Home-Screen-Widget mit dem nächsten Ziel
- Offline-Cache der letzten Daten (`expo-sqlite` nur als Read-Cache, Quelle bleibt Supabase)
- Easter Egg: Konfetti-Animation beim Abhaken
