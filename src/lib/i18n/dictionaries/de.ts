import type { DictionaryKey } from "./en";

const de: Record<DictionaryKey, string> = {
  "nav.dashboard": "Dashboard",
  "nav.brawlers": "Brawler",
  "nav.settings": "Einstellungen",

  "app.disclaimer": "Nicht offiziell mit Supercell verbunden. Erstellt unter der Supercell Fan Content Policy.",

  "dashboard.greeting": "Hey {name}!",
  "dashboard.title": "Was soll ich pushen?",
  "dashboard.subtitle": "Empfehlungen für die aktuelle Map-Rotation.",
  "dashboard.goalPrefix": "Ziel: {label}",
  "dashboard.noTag.message":
    "Noch kein Spieler-Tag hinterlegt. Ohne Tag zeigen wir dir nur allgemeine Rollen-Empfehlungen, aber keine Priorisierung nach deinem Fortschritt.",
  "dashboard.noTag.cta": "Spieler-Tag eintragen",
  "dashboard.errorHint":
    "Prüfe in den Einstellungen bzw. der README, ob dein Supercell API Key korrekt eingerichtet und die Server-IP freigegeben ist.",
  "dashboard.playerError": "Spielerdaten konnten nicht geladen werden: {message}",
  "dashboard.playerErrorHint": "Prüfe den Spieler-Tag in den Einstellungen.",
  "dashboard.emptyRotation": "Aktuell keine aktive Rotation gefunden.",
  "dashboard.noRecommendation": "Keine Empfehlung verfügbar.",
  "dashboard.moreOptions": "Weitere Optionen",
  "dashboard.bestPick": "Beste Wahl gerade",

  "time.endingSoon": "endet gleich",
  "time.days": "noch {d}d {h}h",
  "time.hours": "noch {h}h {m}m",
  "time.minutes": "noch {m}m",

  "brawlers.title": "Deine Brawler",
  "brawlers.progress": "Fortschritt Richtung Ziel: {metric} {target} · {done}/{total} erreicht",
  "brawlers.accountProgress": "Konto-Fortschritt Richtung {target} Trophäen insgesamt",
  "brawlers.search": "Brawler suchen…",
  "brawlers.noTagHint":
    "Ohne Spieler-Tag (siehe Einstellungen) zeigen wir hier nur die allgemeine Brawler-Liste ohne deinen Fortschritt.",
  "brawlers.notUnlocked": "Nicht freigeschaltet",

  "settings.title": "Einstellungen",
  "settings.subtitle": "Spieler-Tag und dein Fortschritts-Ziel.",
  "settings.tag.title": "Spieler-Tag",
  "settings.tag.description": "Zu finden in Brawl Stars unter deinem Profil, z.B. #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Speichern",
  "settings.goal.title": "Dein Ziel",
  "settings.goal.description":
    "Bestimmt, welche Brawler priorisiert empfohlen werden — z.B. alle auf Prestige 1 (1000 Trophäen) bringen, oder ein eigenes Ziel nach Power-Level oder Rang.",
  "settings.goal.active": "Aktiv",
  "settings.goal.custom.title": "Eigenes Ziel",
  "settings.goal.custom.apply": "Übernehmen",
  "settings.language.title": "Sprache",
  "settings.language.description": "Wähle die Sprache der Oberfläche.",

  "goal.metric.power": "Power",
  "goal.metric.trophies": "Trophäen",
  "goal.metric.rank": "Rang",
  "goal.metric.totalTrophies": "Trophäen gesamt",

  "goal.type.power": "Power-Level",
  "goal.type.trophies": "Trophäen (Prestige-Stufen: 1000/2000/3000)",
  "goal.type.rank": "Rang",
  "goal.type.totalTrophies": "Trophäen gesamt (Konto)",

  "goal.preset.prestige": "Alle Brawler auf Prestige {n}",
  "goal.preset.totalTrophies": "{n}k Trophäen insgesamt",
  "goal.custom.power": "Alle Brawler auf Power {target}",
  "goal.custom.trophies": "Alle Brawler auf {target} Trophäen",
  "goal.custom.rank": "Alle Brawler auf Rang {target}",
  "goal.custom.totalTrophies": "{target} Trophäen insgesamt",

  "role.Tank": "Tank",
  "role.DamageDealer": "Damage Dealer",
  "role.Marksman": "Scharfschütze",
  "role.Artillery": "Artillerie",
  "role.Assassin": "Assassine",
  "role.Support": "Support",
  "role.Controller": "Controller",
  "role.Unknown": "Unbekannt",

  "reason.notUnlocked": "Noch nicht freigeschaltet",
  "reason.goalReached": "Ziel bei diesem Brawler bereits erreicht",
  "reason.closeToGoal": "Nur noch {remaining}",
  "reason.roleFitStrong": "Starke Wahl ({role}) für {mode}",
  "reason.roleFitGood": "Gute Wahl ({role}) für {mode}",
  "reason.roleFitNeutral": "Neutrale Wahl ({role}) für {mode}",
  "reason.roleFitWeak": "Schwächere Wahl ({role}) für {mode}",
  "reason.strongBuild": "Gut ausgebaut (Power {power}, wichtige Upgrades freigeschaltet)",

  "errors.missing_token": "Der Supercell API Key ist auf dem Server noch nicht konfiguriert.",
  "errors.invalid_ip": "Diese Server-IP ist beim Supercell API Key noch nicht freigegeben.",
  "errors.not_found": "Nicht gefunden — prüfe den Spieler-Tag.",
  "errors.generic": "Bei der Verbindung zur Brawl Stars API ist etwas schiefgelaufen.",
  "errors.rotation_generic": "Unerwarteter Fehler beim Laden der Rotation.",
  "errors.roster_generic": "Unerwarteter Fehler beim Laden der Brawler.",
};

export default de;
