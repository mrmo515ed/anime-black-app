import { UserRole, VerificationType } from "../types";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: UserRole;
  rankLevel: number;
  status: "Active" | "Muted" | "Banned";
  points: number;
  decisionsCount: number;
  responseTimeMin: number;
}

export interface AdminReport {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  reporter: string;
  reason: string;
  description: string;
  screenshot?: string;
  evidenceLinks?: string[];
  status: "pending" | "resolved" | "dismissed";
  slaMinutes: number;
  remainingMinutes: number;
  language: string;
  region: string;
  aiRecommendation: {
    action: string;
    confidence: number;
    reasonAr: string;
    reasonEn: string;
  };
}

export interface AdminTicket {
  id: string;
  title: string;
  category: "tech" | "payment" | "recovery" | "appeal" | "verification" | "marketplace" | "suggestion" | "complaint" | "inquiry";
  creator: string;
  status: "new" | "review" | "waiting_user" | "waiting_admin" | "resolved" | "closed" | "reopened";
  messages: {
    sender: string;
    role: "user" | "admin";
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminContentItem {
  id: string;
  contentType: "post" | "comment" | "reel" | "story" | "news" | "event" | "group" | "channel" | "guild" | "space";
  author: string;
  title?: string;
  content: string;
  imageUrl?: string;
  reportsCount: number;
  createdAt: string;
}

export interface AdminEconomyItem {
  id: string;
  category: "marketplace" | "inventory" | "theme" | "card" | "frame";
  owner: string;
  name: string;
  price?: number;
  currency?: "coins" | "stars";
  status: "approved" | "pending" | "rejected";
  details?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  executor: string;
  role: UserRole;
  action: string;
  device: string;
  ip: string;
  reason: string;
  result: string;
}

export const INITIAL_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Guest: [],
  Member: ["create_post", "create_comment", "create_story", "create_reel", "chat"],
  PremiumBlack: ["create_post", "create_comment", "create_story", "create_reel", "chat", "custom_theme"],
  BetaTester: ["create_post", "create_comment", "create_story", "create_reel", "chat", "beta_features"],
  Creator: ["create_post", "create_comment", "create_story", "create_reel", "chat", "create_guild"],
  NewsCreator: ["create_news", "edit_news", "publish_news"],
  EventCreator: ["create_event", "manage_event_participants"],
  TraineeModerator: ["review_reports", "temp_hide_content", "send_recommendation"],
  Moderator: ["review_reports", "delete_post", "delete_comment", "mute_user", "timeout_user"],
  SeniorModerator: ["review_reports", "delete_post", "delete_comment", "delete_reel", "delete_story", "mute_user", "timeout_user", "ban_user"],
  SectionManager: ["review_reports", "delete_post", "delete_comment", "delete_reel", "delete_story", "mute_user", "timeout_user", "ban_user", "manage_section_mods"],
  Administrator: [
    "review_reports",
    "delete_post",
    "delete_comment",
    "delete_reel",
    "delete_story",
    "mute_user",
    "timeout_user",
    "ban_user",
    "manage_mods",
    "manage_sections",
    "manage_events",
    "manage_news",
    "manage_marketplace",
    "manage_verification"
  ],
  SuperAdministrator: [
    "review_reports",
    "delete_post",
    "delete_comment",
    "delete_reel",
    "delete_story",
    "mute_user",
    "timeout_user",
    "ban_user",
    "manage_mods",
    "manage_sections",
    "manage_events",
    "manage_news",
    "manage_marketplace",
    "manage_verification",
    "manage_users",
    "delete_accounts",
    "manage_store",
    "manage_currencies",
    "manage_subscriptions",
    "manage_api_bots",
    "manage_system"
  ],
  Developer: ["manage_api_bots", "beta_features", "access_dev_logs"],
  Owner: [
    "review_reports",
    "delete_post",
    "delete_comment",
    "delete_reel",
    "delete_story",
    "mute_user",
    "timeout_user",
    "ban_user",
    "manage_mods",
    "manage_sections",
    "manage_events",
    "manage_news",
    "manage_marketplace",
    "manage_verification",
    "manage_users",
    "delete_accounts",
    "manage_store",
    "manage_currencies",
    "manage_subscriptions",
    "manage_api_bots",
    "manage_system",
    "full_access"
  ]
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "u1",
    name: "مروان كين",
    username: "MarwanKen",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "SuperAdministrator",
    rankLevel: 9,
    status: "Active",
    points: 1250,
    decisionsCount: 320,
    responseTimeMin: 4.2
  },
  {
    id: "u2",
    name: "يوكي هيروشي",
    username: "YukiHiro",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "Administrator",
    rankLevel: 8,
    status: "Active",
    points: 980,
    decisionsCount: 210,
    responseTimeMin: 5.8
  },
  {
    id: "u3",
    name: "ليفاي أكرمان",
    username: "LeviAckerman",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "SeniorModerator",
    rankLevel: 6,
    status: "Active",
    points: 870,
    decisionsCount: 195,
    responseTimeMin: 6.1
  },
  {
    id: "u4",
    name: "ساكورا تشان",
    username: "SakuraChan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "TraineeModerator",
    rankLevel: 4,
    status: "Active",
    points: 150,
    decisionsCount: 45,
    responseTimeMin: 12.4
  },
  {
    id: "u5",
    name: "ناروتو أوزوماكي",
    username: "Naruto99",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    role: "Member",
    rankLevel: 1,
    status: "Active",
    points: 0,
    decisionsCount: 0,
    responseTimeMin: 0
  },
  {
    id: "u6",
    name: "أوتشيها ساسكي",
    username: "SasukeUchiha",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Member",
    rankLevel: 1,
    status: "Muted",
    points: 0,
    decisionsCount: 0,
    responseTimeMin: 0
  }
];

export const INITIAL_REPORTS: AdminReport[] = [
  {
    id: "REP-4012",
    type: "post",
    targetId: "post-88",
    targetName: "SasukeUchiha",
    reporter: "YukiHiro",
    reason: "محتوى مسيئ للآخرين وسب وشتم",
    description: "قام المستخدم بكتابة منشور يحتوي على إهانات مباشرة لأعضاء مجتمع ون بيس وتخريب نقاش الفصل الأخير.",
    status: "pending",
    slaMinutes: 15,
    remainingMinutes: 8,
    language: "Arabic",
    region: "Middle East",
    aiRecommendation: {
      action: "delete_post_mute_user",
      confidence: 94,
      reasonAr: "المنشور يحتوي على عبارات نابية صريحة تنتهك البند الرابع من سياسة المجتمع.",
      reasonEn: "The post contains explicit insults violating clause 4 of community policies."
    }
  },
  {
    id: "REP-4013",
    type: "user",
    targetId: "u6",
    targetName: "SasukeUchiha",
    reporter: "LeviAckerman",
    reason: "إنشاء حسابات وهمية لإساءة الاستخدام",
    description: "كشف نظام السلوك المشبوه أن هذا الحساب مرتبط بـ 3 حسابات أخرى تم حظرها سابقاً باستخدام نفس البصمة الرقمية المتشابهة.",
    status: "pending",
    slaMinutes: 30,
    remainingMinutes: 21,
    language: "English",
    region: "Global",
    aiRecommendation: {
      action: "ban_user",
      confidence: 89,
      reasonAr: "تطابق البصمة الرقمية للجهاز ومعدل الكلمات مع مستخدم محظور سابقاً بتهمة التخريب المستمر.",
      reasonEn: "Device fingerprint and typing cadence match a previously banned user for repeated griefing."
    }
  },
  {
    id: "REP-4014",
    type: "comment",
    targetId: "comment-12",
    targetName: "Naruto99",
    reporter: "SakuraChan",
    reason: "حرق أحداث مانجا غير معلن عنه",
    description: "قام بحرق الفصل الأخير من جوجوتسو كايسن في تعليق عام دون تفعيل وسم الحرق المخصص.",
    status: "pending",
    slaMinutes: 10,
    remainingMinutes: 4,
    language: "Arabic",
    region: "Middle East",
    aiRecommendation: {
      action: "delete_comment_warn_user",
      confidence: 97,
      reasonAr: "حرق الأحداث يؤثر سلباً على تجربة المستخدمين. يوصى بحذف التعليق وتوجيه تنبيه خفيف.",
      reasonEn: "Unspoiler'd leaks degrade user experience. Recommended action is comment deletion + mild warning."
    }
  }
];

export const INITIAL_TICKETS: AdminTicket[] = [
  {
    id: "TCK-801",
    title: "مشكلة في شحن عملات Black Coin",
    category: "payment",
    creator: "Naruto99",
    status: "new",
    createdAt: "2026-07-05T06:30:00Z",
    updatedAt: "2026-07-05T06:30:00Z",
    messages: [
      {
        sender: "Naruto99",
        role: "user",
        text: "مرحباً، قمت بشحن 500 عملة بلاك عبر بطاقة الائتمان وتم خصم المبلغ ولكن العملات لم تظهر في حسابي حتى الآن. أرجو المساعدة.",
        timestamp: "2026-07-05T06:30:00Z"
      }
    ]
  },
  {
    id: "TCK-802",
    title: "طلب استرجاع حساب مسروق",
    category: "recovery",
    creator: "ZoroFan",
    status: "review",
    createdAt: "2026-07-04T18:00:00Z",
    updatedAt: "2026-07-05T07:15:00Z",
    messages: [
      {
        sender: "ZoroFan",
        role: "user",
        text: "تغير البريد الإلكتروني الخاص بحسابي دون علمي، ولا يمكنني تسجيل الدخول. هذا حسابي الأصلي المسجل ببريد zoro@gmail.com.",
        timestamp: "2026-07-04T18:00:00Z"
      },
      {
        sender: "YukiHiro",
        role: "admin",
        text: "مرحباً بك. يرجى تزويدنا بصورة من آخر فاتورة شراء قمت بها عبر الحساب أو بريد التسجيل الأول لتأكيد ملكيتك.",
        timestamp: "2026-07-05T07:15:00Z"
      }
    ]
  }
];

export const INITIAL_CONTENT: AdminContentItem[] = [
  {
    id: "post-88",
    contentType: "post",
    author: "SasukeUchiha",
    title: "نقاش الفصل الأخير",
    content: "فصل فاشل وكاتب أحمق لا يفقه شيئاً ومتابعي ون بيس مجرد أطفال أغبياء!",
    reportsCount: 5,
    createdAt: "2026-07-05T07:30:00Z"
  },
  {
    id: "comment-12",
    contentType: "comment",
    author: "Naruto99",
    content: "يا جماعة غوجو سيموت في هذا الفصل على يد سوكونا بضربة قطع العالم!! هههههههه حرق حرق!",
    reportsCount: 3,
    createdAt: "2026-07-05T07:45:00Z"
  },
  {
    id: "guild-1",
    contentType: "guild",
    author: "GriefGuy",
    title: "مخربي الألعاب والأنمي",
    content: "هذه نقابة مخصصة لتخريب البثوث المباشرة للأنمي وحرق الفصول الجديدة فور صدور تسريباتها اليابانية.",
    reportsCount: 8,
    createdAt: "2026-07-04T12:00:00Z"
  }
];

export const INITIAL_ECONOMY: AdminEconomyItem[] = [
  {
    id: "eco-101",
    category: "marketplace",
    owner: "ZoroFan",
    name: "إطار سيف الشوسوي الأسطوري",
    price: 450,
    currency: "coins",
    status: "pending",
    details: "إطار مخصص مصمم بألوان كلاسيكية مستوحى من سيف زورو الأسطوري شوسوي."
  },
  {
    id: "eco-102",
    category: "theme",
    owner: "LuffyKing",
    name: "ثيم الجير الخامس البرق الأبيض",
    price: 30,
    currency: "stars",
    status: "approved",
    details: "ثيم كامل للملف الشخصي مع هالات متحركة بالبرق وتأثيرات صوتية مميزة."
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "LOG-9081",
    timestamp: "2026-07-05T07:55:00Z",
    executor: "MarwanKen",
    role: "SuperAdministrator",
    action: "تعديل إعدادات المتجر العام",
    device: "macOS • Chrome",
    ip: "197.34.88.112",
    reason: "تحديث أسعار العروض الأسبوعية",
    result: "تم تعديل نسبة الخصم بنجاح إلى 20%"
  },
  {
    id: "LOG-9082",
    timestamp: "2026-07-05T07:48:00Z",
    executor: "LeviAckerman",
    role: "SeniorModerator",
    action: "كتم مؤقت للمستخدم @SasukeUchiha",
    device: "iPhone • App",
    ip: "82.112.4.90",
    reason: "إساءة لفظية مستمرة في قسم التعليقات العامة",
    result: "كتم العضو لمدة 24 ساعة ومنعه من الكتابة"
  },
  {
    id: "LOG-9083",
    timestamp: "2026-07-05T07:15:00Z",
    executor: "YukiHiro",
    role: "Administrator",
    action: "تحديث تذكرة الدعم TCK-802",
    device: "Windows • Firefox",
    ip: "102.44.120.3",
    reason: "طلب وثائق إضافية لإثبات الملكية",
    result: "تغيير حالة التذكرة إلى 'قيد المراجعة'"
  }
];

export const INTERNAL_KNOWLEDGE_BASE = [
  {
    id: "kb-1",
    titleAr: "سياسة الألفاظ والسب في Anime Black",
    titleEn: "Profanity & Abuse Policy",
    categoryAr: "إشراف",
    categoryEn: "Moderation",
    contentAr: "يُمنع منعاً باتاً استخدام الألفاظ البذيئة أو الإهانات الشخصية. العقوبة الأولى: تنبيه وحذف المحتوى. العقوبة الثانية: كتم لمدة 24 ساعة. العقوبة الثالثة: حظر مؤقت لمدة 7 أيام. التكرار المستمر يؤدي لحظر دائم.",
    contentEn: "Strictly bans any profanity or personal slurs. First offence: Warning + content deletion. Second: 24-hour mute. Third: 7-day ban. Persistent violations lead to permanent ban."
  },
  {
    id: "kb-2",
    titleAr: "شروط توثيق الحسابات والمجموعات",
    titleEn: "Verification Eligibility Rules",
    categoryAr: "سياسات الدعم",
    categoryEn: "Support Policies",
    contentAr: "يتطلب الحصول على شارة صانع محتوى (Creator) ما لا يقل عن 5000 متابع وتقديم إثبات ملكية من منصة معروفة أخرى (يوتيوب، إكس، تيك توك). يتطلب توثيق المجموعات نشاطاً يومياً لا يقل عن 200 مشارك.",
    contentEn: "Creator badge requires at least 5000 followers and ownership verification from a known platform. Group verification requires daily activity of 200+ members."
  }
];
