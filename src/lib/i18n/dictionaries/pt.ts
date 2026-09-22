import type { DictionaryKey } from "./en";

const pt: Record<DictionaryKey, string> = {
  "nav.dashboard": "Painel",
  "nav.brawlers": "Brawlers",
  "nav.settings": "Configurações",

  "app.disclaimer":
    "Não afiliado à Supercell. Criado sob a Política de Conteúdo para Fãs da Supercell.",

  "dashboard.greeting": "Olá, {name}!",
  "dashboard.title": "O que eu devo evoluir?",
  "dashboard.subtitle": "Recomendações para a rotação de mapas atual.",
  "dashboard.goalPrefix": "Meta: {label}",
  "dashboard.noTag.message":
    "Nenhuma tag de jogador definida ainda. Sem uma tag, só podemos mostrar sugestões gerais por função, sem priorizar pelo seu progresso.",
  "dashboard.noTag.cta": "Definir tag de jogador",
  "dashboard.errorHint":
    "Verifique nas Configurações (ou no README) se sua chave da API da Supercell está configurada corretamente e o IP do servidor está na lista de permissões.",
  "dashboard.playerError": "Não foi possível carregar os dados do jogador: {message}",
  "dashboard.playerErrorHint": "Verifique a tag de jogador nas Configurações.",
  "dashboard.emptyRotation": "Nenhuma rotação ativa encontrada no momento.",
  "dashboard.noRecommendation": "Nenhuma recomendação disponível.",
  "dashboard.moreOptions": "Mais opções",
  "dashboard.bestPick": "Melhor escolha agora",

  "time.endingSoon": "terminando em breve",
  "time.days": "faltam {d}d {h}h",
  "time.hours": "faltam {h}h {m}m",
  "time.minutes": "faltam {m}m",

  "brawlers.title": "Seus Brawlers",
  "brawlers.progress": "Progresso da meta: {metric} {target} · {done}/{total} alcançados",
  "brawlers.accountProgress": "Progresso da conta rumo a {target} troféus totais",
  "brawlers.search": "Buscar brawler…",
  "brawlers.noTagHint":
    "Sem uma tag de jogador (veja Configurações) mostramos apenas a lista geral de brawlers, sem o seu progresso.",
  "brawlers.notUnlocked": "Não desbloqueado",

  "settings.title": "Configurações",
  "settings.subtitle": "Tag de jogador e sua meta de progresso.",
  "settings.tag.title": "Tag de jogador",
  "settings.tag.description": "Encontre no Brawl Stars no seu perfil, ex.: #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Salvar",
  "settings.goal.title": "Sua meta",
  "settings.goal.description":
    "Determina quais brawlers são recomendados primeiro — ex.: levar todos ao Prestígio 1 (1000 troféus), ou definir sua própria meta por nível de poder ou rank.",
  "settings.goal.active": "Ativo",
  "settings.goal.custom.title": "Meta personalizada",
  "settings.goal.custom.apply": "Aplicar",
  "settings.language.title": "Idioma",
  "settings.language.description": "Escolha o idioma da interface.",

  "goal.metric.power": "Poder",
  "goal.metric.trophies": "Troféus",
  "goal.metric.rank": "Rank",
  "goal.metric.totalTrophies": "Troféus totais",

  "goal.type.power": "Nível de poder",
  "goal.type.trophies": "Troféus (níveis de Prestígio: 1000/2000/3000)",
  "goal.type.rank": "Rank",
  "goal.type.totalTrophies": "Troféus totais (conta)",

  "goal.preset.prestige": "Todos os brawlers no Prestígio {n}",
  "goal.preset.totalTrophies": "{n}k troféus totais",
  "goal.custom.power": "Todos os brawlers no Poder {target}",
  "goal.custom.trophies": "Todos os brawlers com {target} troféus",
  "goal.custom.rank": "Todos os brawlers no Rank {target}",
  "goal.custom.totalTrophies": "{target} troféus totais",

  "role.Tank": "Tanque",
  "role.DamageDealer": "Dano",
  "role.Marksman": "Atirador",
  "role.Artillery": "Artilharia",
  "role.Assassin": "Assassino",
  "role.Support": "Suporte",
  "role.Controller": "Controlador",
  "role.Unknown": "Desconhecido",

  "reason.notUnlocked": "Ainda não desbloqueado",
  "reason.goalReached": "Meta já alcançada para este brawler",
  "reason.closeToGoal": "Faltam só {remaining}",
  "reason.roleFitStrong": "Ótima escolha ({role}) para {mode}",
  "reason.roleFitGood": "Boa escolha ({role}) para {mode}",
  "reason.roleFitNeutral": "Escolha neutra ({role}) para {mode}",
  "reason.roleFitWeak": "Escolha mais fraca ({role}) para {mode}",
  "reason.strongBuild": "Bem equipado (Poder {power}, upgrades chave desbloqueados)",

  "errors.missing_token": "A chave da API da Supercell ainda não está configurada no servidor.",
  "errors.invalid_ip":
    "Este IP do servidor ainda não está na lista de permissões da chave da API da Supercell.",
  "errors.not_found": "Não encontrado — verifique a tag de jogador.",
  "errors.generic": "Algo deu errado ao conectar com a API do Brawl Stars.",
  "errors.rotation_generic": "Erro inesperado ao carregar a rotação.",
  "errors.roster_generic": "Erro inesperado ao carregar os brawlers.",
};

export default pt;
