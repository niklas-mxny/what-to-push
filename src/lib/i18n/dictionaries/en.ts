const en = {
  "nav.dashboard": "Dashboard",
  "nav.brawlers": "Brawlers",
  "nav.settings": "Settings",

  "app.disclaimer": "Not affiliated with Supercell. Made under the Supercell Fan Content Policy.",

  "dashboard.greeting": "Hey {name}!",
  "dashboard.title": "What should I push?",
  "dashboard.subtitle": "Recommendations for the current map rotation.",
  "dashboard.goalPrefix": "Goal: {label}",
  "dashboard.noTag.message":
    "No player tag set yet. Without a tag we can only show general role-based suggestions, not prioritized by your own progress.",
  "dashboard.noTag.cta": "Set player tag",
  "dashboard.errorHint":
    "Check in Settings (or the README) whether your Supercell API key is set up correctly and the server IP is whitelisted.",
  "dashboard.playerError": "Couldn't load player data: {message}",
  "dashboard.playerErrorHint": "Check the player tag in Settings.",
  "dashboard.emptyRotation": "No active rotation found right now.",
  "dashboard.noRecommendation": "No recommendation available.",
  "dashboard.moreOptions": "More options",
  "dashboard.bestPick": "Best pick right now",

  "time.endingSoon": "ending soon",
  "time.days": "{d}d {h}h left",
  "time.hours": "{h}h {m}m left",
  "time.minutes": "{m}m left",

  "brawlers.title": "Your Brawlers",
  "brawlers.progress": "Progress toward goal: {metric} {target} · {done}/{total} reached",
  "brawlers.accountProgress": "Account progress toward {target} total trophies",
  "brawlers.search": "Search brawlers…",
  "brawlers.noTagHint":
    "Without a player tag (see Settings) we only show the general brawler list, not your own progress.",
  "brawlers.notUnlocked": "Not unlocked",

  "settings.title": "Settings",
  "settings.subtitle": "Player tag and your progress goal.",
  "settings.tag.title": "Player Tag",
  "settings.tag.description": "Find it in Brawl Stars under your profile, e.g. #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Save",
  "settings.goal.title": "Your Goal",
  "settings.goal.description":
    "Determines which brawlers get recommended first — e.g. push everyone to Prestige 1 (1000 trophies), or set your own goal by power level or rank.",
  "settings.goal.active": "Active",
  "settings.goal.custom.title": "Custom goal",
  "settings.goal.custom.apply": "Apply",
  "settings.language.title": "Language",
  "settings.language.description": "Choose the interface language.",

  "goal.metric.power": "Power",
  "goal.metric.trophies": "Trophies",
  "goal.metric.rank": "Rank",
  "goal.metric.totalTrophies": "Total Trophies",

  "goal.type.power": "Power Level",
  "goal.type.trophies": "Trophies (Prestige tiers: 1000/2000/3000)",
  "goal.type.rank": "Rank",
  "goal.type.totalTrophies": "Total Trophies (account)",

  "goal.preset.prestige": "All brawlers to Prestige {n}",
  "goal.preset.totalTrophies": "{n}k total trophies",
  "goal.custom.power": "All brawlers to Power {target}",
  "goal.custom.trophies": "All brawlers to {target} trophies",
  "goal.custom.rank": "All brawlers to Rank {target}",
  "goal.custom.totalTrophies": "{target} total trophies",

  "role.Tank": "Tank",
  "role.DamageDealer": "Damage Dealer",
  "role.Marksman": "Marksman",
  "role.Artillery": "Artillery",
  "role.Assassin": "Assassin",
  "role.Support": "Support",
  "role.Controller": "Controller",
  "role.Unknown": "Unknown",

  "reason.notUnlocked": "Not unlocked yet",
  "reason.goalReached": "Goal already reached for this brawler",
  "reason.closeToGoal": "Only {remaining} more to go",
  "reason.roleFitStrong": "Strong pick ({role}) for {mode}",
  "reason.roleFitGood": "Good pick ({role}) for {mode}",
  "reason.roleFitNeutral": "Neutral pick ({role}) for {mode}",
  "reason.roleFitWeak": "Weaker pick ({role}) for {mode}",
  "reason.strongBuild": "Well-built (Power {power}, key upgrades unlocked)",

  "errors.missing_token": "The Supercell API key isn't configured on the server yet.",
  "errors.invalid_ip": "This server IP isn't whitelisted for the Supercell API key yet.",
  "errors.not_found": "Not found — check the player tag.",
  "errors.generic": "Something went wrong talking to the Brawl Stars API.",
  "errors.rotation_generic": "Unexpected error loading the rotation.",
  "errors.roster_generic": "Unexpected error loading the brawlers.",
} satisfies Record<string, string>;

export default en;
export type DictionaryKey = keyof typeof en;
