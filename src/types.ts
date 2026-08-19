export type UserRole =
  | "Guest"
  | "Member"
  | "PremiumBlack"
  | "BetaTester"
  | "Creator"
  | "NewsCreator"
  | "EventCreator"
  | "TraineeModerator"
  | "Moderator"
  | "SeniorModerator"
  | "SectionManager"
  | "Administrator"
  | "SuperAdministrator"
  | "Developer"
  | "Owner";

export type VerificationType =
  | "none"
  | "normal"
  | "creator"
  | "news"
  | "event"
  | "mod"
  | "admin"
  | "developer"
  | "official"
  | "vip";

export interface RoleConfig {
  id: UserRole;
  labelAr: string;
  labelEn: string;
  rankLevel: number; // For hierarchy check (e.g., lower rank cannot ban/action higher rank)
  badgeClass: string;
  permissions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  Guest: {
    id: "Guest",
    labelAr: "زائر",
    labelEn: "Guest",
    rankLevel: 0,
    badgeClass: "bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px] px-1.5 py-0.5 rounded",
    permissions: []
  },
  Member: {
    id: "Member",
    labelAr: "عضو",
    labelEn: "Member",
    rankLevel: 1,
    badgeClass: "bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded",
    permissions: ["create_post", "create_comment", "view_all"]
  },
  PremiumBlack: {
    id: "PremiumBlack",
    labelAr: "عضو مميز",
    labelEn: "Premium Black",
    rankLevel: 2,
    badgeClass: "bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-amber-400 border border-amber-500/40 text-[10px] px-1.5 py-0.5 rounded shadow-sm shadow-amber-500/10 font-bold animate-pulse",
    permissions: ["create_post", "create_comment", "view_all", "premium_features"]
  },
  BetaTester: {
    id: "BetaTester",
    labelAr: "مختبر تجريبي",
    labelEn: "Beta Tester",
    rankLevel: 2,
    badgeClass: "bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-1.5 py-0.5 rounded font-mono",
    permissions: ["create_post", "create_comment", "view_all", "beta_features"]
  },
  Creator: {
    id: "Creator",
    labelAr: "صانع محتوى",
    labelEn: "Creator",
    rankLevel: 3,
    badgeClass: "bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold",
    permissions: ["create_post", "create_comment", "view_all", "upload_reels", "custom_styles"]
  },
  NewsCreator: {
    id: "NewsCreator",
    labelAr: "محرر أخبار",
    labelEn: "News Creator",
    rankLevel: 3,
    badgeClass: "bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold",
    permissions: ["create_post", "create_comment", "view_all", "publish_news"]
  },
  EventCreator: {
    id: "EventCreator",
    labelAr: "منظم فعاليات",
    labelEn: "Event Creator",
    rankLevel: 3,
    badgeClass: "bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold",
    permissions: ["create_post", "create_comment", "view_all", "create_events"]
  },
  TraineeModerator: {
    id: "TraineeModerator",
    labelAr: "متدرب إشراف",
    labelEn: "Trainee Moderator",
    rankLevel: 4,
    badgeClass: "bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-medium",
    permissions: ["create_post", "create_comment", "view_all", "report_review", "warn_users"]
  },
  Moderator: {
    id: "Moderator",
    labelAr: "مشرف",
    labelEn: "Moderator",
    rankLevel: 5,
    badgeClass: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm shadow-emerald-600/20",
    permissions: ["create_post", "create_comment", "view_all", "report_review", "warn_users", "delete_content", "timeout_users"]
  },
  SeniorModerator: {
    id: "SeniorModerator",
    labelAr: "مشرف أول",
    labelEn: "Senior Moderator",
    rankLevel: 6,
    badgeClass: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm shadow-teal-600/20",
    permissions: ["create_post", "create_comment", "view_all", "report_review", "warn_users", "delete_content", "timeout_users", "ban_users"]
  },
  SectionManager: {
    id: "SectionManager",
    labelAr: "مدير قسم",
    labelEn: "Section Manager",
    rankLevel: 7,
    badgeClass: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold",
    permissions: ["create_post", "create_comment", "view_all", "report_review", "warn_users", "delete_content", "timeout_users", "ban_users", "manage_channels"]
  },
  Administrator: {
    id: "Administrator",
    labelAr: "مدير النظام",
    labelEn: "Administrator",
    rankLevel: 8,
    badgeClass: "bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black shadow-md shadow-red-600/10",
    permissions: ["create_post", "create_comment", "view_all", "admin_panel", "manage_users", "manage_reports", "manage_verification"]
  },
  SuperAdministrator: {
    id: "SuperAdministrator",
    labelAr: "المدير العام",
    labelEn: "Super Administrator",
    rankLevel: 9,
    badgeClass: "bg-gradient-to-r from-rose-600 via-purple-600 to-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black shadow-md shadow-rose-600/10",
    permissions: ["create_post", "create_comment", "view_all", "admin_panel", "manage_users", "manage_reports", "manage_verification", "manage_finance", "revert_actions"]
  },
  Developer: {
    id: "Developer",
    labelAr: "مطور النظام",
    labelEn: "Developer",
    rankLevel: 10,
    badgeClass: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shadow-md shadow-indigo-600/10",
    permissions: ["create_post", "create_comment", "view_all", "admin_panel", "manage_users", "manage_reports", "manage_verification", "manage_finance", "revert_actions", "developer_console", "edit_config"]
  },
  Owner: {
    id: "Owner",
    labelAr: "مالك المنصة",
    labelEn: "Owner",
    rankLevel: 11,
    badgeClass: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black text-[10px] px-1.5 py-0.5 rounded font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-300 animate-pulse",
    permissions: ["*"] // All permissions
  }
};

export interface VerificationConfig {
  id: VerificationType;
  labelAr: string;
  labelEn: string;
  badgeClass: string;
  iconColor: string;
}

export const VERIFICATION_CONFIGS: Record<VerificationType, VerificationConfig> = {
  none: {
    id: "none",
    labelAr: "غير موثق",
    labelEn: "Unverified",
    badgeClass: "hidden",
    iconColor: "text-zinc-600"
  },
  normal: {
    id: "normal",
    labelAr: "توثيق عادي",
    labelEn: "Verified Member",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    iconColor: "text-blue-500"
  },
  creator: {
    id: "creator",
    labelAr: "توثيق صانع محتوى",
    labelEn: "Verified Creator",
    badgeClass: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    iconColor: "text-pink-500"
  },
  news: {
    id: "news",
    labelAr: "توثيق فريق الأخبار",
    labelEn: "Verified News",
    badgeClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    iconColor: "text-sky-400"
  },
  event: {
    id: "event",
    labelAr: "توثيق منظم فعاليات",
    labelEn: "Verified Event",
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    iconColor: "text-amber-500"
  },
  mod: {
    id: "mod",
    labelAr: "توثيق مشرف",
    labelEn: "Verified Moderator",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  admin: {
    id: "admin",
    labelAr: "توثيق إدارة",
    labelEn: "Verified Admin",
    badgeClass: "bg-red-500/10 text-red-400 border border-red-500/20",
    iconColor: "text-red-500"
  },
  developer: {
    id: "developer",
    labelAr: "توثيق مطور",
    labelEn: "Verified Developer",
    badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    iconColor: "text-purple-400"
  },
  official: {
    id: "official",
    labelAr: "توثيق رسمي للمنصة",
    labelEn: "Official Platform",
    badgeClass: "bg-gradient-to-r from-red-500/10 to-purple-500/10 text-red-400 border border-purple-500/20",
    iconColor: "text-red-500"
  },
  vip: {
    id: "vip",
    labelAr: "توثيق شخصيات معروفة",
    labelEn: "VIP Entity",
    badgeClass: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    iconColor: "text-yellow-400"
  }
};

export interface UserVisibility {
  level: "public" | "followers" | "friends" | "me";
  reputation: "public" | "followers" | "friends" | "me";
  role: "public" | "followers" | "friends" | "me";
  coins: "public" | "followers" | "friends" | "me";
  stars: "public" | "followers" | "friends" | "me";
  achievements: "public" | "followers" | "friends" | "me";
  medals: "public" | "followers" | "friends" | "me";
  favAnime: "public" | "followers" | "friends" | "me";
  recentActivity: "public" | "followers" | "friends" | "me";
  joinedDate: "public" | "followers" | "friends" | "me";
}

export interface ActivityLogEntry {
  id: string;
  actionAr: string;
  actionEn: string;
  timestamp: string;
  category: "auth" | "profile" | "economy" | "activity" | "moderation";
  detailsAr?: string;
  detailsEn?: string;
}

export interface VerificationRequest {
  id: string;
  fullName: string;
  username: string;
  reason: string;
  reqType: VerificationType;
  links: string;
  status: "pending" | "needs_info" | "accepted" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  uid?: string;
  id?: string;
  themeSettings?: any;
  themeCustomSettings?: any;
  starredThemes?: string[];
  createdThemes?: any[];
  unlockedThemes?: string[];
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  bio?: string;
  country?: string;
  language?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  reelsCount?: number;
  storiesCount?: number;

  // Volume 1, Chapter 5 Extended Digital Identity
  role?: UserRole;
  verificationType?: VerificationType;
  level?: number;
  xp?: number;
  prestige?: number;
  coins?: number;
  stars?: number;
  reputation?: number; // 0-100
  activityIndex?: number; // 0-100 percentage
  consecutiveDays?: number;
  joinedDate?: string;
  interests?: string[];
  favAnime?: string[];
  favManga?: string[];
  favCharacters?: string[];
  appearanceMode?: "dark" | "light";
  theme?: string;
  frame?: string | null;
  titles?: string[];
  activeTitle?: string;
  medals?: string[];
  achievements?: string[];
  engagementRate?: number;
  visibility?: UserVisibility;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedIndex: number | null;
}

export interface Post {
  id: string;
  authorId?: string;
  author: User;
  content: string;
  image: string | null;
  video: string | null;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  poll: Poll | null;
  createdAt: string;
  views?: number;
  reposts?: number;
  shares?: number;
  saves?: number;
  stars?: number;
  coins?: number;
  audience?: "public" | "friends" | "followers" | "private";
  tags?: string[];
  isEdited?: boolean;
}

export interface Story {
  id: string;
  author: {
    name: string;
    avatar: string;
    username?: string;
  };
  mediaType: "image" | "video";
  url: string;
  views: number;
  question: string | null;
  poll: {
    question: string;
    options: string[];
    votes: number[];
  } | null;
  storyType?: "text" | "image" | "video" | "gif" | "voice" | "music" | "poll" | "qa" | "link" | "anime_card" | "character_card" | "share_post" | "share_reels" | "share_event";
  entityType?: "user" | "friend" | "group" | "channel" | "guild" | "space" | "event" | "admin";
  entityName?: string;
  musicTitle?: string;
  musicArtist?: string;
  linkUrl?: string;
  linkTitle?: string;
  animeCardId?: string;
  animeCardTitle?: string;
  animeCardImage?: string;
  characterCardId?: string;
  characterCardName?: string;
  characterCardImage?: string;
  shareItemId?: string;
  shareItemTitle?: string;
  themeFrame?: string; // "red-dragon" | "purple-susanoo" | "neon-cyberspace" | "cherry-blossom" | "none"
  animeEffect?: string; // "sharingan" | "ki-aura" | "sakura-leaves" | "glitch" | "fire-sparks" | "lightning" | "none"
  stickers?: string[]; // array of sticker texts or emojis
  filters?: string; // css filter values
  allowReplies?: boolean;
  allowShare?: boolean;
  preventDownload?: boolean;
  audience?: "public" | "friends" | "followers" | "custom";
  hiddenUsers?: string[];
  isPinned?: boolean;
  highlightId?: string;
  highlightName?: string;
  xpReward?: number;
  coinReward?: number;
  createdAt?: string;
}

export interface Reel {
  id: string;
  title: string;
  videoUrl: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  likes: number;
  commentsCount: number;
  shares: number;
  hasLiked: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "ai" | "admin" | string;
  senderName?: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: "personal" | "group" | "channel" | "ai";
  lastSeen: string;
  isOnline: boolean;
  messages: Message[];
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "system";
  text: string;
  time: string;
  read: boolean;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  targetId?: string;
  targetType?: "post" | "comment" | "chat" | "user";
  createdAt?: string;
  replies?: {
    id: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    createdAt: string;
  }[];
}


export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  mediaUrl?: string;
  voiceNoteUrl?: string;
  stickerId?: string;
  read: boolean;
  
  // Rich features
  mediaType?: "image" | "video";
  imageWidth?: number;
  voiceDuration?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  translatedText?: string;
  file?: { name: string; size: string; type: string; url: string };
  poll?: { question: string; options: { text: string; votes: string[] }[] };
  location?: { lat: number; lng: number; label: string };
  sharedItem?: { type: "post" | "reel" | "story" | "user"; id: string; title: string; image?: string; authorName?: string };
  replyTo?: { id: string; text: string; senderName: string };
  reactions?: Record<string, string[]>;
  call?: { type: "audio" | "video"; duration?: string; status: "missed" | "completed" | "declined" | "ongoing" };
  [deletedForUser: `deletedFor.${string}`]: boolean | undefined;
}

export interface DirectChat {
  id: string;
  participants: string[]; // user UIDs
  participantDetails: Record<string, { name: string; avatar: string; username: string }>;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  
  // Rich chat settings
  pinnedBy?: Record<string, boolean>;
  archivedBy?: Record<string, boolean>;
  mutedBy?: Record<string, boolean>;
  lockCode?: Record<string, string | null>;
  deletedBy?: Record<string, boolean>;
  typingStates?: Record<string, "idle" | "typing" | "recording" | "uploading">;
}

export interface Follows {
  id: string; // "followerId_followingId"
  followerId: string;
  followingId: string;
  createdAt: string;
}
