import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  Shield,
  Coins,
  Calendar,
  Award,
  BookOpen,
  Crown,
  Sliders,
  Users,
  Flame,
  Ticket,
  Cpu,
  Code,
  Sparkles,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  HelpCircle,
  QrCode,
  Check,
  Star,
  Settings,
  Bell,
  BarChart2,
  Lock,
  Globe,
  HardDrive,
  Fingerprint,
  Smartphone,
  Key,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  LogOut,
  Laptop,
  MapPin,
  Mail,
  Plus,
  Link,
  ArrowRight,
  Bookmark,
  Film,
  Quote,
  EyeOff,
  Archive,
  MessageSquare,
  ChevronLeft,
  BellRing,
  Settings2,
  Image,
  ListTodo,
  AlignLeft,
  Eye,
  BarChart3,
  Sun,
  Moon } from
"lucide-react";
import OtakuStatsModal from "./OtakuStatsModal";
import LevelBadge from "./LevelBadge";
import LevelBadgesModal from "./LevelBadgesModal";

interface MoreHubProps {
  appearanceMode?: "dark" | "light";
  setAppearanceMode?: (mode: "dark" | "light") => void;
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  blackCoins: number;
  setBlackCoins: React.Dispatch<React.SetStateAction<number>>;
  stars: number;
  setStars: React.Dispatch<React.SetStateAction<number>>;
  activeFrame: string | null;
  setActiveFrame: React.Dispatch<React.SetStateAction<string | null>>;
  playSynthSound?: (type: any) => void;
  triggerHapticFeedback?: (type: any) => void;
  isOffline: boolean;
  addToOfflineQueue?: (actionName: string) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  onOpenLiveSuite?: (mode: "call" | "stream" | "watchparty" | null, target?: string | null) => void;
  onOpenEconomy?: () => void;
  onOpenAdministration?: () => void;
  isInline?: boolean;
  onOpenProfile?: () => void;
}

const shortcutItems = [
{
  id: "anime",
  icon: Film,
  labelAr: "موسوعة الأنمي",
  labelEn: "Anime Wiki",
  bgLight: "bg-red-950/20 border-red-900/30 text-red-400",
  color: "from-red-600 to-orange-500"
},
{
  id: "manga",
  icon: BookOpen,
  labelAr: "مكتبة المانجا",
  labelEn: "Manga Tracker",
  bgLight: "bg-amber-950/20 border-amber-900/30 text-amber-400",
  color: "from-amber-500 to-yellow-400"
},
{
  id: "characters",
  icon: Users,
  labelAr: "دليل الشخصيات",
  labelEn: "Characters Guide",
  bgLight: "bg-cyan-950/20 border-cyan-900/30 text-cyan-400",
  color: "from-cyan-500 to-blue-500"
},
{
  id: "quotes",
  icon: Quote,
  labelAr: "صندوق الاقتباسات",
  labelEn: "Famous Quotes",
  bgLight: "bg-purple-950/20 border-purple-900/30 text-purple-400",
  color: "from-purple-500 to-indigo-500"
},
{
  id: "explanations",
  icon: HelpCircle,
  labelAr: "شروحات الويكي",
  labelEn: "Lore Guides",
  bgLight: "bg-emerald-950/20 border-emerald-900/30 text-emerald-400",
  color: "from-emerald-500 to-teal-500"
},
{
  id: "news",
  icon: Sparkles,
  labelAr: "أخبار ساخنة",
  labelEn: "Hot News",
  bgLight: "bg-pink-950/20 border-pink-900/30 text-pink-400",
  color: "from-pink-500 to-rose-500"
},
{
  id: "videos",
  icon: Film,
  labelAr: "فيديوهات حماسية",
  labelEn: "Videos & Promos",
  bgLight: "bg-blue-950/20 border-blue-900/30 text-blue-400",
  color: "from-blue-600 to-sky-500"
},
{
  id: "favs",
  icon: Heart,
  labelAr: "المفضلة والألقاب",
  labelEn: "Favorites Hub",
  bgLight: "bg-rose-950/20 border-rose-900/30 text-rose-400",
  color: "from-rose-600 to-pink-500"
},
{
  id: "stats",
  icon: BarChart2,
  labelAr: "إحصائيات الأوتاكو الشاملة",
  labelEn: "Otaku Stats",
  bgLight: "bg-orange-950/20 border-orange-900/30 text-orange-400",
  color: "from-orange-500 to-amber-500"
}];


const sectionGroups: any[] = [
{
  titleAr: "مكتبتي الخاصة",
  titleEn: "My Library",
  icon: BookOpen,
  items: [
  { id: "otaku_stats", icon: BarChart2, labelAr: "إحصائيات الأوتاكو الشاملة", labelEn: "Comprehensive Otaku Stats", descAr: "تحليل كامل لساعات المشاهدة، المانجا، التصنيفات، والاستوديوهات المفضلة", descEn: "Detailed breakdown of watched episodes, manga, and favorite genres" },
  { id: "my_favs", icon: Heart, labelAr: "المفضلة والألقاب الخاصة بي", labelEn: "My Favorites & Titles", descAr: "أنميات، شخصيات، وألقاب قمت باقتنائها", descEn: "Favorite anime, characters, and equipped titles" },
  { id: "saved-articles", icon: Bookmark, labelAr: "المقالات المحفوظة", labelEn: "Saved Articles", descAr: "تحليلات وأخبار قمت بحفظها للمطالعة لاحقاً", descEn: "Saved analytical posts and reading backlog" },
  { id: "history", icon: Clock, labelAr: "سجل المشاهدة الكامل", labelEn: "Complete Watch History", descAr: "كل الحلقات والعروض الترويجية التي شاهدتها حياً", descEn: "Comprehensive list of viewed episodes and streams" },
  { id: "last-watched", icon: Film, labelAr: "آخر ما شاهدته والتقدم", labelEn: "Last Watched Progress", descAr: "متابعة تقدم حلقات الأنمي الحالية خطوة بخطوة", descEn: "Track current episodes progress and completion status" }]

},
{
  titleAr: "المجتمع والتفاعل",
  titleEn: "My Community",
  icon: Users,
  items: [
  { id: "my-posts", icon: MessageSquare, labelAr: "منشوراتي الشخصية والمدونات", labelEn: "My Posts & Blogs", descAr: "إدارة منشوراتك العامة وتفاعلات الأعضاء", descEn: "Manage your published posts and track feedback" },
  { id: "my-hidden-posts", icon: EyeOff, labelAr: "المنشورات المخفية", labelEn: "My Hidden Posts", descAr: "أرشيف خاص للمنشورات غير المرئية للعامة", descEn: "Private vault for posts hidden from active public feed" },
  { id: "my-archived-posts", icon: Archive, labelAr: "منشوراتي المؤرشفة", labelEn: "My Archived Posts", descAr: "مستودع المنشورات القديمة والمغلقة", descEn: "Archived threads and closed discussion cards" },
  { id: "my-replies", icon: MessageCircle, labelAr: "سجل الردود والتعليقات الخاصة بي", labelEn: "My Replies & Comments", descAr: "جميع تعليقاتك في المنتديات وغرف النقاش", descEn: "Log of your feedback, reviews, and community answers" },
  { id: "my-followers", icon: Users, labelAr: "المتابعون وقوائم الصداقة", labelEn: "Followers & Friends", descAr: "إدارة من يتابعونك ومن تتابعهم من الأصدقاء", descEn: "Manage follower circles and following lists" },
  { id: "my-groups", icon: Shield, labelAr: "النقابات والمجموعات المشترك بها", labelEn: "My Guilds & Groups", descAr: "تحقق من رتبتك وأنشطة فيلقك ونقابتك", descEn: "Review active status inside Otaku squads and clans" },
  { id: "my-channels", icon: Globe, labelAr: "قنوات الدردشة الحالية", labelEn: "Active Chat Channels", descAr: "إدارة غرف الدردشة المنضم إليها داخل التطبيق", descEn: "Lobbies and channels you currently occupy" }]

},
{
  titleAr: "الهوية والأمان",
  titleEn: "Identity & Security",
  icon: Shield,
  items: [
  { id: "edit-profile", icon: User, labelAr: "تعديل المظهر المتقدم", labelEn: "Advanced Identity Customizer", descAr: "تعديل اسمك، أفاتار، ورموز هويتك الرقمية", descEn: "Customize avatar frames, display handles, and metadata", triggerAction: "profile" },
  { id: "account_security", icon: Fingerprint, labelAr: "إعدادات الأمان والتوثيق والـ 2FA", labelEn: "Security & MFA Center", descAr: "المصادقة متعددة العوامل، سجل الجلسات النشطة، والتوثيق", descEn: "Configure active session tokens, link social logins, and multi-factor auth", isCategory: true, categoryId: "account", subtab: "security" },
  { id: "privacy", icon: Lock, labelAr: "إعدادات خصوصية الهوية والبيانات", labelEn: "Identity Privacy Rules", descAr: "من يمكنه رؤية رصيدك، مستواك، وإنجازاتك الشخصية", descEn: "Control visibility of levels, coin counts, and medals to strangers", isCategory: true, categoryId: "account", subtab: "privacy" }]

},
{
  titleAr: "خدمات الأنظمة والبيئة",
  titleEn: "Services & Systems",
  icon: Settings,
  items: [
  { id: "appearance_settings", icon: Sun, labelAr: "المظهر", labelEn: "Appearance", descAr: "الوضع النهاري والوضع الليلي", descEn: "Light Mode & Dark Mode", isCategory: true, categoryId: "appearance" },
  { id: "economy_store", icon: Coins, labelAr: "متجر الاقتصاد والإطارات الحية", labelEn: "Economy & Frame Boutique", descAr: "شراء إطارات متميزة وتفعيل ألقاب أسطورية", descEn: "Acquire limited-edition frames and equip glowing titles", isCategory: true, categoryId: "economy" },
  { id: "activity_quests", icon: Calendar, labelAr: "المهام والفعاليات ونظام الرتب", labelEn: "Quests & Interactive Leveling", descAr: "المهام اليومية، نقاط السجل، ومخطط الخبرة XP", descEn: "Daily challenge lists, rep thresholds, and levels", isCategory: true, categoryId: "activity" },
  { id: "admin_panel", icon: Shield, labelAr: "لوحة التحكم والتقارير الإدارية", labelEn: "System Control Panel", descAr: "مخصصة للمشرفين والمنسقين لرصد المخالفات", descEn: "Privileged terminal for active moderation and audit reports", isCategory: true, categoryId: "admin" },
  { id: "dev_tools", icon: Code, labelAr: "بوابة المطورين وبناء الروبوتات SDK", labelEn: "Developer Center & Bot Nodes", descAr: "توليد مفاتيح API، وبناء Bots مخصصة للمجتمع", descEn: "Deploy automated helper nodes, register apps, and fetch client secrets", isCategory: true, categoryId: "developers" },
  { id: "hub_settings", icon: Settings, labelAr: "إعدادات مركز التحكم العام", labelEn: "Hub Settings", descAr: "التحكم بالحركة والألوان عالية التباين وخيارات الأمان", descEn: "Fine-tune UI rendering, disable motion loops, and toggle contrast", isCategory: true, categoryId: "settings" }]

}];


export default function MoreHub({
  appearanceMode = "dark",
  setAppearanceMode,
  isOpen,
  onClose,
  isArabic,
  currentUser,
  setCurrentUser,
  blackCoins,
  setBlackCoins,
  stars,
  setStars,
  activeFrame,
  setActiveFrame,
  playSynthSound,
  triggerHapticFeedback,
  isOffline,
  addToOfflineQueue,
  reduceMotion,
  setReduceMotion,
  highContrast,
  setHighContrast,
  onOpenLiveSuite,
  onOpenEconomy,
  onOpenAdministration,
  isInline = false,
  onOpenProfile
}: MoreHubProps) {
  const [activeCategory, setActiveCategory] = useState<
    "account" | "appearance" | "community" | "universe" | "economy" | "activity" | "admin" | "developers" | "settings" | "apk_download">(
    "account");

  const [viewMode, setViewMode] = useState<"grid" | "detail" | "subpage">("grid");
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [subPageLoading, setSubPageLoading] = useState(false);
  const [subPageSearch, setSubPageSearch] = useState("");
  const [subPageFilter, setSubPageFilter] = useState("all");
  const [showOtakuStatsModal, setShowOtakuStatsModal] = useState(false);
  const [show100LevelBadgesModal, setShow100LevelBadgesModal] = useState(false);

  // APK & WebAPK Download State
  const [downloadingApkProgress, setDownloadingApkProgress] = useState<number | null>(null);
  const [apkDownloadSuccess, setApkDownloadSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleTriggerPwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          if (playSynthSound) playSynthSound("level_up");
          alert(isArabic ? "شغال! تم بدء تثبيت تطبيق أنمي بلاك على جهازك بنجاح." : "Success! AnimeBlack app installation started.");
        }
        setDeferredPrompt(null);
      });
    } else {
      alert(isArabic ? "للتثبيت المباشر على الشاشة: افتح قائمة المتصفح (⋮) ثم اضغط على 'إضافة إلى الشاشة الرئيسية' أو 'تثبيت التطبيق' (Install App)." : "To install directly to home screen: open browser menu (⋮) and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  // Helper to convert numbers to Arabic Eastern digits
  const toArabicDigits = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return "";
    if (!isArabic) return num.toString();
    const chars = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
    return num.toString().replace(/[0-9]/g, (w) => (chars as any)[w]);
  };

  // Interactive Sub-page States
  const [favorites, setFavorites] = useState<any[]>([]);
  useEffect(() => {
    if (currentUser) {
      const animeFavs = (currentUser.favAnime || []).map((name: string, i: number) => ({
        id: `anime_${i}`,
        type: "anime",
        nameAr: name,
        nameEn: name,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300"
      }));
      const charFavs = (currentUser.favCharacters || []).map((name: string, i: number) => ({
        id: `char_${i}`,
        type: "character",
        nameAr: name,
        nameEn: name,
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300"
      }));
      setFavorites([...animeFavs, ...charFavs]);
    }
  }, [currentUser]);

  // Saved Articles
  const [savedArticles, setSavedArticles] = useState([
  { id: "art_1", titleAr: "تحليل كامل لنهاية هجوم العمالقة والرسائل الخفية", titleEn: "Complete Analysis of Shingeki no Kyojin Ending", category: "analysis", date: "2026-07-15", reads: 1420 },
  { id: "art_2", titleAr: "أقوى 10 تقنيات نينجا في تاريخ ناروتو", titleEn: "Top 10 Jutsu in Naruto History Explained", category: "list", date: "2026-07-12", reads: 3200 },
  { id: "art_3", titleAr: "دليل المبتدئين لفهم عوالم المانجا والويب تون", titleEn: "Beginners Guide to Manga & Webtoons", category: "guide", date: "2026-07-10", reads: 950 }]
  );

  // Saved Posts
  const [savedPostsState, setSavedPostsState] = useState([
  { id: "sp_1", author: "ken_owner", content: "استعدوا لمهرجان الأنمي الصيفي القادم! جوائز ضخمة بانتظاركم 🌸🔥", likes: 142, date: "2026-07-19" },
  { id: "sp_2", author: "otaku_sensei", content: "ما هي برأيكم أفضل حلقة قتال في تاريخ الأنمي؟ شاركونا ترشيحاتكم 👇", likes: 89, date: "2026-07-18" }]
  );

  // User Reviews
  const [userReviewsState, setUserReviewsState] = useState([
  { id: "rev_1", anime: "Jujutsu Kaisen Season 2", rating: 5, textAr: "الإنتاج البصري والقتالات أسطورية بكل معنى الكلمة، استوديو MAPPA تفوق على نفسه.", textEn: "Spectacular animation and fights. MAPPA did an outstanding job.", date: "2026-07-14" },
  { id: "rev_2", anime: "Demon Slayer: Infinity Castle", rating: 4, textAr: "الحبكة والتمهيد ممتاز والسينما المشتركة جعلت المشاهدة ممتعة جداً.", textEn: "Incredible buildup. Watching it via the Watch Party was fantastic.", date: "2026-07-10" }]
  );

  // Watch History
  const [historyItemsState, setHistoryItemsState] = useState([
  { id: "hist_1", animeTitle: "قاتل الشياطين: قلعة اللانهاية", animeAr: "قاتل الشياطين: قلعة اللانهاية", animeEn: "Demon Slayer: Infinity Castle", episode: 1, watchedAt: "2026-07-20 03:30", progress: 100 },
  { id: "hist_2", animeTitle: "جوجوتسو كايسن", animeAr: "جوجوتسو كايسن", animeEn: "Jujutsu Kaisen", episode: 24, watchedAt: "2026-07-19 18:20", progress: 85 },
  { id: "hist_3", animeTitle: "ون بيس", animeAr: "ون بيس", animeEn: "One Piece", episode: 1112, watchedAt: "2026-07-18 11:15", progress: 100 }]
  );
  const watchHistory = historyItemsState;
  const setWatchHistory = setHistoryItemsState;

  // Last Watched
  const [lastWatched, setLastWatched] = useState([
  { id: "lw_1", animeAr: "قاتل الشياطين", animeEn: "Demon Slayer", episode: 3, totalEpisodes: 11, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" },
  { id: "lw_2", animeAr: "بليتش: حرب الألف عام", animeEn: "Bleach: TYBW", episode: 12, totalEpisodes: 13, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200" }]
  );

  // My Posts
  const [myPostsState, setMyPostsState] = useState([
  { id: "mp_1", content: "منشور تجريبي رقم ١ في مجتمع أنمي بلاك! مرحباً بالجميع 🌟👋", likes: 12, comments: 4, date: "2026-07-19", isHidden: false, isArchived: false },
  { id: "mp_2", content: "هذا المنشور محفوظ ومؤرشف للذكرى 📂📂", likes: 25, comments: 2, date: "2026-07-15", isHidden: false, isArchived: true },
  { id: "mp_3", content: "منشور سري مخفي عن العامة لا يظهر إلا هنا 🔒🗝️", likes: 2, comments: 0, date: "2026-07-12", isHidden: true, isArchived: false }]
  );

  // My Replies
  const [myRepliesState, setMyRepliesState] = useState([
  { id: "rep_1", postTitle: "رأي في هجوم العمالقة", replyText: "أتفق معك تماماً! النهاية كانت واقعية وملائمة لمسار القصة الكئيب.", likes: 8, date: "2026-07-19" },
  { id: "rep_2", postTitle: "نقاش ون بيس الأسبوعي", replyText: "التحريك الأخير للوفي جير فايف كان مبهراً وخارج التوقعات 🌸", likes: 14, date: "2026-07-17" }]
  );

  // My Comments
  const [myCommentsState, setMyCommentsState] = useState([
  { id: "com_1", postTitle: "إعلان الفعالية الأسبوعية", commentText: "مشارك بالتأكيد! النقابة مستعدة للمنافسة القادمة ⚔️🔥", likes: 5, date: "2026-07-18" }]
  );

  // My Likes
  const [myLikesState, setMyLikesState] = useState([
  { id: "like_1", postAuthor: "ken_owner", content: "تحديثات الخادم الجديدة أصبحت نشطة وتعمل بكفاءة 🛡️", type: "post", date: "2026-07-20" },
  { id: "like_2", postAuthor: "zoro_fan", content: "المبارزة القادمة ستكون تاريخية بلا شك!", type: "comment", date: "2026-07-19" }]
  );

  // Followers & Following
  const [followersListState, setFollowersListState] = useState([
  { id: "f_1", name: "ميكاسا تشان", username: "mikasa_chan", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120", isFollowingBack: true },
  { id: "f_2", name: "ساسوكي الغامض", username: "sasuke_ninja", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120", isFollowingBack: false },
  { id: "f_3", name: "إرين المتمرد", username: "eren_jeager", avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=120", isFollowingBack: true }]
  );

  const [followingListState, setFollowingListState] = useState([
  { id: "g_1", name: "كين أوتشيها (المالك)", username: "ken_owner", avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=120" },
  { id: "g_2", name: "ماستر لوفي", username: "luffy_master", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120" }]
  );

  // Groups
  const [groupsListState, setGroupsListState] = useState([
  { id: "grp_1", nameAr: "عشاق ون بيس العرب", nameEn: "Arab One Piece Fans", members: 4210, joined: true, image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150" },
  { id: "grp_2", nameAr: "منتدى المانجا والويب تون الرسمية", nameEn: "Manga & Webtoon Official", members: 1890, joined: false, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150" }]
  );

  // Channels
  const [channelsListState, setChannelsListState] = useState([
  { id: "chn_1", nameAr: "الدردشة العامة للأوتوكو", nameEn: "Otaku General Lounge", activeUsers: 142, joined: true },
  { id: "chn_2", nameAr: "مكالمات صوتية ونقاش حرق الحلقات", nameEn: "Spoiler Voice & Debate Club", activeUsers: 34, joined: false }]
  );

  // Subpage data: Anime Wiki & Manga
  const [animeWikiList, setAnimeWikiList] = useState([
  { id: "an_1", titleAr: "قاتل الشياطين (Kimetsu no Yaiba)", titleEn: "Demon Slayer", rating: 4.9, genreAr: "أكشن / خيال", genreEn: "Action / Fantasy", episodes: 26, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" },
  { id: "an_2", titleAr: "جوجوتسو كايسن (Jujutsu Kaisen)", titleEn: "Jujutsu Kaisen", rating: 4.8, genreAr: "أكشن / خارق للطبيعة", genreEn: "Action / Supernatural", episodes: 24, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" },
  { id: "an_3", titleAr: "ون بيس (One Piece)", titleEn: "One Piece", rating: 4.9, genreAr: "مغامرة / خيال", genreEn: "Adventure / Fantasy", episodes: 1112, image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=300" },
  { id: "an_4", titleAr: "هجوم العمالقة (Attack on Titan)", titleEn: "Attack on Titan", rating: 4.9, genreAr: "دراما / غموض", genreEn: "Drama / Mystery", episodes: 87, image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300" }]
  );

  const [mangaList, setMangaList] = useState([
  { id: "man_1", titleAr: "رجل المنشار (Chainsaw Man)", titleEn: "Chainsaw Man", currentChapter: 134, totalChapters: 160, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" },
  { id: "man_2", titleAr: "قفل أزرق (Blue Lock)", titleEn: "Blue Lock", currentChapter: 242, totalChapters: 300, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" },
  { id: "man_3", titleAr: "سولو ليفيلينج (Solo Leveling)", titleEn: "Solo Leveling", currentChapter: 179, totalChapters: 179, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300" }]
  );

  const [charactersListState, setCharactersListState] = useState([
  { id: "char_sc_1", nameAr: "ليفي أكرمان", nameEn: "Levi Ackerman", animeAr: "هجوم العمالقة", animeEn: "Attack on Titan", votes: 4520, image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300" },
  { id: "char_sc_2", nameAr: "غوجو ساتورو", nameEn: "Gojo Satoru", animeAr: "جوجوتسو كايسن", animeEn: "Jujutsu Kaisen", votes: 6180, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" },
  { id: "char_sc_3", nameAr: "رورونوا زورو", nameEn: "Roronoa Zoro", animeAr: "ون بيس", animeEn: "One Piece", votes: 5310, image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=300" }]
  );

  const [quotesList, setQuotesList] = useState([
  { id: "q_1", quoteAr: "الخوف ليس سيئاً، فهو يخبرك بنقاط ضعفك. وبمجرد معرفتها، تصبح أقوى.", quoteEn: "Fear is not evil. It tells you what your weakness is.", characterAr: "جيلدارتس كلايف", characterEn: "Gildarts Clive", animeAr: "فيفي تيل", animeEn: "Fairy Tail", likes: 320 },
  { id: "q_2", quoteAr: "إذا لم تخاطر، فلن تتمكن من خلق مستقبل.", quoteEn: "If you don't take risks, you can't create a future.", characterAr: "مونكي دي لوفي", characterEn: "Monkey D. Luffy", animeAr: "ون بيس", animeEn: "One Piece", likes: 580 }]
  );

  const [explanationsList, setExplanationsList] = useState([
  { id: "exp_1", titleAr: "شرح كامل لنظام الهالة (Nen) في هانتر x هانتر", titleEn: "Ultimate Nen System Guide in Hunter x Hunter", category: "lore", views: 2410 },
  { id: "exp_2", titleAr: "كيف يعمل توسيع المجال (Domain Expansion) في جوجوتسو كايسن", titleEn: "How Domain Expansion Works in Jujutsu Kaisen", category: "battle", views: 1840 }]
  );

  const [newsList, setNewsList] = useState([
  { id: "news_1", titleAr: "رسمياً: الكشف عن العرض الدعائي الجديد لفيلم قاتل الشياطين القادم سينمائياً!", titleEn: "Demon Slayer New Trilogy Movie Teaser Revealed!", date: "2026-07-20", source: "Aniplex" },
  { id: "news_2", titleAr: "مانجا رجل المنشار تدخل الجزء الثالث قريباً بحدث حماسي غير متوقع.", titleEn: "Chainsaw Man Manga Part 3 Officially Confirmed!", date: "2026-07-19", source: "Shonen Jump" }]
  );

  const [videosList, setVideosList] = useState([
  { id: "vid_1", titleAr: "العرض التشويقي الأول لأنمي المنفرد (Solo Leveling) الموسم الثاني", titleEn: "Solo Leveling Season 2 Official Trailer", duration: "2:15", views: "1.2M", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300" },
  { id: "vid_2", titleAr: "أفضل لقطات الاستوديو لعام ٢٠٢٦ - تقرير الإبداع البصري", titleEn: "Top Anime Fights compilation 2026", duration: "10:45", views: "450K", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" }]
  );

  // Notifications Alert simulated board
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [inPageNotifications, setInPageNotifications] = useState([
  { id: "n1", titleAr: "مكافأة ترحيبية!", titleEn: "Welcome Reward!", bodyAr: "حصلت على 50 عملة سوداء إضافية لتسجيل الدخول اليومي.", bodyEn: "Claimed 50 bonus Black Coins for daily entry.", read: false, time: "منذ ٥ دقائق" },
  { id: "n2", titleAr: "مستوى جديد!", titleEn: "Level Up!", bodyAr: "لقد وصلت للمستوى 8 بنجاح! استعد لاستلام ألقاب جديدة.", bodyEn: "Reached Level 8 successfully! Prepare to equip new titles.", read: true, time: "منذ ساعة" }]
  );

  const [showInPageSearch, setShowInPageSearch] = useState(false);
  const [inPageSearchQuery, setInPageSearchQuery] = useState("");

  // Digital Identity Sub-tabs & States (Volume 1, Chapter 5 & 6)
  const [accountSubTab, setAccountSubTab] = useState<"card" | "levels" | "privacy" | "verification" | "security" | "activity">("card");
  const [selectedTitle, setSelectedTitle] = useState(currentUser.activeTitle || "Rookie");
  const [privacySettings, setPrivacySettings] = useState<any>(
    currentUser.visibility || {
      level: "public",
      reputation: "public",
      role: "public",
      coins: "followers",
      stars: "me",
      achievements: "public",
      medals: "public",
      favAnime: "public",
      recentActivity: "public",
      joinedDate: "public"
    }
  );

  // Chapter 6: Accounts, Authentication & Security States
  const [linkedProviders, setLinkedProviders] = useState<string[]>(["email", "google"]);

  // Create / Register Account Form States
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regCountry, setRegCountry] = useState("Saudi Arabia");
  const [regLanguage, setRegLanguage] = useState("Arabic");
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regAgreePrivacy, setRegAgreePrivacy] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{status: "idle" | "validating" | "available" | "taken" | "invalid" | "reserved";msg: string;}>({ status: "idle", msg: "" });

  // Verification & OTP simulators
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [phoneStep, setPhoneStep] = useState<"unverified" | "otp" | "verified">("unverified");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneAttempts, setPhoneAttempts] = useState(0);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [emailStep, setEmailStep] = useState<"unverified" | "sent" | "verified">("unverified");
  const [emailTimer, setEmailTimer] = useState(0);

  // Sign In Simulator
  const [loginMethod, setLoginMethod] = useState<"username" | "email" | "phone" | "google" | "apple">("username");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginRemember, setLoginRemember] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Recovery Simulator
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryOtpInput, setRecoveryOtpInput] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"input" | "otp" | "new_password" | "done">("input");
  const [recoveryNewPass, setRecoveryNewPass] = useState("");
  const [recoveryNewPassConfirm, setRecoveryNewPassConfirm] = useState("");

  // Change Password States
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [pastPasswords, setPastPasswords] = useState<string[]>(["oldpassword123", "anotherold456"]);

  // Two-Factor Authentication (2FA)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState<"authenticator" | "email" | "sms">("authenticator");
  const [twoFactorStep, setTwoFactorStep] = useState<"idle" | "setup" | "verified">("idle");
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [twoFactorSecretKey] = useState("AB_SEC_KEY_8829_OTAKU");

  // Session & Devices Management
  const [activeSessions, setActiveSessions] = useState<any[]>([
  { id: "sess_1", device: "iPhone 15 Pro", os: "iOS 17.4", location: "Riyadh, SA", lastActive: "Just now", loginTime: "2026-07-04 12:45", isTrusted: true, current: true },
  { id: "sess_2", device: "MacBook Pro M3", os: "macOS Sonoma", location: "Tokyo, JP", lastActive: "2 hours ago", loginTime: "2026-07-04 10:30", isTrusted: true, current: false },
  { id: "sess_3", device: "Samsung Galaxy S24", os: "Android 14", location: "Cairo, EG", lastActive: "1 day ago", loginTime: "2026-07-03 14:15", isTrusted: false, current: false }]
  );

  // Account modification states
  const [editEmail, setEditEmail] = useState(currentUser.email || "user@animeblack.com");
  const [editPhone, setEditPhone] = useState(currentUser.phone || "+966555555555");
  const [editUsername, setEditUsername] = useState(currentUser.username || "otaku_user");
  const [editDisplayName, setEditDisplayName] = useState(currentUser.name || "Otaku User");
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [deletionDaysLeft, setDeletionDaysLeft] = useState<number | null>(null);

  // Security Audit Logs
  const [securityLogs, setSecurityLogs] = useState<any[]>([
  { id: "sec_1", actionAr: "تغيير إعدادات الخصوصية للهوية الرقمية", actionEn: "Changed identity privacy visibility rules", type: "privacy", time: "2026-07-04 11:42", ip: "197.34.12.90", suspicious: false },
  { id: "sec_2", actionAr: "سجل دخول موفق للجلسة الحالية", actionEn: "Successful login to the current session", type: "auth", time: "2026-07-04 12:45", ip: "197.34.12.90", suspicious: false },
  { id: "sec_3", actionAr: "إجراء عملية شراء في متجر المظاهر", actionEn: "Completed shop item purchase", type: "store", time: "2026-07-04 12:40", ip: "197.34.12.90", suspicious: false }]
  );

  // Verification request form states
  const [verifyName, setVerifyName] = useState("");
  const [verifyType, setVerifyType] = useState<any>("creator");
  const [verifyReason, setVerifyReason] = useState("");
  const [verifyLinks, setVerifyLinks] = useState("");
  const [verificationRequests, setVerificationRequests] = useState<any[]>([
  {
    id: "vr_1",
    fullName: "كين أوتشيها",
    username: "ken_owner",
    reason: "محرر أخبار نشط منذ سنتين وصانع محتوى تلوين رقمي في إنستغرام",
    reqType: "creator",
    links: "instagram.com/ken_art",
    status: "pending",
    createdAt: "2026-07-04T12:00:00.000Z"
  }]
  );

  // Activity logs
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState("all");
  const [activityLogs, setActivityLogs] = useState<any[]>([
  { id: "log_1", actionAr: "سجل الدخول بنجاح", actionEn: "Successful sign in", category: "auth", timestamp: "2026-07-04T12:45:00.000Z", detailsAr: "من متصفح الويب - عنوان IP آمن", detailsEn: "Via Web Client - Secure IP" },
  { id: "log_2", actionAr: "تعديل المظهر الخارجي", actionEn: "Profile customized", category: "profile", timestamp: "2026-07-04T12:42:00.000Z", detailsAr: "تم تغيير إطار الصورة الشخصية وتجهيزه", detailsEn: "Equipped active custom profile frame" },
  { id: "log_3", actionAr: "الحصول على مكافأة يومية", actionEn: "Claimed daily check-in", category: "economy", timestamp: "2026-07-04T12:40:00.000Z", detailsAr: "الحصول على +15 عملة سوداء", detailsEn: "Claimed +15 Black Coins" },
  { id: "log_4", actionAr: "إرسال طلب توثيق رسمي", actionEn: "Submitted verification request", category: "moderation", timestamp: "2026-07-04T12:00:00.000Z", detailsAr: "نوع التوثيق المطلق: صانع محتوى", detailsEn: "Requested badge: Verified Creator" }]
  );

  // Admin moderation testing states
  const [selectedAdminTarget, setSelectedAdminTarget] = useState("rinka_chan");
  const [adminActionLog, setAdminActionLog] = useState<any[]>([
  { id: "al_1", admin: "ken_owner", action: "تنبيه", target: "rinka_chan", reason: "سبام خفيف في الدردشة العامة", time: "منذ دقيقتين" }]
  );

  const adminUsersList = [
  { name: "رينكا تشان", username: "rinka_chan", role: "Member", rankLevel: 1, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
  { name: "صانع الإبداع", username: "creator_otaku", role: "Creator", rankLevel: 3, avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150" },
  { name: "المشرف كين", username: "ken_mod", role: "Moderator", rankLevel: 5, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
  { name: "مشرف أول غوكو", username: "senior_goku", role: "SeniorModerator", rankLevel: 6, avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150" },
  { name: "المدير العام يامي", username: "admin_yami", role: "SuperAdministrator", rankLevel: 9, avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150" }];


  useEffect(() => {
    const timer = setInterval(() => {
      setPhoneTimer((prev) => prev > 0 ? prev - 1 : 0);
      setEmailTimer((prev) => prev > 0 ? prev - 1 : 0);
      setLockoutTimer((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Daily Check in state
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // Otaku Level and XP
  const [otakuXp, setOtakuXp] = useState(720);
  const otakuLevel = Math.floor(otakuXp / 500) + 1;
  const xpNeededForNext = 500 - otakuXp % 500;

  // User list of purchased items (frames)
  const [ownedFrames, setOwnedFrames] = useState<string[]>([]);

  // Simulated passport data
  const [passportStamps, setPassportStamps] = useState<string[]>([
  "شينجيكي",
  "فيلق الاستطلاع",
  "مهرجان الشتاء"]
  );

  // Bots and keys
  const [developerKeys, setDeveloperKeys] = useState<string[]>([]);
  const [bots, setBots] = useState<{id: string;name: string;prefix: string;}[]>([]);
  const [newBotName, setNewBotName] = useState("");
  const [newBotPrefix, setNewBotPrefix] = useState("!");

  // Daily Quests Status
  const [quests, setQuests] = useState([
  { id: 1, titleAr: "ألقِ التحية في الدردشة العامة", titleEn: "Say Hello in Global Chat", reward: 15, claimed: false },
  { id: 2, titleAr: "تفاعل مع منشورين اليوم", titleEn: "Double-tap 2 posts on Home Feed", reward: 20, claimed: false },
  { id: 3, titleAr: "شارك رأيك في استطلاع رأي نشط", titleEn: "Vote on an active Otaku Poll", reward: 25, claimed: false }]
  );

  // Guilds Data
  const [guilds, setGuilds] = useState([
  { id: "recon", nameAr: "فيلق الاستطلاع (Recon Corps)", nameEn: "Survey Recon Corps", members: 1240, joined: false, bio: "نهب أرواحنا من أجل البشرية! نكافح العمالقة." },
  { id: "samurai", nameAr: "نقابة الساموراي المتمردين", nameEn: "Rebel Samurai Guild", members: 850, joined: false, bio: "عش بالسيف ومت بالسيف. الشرف والقوة." },
  { id: "akatsuki_guild", nameAr: "عشيرة الأكاتسكي السرية", nameEn: "Secret Akatsuki Clan", members: 420, joined: false, bio: "نعمل في الظلال لنحقق السلام المطلق بالقوة." }]
  );

  // Shop items
  const frameShopItems = [
  {
    id: "fire_aura",
    nameAr: "إطار الهالة المشتعلة",
    nameEn: "Blazing Fire Aura",
    price: 50,
    color: "border-[#FF3300] shadow-[0_0_12px_#FF3300]",
    gradient: "from-[#FF3300] to-[#FFCC00]",
    descAr: "يعطيك هالة نارية حمراء ملتهبة حول الأفاتار"
  },
  {
    id: "samurai_gold",
    nameAr: "إطار الساموراي المذهب",
    nameEn: "Golden Samurai Frame",
    price: 120,
    color: "border-[#D4AF37] shadow-[0_0_12px_#D4AF37]",
    gradient: "from-[#D4AF37] to-[#F1C40F]",
    descAr: "شرف الساموراي بإطار من الذهب الخالص"
  },
  {
    id: "cosmic_neon",
    nameAr: "إطار الفضاء اللامع",
    nameEn: "Cosmic Neon Frame",
    price: 200,
    color: "border-[#00FFCC] shadow-[0_0_12px_#FF007F]",
    gradient: "from-[#00FFCC] to-[#FF007F]",
    descAr: "مستوحى من الخيال العلمي والسايبربنك"
  },
  {
    id: "cherry_blossom",
    nameAr: "إطار أزهار الكرز",
    nameEn: "Sakura Blossom Frame",
    price: 80,
    color: "border-[#FF69B4] shadow-[0_0_12px_#FFD1DC]",
    gradient: "from-[#FF69B4] to-[#FFE4E1]",
    descAr: "إطار الكرز الياباني الهادئ والرقيق"
  }];


  // Daily Check in function
  const handleDailyCheckIn = () => {
    if (isOffline) {
      if (playSynthSound) playSynthSound("error");
      if (triggerHapticFeedback) triggerHapticFeedback("error");
      if (addToOfflineQueue) addToOfflineQueue("حضور يومي (Daily Check-in)");
      alert(isArabic ? "⚠️ أنت في وضع عدم الاتصال! تم تأجيل الحضور اليومي للمزامنة اللاحقة." : "⚠️ Offline! Check-in request queued for sync.");
      return;
    }

    if (hasCheckedIn) return;

    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("levelup");

    setBlackCoins((prev) => prev + 50);
    setOtakuXp((prev) => prev + 100);
    setHasCheckedIn(true);
    setPassportStamps((prev) => [...prev, `حضور ${new Date().toLocaleDateString()}`]);
  };

  // Buy Shop frame
  const handleBuyFrame = (item: typeof frameShopItems[number]) => {
    if (isOffline) {
      if (playSynthSound) playSynthSound("error");
      if (triggerHapticFeedback) triggerHapticFeedback("error");
      alert(isArabic ? "⚠️ لا يمكن الشراء في وضع عدم الاتصال!" : "⚠️ Purchases disabled in Offline Mode!");
      return;
    }

    if (ownedFrames.includes(item.id)) {
      // Already owned, toggle equip
      if (playSynthSound) playSynthSound("tap");
      if (activeFrame === item.id) {
        setActiveFrame(null);
      } else {
        setActiveFrame(item.id);
      }
      return;
    }

    if (blackCoins < item.price) {
      if (playSynthSound) playSynthSound("error");
      if (triggerHapticFeedback) triggerHapticFeedback("error");
      alert(isArabic ? "❌ رصيدك غير كافٍ من عملات Black Coin!" : "❌ Insufficient Black Coin balance!");
      return;
    }

    if (playSynthSound) playSynthSound("purchase");
    if (triggerHapticFeedback) triggerHapticFeedback("purchase");

    setBlackCoins((prev) => prev - item.price);
    setOwnedFrames((prev) => [...prev, item.id]);
    setActiveFrame(item.id);
  };

  // Join Guild
  const handleJoinGuild = (id: string) => {
    setGuilds(
      guilds.map((g, _autoIdx) => {
        if (g.id === id) {
          if (!g.joined) {
            if (playSynthSound) playSynthSound("success");
            if (triggerHapticFeedback) triggerHapticFeedback("success");
            setBlackCoins((prev) => prev + 30); // Join bonus
            setOtakuXp((prev) => prev + 50);
            return { ...g, joined: true, members: g.members + 1 };
          } else {
            if (playSynthSound) playSynthSound("tap");
            return { ...g, joined: false, members: g.members - 1 };
          }
        }
        return g;
      })
    );
  };

  // Claim Quest Reward
  const handleClaimQuest = (id: number, reward: number) => {
    setQuests(
      quests.map((q, _autoIdx) => {
        if (q.id === id) {
          if (!q.claimed) {
            if (playSynthSound) playSynthSound("success");
            if (triggerHapticFeedback) triggerHapticFeedback("success");
            setBlackCoins((prev) => prev + reward);
            setOtakuXp((prev) => prev + 30);
            return { ...q, claimed: true };
          }
        }
        return q;
      })
    );
  };

  // Developer: generate API key
  const handleGenerateApiKey = () => {
    if (playSynthSound) playSynthSound("success");
    const key = `ab_live_key_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setDeveloperKeys([...developerKeys, key]);
  };

  // Developer: create bot
  const handleCreateBot = () => {
    if (!newBotName.trim()) return;
    if (playSynthSound) playSynthSound("success");
    if (triggerHapticFeedback) triggerHapticFeedback("success");

    const newBot = {
      id: Date.now().toString(),
      name: newBotName.trim(),
      prefix: newBotPrefix
    };

    setBots([...bots, newBot]);
    setNewBotName("");
  };

  const adminRanks = ["TraineeModerator", "Moderator", "SeniorModerator", "SectionManager", "Administrator", "SuperAdministrator", "Developer", "Owner"];

  const categoriesList = [
  { id: "profile", labelAr: "الملف الشخصي", labelEn: "Profile", icon: User },
  { id: "account", labelAr: "الحساب والبطاقة", labelEn: "Account & ID", icon: User },
  { id: "appearance", labelAr: "المظهر", labelEn: "Appearance", icon: Sun },
  { id: "community", labelAr: "المجتمع والنقابات", labelEn: "Guilds & Clubs", icon: Users },
  { id: "anime_universe", labelAr: "عالم الأنمي والويكي", labelEn: "Anime Universe", icon: BookOpen },
  { id: "economy", labelAr: "متجر الاقتصاد والإطارات", labelEn: "Economy & Frames", icon: Coins },
  { id: "activity", labelAr: "المهام والفعاليات", labelEn: "Quests & Rank", icon: Calendar },
  { id: "admin", labelAr: "لوحة التحكم والتقارير", labelEn: "System Control", icon: Shield },
  { id: "developers", labelAr: "المطورون و Bots", labelEn: "API & SDK & Bots", icon: Code },
  { id: "settings", labelAr: "الإعدادات العامة", labelEn: "Hub Settings", icon: Settings }];


  const visibleCategories = categoriesList.filter((cat) => {
    if (cat.id === "profile") return true;
    if (cat.id === "admin" || cat.id === "developers") {
      return currentUser?.email === 'm774545471@gmail.com';
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen &&
      <motion.div
        initial={isInline ? { opacity: 0, y: 10 } : { opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={isInline ?
        "w-full flex-1 flex flex-col bg-[#060608] font-sans text-[var(--theme-text)] overflow-hidden min-h-0" :
        "fixed inset-0 bg-[#060608] z-50 overflow-hidden flex flex-col md:flex-row font-sans text-[var(--theme-text)]"
        }>
        
          
          {/* MOBILE BACK / CLOSE ICON */}
          {!isInline &&
        <div className="md:hidden flex justify-between items-center bg-black/40 border-b border-zinc-900 px-4 py-3 shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {isArabic ? "مركز المزيد الذكي" : "SMART MORE HUB"}
              </span>
              <button
            onClick={onClose}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            
                <X className="w-4 h-4" />
              </button>
            </div>
        }

          {/* SIDE NAVIGATION PANEL */}
          {!isInline &&
        <div className="w-full md:w-64 bg-[#0A0A0C] border-r border-zinc-900 flex flex-col shrink-0">
              {/* Logo area */}
              <div className="hidden md:flex items-center justify-between p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-black text-white text-sm shadow-lg">
                    AB
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-white uppercase">{isArabic ? "مركز الأوتوكو" : "ANIME BLACK HUB"}</h4>
                    <span className="text-[8px] text-zinc-500 font-mono">More Hub v1.0.4</span>
                  </div>
                </div>
                <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white transition-colors">
              
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Balance Header */}
              <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex justify-around text-center items-center">
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">{isArabic ? "عملة سوداء" : "Black Coin"}</span>
                  <span className="text-sm font-black text-white font-mono flex items-center gap-1 mt-0.5 justify-center">
                    <Coins className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                    {blackCoins}
                  </span>
                </div>
                <div className="w-px h-6 bg-zinc-850" />
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">{isArabic ? "النجوم المشعة" : "Stars"}</span>
                  <span className="text-sm font-black text-amber-400 font-mono flex items-center gap-1 mt-0.5 justify-center">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {stars}
                  </span>
                </div>
              </div>

              {/* Menu List */}
              <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2 flex md:block scrollbar-none gap-2">
                {[
            { id: "account", labelAr: "الحساب والبطاقة", labelEn: "Account & ID", icon: User },
            { id: "community", labelAr: "المجتمع والنقابات", labelEn: "Guilds & Clubs", icon: Users },
            { id: "anime_universe", labelAr: "عالم الأنمي والويكي", labelEn: "Anime Universe", icon: BookOpen },
            { id: "economy", labelAr: "متجر الاقتصاد والمظاهر", labelEn: "Economy & Themes", icon: Coins },
            { id: "activity", labelAr: "المهام والفعاليات", labelEn: "Quests & Rank", icon: Calendar },
            { id: "admin", labelAr: "لوحة التحكم والتقارير", labelEn: "System Control", icon: Shield },
            { id: "developers", labelAr: "المطورون و Bots", labelEn: "API & SDK & Bots", icon: Code },
            { id: "settings", labelAr: "الإعدادات العامة", labelEn: "Hub Settings", icon: Settings }].
            filter((cat) => {
              if (cat.id === "admin" || cat.id === "developers") {
                return currentUser?.email === 'm774545471@gmail.com';
              }
              return true;
            }).map((cat, catIdx) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={`side_nav_${cat.id}_${catIdx}`}
                  onClick={() => {
                    if (playSynthSound) playSynthSound("tap");
                    setActiveCategory(cat.id as any);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 md:w-full rounded-xl transition-all shrink-0 text-left ${
                  isActive ?
                  "bg-[var(--theme-accent)] text-white font-black shadow-lg shadow-[var(--theme-accent)]/10" :
                  "text-zinc-400 hover:text-white hover:bg-zinc-900"}`
                  }>
                  
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="text-xs whitespace-nowrap">{isArabic ? cat.labelAr : cat.labelEn}</span>
                    </button>);

            })}
              </div>
            </div>
        }

          {/* MAIN WORKSPACE CONTENT WINDOW */}
          <div className="flex-1 overflow-y-auto bg-[#070709] relative scrollbar-none">
            {viewMode === "grid" ?
          <div className="w-full pb-24 text-right" dir="rtl">
                {/* 1. Header Cover and Profile Info (Animesta Style) */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200"
                alt="Cover"
                className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1]" />
              
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/30 to-transparent" />
                  
                  {/* Top-bar Quick Buttons on cover */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="flex gap-2">
                      {!isInline &&
                  <button
                    onClick={onClose}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-800/40">
                    
                          <X className="w-4 h-4" />
                        </button>
                  }
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {/* Search Toggle */}
                      <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      setShowInPageSearch(!showInPageSearch);
                    }}
                    className={`p-2 backdrop-blur-md rounded-full transition-all active:scale-95 border ${
                    showInPageSearch ?
                    "bg-red-950/80 border-red-800 text-red-400 shadow-md shadow-red-950/50" :
                    "bg-black/40 border-zinc-800/40 text-zinc-300 hover:text-white"}`
                    }
                    title={isArabic ? "بحث في الخدمات" : "Search Services"}>
                    
                        <Search className="w-4 h-4" />
                      </button>

                      {/* Messages Toggle */}
                      <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      if (onOpenLiveSuite) onOpenLiveSuite("call");
                    }}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-800/40 relative"
                    title={isArabic ? "الدردشة الخاصة" : "Private Chat"}>
                    
                        <MessageCircle className="w-4 h-4" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </button>

                      {/* Notifications Alert */}
                      <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      setShowNotificationDrawer(!showNotificationDrawer);
                    }}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-800/40 relative"
                    title={isArabic ? "مركز التنبيهات" : "Alert Center"}>
                    
                        <Bell className="w-4 h-4" />
                        {inPageNotifications.filter((n) => !n.read).length > 0 &&
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#070709]">
                            {inPageNotifications.filter((n) => !n.read).length}
                          </span>
                    }
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Floating Info - Redesigned to Animesta Premium Glassmorphic Card */}
                <div className="px-4 sm:px-6 -mt-20 sm:-mt-24 relative z-10 max-w-4xl mx-auto">
                  <div
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.closest('a')) return;
                  if (playSynthSound) playSynthSound("tap");
                  if (onOpenProfile) onOpenProfile();
                }}
                className="bg-[#111115]/95 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group cursor-pointer transition-all hover:border-zinc-700/80 hover:shadow-[0_25px_60px_rgba(255,61,0,0.05)] active:scale-[0.995]">
                
                    {/* Futuristic Background Gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF3D00]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                    {/* Layout structure supporting both RTL/Arabic and LTR */}
                    <div className={`flex ${isArabic ? "flex-row-reverse" : "flex-row"} items-center justify-between gap-4`}>
                      
                      {/* Right-aligned in Arabic / Left-aligned in English: Avatar, Name, and Badges */}
                      <div className={`flex ${isArabic ? "flex-row-reverse" : "flex-row"} items-center gap-4`}>
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-zinc-950 border-2 shadow-2xl relative ${
                      activeFrame === "legendary" ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]" :
                      activeFrame === "cyber" ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" :
                      activeFrame === "sakura" ? "border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]" :
                      activeFrame === "darkness" ? "border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]" :
                      "border-purple-600/60 shadow-[0_0_15px_rgba(147,51,234,0.35)]"}`
                      }>
                            <img
                          src={currentUser.avatar}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer" />
                        
                            {/* Active Status Dot */}
                            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111115] flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
                            </div>
                          </div>
                        </div>

                        {/* Name and Level info */}
                        <div className={`flex flex-col ${isArabic ? "items-end text-right" : "items-start text-left"} space-y-1`}>
                          <h2 className="text-base sm:text-xl font-black text-white tracking-wide italic leading-tight flex items-center gap-2 flex-wrap">
                            <span>{currentUser.name}</span>
                            <LevelBadge
                          level={currentUser?.level || 42}
                          size="xs"
                          showTitle={true}
                          isArabic={isArabic}
                          onClick={() => setShow100LevelBadgesModal(true)} />
                        
                          </h2>
                          <span className="text-zinc-500 text-xs font-mono">
                            @{currentUser.username}
                          </span>

                          {/* Level Progress Pill and Gold Coin Pill */}
                          <div className={`flex items-center gap-2 mt-1.5 ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Hexagonal Level Indicator */}
                            <div className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
                              <span className="font-mono font-black">{toArabicDigits(currentUser.level || 2)}</span>
                              <Sliders className="w-3 h-3" />
                            </div>

                            {/* Gold Coin Pill */}
                            <div className="flex items-center gap-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                              <span className="font-mono">{toArabicDigits(blackCoins || 792)}</span>
                              <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-black text-black">
                                ★
                              </div>
                            </div>
                          </div>

                          {/* Level Progress Slider */}
                          <div className="w-full min-w-[120px] max-w-[180px] h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 mt-2.5">
                            <div
                          className="h-full bg-gradient-to-l from-orange-400 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]"
                          style={{ width: `${Math.min(100, (currentUser.xp || 720) % 500 / 500 * 100)}%` }} />
                        
                          </div>
                        </div>
                      </div>

                      {/* Left-aligned in Arabic / Right-aligned in English: Action Buttons (Crown and Edit Profile Customization) */}
                      <div className={`flex items-center gap-3 ${isArabic ? "flex-row" : "flex-row-reverse"}`}>
                        {/* Crown Button */}
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                        setActiveCategory("appearance");
                      }}
                      className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title={isArabic ? "المظهر" : "Appearance"}>
                      
                          <Sun className="w-5 h-5 text-white" />
                        </button>

                        {/* Customization Re-roll/Edit Profile Button */}
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                        setActiveSubPage("edit-profile");
                        setViewMode("subpage");
                      }}
                      className="w-12 h-12 bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title={isArabic ? "تعديل المظهر" : "Edit Profile Info"}>
                      
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Integrated Bottom Bar */}
                    <div className="bg-[#09090C]/90 border border-zinc-900/80 rounded-2xl py-3 px-4 flex items-center justify-between mt-4 relative z-10 shadow-inner">
                      {/* Left side in Arabic (Utility buttons) / Right side in English */}
                      <div className={`flex items-center gap-3.5 ${isArabic ? "flex-row" : "flex-row-reverse"}`}>
                        {/* Search Button */}
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        setShowInPageSearch(!showInPageSearch);
                      }}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                      showInPageSearch ?
                      "bg-red-950/80 border-red-800 text-red-400" :
                      "bg-zinc-950/90 border-zinc-900 text-zinc-400 hover:text-white"}`
                      }>
                      
                          <Search className="w-4 h-4" />
                        </button>

                        {/* Notification Bell Button with badge */}
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        setShowNotificationDrawer(!showNotificationDrawer);
                      }}
                      className="relative w-10 h-10 rounded-full bg-zinc-950/90 border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                      
                          <Bell className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#111115]">
                            1
                          </span>
                        </button>
                      </div>

                      {/* Right side in Arabic (Followers & Following counts) / Left side in English */}
                      <div className={`flex items-center gap-4 text-xs font-bold text-zinc-400 ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                        setActiveSubPage("my-followers");
                        setViewMode("subpage");
                      }}
                      className="hover:text-white hover:underline transition-all">
                      
                          {isArabic ?
                      <>
                              <span className="text-white font-mono mr-1">{toArabicDigits(currentUser.followersCount || 90)}</span>{" "}
                              المتابعين
                            </> :

                      <>
                              <span className="text-white font-mono mr-1">{currentUser.followersCount || 90}</span> Followers
                            </>
                      }
                        </button>

                        {/* Divider */}
                        <div className="w-px h-3.5 bg-zinc-800" />

                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playSynthSound) playSynthSound("tap");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                        setActiveSubPage("my-followers");
                        setViewMode("subpage");
                      }}
                      className="hover:text-white hover:underline transition-all">
                      
                          {isArabic ?
                      <>
                              <span className="text-white font-mono mr-1">{toArabicDigits(currentUser.followingCount || 29)}</span>{" "}
                              أتابع
                            </> :

                      <>
                              <span className="text-white font-mono mr-1">{currentUser.followingCount || 29}</span> Following
                            </>
                      }
                        </button>
                      </div>
                    </div>

                  </div>
                </div>


                {/* Search overlay input */}
                {showInPageSearch &&
            <div className="px-4 sm:px-6 mt-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl flex items-center gap-2">
                      <Search className="w-4 h-4 text-zinc-400" />
                      <input
                  type="text"
                  placeholder={isArabic ? "ابحث عن أي خدمة أو ميزة في التطبيق..." : "Search services and features..."}
                  value={inPageSearchQuery}
                  onChange={(e) => setInPageSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-white text-xs outline-none flex-1 placeholder-zinc-500 text-right" />
                
                      {inPageSearchQuery &&
                <button
                  onClick={() => setInPageSearchQuery("")}
                  className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400">
                  
                          <X className="w-3 h-3" />
                        </button>
                }
                    </div>
                  </div>
            }

                {/* Notifications Panel */}
                {showNotificationDrawer &&
            <div className="px-4 sm:px-6 mt-4">
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xl">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                        <span className="text-xs font-black text-white">{isArabic ? "أحدث التنبيهات والرسائل" : "Recent Notifications"}</span>
                        <button
                    onClick={() => {
                      setInPageNotifications((prev) => prev.map((n, _autoIdx) => ({ ...n, read: true })));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className="text-[10px] text-zinc-500 hover:text-red-400 font-bold transition-all">
                    
                          {isArabic ? "تحديد الكل كمقروء" : "Mark all read"}
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
                        {inPageNotifications.map((n, _autoIdx) =>
                  <div
                    key={`${n.id}_${_autoIdx}`}
                    onClick={() => {
                      n.read = true;
                      window.dispatchEvent(new CustomEvent('openNotificationDetail', {
                        detail: {
                          id: n.id,
                          type: "system",
                          text: `${isArabic ? n.titleAr : n.titleEn} - ${isArabic ? n.bodyAr : n.bodyEn}`,
                          time: n.time,
                          read: true
                        }
                      }));
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer hover:bg-zinc-800/30 hover:scale-[0.99] active:scale-[0.98] ${n.read ? "bg-zinc-950/20 border-zinc-900 text-zinc-400" : "bg-red-950/20 border-red-900/50 text-white"}`}>
                    
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black">{isArabic ? n.titleAr : n.titleEn}</span>
                              <span className="text-[8px] text-zinc-500 font-mono">{n.time}</span>
                            </div>
                            <p className="text-[10px] text-zinc-300 mt-1 leading-normal">{isArabic ? n.bodyAr : n.bodyEn}</p>
                          </div>
                  )}
                      </div>
                    </div>
                  </div>
            }

                {/* 2. Interactive Wallet & Fast Cards */}
                <div className="px-4 sm:px-6 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Shop Card */}
                  <div className="bg-gradient-to-l from-indigo-950/50 via-zinc-900/80 to-zinc-900/60 border border-indigo-900/40 p-4 rounded-2xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                          {isArabic ? "رصيد الأوتوكو والمظاهر" : "Otaku Coins & Frames Wallet"}
                        </span>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 bg-zinc-950/80 px-2 py-1 rounded-xl border border-zinc-850">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-black text-white font-mono">{blackCoins}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-zinc-950/80 px-2 py-1 rounded-xl border border-zinc-850">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-black text-amber-400 font-mono">{stars}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                    onClick={() => {
                      if (hasCheckedIn) return;
                      if (playSynthSound) playSynthSound("success");
                      setHasCheckedIn(true);
                      setBlackCoins((prev) => prev + 25);
                      if (triggerHapticFeedback) triggerHapticFeedback("success");
                      alert(isArabic ? "رائع! حصلت على +25 عملة سوداء لمكافأة الحضور اليومي 🌸" : "Claimed +25 Black Coins!");
                    }}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl transition-all active:scale-95 border ${
                    hasCheckedIn ?
                    "bg-zinc-900 text-zinc-500 border-zinc-850 cursor-not-allowed" :
                    "bg-gradient-to-l from-red-600 to-orange-500 text-white border-red-500 hover:brightness-110 shadow-lg shadow-red-950/20"}`
                    }>
                    
                        🎁 {hasCheckedIn ? isArabic ? "تم استلام الحضور" : "Claimed" : isArabic ? "الحضور اليومي" : "Daily Check-in"}
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400">{isArabic ? "احصل على هالات وإطارات نادرة لحسابك" : "Auras & avatar frames catalog"}</span>
                      <button
                    onClick={() => {
                      setActiveCategory("economy");
                      setViewMode("detail");
                    }}
                    className="text-[10px] text-indigo-400 font-black hover:underline flex items-center gap-0.5">
                    
                        {isArabic ? "دخول المتجر 🛒" : "Enter Shop 🛒"}
                      </button>
                    </div>
                  </div>

                  {/* Watch Party & Events Card */}
                  <div className="bg-gradient-to-l from-amber-950/40 via-zinc-900/80 to-zinc-900/60 border border-amber-950/30 p-4 rounded-2xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                        {isArabic ? "غرف البث والسينما المشتركة" : "Active Watch Parties"}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                        {isArabic ? "تجمع وناقش حلقات الأنمي حياً مع بقية أعضاء نقابتك في سينما الأوتوكو." : "Watch and discuss anime episodes in real-time with other otaku."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        ● {isArabic ? "بث سينما الأوتوكو نشط الآن" : "Otaku cinema is live"}
                      </span>
                      <button
                    onClick={() => {
                      if (onOpenLiveSuite) onOpenLiveSuite("watchparty");
                    }}
                    className="text-[10px] text-amber-400 font-black hover:underline flex items-center gap-0.5">
                    
                        {isArabic ? "دخول البث 🍿" : "Watch Now 🍿"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Shortcuts Grid */}
                {shortcutItems.filter((item) => {
              if (!inPageSearchQuery) return true;
              const query = inPageSearchQuery.toLowerCase();
              return item.labelAr.toLowerCase().includes(query) || item.labelEn.toLowerCase().includes(query);
            }).length > 0 &&
            <div className="px-4 sm:px-6 mt-8">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{isArabic ? "شبكة الاختصارات السريعة" : "Quick Shortcut Grid"}</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-3 sm:gap-4">
                      {shortcutItems.filter((item) => {
                  if (!inPageSearchQuery) return true;
                  const query = inPageSearchQuery.toLowerCase();
                  return item.labelAr.toLowerCase().includes(query) || item.labelEn.toLowerCase().includes(query);
                }).map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <motion.button
                      key={`shortcut_${item.id}_${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, type: "spring", stiffness: 120 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (playSynthSound) playSynthSound("tap");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                        setSubPageLoading(true);
                        setActiveSubPage(item.id);
                        setViewMode("subpage");
                        setTimeout(() => {
                          setSubPageLoading(false);
                        }, 500);
                      }}
                      className="flex flex-col items-center gap-2 group">
                      
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${item.bgLight} group-hover:brightness-125 shadow-md relative overflow-hidden`}>
                              <div className={`absolute inset-0 bg-gradient-to-tr ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                              <IconComp className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:rotate-6" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 group-hover:text-white text-center transition-colors">
                              {isArabic ? item.labelAr : item.labelEn}
                            </span>
                          </motion.button>);

                })}
                    </div>
                  </div>
            }

                {/* 4. Section Groups List */}
                <div className="px-4 sm:px-6 mt-8 space-y-6">
                  {sectionGroups.map((group, gIdx) => {
                const matchedItems = group.items.filter((item) => {
                  if (!inPageSearchQuery) return true;
                  const query = inPageSearchQuery.toLowerCase();
                  return (
                    item.labelAr.toLowerCase().includes(query) ||
                    item.labelEn.toLowerCase().includes(query) ||
                    item.descAr && item.descAr.toLowerCase().includes(query) ||
                    item.descEn && item.descEn.toLowerCase().includes(query));

                });
                if (matchedItems.length === 0) return null;
                const GroupIcon = group.icon;
                return (
                  <div key={`sec_grp_${group.titleEn}_${gIdx}`} className="space-y-2.5">
                        <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
                          <GroupIcon className="w-4 h-4 text-red-500" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {isArabic ? group.titleAr : group.titleEn}
                          </h4>
                        </div>
                        
                        <div className="bg-zinc-900/15 rounded-2xl border border-zinc-850 overflow-hidden divide-y divide-zinc-900">
                          {matchedItems.map((item, itemIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={`sec_item_${group.titleEn}_${item.id}_${itemIdx}`}
                            onClick={() => {
                              if (playSynthSound) playSynthSound("tap");
                              if (triggerHapticFeedback) triggerHapticFeedback("tap");

                              if (item.triggerAction === "profile") {
                                if (onOpenProfile) {
                                  onOpenProfile();
                                } else {
                                  setSubPageLoading(true);
                                  setActiveSubPage("edit-profile");
                                  setViewMode("subpage");
                                  setTimeout(() => setSubPageLoading(false), 500);
                                }
                              } else if (item.isCategory) {
                                setActiveCategory(item.categoryId as any);
                                if (item.subtab) {
                                  setAccountSubTab(item.subtab as any);
                                }
                                setViewMode("detail");
                              } else {
                                setSubPageLoading(true);
                                setActiveSubPage(item.id);
                                setViewMode("subpage");
                                setTimeout(() => {
                                  setSubPageLoading(false);
                                }, 500);
                              }
                            }}
                            className="w-full text-right p-3.5 flex items-center justify-between hover:bg-red-500/5 transition-all text-zinc-300 hover:text-white group relative">
                            
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850 group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all text-zinc-400 group-hover:text-red-500">
                                    <ItemIcon className="w-4 h-4 shrink-0" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold block">{isArabic ? item.labelAr : item.labelEn}</span>
                                    {item.descAr &&
                                <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">
                                        {isArabic ? item.descAr : item.descEn}
                                      </span>
                                }
                                  </div>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-all" />
                              </button>);

                      })}
                        </div>
                      </div>);

              })}
                </div>
              </div> :
          viewMode === "subpage" && activeSubPage ?
          <div className="w-full max-w-4xl mx-auto pb-24 px-4 sm:px-6 pt-4 text-right" dir="rtl">
                {/* Custom Subpage AppBar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <button
                  onClick={() => {
                    setViewMode("grid");
                    setActiveSubPage(null);
                    setSubPageSearch("");
                    setSubPageFilter("all");
                    if (playSynthSound) playSynthSound("tap");
                  }}
                  className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-zinc-800/40">
                  
                      <ArrowRight className="w-4 h-4" />
                      <span>{isArabic ? "الرجوع" : "Back"}</span>
                    </button>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                        {isArabic ? "قسم الأوتوكو الخاص" : "Otaku Dedicated Desk"}
                      </h3>
                      <h2 className="text-base font-black text-white flex items-center gap-1.5">
                        {activeSubPage === "favs" ? isArabic ? "المفضلة والألقاب" : "My Favorites" :
                    activeSubPage === "saved-articles" ? isArabic ? "المقالات المحفوظة" : "Saved Articles" :
                    activeSubPage === "saved-posts" ? isArabic ? "المنشورات المحفوظة" : "Saved Posts" :
                    activeSubPage === "stats" ? isArabic ? "إحصائيات النشاط والخبرة" : "Activity & XP Stats" :
                    activeSubPage === "reviews" ? isArabic ? "تقييماتي ومراجعاتي الخاصة" : "My Written Reviews" :
                    activeSubPage === "history" ? isArabic ? "سجل المشاهدة الكامل" : "Complete Watch History" :
                    activeSubPage === "last-watched" ? isArabic ? "آخر ما تمت مشاهدته والتقدم" : "Last Watched Progress" :
                    activeSubPage === "my-posts" ? isArabic ? "منشوراتي الشخصية" : "My Posts" :
                    activeSubPage === "my-hidden-posts" ? isArabic ? "منشوراتي المخفية" : "My Hidden Posts" :
                    activeSubPage === "my-archived-posts" ? isArabic ? "أرشيف المنشورات القديمة" : "Archived Posts" :
                    activeSubPage === "my-replies" ? isArabic ? "سجل الردود والتعليقات" : "My Replies" :
                    activeSubPage === "my-comments" ? isArabic ? "تعليقاتي الخاصة" : "My Comments" :
                    activeSubPage === "my-likes" ? isArabic ? "قائمة الإعجابات المفضلة" : "My Liked Items" :
                    activeSubPage === "my-followers" ? isArabic ? "المتابعون والذين أتابعهم" : "Followers & Following" :
                    activeSubPage === "my-groups" ? isArabic ? "المجموعات والنقابات المشترك بها" : "My Groups" :
                    activeSubPage === "my-channels" ? isArabic ? "قنوات الدردشة المنضم إليها" : "My Channels" :
                    activeSubPage === "anime" ? isArabic ? "موسوعة الأنمي والويكي" : "Anime Wiki" :
                    activeSubPage === "manga" ? isArabic ? "مكتبة تتبع المانجا" : "Manga Tracker" :
                    activeSubPage === "characters" ? isArabic ? "دليل الشخصيات والتصويت" : "Anime Characters" :
                    activeSubPage === "quotes" ? isArabic ? "صندوق الاقتباسات الشهيرة" : "Anime Quotes" :
                    activeSubPage === "explanations" ? isArabic ? "شروحات الويكي والدلائل" : "Lore Explanations" :
                    activeSubPage === "news" ? isArabic ? "أخبار الأنمي والمانجا الساخنة" : "Anime News" :
                    activeSubPage === "videos" ? isArabic ? "الفيديوهات واللقطات الحماسية" : "Videos & Promos" :
                    activeSubPage === "edit-profile" ? isArabic ? "تعديل المظهر المتقدم" : "Edit Profile" :
                    isArabic ? "تفاصيل الخدمة" : "Service Details"}
                      </h2>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                  onClick={() => {
                    setSubPageLoading(true);
                    if (playSynthSound) playSynthSound("tap");
                    setTimeout(() => {
                      setSubPageLoading(false);
                      if (playSynthSound) playSynthSound("success");
                    }, 500);
                  }}
                  className="p-2 bg-zinc-900 hover:bg-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all border border-zinc-800/40 active:scale-95"
                  title={isArabic ? "تحديث الصفحة" : "Refresh"}>
                  
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subpage filters & search */}
                {activeSubPage !== "stats" && activeSubPage !== "edit-profile" &&
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl flex items-center gap-2">
                      <Search className="w-4 h-4 text-zinc-500" />
                      <input
                  type="text"
                  placeholder={isArabic ? "ابحث في القائمة الحالية..." : "Search in current list..."}
                  value={subPageSearch}
                  onChange={(e) => setSubPageSearch(e.target.value)}
                  className="bg-transparent border-none text-white text-xs outline-none flex-1 placeholder-zinc-600 text-right" />
                
                      {subPageSearch &&
                <button onClick={() => setSubPageSearch("")} className="text-zinc-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                }
                    </div>
                    
                    {(activeSubPage === "favs" || activeSubPage === "saved-articles" || activeSubPage === "anime" || activeSubPage === "explanations") &&
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 p-2 rounded-xl">
                        <Settings2 className="w-4 h-4 text-zinc-500" />
                        <select
                  value={subPageFilter}
                  onChange={(e) => setSubPageFilter(e.target.value)}
                  className="bg-[#070709] border-none text-white text-xs outline-none flex-1 cursor-pointer font-bold text-right">
                  
                          <option value="all">{isArabic ? "عرض الكل" : "Show All"}</option>
                          {activeSubPage === "favs" &&
                  <>
                              <option value="anime">{isArabic ? "أنمي" : "Anime"}</option>
                              <option value="character">{isArabic ? "شخصيات" : "Characters"}</option>
                            </>
                  }
                          {activeSubPage === "saved-articles" &&
                  <>
                              <option value="analysis">{isArabic ? "تحليلات" : "Analysis"}</option>
                              <option value="guide">{isArabic ? "دلائل شروحات" : "Guides"}</option>
                              <option value="list">{isArabic ? "قوائم تصنيفات" : "Lists"}</option>
                            </>
                  }
                        </select>
                      </div>
              }
                  </div>
            }

                {/* SKELETON LOADING TRANSITION */}
                {subPageLoading ?
            <div className="space-y-4">
                    {[1, 2, 3].map((i, _autoIdx) =>
              <div key={`${i}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850/60 p-4 rounded-2xl animate-pulse flex items-center gap-4 text-right">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-zinc-800 rounded w-1/3 mr-auto" />
                          <div className="h-2 bg-zinc-800 rounded w-1/2 mr-auto" />
                        </div>
                      </div>
              )}
                  </div> :

            <div className="min-h-[300px]">
                    
                    {/* SUBPAGE 1: MY FAVORITES */}
                    {activeSubPage === "favs" &&
              <div className="space-y-6">
                        {/* Custom addition form to simulate database writes */}
                        <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-black text-white">➕ {isArabic ? "أضف مفضلة مخصصة حية" : "Add Custom Live Favorite"}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                      type="text"
                      id="new-fav-name"
                      placeholder={isArabic ? "اسم الأنمي أو الشخصية..." : "Anime or Character name..."}
                      className="bg-zinc-950 border border-zinc-850 text-xs text-white rounded-xl px-3 py-2" />
                    
                            <select id="new-fav-type" className="bg-zinc-950 border border-zinc-850 text-xs text-white rounded-xl px-2 py-2">
                              <option value="anime">{isArabic ? "أنمي" : "Anime"}</option>
                              <option value="character">{isArabic ? "شخصية" : "Character"}</option>
                            </select>
                            <button
                      onClick={() => {
                        const nameInput = document.getElementById("new-fav-name") as HTMLInputElement;
                        const typeSelect = document.getElementById("new-fav-type") as HTMLSelectElement;
                        if (!nameInput || !nameInput.value.trim()) return;

                        const newId = `fav-${Date.now()}`;
                        const newFav = {
                          id: newId,
                          titleAr: nameInput.value,
                          titleEn: nameInput.value,
                          type: typeSelect.value as "anime" | "character",
                          image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
                          rating: 5
                        };
                        setFavorites((prev) => [newFav, ...prev]);
                        nameInput.value = "";
                        if (playSynthSound) playSynthSound("success");
                        triggerHapticFeedback("success");
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl py-2">
                      
                              {isArabic ? "إضافة للقائمة حياً" : "Add Live"}
                            </button>
                          </div>
                        </div>

                        {/* Favorites Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {favorites.filter((f) => {
                    if (subPageFilter !== "all" && f.type !== subPageFilter) return false;
                    if (subPageSearch) {
                      const q = subPageSearch.toLowerCase();
                      return f.titleAr.toLowerCase().includes(q) || f.titleEn.toLowerCase().includes(q);
                    }
                    return true;
                  }).map((fav, _autoIdx) =>
                  <div key={`${fav.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between gap-3 group">
                              <div className="flex items-center gap-3">
                                <img src={fav.image} alt={fav.titleAr} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <span className="text-xs font-black text-white block">{isArabic ? fav.titleAr : fav.titleEn}</span>
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 bg-zinc-950 text-zinc-500 rounded border border-zinc-850 mt-1 inline-block font-mono">
                                    {fav.type}
                                  </span>
                                </div>
                              </div>
                              <button
                      onClick={() => {
                        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="p-2 hover:bg-red-950/40 text-zinc-500 hover:text-red-500 rounded-xl transition-all">
                      
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                  )}
                          {favorites.length === 0 &&
                  <p className="col-span-2 text-center text-xs text-zinc-600 py-12 italic">
                              {isArabic ? "لم تضف أي مفضلات بعد." : "No favorites added yet."}
                            </p>
                  }
                        </div>
                      </div>
              }

                    {/* SUBPAGE 2: SAVED ARTICLES */}
                    {activeSubPage === "saved-articles" &&
              <div className="space-y-4">
                        {savedArticles.filter((art) => {
                  if (subPageFilter !== "all" && art.category !== subPageFilter) return false;
                  if (subPageSearch) {
                    const q = subPageSearch.toLowerCase();
                    return art.titleAr.toLowerCase().includes(q) || art.titleEn.toLowerCase().includes(q);
                  }
                  return true;
                }).map((art, _autoIdx) =>
                <div key={`${art.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1 space-y-1.5 text-right">
                              <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                                {art.category}
                              </span>
                              <h4 className="text-sm font-black text-white">{isArabic ? art.titleAr : art.titleEn}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">By @{art.author} • {art.date}</p>
                            </div>
                            <div className="flex items-center gap-2 justify-end shrink-0">
                              <button
                      onClick={() => {
                        setSavedArticles((prev) => prev.filter((a) => a.id !== art.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-red-950/40 border border-zinc-850 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded-xl text-[10px] font-black transition-all">
                      
                                {isArabic ? "إلغاء حفظ المقال" : "Unsave"}
                              </button>
                            </div>
                          </div>
                )}
                        {savedArticles.length === 0 &&
                <p className="text-center text-xs text-zinc-600 py-12 italic">
                            {isArabic ? "لم تقم بحفظ أي مقالات بعد." : "No saved articles yet."}
                          </p>
                }
                      </div>
              }

                    {/* SUBPAGE 3: SAVED POSTS */}
                    {activeSubPage === "saved-posts" &&
              <div className="space-y-4">
                        {savedPostsState.filter((p) => {
                  if (subPageSearch) {
                    const q = subPageSearch.toLowerCase();
                    return p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
                  }
                  return true;
                }).map((post, _autoIdx) =>
                <div key={`${post.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1 space-y-1 text-right">
                              <h4 className="text-sm font-bold text-white">{post.title}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">By @{post.author} • {post.category}</p>
                            </div>
                            <div className="flex items-center gap-2 justify-end shrink-0">
                              <button
                      onClick={() => {
                        setSavedPostsState((prev) => prev.filter((p) => p.id !== post.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-red-950/40 border border-zinc-850 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded-xl text-[10px] font-black transition-all">
                      
                                {isArabic ? "إلغاء حفظ المنشور" : "Unsave"}
                              </button>
                            </div>
                          </div>
                )}
                        {savedPostsState.length === 0 &&
                <p className="text-center text-xs text-zinc-600 py-12 italic">
                            {isArabic ? "لم تقم بحفظ أي منشورات بعد." : "No saved posts yet."}
                          </p>
                }
                      </div>
              }

                    {/* SUBPAGE 4: STATS */}
                    {activeSubPage === "stats" &&
              <div className="space-y-6 text-right" dir="rtl">
                        {/* FEATURED BANNER: OTAKU STATS */}
                        <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-orange-950/40 border border-orange-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                              <BarChart2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white">{isArabic ? "إحصائيات الأوتاكو الشاملة" : "Comprehensive Otaku Analytics"}</h3>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {isArabic ? "ساعات المشاهدة، فصول المانجا، توزيع التصنيفات، والاستوديوهات المفضلة" : "Detailed watch time, manga chapters, genre distribution, and studios"}
                              </p>
                            </div>
                          </div>
                          <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      if (triggerHapticFeedback) triggerHapticFeedback("tap");
                      setShowOtakuStatsModal(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95">
                    
                            <BarChart2 className="w-4 h-4" />
                            <span>{isArabic ? "عرض التقرير الشامل" : "View Comprehensive Report"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">{isArabic ? "مستوى الهوية" : "Identity Level"}</span>
                            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">Lv {currentUser.level || 1}</span>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">{isArabic ? "الخبرة المكتسبة" : "Total XP"}</span>
                            <span className="text-2xl font-black text-white font-mono mt-1 block">{currentUser.xp || 720} XP</span>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">{isArabic ? "العملات الذهبية" : "Gold Stars"}</span>
                            <span className="text-2xl font-black text-yellow-500 font-mono mt-1 block">{stars}</span>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">{isArabic ? "المنشورات والتفاعل" : "My Posts"}</span>
                            <span className="text-2xl font-black text-indigo-400 font-mono mt-1 block">{myPostsState.length}</span>
                          </div>
                        </div>

                        {/* Dynamic custom bar chart */}
                        <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-black text-white">{isArabic ? "إحصائيات تفاعلك الأسبوعي (XP Gain)" : "Weekly XP Progress Tracker"}</h4>
                          <div className="flex justify-around items-end h-32 pt-4">
                            {[
                    { day: "Sun", xp: 40 },
                    { day: "Mon", xp: 120 },
                    { day: "Tue", xp: 90 },
                    { day: "Wed", xp: 150 },
                    { day: "Thu", xp: 210 },
                    { day: "Fri", xp: 80 },
                    { day: "Sat", xp: 110 }].
                    map((item, _autoIdx) =>
                    <div key={`${item.day}_${_autoIdx}`} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="text-[9px] text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                  +{item.xp}
                                </div>
                                <div className="w-6 bg-zinc-950 rounded-md overflow-hidden h-24 flex items-end border border-zinc-850">
                                  <div
                          className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-md transition-all duration-500"
                          style={{ height: `${item.xp / 240 * 100}%` }} />
                        
                                </div>
                                <span className="text-[9px] text-zinc-500 font-mono">{item.day}</span>
                              </div>
                    )}
                          </div>
                        </div>
                      </div>
              }

                    {/* SUBPAGE 5: WRITTEN REVIEWS */}
                    {activeSubPage === "reviews" &&
              <div className="space-y-4">
                        {userReviewsState.filter((r) => {
                  if (subPageSearch) {
                    return r.animeTitle.toLowerCase().includes(subPageSearch.toLowerCase());
                  }
                  return true;
                }).map((rev, _autoIdx) =>
                <div key={`${rev.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right space-y-3">
                            <div className="flex justify-between items-start border-b border-zinc-850/50 pb-2">
                              <div>
                                <h4 className="text-xs font-black text-white">{rev.animeTitle}</h4>
                                <div className="flex gap-1 mt-1 text-yellow-500">
                                  {Array.from({ length: 5 }).map((_, i) =>
                        <button
                          key={i}
                          onClick={() => {
                            setUserReviewsState((prev) => prev.map((r, _autoIdx) => r.id === rev.id ? { ...r, rating: i + 1 } : r));
                            if (playSynthSound) playSynthSound("success");
                          }}
                          className="text-xs focus:outline-none">
                          
                                      ★
                                    </button>
                        )}
                                  <span className="text-[10px] text-zinc-500 mr-2">({rev.rating}/5)</span>
                                </div>
                              </div>
                              <button
                      onClick={() => {
                        setUserReviewsState((prev) => prev.filter((r) => r.id !== rev.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="p-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-500 rounded-xl">
                      
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Inline edit reviewer comment */}
                            <textarea
                    value={rev.reviewText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserReviewsState((prev) => prev.map((r, _autoIdx) => r.id === rev.id ? { ...r, reviewText: val } : r));
                    }}
                    className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl p-2.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-red-500/40 transition-colors"
                    rows={2} />
                  
                            <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                              <span>Written on {rev.createdAt}</span>
                              <span className="text-green-500 font-bold">✓ {isArabic ? "تعديل حي تلقائي" : "Auto saved"}</span>
                            </div>
                          </div>
                )}
                        {userReviewsState.length === 0 &&
                <p className="text-center text-xs text-zinc-600 py-12 italic">
                            {isArabic ? "لم تقم بكتابة أي مراجعات بعد." : "No reviews submitted yet."}
                          </p>
                }
                      </div>
              }

                    {/* SUBPAGE 6: WATCH HISTORY */}
                    {activeSubPage === "history" &&
              <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#121215] border border-zinc-850 p-3 rounded-2xl mb-4">
                          <span className="text-[10px] text-zinc-500 font-mono">Total {historyItemsState.length} items</span>
                          <button
                    onClick={() => {
                      setHistoryItemsState([]);
                      if (playSynthSound) playSynthSound("error");
                    }}
                    className="bg-red-950/40 hover:bg-red-900 border border-red-900/60 text-red-400 font-black text-[10px] px-3 py-1.5 rounded-xl transition-all">
                    
                            🗑️ {isArabic ? "مسح السجل بالكامل" : "Clear All History"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {historyItemsState.filter((h) => {
                    if (subPageSearch) {
                      return h.animeTitle.toLowerCase().includes(subPageSearch.toLowerCase());
                    }
                    return true;
                  }).map((item, _autoIdx) =>
                  <div key={`${item.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-right">
                              <div>
                                <h4 className="text-xs font-black text-white">{item.animeTitle}</h4>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">{isArabic ? `الحلقة ${item.episode}` : `Episode ${item.episode}`}</span>
                                <span className="text-[9px] text-zinc-500 block font-mono">{item.watchedAt}</span>
                              </div>
                              <button
                      onClick={() => {
                        setHistoryItemsState((prev) => prev.filter((h) => h.id !== item.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="p-2 hover:bg-red-950/40 text-zinc-500 hover:text-red-500 rounded-xl">
                      
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                  )}
                          {historyItemsState.length === 0 &&
                  <p className="col-span-2 text-center text-xs text-zinc-600 py-12 italic">
                              {isArabic ? "سجل المشاهدة فارغ." : "Your watch history is empty."}
                            </p>
                  }
                        </div>
                      </div>
              }

                    {/* SUBPAGE 7: LAST WATCHED PROGRESS */}
                    {activeSubPage === "last-watched" &&
              <div className="space-y-4">
                        {lastWatched.map((anime, _autoIdx) =>
                <div key={`${anime.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl space-y-3">
                            <div className="flex justify-between items-start gap-4 text-right">
                              <div>
                                <h4 className="text-xs font-black text-white">{isArabic ? anime.titleAr : anime.titleEn}</h4>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                  {isArabic ? `الحلقة الحالية: ${anime.episode}` : `Current Episode: ${anime.episode}`} / {anime.totalEpisodes}
                                </p>
                              </div>
                              
                              <button
                      onClick={() => {
                        if (anime.episode >= anime.totalEpisodes) return;
                        setLastWatched((prev) => prev.map((a, _autoIdx) => a.id === anime.id ? { ...a, episode: a.episode + 1 } : a));
                        if (playSynthSound) playSynthSound("success");
                        if (triggerHapticFeedback) triggerHapticFeedback("tap");
                      }}
                      className="px-2.5 py-1 bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white rounded-lg text-[9px] font-black transition-all">
                      
                                ➕ {isArabic ? "مشاهدة حلقة" : "Next Episode"}
                              </button>
                            </div>

                            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                              <div
                      className="h-full bg-red-600"
                      style={{ width: `${anime.episode / anime.totalEpisodes * 100}%` }} />
                    
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 8: MY ACTIVE POSTS */}
                    {activeSubPage === "my-posts" &&
              <div className="space-y-4">
                        {myPostsState.filter((p) => !p.isHidden && !p.isArchived).map((post, _autoIdx) =>
                <div key={`${post.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right space-y-3">
                            <div>
                              <span className="text-[9px] bg-red-950/60 text-red-400 border border-red-900 px-2 py-0.5 rounded font-bold uppercase font-mono">
                                {post.category}
                              </span>
                              <h4 className="text-sm font-black text-white mt-2">{post.title}</h4>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-zinc-900">
                              <button
                      onClick={() => {
                        setMyPostsState((prev) => prev.map((p, _autoIdx) => p.id === post.id ? { ...p, isHidden: true } : p));
                        if (playSynthSound) playSynthSound("success");
                        alert(isArabic ? "تم نقل المنشور لتبويب المخفي بنجاح 🔒" : "Post moved to hidden posts.");
                      }}
                      className="bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 text-[9px] font-bold px-2.5 py-1 rounded-lg">
                      
                                {isArabic ? "إخفاء المنشور" : "Hide Post"}
                              </button>
                              <button
                      onClick={() => {
                        setMyPostsState((prev) => prev.map((p, _autoIdx) => p.id === post.id ? { ...p, isArchived: true } : p));
                        if (playSynthSound) playSynthSound("success");
                        alert(isArabic ? "تم أرشفة المنشور بنجاح 📦" : "Post archived.");
                      }}
                      className="bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 text-[9px] font-bold px-2.5 py-1 rounded-lg">
                      
                                {isArabic ? "أرشفة" : "Archive"}
                              </button>
                              <button
                      onClick={() => {
                        setMyPostsState((prev) => prev.filter((p) => p.id !== post.id));
                        if (playSynthSound) playSynthSound("error");
                      }}
                      className="bg-red-950/40 hover:bg-red-900 text-red-400 font-bold text-[9px] px-2.5 py-1 rounded-lg border border-red-900/40">
                      
                                {isArabic ? "حذف" : "Delete"}
                              </button>
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 9: MY HIDDEN POSTS */}
                    {activeSubPage === "my-hidden-posts" &&
              <div className="space-y-4">
                        {myPostsState.filter((p) => p.isHidden).map((post, _autoIdx) =>
                <div key={`${post.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white">🔒 {post.title}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-1">Hidden from public view</p>
                            </div>
                            <button
                    onClick={() => {
                      setMyPostsState((prev) => prev.map((p, _autoIdx) => p.id === post.id ? { ...p, isHidden: false } : p));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className="px-3 py-1.5 bg-green-950/40 border border-green-900 text-green-400 rounded-xl text-[10px] font-bold">
                    
                              {isArabic ? "إلغاء الإخفاء" : "Unhide"}
                            </button>
                          </div>
                )}
                        {myPostsState.filter((p) => p.isHidden).length === 0 &&
                <p className="text-center text-xs text-zinc-600 py-12 italic">
                            {isArabic ? "لا يوجد منشورات مخفية." : "No hidden posts."}
                          </p>
                }
                      </div>
              }

                    {/* SUBPAGE 10: ARCHIVED POSTS */}
                    {activeSubPage === "my-archived-posts" &&
              <div className="space-y-4">
                        {myPostsState.filter((p) => p.isArchived).map((post, _autoIdx) =>
                <div key={`${post.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white">📦 {post.title}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-1">Archived post</p>
                            </div>
                            <button
                    onClick={() => {
                      setMyPostsState((prev) => prev.map((p, _autoIdx) => p.id === post.id ? { ...p, isArchived: false } : p));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className="px-3 py-1.5 bg-amber-950/40 border border-amber-900 text-amber-400 rounded-xl text-[10px] font-bold">
                    
                              {isArabic ? "استعادة للنشاط" : "Restore"}
                            </button>
                          </div>
                )}
                        {myPostsState.filter((p) => p.isArchived).length === 0 &&
                <p className="text-center text-xs text-zinc-600 py-12 italic">
                            {isArabic ? "أرشيفك فارغ." : "No archived posts."}
                          </p>
                }
                      </div>
              }

                    {/* SUBPAGE 11: ANIME SHORTCUT DATABASE */}
                    {activeSubPage === "anime" &&
              <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                  { id: "a1", titleAr: "قاتل الشياطين Demon Slayer", titleEn: "Demon Slayer: Kimetsu no Yaiba", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300", genre: "Action", epCount: 26 },
                  { id: "a2", titleAr: "هجوم العمالقة Attack on Titan", titleEn: "Attack on Titan", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300", genre: "Fantasy", epCount: 75 },
                  { id: "a3", titleAr: "جوجوتسو كايسن Jujutsu Kaisen", titleEn: "Jujutsu Kaisen", image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300", genre: "Action", epCount: 24 }].
                  filter((anime) => {
                    if (subPageSearch) {
                      const q = subPageSearch.toLowerCase();
                      return anime.titleAr.toLowerCase().includes(q) || anime.titleEn.toLowerCase().includes(q);
                    }
                    return true;
                  }).map((anime, _autoIdx) =>
                  <div key={`${anime.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-right">
                              <div className="flex items-center gap-3">
                                <img src={anime.image} alt={anime.titleAr} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <h4 className="text-xs font-black text-white">{isArabic ? anime.titleAr : anime.titleEn}</h4>
                                  <span className="text-[9px] text-zinc-500 font-mono block mt-1">{anime.genre} • {anime.epCount} Eps</span>
                                </div>
                              </div>

                              <button
                      onClick={() => {
                        // Check if already in favorites
                        if (favorites.some((f) => f.titleAr === anime.titleAr)) return;
                        const newFav = {
                          id: `fav-${Date.now()}`,
                          titleAr: anime.titleAr,
                          titleEn: anime.titleEn,
                          type: "anime" as const,
                          image: anime.image,
                          rating: 5
                        };
                        setFavorites((prev) => [newFav, ...prev]);
                        if (playSynthSound) playSynthSound("success");
                        alert(isArabic ? "تم الإضافة لقائمة مفضلاتك بنجاح! 💖" : "Added to favorites.");
                      }}
                      className="px-2.5 py-1.5 bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-[9px] font-bold transition-all">
                      
                                {isArabic ? "❤️ أضف للمفضلة" : "Fav"}
                              </button>
                            </div>
                  )}
                        </div>
                      </div>
              }

                    {/* SUBPAGE 12: MANGA DATABASE */}
                    {activeSubPage === "manga" &&
              <div className="space-y-4">
                        {[
                { id: "m1", title: "Solo Leveling", ch: 179, total: 200, author: "Chugong" },
                { id: "m2", title: "Berserk", ch: 364, total: 375, author: "Kentaro Miura" },
                { id: "m3", title: "One Piece Manga", ch: 1050, total: 1100, author: "Eiichiro Oda" }].
                map((manga, _autoIdx) =>
                <div key={`${manga.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-black text-white">{manga.title}</h4>
                                <span className="text-[10px] text-zinc-500">By {manga.author}</span>
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">Ch {manga.ch} / {manga.total}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl">
                              <span className="text-[9px] text-zinc-500">Track Progress</span>
                              <div className="flex gap-2">
                                <button className="px-2 py-0.5 bg-zinc-900 text-white rounded text-xs">-</button>
                                <button className="px-2 py-0.5 bg-zinc-900 text-white rounded text-xs">+</button>
                              </div>
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 13: CHARACTERS PORTFOLIO */}
                    {activeSubPage === "characters" &&
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                { id: "c1", name: "Roronoa Zoro", votes: 4850, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" },
                { id: "c2", name: "Levi Ackerman", votes: 3980, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" },
                { id: "c3", name: "Gojo Satoru", votes: 5210, image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300" }].
                map((char, _autoIdx) =>
                <div key={`${char.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-right">
                            <div className="flex items-center gap-3">
                              <img src={char.image} alt={char.name} className="w-12 h-12 rounded-full object-cover border border-zinc-800" />
                              <div>
                                <h4 className="text-xs font-black text-white">{char.name}</h4>
                                <span className="text-[9px] text-zinc-500 font-mono">{char.votes} {isArabic ? "صوت" : "votes"}</span>
                              </div>
                            </div>
                            <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("success");
                      triggerHapticFeedback("success");
                      alert(isArabic ? `شكراً لتصويتك لـ ${char.name}! 👍` : `Voted for ${char.name}!`);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black hover:bg-red-700 active:scale-95 transition-all">
                    
                              👍 {isArabic ? "صوّت" : "Vote"}
                            </button>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 14: AMBIENT QUOTES BOX */}
                    {activeSubPage === "quotes" &&
              <div className="space-y-4">
                        {[
                { id: "q1", text: "إذا لم تخاطر، فلن تصنع مستقبلاً أبداً.", character: "Monkey D. Luffy", anime: "One Piece" },
                { id: "q2", text: "الألم لا يختفي، بل نتعلم كيف نتعايش معه فقط.", character: "Hatake Kakashi", anime: "Naruto" }].
                map((quote, _autoIdx) =>
                <div key={`${quote.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right relative overflow-hidden">
                            <Quote className="absolute top-2 left-2 w-8 h-8 text-zinc-800/20" />
                            <p className="text-sm font-black text-white leading-relaxed italic">“{quote.text}”</p>
                            <div className="mt-3 text-[10px] text-zinc-400 font-mono flex justify-between items-center">
                              <span>— {quote.character} ({quote.anime})</span>
                              <button
                      onClick={() => {
                        if (playSynthSound) playSynthSound("success");
                        alert("Liked Quote!");
                      }}
                      className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                      
                                ❤️ {isArabic ? "إعجاب" : "Like"}
                              </button>
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 15: NEWS BULLETINS */}
                    {activeSubPage === "news" &&
              <div className="space-y-4">
                        {[
                { id: "n1", title: "الكشف عن بوستر ترويجي جديد للجزء القادم من قاتل الشياطين", date: "Today", source: "Official" },
                { id: "n2", title: "فيلم هجوم العمالقة الأخير يحطم الأرقام القياسية في شباك التذاكر الياباني", date: "Yesterday", source: "Animate" }].
                map((news, _autoIdx) =>
                <div key={`${news.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right">
                            <h4 className="text-xs font-black text-white leading-relaxed">{news.title}</h4>
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-2.5">
                              <span>Source: {news.source}</span>
                              <span>{news.date}</span>
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* SUBPAGE 16: VIDEOS compile */}
                    {activeSubPage === "videos" &&
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                { id: "v1", title: "Demon Slayer Official Promo Trailer", duration: "2:15" },
                { id: "v2", title: "Levi vs Beast Titan Full Fight UHD", duration: "5:40" }].
                map((vid, _autoIdx) =>
                <div key={`${vid.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 rounded-2xl overflow-hidden text-right">
                            <div className="h-28 bg-zinc-950 flex items-center justify-center relative">
                              <div className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all">
                                ▶
                              </div>
                              <span className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-zinc-300 font-mono">
                                {vid.duration}
                              </span>
                            </div>
                            <div className="p-3">
                              <h4 className="text-xs font-bold text-white leading-normal truncate">{vid.title}</h4>
                            </div>
                          </div>
                )}
                      </div>
              }

                    {/* OTHER BACKWARD COMPATIBLE SUBPAGES (e.g. following lists, comments, groups, channels, edit profile) */}
                    {activeSubPage === "my-replies" &&
              <div className="space-y-4">
                        {myRepliesState.map((rep, _autoIdx) =>
                <div key={`${rep.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right">
                            <p className="text-xs text-white">“{rep.text}”</p>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-1">Post: {rep.postTitle}</span>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "my-comments" &&
              <div className="space-y-4">
                        {myCommentsState.map((comm, _autoIdx) =>
                <div key={`${comm.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right">
                            <p className="text-xs text-white">“{comm.text}”</p>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-1">Post: {comm.postTitle}</span>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "my-likes" &&
              <div className="space-y-4">
                        {myLikesState.map((like, _autoIdx) =>
                <div key={`${like.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl text-right">
                            <span className="text-xs font-bold text-white block">{like.postTitle}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">Liked on {like.likedAt}</span>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "my-followers" &&
              <div className="space-y-3">
                        {followersListState.map((f, _autoIdx) =>
                <div key={`${f.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between text-right">
                            <span className="text-xs font-bold text-white">@{f.username}</span>
                            <button
                    onClick={() => {
                      setFollowersListState((prev) => prev.map((u, _autoIdx) => u.id === f.id ? { ...u, followingBack: !u.followingBack } : u));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                    f.followingBack ? "bg-zinc-800 text-zinc-400" : "bg-red-600 text-white"}`
                    }>
                    
                              {f.followingBack ? isArabic ? "متابع" : "Following" : isArabic ? "رد المتابعة" : "Follow Back"}
                            </button>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "my-groups" &&
              <div className="space-y-3">
                        {groupsListState.map((g, _autoIdx) =>
                <div key={`${g.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between text-right">
                            <div>
                              <span className="text-xs font-bold text-white block">🛡️ {isArabic ? g.nameAr : g.nameEn}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{g.members} members</span>
                            </div>
                            <button
                    onClick={() => {
                      setGroupsListState((prev) => prev.map((group, _autoIdx) => group.id === g.id ? { ...group, joined: !group.joined } : group));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                    g.joined ? "bg-red-950/40 text-red-400 border border-red-900/60" : "bg-zinc-800 text-white"}`
                    }>
                    
                              {g.joined ? isArabic ? "مغادرة" : "Leave" : isArabic ? "انضمام" : "Join"}
                            </button>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "my-channels" &&
              <div className="space-y-3">
                        {channelsListState.map((c, _autoIdx) =>
                <div key={`${c.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between text-right">
                            <div>
                              <span className="text-xs font-bold text-white block">📢 {isArabic ? c.nameAr : c.nameEn}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{c.subscribers} subscribers</span>
                            </div>
                            <button
                    onClick={() => {
                      setChannelsListState((prev) => prev.map((chan, _autoIdx) => chan.id === c.id ? { ...chan, joined: !chan.joined } : chan));
                      if (playSynthSound) playSynthSound("success");
                    }}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                    c.joined ? "bg-red-950/40 text-red-400 border border-red-900/60" : "bg-zinc-800 text-white"}`
                    }>
                    
                              {c.joined ? isArabic ? "مغادرة" : "Leave" : isArabic ? "انضمام" : "Join"}
                            </button>
                          </div>
                )}
                      </div>
              }

                    {activeSubPage === "explanations" &&
              <div className="space-y-4">
                        {[
                { id: "e1", title: "مستويات قوة تفعيل حجر الروح في بليتش", text: "هذا الدليل يشرح المبادئ الأساسية لمستويات رتب الشينيغامي وقوة الكوينسي بالتفصيل والتواريخ." }].
                map((exp, _autoIdx) =>
                <div key={`${exp.id}_${_autoIdx}`} className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl text-right">
                            <h4 className="text-xs font-black text-white">{exp.title}</h4>
                            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">{exp.text}</p>
                          </div>
                )}
                      </div>
              }

                  </div>
            }
              </div> :

          <div className="space-y-6 max-w-4xl mx-auto pb-24 p-4 md:p-6 text-right" dir="rtl">
                {/* Back to main Hub Header */}
                <div className="flex items-center gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 mb-4 shrink-0">
                  <button
                onClick={() => {
                  setViewMode("grid");
                  if (playSynthSound) playSynthSound("tap");
                  if (triggerHapticFeedback) triggerHapticFeedback("tap");
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-zinc-800/40">
                
                    <ArrowRight className="w-4 h-4" />
                    <span>{isArabic ? "الرجوع للمركز" : "Back to Hub"}</span>
                  </button>
                  <div className="mr-2">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      {isArabic ? "مركز الأوتوكو الذكي" : "Smart Otaku Hub"}
                    </h3>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ?
                  categoriesList.find((c) => c.id === activeCategory)?.labelAr :
                  categoriesList.find((c) => c.id === activeCategory)?.labelEn}
                    </h2>
                  </div>
                </div>

                {/* CATEGORY: APPEARANCE (Light Mode & Dark Mode) */}
                {activeCategory === "appearance" &&
            <div className="space-y-6 max-w-2xl mx-auto text-right" dir="rtl">
                    <div className="border-b border-zinc-850 pb-3">
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <span>{isArabic ? "المظهر" : "Appearance"}</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {isArabic ? "اختر مظهر التطبيق المناسب لك (الوضع النهاري أو الوضع الليلي)" : "Select your preferred application appearance mode"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Light Mode Option */}
                      <button
                  type="button"
                  onClick={() => {
                    if (playSynthSound) playSynthSound("tap");
                    if (triggerHapticFeedback) triggerHapticFeedback("tap");
                    if (setAppearanceMode) setAppearanceMode("light");
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between text-right cursor-pointer relative overflow-hidden ${
                  appearanceMode === "light" ?
                  "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10" :
                  "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`
                  }>
                  
                        {appearanceMode === "light" &&
                  <div className="absolute top-3 left-3 bg-amber-500 text-black p-1 rounded-full">
                            <Check className="w-4 h-4 font-black" />
                          </div>
                  }
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Sun className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{isArabic ? "☀️ الوضع النهاري" : "☀️ Light Mode"}</h4>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                              {isArabic ?
                        "مظهر فاتح ناصع باللون الأبيض، وضوح تام ومريح للقراءة في النهار والبيئات المضيئة." :
                        "Crisp light background optimized for daylight and high-visibility environments."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                          <span className={appearanceMode === "light" ? "text-amber-400 font-black" : "text-zinc-500"}>
                            {appearanceMode === "light" ? isArabic ? "مُفعّل حالياً" : "Active" : isArabic ? "تفعيل" : "Select"}
                          </span>
                          <div className="w-16 h-3 rounded-full bg-slate-200 border border-slate-300 flex items-center px-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                          </div>
                        </div>
                      </button>

                      {/* Dark Mode Option */}
                      <button
                  type="button"
                  onClick={() => {
                    if (playSynthSound) playSynthSound("tap");
                    if (triggerHapticFeedback) triggerHapticFeedback("tap");
                    if (setAppearanceMode) setAppearanceMode("dark");
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between text-right cursor-pointer relative overflow-hidden ${
                  appearanceMode === "dark" ?
                  "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10" :
                  "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`
                  }>
                  
                        {appearanceMode === "dark" &&
                  <div className="absolute top-3 left-3 bg-orange-500 text-white p-1 rounded-full">
                            <Check className="w-4 h-4 font-black" />
                          </div>
                  }
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                            <Moon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{isArabic ? "🌙 الوضع الليلي" : "🌙 Dark Mode"}</h4>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                              {isArabic ?
                        "مظهر داكن فاخر باللون الأسود والبرتقالي، مريح للعين في الإضاءة المنخفضة." :
                        "Luxurious black and orange dark theme, easy on the eyes in low light."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                          <span className={appearanceMode === "dark" ? "text-orange-400 font-black" : "text-zinc-500"}>
                            {appearanceMode === "dark" ? isArabic ? "مُفعّل حالياً" : "Active" : isArabic ? "تفعيل" : "Select"}
                          </span>
                          <div className="w-16 h-3 rounded-full bg-zinc-950 border border-zinc-800 flex items-center px-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
            }

                {/* CATEGORY 1: ACCOUNT & DIGITAL IDENTITY (Chapter 5) */}
                {activeCategory === "account" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Header with Title and Role Indicator */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 gap-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>{isArabic ? "الهوية الأوتوكو الرقمية المتكاملة" : "Digital Otaku Identity & Passport"}</span>
                  </h3>
                  {currentUser.role &&
                <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-amber-400">
                      <span>👑</span>
                      <span>{isArabic ? `الرتبة: ${currentUser.role}` : `Role: ${currentUser.role}`}</span>
                    </div>
                }
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                  <button
                  onClick={() => setAccountSubTab("card")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "card" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    🪪 {isArabic ? "جواز السفر والبطاقة" : "Passport & ID"}
                  </button>
                  <button
                  onClick={() => setAccountSubTab("levels")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "levels" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    📈 {isArabic ? "مركز المستويات" : "Levels Hub"}
                  </button>
                  <button
                  onClick={() => setAccountSubTab("privacy")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "privacy" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    🏅 {isArabic ? "الألقاب والخصوصية" : "Titles & Privacy"}
                  </button>
                  <button
                  onClick={() => setAccountSubTab("verification")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "verification" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    🛡️ {isArabic ? "طلبات التوثيق" : "Verification"}
                  </button>
                  <button
                  onClick={() => setAccountSubTab("security")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "security" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    🔐 {isArabic ? "الأمان والحساب" : "Auth & Security"}
                  </button>
                  <button
                  onClick={() => setAccountSubTab("activity")}
                  className={`flex-1 text-center py-2 px-3 text-[11px] font-black rounded-lg transition-all ${
                  accountSubTab === "activity" ?
                  "bg-red-950/40 text-red-400 border border-red-900/50" :
                  "text-zinc-400 hover:text-white"}`
                  }>
                  
                    📜 {isArabic ? "سجل النشاط" : "My Logs"}
                  </button>
                </div>

                {/* TAB CONTENT: 1. ID CARD & PASSPORT */}
                {accountSubTab === "card" &&
              <div className="space-y-6">
                    {/* Glowing digital identity passport card */}
                    <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--theme-accent)]/20 to-transparent rounded-full blur-2xl" />
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* User Avatar with equipped custom frame */}
                        <div className="relative">
                          <img
                        src={currentUser.avatar}
                        className={`w-20 h-20 rounded-full object-cover border-2 ${
                        activeFrame === "fire_aura" ? "border-[#FF3300] shadow-[0_0_12px_#FF3300]" :
                        activeFrame === "samurai_gold" ? "border-[#D4AF37] shadow-[0_0_12px_#D4AF37]" :
                        activeFrame === "cosmic_neon" ? "border-[#00FFCC] shadow-[0_0_12px_#FF007F]" :
                        activeFrame === "cherry_blossom" ? "border-[#FF69B4] shadow-[0_0_12px_#FFD1DC]" :
                        "border-zinc-700"}`
                        }
                        referrerPolicy="no-referrer" />
                      
                          <button
                        onClick={() => setAccountSubTab("levels")}
                        className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-[9px] font-black w-6 h-6 flex items-center justify-center border-2 border-zinc-950 transition-all active:scale-90">
                        
                            Lv{currentUser.level || 1}
                          </button>
                        </div>

                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <span className="text-sm font-black text-white">{currentUser.name}</span>
                            {currentUser.isVerified &&
                        <span
                          title={currentUser.verificationType}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wider ${
                          currentUser.verificationType === "official" ? "bg-blue-950/60 text-blue-400 border border-blue-900/50" :
                          currentUser.verificationType === "creator" ? "bg-amber-950/60 text-amber-400 border border-amber-900/50" :
                          currentUser.verificationType === "mod" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50" :
                          "bg-zinc-900 text-zinc-400 border border-zinc-800"}`
                          }>
                          
                                {currentUser.verificationType === "official" ? "✓ موثق" :
                          currentUser.verificationType === "creator" ? "🎨 صانع" :
                          currentUser.verificationType === "mod" ? "🛡️ مشرف" : "✓"}
                              </span>
                        }
                            {selectedTitle &&
                        <span className="bg-red-950/50 text-red-400 border border-red-900/50 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                🏷️ {selectedTitle}
                              </span>
                        }
                          </div>
                          <span className="text-xs text-zinc-500 font-mono">@{currentUser.username}</span>
                          <p className="text-[10px] text-zinc-400 mt-1.5">
                            {currentUser.bio || (isArabic ? "عاشق أنمي مخلص • عضو في نقابة فيلق الاستطلاع" : "Loyal anime lover • Scout Regiment Member")}
                          </p>
                        </div>

                        {/* QR and Barcode Visual */}
                        <div className="flex flex-col items-center bg-black/40 p-2.5 rounded-xl border border-zinc-850 shrink-0">
                          <QrCode className="w-10 h-10 text-zinc-400" />
                          <span className="text-[7px] font-mono mt-1 text-zinc-500">ID-{(currentUser.username || "user").slice(0, 4).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Level progress overview */}
                      <div className="mt-4 pt-4 border-t border-zinc-900 space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-500 font-bold">{isArabic ? "رتبة الأوتاكو: النخبة الفضية" : "Otaku Rank: Silver Elite"}</span>
                          <span className="text-zinc-300 font-mono font-bold">{currentUser.xp || 120} / {(currentUser.level || 1) * 500} XP</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                          <div
                        className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 animate-pulse"
                        style={{ width: `${Math.min(100, (currentUser.xp || 120) % 500 / 500 * 100)}%` }} />
                      
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-500">
                          <span>Lv {currentUser.level || 1}</span>
                          <span>Lv {(currentUser.level || 1) + 1}</span>
                        </div>
                      </div>

                      {/* Quick action buttons on ID card */}
                      <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between gap-2">
                        <button
                      onClick={() => {
                        if (playSynthSound) playSynthSound("achievement");
                        alert(isArabic ? "تم نسخ رابط هويتك الرقمية بنجاح! شاركها مع أصدقائك" : "Digital identity link copied successfully! Share it anywhere.");
                      }}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-black py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95">
                      
                          🔗 {isArabic ? "مشاركة هويتي الأوتوكو" : "Share Otaku Identity"}
                        </button>
                        <button
                      onClick={() => setAccountSubTab("levels")}
                      className="bg-red-950/40 hover:bg-red-950/60 border border-red-900 text-red-400 text-[10px] font-black py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95">
                      
                          ⚡ {isArabic ? "تفاصيل المستوى" : "Level Hub"}
                        </button>
                      </div>
                    </div>

                    {/* Passport stamps & bio metrics */}
                    <div className="bg-[#121215] border border-zinc-850 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <span className="text-sm">🌸</span>
                        <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                          {isArabic ? "جواز سفر الأوتاكو الرقمي" : "Otaku Digital Passport"}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[9px] text-zinc-500 block uppercase font-bold">{isArabic ? "الإقامة الرقمية" : "Residence"}</span>
                          <span className="text-xs text-white font-bold">{currentUser.country || (isArabic ? "اليابان (افتراضية)" : "Japan")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block uppercase font-bold">{isArabic ? "اللغة المفضلة" : "Language"}</span>
                          <span className="text-xs text-white font-bold">{currentUser.language || "العربية"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block uppercase font-bold">{isArabic ? "تاريخ الانتساب" : "Member Since"}</span>
                          <span className="text-xs text-white font-mono">{currentUser.joinedDate || "2026-07-04"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block uppercase font-bold">{isArabic ? "معدل التفاعل" : "Engagement Rate"}</span>
                          <span className="text-xs text-emerald-400 font-mono font-bold">%{currentUser.engagementRate || 8.4}</span>
                        </div>
                      </div>

                      {/* Passport Seals & Stamps */}
                      <div className="space-y-1.5 pt-3 border-t border-zinc-900">
                        <span className="text-[9px] text-zinc-500 font-bold block">{isArabic ? "أختام الفيزا والأنشطة المحققة:" : "Visa Seals & Accomplishments:"}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {passportStamps.map((stamp, sIdx) =>
                      <div key={sIdx} className="bg-red-950/40 border border-red-900/50 text-red-200 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                              印 {stamp}
                            </div>
                      )}
                        </div>
                      </div>

                      {/* Favorite Universe elements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-900">
                        <div>
                          <span className="text-[9px] text-zinc-500 block font-bold mb-1">{isArabic ? "الأنميات المفضلة:" : "Favorite Anime:"}</span>
                          <div className="flex flex-wrap gap-1">
                            {(currentUser.favAnime || []).map((anime, idx) =>
                        <span key={idx} className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[9px] px-2 py-0.5 rounded-md">
                                {anime}
                              </span>
                        )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block font-bold mb-1">{isArabic ? "الشخصيات المفضلة:" : "Favorite Characters:"}</span>
                          <div className="flex flex-wrap gap-1">
                            {(currentUser.favCharacters || []).map((char, idx) =>
                        <span key={idx} className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[9px] px-2 py-0.5 rounded-md">
                                {char}
                              </span>
                        )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              }

                {/* TAB CONTENT: 2. LEVEL HUB UP TO 100 */}
                {accountSubTab === "levels" &&
              <div className="space-y-6">
                    {/* Level statistics header */}
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <LevelBadge
                      level={currentUser.level || 1}
                      size="lg"
                      showTitle={true}
                      isArabic={isArabic}
                      onClick={() => setShow100LevelBadgesModal(true)} />
                    
                        <div>
                          <span className="block text-xs text-zinc-400 font-bold">{isArabic ? "المستوى الحالي" : "Current Level"}</span>
                          <span className="block text-[10px] text-zinc-500 font-mono">XP: {currentUser.xp || 120} • {isArabic ? "مواسم تفاعلية" : "XP Seasons Active"}</span>
                        </div>
                      </div>

                      {/* Prestige Reset Action & Open 100 Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                      onClick={() => {
                        if (playSynthSound) playSynthSound("tap");
                        setShow100LevelBadgesModal(true);
                      }}
                      className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-[11px] py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer hover:scale-105 active:scale-95">
                      
                          🏆 {isArabic ? "استعراض الـ 100 شارة الفخمة" : "View All 100 Badges Gallery"}
                        </button>

                        <button
                      onClick={() => {
                        if ((currentUser.level || 1) < 100) {
                          alert(isArabic ? "ميزة بريستيج (Prestige) تُفعل فقط عند الوصول للمستوى الأقصى 100!" : "Prestige feature unlocks only at Level 100!");
                        } else {
                          if (playSynthSound) playSynthSound("achievement");
                          alert(isArabic ? "تهانينا! لقد قمت بتبديل بريستيج بنجاح وتمت ترقية نجمك!" : "Congratulations! Prestige reset initiated, star level upgraded.");
                        }
                      }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-zinc-950 font-black text-[10px] py-2 px-3 rounded-xl transition-all">
                      
                          🌟 {isArabic ? "بريستيج والترقية" : "Prestige Reset"}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Levels 1-100 Preview */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <h4 className="text-xs font-black text-white">🏆 {isArabic ? "خارطة طريق مستويات الأوتوكو (1 - 100)" : "Otaku Road to Level 100"}</h4>
                        <span className="text-[8px] text-zinc-500 font-mono">Season: Dragon Quest</span>
                      </div>

                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                        {Array.from({ length: 100 }).map((_, idx) => {
                      const lvlNum = idx + 1;
                      const isReached = (currentUser.level || 1) >= lvlNum;
                      const isCurrent = (currentUser.level || 1) === lvlNum;
                      return (
                        <div
                          key={idx}
                          title={`Level ${lvlNum} reward`}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-[9px] font-mono transition-all ${
                          isCurrent ?
                          "bg-red-600/30 text-white border-red-500 font-black shadow-[0_0_8px_rgba(239,68,68,0.2)]" :
                          isReached ?
                          "bg-zinc-900 text-zinc-400 border-zinc-800 font-bold" :
                          "bg-zinc-950/20 text-zinc-600 border-zinc-900/50"}`
                          }>
                          
                              <span>L{lvlNum}</span>
                              {lvlNum % 10 === 0 && <span className="text-[8px] text-amber-500">🎁</span>}
                            </div>);

                    })}
                      </div>

                      {/* Milestone rewards explanation */}
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-[10px] space-y-1 text-zinc-400">
                        <span className="block font-black text-zinc-300">🎁 {isArabic ? "هدايا المستويات البارزة:" : "Milestone Rewards Road:"}</span>
                        <p>• {isArabic ? "مستوى 10: فتح الألقاب النخبوية + 50 قطعة كوينز" : "Level 10: Elite Title + 50 Coins"}</p>
                        <p>• {isArabic ? "مستوى 30: إطار بروفايل الشيري بلوسم الوردي" : "Level 30: Cherry Blossom Avatar Frame"}</p>
                        <p>• {isArabic ? "مستوى 50: إطار الهالة النارية الأسطوري" : "Level 50: Legendary Fire Aura Avatar Frame"}</p>
                        <p>• {isArabic ? "مستوى 100: لقب أسطورة بلاك + ميزة البريستيج" : "Level 100: 'Anime Black Legend' Title & Prestige Option"}</p>
                      </div>
                    </div>

                    {/* Level Up Leaderboard */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">🏆 {isArabic ? "قائمة متصدري مستويات المنصة" : "Platform Levels Leaderboard"}</h4>
                      
                      <div className="space-y-1.5">
                        {[
                    { rank: 1, name: "كين أوتشيها (المالك)", xp: "49,500 XP", level: 99, isOwner: true, avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150" },
                    { rank: 2, name: "ماستر لوفي", xp: "37,200 XP", level: 75, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
                    { rank: 3, name: "أوتاكو سينسي", xp: "22,500 XP", level: 45, avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150" },
                    { rank: 4, name: "ميكاسا تشان", xp: "14,000 XP", level: 28, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" }].
                    map((user, idx) =>
                    <div key={idx} className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl border border-zinc-900 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 text-center font-mono font-bold ${user.rank === 1 ? "text-amber-400" : "text-zinc-500"}`}>{user.rank}</span>
                              <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" />
                              <span className="font-bold text-zinc-300">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[10px] text-zinc-500">{user.xp}</span>
                              <span className="bg-red-950 text-red-400 border border-red-900 text-[9px] px-1.5 py-0.5 rounded">Lv {user.level}</span>
                            </div>
                          </div>
                    )}
                      </div>
                    </div>
                  </div>
              }

                {/* TAB CONTENT: 3. TITLES & PRIVACY SETTINGS */}
                {accountSubTab === "privacy" &&
              <div className="space-y-6">
                    {/* Active Title Selector */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">🏷️ {isArabic ? "تحديد اللقب النشط" : "Equip Active Title Badge"}</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {(currentUser.titles || ["Rookie", "Explorer"]).map((title, idx) => {
                      const isEquipped = selectedTitle === title;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedTitle(title);
                            if (playSynthSound) playSynthSound("tap");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          isEquipped ?
                          "bg-red-950/40 border-red-500 text-red-400" :
                          "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"}`
                          }>
                          
                              <div className="flex justify-between items-center">
                                <span>🏷️ {title}</span>
                                {isEquipped && <Check className="w-3.5 h-3.5 text-red-500" />}
                              </div>
                            </button>);

                    })}
                      </div>
                    </div>

                    {/* Reputation Meter (Non-editable) */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">📈 {isArabic ? "مقياس السمعة والموثوقية العامة" : "General Reputation Meter"}</h4>
                      <p className="text-[10px] text-zinc-500">
                        {isArabic ?
                    "السمعة تُحسب تلقائياً بناءً على تفاعلاتك الإيجابية وخلو سجل حظر ورشاقة منشوراتك داخل الأوتوكو. لا يمكن تعديل هذا الحقل يدوياً." :
                    "Reputation score is computed dynamically based on positive community logs and account health indexes. Non-editable."}
                      </p>

                      <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-[8px] text-zinc-500 uppercase tracking-widest">{isArabic ? "مستوى السمعة" : "Reputation Index"}</span>
                          <span className="block text-sm font-black text-emerald-400 mt-1">%{currentUser.reputation || 85} ({isArabic ? "أوتوكو موثوق" : "Highly Trusted"})</span>
                        </div>
                        <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${currentUser.reputation || 85}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Identity Privacy Settings */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <span className="text-sm">👁️</span>
                        <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                          {isArabic ? "إعدادات خصوصية الهوية الرقمية" : "Identity Visibility Privacy Settings"}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {[
                    { key: "level", labelAr: "المستوى الرمزي", labelEn: "Symbolic Level" },
                    { key: "reputation", labelAr: "مقياس السمعة", labelEn: "Reputation Meter" },
                    { key: "role", labelAr: "الرتبة في النظام", labelEn: "System Role Rank" },
                    { key: "coins", labelAr: "رصيد الكوينز", labelEn: "Black Coins Balance" },
                    { key: "stars", labelAr: "النجوم المتألقة", labelEn: "Star Balances" },
                    { key: "achievements", labelAr: "الإنجازات المفتوحة", labelEn: "Unlocked Achievements" }].
                    map((set, _autoIdx) =>
                    <div key={`${set.key}_${_autoIdx}`} className="flex flex-col sm:flex-row justify-between sm:items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-xs gap-2">
                            <span className="font-bold text-zinc-300">{isArabic ? set.labelAr : set.labelEn}</span>
                            <select
                        value={privacySettings[set.key] || "public"}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setPrivacySettings((prev: any) => ({ ...prev, [set.key]: newVal }));
                          if (playSynthSound) playSynthSound("tap");
                        }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 px-2 py-1 focus:outline-none">
                        
                              <option value="public">{isArabic ? "عام للجميع" : "Public (All)"}</option>
                              <option value="followers">{isArabic ? "المتابعون فقط" : "Followers Only"}</option>
                              <option value="friends">{isArabic ? "الأصدقاء فقط" : "Friends Only"}</option>
                              <option value="me">{isArabic ? "أنا فقط (سري)" : "Me Only (Private)"}</option>
                            </select>
                          </div>
                    )}
                      </div>
                    </div>
                  </div>
              }

                {/* TAB CONTENT: 4. VERIFICATION COMPONENT */}
                {accountSubTab === "verification" &&
              <div className="space-y-6">
                    {/* Verification types info */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">🛡️ {isArabic ? "أنواع شارات التوثيق المتاحة" : "Available Verification Badges"}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="bg-zinc-950 p-3 rounded-xl border border-blue-900/40 text-center">
                          <span className="text-blue-400 block text-sm font-black">✓ Official</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">{isArabic ? "للإدارة الرسمية والمالك" : "For official admins & owners"}</span>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded-xl border border-amber-900/40 text-center">
                          <span className="text-amber-400 block text-sm font-black">🎨 Creator</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">{isArabic ? "لصناع المحتوى والرسامين" : "For artists & content creators"}</span>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded-xl border border-emerald-900/40 text-center">
                          <span className="text-emerald-400 block text-sm font-black">🛡️ Mod Badge</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">{isArabic ? "لفرق الرقابة والإشراف" : "For moderators"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Verification Request Form */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <span className="text-sm">📝</span>
                        <h4 className="text-xs font-black text-white">{isArabic ? "إرسال طلب توثيق رسمي جديد" : "Submit Verification Request"}</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "الاسم الكامل القانوني" : "Legal/Full Name"}</label>
                          <input
                        type="text"
                        value={verifyName}
                        onChange={(e) => setVerifyName(e.target.value)}
                        placeholder={isArabic ? "مثال: أحمد العتيبي" : "e.g. Ahmed Al-Oteibi"}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                      
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "نوع التوثيق المراد" : "Desired Badge Type"}</label>
                          <select
                        value={verifyType}
                        onChange={(e) => setVerifyType(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white">
                        
                            <option value="creator">{isArabic ? "صانع محتوى وفنان (Creator)" : "Artist / Creator"}</option>
                            <option value="vip">{isArabic ? "حساب بارز ومميز (VIP)" : "VIP / Notable Person"}</option>
                            <option value="news">{isArabic ? "ناشر أخبار أنمي موثق" : "Anime News Broadcaster"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "لماذا تريد توثيق حسابك؟" : "Reason for verification"}</label>
                          <textarea
                        rows={3}
                        value={verifyReason}
                        onChange={(e) => setVerifyReason(e.target.value)}
                        placeholder={isArabic ? "اكتب هنا تفاصيل عن أعمالك أو صلة حسابك..." : "Tell us about your work..."}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white resize-none" />
                      
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "روابط تدعم طلبك (موقع، حساب، الخ)" : "Supporting Links (portfolio, social, etc)"}</label>
                          <input
                        type="text"
                        value={verifyLinks}
                        onChange={(e) => setVerifyLinks(e.target.value)}
                        placeholder="e.g. Behance, Instagram, YouTube"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                      
                        </div>

                        <button
                      onClick={() => {
                        if (!verifyName || !verifyReason) {
                          alert(isArabic ? "يرجى تعبئة الحقول الأساسية أولاً!" : "Please fill in the required fields first.");
                          return;
                        }
                        const newReq = {
                          id: `vr_${Date.now()}`,
                          fullName: verifyName,
                          username: currentUser.username,
                          reason: verifyReason,
                          reqType: verifyType,
                          links: verifyLinks,
                          status: "pending",
                          createdAt: new Date().toISOString()
                        };
                        setVerificationRequests((prev) => [newReq, ...prev]);
                        // Clear form
                        setVerifyName("");
                        setVerifyReason("");
                        setVerifyLinks("");
                        if (playSynthSound) playSynthSound("quest_complete");
                        alert(isArabic ? "تم تقديم طلبك بنجاح! سيتم مراجعته بواسطة فريق الرقابة" : "Your request was submitted successfully! The mod team will review it shortly.");
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 rounded-xl transition-all">
                      
                          ✉️ {isArabic ? "إرسال طلب التوثيق للمراجعة" : "Submit Request Package"}
                        </button>
                      </div>
                    </div>

                    {/* Submitted request history tracker */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">⏱️ {isArabic ? "متابعة حالة طلبات التوثيق السابقة" : "Verification Request History Tracker"}</h4>
                      
                      <div className="space-y-2">
                        {verificationRequests.map((req, _autoIdx) =>
                    <div key={`${req.id}_${_autoIdx}`} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-zinc-300">{isArabic ? "طلب توثيق صانع محتوى" : "Creator Verification"}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        req.status === "pending" ? "bg-amber-950/60 text-amber-400 border border-amber-900/50" :
                        req.status === "accepted" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50" :
                        "bg-red-950/60 text-red-400 border border-red-900/50"}`
                        }>
                                {req.status === "pending" ? isArabic ? "قيد الانتظار" : "Pending" :
                          req.status === "accepted" ? isArabic ? "مقبول ✓" : "Accepted ✓" : isArabic ? "مرفوض ✗" : "Rejected ✗"}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-normal">{req.reason}</p>
                            <span className="block text-[8px] text-zinc-600 font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                    )}
                      </div>
                    </div>
                  </div>
              }

                {/* TAB CONTENT: 6. ADVANCED ACCOUNTS, AUTHENTICATION & SECURITY PORTAL (Chapter 6) */}
                {accountSubTab === "security" &&
              <div className="space-y-6">
                    {/* Security Overview Alert */}
                    <div className="bg-gradient-to-r from-red-950/20 via-[#121215] to-zinc-950/40 border border-red-900/30 p-4 rounded-2xl flex items-start gap-3">
                      <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white">{isArabic ? "درع حماية الحسابات الأساسي" : "Essential Account Shielding Active"}</span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          {isArabic ?
                      "جميع كلمات المرور وبيانات الجلسات مشفرة بالكامل على خوادمنا باستخدام بروتوكولات حماية متطورة. يمكنك التحكم في جلساتك النشطة، وتفعيل المصادقة الثنائية 2FA من هنا." :
                      "All passwords, sessions, and logs are encrypted on server-side using modern security protocols. Manage your active sessions, or enable two-factor authentication from below."}
                        </p>
                      </div>
                    </div>

                    {/* Section 6.2 & 6.15: Linked Auth Providers & Integrations */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <Link className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "طرق تسجيل الدخول وربط الحسابات" : "Linked Authentication Providers"}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        {isArabic ?
                    "يمكنك ربط حساب Anime Black الخاص بك بأكثر من مزود خدمة لتسهيل تسجيل الدخول والتعافي الآمن للحساب." :
                    "Connect multiple external sign-in methods to your Anime Black account for secure passwordless entry and easier recovery."}
                      </p>

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                    { id: "email_login", name: "Email Address", icon: Mail, labelAr: "البريد الإلكتروني", labelEn: "Email Login" },
                    { id: "phone", name: "Phone (SMS)", icon: Smartphone, labelAr: "رقم الهاتف", labelEn: "Phone Login" },
                    { id: "google", name: "Google Identity", icon: Globe, labelAr: "حساب Google", labelEn: "Google Sync" },
                    { id: "apple", name: "Apple ID", icon: User, labelAr: "Apple ID", labelEn: "Apple ID Login" }].
                    map((prov, _autoIdx) => {
                      const isLinked = linkedProviders.includes(prov.id);
                      return (
                        <div key={`${prov.id}_${_autoIdx}`} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <prov.icon className={`w-4 h-4 ${isLinked ? "text-emerald-500" : "text-zinc-500"}`} />
                                <div>
                                  <span className="block font-bold text-zinc-300">{isArabic ? prov.labelAr : prov.labelEn}</span>
                                  <span className="block text-[8px] text-zinc-500 font-mono">{prov.name}</span>
                                </div>
                              </div>
                              <button
                            onClick={() => {
                              if (isLinked) {
                                if (linkedProviders.length <= 1) {
                                  alert(isArabic ? "لا يمكنك فك ربط آخر وسيلة دخول متبقية لحسابك!" : "Cannot unlink the last remaining sign-in method!");
                                  return;
                                }
                                if (playSynthSound) playSynthSound("tap");
                                setLinkedProviders((prev) => prev.filter((p) => p !== prov.id));
                                alert(isArabic ? `تم فك ربط ${prov.labelAr} بنجاح` : `Successfully unlinked ${prov.name}`);
                              } else {
                                if (playSynthSound) playSynthSound("success");
                                setLinkedProviders((prev) => [...prev, prov.id]);
                                alert(isArabic ? `تم ربط ومزامنة ${prov.labelAr} بنجاح مع حسابك!` : `Successfully linked ${prov.name} to your profile!`);
                              }
                            }}
                            className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all ${
                            isLinked ?
                            "bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800" :
                            "bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40"}`
                            }>
                            
                                {isLinked ? isArabic ? "فك الربط" : "Unlink" : isArabic ? "ربط الحساب" : "Link"}
                              </button>
                            </div>);

                    })}
                      </div>
                    </div>

                    {/* Section 6.3 & 6.4 & 6.5: Interactive Account Registration & Compliance Testing */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <Fingerprint className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "محاكي إنشاء حساب جديد والتحقق من الشروط" : "Account Creation & Validation Simulator"}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        {isArabic ?
                    "اختبر خوارزمية إنشاء الحسابات؛ حيث يقوم النظام فورياً بفحص سلامة اسم المستخدم ومطابقة قواعد كلمة المرور الصارمة." :
                    "Test the account creation rules. The system instantly validates username constraints and checks password strength real-time."}
                      </p>

                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Display Name */}
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "الاسم الظاهر" : "Display Name"}</label>
                            <input
                          type="text"
                          value={regDisplayName}
                          onChange={(e) => setRegDisplayName(e.target.value)}
                          placeholder={isArabic ? "مثال: لوفي سان" : "e.g. Luffy San"}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                        
                          </div>

                          {/* Username with Live constraint checker (6.4) */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[10px] text-zinc-500">{isArabic ? "اسم المستخدم (Username)" : "Username"}</label>
                              {usernameCheck.msg &&
                          <span className={`text-[8px] font-bold ${
                          usernameCheck.status === "available" ? "text-emerald-400" : "text-red-400"}`
                          }>
                                  {usernameCheck.msg}
                                </span>
                          }
                            </div>
                            <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegUsername(val);
                            if (!val) {
                              setUsernameCheck({ status: "idle", msg: "" });
                              return;
                            }
                            if (val.length < 3 || val.length > 30) {
                              setUsernameCheck({ status: "invalid", msg: isArabic ? "3 إلى 30 حرفاً" : "3-30 characters" });
                              return;
                            }
                            if (!/^[a-zA-Z0-9_.]+$/.test(val)) {
                              setUsernameCheck({ status: "invalid", msg: isArabic ? "أحرف إنجليزية وأرقام ونقطة و _ فقط" : "English chars, numbers, underscore & dots" });
                              return;
                            }
                            if (val.startsWith(".") || val.startsWith("_") || val.endsWith(".") || val.endsWith("_")) {
                              setUsernameCheck({ status: "invalid", msg: isArabic ? "لا تبدأ أو تنتهي بنقطة/شرطة" : "Cannot start or end with symbols" });
                              return;
                            }
                            if (/\s/.test(val)) {
                              setUsernameCheck({ status: "invalid", msg: isArabic ? "لا يجب وجود مسافات" : "No spaces allowed" });
                              return;
                            }
                            const reserved = ["admin", "support", "system", "animeblack"];
                            if (reserved.includes(val.toLowerCase())) {
                              setUsernameCheck({ status: "reserved", msg: isArabic ? "اسم مستخدم محجوز للنظام!" : "Reserved/Forbidden Name!" });
                              return;
                            }
                            setUsernameCheck({ status: "available", msg: isArabic ? "متاح ✓" : "Available ✓" });
                          }}
                          placeholder="e.g. zoro_77"
                          className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-xs text-white font-mono ${
                          usernameCheck.status === "available" ? "border-emerald-500/50" :
                          usernameCheck.status === "invalid" || usernameCheck.status === "reserved" ? "border-red-500/50" : "border-zinc-850"}`
                          } />
                        
                          </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "البريد الإلكتروني" : "Email Address"}</label>
                            <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="otaku@example.com"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                        
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "رقم الهاتف" : "Phone Number"}</label>
                            <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+966 50 123 4567"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                        
                          </div>
                        </div>

                        {/* Password with indicator (6.5) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "كلمة المرور" : "Password"}</label>
                            <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                        
                            {/* Strength indicator bar */}
                            {regPassword &&
                        <div className="mt-1.5 space-y-1">
                                {(() => {
                            const str = (() => {
                              if (regPassword.length < 8) return { score: 1, labelAr: "ضعيفة (يجب 8 أحرف على الأقل) 🔴", labelEn: "Too short (min 8 chars) 🔴", color: "bg-red-500 w-1/4" };
                              let matches = 0;
                              if (/[A-Z]/.test(regPassword)) matches++;
                              if (/[a-z]/.test(regPassword)) matches++;
                              if (/[0-9]/.test(regPassword)) matches++;
                              if (/[^A-Za-z0-9]/.test(regPassword)) matches++;
                              if (matches <= 1) return { score: 2, labelAr: "ضعيفة (ينصح بخلط الحروف والرموز) 🔴", labelEn: "Weak password 🔴", color: "bg-red-500 w-1/2" };
                              if (matches <= 3) return { score: 3, labelAr: "متوسطة 🟡", labelEn: "Medium password 🟡", color: "bg-amber-500 w-3/4" };
                              return { score: 4, labelAr: "قوية جداً ومحمية 🟢", labelEn: "Very Strong 🟢", color: "bg-emerald-500 w-full" };
                            })();
                            return (
                              <>
                                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className={`h-full ${str.color} transition-all duration-300`} />
                                      </div>
                                      <span className="text-[8px] font-bold text-zinc-400 block">
                                        {isArabic ? str.labelAr : str.labelEn}
                                      </span>
                                    </>);

                          })()}
                              </div>
                        }
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                            <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                        
                            {regConfirmPassword && regPassword !== regConfirmPassword &&
                        <span className="text-[8px] font-bold text-red-400 block mt-1">
                                {isArabic ? "⚠️ كلمات المرور غير متطابقة" : "⚠️ Passwords do not match"}
                              </span>
                        }
                          </div>
                        </div>

                        {/* Birth date, Country, Language */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
                            <input
                          type="date"
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2 py-2 text-[10px] text-white" />
                        
                          </div>
                          <div>
                            <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "الدولة" : "Country"}</label>
                            <select
                          value={regCountry}
                          onChange={(e) => setRegCountry(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2 py-2 text-[10px] text-white">
                          
                              <option value="Saudi Arabia">{isArabic ? "السعودية" : "Saudi Arabia"}</option>
                              <option value="Japan">{isArabic ? "اليابان" : "Japan"}</option>
                              <option value="Egypt">{isArabic ? "مصر" : "Egypt"}</option>
                              <option value="UAE">{isArabic ? "الإمارات" : "UAE"}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "اللغة الأساسية" : "Primary Language"}</label>
                            <select
                          value={regLanguage}
                          onChange={(e) => setRegLanguage(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2 py-2 text-[10px] text-white">
                          
                              <option value="Arabic">{isArabic ? "العربية" : "Arabic"}</option>
                              <option value="English">{isArabic ? "الإنجليزية" : "English"}</option>
                              <option value="Japanese">{isArabic ? "اليابانية" : "Japanese"}</option>
                            </select>
                          </div>
                        </div>

                        {/* Consent Checkboxes */}
                        <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                          type="checkbox"
                          checked={regAgreeTerms}
                          onChange={(e) => setRegAgreeTerms(e.target.checked)}
                          className="accent-red-600 rounded" />
                        
                            <span className="text-[9px] text-zinc-400">
                              {isArabic ? "أوافق بالكامل على شروط استخدام منصة أنمي بلاك" : "I agree to Anime Black Terms of Service"}
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                          type="checkbox"
                          checked={regAgreePrivacy}
                          onChange={(e) => setRegAgreePrivacy(e.target.checked)}
                          className="accent-red-600 rounded" />
                        
                            <span className="text-[9px] text-zinc-400">
                              {isArabic ? "أوافق على سياسة الخصوصية وحماية بيانات الهوية" : "I agree to Privacy & Data Protection Policy"}
                            </span>
                          </label>
                        </div>

                        {/* Submit Button */}
                        <button
                      onClick={() => {
                        if (!regDisplayName || !regUsername || !regPassword) {
                          alert(isArabic ? "يرجى تعبئة الاسم واسم المستخدم وكلمة المرور!" : "Please fill in display name, username and password!");
                          return;
                        }
                        if (usernameCheck.status !== "available") {
                          alert(isArabic ? "يرجى اختيار اسم مستخدم متاح وموافق للشروط أولاً!" : "Please choose a valid & available username!");
                          return;
                        }
                        if (regPassword !== regConfirmPassword) {
                          alert(isArabic ? "كلمتا المرور غير متطابقتين!" : "Passwords do not match!");
                          return;
                        }
                        if (!regAgreeTerms || !regAgreePrivacy) {
                          alert(isArabic ? "يجب الموافقة على الشروط وسياسة الخصوصية!" : "You must accept the terms and privacy policies!");
                          return;
                        }

                        if (playSynthSound) playSynthSound("success");

                        // Simulate real database account creation integration
                        const mockUser = {
                          ...currentUser,
                          name: regDisplayName,
                          username: regUsername,
                          email: regEmail || "unregistered@animeblack.com",
                          phone: regPhone || "none",
                          country: regCountry,
                          language: regLanguage,
                          joinedDate: "2026-07-04 (Today)"
                        };
                        setCurrentUser(mockUser);

                        // Append to activity log
                        setActivityLogs((prev) => [
                        {
                          id: `log_reg_${Date.now()}`,
                          actionAr: "إنشاء حساب ومزامنة الهوية",
                          actionEn: "Created account & synced identity",
                          category: "auth",
                          timestamp: new Date().toISOString(),
                          detailsAr: `اسم المستخدم الجديد: @${regUsername}`,
                          detailsEn: `New username registered: @${regUsername}`
                        },
                        ...prev]
                        );

                        alert(isArabic ? `🎉 تهانينا! تم إنشاء حسابك بنجاح ومزامنة الهوية الرقمية لـ @${regUsername}` : `🎉 Success! Account created and synchronized for @${regUsername}`);

                        // Reset form
                        setRegDisplayName("");
                        setRegUsername("");
                        setRegEmail("");
                        setRegPhone("");
                        setRegPassword("");
                        setRegConfirmPassword("");
                        setUsernameCheck({ status: "idle", msg: "" });
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 rounded-xl transition-all">
                      
                          👤 {isArabic ? "إكمال خوارزمية التسجيل والمزامنة" : "Simulate Register & Sync Profile"}
                        </button>
                      </div>
                    </div>

                    {/* Section 6.6 & 6.7: Email & Phone OTP Verification Simulators */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <Key className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "مركز التحقق من وسائل الاتصال (Email & Phone Verification)" : "Email & Phone OTP Verification Center"}</h4>
                      </div>

                      {/* 1. Email Verification (6.6) */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-300">📧 {isArabic ? "التحقق من البريد الإلكتروني" : "Email Verification Portal"}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      emailStep === "verified" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/40" : "bg-amber-950/50 text-amber-400 border border-amber-900/40"}`
                      }>
                            {emailStep === "verified" ? isArabic ? "موثق ✓" : "Verified ✓" : isArabic ? "غير موثق ✗" : "Unverified ✗"}
                          </span>
                        </div>
                        
                        {emailStep === "unverified" &&
                    <div className="space-y-2">
                            <input
                        type="email"
                        value={emailToVerify}
                        onChange={(e) => setEmailToVerify(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                      
                            <button
                        onClick={() => {
                          if (!emailToVerify || !emailToVerify.includes("@")) {
                            alert(isArabic ? "يرجى إدخال بريد إلكتروني صحيح!" : "Please enter a valid email address!");
                            return;
                          }
                          if (playSynthSound) playSynthSound("tap");
                          setEmailStep("sent");
                          setEmailTimer(60);
                          alert(isArabic ? `تم إرسال رابط التحقق إلى ${emailToVerify}!` : `Verification link sent to ${emailToVerify}!`);
                        }}
                        className="w-full bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-[10px] font-black py-1.5 rounded-lg transition-all">
                        
                              ✉️ {isArabic ? "إرسال رسالة التحقق الآن" : "Send Verification Email Link"}
                            </button>
                          </div>
                    }

                        {emailStep === "sent" &&
                    <div className="space-y-2 text-center py-2">
                            <p className="text-[10px] text-zinc-400">
                              {isArabic ?
                        `تم إرسال الرابط بنجاح! تفقد بريدك الوارد لإتمام عملية تفعيل الحساب.` :
                        `Verification link sent to ${emailToVerify}. Check your inbox.`}
                            </p>
                            <div className="flex gap-2">
                              <button
                          onClick={() => {
                            if (playSynthSound) playSynthSound("success");
                            setEmailStep("verified");
                            // Update main email
                            setCurrentUser((prev: any) => ({ ...prev, email: emailToVerify }));
                            alert(isArabic ? "تم تفعيل بريدك الإلكتروني بنجاح!" : "Email verification completed!");
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-1.5 rounded-lg">
                          
                                {isArabic ? "محاكاة الضغط على الرابط" : "Simulate Link Click"}
                              </button>
                              <button
                          disabled={emailTimer > 0}
                          onClick={() => {
                            setEmailTimer(60);
                            alert(isArabic ? "تم إعادة إرسال الرابط!" : "Link resent successfully!");
                          }}
                          className="bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-zinc-300 text-[10px] px-3 rounded-lg">
                          
                                {emailTimer > 0 ? `${emailTimer}s` : isArabic ? "إعادة إرسال" : "Resend"}
                              </button>
                            </div>
                          </div>
                    }

                        {emailStep === "verified" &&
                    <p className="text-[10px] text-zinc-500 italic text-center py-1">
                            {isArabic ? `تم ربط وتوثيق الحساب بـ: ${emailToVerify || currentUser.email}` : `Account fully bound and verified to: ${emailToVerify || currentUser.email}`}
                          </p>
                    }
                      </div>

                      {/* 2. Phone Verification with limited OTP attempts (6.7) */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-300">📱 {isArabic ? "التحقق من رقم الهاتف" : "Phone OTP Verification Portal"}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      phoneStep === "verified" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/40" : "bg-amber-950/50 text-amber-400 border border-amber-900/40"}`
                      }>
                            {phoneStep === "verified" ? isArabic ? "موثق ✓" : "Verified ✓" : isArabic ? "غير موثق ✗" : "Unverified ✗"}
                          </span>
                        </div>

                        {phoneStep === "unverified" &&
                    <div className="space-y-2">
                            <input
                        type="text"
                        value={phoneToVerify}
                        onChange={(e) => setPhoneToVerify(e.target.value)}
                        placeholder="e.g. +966555555555"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono" />
                      
                            <button
                        onClick={() => {
                          if (!phoneToVerify || phoneToVerify.length < 8) {
                            alert(isArabic ? "يرجى إدخال رقم هاتف صحيح!" : "Please enter a valid phone number!");
                            return;
                          }
                          if (playSynthSound) playSynthSound("tap");
                          setPhoneStep("otp");
                          setPhoneTimer(60);
                          setPhoneAttempts(3);
                          alert(isArabic ? "تم إرسال رمز OTP [1234] عبر SMS تجريبياً!" : "Simulated OTP code [1234] sent via SMS!");
                        }}
                        className="w-full bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-[10px] font-black py-1.5 rounded-lg transition-all">
                        
                              📲 {isArabic ? "إرسال رمز التحقق OTP" : "Send SMS OTP Code"}
                            </button>
                          </div>
                    }

                        {phoneStep === "otp" &&
                    <div className="space-y-2.5">
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>{isArabic ? "أدخل الرمز المكون من 4 أرقام [1234]:" : "Enter 4-digit code [1234]:"}</span>
                              <span className="font-mono text-red-400">{isArabic ? `المحاولات المتبقية: ${phoneAttempts}` : `Attempts left: ${phoneAttempts}`}</span>
                            </div>
                            <input
                        type="text"
                        value={phoneOtp}
                        maxLength={4}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-center text-sm tracking-widest text-white font-mono" />
                      
                            <div className="flex gap-2">
                              <button
                          onClick={() => {
                            if (phoneOtp === "1234") {
                              if (playSynthSound) playSynthSound("success");
                              setPhoneStep("verified");
                              // Update phone
                              setCurrentUser((prev: any) => ({ ...prev, phone: phoneToVerify }));
                              alert(isArabic ? "تم تفعيل وتأكيد رقم هاتفك بنجاح!" : "Phone verification successful!");
                            } else {
                              if (playSynthSound) playSynthSound("error");
                              const nextAtt = phoneAttempts - 1;
                              setPhoneAttempts(nextAtt);
                              if (nextAtt <= 0) {
                                setPhoneStep("unverified");
                                alert(isArabic ? "نفذت المحاولات! تم إغلاق الرمز." : "No attempts left! Request blocked.");
                              } else {
                                alert(isArabic ? "رمز غير صحيح! حاول مجدداً." : "Incorrect OTP code. Try again.");
                              }
                            }
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-1.5 rounded-lg">
                          
                                {isArabic ? "تأكيد الرمز" : "Verify Code"}
                              </button>
                              <button
                          disabled={phoneTimer > 0}
                          onClick={() => {
                            setPhoneTimer(60);
                            setPhoneAttempts(3);
                            alert(isArabic ? "تم إعادة إرسال الرمز!" : "Resent SMS OTP!");
                          }}
                          className="bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-zinc-300 text-[10px] px-3 rounded-lg">
                          
                                {phoneTimer > 0 ? `${phoneTimer}s` : isArabic ? "إعادة إرسال" : "Resend"}
                              </button>
                            </div>
                          </div>
                    }

                        {phoneStep === "verified" &&
                    <p className="text-[10px] text-zinc-500 italic text-center py-1">
                            {isArabic ? `تم تفعيل وتوثيق هاتفك: ${phoneToVerify || currentUser.phone}` : `Phone verified: ${phoneToVerify || currentUser.phone}`}
                          </p>
                    }
                      </div>
                    </div>

                    {/* Section 6.8 & 6.14: Log In Simulator with Progressive Lockout */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <Key className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "لوحة تسجيل الدخول ومحاكاة محاولات الاختراق" : "Secure Sign In & Attack Defender Hub"}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        {isArabic ?
                    "حماية القوة الغاشمة (Brute Force Protection): عند إدخال كلمة مرور خاطئة لـ 3 مرات متتالية، يقوم درع الأمان بإقفال الحساب مؤقتاً لصد الهجوم." :
                    "Brute Force Mitigation: Entering incorrect passwords 3 consecutive times triggers a security lockout with a progressive cooldown."}
                      </p>

                      <div className="space-y-3">
                        {/* Cooldown Lockout Panel */}
                        {lockoutTimer > 0 ?
                    <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl text-center space-y-2">
                            <AlertTriangle className="w-6 h-6 text-red-500 mx-auto animate-bounce" />
                            <span className="block text-xs font-black text-white">
                              {isArabic ? "تم إقفال تسجيل الدخول مؤقتاً" : "Sign In Portal Locked Temporarily"}
                            </span>
                            <p className="text-[10px] text-zinc-400">
                              {isArabic ?
                        `السبب: كشف سلوك مريب ومحاولات دخول متكررة فاشلة. يرجى الانتظار لإعادة المحاولة.` :
                        `Reason: Excessive failed authentication attempts. Please wait for the lockout timer to release.`}
                            </p>
                            <div className="text-lg font-black font-mono text-red-500">
                              {lockoutTimer}s
                            </div>
                          </div> :

                    <div className="space-y-3.5">
                            {/* Method Selector */}
                            <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-[10px]">
                              {["username", "email", "phone"].map((m, _autoIdx) =>
                        <button
                          key={`${m}_${_autoIdx}`}
                          onClick={() => setLoginMethod(m as any)}
                          className={`flex-1 py-1 text-center font-bold rounded ${
                          loginMethod === m ? "bg-zinc-850 text-white font-black" : "text-zinc-500"}`
                          }>
                          
                                  {m === "username" ? isArabic ? "اسم المستخدم" : "Username" :
                          m === "email" ? isArabic ? "البريد" : "Email" : isArabic ? "الهاتف" : "Phone"}
                                </button>
                        )}
                            </div>

                            {/* Inputs */}
                            <div className="space-y-2">
                              <input
                          type="text"
                          value={loginUser}
                          onChange={(e) => setLoginUser(e.target.value)}
                          placeholder={
                          loginMethod === "username" ? "e.g. zoro_77" :
                          loginMethod === "email" ? "e.g. zoro@gmail.com" : "e.g. +96655555555"
                          }
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono" />
                        
                              <input
                          type="password"
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                        
                            </div>

                            {/* Remember Me */}
                            <div className="flex justify-between items-center">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                            type="checkbox"
                            checked={loginRemember}
                            onChange={(e) => setLoginRemember(e.target.checked)}
                            className="accent-red-600 rounded" />
                          
                                <span className="text-[10px] text-zinc-400">{isArabic ? "تذكرني على هذا الجهاز" : "Remember me on this device"}</span>
                              </label>
                              <button
                          onClick={() => {
                            setRecoveryStep("input");
                            alert(isArabic ? "تم فتح بوابة الاسترداد الآمنة بالأسفل!" : "Secure account recovery portal opened below!");
                          }}
                          className="text-[10px] text-red-400 hover:underline">
                          
                                {isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                          onClick={() => {
                            if (!loginUser || !loginPass) {
                              alert(isArabic ? "يرجى كتابة اسم الحساب وكلمة المرور!" : "Please fill in all details first.");
                              return;
                            }
                            // Check correct password
                            const matches = loginPass === "correct_pass123";
                            if (matches) {
                              if (playSynthSound) playSynthSound("success");
                              setFailedLoginAttempts(0);
                              alert(isArabic ? "✓ تم الدخول بنجاح ومطابقة مفاتيح الأمان!" : "✓ Signed in successfully! Credentials approved.");
                            } else {
                              if (playSynthSound) playSynthSound("error");
                              const nextFailed = failedLoginAttempts + 1;
                              setFailedLoginAttempts(nextFailed);

                              // Log to security
                              setSecurityLogs((prev) => [
                              {
                                id: `failed_login_${Date.now()}`,
                                actionAr: `محاولة تسجيل دخول فاشلة (${nextFailed}/3)`,
                                actionEn: `Failed login attempt (${nextFailed}/3)`,
                                type: "brute",
                                time: "Just now",
                                ip: "102.82.45.19",
                                suspicious: true
                              },
                              ...prev]
                              );

                              if (nextFailed >= 3) {
                                setLockoutTimer(30); // 30 seconds delay
                                setFailedLoginAttempts(0);
                                alert(isArabic ? "🚨 تم إغلاق الحساب لـ 30 ثانية بسبب سلوك مريب!" : "🚨 Lockout triggered! Sign in blocked for 30s.");
                              } else {
                                alert(
                                  isArabic ?
                                  `❌ كلمة المرور خاطئة! المحاولة (${nextFailed}/3) - استخدام كلمة المرور التجريبية: [correct_pass123]` :
                                  `❌ Invalid password! Attempt (${nextFailed}/3) - Try mock password: [correct_pass123]`
                                );
                              }
                            }
                          }}
                          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black text-xs py-2 rounded-xl border border-zinc-800 transition-all">
                          
                                🔑 {isArabic ? "تسجيل دخول آمن" : "Secure Sign In"}
                              </button>
                              
                              <button
                          onClick={() => {
                            // Force fail to test lockout
                            setLoginUser("attacker_otaku");
                            setLoginPass("wrong_password");
                            alert(isArabic ? "تم كتابة كلمة مرور خاطئة تلقائياً لاختبار الحماية!" : "Mock attack credentials populated. Click Sign In to test lockout!");
                          }}
                          className="bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-[10px] px-3 rounded-xl">
                          
                                💥 {isArabic ? "تجربة اختراق" : "Simulate Brute Force"}
                              </button>
                            </div>
                          </div>
                    }
                      </div>
                    </div>

                    {/* Section 6.9 & 6.10: Account Recovery Flow Portal */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <RefreshCw className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "مركز استرداد الحسابات وتعطيل الروابط" : "Self-Service Account Recovery Engine"}</h4>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                        {recoveryStep === "input" &&
                    <div className="space-y-2">
                            <span className="text-[10px] text-zinc-500 block">
                              {isArabic ? "أدخل البريد أو رقم الهاتف المسجل لتلقي رمز استرداد مؤقت:" : "Enter your registered email or phone to receive a transient verification OTP:"}
                            </span>
                            <input
                        type="text"
                        value={recoveryInput}
                        onChange={(e) => setRecoveryInput(e.target.value)}
                        placeholder="e.g. luffy@onepiece.com"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                      
                            <button
                        onClick={() => {
                          if (!recoveryInput) {
                            alert(isArabic ? "يرجى ملء الحقل أولاً!" : "Please fill in field first.");
                            return;
                          }
                          if (playSynthSound) playSynthSound("tap");
                          setRecoveryStep("otp");
                          alert(isArabic ? "تم إرسال رمز الاسترداد المؤقت [7788] بنجاح!" : "Transient recovery OTP [7788] dispatched!");
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-1.5 rounded-lg transition-all">
                        
                              📧 {isArabic ? "إرسال رمز التعافي" : "Disptach Recovery Code"}
                            </button>
                          </div>
                    }

                        {recoveryStep === "otp" &&
                    <div className="space-y-2">
                            <span className="text-[10px] text-zinc-500 block">
                              {isArabic ? "أدخل رمز التعافي المكون من 4 أرقام [7788]:" : "Enter 4-digit recovery code [7788]:"}
                            </span>
                            <input
                        type="text"
                        value={recoveryOtpInput}
                        maxLength={4}
                        onChange={(e) => setRecoveryOtpInput(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-center text-xs text-white font-mono tracking-widest" />
                      
                            <button
                        onClick={() => {
                          if (recoveryOtpInput === "7788") {
                            if (playSynthSound) playSynthSound("success");
                            setRecoveryStep("new_password");
                            alert(isArabic ? "تم التحقق وصلاحية الرمز سليمة! قم بكتابة كلمة مرور جديدة." : "OTP code authorized! Please supply your new credentials.");
                          } else {
                            if (playSynthSound) playSynthSound("error");
                            alert(isArabic ? "الرمز خاطئ أو انتهت صلاحيته!" : "Invalid or expired recovery code!");
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-1.5 rounded-lg transition-all">
                        
                              ✓ {isArabic ? "تأكيد والتحقق" : "Confirm Code Verification"}
                            </button>
                          </div>
                    }

                        {recoveryStep === "new_password" &&
                    <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "كلمة المرور الجديدة" : "New Secure Password"}</label>
                              <input
                          type="password"
                          value={recoveryNewPass}
                          onChange={(e) => setRecoveryNewPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                        
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label>
                              <input
                          type="password"
                          value={recoveryNewPassConfirm}
                          onChange={(e) => setRecoveryNewPassConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                        
                            </div>

                            <button
                        onClick={() => {
                          if (recoveryNewPass.length < 8) {
                            alert(isArabic ? "يجب ألا تقل كلمة المرور عن 8 أحرف!" : "Password must be at least 8 characters!");
                            return;
                          }
                          if (recoveryNewPass !== recoveryNewPassConfirm) {
                            alert(isArabic ? "كلمتا المرور غير متطابقتين!" : "Passwords do not match!");
                            return;
                          }
                          if (pastPasswords.includes(recoveryNewPass)) {
                            alert(isArabic ? "❌ أمان الحساب: لا يمكنك إعادة استخدام كلمات المرور السابقة!" : "❌ Security Rule: You cannot reuse past passwords!");
                            return;
                          }

                          if (playSynthSound) playSynthSound("success");
                          setPastPasswords((prev) => [recoveryNewPass, ...prev]);
                          setRecoveryStep("done");
                          alert(isArabic ? "🎉 تم إعادة تعيين كلمة مرورك بنجاح!" : "🎉 Password reset accomplished!");
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-1.5 rounded-lg transition-all">
                        
                              💾 {isArabic ? "حفظ وتعديل كلمة المرور" : "Apply Password Change"}
                            </button>
                          </div>
                    }

                        {recoveryStep === "done" &&
                    <div className="text-center py-2 space-y-2">
                            <span className="text-emerald-400 block text-xs font-black">✓ {isArabic ? "تم استرداد الحساب بنجاح" : "Account Recovered Successfully"}</span>
                            <button
                        onClick={() => setRecoveryStep("input")}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[9px] px-3 py-1 rounded">
                        
                              {isArabic ? "إعادة التجربة" : "Restart recovery flow"}
                            </button>
                          </div>
                    }
                      </div>
                    </div>

                    {/* Section 6.11 & 6.12: Session Management & Trusted Devices */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-zinc-400" />
                          <h4 className="text-xs font-black text-white">{isArabic ? "إدارة الجلسات والأجهزة الموثوقة" : "Active Devices & Session Audit"}</h4>
                        </div>
                        <button
                      onClick={() => {
                        if (playSynthSound) playSynthSound("tap");
                        setActiveSessions((prev) => prev.filter((s) => s.current));
                        alert(isArabic ? "تم تسجيل الخروج وإلغاء صلاحية جميع الجلسات والأجهزة الأخرى!" : "Logged out of all other active sessions successfully!");
                      }}
                      className="text-[9px] text-red-400 font-bold hover:underline">
                      
                          🚪 {isArabic ? "إنهاء كل الجلسات الأخرى" : "Logout of other devices"}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        {isArabic ?
                    "تفقد الأجهزة والجلسات النشطة بحسابك الآن. الأجهزة الموثوقة لا تطالبك برمز OTP عند تسجيل الدخول مجدداً." :
                    "Review browser tabs and systems currently authenticated. Trusted devices bypass standard login challenge thresholds."}
                      </p>

                      <div className="space-y-2">
                        {activeSessions.map((sess, _autoIdx) =>
                    <div key={`${sess.id}_${_autoIdx}`} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-850">
                                <Laptop className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-zinc-200">{sess.device}</span>
                                  {sess.current &&
                            <span className="bg-emerald-950 text-emerald-400 text-[8px] font-black px-1.5 py-0.2 rounded">
                                      {isArabic ? "الجلسة الحالية" : "Current Session"}
                                    </span>
                            }
                                </div>
                                <span className="block text-[9px] text-zinc-500">
                                  {sess.os} • {sess.location} • {sess.loginTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Trust device toggle */}
                              <button
                          onClick={() => {
                            if (sess.isTrusted) {
                              const confirmRemove = confirm(isArabic ? "إزالة الثقة عن هذا الجهاز ستجبرك على التحقق مجدداً بالرمز، هل أنت متأكد؟" : "Removing trust from this device prompts OTP on next sign-in. Are you sure?");
                              if (confirmRemove) {
                                setActiveSessions((prev) =>
                                prev.map((s, _autoIdx) => s.id === sess.id ? { ...s, isTrusted: false } : s)
                                );
                                if (playSynthSound) playSynthSound("tap");
                              }
                            } else {
                              setActiveSessions((prev) =>
                              prev.map((s, _autoIdx) => s.id === sess.id ? { ...s, isTrusted: true } : s)
                              );
                              if (playSynthSound) playSynthSound("success");
                              alert(isArabic ? "تم وضع علامة جهاز موثوق ✓" : "Marked device as trusted ✓");
                            }
                          }}
                          className={`text-[8px] font-black px-2 py-1 rounded border transition-all ${
                          sess.isTrusted ?
                          "bg-emerald-950/30 text-emerald-400 border-emerald-900/40" :
                          "bg-zinc-900 text-zinc-500 border-zinc-850"}`
                          }>
                          
                                {sess.isTrusted ? isArabic ? "✓ جهاز موثوق" : "✓ Trusted" : isArabic ? "اعتباره موثوقاً" : "Trust Device"}
                              </button>

                              {!sess.current &&
                        <button
                          onClick={() => {
                            if (playSynthSound) playSynthSound("tap");
                            setActiveSessions((prev) => prev.filter((s) => s.id !== sess.id));
                            alert(isArabic ? "تم سحب الترخيص وتسجيل الخروج فورياً من ذلك الجهاز!" : "Session terminated instantly on server-side!");
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors">
                          
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                        }
                            </div>
                          </div>
                    )}
                      </div>
                    </div>

                    {/* Section 6.13: Multi-Factor Authentication (2FA) Setup Panel */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-zinc-400" />
                          <h4 className="text-xs font-black text-white">{isArabic ? "المصادقة متعددة العوامل (2FA)" : "Two-Factor Authentication (2FA)"}</h4>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    twoFactorEnabled ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-zinc-950 text-zinc-500 border border-zinc-900"}`
                    }>
                          {twoFactorEnabled ? isArabic ? "مفعلة" : "Active" : isArabic ? "معطلة" : "Disabled"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                          <div>
                            <span className="font-bold text-zinc-300 block">{isArabic ? "حماية الحساب برمز تحقق إضافي" : "Enforce Multi-Factor Authenticator"}</span>
                            <span className="text-[8px] text-zinc-500 block">{isArabic ? "يتطلب رمزاً مؤقتاً من هاتف موثق أو بريد إلكتروني عند تسجيل الدخول." : "Require unique security token upon logging in."}</span>
                          </div>
                          <button
                        onClick={() => {
                          if (twoFactorEnabled) {
                            setTwoFactorEnabled(false);
                            setTwoFactorStep("idle");
                            if (playSynthSound) playSynthSound("tap");
                            alert(isArabic ? "تم تعطيل المصادقة ثنائية العوامل بنجاح!" : "Two-Factor Authentication deactivated.");
                          } else {
                            setTwoFactorStep("setup");
                            if (playSynthSound) playSynthSound("tap");
                          }
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                        twoFactorEnabled || twoFactorStep === "setup" ? "bg-emerald-600 flex justify-end" : "bg-zinc-800 flex justify-start"}`
                        }>
                        
                            <span className="w-4 h-4 bg-white rounded-full block shadow" />
                          </button>
                        </div>

                        {/* Step-by-step Setup Wizard */}
                        {twoFactorStep === "setup" &&
                    <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-3 text-xs">
                            <span className="block font-black text-zinc-300 border-b border-zinc-900 pb-1.5">
                              ⚙️ {isArabic ? "إعداد مفتاح المصادقة الثنائية" : "Authenticator Wizard Setup"}
                            </span>
                            
                            <div className="grid grid-cols-3 gap-2">
                              {[
                        { id: "authenticator", icon: Laptop, labelAr: "تطبيق مصادقة", labelEn: "Auth App" },
                        { id: "email", icon: Mail, labelAr: "كود بريد", labelEn: "Email OTP" },
                        { id: "sms", icon: Smartphone, labelAr: "SMS OTP", labelEn: "SMS OTP" }].
                        map((t, _autoIdx) =>
                        <button
                          key={`${t.id}_${_autoIdx}`}
                          onClick={() => setTwoFactorType(t.id as any)}
                          className={`p-2 rounded-lg border text-center font-bold text-[10px] transition-all ${
                          twoFactorType === t.id ?
                          "bg-red-950/40 border-red-500 text-red-400" :
                          "bg-zinc-900 border-zinc-850 text-zinc-400"}`
                          }>
                          
                                  <t.icon className="w-3.5 h-3.5 mx-auto mb-1" />
                                  <span>{isArabic ? t.labelAr : t.labelEn}</span>
                                </button>
                        )}
                            </div>

                            {/* App Specific QR Display */}
                            {twoFactorType === "authenticator" ?
                      <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 text-center space-y-2">
                                <QrCode className="w-16 h-16 text-white mx-auto" />
                                <span className="block font-mono text-[9px] text-zinc-500">
                                  Secret: <span className="text-amber-400 font-bold">{twoFactorSecretKey}</span>
                                </span>
                                <p className="text-[9px] text-zinc-400 leading-normal">
                                  {isArabic ?
                          "امسح كود الـ QR أعلاه باستخدام Google Authenticator أو أدخل المفتاح السري يدوياً." :
                          "Scan the barcode or specify the alphanumeric seed in Google Authenticator app."}
                                </p>
                              </div> :

                      <div className="text-center py-2 text-[10px] text-zinc-400 leading-normal">
                                {twoFactorType === "email" ?
                        isArabic ? "سنقوم بإرسال كود التحقق المكون من 6 أرقام إلى بريدك الموثق عند الدخول." : "A unique 6-digit passcode will be emailed to your authenticated inbox." :

                        isArabic ? "سنرسل رسالة SMS آمنة تحتوي الكود لهاتفك المسجل عند كل محاولة دخول." : "Secure verification SMS will be dispatched to your phone number."
                        }
                              </div>
                      }

                            {/* Verification Code Gate */}
                            <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                              <label className="block text-[10px] text-zinc-500">{isArabic ? "أدخل الرمز التأكيدي [1122]:" : "Enter verification passcode [1122]:"}</label>
                              <input
                          type="text"
                          value={twoFactorOtp}
                          onChange={(e) => setTwoFactorOtp(e.target.value)}
                          placeholder="e.g. 1122"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-center text-xs text-white font-mono" />
                        
                            </div>

                            <div className="flex gap-2">
                              <button
                          onClick={() => {
                            if (twoFactorOtp === "1122") {
                              if (playSynthSound) playSynthSound("success");
                              setTwoFactorEnabled(true);
                              setTwoFactorStep("verified");
                              setTwoFactorOtp("");
                              alert(isArabic ? "✓ تم تفعيل المصادقة الثنائية 2FA بنجاح بحسابك!" : "✓ Two-Factor Authentication validated & enabled!");
                            } else {
                              if (playSynthSound) playSynthSound("error");
                              alert(isArabic ? "الرمز التأكيدي غير صحيح!" : "Invalid verification code!");
                            }
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 rounded-lg text-[10px]">
                          
                                {isArabic ? "تأكيد وتنشيط 2FA" : "Activate & Enforce"}
                              </button>
                              <button
                          onClick={() => {
                            setTwoFactorStep("idle");
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold px-3 py-1.5 rounded-lg text-[10px]">
                          
                                {isArabic ? "إلغاء" : "Cancel"}
                              </button>
                            </div>
                          </div>
                    }
                      </div>
                    </div>

                    {/* Section 6.16 & 6.17 & 6.18: Account Management, Deactivation & 30-Day Deletion Grace Period */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-black text-white">{isArabic ? "تعديل بيانات الهوية وإلغاء/حذف الحساب" : "Account Lifespan & Settings"}</h4>
                      </div>

                      {/* Modify Profile Fields */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "الاسم الظاهر الحالي" : "Display Name"}</label>
                            <input
                          type="text"
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                        
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "اسم المستخدم الفريد" : "Username"}</label>
                            <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono" />
                        
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "البريد الإلكتروني المربوط" : "Email"}</label>
                            <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white" />
                        
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "رقم الهاتف المربوط" : "Phone"}</label>
                            <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono" />
                        
                          </div>
                        </div>

                        <button
                      onClick={() => {
                        if (!editDisplayName || !editUsername) {
                          alert(isArabic ? "الاسم واسم المستخدم لا يمكن تركهما فارغين!" : "Display name and username are required fields!");
                          return;
                        }
                        if (playSynthSound) playSynthSound("success");

                        setCurrentUser((prev: any) => ({
                          ...prev,
                          name: editDisplayName,
                          username: editUsername,
                          email: editEmail,
                          phone: editPhone
                        }));

                        // Append to activity log
                        setActivityLogs((prev) => [
                        {
                          id: `edit_profile_${Date.now()}`,
                          actionAr: "تحديث البيانات الحسابية",
                          actionEn: "Updated personal profile settings",
                          category: "profile",
                          timestamp: new Date().toISOString(),
                          detailsAr: `تم تحديث البروفايل لـ @${editUsername}`,
                          detailsEn: `Profile modified for @${editUsername}`
                        },
                        ...prev]
                        );

                        alert(isArabic ? "✓ تم حفظ وتحديث بيانات حسابك وتطبيق التغييرات فورياً!" : "✓ Settings applied and database records synchronized successfully!");
                      }}
                      className="w-full bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/50 text-[10px] font-black py-2 rounded-xl transition-all">
                      
                          💾 {isArabic ? "تطبيق وحفظ التغييرات" : "Save Synchronized Changes"}
                        </button>
                      </div>

                      {/* Deactivation & 30-day deletion grace period */}
                      <div className="pt-3 border-t border-zinc-900 space-y-3">
                        <span className="text-[10px] font-black text-red-400 block uppercase tracking-wider">{isArabic ? "خيارات التجميد والإلغاء الحساسة" : "Deactivation & Permanent Deletion Portal"}</span>
                        
                        <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                          <div>
                            <span className="text-xs font-bold text-zinc-300 block">{isArabic ? "تعطيل وتجميد الحساب مؤقتاً" : "Temporarily Deactivate Profile"}</span>
                            <span className="text-[8px] text-zinc-500 block">
                              {isArabic ? "يقوم بإخفاء ملفك الشخصي بالبحث وإيقاف الإشعارات لحين عودتك." : "Hides your public identity in wiki, chats and mutes all incoming alerts."}
                            </span>
                          </div>
                          <button
                        onClick={() => {
                          const nextState = !isDeactivated;
                          setIsDeactivated(nextState);
                          if (playSynthSound) playSynthSound("tap");
                          if (nextState) {
                            alert(isArabic ? "تم تجميد حسابك بنجاح وإخفاء بروفايلك من المنصة!" : "Account temporarily deactivated. Profile is hidden.");
                          } else {
                            alert(isArabic ? "مرحباً بعودتك! تم إلغاء تجميد الحساب بنجاح." : "Welcome back! Account reactivated.");
                          }
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                        isDeactivated ? "bg-amber-600 flex justify-end" : "bg-zinc-800 flex justify-start"}`
                        }>
                        
                            <span className="w-4 h-4 bg-white rounded-full block shadow" />
                          </button>
                        </div>

                        {/* Permanent deletion with 30-day grace (6.17, 6.18) */}
                        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-2">
                          <span className="text-xs font-bold text-zinc-300 block">🗑️ {isArabic ? "حذف الحساب نهائياً (مع مهلة 30 يوماً)" : "Delete Account Permanently"}</span>
                          <p className="text-[9px] text-zinc-500 leading-normal">
                            {isArabic ?
                        "قوانين الأوتوكو وحماية الخصوصية: عند طلب الحذف، نمنحك مهلة 30 يوماً للتراجع واستعادة حسابك وبياناتك بالكامل قبل الحذف والمسح التام." :
                        "Account Deletion Policy: Your identity, logs, achievements, and assets are retained for a 30-day grace period. You can revoke deletion any time within 30 days."}
                          </p>

                          {deletionDaysLeft !== null ?
                      <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-center space-y-2">
                              <span className="block text-xs font-bold text-red-400">
                                {isArabic ?
                          `🚨 الحساب مجدول للحذف النهائي بعد: ${deletionDaysLeft} يوماً` :
                          `🚨 Profile scheduled for termination in: ${deletionDaysLeft} days`}
                              </span>
                              <button
                          onClick={() => {
                            if (playSynthSound) playSynthSound("success");
                            setDeletionDaysLeft(null);
                            alert(isArabic ? "تم إلغاء طلب الحذف بنجاح! حسابك آمن." : "Deletion request cancelled! Your account is safe.");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black px-3 py-1 rounded-lg transition-all">
                          
                                {isArabic ? "إلغاء الحذف وحماية البيانات" : "Abort Deletion & Retain Data"}
                              </button>
                            </div> :

                      <button
                        onClick={() => {
                          const confirmDelete = confirm(isArabic ? "أنت على وشك جدولة حسابك لحذف نهائي وبدء مهلة الـ 30 يوماً، هل أنت متأكد؟" : "You are about to queue your profile for permanent deletion. Confirm?");
                          if (confirmDelete) {
                            if (playSynthSound) playSynthSound("error");
                            setDeletionDaysLeft(30);
                            alert(isArabic ? "تمت جدولة حسابك للحذف وبدء مهلة 30 يوماً بنجاح!" : "Account queue for deletion initialized with 30-day grace period.");
                          }
                        }}
                        className="w-full bg-red-950 text-red-400 border border-red-900/40 font-black text-[10px] py-1.5 rounded-lg transition-all">
                        
                              ⚠️ {isArabic ? "حذف حسابي والبدء بالعد التنازلي للـ 30 يوم" : "Queue My Account for Permanent Deletion"}
                            </button>
                      }
                        </div>
                      </div>
                    </div>

                    {/* Section 6.19: Complete Security Audit Logs */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <h4 className="text-xs font-black text-white">📜 {isArabic ? "سجل الأحداث الأمنية ومحاولات الوصول" : "Security Actions & Access Audit Log"}</h4>
                        <span className="bg-zinc-950 border border-zinc-850 font-mono text-[8px] text-zinc-500 px-2 py-0.5 rounded">
                          Total: {securityLogs.length}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {securityLogs.map((log, _autoIdx) =>
                    <div key={`${log.id}_${_autoIdx}`} className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    log.suspicious ?
                    "bg-red-950/20 border-red-900/30 shadow-[0_0_8px_rgba(239,68,68,0.05)]" :
                    "bg-zinc-950 border-zinc-900"}`
                    }>
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-black font-mono uppercase ${log.suspicious ? "text-red-400" : "text-zinc-500"}`}>
                                {log.type} {log.suspicious && "⚠️ UNUSUAL"}
                              </span>
                              <span className="text-[8px] text-zinc-600 font-mono">{log.time}</span>
                            </div>

                            <span className="block font-bold text-zinc-300">{isArabic ? log.actionAr : log.actionEn}</span>
                            
                            <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900 text-[8px] text-zinc-500">
                              <span className="font-mono">IP: {log.ip}</span>
                              <button
                          onClick={() => {
                            if (playSynthSound) playSynthSound("success");
                            alert(isArabic ? "✓ تم تقديم بلاغ رقابي أمني عن هذا النشاط، جاري التحقق بواسطة فريق الإشراف." : "✓ Reported successfully. Security administrators will audit this action!");
                          }}
                          className="text-red-400 hover:underline font-bold">
                          
                                {isArabic ? "الإبلاغ كنشاط غير معروف" : "Report as suspicious"}
                              </button>
                            </div>
                          </div>
                    )}
                      </div>
                    </div>
                  </div>
              }

                {/* TAB CONTENT: 5. FILTERABLE ACTIVITY AUDIT LOG */}
                {accountSubTab === "activity" &&
              <div className="space-y-6">
                    {/* Filter and Search Bar */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-2.5" />
                          <input
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder={isArabic ? "ابحث في سجل النشاط..." : "Search activity logs..."}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white" />
                      
                        </div>
                        <select
                      value={logCategoryFilter}
                      onChange={(e) => setLogCategoryFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white">
                      
                          <option value="all">{isArabic ? "كل الفئات" : "All Categories"}</option>
                          <option value="auth">{isArabic ? "الدخول والأمان" : "Security & Auth"}</option>
                          <option value="profile">{isArabic ? "تعديل الهوية" : "Profile Updates"}</option>
                          <option value="economy">{isArabic ? "المتجر والمال" : "Economy"}</option>
                          <option value="moderation">{isArabic ? "الرقابة والنظام" : "Moderation"}</option>
                        </select>
                      </div>
                    </div>

                    {/* Table list of logs */}
                    <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-white">📜 {isArabic ? "سجل نشاط الهوية" : "Identity Activity Audit Log"}</h4>
                      
                      <div className="space-y-2">
                        {activityLogs.
                    filter((log) => {
                      const nameMatch = isArabic ?
                      log.actionAr.toLowerCase().includes(logSearchQuery.toLowerCase()) :
                      log.actionEn.toLowerCase().includes(logSearchQuery.toLowerCase());
                      const catMatch = logCategoryFilter === "all" || log.category === logCategoryFilter;
                      return nameMatch && catMatch;
                    }).
                    map((log, _autoIdx) =>
                    <div key={`${log.id}_${_autoIdx}`} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex justify-between items-start gap-3">
                              <div className="space-y-1">
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        log.category === "auth" ? "bg-blue-950 text-blue-400 border border-blue-900/40" :
                        log.category === "profile" ? "bg-purple-950 text-purple-400 border border-purple-900/40" :
                        log.category === "economy" ? "bg-amber-950 text-amber-400 border border-amber-900/40" :
                        "bg-emerald-950 text-emerald-400 border border-emerald-900/40"}`
                        }>
                                  {log.category}
                                </span>
                                <span className="block text-xs font-bold text-zinc-300 mt-1">{isArabic ? log.actionAr : log.actionEn}</span>
                                <p className="text-[10px] text-zinc-500">{isArabic ? log.detailsAr : log.detailsEn}</p>
                              </div>
                              <span className="text-[9px] text-zinc-600 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                    )}
                      </div>
                    </div>
                  </div>
              }
              </div>
            }

            {/* CATEGORY 2: COMMUNITY & GUILDS */}
            {activeCategory === "community" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{isArabic ? "النقابات والمجموعات وعشائر الأوتوكو" : "Anime Guilds & Clans Alliance"}</span>
                </h3>

                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {isArabic ?
                "انضم لنقابة معينة للمشاركة في التحديات والحروب الأسبوعية وحصد جوائز من عملة Black Coin الإضافية!" :
                "Join an anime guild to participate in weekly challenges, wars, and claim premium coin awards!"}
                </p>

                {/* Guilds List Card */}
                <div className="space-y-3">
                  {guilds.map((g, _autoIdx) =>
                <div key={`${g.id}_${_autoIdx}`} className="bg-[#121215] border border-zinc-850 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-red-600/10 border border-red-500/30 rounded-lg flex items-center justify-center text-red-500 text-xs font-bold">
                            ⚔️
                          </div>
                          <span className="text-xs font-black text-white">{isArabic ? g.nameAr : g.nameEn}</span>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">{g.members} {isArabic ? "محارب" : "members"}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{isArabic ? g.bio : g.bio}</p>
                      </div>

                      <button
                    onClick={() => handleJoinGuild(g.id)}
                    className={`w-full sm:w-auto px-4 py-1.5 rounded-xl text-[10px] font-black transition-all shrink-0 ${
                    g.joined ?
                    "bg-emerald-600 hover:bg-emerald-700 text-white" :
                    "bg-red-600 hover:bg-red-700 text-white shadow-lg"}`
                    }>
                    
                        {g.joined ?
                    isArabic ? "✓ انضممت للنقابة" : "✓ Joined Guild" :
                    isArabic ? "⚔️ انضم للفيلق (+30 Coins)" : "⚔️ Join Guild (+30 Coins)"}
                      </button>
                    </div>
                )}
                </div>

                {/* 🌟 NEW: Live Streaming, Voice, Video & Watch Party CTA Card (Volume 2 Chapter 12) */}
                <div className="bg-gradient-to-br from-[#1b0802] to-[#0A0A0A] border border-orange-950 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#FF3D00] rounded-full animate-pulse" />
                      {isArabic ? "استوديو البث والسينما المشتركة" : "Live Streaming & Cinema Suite"}
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ?
                    "انضم للبثوث المباشرة، مكالمات الفيديو، أو شاهد حلقات الأنمي مع أصدقائك في السينما." :
                    "Connect with video calls, host live streams, or start synced cinema Watch Parties."}
                    </p>
                  </div>
                  <button
                  onClick={() => {
                    if (onOpenLiveSuite) onOpenLiveSuite(null);
                    onClose();
                    if (playSynthSound) playSynthSound("levelup");
                  }}
                  className="w-full sm:w-auto bg-[#FF3D00] hover:bg-orange-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer shrink-0">
                  
                    🚀 {isArabic ? "دخول الاستوديو" : "Enter Suite"}
                  </button>
                </div>

                {/* Additional simulated channels */}
                <div className="bg-[#0D0D10] border border-zinc-850 rounded-2xl p-4">
                  <h4 className="text-xs font-black text-white mb-2">📢 {isArabic ? "القنوات والمنتديات الشائعة" : "Trending Channels & Forums"}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 hover:bg-zinc-900 rounded-lg">
                      <span className="text-zinc-300 font-bold">#منتدى_ون_بيس_أسبوعي (One Piece Wiki)</span>
                      <span className="text-[10px] text-zinc-500">2.4k active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-zinc-900 rounded-lg">
                      <span className="text-zinc-300 font-bold">#تسريبات_مانجا_الهجوم (Manga Spoilers)</span>
                      <span className="text-[10px] text-zinc-500">4.1k active</span>
                    </div>
                  </div>
                </div>

              </div>
            }

            {/* CATEGORY 3: ANIME UNIVERSE */}
            {activeCategory === "universe" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{isArabic ? "عالم الأنمي وموسوعات الأوتاكو" : "Anime Universe & Otaku Encyclopedia"}</span>
                </h3>

                {/* Season Countdown */}
                <div className="bg-gradient-to-r from-red-950/20 via-zinc-950 to-red-950/20 border border-red-900/30 p-4 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-red-400 font-black block uppercase tracking-wider">{isArabic ? "أنمي هذا الأسبوع" : "Anime Release Countdown"}</span>
                      <h4 className="text-xs font-black text-white mt-0.5">{isArabic ? "قاتل الشياطين: قلعة اللانهاية" : "Demon Slayer: Infinity Castle"}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        02d : 14h : 35m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Character Profiles */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    👤 {isArabic ? "شخصيات الأنمي الأكثر شعبية" : "Most Hyped Anime Characters"}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                  { nameAr: "ليفاي أكرمان", nameEn: "Levi Ackerman", anime: "Shingeki no Kyojin", likes: "14.2k", votes: 420, avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120" },
                  { nameAr: "غوجو ساتورو", nameEn: "Gojo Satoru", anime: "Jujutsu Kaisen", likes: "19.8k", votes: 890, avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120" },
                  { nameAr: "رورونوا زورو", nameEn: "Roronoa Zoro", anime: "One Piece", likes: "16.5k", votes: 550, avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=120" }].
                  map((char, cIdx) =>
                  <div key={cIdx} className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl text-center space-y-2">
                        <img src={char.avatar} className="w-12 h-12 rounded-full object-cover mx-auto border border-zinc-800" />
                        <div>
                          <span className="block text-[11px] font-black text-white">{isArabic ? char.nameAr : char.nameEn}</span>
                          <span className="block text-[8px] text-zinc-500">{char.anime}</span>
                        </div>
                        <span className="inline-block text-[8px] bg-red-950/40 text-red-300 border border-red-900/30 px-2 py-0.5 rounded-full font-mono">
                          ♥ {char.likes}
                        </span>
                      </div>
                  )}
                  </div>
                </div>

                {/* Voice Actors & Studios */}
                <div className="bg-[#121215] border border-zinc-850 rounded-2xl p-4">
                  <h4 className="text-xs font-black text-white mb-2">🎬 {isArabic ? "أشهر استوديوهات الأنمي اليابانية" : "Legendary Anime Studios"}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                      <span className="font-bold text-white block">ufotable</span>
                      <span className="text-[9px] text-zinc-400 mt-1 block">{isArabic ? "معروف بجودة المؤثرات البصرية المذهلة في عروض Fate وDemon Slayer" : "Famous for supreme CGI in Fate and Demon Slayer"}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                      <span className="font-bold text-white block">MAPPA</span>
                      <span className="text-[9px] text-zinc-400 mt-1 block">{isArabic ? "أعمال حركية قوية مثل Jujutsu Kaisen وChainsaw Man" : "Legendary fast action: Jujutsu Kaisen, Chainsaw Man"}</span>
                    </div>
                  </div>
                </div>

              </div>
            }

            {/* CATEGORY 4: ECONOMY & SHOP */}
            {activeCategory === "economy" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>{isArabic ? "متجر المظاهر والتحكم التجميلي" : "System Customizer & Avatar Shop"}</span>
                </h3>

                {/* 🛒 BLACK STORE & DIGITAL ECONOMY HUB CTA (Volume 2 Chapter 13) */}
                <div className="bg-gradient-to-br from-[#0c0d12] to-[#12081c] border-2 border-purple-950 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="space-y-1 relative z-10">
                    <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider block">
                      {isArabic ? "سوق واقتصاد الإمبراطورية الرقمية" : "THE BLACK EMPIRE DIGITAL ECONOMY"}
                    </span>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      {isArabic ? "متجر بلاك والمخزن وسوق اللاعبين" : "Black Store, Inventory & Marketplace"}
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ?
                    "استكشف متجر الهدايا الحصري، تداول العناصر مع المستخدمين في السوق، وأنشئ ثيماتك التجميلية الخاصة بمخزونك." :
                    "Browse rare gifts, trade assets in the peer-to-peer Marketplace, customize personal themes, or manage your digital inventory."}
                    </p>
                  </div>
                  <button
                  onClick={() => {
                    if (onOpenEconomy) onOpenEconomy();
                    onClose();
                    if (playSynthSound) playSynthSound("rarebox");
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-black px-5 py-2.5 rounded-xl shadow-lg hover:shadow-purple-900/20 active:scale-95 transition-all cursor-pointer shrink-0 relative z-10">
                  
                    🛍️ {isArabic ? "فتح المتجر الرقمي" : "Open Economy Hub"}
                  </button>
                </div>

                {/* Daily Check-In station */}
                <div className="bg-gradient-to-br from-[#121215] to-[#1a130c] border border-amber-900/40 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block">{isArabic ? "محطة العملات المجانية اليومية" : "DAILY LOOT CHEST STATION"}</span>
                    <h4 className="text-xs font-black text-white mt-1">{isArabic ? "تسجيل الحضور اليومي واستلام الجائزة" : "Claim your free daily 50 Black Coins"}</h4>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{isArabic ? "سجل حضورك الآن لزيادة رصيدك ومستواك في المنصة" : "Get instant balance and XP raise"}</p>
                  </div>

                  <button
                  onClick={handleDailyCheckIn}
                  disabled={hasCheckedIn}
                  className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all ${
                  hasCheckedIn ?
                  "bg-zinc-800 text-zinc-500 cursor-default" :
                  "bg-gradient-to-tr from-amber-500 to-yellow-600 hover:scale-105 active:scale-95 text-white"}`
                  }>
                  
                    {hasCheckedIn ?
                  isArabic ? "✓ تم استلام جائزة اليوم" : "✓ Claimed Today" :
                  isArabic ? "💰 حضور واستلام (+50 Coin)" : "💰 Check-in (+50 Coin)"}
                  </button>
                </div>

                {/* Avatar Frame Shop */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                      🖼️ {isArabic ? "شراء وتجهيز إطارات الأفاتار" : "Interactive Avatar Aura Frames"}
                    </h4>
                    <span className="text-[9px] text-zinc-500 font-mono">{isArabic ? "شراء مباشر بالعملات" : "Buy with coins"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {frameShopItems.map((item, _autoIdx) => {
                    const isOwned = ownedFrames.includes(item.id);
                    const isEquipped = activeFrame === item.id;
                    return (
                      <div
                        key={`${item.id}_${_autoIdx}`}
                        className={`bg-zinc-900/60 border rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all ${
                        isEquipped ? "border-[var(--theme-accent)] bg-zinc-950" : "border-zinc-850"}`
                        }>
                        
                          <div className="flex gap-3 items-center">
                            {/* Avatar preview with the frame applied */}
                            <div className="relative">
                              <img
                              src={currentUser.avatar}
                              className={`w-12 h-12 rounded-full object-cover border-2 ${
                              isEquipped || activeFrame === item.id ? item.color : "border-zinc-800"}`
                              } />
                            
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-black text-white">
                                {isArabic ? item.nameAr : item.nameEn}
                              </span>
                              <span className="block text-[8px] text-zinc-500 leading-tight mt-0.5">
                                {isArabic ? item.descAr : item.nameEn}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                            <span className="text-xs font-black text-yellow-500 font-mono">
                              {isOwned ? isArabic ? "مملوك" : "Owned" : `${item.price} Coins`}
                            </span>

                            <button
                            onClick={() => handleBuyFrame(item)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${
                            isEquipped ?
                            "bg-red-600/20 text-red-300 border border-red-500" :
                            isOwned ?
                            "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" :
                            "bg-yellow-600 hover:bg-yellow-700 text-white"}`
                            }>
                            
                              {isEquipped ?
                            isArabic ? "نزع الإطار" : "Unequip" :
                            isOwned ?
                            isArabic ? "تجهيز الإطار" : "Equip Frame" :
                            isArabic ? "شراء وتجهيز" : "Purchase"}
                            </button>
                          </div>
                        </div>);

                  })}
                  </div>
                </div>

              </div>
            }

            {/* CATEGORY 5: ACTIVITY */}
            {activeCategory === "activity" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{isArabic ? "المهام اليومية ولوحة الترتيب للمقاتلين" : "Otaku Daily Quests & Leaderboard"}</span>
                </h3>

                {/* Quests list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    📝 {isArabic ? "المهام اليومية النشطة" : "Active Daily Quests"}
                  </h4>

                  <div className="space-y-2">
                    {quests.map((q, _autoIdx) =>
                  <div key={`${q.id}_${_autoIdx}`} className="bg-[#121215] border border-zinc-850 p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="block text-xs font-bold text-white">{isArabic ? q.titleAr : q.titleEn}</span>
                          <span className="block text-[8px] text-zinc-500 mt-0.5">+{q.reward} Black Coins • +30 XP</span>
                        </div>

                        <button
                      onClick={() => handleClaimQuest(q.id, q.reward)}
                      disabled={q.claimed}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${
                      q.claimed ?
                      "bg-zinc-800 text-zinc-500 cursor-default" :
                      "bg-red-600 hover:bg-red-700 text-white shadow-md"}`
                      }>
                      
                          {q.claimed ? isArabic ? "✓ تم الاستلام" : "✓ Claimed" : isArabic ? "💰 استلام" : "💰 Claim"}
                        </button>
                      </div>
                  )}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#0D0D10] border border-zinc-850 rounded-2xl p-4">
                  <h4 className="text-xs font-black text-white mb-3">🏆 {isArabic ? "لوحة صدارة الأوتوكو الأسبوعية" : "Weekly Otaku Masters Leaderboard"}</h4>
                  <div className="space-y-2.5">
                    {[
                  { rank: 1, name: "Yuki Senpai", xp: 4890, badge: "أساطير الأنمي" },
                  { rank: 2, name: "Kenji Uchiha", xp: 4210, badge: "سيف النينجا" },
                  { rank: 3, name: "Sora Otaku", xp: 3950, badge: "فيلق الاستطلاع" }].
                  map((user, uIdx) =>
                  <div key={uIdx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-500 w-4">#{user.rank}</span>
                          <span className="text-zinc-200 font-bold">{user.name}</span>
                          <span className="text-[8px] bg-red-950/40 text-red-300 border border-red-900/30 px-1.5 py-0.5 rounded-full font-mono">{user.badge}</span>
                        </div>
                        <span className="font-mono font-black text-white">{user.xp} XP</span>
                      </div>
                  )}
                  </div>
                </div>

              </div>
            }

            {/* CATEGORY 6: ADMIN CONTROL (Chapter 5 & 14) */}
            {activeCategory === "admin" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>{isArabic ? "لوحة الإشراف وحماية صلاحيات الرتب" : "Moderation Center & Rank Safeguards"}</span>
                  </h3>
                  <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    🛡️ Guard Active
                  </span>
                </div>

                {/* 👑 ADMIn SYSTEM FULL CONTROL CENTER CTA (Chapter 14) */}
                <div className="bg-gradient-to-br from-[#0d0909] to-[#12070c] border-2 border-red-950 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="space-y-1 relative z-10">
                    <span className="text-[8px] text-red-400 font-bold uppercase tracking-wider block">
                      {isArabic ? "نظام الإدارة والإشراف وبوابة الأمان الشاملة" : "SECURITY COMMAND & EMPIRE MODERATION"}
                    </span>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      {isArabic ? "بوابة الإدارة، البلاغات، التذاكر، وسجلات التدقيق" : "Admin Suite, Reports, Tickets & Audit Logs"}
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ?
                    "قم بالولوج للوحة التحكم الإدارية الكاملة: مراجعة البلاغات المعلقة والتذاكر، إدارة رتب RBAC وصلاحيات النظام، وسجلات التدقيق." :
                    "Enter the administrative suite: review active reports or support tickets, customize granular role-based permissions, and query the immutable audit database."}
                    </p>
                  </div>
                  <button
                  onClick={() => {
                    if (onOpenAdministration) onOpenAdministration();
                    onClose();
                    if (playSynthSound) playSynthSound("rarebox");
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[10px] font-black px-5 py-2.5 rounded-xl shadow-lg hover:shadow-red-900/20 active:scale-95 transition-all cursor-pointer shrink-0 relative z-10">
                  
                    🛡️ {isArabic ? "فتح لوحة الإدارة الكاملة" : "Open Administration Center"}
                  </button>
                </div>

                {/* System Admin Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl text-center">
                    <span className="text-[8px] text-zinc-500 font-black block uppercase tracking-wider">{isArabic ? "أعضاء قيد المراجعة" : "Flagged Members"}</span>
                    <span className="text-sm font-black text-red-500 font-mono mt-1 block">3</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl text-center">
                    <span className="text-[8px] text-zinc-500 font-black block uppercase tracking-wider">{isArabic ? "التوثيقات المعلقة" : "Pending Verifications"}</span>
                    <span className="text-sm font-black text-amber-500 font-mono mt-1 block">
                      {verificationRequests.filter((r) => r.status === "pending").length}
                    </span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl text-center">
                    <span className="text-[8px] text-zinc-500 font-black block uppercase tracking-wider">{isArabic ? "سجلات النظام" : "Audit Hits"}</span>
                    <span className="text-sm font-black text-green-500 font-mono mt-1 block">4,812</span>
                  </div>
                </div>

                {/* ROLE HIERARCHY SAFEGUARD (Chapter 5.3) */}
                <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <span className="text-sm">👑</span>
                    <h4 className="text-xs font-black text-white">
                      {isArabic ? "نظام حماية رتب أوتوكو وتدرج الصلاحيات" : "Role Hierarchy Safeguard Simulator"}
                    </h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    {isArabic ?
                  "قاعدة التدرج الصارم: لا يستطيع أي مشرف تنفيذ إجراء رقابي (حظر، إنذار، تخفيض) على عضو برتبة مساوية أو أعلى منه. اختر هدفاً لاختبار خوارزمية الأمان:" :
                  "Strict Hierarchy Rule: No moderator can perform administrative actions on an equal or higher rank. Test the enforcement algorithm:"}
                  </p>

                  {/* Target selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "المستهدف بالإجراء:" : "Target User:"}</label>
                      <select
                      value={selectedAdminTarget}
                      onChange={(e) => setSelectedAdminTarget(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white">
                      
                        {adminUsersList.map((user, _autoIdx) =>
                      <option key={`${user.username}_${_autoIdx}`} value={user.username}>
                            {user.name} (@{user.username}) - {user.role} (Lv {user.rankLevel})
                          </option>
                      )}
                      </select>
                    </div>

                    {/* Selected user micro card */}
                    {(() => {
                    const tgt = adminUsersList.find((u) => u.username === selectedAdminTarget);
                    if (!tgt) return null;
                    return (
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex items-center gap-2.5">
                          <img src={tgt.avatar} className="w-8 h-8 rounded-full object-cover border border-zinc-800" />
                          <div>
                            <span className="block text-xs font-bold text-zinc-300">{tgt.name}</span>
                            <span className="block text-[9px] text-zinc-500">@{tgt.username} • {tgt.role}</span>
                          </div>
                        </div>);

                  })()}
                  </div>

                  {/* Moderation Actions (Warn, Timeout, Ban, Demote) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {[
                  { action: "warning", labelAr: "توجيه إنذار", labelEn: "Send Warning", color: "bg-amber-600 hover:bg-amber-700" },
                  { action: "mute", labelAr: "كتم مؤقت", labelEn: "Mute User", color: "bg-zinc-800 hover:bg-zinc-750" },
                  { action: "ban", labelAr: "حظر نهائي", labelEn: "Ban Account", color: "bg-red-600 hover:bg-red-700" },
                  { action: "demote", labelAr: "تخفيض رتبة", labelEn: "Demote Role", color: "bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800" }].
                  map((btn, _autoIdx) =>
                  <button
                    key={`${btn.action}_${_autoIdx}`}
                    onClick={() => {
                      const targetUser = adminUsersList.find((u) => u.username === selectedAdminTarget);
                      if (!targetUser) return;

                      // Helper function for role levels matching types.ts
                      const getRoleLevel = (roleName: string) => {
                        if (roleName === "Owner") return 11;
                        if (roleName === "SuperAdministrator") return 9;
                        if (roleName === "Administrator") return 8;
                        if (roleName === "SectionManager") return 7;
                        if (roleName === "SeniorModerator") return 6;
                        if (roleName === "Moderator") return 5;
                        if (roleName === "TraineeModerator") return 4;
                        if (roleName === "Creator") return 3;
                        return 1; // Member
                      };

                      const myLevel = getRoleLevel(currentUser.role || "Member");
                      const targetLevel = targetUser.rankLevel;

                      if (myLevel <= targetLevel) {
                        if (playSynthSound) playSynthSound("error");
                        alert(
                          isArabic ?
                          `🚨 خرق صلاحيات ممتنع! لا يمكنك اتخاذ هذا الإجراء على مستخدم مساوٍ أو أعلى منك برتبة النظام!\n\nرتبتك: ${currentUser.role} (مستوى ${myLevel})\nرتبة الهدف: ${targetUser.role} (مستوى ${targetLevel})` :
                          `🚨 Authorization Refused! You cannot perform this action on an equal or higher rank.\n\nYour Rank: ${currentUser.role} (Lv ${myLevel})\nTarget: ${targetUser.role} (Lv ${targetLevel})`
                        );
                      } else {
                        if (playSynthSound) playSynthSound("success");
                        const actionLabel = isArabic ? btn.labelAr : btn.labelEn;
                        alert(
                          isArabic ?
                          `✓ تم تنفيذ إجراء (${actionLabel}) بنجاح على المستخدم @${targetUser.username} وتوثيق العملية في سجل الرقابة!` :
                          `✓ Action (${actionLabel}) executed successfully on @${targetUser.username}!`
                        );
                        // Append to admin actions simulator
                        setAdminActionLog((prev) => [
                        {
                          id: Date.now().toString(),
                          admin: currentUser.username,
                          action: actionLabel,
                          target: targetUser.username,
                          reason: isArabic ? "مخالفة الآداب والتعليمات" : "Policy compliance violation",
                          time: isArabic ? "الآن" : "Just now"
                        },
                        ...prev]
                        );
                      }
                    }}
                    className={`${btn.color} text-white text-[10px] font-black py-2 rounded-xl transition-all active:scale-95`}>
                    
                        {isArabic ? btn.labelAr : btn.labelEn}
                      </button>
                  )}
                  </div>
                </div>

                {/* VERIFICATION REVIEWER PORTAL (Chapter 5.5) */}
                <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <span className="text-sm">📝</span>
                    <h4 className="text-xs font-black text-white">{isArabic ? "مركز مراجعة ومعالجة طلبات التوثيق" : "Verification Applications Center"}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    {isArabic ?
                  "تتيح لك هذه اللوحة قبول أو رفض طلبات توثيق شارات الحسابات المقدمة من الأعضاء بشكل حي ومباشر:" :
                  "Review, approve, or reject live verification requests submitted by members in real-time:"}
                  </p>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {verificationRequests.filter((r) => r.status === "pending").length === 0 ?
                  <p className="text-[10px] text-zinc-600 italic text-center py-4">
                        {isArabic ? "لا توجد طلبات توثيق معلقة حالياً" : "No pending verification requests."}
                      </p> :

                  verificationRequests.
                  filter((r) => r.status === "pending").
                  map((req, _autoIdx) =>
                  <div key={`${req.id}_${_autoIdx}`} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs space-y-2">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">@{req.username}</span>
                              <span className="text-amber-500 font-mono text-[10px] uppercase font-black">
                                Type: {req.reqType}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[10px] leading-normal">{req.reason}</p>
                            {req.links && <p className="text-zinc-500 text-[9px] font-mono">Portfolio: {req.links}</p>}
                            
                            <div className="flex gap-2 pt-1 border-t border-zinc-900">
                              <button
                        onClick={() => {
                          // Accept request
                          setVerificationRequests((prev) =>
                          prev.map((r, _autoIdx) => r.id === req.id ? { ...r, status: "accepted" } : r)
                          );
                          if (playSynthSound) playSynthSound("success");
                          alert(isArabic ? `✓ تم قبول طلب التوثيق للمستخدم @${req.username} ومنحه الشارة الملونة!` : `✓ Verification request approved for @${req.username}!`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] px-3 py-1 rounded-lg">
                        
                                {isArabic ? "قبول ومنح الشارة" : "Approve Badge"}
                              </button>
                              <button
                        onClick={() => {
                          // Reject request
                          setVerificationRequests((prev) =>
                          prev.map((r, _autoIdx) => r.id === req.id ? { ...r, status: "rejected" } : r)
                          );
                          if (playSynthSound) playSynthSound("error");
                          alert(isArabic ? `✗ تم رفض طلب التوثيق للمستخدم @${req.username}` : `✗ Verification request rejected for @${req.username}`);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black text-[9px] px-3 py-1 rounded-lg">
                        
                                {isArabic ? "رفض الطلب" : "Reject Application"}
                              </button>
                            </div>
                          </div>
                  )
                  }
                  </div>
                </div>

                {/* AUDIT LOGS LIST (Chapter 5.11) */}
                <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-white">📜 {isArabic ? "سجل إجراءات الرقابة والنظام" : "Moderation & System Audit Log"}</h4>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {adminActionLog.map((log, _autoIdx) =>
                  <div key={`${log.id}_${_autoIdx}`} className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl text-[10px] space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-emerald-400 font-bold">Admin: @{log.admin}</span>
                          <span className="text-zinc-600">{log.time}</span>
                        </div>
                        <p className="text-zinc-300">
                          {isArabic ?
                      `قام بـ (${log.action}) على المستخدم @${log.target}` :
                      `Performed (${log.action}) on user @${log.target}`}
                        </p>
                        <span className="block text-[9px] text-zinc-500 italic font-bold">Reason: {log.reason}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            }

            {/* CATEGORY 7: DEVELOPERS & BOTS */}
            {activeCategory === "developers" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>{isArabic ? "خدمات المطورين وبناء الروبوتات" : "Developer Sandbox & Bot Builder"}</span>
                </h3>

                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {isArabic ?
                "أنشئ واصنع البوتات الخاصة بك للعمل التلقائي داخل قنوات ومجموعات أنمي بلاك، مع إدارة صلاحيات API ومفاتيح الترخيص الخاصة بك." :
                "Create, configure, and activate custom bots for automate task handling inside Anime Black. Manage active API keys."}
                </p>

                {/* API Token generation */}
                <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">{isArabic ? "مفاتيح ترخيص المطور (API Keys)" : "Developer API Token Keys"}</span>
                    <button
                    onClick={handleGenerateApiKey}
                    className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl transition-all">
                    
                      {isArabic ? "+ توليد مفتاح جديد" : "+ Generate Key"}
                    </button>
                  </div>

                  <div className="space-y-1.5 font-mono text-[9px]">
                    {developerKeys.length === 0 ?
                  <span className="block text-zinc-600 italic py-1 text-center">{isArabic ? "لم تقم بتوليد أي مفتاح بعد" : "No API keys generated yet."}</span> :

                  developerKeys.map((k, idx) =>
                  <div key={idx} className="flex justify-between bg-zinc-950 p-2 rounded border border-zinc-900 text-green-500">
                          <span>{k}</span>
                          <span className="text-zinc-600">Active</span>
                        </div>
                  )
                  }
                  </div>
                </div>

                {/* Bot Builder */}
                <div className="bg-[#121215] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-white">🤖 {isArabic ? "بناء بوت أوتوكو مخصص" : "Assemble Custom Bot Node"}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "اسم البوت" : "Bot Username"}</label>
                        <input
                        type="text"
                        value={newBotName}
                        onChange={(e) => setNewBotName(e.target.value)}
                        placeholder="e.g. ZoroBot"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                      
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">{isArabic ? "مبادئ البوت (Prefix)" : "Command Prefix"}</label>
                        <input
                        type="text"
                        value={newBotPrefix}
                        onChange={(e) => setNewBotPrefix(e.target.value)}
                        placeholder="e.g. !"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                      
                      </div>
                    </div>

                    <button
                    onClick={handleCreateBot}
                    disabled={!newBotName.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black py-2 rounded-xl transition-all">
                    
                      {isArabic ? "تفعيل وإطلاق البوت بنجاح" : "Deploy Bot to Server"}
                    </button>
                  </div>

                  {/* Active Bots list */}
                  <div className="space-y-2 mt-3">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase">{isArabic ? "البوتات النشطة حالياً في الخادم:" : "Active Bot Nodes:"}</span>
                    {bots.length === 0 ?
                  <span className="block text-[10px] text-zinc-600 italic text-center">{isArabic ? "لا يوجد بوتات نشطة حالياً" : "No active bots."}</span> :

                  bots.map((b, _autoIdx) =>
                  <div key={`${b.id}_${_autoIdx}`} className="flex justify-between items-center p-2 bg-zinc-950 rounded-xl border border-zinc-900 text-xs">
                          <span className="text-zinc-200 font-bold">🤖 {b.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Prefix: {b.prefix}</span>
                        </div>
                  )
                  }
                  </div>
                </div>

              </div>
            }

            {/* CATEGORY 8: GENERAL SETTINGS */}
            {activeCategory === "settings" &&
            <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--theme-accent)] border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>{isArabic ? "إعدادات منصة Anime Black" : "General Hub Preferences"}</span>
                </h3>

                <div className="bg-[#121215] border border-zinc-850 rounded-2xl p-4 space-y-4">
                  {/* Account options */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-white block">🔒 {isArabic ? "إعدادات الحساب والأمان" : "Security & Access"}</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl">
                        <span>{isArabic ? "تفعيل التحقق بخطوتين (OTP)" : "Two-Factor Authentication (OTP)"}</span>
                        <div className="w-9 h-5 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end"><span className="w-4 h-4 bg-white rounded-full" /></div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl">
                        <span>{isArabic ? "تشفير محادثات الدردشة الخاصة" : "End-to-End Chat Encryption"}</span>
                        <div className="w-9 h-5 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end"><span className="w-4 h-4 bg-white rounded-full" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Appearance Option */}
                  <div className="space-y-3 pt-3 border-t border-zinc-900">
                    <span className="text-xs font-black text-white block">☀️ {isArabic ? "المظهر" : "Appearance"}</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-zinc-850">
                        <div>
                          <span className="font-bold text-white block">{isArabic ? "المظهر" : "Appearance"}</span>
                          <span className="block text-[10px] text-zinc-400 mt-0.5">
                            {isArabic ?
                          appearanceMode === "light" ? "الوضع النهاري مفعّل" : "الوضع الليلي مفعّل" :
                          appearanceMode === "light" ? "Light Mode Active" : "Dark Mode Active"}
                          </span>
                        </div>
                        <button
                        onClick={() => {
                          if (playSynthSound) playSynthSound("tap");
                          if (triggerHapticFeedback) triggerHapticFeedback("tap");
                          setActiveCategory("appearance");
                        }}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md">
                        
                          {isArabic ? "تغيير المظهر" : "Change Mode"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Accessibility Options */}
                  <div className="space-y-3 pt-3 border-t border-zinc-900">
                    <span className="text-xs font-black text-white block">👁️ {isArabic ? "إعدادات سهولة الوصول والـ UX" : "UX & Accessibility Options"}</span>
                    <div className="space-y-2 text-xs">
                      {/* Reduce Motion */}
                      <div className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl">
                        <div>
                          <span>{isArabic ? "تقليل المؤثرات الحركية (Reduce Motion)" : "Reduce Motion / Animations"}</span>
                          <span className="block text-[8px] text-zinc-500 mt-0.5">{isArabic ? "تعطيل حركات التحليق المجهدة للبطارية" : "Disable intensive floating layout effects"}</span>
                        </div>
                        <button
                        onClick={() => {
                          if (triggerHapticFeedback) triggerHapticFeedback("tap");
                          if (playSynthSound) playSynthSound("tap");
                          setReduceMotion(!reduceMotion);
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                        reduceMotion ? "bg-emerald-600 flex justify-end" : "bg-zinc-800 flex justify-start"}`
                        }>
                        
                          <span className="w-4 h-4 bg-white rounded-full block shadow" />
                        </button>
                      </div>

                      {/* High Contrast */}
                      <div className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl">
                        <div>
                          <span>{isArabic ? "زيادة تباين الألوان (High Contrast)" : "Enhance Contrast Mode"}</span>
                          <span className="block text-[8px] text-zinc-500 mt-0.5">{isArabic ? "تحسين وضوح النصوص في البيئات الساطعة" : "Maximize text legibility for outdoor use"}</span>
                        </div>
                        <button
                        onClick={() => {
                          if (triggerHapticFeedback) triggerHapticFeedback("tap");
                          if (playSynthSound) playSynthSound("tap");
                          setHighContrast(!highContrast);
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                        highContrast ? "bg-emerald-600 flex justify-end" : "bg-zinc-800 flex justify-start"}`
                        }>
                        
                          <span className="w-4 h-4 bg-white rounded-full block shadow" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cache */}
                  <div className="space-y-3 pt-3 border-t border-zinc-900">
                    <span className="text-xs font-black text-white block">💾 {isArabic ? "التخزين والبيانات المحلية" : "Storage & Offline Cache"}</span>
                    <div className="flex justify-between items-center text-xs p-2 bg-zinc-900/40 rounded-xl">
                      <div>
                        <span>{isArabic ? "تنظيف الملفات المؤقتة المخزنة" : "Clear local cache data"}</span>
                        <span className="block text-[8px] text-zinc-500 mt-0.5">{isArabic ? "المساحة المستهلكة: 4.2 MB" : "Used Space: 4.2 MB"}</span>
                      </div>
                      <button onClick={() => {alert(isArabic ? "تم تنظيف الذاكرة المؤقتة" : "Cache Cleared");}} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black px-3 py-1.5 rounded-xl text-[10px]">
                        {isArabic ? "تنظيف الآن" : "Clear Now"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            }


          </div>
          }
      </div>

          {/* DESKTOP STICKY EXIT FOOTER OR SIMILAR */}
          <div className="hidden md:block absolute bottom-4 left-4 z-50">
            <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all">
            
              {isArabic ? "الرجوع للمجتمع" : "RETURN TO COMMUNITY"}
            </button>
          </div>

        </motion.div>
      }

      {/* COMPREHENSIVE OTAKU STATS MODAL */}
      <OtakuStatsModal
        isOpen={showOtakuStatsModal}
        onClose={() => setShowOtakuStatsModal(false)}
        isArabic={isArabic}
        currentUser={currentUser}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback} />
      

      {/* 100 LEVEL BADGES GALLERY MODAL */}
      {show100LevelBadgesModal &&
      <LevelBadgesModal
        currentUserLevel={currentUser?.level || 42}
        currentUserXp={currentUser?.xp || 4200}
        isArabic={isArabic}
        onClose={() => setShow100LevelBadgesModal(false)}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback}
        onEquipBadge={(b) => {
          setCurrentUser((prev: any) => ({ ...prev, equippedBadgeLevel: b.level }));
        }} />

      }
    </AnimatePresence>);

}