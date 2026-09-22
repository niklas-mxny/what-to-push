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

### 3. Dev-Server starten

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
- `src/lib/recommend.ts` — Kombiniert Rollen-Fit, Zielfortschritt und
  Trophäen-Pushbarkeit zu einer Empfehlung pro aktivem Modus/Map-Slot.
- `src/lib/storage.ts` — Spieler-Tag und Ziel werden nur lokal im Browser
  (`localStorage`) gespeichert, kein Account/Login.

## Bekannte Grenzen

- Build-Empfehlungen (Star Power/Gadget/Gears) zeigen aktuell nur, was du bereits
  freigeschaltet hast — es gibt bewusst keine fest hinterlegten "beste Builds pro
  Brawler", da sich das mit jedem Balance-Update ändert und für 100+ Brawler nicht
  verlässlich pflegbar wäre.
- Die Rollen-Tabelle (`src/lib/roles.ts`) deckt aktuell ein Starter-Set bekannter
  Brawler ab; sehr neue Brawler fallen auf eine neutrale Gewichtung zurück, statt
  geraten zu werden.
