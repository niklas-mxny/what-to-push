import type { DictionaryKey } from "./en";

const zh: Record<DictionaryKey, string> = {
  "nav.dashboard": "仪表盘",
  "nav.brawlers": "角色",
  "nav.settings": "设置",

  "app.disclaimer": "与 Supercell 无关联。根据 Supercell 粉丝内容政策制作。",

  "dashboard.greeting": "你好,{name}!",
  "dashboard.title": "该练哪个角色?",
  "dashboard.subtitle": "根据当前地图轮换的推荐。",
  "dashboard.goalPrefix": "目标:{label}",
  "dashboard.noTag.message":
    "尚未设置玩家标签。没有标签时,我们只能显示基于角色的通用建议,无法根据你的进度进行优先排序。",
  "dashboard.noTag.cta": "设置玩家标签",
  "dashboard.errorHint": "请在设置(或 README)中检查你的 Supercell API 密钥是否配置正确,以及服务器 IP 是否已加入白名单。",
  "dashboard.playerError": "无法加载玩家数据:{message}",
  "dashboard.playerErrorHint": "请在设置中检查玩家标签。",
  "dashboard.emptyRotation": "当前未找到活跃的轮换。",
  "dashboard.noRecommendation": "暂无可用推荐。",
  "dashboard.moreOptions": "更多选项",
  "dashboard.bestPick": "当前最佳选择",

  "time.endingSoon": "即将结束",
  "time.days": "剩余{d}天{h}小时",
  "time.hours": "剩余{h}小时{m}分钟",
  "time.minutes": "剩余{m}分钟",

  "brawlers.title": "你的角色",
  "brawlers.progress": "目标进度:{metric} {target} · 已达成 {done}/{total}",
  "brawlers.accountProgress": "账号进度:朝着共 {target} 奖杯迈进",
  "brawlers.search": "搜索角色…",
  "brawlers.noTagHint": "没有玩家标签(见设置)时,我们只显示通用角色列表,不显示你的进度。",
  "brawlers.notUnlocked": "未解锁",

  "settings.title": "设置",
  "settings.subtitle": "玩家标签与你的进度目标。",
  "settings.tag.title": "玩家标签",
  "settings.tag.description": "可在 Brawl Stars 的个人资料中找到,例如 #2Y8VQGCCV。",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "保存",
  "settings.goal.title": "你的目标",
  "settings.goal.description":
    "决定优先推荐哪些角色——例如让所有角色达到荣誉等级1(1000奖杯),或按力量等级或段位自定义目标。",
  "settings.goal.active": "当前",
  "settings.goal.custom.title": "自定义目标",
  "settings.goal.custom.apply": "应用",
  "settings.language.title": "语言",
  "settings.language.description": "选择界面语言。",

  "goal.metric.power": "力量",
  "goal.metric.trophies": "奖杯",
  "goal.metric.rank": "段位",
  "goal.metric.totalTrophies": "总奖杯",

  "goal.type.power": "力量等级",
  "goal.type.trophies": "奖杯(荣誉等级:1000/2000/3000)",
  "goal.type.rank": "段位",
  "goal.type.totalTrophies": "总奖杯(账号)",

  "goal.preset.prestige": "所有角色达到荣誉等级{n}",
  "goal.preset.totalTrophies": "共 {n}k 奖杯",
  "goal.custom.power": "所有角色达到力量{target}",
  "goal.custom.trophies": "所有角色达到{target}奖杯",
  "goal.custom.rank": "所有角色达到段位{target}",
  "goal.custom.totalTrophies": "共 {target} 奖杯",

  "role.Tank": "坦克",
  "role.DamageDealer": "输出",
  "role.Marksman": "射手",
  "role.Artillery": "投掷手",
  "role.Assassin": "刺客",
  "role.Support": "辅助",
  "role.Controller": "控场",
  "role.Unknown": "未知",

  "reason.notUnlocked": "尚未解锁",
  "reason.goalReached": "该角色已达成目标",
  "reason.closeToGoal": "还差{remaining}",
  "reason.roleFitStrong": "{mode}的强力选择({role})",
  "reason.roleFitGood": "{mode}的不错选择({role})",
  "reason.roleFitNeutral": "{mode}的中庸选择({role})",
  "reason.roleFitWeak": "{mode}的较弱选择({role})",
  "reason.strongBuild": "配置完善(力量{power},关键升级已解锁)",

  "errors.missing_token": "服务器尚未配置 Supercell API 密钥。",
  "errors.invalid_ip": "此服务器 IP 尚未加入 Supercell API 密钥的白名单。",
  "errors.not_found": "未找到——请检查玩家标签。",
  "errors.generic": "连接 Brawl Stars API 时出现问题。",
  "errors.rotation_generic": "加载轮换时发生意外错误。",
  "errors.roster_generic": "加载角色时发生意外错误。",
};

export default zh;
