// 100 Progressive Level Badges System for Otaku Anime Black

export interface LevelBadgeInfo {
  level: number;
  titleAr: string;
  titleEn: string;
  tierId: number;
  tierNameAr: string;
  tierNameEn: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Divine" | "Godlike";
  icon: string;
  badgeBg: string; // Tailwind gradient
  textColor: string;
  borderColor: string;
  glowColor: string;
  requiredXp: number;
  rewardCoins: number;
  perksAr: string;
  perksEn: string;
  frameReward?: string;
}

export interface LevelTier {
  id: number;
  minLevel: number;
  maxLevel: number;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  gradient: string;
  glow: string;
  descriptionAr: string;
  descriptionEn: string;
}

export class TiersData {
  static tiers: LevelTier[] = [
    {
      id: 1,
      minLevel: 1,
      maxLevel: 10,
      nameAr: "مبتدئ الأوتاكو (Otaku Novice)",
      nameEn: "Otaku Novice",
      icon: "🌱",
      color: "#10B981",
      gradient: "from-emerald-600 to-teal-800",
      glow: "rgba(16, 185, 129, 0.4)",
      descriptionAr: "بداية الرحلة في عالم الأنمي، خطوتك الأولى نحو العظمة.",
      descriptionEn: "First step in the anime universe journey."
    },
    {
      id: 2,
      minLevel: 11,
      maxLevel: 20,
      nameAr: "مستكشف العوالم (World Explorer)",
      nameEn: "World Explorer",
      icon: "🧭",
      color: "#3B82F6",
      gradient: "from-blue-600 to-cyan-800",
      glow: "rgba(59, 130, 246, 0.4)",
      descriptionAr: "قطع شوطاً في متابعة الأنمي واستكشاف المانجا.",
      descriptionEn: "Exploring diverse anime genres & manga worlds."
    },
    {
      id: 3,
      minLevel: 21,
      maxLevel: 30,
      nameAr: "مبارز الظلال (Shadow Swordsman)",
      nameEn: "Shadow Swordsman",
      icon: "🗡️",
      color: "#8B5CF6",
      gradient: "from-purple-600 to-indigo-800",
      glow: "rgba(139, 92, 246, 0.4)",
      descriptionAr: "مهارات القتال والاستكشاف ارتفعت لمستوى المبارزين.",
      descriptionEn: "Mastered basic combat & anime trivia prowess."
    },
    {
      id: 4,
      minLevel: 31,
      maxLevel: 40,
      nameAr: "ساحر الشاكرة (Chakra Sorcerer)",
      nameEn: "Chakra Sorcerer",
      icon: "🔮",
      color: "#EC4899",
      gradient: "from-pink-600 to-[#FF3B30]",
      glow: "rgba(236, 72, 153, 0.4)",
      descriptionAr: "تحكم كامل بالطاقة السحرية والتعاويذ الأوتكاوية.",
      descriptionEn: "Controlling elemental anime energy & spells."
    },
    {
      id: 5,
      minLevel: 41,
      maxLevel: 50,
      nameAr: "هاشيرا النخبة (Hashira Elite)",
      nameEn: "Hashira Elite",
      icon: "⚔️",
      color: "#FF7A00",
      gradient: "from-amber-500 to-red-700",
      glow: "rgba(255, 122, 0, 0.5)",
      descriptionAr: "رتبة قادة الهاشيرا الأعضاء الخبراء في مجتمعات الأنمي.",
      descriptionEn: "Commanding respect as an elite Hashira member."
    },
    {
      id: 6,
      minLevel: 51,
      maxLevel: 60,
      nameAr: "صياد العمالقة (Titan Hunter)",
      nameEn: "Titan Hunter",
      icon: "🪽",
      color: "#06B6D4",
      gradient: "from-cyan-500 to-blue-900",
      glow: "rgba(6, 182, 212, 0.5)",
      descriptionAr: "اجتياز الأسوار والسيطرة على أكبر المعارك النارية.",
      descriptionEn: "Surpassing the walls with high agility & courage."
    },
    {
      id: 7,
      minLevel: 61,
      maxLevel: 70,
      nameAr: "قائد البانكاي (Bankai Captain)",
      nameEn: "Bankai Captain",
      icon: "🌸",
      color: "#A855F7",
      gradient: "from-fuchsia-600 to-purple-950",
      glow: "rgba(168, 85, 247, 0.5)",
      descriptionAr: "إطلاق السول ريبر الكامل والقوة المطلقة.",
      descriptionEn: "Unleashing ultimate spiritual pressure & Bankai."
    },
    {
      id: 8,
      minLevel: 71,
      maxLevel: 80,
      nameAr: "قاتل التنانين (Dragon Slayer)",
      nameEn: "Dragon Slayer",
      icon: "🐲",
      color: "#EF4444",
      gradient: "from-red-600 to-orange-800",
      glow: "rgba(239, 68, 68, 0.6)",
      descriptionAr: "قوة التنانين القديمة والقدرة على حسم أي نقاش.",
      descriptionEn: "Harnessing legendary ancient dragon magic."
    },
    {
      id: 9,
      minLevel: 81,
      maxLevel: 90,
      nameAr: "عاهل الظلال (Shadow Monarch)",
      nameEn: "Shadow Monarch",
      icon: "👑",
      color: "#6366F1",
      gradient: "from-indigo-600 via-purple-700 to-slate-950",
      glow: "rgba(99, 102, 241, 0.7)",
      descriptionAr: "استدعاء جيوش الظلال والتحكم بقمة مجريات الأحداث.",
      descriptionEn: "Arise! Commanding shadow armies across realms."
    },
    {
      id: 10,
      minLevel: 91,
      maxLevel: 100,
      nameAr: "إله الأنمي الموحد (Supreme Anime Black God)",
      nameEn: "Supreme Anime Black God",
      icon: "🌟",
      color: "#FFD700",
      gradient: "from-amber-400 via-red-600 to-black",
      glow: "rgba(255, 215, 0, 0.8)",
      descriptionAr: "القمة المطلقة للمنصة. شارة العرش الإلهي الذهبي.",
      descriptionEn: "The absolute pinnacle of power and honor."
    }
  ];
}

// Titles generator for all 100 levels individually
const SPECIFIC_TITLES_AR: { [key: number]: string } = {
  1: "مبتدئ الأوتاكو 🌱",
  2: "عاشق السايان ⚡",
  3: "مستكشف القرى 🍃",
  4: "صياد الأرواح 👻",
  5: "طالب الأكاديمية 🏫",
  6: "مقاتل النينجا 🥷",
  7: "مستكشف الكنز 🏴‍☠️",
  8: "فارس الفولاذ 🛡️",
  9: "طالب السحر 🔮",
  10: "صياد الجوائز 🏆",

  11: "مستكشف الجراند لاين 🌊",
  12: "ساحر التعاويذ ✨",
  13: "مبارك طاقة الكي 🔥",
  14: "قاطع الشياطين ⚔️",
  15: "فارس الظل 🌑",
  16: "حارس البوابة 🏛️",
  17: "قناص الأنمي 🎯",
  18: "سيد الدوجو 🥋",
  19: "مبتكر المانجا ✍️",
  20: "مستكشف الأبعاد 🌌",

  21: "مبارز الشاكرة ⚡",
  22: "أمير النينجا 👑",
  23: "مستدعي الوحوش 🐺",
  24: "فارس التنين 🐉",
  25: "مستكشف الممر الكوني 🌀",
  26: "سيد السيوف المزدوجة ⚔️",
  27: "محارب الجاذبية 🪐",
  28: "طبيب الميدان 💉",
  29: "صانع الدروع 🛡️",
  30: "سيد الطيف 👻",

  31: "ساحر الشاكرة العظيم 🔮",
  32: "سوبر سايان أول 💥",
  33: "مروض الوحوش الأسطوري 🦁",
  34: "فارس اللهب 🔥",
  35: "قناص الصدمة ⚡",
  36: "حاكم الرياح 🌪️",
  37: "ملك الحلبة 🥊",
  38: "سيد الكيميائيين ⚗️",
  39: "ملازم الاستكشاف 🎖️",
  40: "فارس القمر الذهبي 🌙",

  41: "هاشيرا الصخر 🪨",
  42: "هاشيرا الماء 🌊",
  43: "هاشيرا الرياح 🌪️",
  44: "هاشيرا الصوت 🎶",
  45: "هاشيرا الحب 💖",
  46: "هاشيرا الأفعى 🐍",
  47: "هاشيرا الحشرات 🦋",
  48: "هاشيرا الضباب 🌫️",
  49: "هاشيرا لهب النخبة 🔥",
  50: "هاشيرا الشمس الأسطوري ☀️",

  51: "صياد العمالقة النخبة 🪽",
  52: "بطل جدار ماريا 🧱",
  53: "قائد فرقة الاستطلاع 🦅",
  54: "مستكشف المحيط الأزرق 🌊",
  55: "محارب النور الكوني ✨",
  56: "سيد فنون الكي 🥋",
  57: "حارس العرش المغلق 🔐",
  58: "قاطع الأبعاد ⚔️",
  59: "أمير السايان المتطور 👑",
  60: "جنرال النرد الناري 🎲",

  61: "شينيغامي النخبة 💀",
  62: "فارس الهولو 🎭",
  63: "قائد الفرقة الـ 13 ⚔️",
  64: "مطلق قوة الزانباكتو 🌸",
  65: "سيد الشوندو ⚡",
  66: "ملك القراصنة القادم 🏴‍☠️",
  67: "حاكم الهاكي الملكي 👑",
  68: "مستكشف أرخبيل سابودي 🏝️",
  69: "قائد أسطول الأوتوكو 🚢",
  70: "بانكاي الزهرة الأرجوانية 🌸",

  71: "قاتل التنانين الناري 🐲",
  72: "قاتل التنانين البرقي ⚡",
  73: "قاتل التنانين الجليدي ❄️",
  74: "قاتل التنانين المظلم 🌑",
  75: "سيد قوة الجران بيل 🌟",
  76: "عاهل السحر الأسود 🔮",
  77: "محارب الإيتاشي الروحاني 👁️",
  78: "سيد عين الشارينجان المطلقة 👁️‍🗨️",
  79: "حاكم الرينجان الكونية 🌌",
  80: "أسطورة البانكاي الذهبي 🏆",

  81: "عاهل الظلال المبتدئ 👑",
  82: "مستدعي الفرسان السود 🛡️",
  83: "قائد جيش النمل الإمبراطوري 🐜",
  84: "حاكم زنزانة S-Rank 🏰",
  85: "سيد إعادة العياث (Arise) ⚡",
  86: "ملك الظلال المتسامي 🔮",
  87: "عاهل العوالم الموازية 🌌",
  88: "محارب الطاقة الفلكية 🌠",
  89: "سفير الإمبراطورية الكونية 👑",
  90: "إمبراطور الظلال الأسطوري 🏆",

  91: "إله السايان الأزرق ⚡",
  92: "حاكم الدمار الكوني 💥",
  93: "سيد الغريزة الفائقة (Ultra Instinct) 🤍",
  94: "سيد الغريزة الأنا (Ultra Ego) 💜",
  95: "ملك الجير الخامس (Gear 5 Nika) ☀️",
  96: "حاكم خطوط العالم الموحدة 🌐",
  97: "عاهل الأكاديمية المطلق 👑",
  98: "أسطورة الأنمي الأبدية ♾️",
  99: "إمبراطور أنمي بلاك الذهبي 🌟",
  100: "إله الأنمي الموحد (Supreme Black God) 👑🔥"
};

const SPECIFIC_TITLES_EN: { [key: number]: string } = {
  1: "Otaku Novice 🌱",
  2: "Saiyan Enthusiast ⚡",
  3: "Village Explorer 🍃",
  4: "Soul Hunter 👻",
  5: "Academy Cadet 🏫",
  6: "Ninja Apprentice 🥷",
  7: "Treasure Scout 🏴‍☠️",
  8: "Steel Knight 🛡️",
  9: "Magic Apprentice 🔮",
  10: "Bounty Hunter 🏆",

  11: "Grand Line Voyager 🌊",
  12: "Spellcaster 💫",
  13: "Ki Practitioner 🔥",
  14: "Demon Slayer ⚔️",
  15: "Shadow Knight 🌑",
  16: "Gate Guardian 🏛️",
  17: "Anime Sharpshooter 🎯",
  18: "Dojo Master 🥋",
  19: "Manga Creator ✍️",
  20: "Dimensional Explorer 🌌",

  21: "Chakra Warrior ⚡",
  22: "Ninja Prince 👑",
  23: "Beast Summoner 🐺",
  24: "Dragon Knight 🐉",
  25: "Cosmic Passage Walker 🌀",
  26: "Dual Blade Master ⚔️",
  27: "Gravity Fighter 🪐",
  28: "Combat Medic 💉",
  29: "Armorsmith 🛡️",
  30: "Phantom Master 👻",

  31: "High Sorcerer 🔮",
  32: "Super Saiyan I 💥",
  33: "Legendary Beast Tamer 🦁",
  34: "Flame Knight 🔥",
  35: "Shock Sniper ⚡",
  36: "Wind Controller 🌪️",
  37: "Arena Champion 🥊",
  38: "Master Alchemist ⚗️",
  39: "Scout Lieutenant 🎖️",
  40: "Golden Moon Knight 🌙",

  41: "Stone Hashira 🪨",
  42: "Water Hashira 🌊",
  43: "Wind Hashira 🌪️",
  44: "Sound Hashira 🎶",
  45: "Love Hashira 💖",
  46: "Serpent Hashira 🐍",
  47: "Insect Hashira 🦋",
  48: "Mist Hashira 🌫️",
  49: "Flame Hashira 🔥",
  50: "Sun Hashira Supreme ☀️",

  51: "Titan Hunter Elite 🪽",
  52: "Wall Maria Defender 🧱",
  53: "Scout Regiment Commander 🦅",
  54: "Blue Ocean Voyager 🌊",
  55: "Cosmic Light Warrior ✨",
  56: "Ki Martial Master 🥋",
  57: "Sealed Throne Keeper 🔐",
  58: "Dimension Slicer ⚔️",
  59: "Evolved Saiyan Prince 👑",
  60: "Flame General 🎲",

  61: "Elite Soul Reaper 💀",
  62: "Hollow Knight 🎭",
  63: "Squad 13 Captain ⚔️",
  64: "Unleashed Zanpakuto 🌸",
  65: "Shunpo Master ⚡",
  66: "Next Pirate King 🏴‍☠️",
  67: "Conqueror Haki Master 👑",
  68: "Sabaody Explorer 🏝️",
  69: "Otaku Fleet Admiral 🚢",
  70: "Bankai Cherry Blossom 🌸",

  71: "Fire Dragon Slayer 🐲",
  72: "Lightning Dragon Slayer ⚡",
  73: "Ice Dragon Slayer ❄️",
  74: "Shadow Dragon Slayer 🌑",
  75: "Grand Spell Master 🌟",
  76: "Dark Magic Overlord 🔮",
  77: "Spiritual Itachi Warrior 👁️",
  78: "Ultimate Sharingan Master 👁️‍🗨️",
  79: "Cosmic Rinnegan Ruler 🌌",
  80: "Golden Bankai Legend 🏆",

  81: "Shadow Monarch Apprentice 👑",
  82: "Shadow Knight Summoner 🛡️",
  83: "Ant King General 🐜",
  84: "S-Rank Gate Ruler 🏰",
  85: "Master of Arise ⚡",
  86: "Transcendent Shadow Lord 🔮",
  87: "Parallel World Monarch 🌌",
  88: "Astral Energy Warrior 🌠",
  89: "Cosmic Empire Envoy 👑",
  90: "Legendary Shadow Emperor 🏆",

  91: "Super Saiyan Blue God ⚡",
  92: "God of Destruction 💥",
  93: "Ultra Instinct Master 🤍",
  94: "Ultra Ego Master 💜",
  95: "Gear 5 Sun God Nika ☀️",
  96: "Worldline Overlord 🌐",
  97: "Supreme Academy Ruler 👑",
  98: "Eternal Anime Legend ♾️",
  99: "Golden Anime Black Emperor 🌟",
  100: "Supreme Anime Black God 👑🔥"
};

// Helper to calculate tier by level
export function getTierForLevel(level: number): LevelTier {
  const safeLvl = Math.max(1, Math.min(100, level));
  const found = TiersData.tiers.find(t => safeLvl >= t.minLevel && safeLvl <= t.maxLevel);
  return found || TiersData.tiers[0];
}

// Generate badge info for any level 1 to 100
export function getLevelBadgeInfo(level: number): LevelBadgeInfo {
  const lvl = Math.max(1, Math.min(100, Math.floor(level)));
  const tier = getTierForLevel(lvl);

  let rarity: LevelBadgeInfo["rarity"] = "Common";
  if (lvl >= 90) rarity = "Godlike";
  else if (lvl >= 80) rarity = "Divine";
  else if (lvl >= 70) rarity = "Mythic";
  else if (lvl >= 50) rarity = "Legendary";
  else if (lvl >= 35) rarity = "Epic";
  else if (lvl >= 20) rarity = "Rare";
  else if (lvl >= 10) rarity = "Uncommon";

  // Icons based on level modulo and milestone
  let icon = tier.icon;
  if (lvl === 100) icon = "👑";
  else if (lvl === 99) icon = "🌟";
  else if (lvl === 95) icon = "☀️";
  else if (lvl === 90) icon = "🏆";
  else if (lvl === 80) icon = "🔮";
  else if (lvl === 50) icon = "⚔️";

  // XP calculation
  const requiredXp = lvl * 500;
  const rewardCoins = lvl * 25 + (lvl % 10 === 0 ? 500 : 50);

  return {
    level: lvl,
    titleAr: SPECIFIC_TITLES_AR[lvl] || `مستوى ${lvl}`,
    titleEn: SPECIFIC_TITLES_EN[lvl] || `Level ${lvl}`,
    tierId: tier.id,
    tierNameAr: tier.nameAr,
    tierNameEn: tier.nameEn,
    rarity,
    icon,
    badgeBg: tier.gradient,
    textColor: tier.color,
    borderColor: tier.color,
    glowColor: tier.glow,
    requiredXp,
    rewardCoins,
    perksAr: lvl % 10 === 0 
      ? `فتح إطار خاص + لقب أسطوري + ${rewardCoins} كوينز سوداء` 
      : `زيادة السمعة + ${rewardCoins} كوينز سوداء`,
    perksEn: lvl % 10 === 0
      ? `Unlock Special Frame + Legendary Title + ${rewardCoins} Black Coins`
      : `Reputation boost + ${rewardCoins} Black Coins`,
    frameReward: lvl % 10 === 0 ? `frame_lvl_${lvl}` : undefined
  };
}

// Generate array of ALL 100 level badges
export function getAll100LevelBadges(): LevelBadgeInfo[] {
  const badges: LevelBadgeInfo[] = [];
  for (let i = 1; i <= 100; i++) {
    badges.push(getLevelBadgeInfo(i));
  }
  return badges;
}
