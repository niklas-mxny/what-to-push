import type { DictionaryKey } from "./en";

const fr: Record<DictionaryKey, string> = {
  "nav.dashboard": "Tableau de bord",
  "nav.brawlers": "Brawlers",
  "nav.settings": "Paramètres",

  "app.disclaimer":
    "Non affilié à Supercell. Créé dans le cadre de la Politique de contenu pour fans de Supercell.",

  "dashboard.greeting": "Salut {name} !",
  "dashboard.title": "Quel brawler pousser ?",
  "dashboard.subtitle": "Recommandations pour la rotation de cartes actuelle.",
  "dashboard.goalPrefix": "Objectif : {label}",
  "dashboard.noTag.message":
    "Aucun tag joueur défini. Sans tag, nous ne pouvons afficher que des suggestions générales par rôle, sans les prioriser selon votre progression.",
  "dashboard.noTag.cta": "Définir le tag joueur",
  "dashboard.errorHint":
    "Vérifiez dans les Paramètres (ou le README) si votre clé API Supercell est bien configurée et si l'IP du serveur est autorisée.",
  "dashboard.playerError": "Impossible de charger les données du joueur : {message}",
  "dashboard.playerErrorHint": "Vérifiez le tag joueur dans les Paramètres.",
  "dashboard.emptyRotation": "Aucune rotation active trouvée pour le moment.",
  "dashboard.noRecommendation": "Aucune recommandation disponible.",
  "dashboard.moreOptions": "Autres options",
  "dashboard.bestPick": "Meilleur choix actuel",

  "time.endingSoon": "se termine bientôt",
  "time.days": "encore {d}j {h}h",
  "time.hours": "encore {h}h {m}m",
  "time.minutes": "encore {m}m",

  "brawlers.title": "Vos Brawlers",
  "brawlers.progress": "Progression vers l'objectif : {metric} {target} · {done}/{total} atteints",
  "brawlers.accountProgress": "Progression du compte vers {target} trophées au total",
  "brawlers.search": "Rechercher un brawler…",
  "brawlers.noTagHint":
    "Sans tag joueur (voir Paramètres), nous affichons seulement la liste générale des brawlers, sans votre progression.",
  "brawlers.notUnlocked": "Non débloqué",

  "settings.title": "Paramètres",
  "settings.subtitle": "Tag joueur et votre objectif de progression.",
  "settings.tag.title": "Tag joueur",
  "settings.tag.description": "Trouvable dans Brawl Stars sur votre profil, ex. #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Enregistrer",
  "settings.goal.title": "Votre objectif",
  "settings.goal.description":
    "Détermine quels brawlers sont recommandés en priorité — ex. amener tout le monde au Prestige 1 (1000 trophées), ou définir votre propre objectif par niveau de puissance ou rang.",
  "settings.goal.active": "Actif",
  "settings.goal.custom.title": "Objectif personnalisé",
  "settings.goal.custom.apply": "Appliquer",
  "settings.language.title": "Langue",
  "settings.language.description": "Choisissez la langue de l'interface.",

  "goal.metric.power": "Puissance",
  "goal.metric.trophies": "Trophées",
  "goal.metric.rank": "Rang",
  "goal.metric.totalTrophies": "Trophées totaux",

  "goal.type.power": "Niveau de puissance",
  "goal.type.trophies": "Trophées (paliers de Prestige : 1000/2000/3000)",
  "goal.type.rank": "Rang",
  "goal.type.totalTrophies": "Trophées totaux (compte)",

  "goal.preset.prestige": "Tous les brawlers au Prestige {n}",
  "goal.preset.totalTrophies": "{n}k trophées au total",
  "goal.custom.power": "Tous les brawlers à Puissance {target}",
  "goal.custom.trophies": "Tous les brawlers à {target} trophées",
  "goal.custom.rank": "Tous les brawlers au Rang {target}",
  "goal.custom.totalTrophies": "{target} trophées au total",

  "role.Tank": "Tank",
  "role.DamageDealer": "Dégâts",
  "role.Marksman": "Tireur",
  "role.Artillery": "Artillerie",
  "role.Assassin": "Assassin",
  "role.Support": "Soutien",
  "role.Controller": "Contrôleur",
  "role.Unknown": "Inconnu",

  "reason.notUnlocked": "Pas encore débloqué",
  "reason.goalReached": "Objectif déjà atteint pour ce brawler",
  "reason.closeToGoal": "Plus que {remaining}",
  "reason.roleFitStrong": "Excellent choix ({role}) pour {mode}",
  "reason.roleFitGood": "Bon choix ({role}) pour {mode}",
  "reason.roleFitNeutral": "Choix neutre ({role}) pour {mode}",
  "reason.roleFitWeak": "Choix plus faible ({role}) pour {mode}",
  "reason.strongBuild": "Bien équipé (Puissance {power}, améliorations clés débloquées)",

  "errors.missing_token": "La clé API Supercell n'est pas encore configurée sur le serveur.",
  "errors.invalid_ip": "Cette IP serveur n'est pas encore autorisée pour la clé API Supercell.",
  "errors.not_found": "Introuvable — vérifiez le tag joueur.",
  "errors.generic": "Un problème est survenu avec l'API Brawl Stars.",
  "errors.rotation_generic": "Erreur inattendue lors du chargement de la rotation.",
  "errors.roster_generic": "Erreur inattendue lors du chargement des brawlers.",
};

export default fr;
