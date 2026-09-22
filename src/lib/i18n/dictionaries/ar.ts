import type { DictionaryKey } from "./en";

const ar: Record<DictionaryKey, string> = {
  "nav.dashboard": "لوحة التحكم",
  "nav.brawlers": "المقاتلون",
  "nav.settings": "الإعدادات",

  "app.disclaimer": "غير تابع لشركة Supercell. تم الإنشاء بموجب سياسة محتوى المعجبين الخاصة بـ Supercell.",

  "dashboard.greeting": "مرحبًا {name}!",
  "dashboard.title": "من يجب أن أطوّر؟",
  "dashboard.subtitle": "توصيات لدورة الخرائط الحالية.",
  "dashboard.goalPrefix": "الهدف: {label}",
  "dashboard.noTag.message":
    "لم يتم تعيين تاق اللاعب بعد. بدون تاق، يمكننا فقط عرض اقتراحات عامة حسب الدور، دون ترتيب حسب تقدمك.",
  "dashboard.noTag.cta": "تعيين تاق اللاعب",
  "dashboard.errorHint":
    "تحقق في الإعدادات (أو في ملف README) مما إذا كان مفتاح Supercell API مُعدًا بشكل صحيح وأن عنوان IP الخاص بالخادم مُدرج في القائمة البيضاء.",
  "dashboard.playerError": "تعذر تحميل بيانات اللاعب: {message}",
  "dashboard.playerErrorHint": "تحقق من تاق اللاعب في الإعدادات.",
  "dashboard.emptyRotation": "لا توجد دورة نشطة حاليًا.",
  "dashboard.noRecommendation": "لا توجد توصية متاحة.",
  "dashboard.moreOptions": "خيارات أخرى",
  "dashboard.bestPick": "أفضل اختيار الآن",

  "time.endingSoon": "ينتهي قريبًا",
  "time.days": "باقي {d} يوم {h} ساعة",
  "time.hours": "باقي {h} ساعة {m} دقيقة",
  "time.minutes": "باقي {m} دقيقة",

  "brawlers.title": "مقاتلوك",
  "brawlers.progress": "التقدم نحو الهدف: {metric} {target} · تم تحقيق {done}/{total}",
  "brawlers.accountProgress": "تقدم الحساب نحو {target} كأس إجمالاً",
  "brawlers.search": "ابحث عن مقاتل…",
  "brawlers.noTagHint": "بدون تاق لاعب (راجع الإعدادات) نعرض فقط القائمة العامة للمقاتلين دون تقدمك الخاص.",
  "brawlers.notUnlocked": "غير مفتوح",

  "settings.title": "الإعدادات",
  "settings.subtitle": "تاق اللاعب وهدف تقدمك.",
  "settings.tag.title": "تاق اللاعب",
  "settings.tag.description": "تجده في Brawl Stars ضمن ملفك الشخصي، مثال: #2Y8VQGCCV.",
  "settings.tag.placeholder": "2Y8VQGCCV",
  "settings.tag.save": "حفظ",
  "settings.goal.title": "هدفك",
  "settings.goal.description":
    "يحدد أي المقاتلين تتم التوصية بهم أولاً — مثل الوصول بالجميع إلى المكانة 1 (1000 كأس)، أو تعيين هدفك الخاص حسب مستوى القوة أو الرتبة.",
  "settings.goal.active": "نشط",
  "settings.goal.custom.title": "هدف مخصص",
  "settings.goal.custom.apply": "تطبيق",
  "settings.language.title": "اللغة",
  "settings.language.description": "اختر لغة الواجهة.",

  "goal.metric.power": "القوة",
  "goal.metric.trophies": "الكؤوس",
  "goal.metric.rank": "الرتبة",
  "goal.metric.totalTrophies": "إجمالي الكؤوس",

  "goal.type.power": "مستوى القوة",
  "goal.type.trophies": "الكؤوس (مستويات المكانة: 1000/2000/3000)",
  "goal.type.rank": "الرتبة",
  "goal.type.totalTrophies": "إجمالي الكؤوس (الحساب)",

  "goal.preset.prestige": "جميع المقاتلين إلى المكانة {n}",
  "goal.preset.totalTrophies": "{n}k كأس إجمالاً",
  "goal.custom.power": "جميع المقاتلين إلى القوة {target}",
  "goal.custom.trophies": "جميع المقاتلين إلى {target} كأس",
  "goal.custom.rank": "جميع المقاتلين إلى الرتبة {target}",
  "goal.custom.totalTrophies": "{target} كأس إجمالاً",

  "role.Tank": "دبابة",
  "role.DamageDealer": "ضرر",
  "role.Marksman": "قناص",
  "role.Artillery": "مدفعية",
  "role.Assassin": "قاتل",
  "role.Support": "دعم",
  "role.Controller": "تحكم",
  "role.Unknown": "غير معروف",

  "reason.notUnlocked": "لم يُفتح بعد",
  "reason.goalReached": "تم تحقيق الهدف لهذا المقاتل بالفعل",
  "reason.closeToGoal": "تبقى {remaining} فقط",
  "reason.roleFitStrong": "اختيار قوي ({role}) لوضع {mode}",
  "reason.roleFitGood": "اختيار جيد ({role}) لوضع {mode}",
  "reason.roleFitNeutral": "اختيار محايد ({role}) لوضع {mode}",
  "reason.roleFitWeak": "اختيار أضعف ({role}) لوضع {mode}",
  "reason.strongBuild": "مُجهّز جيدًا (القوة {power}، تم فتح الترقيات الأساسية)",

  "errors.missing_token": "لم يتم تكوين مفتاح Supercell API على الخادم بعد.",
  "errors.invalid_ip": "عنوان IP الخادم هذا غير مدرج بعد في القائمة البيضاء لمفتاح Supercell API.",
  "errors.not_found": "غير موجود — تحقق من تاق اللاعب.",
  "errors.generic": "حدث خطأ ما أثناء الاتصال بواجهة برمجة تطبيقات Brawl Stars.",
  "errors.rotation_generic": "حدث خطأ غير متوقع أثناء تحميل الدورة.",
  "errors.roster_generic": "حدث خطأ غير متوقع أثناء تحميل المقاتلين.",
};

export default ar;
