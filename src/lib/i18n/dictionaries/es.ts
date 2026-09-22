import type { DictionaryKey } from "./en";

const es: Record<DictionaryKey, string> = {
  "nav.dashboard": "Panel",
  "nav.brawlers": "Brawlers",
  "nav.settings": "Ajustes",

  "app.disclaimer":
    "No afiliado con Supercell. Creado bajo la Política de Contenido para Fans de Supercell.",

  "dashboard.greeting": "¡Hola {name}!",
  "dashboard.title": "¿Qué debería subir?",
  "dashboard.subtitle": "Recomendaciones para la rotación de mapas actual.",
  "dashboard.goalPrefix": "Objetivo: {label}",
  "dashboard.noTag.message":
    "Aún no has indicado tu tag de jugador. Sin un tag solo podemos mostrar sugerencias generales por rol, no priorizadas según tu progreso.",
  "dashboard.noTag.cta": "Indicar tag de jugador",
  "dashboard.errorHint":
    "Comprueba en Ajustes (o en el README) si tu clave de la API de Supercell está bien configurada y la IP del servidor está en la lista blanca.",
  "dashboard.playerError": "No se pudieron cargar los datos del jugador: {message}",
  "dashboard.playerErrorHint": "Comprueba el tag de jugador en Ajustes.",
  "dashboard.emptyRotation": "No se encontró ninguna rotación activa por ahora.",
  "dashboard.noRecommendation": "No hay ninguna recomendación disponible.",
  "dashboard.moreOptions": "Más opciones",
  "dashboard.bestPick": "Mejor opción ahora mismo",

  "time.endingSoon": "termina pronto",
  "time.days": "quedan {d}d {h}h",
  "time.hours": "quedan {h}h {m}m",
  "time.minutes": "quedan {m}m",

  "brawlers.title": "Tus Brawlers",
  "brawlers.progress": "Progreso hacia el objetivo: {metric} {target} · {done}/{total} logrados",
  "brawlers.accountProgress": "Progreso de la cuenta hacia {target} trofeos totales",
  "brawlers.search": "Buscar brawler…",
  "brawlers.noTagHint":
    "Sin un tag de jugador (ver Ajustes) solo mostramos la lista general de brawlers, sin tu propio progreso.",
  "brawlers.notUnlocked": "No desbloqueado",

  "settings.title": "Ajustes",
  "settings.subtitle": "Tag de jugador y tu objetivo de progreso.",
  "settings.tag.title": "Tag de jugador",
  "settings.tag.description": "Lo encuentras en Brawl Stars en tu perfil, p. ej. #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Guardar",
  "settings.goal.title": "Tu objetivo",
  "settings.goal.description":
    "Determina qué brawlers se recomiendan primero — p. ej. llevar a todos a Prestigio 1 (1000 trofeos), o fijar tu propio objetivo por nivel de poder o rango.",
  "settings.goal.active": "Activo",
  "settings.goal.custom.title": "Objetivo personalizado",
  "settings.goal.custom.apply": "Aplicar",
  "settings.language.title": "Idioma",
  "settings.language.description": "Elige el idioma de la interfaz.",

  "goal.metric.power": "Poder",
  "goal.metric.trophies": "Trofeos",
  "goal.metric.rank": "Rango",
  "goal.metric.totalTrophies": "Trofeos totales",

  "goal.type.power": "Nivel de poder",
  "goal.type.trophies": "Trofeos (niveles de Prestigio: 1000/2000/3000)",
  "goal.type.rank": "Rango",
  "goal.type.totalTrophies": "Trofeos totales (cuenta)",

  "goal.preset.prestige": "Todos los brawlers a Prestigio {n}",
  "goal.preset.totalTrophies": "{n}k trofeos totales",
  "goal.custom.power": "Todos los brawlers a Poder {target}",
  "goal.custom.trophies": "Todos los brawlers a {target} trofeos",
  "goal.custom.rank": "Todos los brawlers a Rango {target}",
  "goal.custom.totalTrophies": "{target} trofeos totales",

  "role.Tank": "Tanque",
  "role.DamageDealer": "Daño",
  "role.Marksman": "Tirador",
  "role.Artillery": "Artillería",
  "role.Assassin": "Asesino",
  "role.Support": "Soporte",
  "role.Controller": "Controlador",
  "role.Unknown": "Desconocido",

  "reason.notUnlocked": "Aún no desbloqueado",
  "reason.goalReached": "Objetivo ya alcanzado con este brawler",
  "reason.closeToGoal": "Solo faltan {remaining}",
  "reason.roleFitStrong": "Muy buena opción ({role}) para {mode}",
  "reason.roleFitGood": "Buena opción ({role}) para {mode}",
  "reason.roleFitNeutral": "Opción neutral ({role}) para {mode}",
  "reason.roleFitWeak": "Opción más débil ({role}) para {mode}",
  "reason.strongBuild": "Bien equipado (Poder {power}, mejoras clave desbloqueadas)",

  "errors.missing_token": "La clave de la API de Supercell aún no está configurada en el servidor.",
  "errors.invalid_ip":
    "Esta IP del servidor aún no está en la lista blanca de la clave de la API de Supercell.",
  "errors.not_found": "No encontrado — comprueba el tag de jugador.",
  "errors.generic": "Algo salió mal al conectar con la API de Brawl Stars.",
  "errors.rotation_generic": "Error inesperado al cargar la rotación.",
  "errors.roster_generic": "Error inesperado al cargar los brawlers.",
};

export default es;
