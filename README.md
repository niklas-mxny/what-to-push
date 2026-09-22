# What to Push

Ein Brawl Stars Tracker: zeigt dir, basierend auf der aktuellen Map-Rotation, deinen
eigenen Brawler-Stats und deinem persönlichen Ziel (Standard: "jeden Brawler auf
Prestige 1 bringen"), welchen Brawler du gerade am besten pushen solltest.

Prestige (seit dem Februar-2026-Update) ist Trophäen-basiert: Ab 1000 Trophäen auf
einem Brawler werden diese dauerhaft (kein Saison-Reset mehr) — das ist Prestige 1.
2000 → Prestige 2, 3000 → Prestige 3 (Maximum).

## Setup

### 1. Node.js Abhängigkeiten

```bash
npm install
```

### 2. Supercell API Key besorgen

Die Brawl-Stats-Daten (dein Spielerprofil, aktuelle Event-Rotation) kommen von der
offiziellen [Supercell Brawl Stars API](https://developer.brawlstars.com). Diese API
erfordert einen Key, der an eine **feste IP-Adresse** gebunden ist — Anfragen von
anderen IPs werden abgelehnt.

1. Auf [developer.brawlstars.com](https://developer.brawlstars.com) registrieren/einloggen.
2. Einen neuen Key erstellen.
3. Als "erlaubte IP" deine aktuelle öffentliche IP eintragen (findest du z.B. mit
   `curl ifconfig.me`). Für lokale Entwicklung reicht deine Heim-IP — beachte aber,
   dass sich diese ändern kann (z.B. nach Router-Neustart), dann muss der Key
   aktualisiert werden.
4. `.env.local.example` zu `.env.local` kopieren und den Key eintragen:

   ```bash
   cp .env.local.example .env.local
   ```

### 3. Datenbank (Accounts/Profile)

Nutzt SQLite über Node.js' eingebautes `node:sqlite` (Node ≥ 22.5, experimentell,
aber stabil genug — kein zusätzliches Paket, keine native Kompilierung nötig). Die
Datei wird beim ersten Start automatisch unter `data/app.db` angelegt, inkl. Schema.
Kein manueller Setup-Schritt nötig, aber: Serverless-Hosting (Vercel) funktioniert
damit **nicht** (kein persistentes Dateisystem) — passt aber zum ohnehin nötigen
VPS für die feste IP der Supercell API (siehe unten).

### 4. Dev-Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Deployment / feste IP

Für den produktiven Betrieb braucht der Server, der die API-Routes ausführt, ebenfalls
eine feste, bei Supercell freigegebene IP. Klassisches Serverless-Hosting (z.B. Vercel)
hat **keine** feste ausgehende IP — Optionen:

- **VPS mit fester IP** (z.B. Hetzner, DigitalOcean): einfachste Lösung, IP direkt bei
  Supercell whitelisten.
- **Vercel + Zwischen-Proxy** mit fester IP (z.B. ein kleiner Server, der die
  Supercell-Requests weiterleitet).

Das Projekt selbst ist Hosting-agnostisch — die API-Anbindung liegt komplett in
[`src/lib/supercell.ts`](src/lib/supercell.ts).

## Architektur

- **Next.js App Router**, TypeScript, Tailwind CSS.
- `src/lib/supercell.ts` — Server-seitiger Client für die offizielle Supercell API
  (Spielerdaten, Brawler-Liste, aktuelle Event-Rotation). Der API-Key wird **nie** an
  den Browser gesendet, nur in den API-Routes unter `src/app/api/*` verwendet.
- `src/lib/brawlapi.ts` — Nutzt die kostenlose, keyless [BrawlAPI](https://brawlapi.com)
  nur für Brawler-Icons/Seltenheit und Map-Vorschaubilder (die offizielle API liefert
  dafür keine Bild-URLs).
- `src/lib/roles.ts` + `src/lib/mode-weights.ts` — Eigene, heuristische
  Empfehlungs-Datenbasis (Brawler-Rolle × Spielmodus-Gewichtung). **Wichtig:** Es gibt
  aktuell keine verlässliche öffentliche API für echte Meta-Winrate-Daten pro
  Brawler/Map — die hier hinterlegten Gewichtungen sind ein Startpunkt basierend auf
  bekannten Rollen-Synergien, kein gemessener Wert. Beide Dateien sind bewusst simpel
  gehalten und leicht erweiter-/korrigierbar.
- `src/lib/recommend.ts` — Kombiniert drei Faktoren zu einer Empfehlung pro aktivem
  Modus/Map-Slot: Rollen-Fit als Winrate-Stellvertreter, Build-Qualität (Power-Level +
  freigeschaltete Star Power/Gadget — ein stärker ausgebauter Brawler performt real
  besser) und Nähe zum nächsten Ziel-Meilenstein (ein Brawler kurz vor Prestige 1 wird
  bevorzugt vor einem bei 0 Trophäen). Bei einem Konto-weiten Ziel (Trophäen gesamt)
  entfällt der Meilenstein-Faktor, da es kein Pro-Brawler-Ziel gibt.
- `src/lib/storage.ts` — Spieler-Tag, Ziel und Sprache für die Empfehlungs-Engine
  werden lokal im Browser (`localStorage`) gespeichert — unabhängig vom Account-System
  (siehe unten), kein Login nötig, um die App zu nutzen.
- `src/lib/db.ts` + `src/lib/auth.ts` — Accounts/Sessions: SQLite (`node:sqlite`,
  siehe Setup), Passwort-Hashing mit Node's `crypto.scrypt` (kein externes Paket),
  Session-Tokens in einer `sessions`-Tabelle, referenziert über ein httpOnly-Cookie.
  Kein OAuth/Verifizierung des Brawl-Stars-Tags möglich (Supercell bietet keine
  Spieler-seitige Autorisierung) — das Verknüpfen eines Tags ist wie bei anderen
  Fan-Seiten eine reine Selbstangabe.
- `/login`, `/signup`, `/search`, `/profile/[username]` — Account-Erstellung, Suche
  nach registrierten Nutzernamen ODER direkt nach einem Brawl-Stars-Tag (auch ohne
  Account), und ein öffentliches Profil mit den wichtigsten Live-Statistiken
  (Trophäen, Prestige gesamt, EP-Level, 3v3-Siege, freigeschaltete Brawler).
  Profile sind bewusst öffentlich einsehbar (wie ein Leaderboard) — zeigen aber nur
  ohnehin über die Supercell API öffentliche Spieldaten, keine privaten Kontodaten.
- `src/lib/i18n/` — Eigenes, leichtgewichtiges i18n-System (kein Routing, rein
  client-seitig über `localStorage`): 10 Sprachen (Englisch als Standard, dazu Spanisch,
  Portugiesisch, Französisch, Deutsch, Russisch, Japanisch, Koreanisch, Chinesisch,
  Arabisch inkl. RTL-Layout). Übersetzt wird nur die eigene UI — Brawler-, Modus- und
  Map-Namen kommen unverändert von den APIs (Englisch/Originalnamen).

## Bekannte Grenzen

- Build-Empfehlungen (Star Power/Gadget/Gears) zeigen aktuell nur, was du bereits
  freigeschaltet hast — es gibt bewusst keine fest hinterlegten "beste Builds pro
  Brawler", da sich das mit jedem Balance-Update ändert und für 100+ Brawler nicht
  verlässlich pflegbar wäre.
- Die Rollen-Tabelle (`src/lib/roles.ts`) deckt aktuell ein Starter-Set bekannter
  Brawler ab; sehr neue Brawler fallen auf eine neutrale Gewichtung zurück, statt
  geraten zu werden.
- Icons für Gadget/Star Power/Gear kommen von [BrawlAPI](https://brawlapi.com) bzw.
  dessen CDN (`cdn.brawlify.com`) — es gibt keine öffentlich dokumentierte,
  direkt nutzbare "offizielle" Supercell-Bild-CDN für diese Assets. BrawlAPI spiegelt
  die echten, aus dem Spiel extrahierten Dateien 1:1, ist also inhaltlich korrekt;
  gefundene Bild-Fehler lagen an unserer Zuordnungslogik (Map-Name ohne Modus-Abgleich
  — behoben, siehe `findMapImageUrl` in `src/lib/brawlapi.ts`), nicht an der Quelle.
- Star Power und Gadget: die Supercell API liefert nur, was freigeschaltet ist, nicht
  welches gerade ausgerüstet ist (nur eins von beiden ist gleichzeitig aktiv). Die
  Build-Icons zeigen deshalb nur eins stellvertretend an, mit einem "+N"-Hinweis für
  weitere freigeschaltete Optionen — keine Behauptung, welches "das richtige" ist.
