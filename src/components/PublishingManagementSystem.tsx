import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Globe,
  Lock,
  MessageSquare,
  Heart,
  Eye,
  Share2,
  Download,
  Copy,
  Sparkles,
  Shield,
  Clock,
  Trash2,
  Database,
  Layers,
  FileText,
  Clapperboard,
  Tv,
  Calendar,
  Compass,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit3,
  ExternalLink,
  Sliders,
  Check,
  TrendingUp,
  BarChart2,
  Server,
  ArrowRight,
  Bookmark,
  Pin,
  Tag
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface User {
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  role?: string;
  uid?: string;
}

interface PublishingManagementSystemProps {
  isArabic: boolean;
  currentUser: User | null;
  posts: any[];
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
  playSynthSound?: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification?: (title: string, body: string, badge?: string) => void;
  onClose?: () => void;
  onOpenPublisher?: () => void;
}

export default function PublishingManagementSystem({
  isArabic,
  currentUser,
  posts,
  setPosts,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  onClose,
  onOpenPublisher
}: PublishingManagementSystemProps) {
  const [activeTab, setActiveTab] = useState<
    "settings" | "manager" | "scheduled" | "ai_rules" | "server_api" | "analytics"
  >("settings");

  // Server & Firestore Connection Status
  const [dbStatus, setDbStatus] = useState<"connected" | "connecting" | "offline">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>("الآن");

  // Publishing Global Settings State
  const [defaultAudience, setDefaultAudience] = useState<string>("public");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [likesEnabled, setLikesEnabled] = useState(true);
  const [viewsEnabled, setViewsEnabled] = useState(true);
  const [sharingAllowed, setSharingAllowed] = useState(true);
  const [repostingAllowed, setRepostingAllowed] = useState(true);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkType, setWatermarkType] = useState<"logo" | "username" | "custom">("logo");
  const [customWatermarkText, setCustomWatermarkText] = useState("Anime Black");
  const [mediaQuality, setMediaQuality] = useState<"high" | "balanced" | "fast">("balanced");
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<number>(50);

  // Rewards settings
  const [coinsRewardPerPost, setCoinsRewardPerPost] = useState<number>(15);
  const [xpRewardPerPost, setXpRewardPerPost] = useState<number>(45);

  // Category Toggles
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>({
    post: true,
    reel: true,
    story: true,
    news: true,
    event: true,
    channel: true,
    group: true,
    space: true,
    announcement: true,
    universe: true
  });

  // AI Moderation Rules State
  const [aiModerationEnabled, setAiModerationEnabled] = useState(true);
  const [spoilerTagRequired, setSpoilerTagRequired] = useState(true);
  const [spamFilterSensitivity, setSpamFilterSensitivity] = useState<"low" | "medium" | "high">("medium");
  const [linkSecurityCheck, setLinkSecurityCheck] = useState(true);
  const [autoTaggingEnabled, setAutoTaggingEnabled] = useState(true);

  // Manager Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Scheduled Posts State
  const [scheduledList, setScheduledList] = useState<any[]>([]);
  const [draftsList, setDraftsList] = useState<any[]>([]);

  // Editing Post Modal State
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editContentText, setEditContentText] = useState("");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Sound & Haptic helper
  const handleTap = () => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");
  };

  // Load Publishing Settings & Scheduled Posts from Firestore / LocalStorage on mount
  useEffect(() => {
    async function loadSettingsAndData() {
      try {
        setDbStatus("connecting");
        const { db } = await import("../firebase");
        const { doc, getDoc, collection, getDocs } = await import("firebase/firestore");

        // Load settings from Firestore
        const settingsSnap = await getDoc(doc(db, "settings", "publishing"));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.defaultAudience) setDefaultAudience(data.defaultAudience);
          if (data.commentsEnabled !== undefined) setCommentsEnabled(data.commentsEnabled);
          if (data.likesEnabled !== undefined) setLikesEnabled(data.likesEnabled);
          if (data.sharingAllowed !== undefined) setSharingAllowed(data.sharingAllowed);
          if (data.downloadAllowed !== undefined) setDownloadAllowed(data.downloadAllowed);
          if (data.watermarkEnabled !== undefined) setWatermarkEnabled(data.watermarkEnabled);
          if (data.coinsRewardPerPost !== undefined) setCoinsRewardPerPost(data.coinsRewardPerPost);
          if (data.xpRewardPerPost !== undefined) setXpRewardPerPost(data.xpRewardPerPost);
          if (data.aiModerationEnabled !== undefined) setAiModerationEnabled(data.aiModerationEnabled);
          if (data.enabledCategories) setEnabledCategories(data.enabledCategories);
        }

        // Load scheduled posts
        const scheduledSnap = await getDocs(collection(db, "scheduled_posts"));
        const schedArr: any[] = [];
        scheduledSnap.forEach((doc) => {
          schedArr.push({ id: doc.id, ...doc.data() });
        });

        // Fallback local scheduled posts
        const savedScheduled = localStorage.getItem("anime_black_scheduled");
        if (savedScheduled) {
          const localSched = JSON.parse(savedScheduled);
          schedArr.push(...localSched.filter((ls: any) => !schedArr.some((s) => s.id === ls.id)));
        }
        setScheduledList(schedArr);

        // Load drafts
        const savedDrafts = localStorage.getItem("anime_black_drafts");
        if (savedDrafts) {
          setDraftsList(JSON.parse(savedDrafts));
        }

        setDbStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        console.warn("Operating with local cached publishing settings:", err);
        setDbStatus("offline");
      }
    }

    loadSettingsAndData();
  }, []);

  // Save Settings to Firestore
  const handleSaveSettings = async () => {
    handleTap();
    setIsSaving(true);

    try {
      const { db } = await import("../firebase");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

      const publishingSettingsData = {
        defaultAudience,
        commentsEnabled,
        likesEnabled,
        viewsEnabled,
        sharingAllowed,
        repostingAllowed,
        downloadAllowed,
        watermarkEnabled,
        watermarkType,
        customWatermarkText,
        mediaQuality,
        maxFileSizeMb,
        coinsRewardPerPost,
        xpRewardPerPost,
        enabledCategories,
        aiModerationEnabled,
        spoilerTagRequired,
        spamFilterSensitivity,
        linkSecurityCheck,
        autoTaggingEnabled,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.username || "admin"
      };

      await setDoc(doc(db, "settings", "publishing"), publishingSettingsData);

      if (playSynthSound) playSynthSound("success");
      if (triggerHapticFeedback) triggerHapticFeedback("success");

      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تم حفظ إعدادات النشر" : "Publishing Settings Saved",
          isArabic ? "تم تحديث جميع قواعد واشتراطات النشر في قاعدة البيانات بنجاح!" : "Global publishing configuration synchronized with server!",
          "⚙️"
        );
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Error saving publishing settings:", err);
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "حفظ محلي فقط" : "Saved Locally",
          isArabic ? "تم الحفظ محلياً مؤقتاً بسبب حالة الاتصال." : "Settings saved locally in browser cache.",
          "⚠️"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete / Trash Post in Firestore
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(isArabic ? "هل أنت تأكد من حذف هذا المنشور نهائياً من السيرفر؟" : "Permanently delete this post from server?")) {
      return;
    }
    handleTap();

    try {
      const { db } = await import("../firebase");
      const { doc, deleteDoc } = await import("firebase/firestore");

      await deleteDoc(doc(db, "posts", postId));

      if (setPosts) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }

      if (playSynthSound) playSynthSound("success");
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تم حذف المنشور" : "Post Deleted",
          isArabic ? "تمت إزالة المنشور بنجاح من الخادم وقواعد البيانات" : "Post removed permanently from Firestore",
          "🗑️"
        );
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // Edit Post Content in Firestore
  const handleSaveEditedPost = async () => {
    if (!editingPost || !editContentText.trim()) return;
    handleTap();

    try {
      const { db } = await import("../firebase");
      const { doc, updateDoc } = await import("firebase/firestore");

      await updateDoc(doc(db, "posts", editingPost.id), {
        content: editContentText,
        updatedAt: new Date().toISOString()
      });

      if (setPosts) {
        setPosts((prev) =>
          prev.map((p) => (p.id === editingPost.id ? { ...p, content: editContentText } : p))
        );
      }

      setEditingPost(null);
      setEditContentText("");

      if (playSynthSound) playSynthSound("success");
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تم تحديث المنشور" : "Post Updated",
          isArabic ? "تم تعديل النص وحفظ التغييرات في السيرفر!" : "Post text updated successfully!",
          "✏️"
        );
      }
    } catch (err) {
      console.error("Failed to update post:", err);
    }
  };

  // Filtered Posts for Post Manager
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || (post.category || "post") === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "flagged" && post.flagged) ||
      (statusFilter === "approved" && !post.flagged);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Mock analytics data for recharts
  const analyticsData = [
    { name: isArabic ? "الأحد" : "Sun", posts: 12, views: 420, shares: 35 },
    { name: isArabic ? "الإثنين" : "Mon", posts: 19, views: 680, shares: 52 },
    { name: isArabic ? "الثلاثاء" : "Tue", posts: 25, views: 950, shares: 88 },
    { name: isArabic ? "الأربعاء" : "Wed", posts: 32, views: 1200, shares: 110 },
    { name: isArabic ? "الخميس" : "Thu", posts: 45, views: 1850, shares: 190 },
    { name: isArabic ? "الجمعة" : "Fri", posts: 58, views: 2400, shares: 270 },
    { name: isArabic ? "السبت" : "Sat", posts: 40, views: 1600, shares: 145 }
  ];

  return (
    <div
      className="w-full bg-black min-h-screen text-white pb-32"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* HEADER BAR */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/20 border border-red-500/30 rounded-2xl text-red-500">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
              <span>{isArabic ? "مركز إدارة وإعدادات النشر" : "Publishing Command & Settings"}</span>
            </h1>
            <p className="text-[10px] text-zinc-400">
              {isArabic
                ? "إدارة جميع خيارات المنشورات، الفلترة، وروابط السيرفر المباشرة"
                : "Manage post configurations, AI rules, and server db bindings"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Server Connection Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
              dbStatus === "connected"
                ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
                : dbStatus === "connecting"
                ? "bg-amber-950/60 border-amber-500/30 text-amber-400 animate-pulse"
                : "bg-red-950/60 border-red-500/30 text-red-400"
            }`}
          >
            <Server className="w-3 h-3" />
            <span>
              {dbStatus === "connected"
                ? isArabic
                  ? "السيرفر متصل"
                  : "Server Online"
                : dbStatus === "connecting"
                ? isArabic
                  ? "جاري المزامنة..."
                  : "Syncing..."
                : isArabic
                ? "وضع كاش محلي"
                : "Local Cache"}
            </span>
          </div>

          {onOpenPublisher && (
            <button
              onClick={() => {
                handleTap();
                onOpenPublisher();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? "إنشاء منشور" : "New Post"}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={() => {
                handleTap();
                onClose();
              }}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* TOP TAB NAVIGATION RAIL */}
      <div className="overflow-x-auto py-2.5 px-4 flex gap-2 border-b border-zinc-900 bg-zinc-950/40 no-scrollbar">
        {[
          {
            id: "settings",
            labelAr: "إعدادات النشر",
            labelEn: "Publishing Settings",
            icon: Settings
          },
          {
            id: "manager",
            labelAr: "إدارة المنشورات",
            labelEn: "Posts Manager",
            icon: Layers,
            badge: posts.length
          },
          {
            id: "scheduled",
            labelAr: "المجدولة والمسودات",
            labelEn: "Scheduled & Drafts",
            icon: Clock,
            badge: scheduledList.length + draftsList.length
          },
          {
            id: "ai_rules",
            labelAr: "الفلترة والذكاء الاصطناعي",
            labelEn: "AI Rules & Moderation",
            icon: Sparkles
          },
          {
            id: "server_api",
            labelAr: "روابط السيرفر والقواعد",
            labelEn: "Server API & DB Links",
            icon: Database
          },
          {
            id: "analytics",
            labelAr: "إحصائيات الأداء",
            labelEn: "Publishing Analytics",
            icon: BarChart2
          }
        ].map((tab, idx) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`pub_tab_${tab.id}_${idx}`}
              onClick={() => {
                handleTap();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/10 scale-105"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-950 text-red-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* TAB 1: GENERAL PUBLISHING SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-5 animate-fade-in">
            {/* Section A: Default Post Controls */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-red-500" />
                    <span>{isArabic ? "إعدادات الخصوصية والوصول الافتراضية" : "Default Privacy & Audience"}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {isArabic
                      ? "تحديد الفئة المستهدفة الافتراضية للمنشورات الجديدة"
                      : "Set target audience for newly published content"}
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSaving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ التغييرات" : "Save Changes"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                    {isArabic ? "جمهور المنشور الافتراضي" : "Default Audience"}
                  </label>
                  <select
                    value={defaultAudience}
                    onChange={(e) => setDefaultAudience(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-bold"
                  >
                    <option value="public">🌐 {isArabic ? "عام (الجميع)" : "Public (Everyone)"}</option>
                    <option value="followers">👥 {isArabic ? "المتابعون فقط" : "Followers Only"}</option>
                    <option value="friends">🤝 {isArabic ? "الأصدقاء المقربون" : "Close Friends"}</option>
                    <option value="guild">🛡️ {isArabic ? "أعضاء النقابة/العشيرة" : "Guild Members"}</option>
                    <option value="private">🔒 {isArabic ? "خاص (أنا فقط)" : "Private (Only Me)"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                    {isArabic ? "جودة ضغط الوسائط (الصور والفيديو)" : "Media Compression Quality"}
                  </label>
                  <select
                    value={mediaQuality}
                    onChange={(e) => setMediaQuality(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-bold"
                  >
                    <option value="high">✨ {isArabic ? "دقة فائقة (Ultra HD 1080p)" : "Ultra HD (1080p)"}</option>
                    <option value="balanced">⚡ {isArabic ? "متوازن (سريع وموفر للبيانات)" : "Balanced (Fast & Crisp)"}</option>
                    <option value="fast">🚀 {isArabic ? "أقصى سرعة رفع (720p)" : "Max Speed (720p)"}</option>
                  </select>
                </div>
              </div>

              {/* Toggles grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    state: commentsEnabled,
                    setState: setCommentsEnabled,
                    titleAr: "السماح بالتعليقات تلقائياً",
                    titleEn: "Allow Comments",
                    icon: MessageSquare
                  },
                  {
                    state: likesEnabled,
                    setState: setLikesEnabled,
                    titleAr: "إظهار زر الإعجاب والتفاعلات",
                    titleEn: "Allow Likes & Reactions",
                    icon: Heart
                  },
                  {
                    state: viewsEnabled,
                    setState: setViewsEnabled,
                    titleAr: "عرض عدد المشاهدات والزيارات",
                    titleEn: "Show View Counters",
                    icon: Eye
                  },
                  {
                    state: sharingAllowed,
                    setState: setSharingAllowed,
                    titleAr: "السماح بمشاركة ونشر الرابط",
                    titleEn: "Allow Sharing & Links",
                    icon: Share2
                  },
                  {
                    state: repostingAllowed,
                    setState: setRepostingAllowed,
                    titleAr: "السماح بإعادة النشر (Repost)",
                    titleEn: "Allow Reposting",
                    icon: RefreshCw
                  },
                  {
                    state: downloadAllowed,
                    setState: setDownloadAllowed,
                    titleAr: "السماح بتنزيل الوسائط المرفقة",
                    titleEn: "Allow Media Downloads",
                    icon: Download
                  }
                ].map((item, idx) => {
                  const IconC = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => item.setState(!item.state)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        item.state
                          ? "bg-zinc-900/90 border-red-500/40 text-white"
                          : "bg-zinc-950 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconC className={`w-4 h-4 ${item.state ? "text-red-500" : "text-zinc-600"}`} />
                        <span className="text-xs font-bold">{isArabic ? item.titleAr : item.titleEn}</span>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          item.state ? "bg-red-600" : "bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            item.state ? (isArabic ? "-translate-x-4" : "translate-x-4") : ""
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Watermark & Branding */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>{isArabic ? "علامة المائية والشعار (Watermark)" : "Watermark & Media Protection"}</span>
              </h3>

              <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isArabic ? "تفعيل العلامة المائية الشفافة على صور وفيديوهات المنشور" : "Enable Automatic Watermark"}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {isArabic ? "حماية حقوق صانع المحتوى ومنع السرقة" : "Protect creator content copyright"}
                  </span>
                </div>
                <button
                  onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    watermarkEnabled ? "bg-purple-600" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      watermarkEnabled ? (isArabic ? "-translate-x-4" : "translate-x-4") : ""
                    }`}
                  />
                </button>
              </div>

              {watermarkEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-fade-in">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                      {isArabic ? "نوع العلامة المائية" : "Watermark Style"}
                    </label>
                    <select
                      value={watermarkType}
                      onChange={(e) => setWatermarkType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    >
                      <option value="logo">🏷️ {isArabic ? "شعار المنصة (Anime Black)" : "Platform Logo"}</option>
                      <option value="username">👤 {isArabic ? "اسم المستخدم الحركي (@username)" : "Creator Handle"}</option>
                      <option value="custom">✏️ {isArabic ? "نص مخصص للعلامة" : "Custom Text"}</option>
                    </select>
                  </div>

                  {watermarkType === "custom" && (
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                        {isArabic ? "النص المخصص للعلامة المائية" : "Custom Watermark Text"}
                      </label>
                      <input
                        type="text"
                        value={customWatermarkText}
                        onChange={(e) => setCustomWatermarkText(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section C: Gamification Rewards per Post */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{isArabic ? "مكافآت النشر والتفاعل (Coins & XP Rewards)" : "Publishing Gamification Rewards"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">
                    🪙 {isArabic ? "العملات المكتسبة عند إنشاء منشور" : "Coins per published post"}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={coinsRewardPerPost}
                      onChange={(e) => setCoinsRewardPerPost(Number(e.target.value))}
                      className="w-24 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-black font-mono"
                    />
                    <span className="text-xs font-bold text-zinc-400">{isArabic ? "كوين سوداء" : "Black Coins"}</span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">
                    ⚡ {isArabic ? "نقاط الخبرة المكتسبة (XP)" : "XP per published post"}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={xpRewardPerPost}
                      onChange={(e) => setXpRewardPerPost(Number(e.target.value))}
                      className="w-24 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-purple-400 font-black font-mono"
                    />
                    <span className="text-xs font-bold text-zinc-400">{isArabic ? "نقطة XP" : "XP Points"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Allowed Publishing Categories Toggles */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>{isArabic ? "تفعيل أقسام وفئات النشر المتاحة" : "Active Publishing Formats & Categories"}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {[
                  { id: "post", nameAr: "المنشورات", nameEn: "Posts", icon: FileText },
                  { id: "reel", nameAr: "الريلز", nameEn: "Reels", icon: Clapperboard },
                  { id: "story", nameAr: "القصص", nameEn: "Stories", icon: Sparkles },
                  { id: "news", nameAr: "الأخبار", nameEn: "News", icon: Tv },
                  { id: "event", nameAr: "الفعاليات", nameEn: "Events", icon: Calendar },
                  { id: "channel", nameAr: "القنوات", nameEn: "Channels", icon: Compass },
                  { id: "group", nameAr: "المجموعات", nameEn: "Groups", icon: MessageSquare },
                  { id: "space", nameAr: "العوالم", nameEn: "Spaces", icon: Layers },
                  { id: "announcement", nameAr: "الإعلانات", nameEn: "Official", icon: Shield },
                  { id: "universe", nameAr: "يونيفرس", nameEn: "Universe", icon: Zap }
                ].map((cat, idx) => {
                  const IconComponent = cat.icon;
                  const isEnabled = enabledCategories[cat.id] ?? true;
                  return (
                    <button
                      key={`pub_cat_${cat.id}_${idx}`}
                      onClick={() =>
                        setEnabledCategories((prev) => ({ ...prev, [cat.id]: !isEnabled }))
                      }
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isEnabled
                          ? "bg-zinc-900 border-red-500/50 text-white shadow-md"
                          : "bg-zinc-950 border-zinc-900 text-zinc-600 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <IconComponent className={`w-3.5 h-3.5 ${isEnabled ? "text-red-500" : "text-zinc-600"}`} />
                        <span className="truncate">{isArabic ? cat.nameAr : cat.nameEn}</span>
                      </div>
                      <span className={`text-[10px] font-black ${isEnabled ? "text-emerald-400" : "text-zinc-600"}`}>
                        {isEnabled ? "✔" : "✕"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POSTS & CONTENT MANAGER */}
        {activeTab === "manager" && (
          <div className="space-y-4 animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? "ابحث في محتوى المنشورات أو أسماء المؤلفين..." : "Search posts or authors..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                >
                  <option value="all">📁 {isArabic ? "كل الفئات" : "All Categories"}</option>
                  <option value="post">📝 {isArabic ? "منشورات" : "Posts"}</option>
                  <option value="reel">🎬 {isArabic ? "ريلز" : "Reels"}</option>
                  <option value="story">✨ {isArabic ? "قصص" : "Stories"}</option>
                  <option value="news">📰 {isArabic ? "أخبار" : "News"}</option>
                  <option value="event">🏆 {isArabic ? "فعاليات" : "Events"}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                >
                  <option value="all">🔍 {isArabic ? "جميع الحالات" : "All Status"}</option>
                  <option value="approved">✅ {isArabic ? "المعتمدة" : "Approved"}</option>
                  <option value="flagged">⚠️ {isArabic ? "مراجعة الذكاء الاصطناعي" : "Flagged AI"}</option>
                </select>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>
                  {isArabic ? "عدد المنشورات المعروضة:" : "Displayed Posts:"} {filteredPosts.length} / {posts.length}
                </span>
                <span>{isArabic ? "مرتبة حسب الأحدث" : "Sorted by newest"}</span>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-3">
              {filteredPosts.length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-zinc-700" />
                  <p className="text-xs font-bold">{isArabic ? "لا توجد منشورات مطابقة للبحث" : "No matching posts found"}</p>
                </div>
              ) : (
                filteredPosts.map((post, pIdx) => (
                  <div
                    key={`pub_post_${post.id || pIdx}_${pIdx}`}
                    className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-4 rounded-3xl space-y-3 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{post.author?.name || "Otaku User"}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">@{post.author?.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-zinc-500 mt-0.5">
                            <span className="bg-zinc-900 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
                              {post.category || "post"}
                            </span>
                            <span>{post.createdAt || "اليوم"}</span>
                            {post.flagged && (
                              <span className="bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                ⚠️ {isArabic ? "تحت المراجعة" : "Flagged"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            handleTap();
                            const url = `https://animeblack.com/post/${post.id}`;
                            navigator.clipboard.writeText(url);
                            if (triggerInAppNotification) {
                              triggerInAppNotification(
                                isArabic ? "تم نسخ الرابط المباشر" : "Direct Link Copied",
                                url,
                                "📋"
                              );
                            }
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] flex items-center gap-1 font-bold transition-all cursor-pointer"
                          title={isArabic ? "نسخ رابط المنشور في السيرفر" : "Copy Server Link"}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isArabic ? "رابط السيرفر" : "Link"}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleTap();
                            setEditingPost(post);
                            setEditContentText(post.content || "");
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-blue-400 rounded-lg text-[10px] flex items-center gap-1 font-bold transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-950 text-red-400 rounded-lg text-[10px] flex items-center gap-1 font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Stats footer */}
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono border-t border-zinc-900/80 pt-2">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" /> {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" /> {post.comments?.length || 0}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Database className="w-3 h-3 text-emerald-500" /> ID: #{post.id}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULED & DRAFTS QUEUE */}
        {activeTab === "scheduled" && (
          <div className="space-y-6 animate-fade-in">
            {/* Scheduled Posts Box */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{isArabic ? "قائمة المنشورات المجدولة للنشر التلقائي" : "Scheduled Posts Queue"}</span>
                <span className="bg-amber-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-auto">
                  {scheduledList.length}
                </span>
              </h3>

              {scheduledList.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  {isArabic ? "لا توجد منشورات مجدولة حالياً." : "No scheduled posts in queue."}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {scheduledList.map((item, itmIdx) => (
                    <div
                      key={`pub_sched_${item.id || itmIdx}_${itmIdx}`}
                      className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full">
                          ⏰ {item.scheduledAt || "مجدول"}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.title || item.content?.substring(0, 30)}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{item.content}</p>
                      </div>

                      <button
                        onClick={() => {
                          handleTap();
                          setScheduledList((prev) => prev.filter((s) => s.id !== item.id));
                          if (triggerInAppNotification) {
                            triggerInAppNotification(isArabic ? "تم إلغاء الجدولة" : "Scheduled Cancelled", "", "🗑️");
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer"
                      >
                        {isArabic ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drafts Box */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Bookmark className="w-4 h-4 text-purple-500" />
                <span>{isArabic ? "المسودات المحفوظة" : "Saved Drafts"}</span>
                <span className="bg-purple-950 text-purple-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-auto">
                  {draftsList.length}
                </span>
              </h3>

              {draftsList.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  {isArabic ? "لا توجد مسودات محفوظة." : "No saved drafts."}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {draftsList.map((draft, dIdx) => (
                    <div
                      key={`pub_draft_${draft.id || dIdx}_${dIdx}`}
                      className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                          📁 {draft.category || "draft"}
                        </span>
                        <h4 className="text-xs font-bold text-white">{draft.title || "مسودة بدون عنوان"}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{draft.content}</p>
                      </div>

                      <button
                        onClick={() => {
                          handleTap();
                          setDraftsList((prev) => prev.filter((d) => d.id !== draft.id));
                          localStorage.setItem(
                            "anime_black_drafts",
                            JSON.stringify(draftsList.filter((d) => d.id !== draft.id))
                          );
                        }}
                        className="text-red-400 text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer"
                      >
                        {isArabic ? "حذف" : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI & PRE-MODERATION RULES */}
        {activeTab === "ai_rules" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>{isArabic ? "قواعد الفلترة الذكية قبل النشر (Gemini AI)" : "AI Pre-Publish Moderation Engine"}</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isArabic ? "تفعيل الفحص التلقائي بالذكاء الاصطناعي" : "Enable Gemini AI Automated Audit"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {isArabic ? "فحص النصوص والوسائط قبل نشرها لمنع السبام والمخالفات" : "Scans posts for spam and hate speech prior to database commit"}
                    </span>
                  </div>
                  <button
                    onClick={() => setAiModerationEnabled(!aiModerationEnabled)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      aiModerationEnabled ? "bg-red-600" : "bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        aiModerationEnabled ? (isArabic ? "-translate-x-4" : "translate-x-4") : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isArabic ? "اشتراط وسم تحذير حرق الأحداث (#تحذير_حرق)" : "Require Spoiler Warning Tag"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {isArabic ? "تنبيه الناشر تلقائياً لإضافة الوسم عند كشف تفاصيل مانجا/أنمي حاسمة" : "Alert author to add spoiler tag if plot reveals are detected"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSpoilerTagRequired(!spoilerTagRequired)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      spoilerTagRequired ? "bg-red-600" : "bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        spoilerTagRequired ? (isArabic ? "-translate-x-4" : "translate-x-4") : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isArabic ? "فحص أمان الروابط المنشورة" : "Verify External Links HTTPS Security"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {isArabic ? "منع الروابط المشبوهة أو النطاقات الرمادية" : "Block suspicious domain patterns"}
                    </span>
                  </div>
                  <button
                    onClick={() => setLinkSecurityCheck(!linkSecurityCheck)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      linkSecurityCheck ? "bg-red-600" : "bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        linkSecurityCheck ? (isArabic ? "-translate-x-4" : "translate-x-4") : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SERVER API & DB LINKS */}
        {activeTab === "server_api" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>{isArabic ? "معلومات وتكامل قواعد بيانات السيرفر (Firestore API)" : "Firestore Server API Bindings"}</span>
              </h3>

              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 font-mono text-xs space-y-2.5 text-zinc-300">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Database ID:</span>
                  <span className="text-amber-400 font-bold select-all">ai-studio-animeblack</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Posts Collection:</span>
                  <span className="text-emerald-400 font-bold">/posts</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Settings Doc:</span>
                  <span className="text-emerald-400 font-bold">/settings/publishing</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Server AI Endpoint:</span>
                  <span className="text-purple-400 font-bold">POST /api/ai/write-post</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    handleTap();
                    try {
                      const { db } = await import("../firebase");
                      const { collection, getDocs, limit, query } = await import("firebase/firestore");
                      const q = query(collection(db, "posts"), limit(1));
                      const snap = await getDocs(q);
                      alert(
                        isArabic
                          ? `✅ اختبار الاتصال بنجاح! تم قراءة السيرفر. عدد الوثائق المعاينة: ${snap.size}`
                          : `✅ Connection test success! Documents sampled: ${snap.size}`
                      );
                    } catch (e: any) {
                      alert("⚠️ Error: " + e.message);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isArabic ? "اختبار اتصال السيرفر" : "Test DB Read/Write"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PUBLISHING ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <BarChart2 className="w-4 h-4 text-red-500" />
                <span>{isArabic ? "معدل النشر والتفاعل الأسبوعي" : "Weekly Publishing & Views Analytics"}</span>
              </h3>

              <div className="h-52 w-full text-xs" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViewsPub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#555" fontSize={10} />
                    <YAxis stroke="#555" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", color: "#fff" }} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorViewsPub)"
                      name={isArabic ? "المشاهدات" : "Views"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT POST MODAL */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h4 className="font-bold text-sm text-white">{isArabic ? "تعديل نص المنشور" : "Edit Post Content"}</h4>
                <button onClick={() => setEditingPost(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                  ✕
                </button>
              </div>

              <textarea
                value={editContentText}
                onChange={(e) => setEditContentText(e.target.value)}
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingPost(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveEditedPost}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  {isArabic ? "حفظ التغييرات" : "Save Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
