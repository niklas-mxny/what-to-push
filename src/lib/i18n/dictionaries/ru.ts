import type { DictionaryKey } from "./en";

const ru: Record<DictionaryKey, string> = {
  "nav.dashboard": "Панель",
  "nav.brawlers": "Бойцы",
  "nav.settings": "Настройки",

  "app.disclaimer": "Не связано с Supercell. Создано в рамках Политики Supercell для фан-контента.",

  "dashboard.greeting": "Привет, {name}!",
  "dashboard.title": "Кого качать?",
  "dashboard.subtitle": "Рекомендации для текущей ротации карт.",
  "dashboard.goalPrefix": "Цель: {label}",
  "dashboard.noTag.message":
    "Тег игрока ещё не указан. Без тега мы можем показать только общие рекомендации по ролям, без учёта твоего прогресса.",
  "dashboard.noTag.cta": "Указать тег игрока",
  "dashboard.errorHint":
    "Проверь в Настройках (или в README), правильно ли настроен ключ Supercell API и добавлен ли IP сервера в белый список.",
  "dashboard.playerError": "Не удалось загрузить данные игрока: {message}",
  "dashboard.playerErrorHint": "Проверь тег игрока в Настройках.",
  "dashboard.emptyRotation": "Активная ротация сейчас не найдена.",
  "dashboard.noRecommendation": "Нет доступных рекомендаций.",
  "dashboard.moreOptions": "Другие варианты",
  "dashboard.bestPick": "Лучший выбор прямо сейчас",

  "time.endingSoon": "скоро закончится",
  "time.days": "осталось {d}д {h}ч",
  "time.hours": "осталось {h}ч {m}м",
  "time.minutes": "осталось {m}м",

  "brawlers.title": "Твои бойцы",
  "brawlers.progress": "Прогресс к цели: {metric} {target} · {done}/{total} достигнуто",
  "brawlers.accountProgress": "Прогресс аккаунта к {target} трофеям всего",
  "brawlers.search": "Поиск бойца…",
  "brawlers.noTagHint":
    "Без тега игрока (см. Настройки) мы показываем только общий список бойцов, без твоего прогресса.",
  "brawlers.notUnlocked": "Не открыт",

  "settings.title": "Настройки",
  "settings.subtitle": "Тег игрока и твоя цель прогресса.",
  "settings.tag.title": "Тег игрока",
  "settings.tag.description": "Найди его в Brawl Stars в своём профиле, напр. #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "Сохранить",
  "settings.goal.title": "Твоя цель",
  "settings.goal.description":
    "Определяет, какие бойцы рекомендуются в первую очередь — напр. довести всех до Престижа 1 (1000 трофеев), или задать свою цель по уровню силы или рангу.",
  "settings.goal.active": "Активно",
  "settings.goal.custom.title": "Своя цель",
  "settings.goal.custom.apply": "Применить",
  "settings.language.title": "Язык",
  "settings.language.description": "Выбери язык интерфейса.",

  "goal.metric.power": "Сила",
  "goal.metric.trophies": "Трофеи",
  "goal.metric.rank": "Ранг",
  "goal.metric.totalTrophies": "Всего трофеев",

  "goal.type.power": "Уровень силы",
  "goal.type.trophies": "Трофеи (уровни Престижа: 1000/2000/3000)",
  "goal.type.rank": "Ранг",
  "goal.type.totalTrophies": "Всего трофеев (аккаунт)",

  "goal.preset.prestige": "Все бойцы до Престижа {n}",
  "goal.preset.totalTrophies": "{n}k трофеев всего",
  "goal.custom.power": "Все бойцы до Силы {target}",
  "goal.custom.trophies": "Все бойцы до {target} трофеев",
  "goal.custom.rank": "Все бойцы до Ранга {target}",
  "goal.custom.totalTrophies": "{target} трофеев всего",

  "role.Tank": "Танк",
  "role.DamageDealer": "Урон",
  "role.Marksman": "Стрелок",
  "role.Artillery": "Артиллерия",
  "role.Assassin": "Ассасин",
  "role.Support": "Саппорт",
  "role.Controller": "Контроллер",
  "role.Unknown": "Неизвестно",

  "reason.notUnlocked": "Ещё не открыт",
  "reason.goalReached": "Цель по этому бойцу уже достигнута",
  "reason.closeToGoal": "Осталось всего {remaining}",
  "reason.roleFitStrong": "Отличный выбор ({role}) для {mode}",
  "reason.roleFitGood": "Хороший выбор ({role}) для {mode}",
  "reason.roleFitNeutral": "Нейтральный выбор ({role}) для {mode}",
  "reason.roleFitWeak": "Более слабый выбор ({role}) для {mode}",
  "reason.strongBuild": "Хорошо прокачан (Сила {power}, открыты ключевые улучшения)",

  "errors.missing_token": "Ключ Supercell API ещё не настроен на сервере.",
  "errors.invalid_ip": "Этот IP сервера ещё не добавлен в белый список ключа Supercell API.",
  "errors.not_found": "Не найдено — проверь тег игрока.",
  "errors.generic": "Что-то пошло не так при обращении к API Brawl Stars.",
  "errors.rotation_generic": "Неожиданная ошибка при загрузке ротации.",
  "errors.roster_generic": "Неожиданная ошибка при загрузке бойцов.",
};

export default ru;
