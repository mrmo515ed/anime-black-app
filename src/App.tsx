import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./firestoreUtils";
import {
  Sparkles,
  Clapperboard,
  Home,
  Compass,
  PlusSquare,
  MessageCircle,
  User,
  Settings,
  Heart,
  Share2,
  Send,
  Volume2,
  Plus,
  Search,
  Bell,
  Trash2,
  Edit,
  Check,
  X,
  Menu,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Filter,
  Globe,
  RefreshCw,
  FileText,
  CheckCircle2,
  Bookmark,
  ThumbsUp,
  ChevronDown,
  Tv,
  Eye,
  Lock,
  UserCheck,
  HelpCircle,
  TrendingUp,
  Database,
  Smartphone,
  CheckSquare,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Flame, Mail, Sun, Moon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import Splash from "./components/Splash";
import Login from "./components/Login";
import CreateBottomSheet from "./components/CreateBottomSheet";
import UniversalPublisher from "./components/UniversalPublisher";
import HomeCustomizer, { HomeSection, HomeWidget, SavedLayout } from "./components/HomeCustomizer";
import MoreHub from "./components/MoreHub";
import PrivateMessagingSystem from "./components/PrivateMessagingSystem";
import { seedDatabase } from "./utils/databaseSeeder";
import { formatFriendlyDate } from "./utils/dateFormatter";
import PublicProfileModal from "./components/PublicProfileModal";
import FollowersModal from "./components/FollowersModal";
import HomeFeedEngine from "./components/HomeFeedEngine";
import UserProfileSystem from "./components/UserProfileSystem";
import CommunitiesSystem from "./components/CommunitiesSystem";
import LiveStreamingSystem from "./components/LiveStreamingSystem";
import { JstClockDisplay } from "./components/JstClockDisplay";
import EconomySystem from "./components/EconomySystem";
import AdministrationSystem from "./components/AdministrationSystem";
import ContentDiscoveryFeed from "./components/ContentDiscoveryFeed";
import LevelBadge from "./components/LevelBadge";
import LevelBadgesModal from "./components/LevelBadgesModal";
import SearchSystem from "./components/SearchSystem";
import { Post, Story, Reel, Chat, Message, Notification, User as UserType, UserRole, VerificationType, ROLE_CONFIGS, VERIFICATION_CONFIGS } from "./types";
import { NotificationDetailsPage } from "./components/NotificationDetailsPage";
import DownloadAppPage from "./components/DownloadAppPage";

export default function App() {
  // Navigation & Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "create" | "chat" | "profile" | "more">("home");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isArabic, setIsArabic] = useState(true);

  // Digital Economy (Volume 1, Chapter 3)
  const [blackCoins, setBlackCoins] = useState(380);
  const [stars, setStars] = useState(16);
  const [activeFrame, setActiveFrame] = useState<string | null>(null);

  // Overlay states for new components
  const [showCreateBottomSheet, setShowCreateBottomSheet] = useState(false);
  const [showMoreHub, setShowMoreHub] = useState(false);
  const [showPrivateMessages, setShowPrivateMessages] = useState(false);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [followersModalData, setFollowersModalData] = useState<{ userId: string; type: "followers" | "following" } | null>(null);
  const [showHomeCustomizer, setShowHomeCustomizer] = useState(false);
  const [showLiveSuite, setShowLiveSuite] = useState(false);
  const [showEconomySystem, setShowEconomySystem] = useState(false);
  const [showAdministrationSystem, setShowAdministrationSystem] = useState(false);
  const [showDownloadAppPage, setShowDownloadAppPage] = useState(false);

  useEffect(() => {
    const handleOpenProfile = (e: any) => setViewedUserId(e.detail);
    const handleOpenFollowers = (e: any) => setFollowersModalData(e.detail);
    const handleOpenDownloadApp = () => setShowDownloadAppPage(true);
    const handleFocusPostComments = (e: any) => {
      setActiveTab("home");
      setActivePostCommentsId(e.detail);
      setShowNotificationsDrawer(false);
      setTimeout(() => {
        const el = document.getElementById(`post_${e.detail}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    };
    const handleOpenLiveSuite = (e: any) => {
      setLiveSuiteMode(e.detail);
    };
    const handleOpenNotificationDetail = (e: any) => {
      setSelectedNotificationDetail(e.detail);
    };
    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openFollowers', handleOpenFollowers);
    window.addEventListener('openDownloadApp', handleOpenDownloadApp);
    window.addEventListener('focusPostComments', handleFocusPostComments);
    window.addEventListener('openLiveSuite', handleOpenLiveSuite);
    window.addEventListener('openNotificationDetail', handleOpenNotificationDetail);
    return () => {
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openFollowers', handleOpenFollowers);
      window.removeEventListener('openDownloadApp', handleOpenDownloadApp);
      window.removeEventListener('focusPostComments', handleFocusPostComments);
      window.removeEventListener('openLiveSuite', handleOpenLiveSuite);
      window.removeEventListener('openNotificationDetail', handleOpenNotificationDetail);
    };
  }, []);

  const [liveSuiteMode, setLiveSuiteMode] = useState<"call" | "stream" | "watchparty" | null>(null);
  const [liveSuiteTarget, setLiveSuiteTarget] = useState<string | null>(null);
  const [likedPostOverlayId, setLikedPostOverlayId] = useState<string | null>(null);
  const [likedReelOverlayId, setLikedReelOverlayId] = useState<string | null>(null);

  // Simulated Connectivity State (Offline Mode - Section 3.11)
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);

  // Chapter 4 UX & Accessibility States (Unified System)
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: "post" | "comment" | "message" | "image"; id: string; content?: string } | null>(null);
  const [activeMediaViewer, setActiveMediaViewer] = useState<{ url: string; type: "image" | "video"; zoom: number; speed: number; quality: "1080p" | "720p" | "480p" } | null>(null);
  const [inAppNotification, setInAppNotification] = useState<{ id: string; title: string; body: string; badge?: string } | null>(null);
  const [celebration, setCelebration] = useState<{ type: "levelup" | "prestige" | "rarebox" | "legendarycard" | "blackcoin" | "achievement" | "verification"; titleAr: string; titleEn: string; descAr: string; descEn: string; reward?: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Long press contextual timers
  const longPressTimer = useRef<any>(null);

  const handleStartLongPress = (e: React.MouseEvent | React.TouchEvent, type: "post" | "comment" | "message" | "image", id: string, content?: string) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    // Support multi-touch or cursor
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    longPressTimer.current = setTimeout(() => {
      triggerHapticFeedback("levelup");
      playSynthSound("tap");
      setContextMenu({
        x: clientX,
        y: clientY,
        type,
        id,
        content
      });
    }, 600); // 600ms hold
  };

  const handleEndLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const triggerInAppNotification = (title: string, body: string, badge?: string) => {
    triggerHapticFeedback("success");
    playSynthSound("tap");
    if (typeof (window as any).iappyx !== "undefined") {
      (window as any).iappyx.notification.send(title, body);
    }
    setInAppNotification({
      id: Math.random().toString(),
      title,
      body,
      badge
    });
    // Auto timeout after 4s
    setTimeout(() => {
      setInAppNotification(prev => prev && prev.title === title ? null : prev);
    }, 4000);
  };

  const triggerCelebration = (
    type: "levelup" | "prestige" | "rarebox" | "legendarycard" | "blackcoin" | "achievement" | "verification",
    titleAr: string,
    titleEn: string,
    descAr: string,
    descEn: string,
    reward?: string
  ) => {
    triggerHapticFeedback("levelup");
    playSynthSound("levelup");
    setCelebration({ type, titleAr, titleEn, descAr, descEn, reward });
  };

  const handlePullToRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerHapticFeedback("tap");
    playSynthSound("tap");
    setTimeout(() => {
      setIsRefreshing(false);
                        triggerHapticFeedback("success");
      playSynthSound("success");
      triggerInAppNotification(
        isArabic ? "تم تحديث الخلاصة الفورية" : "Live Feed Refreshed",
        isArabic ? "تم تحديث جميع المنشورات وقصص الأوتاكو الحالية بنجاح!" : "All anime posts and active stories updated successfully!",
        "SYSTEM"
      );
    }, 1500);
  };

  // Home Screen Layout customization (Section 3.13)
  const [sections, setSections] = useState<HomeSection[]>([
    { id: "posts", titleAr: "المنشورات والمنتدى", titleEn: "Community Posts Feed", isVisible: true, isPinned: true },
    { id: "reels", titleAr: "مقاطع ريلز المقترحة", titleEn: "Suggested Reels", isVisible: true, isPinned: false },
    { id: "news", titleAr: "أخبار الأنمي والمانجا", titleEn: "Official Otaku News", isVisible: true, isPinned: false },
    { id: "events", titleAr: "الفعاليات المباشرة والمستمرة", titleEn: "Active Events & Contests", isVisible: true, isPinned: false },
    { id: "trends", titleAr: "الهاشتاغات المتداولة", titleEn: "Trending Topics", isVisible: true, isPinned: false },
    { id: "marketplace", titleAr: "سوق البطاقات والمقتنيات", titleEn: "Collectible Marketplace", isVisible: false, isPinned: false },
    { id: "guilds", titleAr: "النقابات والتحالفات", titleEn: "Active Guilds Deck", isVisible: false, isPinned: false },
    { id: "spaces", titleAr: "عوالم الأنمي والويكي", titleEn: "Featured Spaces", isVisible: false, isPinned: false }
  ]);

  const [widgets, setWidgets] = useState<HomeWidget[]>([
    { id: "jstClock", titleAr: "ساعة اليابان JST", titleEn: "Tokyo Live JST Clock", isActive: true },
    { id: "quests", titleAr: "المهام اليومية", titleEn: "Daily Otaku Quests", isActive: true },
    { id: "digitalCard", titleAr: "الهوية الرقمية للاعب", titleEn: "Digital Pass Card", isActive: false },
    { id: "otakuMood", titleAr: "مزاج الأوتاكو اليوم", titleEn: "Otaku Hype State", isActive: false },
    { id: "xp", titleAr: "مقياس الخبرة XP", titleEn: "XP Level Meter", isActive: false },
    { id: "level", titleAr: "مستوى العضوية", titleEn: "Level Progress", isActive: false },
    { id: "blackCoin", titleAr: "محفظة العملات السوداء", titleEn: "Black Coin Wallet", isActive: false },
    { id: "stars", titleAr: "النجوم المكتسبة", titleEn: "Cosmic Stars", isActive: false },
    { id: "events_indicator", titleAr: "الفعاليات السريعة", titleEn: "Events Indicator", isActive: false },
    { id: "favAnime", titleAr: "الأنمي المفضل", titleEn: "Favorite Anime", isActive: false },
    { id: "manga", titleAr: "متابعة المانجا", titleEn: "Manga Progress", isActive: false },
    { id: "activeFriends", titleAr: "الأصدقاء النشطون", titleEn: "Active Friends", isActive: false },
    { id: "my_guilds", titleAr: "نقابتي الحالية", titleEn: "My Active Guild", isActive: false },
    { id: "my_spaces", titleAr: "عوالمني النشطة", titleEn: "My Spaces Hub", isActive: false },
    { id: "shop_items", titleAr: "عناصر المتجر الشائعة", titleEn: "Hot Shop Items", isActive: false },
    { id: "themeStore", titleAr: "متجر المظهر والثيمات", titleEn: "Theme Store Widget", isActive: false },
    { id: "news_ticker", titleAr: "شريط العناوين الساخنة", titleEn: "Hot Headlines Ticker", isActive: false },
    { id: "trends_ticker", titleAr: "ترندات الأنمي", titleEn: "Trends Ticker", isActive: false }
  ]);

  const [cardSize, setCardSize] = useState<"small" | "medium" | "large">("medium");
  const [viewType, setViewType] = useState<"grid" | "list" | "compact">("grid");

  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);

  // Appearance Mode System (Dark / Light Mode)
  const [appearanceMode, setAppearanceModeState] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("animeblack_appearance_mode");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  const setAppearanceMode = (mode: "dark" | "light") => {
    setAppearanceModeState(mode);
    localStorage.setItem("animeblack_appearance_mode", mode);
    if (currentUser) {
      const updatedUser = { ...currentUser, appearanceMode: mode };
      setCurrentUser(updatedUser);
      localStorage.setItem("animeblack_offline_user", JSON.stringify(updatedUser));
      if (currentUser.id || currentUser.uid) {
        const uId = currentUser.id || currentUser.uid;
        updateDoc(doc(db, "users", uId), { appearanceMode: mode }).catch(() => {});
      }
    }
  };
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [hapticFeedbackToast, setHapticFeedbackToast] = useState<string | null>(null);

  // Sound Synthesizer via Web Audio API
  const playSynthSound = (type: "tap" | "success" | "purchase" | "levelup" | "error") => {
    if (!soundEffectsEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "tap") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "purchase") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.15);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "levelup") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.55);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.error("AudioContext failed:", e);
    }
  };

  // Haptic Feedback Simulation (Vibration API + UI Toast)
  const triggerHapticFeedback = (type: "success" | "error" | "purchase" | "levelup" | "tap") => {
    if (!hapticsEnabled) return;
    let pattern = [50];
    let description = "";
    if (type === "success") {
      pattern = [40, 50, 40];
      description = isArabic ? "اهتزاز النجاح: نبضتان خفيفتان (● ●)" : "Success Haptic: Double Pulse (● ●)";
    } else if (type === "error") {
      pattern = [120];
      description = isArabic ? "اهتزاز الخطأ: نبضة واحدة قوية (▮)" : "Error Haptic: Heavy Single Pulse (▮)";
    } else if (type === "purchase") {
      pattern = [30];
      description = isArabic ? "اهتزاز الشراء: نقرة واحدة سريعة (•)" : "Purchase Haptic: Short Sharp Tick (•)";
    } else if (type === "levelup") {
      pattern = [30, 40, 60, 80];
      description = isArabic ? "اهتزاز الصعود: نبضات متصاعدة (• ● ▮)" : "Level Up Haptic: Ascending Ripple (• ● ▮)";
    } else {
      pattern = [15];
      description = isArabic ? "اهتزاز اللمس: نقرة خفيفة للغاية" : "Tap Haptic: Minimal Click";
    }

    if (typeof (window as any).iappyx !== "undefined") {
      const bridge = (window as any).iappyx;
      if (type === "success") bridge.vibration.pattern("0,40,50,40");
      else if (type === "error") bridge.vibration.heavyClick();
      else if (type === "purchase") bridge.vibration.tick();
      else if (type === "levelup") bridge.vibration.pattern("0,30,40,60,80");
      else bridge.vibration.click();
    } else if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }

    setHapticFeedbackToast(description);
    setTimeout(() => {
      setHapticFeedbackToast(prev => prev === description ? null : prev);
    }, 2000);
  };

  // Database lists (fetched from backend or synced)
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState<Notification | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Active chat conversation
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState("");

  // Create Post Form States
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newPostPollQuestion, setNewPostPollQuestion] = useState("");
  const [newPostPollOptions, setNewPostPollOptions] = useState(["", ""]);
  
  // AI Tools states
  const [aiWriterPrompt, setAiWriterPrompt] = useState("");
  const [aiWriterTone, setAiWriterTone] = useState("حماسي ومثير");
  const [isAiWriting, setIsAiWriting] = useState(false);

  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [aiImageRatio, setAiImageRatio] = useState("1:1");
  const [isAiGeneratingImage, setIsAiGeneratingImage] = useState(false);

  // Interactive Overlays
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryCreateModal, setShowStoryCreateModal] = useState(false);
  const [newStoryMedia, setNewStoryMedia] = useState("");
  const [newStoryQuestion, setNewStoryQuestion] = useState("");
  
  const [activePostCommentsId, setActivePostCommentsId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"all" | "users" | "posts" | "reels">("all");
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [exploreSubTab, setExploreSubTab] = useState<"search" | "ai">("ai");

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchedUsers([]);
        return;
      }
      try {
        const { db } = await import('./firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserType))
          .filter(u => 
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.username?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        setSearchedUsers(results);
      } catch (e) {
        console.error(e);
      }
    };
    
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Notifications drawer
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // TTS Voice Simulation
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Live Tokyo JST Time (Section 3.13)

  // New posts indicator
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const lastViewedPostIdRef = useRef<string | null>(null);

  const unreadCount = useMemo(() => {
    if (posts.length === 0) return 0;
    if (!hasNewPosts) return 0;
    if (!lastViewedPostIdRef.current) return 0;
    const lastIndex = posts.findIndex(p => p.id === lastViewedPostIdRef.current);
    if (lastIndex === -1) {
      return 1; // Default to at least 1 if we have new posts but the old reference is loaded out
    }
    return lastIndex;
  }, [posts, hasNewPosts]);

  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef(false);

  const startLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setShowTooltip(true);
      playSynthSound("success");
      triggerHapticFeedback("success");
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    if (posts.length > 0) {
      const newestPostId = posts[0].id;
      if (lastViewedPostIdRef.current !== null && newestPostId !== lastViewedPostIdRef.current) {
        if (activeTab !== "home" || showAdmin) {
          setHasNewPosts(true);
        } else {
          lastViewedPostIdRef.current = newestPostId;
        }
      } else if (lastViewedPostIdRef.current === null) {
        lastViewedPostIdRef.current = newestPostId;
      }
    }
  }, [posts, activeTab, showAdmin]);

  useEffect(() => {
    if (activeTab === "home" && !showAdmin) {
      setHasNewPosts(false);
      if (posts.length > 0) {
        lastViewedPostIdRef.current = posts[0].id;
      }
    }
  }, [activeTab, showAdmin, posts]);

  // Auto scroll reference for chats
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-sync currentUser changes to Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const syncTimeout = setTimeout(async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          let needsUpdate = false;
          for (const key of Object.keys(currentUser)) {
            if (currentUser[key as keyof typeof currentUser] !== currentData[key]) {
              needsUpdate = true;
              break;
            }
          }
          if (needsUpdate) {
             await updateDoc(userRef, {
               ...currentUser,
               updatedAt: new Date().toISOString()
             });
             console.log("Auto-synced user data to Firestore.");
          }
        }
      } catch (err) {
        console.error("Failed to auto-sync user data:", err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(syncTimeout);
  }, [currentUser]);

  // Fetch initial collections
  useEffect(() => {
    // 1. Initial check for existing local offline/bypass session
    const offlineSession = localStorage.getItem("animeblack_offline_user");
    if (offlineSession) {
      try {
        const parsed = JSON.parse(offlineSession);
        setCurrentUser(parsed);
        if (parsed.appearanceMode) setAppearanceModeState(parsed.appearanceMode);
        if (parsed.coins) setBlackCoins(parsed.coins);
      } catch (e) {
        console.error("Failed to parse offline session:", e);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If we got a real user login, remove any stale offline user session
        localStorage.removeItem("animeblack_offline_user");
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const ud = userDoc.data();
            if (ud.homeSections) setSections(ud.homeSections);
            if (ud.homeWidgets) setWidgets(ud.homeWidgets);
            if (ud.homeCardSize) setCardSize(ud.homeCardSize);
            if (ud.homeViewType) setViewType(ud.homeViewType);
            setCurrentUser({
              name: ud.name,
              username: ud.username,
              avatar: ud.avatar,
              cover: ud.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
              bio: ud.bio || "",
              uid: user.uid,
              isVerified: ud.isVerified || false,
              role: ud.role || "Member",
              level: ud.level || (ud.role === "Owner" ? 99 : 1),
              xp: ud.xp || (ud.role === "Owner" ? 49500 : 0),
              prestige: ud.prestige || (ud.role === "Owner" ? 5 : 0),
              coins: ud.coins || 100,
              stars: ud.stars || 0,
              reputation: ud.reputation || (ud.role === "Owner" ? 100 : 85),
              activityIndex: ud.activityIndex || 94,
              consecutiveDays: ud.consecutiveDays || 1,
              joinedDate: ud.joinedDate || new Date().toISOString(),
              country: ud.country || "السعودية",
              language: ud.language || "العربية",
              interests: ud.interests || ["أنمي", "مانجا"],
              favAnime: ud.favAnime || [],
              favManga: ud.favManga || [],
              favCharacters: ud.favCharacters || [],
              theme: ud.theme || "default",
              frame: ud.avatarFrame || null,
              titles: ud.titles || ["Rookie"],
              activeTitle: ud.activeTitle || (ud.role === "Owner" ? "Anime Black Legend" : "Rookie"),
              medals: ud.medals || [],
              achievements: ud.achievements || [],
              followersCount: ud.followersCount || 0,
              followingCount: ud.followingCount || 0,
              postsCount: ud.postsCount || 0,
              reelsCount: ud.reelsCount || 0,
              storiesCount: ud.storiesCount || 0,
              engagementRate: ud.engagementRate || 0,
              visibility: ud.visibility || {
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
            } as any);
          } else {
            // Fallback for new user with no profile doc yet
            const emailPrefix = user.email ? user.email.split("@")[0] : "otaku";
            setCurrentUser({
              name: user.displayName || emailPrefix,
              username: emailPrefix,
              avatar: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
              bio: "أنا أوتاكو غامض ومحب للأنمي! 🌟",
              uid: user.uid,
              isVerified: false,
              role: "Member",
              level: 1,
              xp: 0,
              prestige: 0,
              coins: 100,
              stars: 0,
              reputation: 85,
              activityIndex: 94,
              consecutiveDays: 1,
              joinedDate: new Date().toISOString(),
              country: "السعودية",
              language: "العربية",
              interests: ["أنمي", "مانجا"],
              favAnime: [],
              favManga: [],
              favCharacters: [],
              theme: "default",
              frame: null,
              titles: ["Rookie"],
              activeTitle: "Rookie",
              medals: [],
              achievements: [],
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              reelsCount: 0,
              storiesCount: 0,
              engagementRate: 0,
              visibility: {
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
            } as any);
          }
        } catch (error) {
          console.warn("⚠️ [Auth User Retrieval] Offline mode active or profile not found in Firestore. Loaded local profile backup.", error);
          // Load a safe local profile as fallback to keep app fully operational
          const emailPrefix = user.email ? user.email.split("@")[0] : "otaku";
          setCurrentUser({
            name: user.displayName || emailPrefix,
            username: emailPrefix,
            avatar: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            bio: "أنا أوتاكو غامض ومحب للأنمي! 🌟 (وضع الأوفلاين)",
            uid: user.uid,
            isVerified: false,
            role: "Member",
            level: 1,
            xp: 0,
            prestige: 0,
            coins: 100,
            stars: 0,
            reputation: 85,
            activityIndex: 94,
            consecutiveDays: 1,
            joinedDate: new Date().toISOString(),
            country: "السعودية",
            language: "العربية",
            interests: ["أنمي", "مانجا"],
            favAnime: [],
            favManga: [],
            favCharacters: [],
            theme: "default",
            frame: null,
            titles: ["Rookie"],
            activeTitle: "Rookie",
            medals: [],
            achievements: [],
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            reelsCount: 0,
            storiesCount: 0,
            engagementRate: 0,
            visibility: {
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
          } as any);
        }
      } else {
        if (!localStorage.getItem("animeblack_offline_user")) {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Synchronize dynamic online/offline status in Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Set user online
    const userDocRef = doc(db, "users", currentUser.uid);
    updateDoc(userDocRef, { isOnline: true }).catch(err => {
      console.warn("Could not set isOnline to true in Firestore:", err);
    });

    const handleBeforeUnload = () => {
      updateDoc(userDocRef, { isOnline: false }).catch(() => {});
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Set user offline
      updateDoc(userDocRef, { isOnline: false }).catch(() => {});
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      // Also seed database once if posts are empty (for new deployments)
      if (data.length === 0) {
        seedDatabase().catch(console.error);
      }
      setPosts(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "posts");
      setIsOffline(true);
    });
    
    const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "stories");
      setIsOffline(true);
    });

    const reelsQuery = query(collection(db, "reels"), orderBy("createdAt", "desc"));
    const unsubscribeReels = onSnapshot(reelsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reel));
      setReels(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "reels");
      setIsOffline(true);
    });
    
    const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chats");
      setIsOffline(true);
    });
    
    let unsubscribeNotifications = () => {};
    if (currentUser) {
        const notifsQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
        unsubscribeNotifications = onSnapshot(notifsQuery, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
          setNotifications(data);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "notifications");
          setIsOffline(true);
        });
    }
    
    fetchAdminStats();
    
    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeReels();
      unsubscribeChats();
      unsubscribeNotifications();
    };
  }, [currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setAdminStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Liking a post
  const handleLikePost = async (id: string) => {
    if (isOffline) {
      setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + (p.hasLiked ? -1 : 1), hasLiked: !p.hasLiked } : p));
      setOfflineQueue(prev => [...prev, isArabic ? "الإعجاب بمنشور" : "Like post"]);
      triggerHapticFeedback("success");
      playSynthSound("tap");
      return;
    }
    try {
      const { db } = await import('./firebase');
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      
      const postRef = doc(db, "posts", id);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const p = postSnap.data();
        const currentPost = posts.find(post => post.id === id);
        const hasLiked = currentPost?.hasLiked;
        
        await updateDoc(postRef, {
          likes: (p.likes || 0) + (hasLiked ? -1 : 1)
        });
        
        setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + (hasLiked ? -1 : 1), hasLiked: !hasLiked } : p));
        triggerHapticFeedback("success");
        playSynthSound("tap");
      }
    } catch (e) {
      import('./firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${id}`);
      }).catch(() => {});
    }
  };

  // Liking a reel
  const handleLikeReel = async (id: string) => {
    if (isOffline) {
      setReels(reels.map(r => r.id === id ? { ...r, likes: r.likes + (r.hasLiked ? -1 : 1), hasLiked: !r.hasLiked } : r));
      setOfflineQueue(prev => [...prev, isArabic ? "الإعجاب بريلز" : "Like reel"]);
      triggerHapticFeedback("success");
      playSynthSound("tap");
      return;
    }
    try {
      const res = await postJson(`/api/reels/${id}/like`, {});
      const updatedReel = await res.json();
      setReels(reels.map(r => r.id === id ? updatedReel : r));
      triggerHapticFeedback("success");
      playSynthSound("tap");
    } catch (e) {
      console.error(e);
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    
    const commentId = "temp_c_" + Date.now();
    const tempComment = {
      id: commentId,
      author: currentUser?.name || "Anonymous Otaku",
      text: newCommentText,
      createdAt: new Date().toISOString()
    };
    
    // Save original text in case we need to restore/revert
    const originalText = newCommentText;
    
    if (isOffline) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments||[]), tempComment] } : p));
      setNewCommentText("");
      setOfflineQueue(prev => [...prev, isArabic ? "إضافة تعليق على منشور" : "Add comment to post"]);
      triggerHapticFeedback("success");
      playSynthSound("tap");
      return;
    }

    // Optimistic UI Update immediately for instant response
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments||[]), tempComment] } : p));
    setNewCommentText("");
    triggerHapticFeedback("success");
    playSynthSound("tap");

    try {
      const { db } = await import('./firebase');
      const { doc, getDoc, updateDoc, collection, addDoc } = await import('firebase/firestore');
      
      // Get AI Moderation settings
      let modPolicy = "review_by_human";
      let isHateSpeechOn = true;
      let isNudityOn = true;
      let isSpamOn = true;
      let confThreshold = 75;

      try {
        const settingsSnap = await getDoc(doc(db, "settings", "moderation"));
        if (settingsSnap.exists()) {
          const sData = settingsSnap.data();
          if (sData.policy) modPolicy = sData.policy;
          if (sData.hateSpeechEnabled !== undefined) isHateSpeechOn = sData.hateSpeechEnabled;
          if (sData.nudityEnabled !== undefined) isNudityOn = sData.nudityEnabled;
          if (sData.spamEnabled !== undefined) isSpamOn = sData.spamEnabled;
          if (sData.confidenceThreshold !== undefined) confThreshold = sData.confidenceThreshold;
        }
      } catch (eSettings) {
        console.warn("Failed to load moderation settings, using default review mode:", eSettings);
      }

      let isFlaggedByAI = false;
      let aiCategory = "safe";
      let aiConfidence = 1.0;
      let aiReasonEn = "";
      let aiReasonAr = "";

      if (originalText.trim() && (isHateSpeechOn || isNudityOn || isSpamOn)) {
        try {
          const modRes = await fetch("/api/ai/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: originalText, contentType: "comment" })
          });
          if (modRes.ok) {
            const modData = await modRes.json();
            const isCategoryEnabled = 
              (modData.category === "hate_speech" && isHateSpeechOn) ||
              (modData.category === "nudity" && isNudityOn) ||
              (modData.category === "spam" && isSpamOn);

            if (modData.flagged && isCategoryEnabled && (modData.confidence * 100) >= confThreshold) {
              isFlaggedByAI = true;
              aiCategory = modData.category;
              aiConfidence = modData.confidence;
              aiReasonEn = modData.reasonEn;
              aiReasonAr = modData.reasonAr;
            }
          }
        } catch (modErr) {
          console.error("AI Moderation API error during comment submission:", modErr);
        }
      }

      if (isFlaggedByAI && modPolicy === "automated_removal") {
        // Rollback optimistic comment
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
        
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "⚠️ تعليق غير لائق" : "⚠️ Inappropriate Comment",
            isArabic 
              ? `تم حظر تعليقك تلقائياً بواسطة الذكاء الاصطناعي: ${aiReasonAr}` 
              : `Your comment was automatically blocked by AI: ${aiReasonEn}`,
            "error"
          );
        }
        if (playSynthSound) playSynthSound("error");
        triggerHapticFeedback("error");
        return; // Block comment submission completely!
      }

      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const p = postSnap.data();
        const serverCommentId = "c_" + Date.now();
        const newComment = {
          id: serverCommentId,
          author: currentUser?.name || "Anonymous",
          text: originalText,
          flagged: isFlaggedByAI,
          moderationStatus: isFlaggedByAI ? "pending" : "approved",
          createdAt: new Date().toISOString()
        };

        if (isFlaggedByAI && modPolicy === "review_by_human") {
          try {
            await addDoc(collection(db, "moderation_reports"), {
              id: "rep_" + Date.now(),
              contentType: "comment",
              contentId: serverCommentId,
              content: originalText,
              authorId: currentUser?.uid || "",
              authorName: currentUser?.name || "Otaku",
              flaggedCategory: aiCategory,
              confidence: aiConfidence,
              reasonEn: aiReasonEn,
              reasonAr: aiReasonAr,
              status: "pending",
              createdAt: new Date().toISOString(),
              actionTaken: "flagged_for_review"
            });
          } catch (repErr) {
            console.error(repErr);
          }

          if (triggerInAppNotification) {
            triggerInAppNotification(
              isArabic ? "⚠️ تم وضع علامة مراجعة" : "⚠️ Comment Flagged",
              isArabic 
                ? "تم إرسال التعليق ولكنه بانتظار المراجعة بسبب سياسة الذكاء الاصطناعي." 
                : "Comment submitted but marked for review due to AI policies.",
              "warning"
            );
          }
        }

        // Merge with existing comments and replace the optimistic one with the finalized one
        const currentComments = p.comments || [];
        const updatedComments = [...currentComments.filter((c: any) => c.id !== commentId), newComment];
        
        await updateDoc(postRef, {
          comments: updatedComments
        });
        
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
      }
    } catch (e) {
      // Rollback optimistic comment on write error
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
      import('./firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
      }).catch(() => {});
    }
  };

  // Vote on Polls
  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (isOffline) {
      setPosts(posts.map(p => {
        if (p.id !== postId || !p.poll) return p;
        const newOpts = p.poll.options.map((o, i) => i === optionIndex ? { ...o, votes: o.votes + 1 } : o);
        return {
          ...p,
          poll: {
            ...p.poll,
            options: newOpts,
            totalVotes: p.poll.totalVotes + 1,
            userVotedIndex: optionIndex
          }
        };
      }));
      setOfflineQueue(prev => [...prev, isArabic ? "التصويت في استفتاء" : "Vote on poll"]);
      triggerHapticFeedback("success");
      playSynthSound("success");
      return;
    }
    try {
      const res = await postJson(`/api/posts/${postId}/poll/vote`, { optionIndex });
      const updatedPost = await res.json();
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
      triggerHapticFeedback("success");
      playSynthSound("success");
    } catch (e) {
      console.error(e);
    }
  };

  // Create Story
  const handleCreateStory = async () => {
    if (!newStoryMedia) return;
    if (isOffline) {
      const offlineStory = {
        id: "offline_story_" + Date.now(),
        author: {
          name: currentUser?.name || "Otaku",
          avatar: currentUser?.avatar || ""
        },
        mediaType: "image",
        url: newStoryMedia,
        question: newStoryQuestion || null,
        views: 0,
        createdAt: new Date().toISOString()
      } as any;
      setStories([offlineStory, ...stories]);
      setShowStoryCreateModal(false);
      setNewStoryMedia("");
      setNewStoryQuestion("");
      setOfflineQueue(prev => [...prev, isArabic ? "نشر قصة أنمي" : "Add story"]);
      triggerHapticFeedback("success");
      playSynthSound("success");
      return;
    }
    try {
      const { db } = await import('./firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const storyData = {
        authorId: currentUser?.uid || "",
        author: {
          name: currentUser?.name,
          avatar: currentUser?.avatar
        },
        mediaType: "image",
        url: newStoryMedia,
        question: newStoryQuestion || null,
        views: 0,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "stories"), storyData);
      
      const displayStory = {
        ...storyData,
        id: docRef.id,
        createdAt: new Date().toISOString()
      };
      
      setStories([displayStory as unknown as Story, ...stories]);
      setShowStoryCreateModal(false);
      setNewStoryMedia("");
      setNewStoryQuestion("");
      triggerHapticFeedback("success");
      playSynthSound("success");
    } catch (e) {
      console.error(e);
      // Fallback
      try {
        const res = await postJson("/api/stories", {
          author: {
            name: currentUser?.name,
            avatar: currentUser?.avatar
          },
          mediaType: "image",
          url: newStoryMedia,
          question: newStoryQuestion || null
        });
        const newStoryObj = await res.json();
        setStories([newStoryObj, ...stories]);
        setShowStoryCreateModal(false);
        setNewStoryMedia("");
        setNewStoryQuestion("");
        triggerHapticFeedback("success");
        playSynthSound("success");
      } catch (err) {}
    }
  };

  // Generate AI Post Text
  const handleGenerateAiText = async () => {
    if (!aiWriterPrompt.trim()) return;
    setIsAiWriting(true);
    try {
      const res = await postJson("/api/ai/write-post", {
        prompt: aiWriterPrompt,
        tone: aiWriterTone
      });
      const data = await res.json();
      if (data.result) {
        setNewPostText(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiWriting(false);
    }
  };

  // Generate AI Image
  const handleGenerateAiImage = async () => {
    if (!aiImagePrompt.trim()) return;
    setIsAiGeneratingImage(true);
    try {
      const res = await postJson("/api/ai/generate-image", {
        prompt: aiImagePrompt,
        aspectRatio: aiImageRatio
      });
      const data = await res.json();
      if (data.imageUrl) {
        setNewPostImage(data.imageUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGeneratingImage(false);
    }
  };

  // Post Submission
  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImage) return;

    let pollData = null;
    if (newPostPollQuestion.trim() && newPostPollOptions[0].trim()) {
      pollData = {
        question: newPostPollQuestion,
        options: newPostPollOptions.filter(o => o.trim() !== "").map(o => ({ text: o, votes: 0 })),
        totalVotes: 0,
        userVotedIndex: null
      };
    }

    try {
      const { db } = await import('./firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Get AI Moderation settings from Firestore first
      let modPolicy = "review_by_human";
      let isHateSpeechOn = true;
      let isNudityOn = true;
      let isSpamOn = true;
      let confThreshold = 75;

      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const settingsSnap = await getDoc(doc(db, "settings", "moderation"));
        if (settingsSnap.exists()) {
          const sData = settingsSnap.data();
          if (sData.policy) modPolicy = sData.policy;
          if (sData.hateSpeechEnabled !== undefined) isHateSpeechOn = sData.hateSpeechEnabled;
          if (sData.nudityEnabled !== undefined) isNudityOn = sData.nudityEnabled;
          if (sData.spamEnabled !== undefined) isSpamOn = sData.spamEnabled;
          if (sData.confidenceThreshold !== undefined) confThreshold = sData.confidenceThreshold;
        }
      } catch (eSettings) {
        console.warn("Failed to load moderation settings, using default review mode:", eSettings);
      }

      let isFlaggedByAI = false;
      let aiCategory = "safe";
      let aiConfidence = 1.0;
      let aiReasonEn = "";
      let aiReasonAr = "";

      if (newPostText.trim() && (isHateSpeechOn || isNudityOn || isSpamOn)) {
        try {
          const modRes = await fetch("/api/ai/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: newPostText, contentType: "post" })
          });
          if (modRes.ok) {
            const modData = await modRes.json();
            
            // Check if flagged category matches one of the enabled modules, and confidence is high enough
            const isCategoryEnabled = 
              (modData.category === "hate_speech" && isHateSpeechOn) ||
              (modData.category === "nudity" && isNudityOn) ||
              (modData.category === "spam" && isSpamOn);

            if (modData.flagged && isCategoryEnabled && (modData.confidence * 100) >= confThreshold) {
              isFlaggedByAI = true;
              aiCategory = modData.category;
              aiConfidence = modData.confidence;
              aiReasonEn = modData.reasonEn;
              aiReasonAr = modData.reasonAr;
            }
          }
        } catch (modErr) {
          console.error("AI Moderation API error during submission:", modErr);
        }
      }

      if (isFlaggedByAI && modPolicy === "automated_removal") {
        // Create moderation report doc in Firestore (status removed)
        try {
          const reportsRef = collection(db, "moderation_reports");
          await addDoc(reportsRef, {
            id: "rep_" + Date.now(),
            contentType: "post",
            contentId: "blocked_" + Date.now(),
            content: newPostText,
            authorId: currentUser?.uid || "",
            authorName: currentUser?.name || "Otaku",
            flaggedCategory: aiCategory,
            confidence: aiConfidence,
            reasonEn: aiReasonEn,
            reasonAr: aiReasonAr,
            status: "removed",
            createdAt: new Date().toISOString(),
            actionTaken: "automated_removed"
          });
        } catch (repErr) {
          console.error("Failed to write moderation report:", repErr);
        }

        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "⚠️ محتوى غير لائق" : "⚠️ Inappropriate Content",
            isArabic 
              ? `تم حظر هذا المنشور تلقائياً بواسطة الذكاء الاصطناعي: ${aiReasonAr}` 
              : `This post was automatically blocked by AI: ${aiReasonEn}`,
            "error"
          );
        }
        if (playSynthSound) playSynthSound("error");
        triggerHapticFeedback("error");
        return; // Block post submission completely!
      }

      const postData = {
        authorId: currentUser?.uid || "",
        author: {
          name: currentUser?.name,
          username: currentUser?.username,
          avatar: currentUser?.avatar,
          isVerified: currentUser?.isVerified || false
        },
        content: newPostText,
        image: newPostImage || null,
        video: null,
        likes: 0,
        poll: pollData,
        flagged: isFlaggedByAI,
        moderationStatus: isFlaggedByAI ? "pending" : "approved",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "posts"), postData);

      if (isFlaggedByAI && modPolicy === "review_by_human") {
        // Create moderation report doc in Firestore (status pending)
        try {
          const reportsRef = collection(db, "moderation_reports");
          await addDoc(reportsRef, {
            id: "rep_" + Date.now(),
            contentType: "post",
            contentId: docRef.id,
            content: newPostText,
            authorId: currentUser?.uid || "",
            authorName: currentUser?.name || "Otaku",
            flaggedCategory: aiCategory,
            confidence: aiConfidence,
            reasonEn: aiReasonEn,
            reasonAr: aiReasonAr,
            status: "pending",
            createdAt: new Date().toISOString(),
            actionTaken: "flagged_for_review"
          });
        } catch (repErr) {
          console.error("Failed to write moderation report:", repErr);
        }

        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "⚠️ تم وضع علامة مراجعة" : "⚠️ Flagged for Review",
            isArabic 
              ? "تم وضع علامة على هذا المنشور للمراجعة البشرية بواسطة الذكاء الاصطناعي." 
              : "This post was flagged by AI and is currently pending human moderator review.",
            "warning"
          );
        }
      }
      
      const displayPost = { 
        ...postData, 
        id: docRef.id, 
        createdAt: new Date().toISOString(), 
        hasLiked: false, 
        comments: [] 
      };
      
      setPosts([displayPost as unknown as Post, ...posts]);
      
      // Clear inputs
      setNewPostText("");
      setNewPostImage("");
      setNewPostPollQuestion("");
      setNewPostPollOptions(["", ""]);
      setAiWriterPrompt("");
      setAiImagePrompt("");
      setActiveTab("home");
    } catch (e) {
      console.error(e);
      // Fallback to mock API if firestore fails (e.g., rules block)
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: {
              name: currentUser?.name,
              username: currentUser?.username,
              avatar: currentUser?.avatar,
              isVerified: true
            },
            content: newPostText,
            image: newPostImage || null,
            poll: pollData
          })
        });
        const newPostObj = await res.json();
        setPosts([newPostObj, ...posts]);
        setNewPostText("");
        setNewPostImage("");
        setNewPostPollQuestion("");
        setNewPostPollOptions(["", ""]);
        setAiWriterPrompt("");
        setAiImagePrompt("");
        setActiveTab("home");
      } catch (err) {
        console.error("Fallback failed", err);
      }
    }
  };

  // Send Chat Message (Optionally trigger Gemini AI)
  const handleSendChatMessage = async () => {
    if (!chatMessageInput.trim() || !activeChatId) return;
    const currentInput = chatMessageInput;
    setChatMessageInput("");

    try {
      const res = await postJson(`/api/chats/${activeChatId}/messages`, {
        sender: "user",
        senderName: currentUser?.name || "أنت",
        text: currentInput
      });
      const data = await res.json();
      
      // Update local state with the user message and potential AI message
      setChats(chats.map(c => c.id === activeChatId ? data.chat : c));
    } catch (e) {
      console.error(e);
    }
  };

  // Summarize post content with AI
  const handleSummarizePost = async (postId: string, text: string) => {
    try {
      const res = await postJson("/api/ai/summarize", { text });
      const data = await res.json();
      if (data.result) {
        alert(isArabic ? `📝 ملخص الذكاء الاصطناعي للمنشور:\n\n${data.result}` : `📝 AI Post Summary:\n\n${data.result}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Text-To-Speech simulation inside browser
  const handleSpeakText = (messageId: string, text: string) => {
    if (isSpeaking === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Auto-detect language
    utterance.lang = isArabic ? "ar-SA" : "en-US";
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch helper
  const postJson = (url: string, body: any) => {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  };

  // Filtered lists based on search bar
  const filteredPosts = posts.filter(post => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.author.username.toLowerCase().includes(q)
    );
  });

  const filteredReels = reels.filter(reel => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      reel.title.toLowerCase().includes(q) ||
      reel.author.name.toLowerCase().includes(q)
    );
  });

  // Handle Log Out
  const handleLogout = () => {
    localStorage.removeItem("animeblack_offline_user");
    auth.signOut().catch(() => {});
    setCurrentUser(null);
    setActiveTab("home");
    setShowAdmin(false);
  };

  const themeStyleVariables = appearanceMode === "light" ? {
    "--theme-bg": "#F8FAFC",
    "--theme-card": "#FFFFFF",
    "--theme-accent": "#FF7A00",
    "--theme-secondary": "#F1F5F9",
    "--theme-text": "#0F172A",
    "--theme-border": "#E2E8F0",
    "--theme-font-family": "Inter",
    "--theme-font-weight": "normal",
    "--theme-border-radius-button": "12px",
    "--theme-border-radius-card": "16px",
    "--theme-border-radius-modal": "20px",
    "--theme-border-radius-menu": "12px",
    "--theme-animation-duration": "300ms",
  } as React.CSSProperties : {
    "--theme-bg": "#0B0B0B",
    "--theme-card": "#141414",
    "--theme-accent": "#FF7A00",
    "--theme-secondary": "#1E1E24",
    "--theme-text": "#FFFFFF",
    "--theme-border": "#27272A",
    "--theme-font-family": "Inter",
    "--theme-font-weight": "normal",
    "--theme-border-radius-button": "12px",
    "--theme-border-radius-card": "16px",
    "--theme-border-radius-modal": "20px",
    "--theme-border-radius-menu": "12px",
    "--theme-animation-duration": "300ms",
  } as React.CSSProperties;


  return (
    <div
      id="main_mobile_container"
      style={themeStyleVariables}
      className={`h-full w-full bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans flex flex-col overflow-hidden relative transition-all duration-300 ${
        fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : fontSize === "xl" ? "text-lg" : "text-sm"
      }`}
    >
      {/* 0. DYNAMIC COMPREHENSIVE THEME STYLE OVERRIDES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@200..1000&family=Changa:wght@200..800&family=IBM+Plex+Arabic:wght@100..700&family=Inter:wght@100..900&family=Noto+Sans+Arabic:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&family=Tajawal:wght@200..900&display=swap');
        
        #main_mobile_container {
          font-family: var(--theme-font-family), "Inter", sans-serif !important;
          font-weight: var(--theme-font-weight) !important;
          transition-duration: var(--theme-animation-duration) !important;
        }
        #main_mobile_container button:not(.rounded-full):not([class*="rounded-full"]):not([class*="rounded-3xl"]):not([class*="rounded-2xl"]), 
        #main_mobile_container .btn:not(.rounded-full):not([class*="rounded-full"]) {
          border-radius: var(--theme-border-radius-button);
        }
        #main_mobile_container .card, 
        #main_mobile_container [class*="rounded-2xl"]:not(.rounded-full):not(.avatar), 
        #main_mobile_container [class*="rounded-xl"]:not(.rounded-full):not(.avatar) {
          border-radius: var(--theme-border-radius-card);
        }
        #main_mobile_container [class*="rounded-3xl"]:not(.rounded-full):not(.avatar) {
          border-radius: var(--theme-border-radius-modal);
        }
      `}</style>

      {/* 1. ANIMATED SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <Splash key="splash" isArabic={isArabic} onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* 2. AUTHENTICATION SCREENS FLOW */}
      {!showSplash && !currentUser && (
        <Login
          isArabic={isArabic}
          onLoginSuccess={(userData) => {
            const role = userData.role || "Member";
            const isVerified = userData.isVerified !== undefined ? userData.isVerified : (userData.verificationType && userData.verificationType !== "none");
            
            // Sync initial state variables
            setBlackCoins(userData.coins || 380);
            if (userData.appearanceMode) setAppearanceModeState(userData.appearanceMode);
            setStars(16);

            setCurrentUser({
              name: userData.name,
              username: userData.username,
              avatar: userData.avatar,
              isVerified: !!isVerified,
              role: role as any,
              verificationType: (userData.verificationType || "none") as any,
              level: role === "Owner" ? 99 : role === "Moderator" ? 45 : 5,
              xp: role === "Owner" ? 49500 : role === "Moderator" ? 22500 : 2120,
              prestige: role === "Owner" ? 5 : 0,
              coins: userData.coins || 380,
              theme: userData.theme,
              unlockedThemes: userData.unlockedThemes || [],
              stars: 16,
              reputation: role === "Owner" ? 100 : role === "Moderator" ? 92 : 85,
              activityIndex: 94,
              consecutiveDays: 14,
              joinedDate: "2026-07-04",
              country: "السعودية",
              language: "العربية",
              interests: ["أنمي", "مانجا", "رسم", "كوسبلاي", "نقاشات"],
              favAnime: ["Attack on Titan", "One Piece", "Demon Slayer", "Chainsaw Man"],
              favManga: ["Berserk", "Monster", "Kingdom"],
              favCharacters: ["Zoro", "Levi", "Lelouch", "Itachi"],
              
              frame: null,
              titles: ["Rookie", "Explorer", "Elite", "Legend", "Anime Black Legend"],
              activeTitle: role === "Owner" ? "Anime Black Legend" : "Rookie",
              medals: ["المؤسس الأول", "المتفاعل الذهبي", "سيد النقاشات"],
              achievements: ["مكتشف العوالم", "أول مشاركة", "العضو الملتزم"],
              followersCount: role === "Owner" ? 8520 : role === "Moderator" ? 1240 : 120,
              followingCount: role === "Owner" ? 45 : role === "Moderator" ? 210 : 95,
              postsCount: 12,
              reelsCount: 4,
              storiesCount: 2,
              engagementRate: 8.4,
              visibility: {
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
            });
          }}
        />
      )}

      {/* 3. CORE APPLICATION NATIVE FRAMEWORK */}
      {!showSplash && currentUser && (
        <div className="h-full w-full flex flex-col overflow-hidden justify-between">
          
          {/* SIMULATED MOBILE PHONE STATUS BAR (NOTCH COMPATIBLE) WITH OFFLINE SWITCH */}
          <div id="simulated_status_bar" className="bg-[#050505] px-4 pt-3 pb-1 flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-950 select-none z-40 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-red-500" : "bg-green-500 animate-ping"}`} />
              <span>{isOffline ? (isArabic ? "تصفح محلي (أوفلاين)" : "Offline Local Browse") : (isArabic ? "متصل بخادم طوكيو" : "Connected to Tokyo Node")}</span>
            </div>
            {/* Notch spacing representation */}
            <button
              onClick={() => {
                setIsOffline(!isOffline);
                triggerHapticFeedback("tap");
                playSynthSound("tap");
              }}
              className="absolute left-1/2 -translate-x-1/2 top-0 bg-black text-red-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-b-xl border-x border-b border-zinc-800 hover:text-white transition-colors z-50 cursor-pointer"
            >
              {isOffline ? (isArabic ? "اتصل بالخادم" : "GO ONLINE") : (isArabic ? "اقطع الاتصال" : "GO OFFLINE")}
            </button>
            <div className="flex items-center gap-2">
              <span>LTE</span>
              <span>{isOffline ? "OFF" : "94%"}</span>
            </div>
          </div>

          {/* MAIN NAVIGATION BAR (APP HEADER) */}
          <header id="app_header" className="h-14 border-b border-[#2A2A2A] px-4 flex items-center justify-between bg-[#0D0D0D] z-30 shrink-0">
            {/* Right side Logo and branding */}
            <div className="flex items-center gap-2">
              {/* Sidebar toggle for Admin View / Quick Options */}
              <button
                id="sidebar_toggle_btn"
                onClick={() => setShowAdmin(!showAdmin)}
                className={`p-1.5 rounded-lg border transition-all ${
                  showAdmin ? "bg-[#FF3D00] border-[#FF3D00] text-white" : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white"
                }`}
                title={isArabic ? "لوحة الإدارة" : "Admin Panel"}
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono overflow-hidden">
                  <img src="/src/assets/images/anime_black_logo_1783807735704.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FF3D00] tracking-wide">
                  {isArabic ? "أنمي بلاك" : "ANIME BLACK"}
                </h1>
              </div>
            </div>

            {/* Quick action controls (Search, Language, Notifications) */}
            <div className="flex items-center gap-2.5">
              {/* Language Switcher */}
              <button
                id="lang_switch_btn"
                onClick={() => {
                  setIsArabic(!isArabic);
                  document.documentElement.dir = !isArabic ? "rtl" : "ltr";
                  document.documentElement.lang = !isArabic ? "ar" : "en";
                }}
                className="bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-bold text-gray-300 hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isArabic ? "English" : "عربي"}</span>
              </button>

              {/* Notification bell */}
              <button
                id="notif_bell_btn"
                onClick={() => setShowNotificationsDrawer(true)}
                className="relative p-1.5 bg-[#1A1A1A] hover:bg-[#222] rounded-lg border border-[#2A2A2A] text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3D00] rounded-full animate-pulse" />
                )}
              </button>

              {/* Private Messaging Inbox Button */}
              <button
                onClick={() => {
                  setShowPrivateMessages(true);
                  triggerHapticFeedback("tap");
                  playSynthSound("tap");
                }}
                className="relative p-1.5 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
              </button>

              {/* Sparkling Profile Button */}
              <button
                id="profile_top_trigger_btn"
                onClick={() => {
                  setActiveTab("profile");
                  triggerHapticFeedback("success");
                  playSynthSound("tap");
                }}
                className="relative p-1.5 bg-gradient-to-tr from-[#FF3D00] to-amber-500 hover:from-amber-500 hover:to-[#FF3D00] text-white rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1 font-bold text-[10px] shadow-lg cursor-pointer select-none"
              >
                <User className="w-3 h-3 text-yellow-300 animate-bounce" />
                <span>{isArabic ? "حسابي" : "Profile"}</span>
              </button>

              {/* Quick user avatar with Avatar Frame from Economy Shop */}
              <div
                onClick={() => setActiveTab("profile")}
                className={`relative w-8 h-8 rounded-full p-[1.5px] cursor-pointer hover:border-[#FF3D00] transition-all ${
                  activeFrame === "legendary" ? "ring-2 ring-yellow-400 animate-pulse bg-yellow-950/40" :
                  activeFrame === "cyber" ? "ring-2 ring-cyan-400 shadow-cyan-500/50 bg-cyan-950/40" :
                  activeFrame === "sakura" ? "ring-2 ring-pink-400 shadow-pink-500/50 bg-pink-950/40" :
                  activeFrame === "darkness" ? "ring-2 ring-purple-600 bg-purple-950/40 animate-pulse" :
                  "border border-zinc-800 bg-[#1A1A1A]"
                }`}
              >
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                {activeFrame && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] px-1 bg-black text-white font-mono rounded border border-zinc-700 uppercase scale-75 font-black">
                    {activeFrame[0]}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* SIMULATED OFFLINE STATE BANNER (Chapter 3, Section 3.11) */}
          {isOffline && (
            <div className="bg-gradient-to-r from-red-950 via-[#220c08] to-red-950 text-red-200 px-4 py-2 text-[11px] font-black border-b border-red-900/40 flex justify-between items-center z-30 shrink-0 select-none shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>{isArabic ? "⚠️ وضع التصفح المؤقت (أوفلاين) - سيتم تأجيل الإجراءات للمزامنة" : "⚠️ Offline Cache Mode - Operations will be queued"}</span>
              </div>
              {offlineQueue.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="bg-red-800 text-white px-2 py-0.5 rounded-full text-[9px] font-mono font-bold animate-pulse">
                    {offlineQueue.length} {isArabic ? "مؤجل" : "queued"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION MAIN CONTENT CANVAS CONTAINER */}
          <div className="flex-1 overflow-hidden relative flex">
            
            {/* FULL-SCREEN SLIDING NOTIFICATION DRAWER */}
            <AnimatePresence>
              {showNotificationsDrawer && (
                <motion.div
                  id="notifications_drawer"
                  initial={{ x: isArabic ? "100%" : "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: isArabic ? "100%" : "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="absolute inset-0 bg-[#0A0A0A] z-50 flex flex-col border-r border-[#2A2A2A]"
                >
                  <div className="h-14 border-b border-[#2A2A2A] px-4 flex items-center justify-between bg-[#0D0D0D]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNotificationsDrawer(false)}
                        className="p-1 hover:bg-[#1A1A1A] rounded-lg"
                      >
                        {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                      </button>
                      <h3 className="font-bold text-sm">{isArabic ? "مركز الإشعارات المباشرة" : "Live Notifications"}</h3>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/notifications/clear", { method: "POST" });
                                              }}
                      className="text-xs text-[#FF3D00] font-semibold hover:underline"
                    >
                      {isArabic ? "تحديد الكل كمقروء" : "Mark all read"}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        {isArabic ? "لا توجد إشعارات جديدة حالياً" : "No new notifications"}
                      </div>
                    ) : (
                      notifications.map((notif, notifIdx) => (
                        <div
                          key={notif.id ? `${notif.id}_${notifIdx}` : `notif_${notifIdx}`}
                          onClick={async () => {
                            if (playSynthSound) playSynthSound("tap");
                            setSelectedNotificationDetail(notif);
                            try {
                              const { doc, updateDoc } = await import('firebase/firestore');
                              await updateDoc(doc(db, "notifications", notif.id), { read: true });
                            } catch (e) {
                              console.error("Error marking notification read:", e);
                            }
                          }}
                          className={`p-3 rounded-xl border flex gap-3 transition-all cursor-pointer hover:bg-zinc-800/40 hover:scale-[0.99] active:scale-[0.98] ${
                            notif.read ? "bg-[#121212]/50 border-zinc-900 opacity-60" : "bg-[#1A1A1A] border-zinc-800 border-indigo-900/30 shadow-md shadow-indigo-950/10"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF3D00] to-purple-600 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
                            {notif.type[0]}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-gray-200 leading-relaxed font-semibold">{notif.text}</p>
                            <span className="block text-[10px] text-gray-500 mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FULL-SCREEN SLIDING STORY VIEW OVERLAY */}
            <AnimatePresence>
              {selectedStory && (
                <motion.div
                  id="story_view_overlay"
                  initial={{ x: isArabic ? "-100%" : "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: isArabic ? "-100%" : "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 220 }}
                  className="absolute inset-0 bg-[#050505] z-50 flex flex-col justify-between p-4"
                >
                  {/* Top user header & progress bar */}
                  <div className="space-y-3">
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-red-600 h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        onAnimationComplete={() => setSelectedStory(null)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                        onClick={() => {
                          playSynthSound("tap");
                          setSelectedStory(null);
                          window.dispatchEvent(new CustomEvent('openProfile', { detail: (selectedStory as any).authorId || (selectedStory.author as any).uid || selectedStory.author.username }));
                        }}
                      >
                        <img src={selectedStory.author.avatar} alt="Author" className="w-8 h-8 rounded-full object-cover border border-red-500" />
                        <div>
                          <span className="font-bold text-xs text-white block">{selectedStory.author.name}</span>
                          <span className="text-[9px] text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {selectedStory.views} {isArabic ? "مشاهدة" : "views"}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedStory(null)} className="p-1 bg-black/40 hover:bg-black/60 rounded-full text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Story Main Content Area */}
                  <div className="flex-1 flex flex-col items-center justify-center relative my-4 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={selectedStory.url} alt="Story content" className="w-full h-full object-cover" />
                    
                    {/* Floating Question Box Overlay if exists */}
                    {selectedStory.question && (
                      <div className="absolute top-1/3 left-4 right-4 bg-black/80 backdrop-blur-md border border-red-500/30 p-4 rounded-xl text-center">
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">
                          {isArabic ? "سؤال الأوتاكو المباشر" : "Otaku Question"}
                        </span>
                        <p className="text-xs text-white font-bold">{selectedStory.question}</p>
                      </div>
                    )}

                    {/* Floating story poll overlay */}
                    {selectedStory.poll && (
                      <div className="absolute bottom-8 left-4 right-4 bg-[#121212]/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl">
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-2 text-center">
                          {selectedStory.poll.question}
                        </span>
                        <div className="space-y-2">
                          {selectedStory.poll.options.map((opt, i) => {
                            const totalVotes = selectedStory.poll?.votes.reduce((a, b) => a + b, 0) || 1;
                            const percentage = Math.round((selectedStory.poll?.votes[i] || 0) / totalVotes * 100);
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  // Live vote simulation on stories
                                  const updatedStory = { ...selectedStory };
                                  if (updatedStory.poll) {
                                    updatedStory.poll.votes[i] += 1;
                                    setSelectedStory(updatedStory);
                                  }
                                }}
                                className="w-full bg-zinc-900 hover:bg-[#1A1A1A] border border-zinc-800 text-xs py-2 px-3 rounded-xl flex justify-between items-center text-white font-semibold transition-all relative overflow-hidden"
                              >
                                <div className="absolute inset-y-0 left-0 bg-purple-600/20" style={{ width: `${percentage}%` }} />
                                <span className="relative z-10">{opt}</span>
                                <span className="relative z-10 text-[10px] text-purple-300">{percentage}%</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Story reply box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isArabic ? "أرسل رداً خاصاً..." : "Send private reply..."}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                    <button
                      onClick={() => {
                        alert(isArabic ? "تم إرسال ردك بنجاح!" : "Reply sent successfully!");
                        setSelectedStory(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-xl text-xs font-bold"
                    >
                      {isArabic ? "إرسال" : "Send"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* A. SYSTEM ADMIN VIEW SIDEBAR / MODERATION PANEL */}
            <AnimatePresence>
              {showAdmin && (
                <motion.div
                  id="admin_view_sidebar"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="absolute inset-y-0 left-0 right-0 md:relative md:w-80 bg-[#121212] border-r border-[#2A2A2A] z-40 flex flex-col"
                >
                  {/* Admin Header */}
                  <div className="p-4 border-b border-[#2A2A2A] bg-[#0A0A0A] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#FF3D00] rounded flex items-center justify-center text-white text-xs font-bold font-mono">
                        AD
                      </div>
                      <h3 className="font-bold text-sm">
                        {isArabic ? "إعدادات الرتب والتحكم" : "Rank & Authority Settings"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowAdmin(false)}
                      className="p-1 hover:bg-[#1A1A1A] rounded text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Admin Body Panels */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                    
                    {/* 1. Quick-Role Changer (REAL-TIME IMPACT) */}
                    <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center gap-1.5 text-[#FF3D00] font-black text-xs uppercase tracking-wider">
                        <UserCheck className="w-4 h-4" />
                        <span>{isArabic ? "محاكي رتبة الحساب الحالي" : "Current Account Role Simulator"}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {isArabic 
                          ? "قم بتغيير رتبتك الحالية لتجربة المنصة بصلاحيات المالك أو المشرف أو الإداري مباشرة." 
                          : "Change your simulator rank to test the platform as Owner, Admin, or Moderator immediately."}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        {[
                          { id: "Owner", labelAr: "👑 المالك", labelEn: "👑 Owner", color: "border-amber-500/40 hover:bg-amber-500/10 text-amber-400" },
                          { id: "SuperAdministrator", labelAr: "⚡ مدير رئيسي", labelEn: "⚡ Super Admin", color: "border-purple-500/40 hover:bg-purple-500/10 text-purple-400" },
                          { id: "Moderator", labelAr: "🛡️ مشرف", labelEn: "🛡️ Moderator", color: "border-blue-500/40 hover:bg-blue-500/10 text-blue-400" },
                          { id: "Member", labelAr: "👤 عضو عادي", labelEn: "👤 Member", color: "border-zinc-700 hover:bg-zinc-800 text-zinc-300" }
                        ].map((rOpt, _autoIdx) => {
                          const isActive = currentUser?.role === rOpt.id;
                          return (
                            <button
                              key={`role_opt_${rOpt.id}_${_autoIdx}`}
                              onClick={() => {
                                const updatedUser = {
                                  ...currentUser,
                                  role: rOpt.id as any,
                                  level: rOpt.id === "Owner" ? 99 : rOpt.id === "SuperAdministrator" ? 60 : rOpt.id === "Moderator" ? 45 : 5,
                                  prestige: rOpt.id === "Owner" ? 5 : 0,
                                };
                                setCurrentUser(updatedUser);
                                triggerInAppNotification(
                                  isArabic ? "تغيرت الرتبة!" : "Role Swapped!",
                                  isArabic 
                                    ? `أنت الآن تمتلك صلاحيات: ${rOpt.labelAr}` 
                                    : `You now have the permissions of: ${rOpt.labelEn}`,
                                  "success"
                                );
                                playSynthSound?.("success");
                                triggerHapticFeedback?.("success");
                              }}
                              className={`py-2 px-2 text-center rounded-lg border font-bold transition-all truncate ${
                                isActive 
                                  ? "bg-[#FF3D00] border-[#FF3D00] text-white shadow-lg shadow-[#FF3D00]/20" 
                                  : rOpt.color
                              }`}
                            >
                              {isArabic ? rOpt.labelAr : rOpt.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Glow Launch Full Control Center */}
                    <button
                      onClick={() => {
                        setShowAdministrationSystem(true);
                        setShowAdmin(false);
                        triggerHapticFeedback?.("levelup");
                        playSynthSound?.("levelup");
                      }}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 via-[#FF3D00] to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs py-3 rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,61,0,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>{isArabic ? "فتح لوحة التحكم الإدارية الكاملة 🔑" : "Open Full Control Dashboard 🔑"}</span>
                    </button>

                    {/* 3. MODERATOR DIRECT CONTROLS */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                        <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
                        <span>{isArabic ? "إعدادات وقرارات المشرفين" : "Moderator Controls"}</span>
                      </div>
                      
                      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-3 space-y-3">
                        {/* Public Chat Slowmode Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "وضع الهدوء بالدردشة" : "Chat Slow Mode"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "تأخير إرسال الرسائل لـ 5 ثوانٍ" : "Adds 5s delay on messages"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              triggerInAppNotification(
                                isArabic ? "وضع الهدوء" : "Slow Mode",
                                isArabic ? "تم تفعيل وضع الهدوء للمشرفين بنجاح" : "Slow Mode configured by moderator",
                                "info"
                              );
                              playSynthSound?.("tap");
                              triggerHapticFeedback?.("tap");
                            }}
                            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500 text-blue-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-colors"
                          >
                            {isArabic ? "تفعيل" : "Enable"}
                          </button>
                        </div>

                        {/* Ban/Warn simulator */}
                        <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "محاكاة حظر مخالفي القوانين" : "Simulate User Ban"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "تطبيق عقوبة على حساب تجريبي" : "Apply disciplinary ban"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              alert(
                                isArabic 
                                  ? "تم تفعيل محاكي العقوبات! تم حظر حساب 'Bakka_Otaku' مؤقتاً لمخالفة شروط النشر." 
                                  : "Punishment simulator triggered! 'Bakka_Otaku' has been temporarily banned for rules violation."
                              );
                              triggerInAppNotification(
                                isArabic ? "تم تطبيق العقوبة" : "Punishment Applied",
                                isArabic ? "تم حظر الحساب بنجاح!" : "User was successfully banned!",
                                "warning"
                              );
                              playSynthSound?.("error");
                              triggerHapticFeedback?.("error");
                            }}
                            className="bg-red-950/40 hover:bg-red-900/30 border border-red-800 text-red-300 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-colors"
                          >
                            {isArabic ? "حظر تجريبي" : "Warn/Ban"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4. ADMINISTRATOR DIRECT CONTROLS */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                        <div className="w-1.5 h-3 bg-purple-500 rounded-full" />
                        <span>{isArabic ? "إعدادات وقرارات الإداريين" : "Administrator Settings"}</span>
                      </div>
                      
                      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-3 space-y-3">
                        {/* Add 5k Black Coins */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "توليد عملات بلاك كوين" : "Print Black Coins"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "إضافة 5,000 عملة لحسابك فوراً" : "Instantly inject +5000 Coins"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setBlackCoins(blackCoins + 5000);
                              triggerInAppNotification(
                                isArabic ? "حقنة عملات ناجحة! 🪙" : "Coins Injected! 🪙",
                                isArabic ? "تمت إضافة 5,000 عملة بلاك كوين بنجاح." : "Added 5,000 Black Coins to your wallet.",
                                "success"
                              );
                              playSynthSound?.("purchase");
                              triggerHapticFeedback?.("purchase");
                              triggerCelebration?.(
                                "blackcoin",
                                isArabic ? "مكافأة الإدارة الفاخرة!" : "Admin Core Reward!",
                                isArabic ? "توليد كنز الذهب" : "Gold Vault Injection",
                                isArabic ? "أنت الآن تستخدم صلاحيات الإدارة لتعديل خزنة عملات الأوتـاكو." : "You used admin privileges to inflate your Otaku vault.",
                                isArabic ? "أنت الآن تستخدم صلاحيات الإدارة لتعديل خزنة عملات الأوتـاكو." : "You used admin privileges to inflate your Otaku vault."
                              );
                            }}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500 text-emerald-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-colors"
                          >
                            +5,000 🪙
                          </button>
                        </div>

                        {/* App Global Maintenance Mode */}
                        <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "وضع الصيانة التجريبي" : "Maintenance Simulator"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "عرض تنبيه الصيانة لجميع الأعضاء" : "Broadcast safety mode Alert"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              alert(
                                isArabic 
                                  ? "محاكاة تفعيل وضع الصيانة! تم إرسال تنبيه لخوادم أنمي بلاك لإيقاف عمليات التسجيل مؤقتاً." 
                                  : "Maintenance Simulated! Core servers notified to throttle new registrations."
                              );
                              triggerInAppNotification(
                                isArabic ? "وضع الصيانة" : "Maintenance Alert",
                                isArabic ? "الخوادم تعمل بنظام الأمان الاحتياطي" : "Platform running on backup nodes",
                                "warning"
                              );
                              playSynthSound?.("tap");
                              triggerHapticFeedback?.("tap");
                            }}
                            className="bg-purple-900/30 hover:bg-purple-900/40 border border-purple-700 text-purple-300 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-colors"
                          >
                            {isArabic ? "محاكاة" : "Simulate"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 5. OWNER EXCLUSIVE CONTROLS */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                        <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
                        <span>{isArabic ? "صلاحيات المالك الحصرية" : "Owner Privileges"}</span>
                      </div>
                      
                      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-3 space-y-3">
                        {/* Clear All Reports */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "تصفير كل البلاغات" : "Flush Report Queue"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "حذف كل بلاغات ومخالفات الأعضاء" : "Wipes pending report list"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (adminStats) {
                                setAdminStats({
                                  ...adminStats,
                                  reportCount: 0
                                });
                              }
                              triggerInAppNotification(
                                isArabic ? "تم تصفير البلاغات" : "Queue Flushed",
                                isArabic ? "قائمة البلاغات المعلقة الآن فارغة ونظيفة!" : "The pending report queue is now clean!",
                                "success"
                              );
                              playSynthSound?.("success");
                              triggerHapticFeedback?.("success");
                            }}
                            className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500 text-amber-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-colors"
                          >
                            {isArabic ? "تصفير البلاغات" : "Flush Queue"}
                          </button>
                        </div>

                        {/* Prestige 10 Generator */}
                        <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "ترقية الهيبة الأسطورية" : "Instant Prestige Max"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {isArabic ? "منح مستوى هيبة 10 وإطارات مشعة" : "Grant Level 10 Prestige & frame"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (currentUser) {
                                setCurrentUser({
                                  ...currentUser,
                                  prestigeLevel: 10,
                                  level: 99,
                                  xp: 99999
                                });
                              }
                              triggerInAppNotification(
                                isArabic ? "أنت الأسطورة المطلقة! ⚡" : "Absolute Legend Rank! ⚡",
                                isArabic ? "تم ترقية مستوى الهيبة للمستوى 10 بنجاح." : "Upgraded your prestige to Level 10 instantly.",
                                "success"
                              );
                              triggerCelebration?.(
                                "prestige",
                                isArabic ? "هيبة المالك العظمى!" : "Ultimate Owner Prestige!",
                                isArabic ? "مستوى هيبة 10" : "Prestige Level 10 Unleashed",
                                isArabic ? "لقد تم منحك أعلى رتبة هيبة وتأثير في كامل مجتمع أنمي بلاك!" : "You have been granted the highest prestige in the Anime Black universe!",
                                isArabic ? "لقد تم منحك أعلى رتبة هيبة وتأثير في كامل مجتمع أنمي بلاك!" : "You have been granted the highest prestige in the Anime Black universe!"
                              );
                              playSynthSound?.("levelup");
                              triggerHapticFeedback?.("levelup");
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black py-1 px-2.5 rounded-lg transition-all"
                          >
                            MAX ⚡
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* D3/Recharts Analytics Visual Graph */}
                    {adminStats && (
                      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                        <h4 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#FF3D00]" />
                          <span>{isArabic ? "معدل الزيارات الأسبوعية والنشاط" : "Weekly Activity Analytics"}</span>
                        </h4>
                        <div className="h-40 w-full text-xs" dir="ltr">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={adminStats.dailyVisits} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#FF3D00" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                              <XAxis dataKey="name" stroke="#555" fontSize={9} />
                              <YAxis stroke="#555" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", color: "#fff" }} />
                              <Area type="monotone" dataKey="visits" stroke="#FF3D00" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" name={isArabic ? "الزيارات" : "Visits"} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Counter bento stats */}
                    {adminStats && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1A1A1A] border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
                            {isArabic ? "إجمالي المنشورات" : "Total Posts"}
                          </span>
                          <span className="text-xl font-bold text-white block mt-1 font-mono">
                            {posts.length}
                          </span>
                        </div>
                        <div className="bg-[#1A1A1A] border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
                            {isArabic ? "المستخدمين النشطين" : "Active Users"}
                          </span>
                          <span className="text-xl font-bold text-emerald-500 block mt-1 font-mono">
                            {adminStats.activeUsers}
                          </span>
                        </div>
                        <div className="bg-[#1A1A1A] border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
                            {isArabic ? "البلاغات المعلقة" : "Pending Reports"}
                          </span>
                          <span className="text-xl font-bold text-red-500 block mt-1 font-mono">
                            {adminStats.reportCount}
                          </span>
                        </div>
                        <div className="bg-[#1A1A1A] border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
                            {isArabic ? "القصص النشطة" : "Active Stories"}
                          </span>
                          <span className="text-xl font-bold text-purple-500 block mt-1 font-mono">
                            {stories.length}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Database integrity stats */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        <span>{isArabic ? "حالة النظام البرمجي" : "System Status"}</span>
                      </h4>
                      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-3 text-xs space-y-2 font-mono text-zinc-400">
                        <div className="flex justify-between font-bold">
                          <span>Database ID</span>
                          <span className="text-amber-500 select-all font-sans text-[10px]">ai-studio-animeblack</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Database Type</span>
                          <span className="text-green-500">Firebase Firestore</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gemini API Node</span>
                          <span className="text-green-500">models/gemini-3.5-flash</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Latency</span>
                          <span className="text-green-500">Low-Latency (Flash)</span>
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-[#1F1F1F] hover:bg-[#FF3D00] hover:text-white text-zinc-400 text-xs py-2.5 rounded-xl border border-zinc-800 font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isArabic ? "تسجيل الخروج بالكامل" : "Log Out completely"}</span>
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* B. DETAILED INDEPENDENT VIEWS PER TAB */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-[#0A0A0A]">
              
              {/* TAB 1: HOME VIEW */}
              {activeTab === "home" && (
                <div className="p-4 space-y-6 flex-1 overflow-y-auto pb-20">
                  <HomeFeedEngine
                    isArabic={isArabic}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    posts={posts}
                    setPosts={setPosts}
                    stories={stories}
                    setStories={setStories}
                    reels={reels}
                    setReels={setReels}
                    blackCoins={blackCoins}
                    setBlackCoins={setBlackCoins}
                    playSynthSound={playSynthSound}
                    triggerHapticFeedback={triggerHapticFeedback}
                    triggerInAppNotification={triggerInAppNotification}
                    triggerCelebration={triggerCelebration}
                    sections={sections}
                    setSections={setSections}
                    widgets={widgets}
                    setWidgets={setWidgets}
                    cardSize={cardSize}
                    viewType={viewType}
                    setShowHomeCustomizer={setShowHomeCustomizer}
                  />

                  {/* Disabled legacy layout */}
                  {false && (
                    <>

                  {/* Dynamic Active Widgets Section */}
                  {widgets.some(w => w.isActive) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {widgets.filter(w => w.isActive && w.id === "jstClock").map((_, i) => (
                        <div key={`jstClock_app_${i}`} className="bg-gradient-to-br from-[#121212] to-zinc-950 border border-zinc-800/80 p-3.5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-[#FF3D00]/5 rounded-full blur-xl pointer-events-none" />
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                              {isArabic ? "توقيت طوكيو المباشر (JST)" : "Tokyo Live Time (JST)"}
                            </span>
                            <h4 className="text-lg font-black text-white font-mono tracking-widest drop-shadow-md">
                              <JstClockDisplay />
                            </h4>
                          </div>
                          <Tv className="w-7 h-7 text-[#FF3D00] opacity-80 group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                      {widgets.filter(w => w.isActive && w.id === "quests").map((_, i) => (
                        <div key={`quests_app_${i}`} className="bg-[#121212] border border-zinc-800/80 p-3.5 rounded-2xl space-y-2 shadow-lg relative">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-[#FF3D00] uppercase font-bold tracking-wider">
                              🎯 {isArabic ? "المهام اليومية للأوتاكو" : "Daily Otaku Quests"}
                            </span>
                            <span className="text-[10px] bg-red-950 text-[#FF3D00] px-2 py-0.5 rounded-full font-mono font-bold">
                              2/3
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-gray-300">
                              <span>{isArabic ? "اقرأ فصلاً من المانجا" : "Read 1 Manga chapter"}</span>
                              <span className="text-emerald-500">✔</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-300">
                              <span>{isArabic ? "تفاعل مع منشورين بالمنتدى" : "Like 2 posts"}</span>
                              <span className="text-emerald-500">✔</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>{isArabic ? "شاهد ريلز أنمي مدته 15 ثانية" : "Watch a 15s anime reel"}</span>
                              <span className="text-red-500">0/15s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {widgets.filter(w => w.isActive && w.id === "digitalCard").map((_, i) => (
                        <div key={`digitalCard_app_${i}`} className="bg-[#121212] border border-zinc-800/80 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 w-20 h-20 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
                          <div className="w-10 h-10 rounded-full border-2 border-[#FF3D00] p-0.5 bg-[#0A0A0A] shrink-0">
                            <img src={currentUser?.avatar} className="w-full h-full rounded-full object-cover" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white leading-none">{currentUser?.name}</span>
                              <LevelBadge level={currentUser?.level || 42} size="xs" showTitle={true} isArabic={isArabic} />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                              <span>ID: #AB-9039</span>
                              <span className="text-[#FF3D00] font-bold">XP: {currentUser?.xp || 4200}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {widgets.filter(w => w.isActive && w.id === "otakuMood").map((_, i) => (
                        <div key={`otakuMood_app_${i}`} className="bg-[#121212] border border-zinc-800/80 p-3.5 rounded-2xl space-y-2.5 shadow-lg relative">
                          <span className="text-[10px] text-cyan-500 uppercase font-bold tracking-wider block">
                            🎭 {isArabic ? "مزاج الأوتـاكو الحالي" : "Current Otaku Hype Level"}
                          </span>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-200">
                              {isArabic ? "متحمس لمشاهدة الحلقة الجديدة! ⚡" : "Super hyped for the new episode! ⚡"}
                            </span>
                            <span className="text-lg">🔥</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Story Strip Segment */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3D00] flex items-center gap-1">
                        <span>{isArabic ? "القصص المميزة للأوتاكو" : "Featured Otaku Stories"}</span>
                      </h3>
                      <button
                        onClick={() => setShowStoryCreateModal(true)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isArabic ? "نشر قصة" : "Add Story"}</span>
                      </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-1 select-none">
                      {/* Create story item trigger */}
                      <div
                        onClick={() => setShowStoryCreateModal(true)}
                        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900/40 hover:border-[#FF3D00] transition-colors p-1">
                          <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-zinc-400">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-semibold">{isArabic ? "قصتك" : "Your Story"}</span>
                      </div>

                      {/* Fetched Stories */}
                      {stories.map((story, sIdx) => (
                        <div
                          key={story.id ? `${story.id}_${sIdx}` : `story_${sIdx}`}
                          onClick={() => setSelectedStory(story)}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <div className="w-14 h-14 rounded-full border-2 border-[#FF3D00] p-[2px] bg-[#0A0A0A] hover:scale-105 transition-transform">
                            <img src={story.author.avatar} alt="Story User" className="w-full h-full rounded-full object-cover" />
                          </div>
                          <span className="text-[10px] text-gray-300 font-semibold truncate max-w-[65px]">{story.author.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Story publication wizard modal */}
                  {showStoryCreateModal && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <h4 className="font-bold text-sm text-white">{isArabic ? "إضافة قصة أنمي جديدة" : "Publish New Story"}</h4>
                          <button onClick={() => setShowStoryCreateModal(false)} className="p-1 hover:bg-zinc-800 rounded">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold">
                              {isArabic ? "رفع صورة القصة" : "Upload Story Image"}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const { compressImage } = await import('./utils/imageUtils');
                                    const base64 = await compressImage(file, 800);
                                    setNewStoryMedia(base64);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer"
                            />
                            {newStoryMedia && (
                              <div className="mt-2 rounded-lg overflow-hidden h-24 bg-black border border-zinc-800">
                                <img src={newStoryMedia} className="w-full h-full object-cover opacity-80" alt="Preview" />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold">
                              {isArabic ? "سؤال تفاعلي للمتابعين (اختياري)" : "Interactive Question (Optional)"}
                            </label>
                            <input
                              type="text"
                              value={newStoryQuestion}
                              onChange={(e) => setNewStoryQuestion(e.target.value)}
                              placeholder={isArabic ? "ما هو أنمي الخريف المفضل لديك؟" : "What is your favorite autumn anime?"}
                              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleCreateStory}
                          disabled={!newStoryMedia}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 transition-all"
                        >
                          {isArabic ? "نشر القصة الآن" : "Publish Story"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC USER-CUSTOMIZABLE LAYOUT SECTIONS */}
                  {sections
                    .filter(sec => sec.isVisible)
                    .map((sec, secIdx) => {
                      if (sec.id === "posts") {
                        return (
                          <div key={`sec_${sec.id}_${secIdx}`} className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3D00] flex items-center gap-1.5">
                                <span>{isArabic ? "📝 منتدى منشورات الأوتـاكو" : "📝 Otaku Community Feed"}</span>
                                {sec.isPinned && <span className="text-[8px] bg-red-950 text-[#FF3D00] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                              </h3>
                            </div>

                            {/* AI Quick helper box suggestion */}
                            <div className="bg-gradient-to-l from-[#FF3D00]/10 via-[#FF9100]/5 to-transparent rounded-2xl p-4 border border-[#FF3D00]/20 flex items-center justify-between gap-3 shadow-xl relative overflow-hidden">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF3D00]/5 rounded-full blur-2xl pointer-events-none" />
                              <div className="space-y-1 relative z-10">
                                <h4 className="text-xs font-black text-white flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                  <span>{isArabic ? "المساعد الذكي (Anime AI)" : "Gemini Intelligent Assistant"}</span>
                                </h4>
                                <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[220px]">
                                  {isArabic ? "هل تبحث عن أنميات رهيبة لمشاهدتها اليوم؟ اسأل رفيقي الذكي وسيقترح لك أفضل الخيارات!" : "Need tailored anime recommendations? Tap to consult Gemini immediately!"}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveTab("chat");
                                  setActiveChatId("ai_bot");
                                }}
                                className="bg-[#FF3D00] text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-[#E63600] active:scale-95 transition-all shrink-0 z-10 cursor-pointer"
                              >
                                {isArabic ? "دردش الآن" : "Start Chat"}
                              </button>
                            </div>

                            {/* Main Feed of Posts */}
                            <div className="space-y-4">
                              {filteredPosts.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500 text-xs">
                                  {isArabic ? "لا توجد منشورات مطابقة للبحث" : "No posts matching search"}
                                </div>
                              ) : (
                                filteredPosts.map((post, postIdx) => (
                                  <div
                                    key={post.id ? `${post.id}_${postIdx}` : `post_${postIdx}`}
                                    className="bg-[#121212] rounded-2xl p-4 border border-[#2A2A2A] shadow-md space-y-3.5 select-none"
                                    onMouseDown={(e) => handleStartLongPress(e, "post", post.id, post.content)}
                                    onMouseUp={handleEndLongPress}
                                    onMouseLeave={handleEndLongPress}
                                    onTouchStart={(e) => handleStartLongPress(e, "post", post.id, post.content)}
                                    onTouchEnd={handleEndLongPress}
                                  >
                                    {/* Post Header */}
                                    <div className="flex justify-between items-center">
                                      <div 
                                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-80"
                                        onClick={() => {
                                          playSynthSound("tap");
                                          window.dispatchEvent(new CustomEvent('openProfile', { detail: (post as any).authorId || (post.author as any).uid || post.author.username }));
                                        }}
                                      >
                                        <img src={post.author.avatar} alt="Post Author" className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                                        <div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs font-black text-white">{post.author.name}</span>
                                            {post.author.isVerified && (
                                              <span className="text-[#FF3D00] text-[10px] font-bold" title="Verified Otaku">✔</span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-zinc-500 font-mono">@{post.author.username}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Summarize or translate post */}
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleSummarizePost(post.id, post.content)}
                                          className="bg-[#1A1A1A] hover:bg-zinc-800 text-[9px] text-purple-400 font-bold px-2 py-1 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                                          title={isArabic ? "ملخص بالذكاء الاصطناعي" : "AI Summarize"}
                                        >
                                          {isArabic ? "ملخص الذكاء الاصطناعي" : "AI Summary"}
                                        </button>
                                        <button
                                          onClick={async () => {
                                            try {
                                              const res = await postJson("/api/ai/write-post", {
                                                prompt: `Translate this post text to ${isArabic ? 'English' : 'Arabic'}: "${post.content}"`,
                                                tone: "accurate literal"
                                              });
                                              const data = await res.json();
                                              if (data.result) {
                                                alert(isArabic ? `🌐 الترجمة:\n\n${data.result}` : `🌐 Translation:\n\n${data.result}`);
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }}
                                          className="bg-[#1A1A1A] hover:bg-zinc-800 text-[9px] text-zinc-400 px-2 py-1 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                                        >
                                          {isArabic ? "ترجمة" : "Translate"}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Post Content text */}
                                    <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    {/* Post Graphic attachment */}
                                    {post.image && (
                                      <div 
                                        className="aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden border border-zinc-800/80 relative cursor-pointer group"
                                        onMouseDown={(e) => handleStartLongPress(e, "image", post.image!)}
                                        onMouseUp={handleEndLongPress}
                                        onMouseLeave={handleEndLongPress}
                                        onTouchStart={(e) => handleStartLongPress(e, "image", post.image!)}
                                        onTouchEnd={handleEndLongPress}
                                        onDoubleClick={() => {
                                          if (!post.hasLiked) {
                                            handleLikePost(post.id);
                                          } else {
                                            playSynthSound("tap");
                                            triggerHapticFeedback("tap");
                                          }
                                          setLikedPostOverlayId(post.id);
                                          setTimeout(() => setLikedPostOverlayId(null), 800);
                                        }}
                                        onClick={(e) => {
                                          if (e.detail === 1) {
                                            setActiveMediaViewer({ url: post.image!, type: "image", zoom: 1, speed: 1, quality: "1080p" });
                                            triggerHapticFeedback("tap");
                                            playSynthSound("tap");
                                          }
                                        }}
                                      >
                                        <img src={post.image} alt="Post attachment" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                                        
                                        {/* Glowing Double Tap Heart Overlay */}
                                        <AnimatePresence>
                                          {likedPostOverlayId === post.id && (
                                            <motion.div
                                              initial={{ scale: 0, opacity: 0 }}
                                              animate={{ scale: [0.6, 1.2, 1], opacity: [1, 1, 0] }}
                                              exit={{ opacity: 0 }}
                                              transition={{ duration: 0.8 }}
                                              className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-20"
                                            >
                                              <div className="p-4 bg-black/40 rounded-full backdrop-blur-sm border border-red-500/20">
                                                <Heart className="w-12 h-12 text-[#FF3D00] fill-[#FF3D00] drop-shadow-[0_0_15px_rgba(255,61,0,0.6)]" />
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )}

                                    {/* Interactive Poll component inside Post if exists */}
                                    {post.poll && (
                                      <div className="bg-[#1A1A1A] border border-zinc-800/60 p-3 rounded-xl space-y-2.5">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                                          📊 {post.poll.question}
                                        </span>
                                        <div className="space-y-1.5">
                                          {post.poll.options.map((opt, idx) => {
                                            const votes = opt.votes || 0;
                                            const total = post.poll?.totalVotes || 1;
                                            const percent = Math.round(votes / total * 100);
                                            const userHasVoted = post.poll?.userVotedIndex !== null;
                                            const isSelected = post.poll?.userVotedIndex === idx;

                                            return (
                                              <button
                                                key={idx}
                                                onClick={() => handleVotePoll(post.id, idx)}
                                                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold relative overflow-hidden transition-all flex justify-between items-center cursor-pointer ${
                                                  isSelected
                                                    ? "bg-red-950/40 border border-red-500/40 text-red-200"
                                                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                                                }`}
                                              >
                                                <div
                                                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                                    isSelected ? "bg-red-500/10" : "bg-zinc-800/20"
                                                  }`}
                                                  style={{ width: `${percent}%` }}
                                                />
                                                <span className="relative z-10">{opt.text}</span>
                                                <span className="relative z-10 text-[10px] text-zinc-400 font-mono">
                                                  {percent}% ({votes} {isArabic ? "صوت" : "votes"})
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Footer action keys */}
                                    <div className="flex items-center gap-5 text-gray-500 border-t border-zinc-900 pt-3 text-xs select-none">
                                      <button
                                        onClick={() => handleLikePost(post.id)}
                                        className={`flex items-center gap-1.5 hover:text-[#FF3D00] transition-colors cursor-pointer ${
                                          post.hasLiked ? "text-[#FF3D00] font-bold" : ""
                                        }`}
                                      >
                                        <Heart className={`w-4 h-4 ${post.hasLiked ? "fill-[#FF3D00] text-[#FF3D00]" : ""}`} />
                                        <span>{post.likes}</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          if (activePostCommentsId === post.id) {
                                            setActivePostCommentsId(null);
                                          } else {
                                            setActivePostCommentsId(post.id);
                                          }
                                        }}
                                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{post.comments.length}</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          alert(isArabic ? "تم نسخ رابط المنشور لمشاركتة!" : "Link copied to clipboard!");
                                        }}
                                        className="flex items-center gap-1.5 hover:text-white transition-colors mr-auto cursor-pointer"
                                      >
                                        <Share2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Sliding post comments panel */}
                                    {activePostCommentsId === post.id && (
                                      <div className="bg-[#1A1A1A] border border-zinc-800/80 rounded-xl p-3 space-y-3 mt-2">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                                          {isArabic ? "التعليقات" : "Comments"}
                                        </span>
                                        
                                        <div className="space-y-2.5 max-h-48 overflow-y-auto">
                                          {post.comments.length === 0 ? (
                                            <p className="text-[10px] text-zinc-500">{isArabic ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet."}</p>
                                          ) : (
                                            post.comments.map((comment, cIdx) => (
                                              <div key={comment.id ? `${comment.id}_${cIdx}` : `comment_${cIdx}`} className="text-xs bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/60">
                                                <span className="font-bold text-red-500 block mb-0.5">{comment.author}</span>
                                                <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                                              </div>
                                            ))
                                          )}
                                        </div>

                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            placeholder={isArabic ? "اكتب تعليقاً لائقاً..." : "Write a nice comment..."}
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                                          />
                                          <button
                                            onClick={() => handleAddComment(post.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                                          >
                                            {isArabic ? "تعليق" : "Comment"}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "reels") {
                        return (
                          <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <span>🎬 {isArabic ? "أشهر فيديوهات الريلز المقترحة" : "Suggested Anime Reels"}</span>
                                {sec.isPinned && <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                              </h3>
                              <button onClick={() => setActiveTab("explore")} className="text-[9px] text-zinc-500 hover:text-white font-bold cursor-pointer">
                                {isArabic ? "مشاهدة الكل" : "View All"}
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {reels.slice(0, 2).map((r, rIdx) => (
                                <div 
                                  key={r.id ? `app_reel_${r.id}_${rIdx}` : `app_reel_${rIdx}`} 
                                  className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80 aspect-[9/16] relative flex flex-col justify-between p-3.5 group cursor-pointer"
                                  onDoubleClick={() => {
                                    if (!r.hasLiked) {
                                      handleLikeReel(r.id);
                                    } else {
                                      playSynthSound("tap");
                                      triggerHapticFeedback("tap");
                                    }
                                    setLikedReelOverlayId(r.id);
                                    setTimeout(() => setLikedReelOverlayId(null), 800);
                                  }}
                                >
                                  <AnimatePresence>
                                    {likedReelOverlayId === r.id && (
                                      <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0.6, 1.2, 1], opacity: [1, 1, 0] }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-30"
                                      >
                                        <Heart className="w-8 h-8 text-[#FF3D00] fill-[#FF3D00] drop-shadow-[0_0_15px_rgba(255,61,0,0.6)]" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  <div className="flex justify-between items-center relative z-10">
                                    <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-white font-mono">@{r.author.username}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                  </div>
                                  <div className="relative z-10 text-white space-y-1">
                                    <h5 className="text-[10px] font-bold line-clamp-2 leading-tight">{r.title}</h5>
                                    <div className="flex items-center gap-1.5 text-[8px] text-zinc-400">
                                      <Heart className={`w-2.5 h-2.5 ${r.hasLiked ? "text-red-500 fill-red-500" : ""}`} />
                                      <span>{r.likes}</span>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "news") {
                        return (
                          <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                                <span>📰 {isArabic ? "أحدث أخبار الأنمي والمانجا" : "Latest Anime News"}</span>
                                {sec.isPinned && <span className="text-[8px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                              </h3>
                            </div>
                            
                            <div className="space-y-2.5">
                              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 space-y-1 hover:border-amber-500/20 transition-colors">
                                <div className="flex justify-between text-[9px] text-amber-500 font-bold font-mono">
                                  <span>MAPPA STUDIO</span>
                                  <span>12m ago</span>
                                </div>
                                <h4 className="text-xs font-bold text-white">
                                  {isArabic ? "رسمياً: الكشف عن موعد عرض المقطع الترويجي للجزء القادم من سلسلة Chainsaw Man!" : "Official: Chainsaw Man upcoming movie trailer release date announced!"}
                                </h4>
                                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                                  {isArabic ? "أعلن استوديو MAPPA عبر حسابه الرسمي عن جدول عرض المقطع الدعائي الأول لفيلم Reze Arc المترقب بشدة..." : "MAPPA studio announced the precise release schedule for the highly-anticipated Reze Arc movie adaptation trailer..."}
                                </p>
                              </div>

                              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 space-y-1 hover:border-amber-500/20 transition-colors">
                                <div className="flex justify-between text-[9px] text-zinc-500 font-bold font-mono">
                                  <span>WEEKLY SHONEN JUMP</span>
                                  <span>2 hours ago</span>
                                </div>
                                <h4 className="text-xs font-bold text-white">
                                  {isArabic ? "مانجا One Piece تأخذ استراحة لمدة أسبوعين للتحضير للأحداث الملحمية الكبرى" : "One Piece manga enters 2-week break for epic climax preparation"}
                                </h4>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "events") {
                        return (
                          <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                            <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 flex items-center gap-1.5">
                              <span>🏆 {isArabic ? "الفعاليات الحية والبطولات" : "Active Live Events"}</span>
                              {sec.isPinned && <span className="text-[8px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                            </h3>
                            
                            <div className="space-y-2">
                              <div className="bg-gradient-to-r from-purple-950/20 to-zinc-900 p-3 rounded-xl border border-purple-900/30 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">LIVE GUILD CONTEST</span>
                                  <h4 className="text-xs font-bold text-white">{isArabic ? "تحدي تلوين مانجا الهجوم على العمالقة" : "Attack on Titan Coloring Battle"}</h4>
                                  <p className="text-[10px] text-zinc-400">{isArabic ? "الجائزة: 500 كوين سوداء 🪙 • ينتهي غداً" : "Prize: 500 Black Coins 🪙 • Ends tomorrow"}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    setBlackCoins(prev => prev + 100);
                                    alert(isArabic ? "تم تسجيلك بالمسابقة بنجاح! تم منحك 100 كوين تشجيعية!" : "Successfully registered! You received 100 promotional Coins!");
                                    playSynthSound("levelup");
                                    triggerHapticFeedback("levelup");
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                                >
                                  {isArabic ? "سجل الآن" : "Join Now"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "trends") {
                        return (
                          <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 flex items-center gap-1.5">
                              <span>🔥 {isArabic ? "المواضيع والأنميات الأكثر تداولاً" : "Top Hottest Trends"}</span>
                              {sec.isPinned && <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-center space-y-0.5">
                                <span className="text-[9px] text-zinc-500 block font-mono">#1</span>
                                <span className="text-xs font-black text-[#FF3D00] block truncate">BleachTYBW</span>
                                <span className="text-[8px] text-zinc-400 block font-mono">4.9k posts</span>
                              </div>
                              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-center space-y-0.5">
                                <span className="text-[9px] text-zinc-500 block font-mono">#2</span>
                                <span className="text-xs font-black text-white block truncate">SoloLeveling</span>
                                <span className="text-[8px] text-zinc-400 block font-mono">3.2k posts</span>
                              </div>
                              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-center space-y-0.5">
                                <span className="text-[9px] text-zinc-500 block font-mono">#3</span>
                                <span className="text-xs font-black text-white block truncate">KaijuNo8</span>
                                <span className="text-[8px] text-zinc-400 block font-mono">1.8k posts</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })
                  }
                    </>
                  )}

                </div>
              )}

              {/* TAB 2: EXPLORE & REELS VIEW */}
              {activeTab === "explore" && (
                <div className="flex-1 flex flex-col overflow-hidden pb-16">
                  
                  {/* EXPLORE SUB-TAB NAVIGATION BAR */}
                  <div className="flex bg-[#0A0A0A] border-b border-[#1F1F1F] p-2 gap-2 shrink-0 select-none">
                    <button
                      onClick={() => {
                        setExploreSubTab("ai");
                        playSynthSound("tap");
                        triggerHapticFeedback("tap");
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        exploreSubTab === "ai"
                          ? "bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-red-600/10 border border-red-500/20"
                          : "bg-zinc-950/60 border border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isArabic ? "🧠 توصيات الذكاء الاصطناعي" : "🧠 Discover AI Feed"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setExploreSubTab("search");
                        playSynthSound("tap");
                        triggerHapticFeedback("tap");
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        exploreSubTab === "search"
                          ? "bg-gradient-to-r from-zinc-850 to-zinc-900 border border-zinc-700 text-white shadow-lg"
                          : "bg-zinc-950/60 border border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isArabic ? "🔍 البحث والاستكشاف" : "🔍 Explore & Search"}</span>
                    </button>
                  </div>

                  {exploreSubTab === "ai" ? (
                    <div className="flex-1 overflow-y-auto p-4 pb-24">
                      <ContentDiscoveryFeed
                        isArabic={isArabic}
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        posts={posts}
                        setPosts={setPosts}
                        reels={reels}
                        setReels={setReels}
                        playSynthSound={playSynthSound}
                        triggerHapticFeedback={triggerHapticFeedback}
                        triggerInAppNotification={triggerInAppNotification}
                      />
                    </div>
                  ) : (
                    <SearchSystem
                      isArabic={isArabic}
                      currentUser={currentUser}
                      setCurrentUser={setCurrentUser}
                      posts={posts}
                      setPosts={setPosts}
                      reels={reels}
                      setReels={setReels}
                      stories={stories}
                      chats={chats}
                      playSynthSound={playSynthSound}
                      triggerHapticFeedback={triggerHapticFeedback}
                      triggerInAppNotification={triggerInAppNotification}
                      setViewedUserId={setViewedUserId}
                      setActiveTab={setActiveTab}
                    />
                  )}

                </div>
              )}

              {/* TAB 3: CREATE POST TAB */}
              {activeTab === "create" && (
                <UniversalPublisher
                  isArabic={isArabic}
                  currentUser={currentUser}
                  onPostCreated={async (newPostObj) => {
                    setActiveTab("home");
                    try {
                      const { db } = await import('./firebase');
                      const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                      const dbObj = { ...newPostObj, createdAt: serverTimestamp(), authorId: currentUser?.uid };
                      
                      if (newPostObj.category === "story") {
                         setStories([newPostObj, ...stories]);
                         await setDoc(doc(db, "stories", newPostObj.id), dbObj);
                      } else if (newPostObj.category === "reel") {
                         setReels([newPostObj, ...reels]);
                         await setDoc(doc(db, "reels", newPostObj.id), dbObj);
                      } else {
                         setPosts([newPostObj, ...posts]);
                         await setDoc(doc(db, "posts", newPostObj.id), dbObj);
                      }
                    } catch (e) {
                      const { handleFirestoreError, OperationType } = await import('./firestoreUtils');
                      handleFirestoreError(e, OperationType.CREATE, `${newPostObj.category === "story" ? "stories" : newPostObj.category === "reel" ? "reels" : "posts"}/${newPostObj.id}`);
                    }
                  }}
                  onAddCoins={(amount) => {
                    setBlackCoins((prev) => prev + amount);
                    if (currentUser) {
                      setCurrentUser({
                        ...currentUser,
                        coins: (currentUser.coins || 0) + amount,
                      });
                    }
                  }}
                  onAddXp={(amount) => {
                    if (currentUser) {
                      const nextXp = (currentUser.xp || 0) + amount;
                      const nextLevel = Math.floor(nextXp / 1000) + 1;
                      setCurrentUser({
                        ...currentUser,
                        xp: nextXp,
                        level: nextLevel > (currentUser.level || 1) ? nextLevel : (currentUser.level || 1),
                      });
                    }
                  }}
                  playSynthSound={playSynthSound}
                  triggerHapticFeedback={triggerHapticFeedback}
                  isOffline={isOffline}
                  triggerInAppNotification={triggerInAppNotification}
                  posts={posts}
                  setPosts={setPosts}
                />
              )}

              {/* TAB 4: CHATS & GEMINI AI BOT TAB */}
              {activeTab === "chat" && (
                <CommunitiesSystem
                  isArabic={isArabic}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  blackCoins={blackCoins}
                  setBlackCoins={setBlackCoins}
                  stars={stars}
                  setStars={setStars}
                  playSynthSound={playSynthSound}
                  triggerHapticFeedback={triggerHapticFeedback}
                  triggerInAppNotification={triggerInAppNotification}
                  triggerCelebration={triggerCelebration}
                  onOpenLiveSuite={(mode, target) => {
                    setLiveSuiteMode(mode);
                    setLiveSuiteTarget(target || null);
                    setShowLiveSuite(true);
                  }}
                />
              )}

              {/* TAB 5: PROFILE VIEW */}
              {activeTab === "profile" && (
                <div className="p-4 space-y-6 flex-1 overflow-y-auto pb-20">
                  <UserProfileSystem
                    isArabic={isArabic}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    posts={posts}
                    setPosts={setPosts}
                    reels={reels}
                    blackCoins={blackCoins}
                    setBlackCoins={setBlackCoins}
                    stars={stars}
                    setStars={setStars}
                    playSynthSound={playSynthSound}
                    triggerHapticFeedback={triggerHapticFeedback}
                    triggerInAppNotification={triggerInAppNotification}
                    triggerCelebration={triggerCelebration}
                  />

                  {/* Disabled legacy layout */}
                  {false && (
                    <>
                  {/* Cover image & user badge block */}
                  <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden relative shadow-md">
                    
                    {/* Simulated beautiful banner cover */}
                    <div className="h-28 bg-gradient-to-tr from-[#FF3D00]/40 via-purple-900/30 to-[#0A0A0A] relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,61,0,0.1)_0%,transparent_80%)]" />
                    </div>

                    <div className="p-4 relative">
                      {/* Avatar overflowing into banner */}
                      <div className="w-18 h-18 rounded-full p-[2px] bg-gradient-to-tr from-[#FF3D00] to-[#FF9100] absolute -top-9 left-4 shadow-xl">
                        <img src={currentUser.avatar} alt="Profile Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#121212]" />
                      </div>

                      {/* Header alignment wrapper */}
                      <div className="pl-24 pt-1 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            <h2 className="text-sm font-black text-white">{currentUser.name}</h2>
                            <span className="text-[#FF3D00] text-xs font-bold" title="Verified Professional">✔</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">@{currentUser.username}</span>
                        </div>
                        <span className="text-[9px] bg-zinc-900 text-[#FF3D00] border border-[#FF3D00]/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Pro Otaku
                        </span>
                      </div>

                      {/* Bio text */}
                      <p className="text-xs text-gray-300 mt-4 leading-relaxed">
                        {isArabic
                          ? "محور نقاشات الأنمي والمانجا • كاتب مراجعات محترف • من مشجعي استوديو مابا وون بيس الأبدي 🏴‍☠️✨"
                          : "Anime expert reviewer & content writer • MAPPA Fanboy • Straw Hat Pirate for life 🏴‍☠️✨"}
                      </p>

                      {/* Bento numbers block */}
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-zinc-900 pt-3">
                        <div 
                          className="bg-zinc-900/40 p-2 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors"
                          onClick={() => {
                            playSynthSound("tap");
                            setFollowersModalData({ type: "followers", userId: currentUser.uid });
                          }}
                        >
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">{isArabic ? "المتابعين" : "Followers"}</span>
                          <span className="text-xs font-black text-white font-mono">{currentUser?.followers?.length || 0}</span>
                        </div>
                        <div 
                          className="bg-zinc-900/40 p-2 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors"
                          onClick={() => {
                            playSynthSound("tap");
                            setFollowersModalData({ type: "following", userId: currentUser.uid });
                          }}
                        >
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">{isArabic ? "يتابع" : "Following"}</span>
                          <span className="text-xs font-black text-white font-mono">{currentUser?.following?.length || 0}</span>
                        </div>
                        <div className="bg-zinc-900/40 p-2 rounded-xl">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">{isArabic ? "منشوراتي" : "My Posts"}</span>
                          <span className="text-xs font-black text-white font-mono">
                            {posts.filter(p => p.author.username === currentUser.username).length}
                          </span>
                        </div>
                      </div>

                      {/* Meta lists (Country, language, age) */}
                      <div className="mt-4 border-t border-zinc-900 pt-3 text-[11px] text-zinc-400 space-y-1.5 font-semibold">
                        <div className="flex justify-between">
                          <span>{isArabic ? "الدولة والمنطقة" : "Country / Region"}</span>
                          <span className="text-zinc-200">{isArabic ? "المملكة العربية السعودية" : "Saudi Arabia"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isArabic ? "لغة الواجهة المفضلة" : "Preferred Language"}</span>
                          <span className="text-zinc-200">{isArabic ? "العربية (RTL)" : "Arabic RTL"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isArabic ? "العمر الافتراضي" : "Age Segment"}</span>
                          <span className="text-zinc-200">24 {isArabic ? "سنة" : "Years"}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  
                  {/* APPEARANCE MODE SHORTCUT */}
                  <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--theme-text)]">
                            {isArabic ? "المظهر" : "Appearance"}
                          </h3>
                          <p className="text-[9px] text-zinc-500">
                            {appearanceMode === "light" ? (isArabic ? "الوضع النهاري مفعّل" : "Light Mode") : (isArabic ? "الوضع الليلي مفعّل" : "Dark Mode")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          triggerHapticFeedback("tap");
                          playSynthSound("tap");
                          setAppearanceMode(appearanceMode === "light" ? "dark" : "light");
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg cursor-pointer"
                      >
                        {appearanceMode === "light" ? "🌙 " + (isArabic ? "الوضع الليلي" : "Dark") : "☀️ " + (isArabic ? "الوضع النهاري" : "Light")}
                      </button>
                    </div>
                  </div>

                  
                  <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-4 shadow-xl">
                    {/* Font settings */}
                    <div className="space-y-2 border-t border-[var(--theme-border)] pt-3">
                      <span className="block text-xs font-bold text-zinc-400">
                        {isArabic ? "حجم الخط الموحد:" : "System Font Scaling:"}
                      </span>
                      <div className="flex bg-[var(--theme-bg)] p-1 rounded-xl border border-[var(--theme-border)]">
                        {(["sm", "base", "lg", "xl"] as const).map((sz, szIdx) => {
                          const isActive = fontSize === sz;
                          return (
                            <button
                              key={`font_sz_${sz}_${szIdx}`}
                              onClick={() => {
                                setFontSize(sz);
                                triggerHapticFeedback("tap");
                                playSynthSound("tap");
                              }}
                              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                isActive
                                  ? "bg-[var(--theme-accent)] text-white shadow-md"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              {sz === "sm" && (isArabic ? "صغير" : "Small")}
                              {sz === "base" && (isArabic ? "افتراضي" : "Default")}
                              {sz === "lg" && (isArabic ? "كبير" : "Large")}
                              {sz === "xl" && (isArabic ? "ضخم" : "Huge")}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toggle Switch sound and haptics */}
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--theme-border)] pt-3">
                      <div className="flex items-center justify-between bg-[var(--theme-bg)] border border-[var(--theme-border)] p-2 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white">{isArabic ? "أصوات الواجهة" : "UI Sounds"}</span>
                          <span className="text-[8px] text-zinc-500">{isArabic ? "مؤثرات سينث" : "Synth Effects"}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSoundEffectsEnabled(!soundEffectsEnabled);
                            triggerHapticFeedback("tap");
                            if (!soundEffectsEnabled) {
                              setTimeout(() => playSynthSound("tap"), 100);
                            }
                          }}
                          className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                            soundEffectsEnabled ? "bg-[var(--theme-accent)]" : "bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 transform ${
                              soundEffectsEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[var(--theme-bg)] border border-[var(--theme-border)] p-2 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white">{isArabic ? "اللمس الاهتزازي" : "Haptic Vibration"}</span>
                          <span className="text-[8px] text-zinc-500">{isArabic ? "تأثير محاكاة اللمس" : "Haptic Simulation"}</span>
                        </div>
                        <button
                          onClick={() => {
                            const val = !hapticsEnabled;
                            setHapticsEnabled(val);
                            if (val) {
                              setTimeout(() => triggerHapticFeedback("tap"), 100);
                            }
                          }}
                          className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                            hapticsEnabled ? "bg-[var(--theme-accent)]" : "bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 transform ${
                              hapticsEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* VIBE & SOUND SIMULATOR TEST STATION */}
                    <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] p-2 rounded-xl space-y-2">
                      <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                        {isArabic ? "🚀 لوحة اختبار أصوات ومحاكاة اللمس المباشرة" : "LIVE HAPTIC & SYNTH TEST BENCH"}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            triggerHapticFeedback("tap");
                            playSynthSound("tap");
                          }}
                          className="bg-[var(--theme-card)] hover:bg-zinc-900 border border-[var(--theme-border)] rounded-lg py-1 text-[9px] font-bold text-zinc-300 hover:text-white transition-colors"
                        >
                          {isArabic ? "نقرة عادية" : "Regular Tap"}
                        </button>
                        <button
                          onClick={() => {
                            triggerHapticFeedback("success");
                            playSynthSound("success");
                          }}
                          className="bg-[var(--theme-card)] hover:bg-zinc-900 border border-[var(--theme-border)] rounded-lg py-1 text-[9px] font-bold text-zinc-300 hover:text-white transition-colors"
                        >
                          {isArabic ? "اهتزاز النجاح" : "Success Vibe"}
                        </button>
                        <button
                          onClick={() => {
                            triggerHapticFeedback("purchase");
                            playSynthSound("purchase");
                          }}
                          className="bg-[var(--theme-card)] hover:bg-zinc-900 border border-[var(--theme-border)] rounded-lg py-1 text-[9px] font-bold text-zinc-300 hover:text-white transition-colors"
                        >
                          {isArabic ? "عملية الشراء" : "Purchase Vibe"}
                        </button>
                        <button
                          onClick={() => {
                            triggerHapticFeedback("levelup");
                            playSynthSound("levelup");
                          }}
                          className="bg-[var(--theme-card)] hover:bg-zinc-900 border border-[var(--theme-border)] rounded-lg py-1 text-[9px] font-bold text-zinc-300 hover:text-white transition-colors"
                        >
                          {isArabic ? "رفع المستوى" : "Level Up Vibe"}
                        </button>
                      </div>
                      <div className="border-t border-zinc-900/60 pt-2 mt-2 flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            triggerCelebration(
                              "levelup",
                              "ترقية أسطورية: ليفل 99 أوتـاكو!",
                              "Legendary Upgrade: Level 99 Otaku!",
                              "مبارك لك يا صديقي الأوتـاكو المخلص! لقد تفاعلت بنشاط كافٍ وتجاوزت حدود الطاقة لترتفع إلى رتبة سيد الأنمي الأسطوري.",
                              "Congratulations, loyal Otaku friend! You have active engagement exceeding all limits, elevating your profile to Legendary Anime Sovereign.",
                              "500 BLACKCOINS"
                            );
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-yellow-600 hover:to-amber-500 text-white font-black py-1.5 rounded-lg text-[9px] shadow-md uppercase tracking-wider cursor-pointer"
                        >
                          👑 {isArabic ? "محاكاة احتفالية الترقية الأسطورية" : "Simulate Legendary Level-Up"}
                        </button>
                        <button
                          onClick={() => {
                            triggerInAppNotification(
                              isArabic ? "تم الإرسال بنجاح!" : "System Broadcast",
                              isArabic ? "عاجل: تم صدور الحلقة الجديدة من أنمي القمة الأن!" : "Breaking: The newest episode of Peak Anime has aired live!",
                              "HOT NEWS"
                            );
                          }}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold py-1 rounded-lg text-[9px] cursor-pointer"
                        >
                          🔔 {isArabic ? "محاكاة إشعار بداخل التطبيق" : "Test In-App Custom Banner"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit profile form segment */}
                  <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit className="w-4 h-4 text-[#FF3D00]" />
                      <span>{isArabic ? "تعديل بيانات الملف الشخصي" : "Edit Profile Particulars"}</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isArabic ? "الاسم المعروض" : "Display Name"}</label>
                        <input
                          type="text"
                          value={currentUser.name}
                          onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isArabic ? "صورة الأفاتار (رابط)" : "Avatar URL"}</label>
                        <input
                          type="text"
                          value={currentUser.avatar}
                          onChange={(e) => setCurrentUser({ ...currentUser, avatar: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Author's specific posts feed */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3D00]">
                      📝 {isArabic ? "منشوراتي المنشورة" : "My Authored Feed"}
                    </h3>
                    {posts.filter(p => p.author.username === currentUser.username).length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs bg-[#121212] rounded-2xl border border-zinc-900">
                        {isArabic ? "لم تقم بنشر أي منشور بعد" : "You haven't posted anything yet."}
                      </div>
                    ) : (
                      posts.filter(p => p.author.username === currentUser.username).map((post, pIdx) => (
                        <div key={post.id ? `my_post_${post.id}_${pIdx}` : `my_post_${pIdx}`} className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{post.author.name}</span>
                            <span 
                              className="text-[9px] text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                              title={formatFriendlyDate(post.createdAt, isArabic).fullDateTime}
                            >
                              {formatFriendlyDate(post.createdAt, isArabic).displayDate}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed">{post.content}</p>
                          {post.image && <img src={post.image} className="rounded-lg max-h-32 w-full object-cover" />}
                        </div>
                      ))
                    )}
                  </div>
                    </>
                  )}

                </div>
              )}

              {/* TAB 6: MORE VIEW */}
              {activeTab === "more" && currentUser && (
                <div className="flex-1 flex flex-col overflow-y-auto bg-[#060608] pb-20">
                  <MoreHub
                    appearanceMode={appearanceMode}
                    setAppearanceMode={setAppearanceMode}
                    isOpen={true}
                    isInline={true}
                    onOpenProfile={() => {
                      setActiveTab("profile");
                    }}
                    onClose={() => {}}
                    isArabic={isArabic}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    blackCoins={blackCoins}
                    setBlackCoins={setBlackCoins}
                    stars={stars}
                    setStars={setStars}
                    activeFrame={activeFrame}
                    setActiveFrame={setActiveFrame}
                    playSynthSound={playSynthSound}
                    triggerHapticFeedback={triggerHapticFeedback}
                    isOffline={isOffline}
                    addToOfflineQueue={(actionName) => {
                      setOfflineQueue((prev) => [...prev, actionName]);
                    }}
                    reduceMotion={reduceMotion}
                    setReduceMotion={setReduceMotion}
                    highContrast={highContrast}
                    setHighContrast={setHighContrast}
                    onOpenLiveSuite={(mode, target) => {
                      setLiveSuiteMode(mode);
                      setLiveSuiteTarget(target || null);
                      setShowLiveSuite(true);
                    }}
                    onOpenEconomy={() => setShowEconomySystem(true)}
                    onOpenAdministration={() => setShowAdministrationSystem(true)}
                  />
                </div>
              )}

            </div>

          </div>

          {/* PERSISTENT TABBED BOTTOM NAVIGATION SYSTEM */}
          <footer id="app_navigation_bar" className="h-16 bg-[#0D0D0D] border-t border-[#2A2A2A] flex items-center justify-around px-2 sticky bottom-0 z-40 select-none shrink-0 shadow-2xl">
            
            {/* Tab 1: Home */}
            <button
              id="nav_tab_home"
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              onClick={(e) => {
                if (isLongPressActiveRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  isLongPressActiveRef.current = false;
                  return;
                }
                setActiveTab("home");
                setShowAdmin(false);
                playSynthSound("tap");
                triggerHapticFeedback("tap");
              }}
              className={`relative flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 border border-transparent hover:border-[#FF3D00]/50 hover:shadow-[0_0_8px_rgba(255,61,0,0.35)] px-3 py-1 rounded-xl ${
                activeTab === "home" && !showAdmin ? "text-[#FF3D00] font-bold" : "text-gray-500 hover:text-white"
              }`}
            >
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 bg-[#141414] border border-[#FF3D00]/30 hover:border-[#FF3D00]/50 text-white py-2 px-3.5 rounded-xl shadow-2xl pointer-events-none flex flex-col items-center gap-1 text-center min-w-[130px]"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-[#FF3D00] font-black">
                      {isArabic ? "غير مقروء" : "Unread"}
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-100 bg-[#222] border border-[#333] px-2.5 py-0.5 rounded-lg">
                      {unreadCount}
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#141414]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={hasNewPosts ? {
                    scale: [1, 1.18, 1],
                    filter: ["drop-shadow(0 0 0px rgba(255,61,0,0))", "drop-shadow(0 0 4px rgba(255,61,0,0.6))", "drop-shadow(0 0 0px rgba(255,61,0,0))"]
                  } : { scale: 1, filter: "none" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative flex items-center justify-center"
                >
                  <Home className="w-5 h-5" />
                  {hasNewPosts && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF3D00] rounded-full ring-2 ring-[#0D0D0D] animate-ping" />
                  )}
                  {hasNewPosts && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF3D00] rounded-full ring-2 ring-[#0D0D0D]" />
                  )}
                </motion.div>

                {/* Active indicator dot beneath the home icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={activeTab === "home" && !showAdmin ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-1 h-1 bg-[#FF3D00] rounded-full mt-0.5"
                />
              </div>
              <span className="text-[9px] font-semibold">{isArabic ? "الرئيسية" : "Home"}</span>
            </button>

            {/* Tab 2: Explore */}
            <button
              id="nav_tab_explore"
              onClick={() => {
                setActiveTab("explore");
                setShowAdmin(false);
                playSynthSound("tap");
                triggerHapticFeedback("tap");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === "explore" && !showAdmin ? "text-[#FF3D00] font-bold" : "text-gray-500 hover:text-white"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{isArabic ? "استكشف" : "Explore"}</span>
            </button>

            {/* Floating Tab 3: Create */}
            <div className="relative">
              <button
                id="nav_tab_create"
                onClick={() => {
                  setShowCreateBottomSheet(true);
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                }}
                className="w-11 h-11 bg-gradient-to-tr from-[#FF3D00] to-[#FF9100] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-[#0A0A0A] absolute -top-8 left-1/2 -translate-x-1/2 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div className="h-6 w-12" /> {/* Spacing placeholder */}
            </div>

            {/* Tab 4: Messages / AI */}
            <button
              id="nav_tab_chat"
              onClick={() => {
                setActiveTab("chat");
                setShowAdmin(false);
                playSynthSound("tap");
                triggerHapticFeedback("tap");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === "chat" && !showAdmin ? "text-[#FF3D00] font-bold" : "text-gray-500 hover:text-white"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{isArabic ? "الرسائل" : "Chats"}</span>
            </button>

            {/* Tab 5: More */}
            <button
              id="nav_tab_more"
              onClick={() => {
                setActiveTab("more");
                setShowAdmin(false);
                playSynthSound("tap");
                triggerHapticFeedback("tap");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === "more" && !showAdmin ? "text-[#FF3D00] font-bold" : "text-gray-500 hover:text-white"
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{isArabic ? "المزيد" : "More"}</span>
            </button>

          </footer>

        </div>
      )}

      {/* Dynamic Simulated Haptic Feedback Toast Overlay */}
      <AnimatePresence>
        {hapticFeedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/95 text-white border border-[var(--theme-accent)] px-4 py-2.5 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-2xl z-50 pointer-events-none"
          >
            <span className="w-2 h-2 bg-[var(--theme-accent)] rounded-full animate-ping" />
            <span>{hapticFeedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume 1, Chapter 3 New Overlay Modals */}
      <CreateBottomSheet
        isOpen={showCreateBottomSheet}
        onClose={() => setShowCreateBottomSheet(false)}
        isArabic={isArabic}
        onCreateAction={(type) => {
          if (type === "post" || type === "poll") {
            setActiveTab("create");
          } else {
            alert(isArabic ? `📝 البدء في إنشاء: ${type}` : `📝 Starting creation of: ${type}`);
          }
        }}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback}
      />

      <HomeCustomizer
        isOpen={showHomeCustomizer}
        onClose={async () => {
          setShowHomeCustomizer(false);
          if (currentUser) {
            try {
              const { doc, updateDoc } = await import("firebase/firestore");
              await updateDoc(doc(db, "users", currentUser.uid), {
                homeSections: sections,
                homeWidgets: widgets,
                homeCardSize: cardSize,
                homeViewType: viewType,
              });
            } catch (e) {
              console.error("Failed to save layout to DB", e);
            }
          }
        }}
        isArabic={isArabic}
        sections={sections}
        widgets={widgets}
        setSections={setSections}
        setWidgets={setWidgets}
        savedLayouts={savedLayouts}
        setSavedLayouts={setSavedLayouts}
        cardSize={cardSize}
        setCardSize={setCardSize}
        viewType={viewType}
        setViewType={setViewType}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback}
      />

      {currentUser && (
        <MoreHub
          appearanceMode={appearanceMode}
          setAppearanceMode={setAppearanceMode}
          isOpen={showMoreHub}
          onClose={() => setShowMoreHub(false)}
          isArabic={isArabic}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          blackCoins={blackCoins}
          setBlackCoins={setBlackCoins}
          stars={stars}
          setStars={setStars}
          activeFrame={activeFrame}
          setActiveFrame={setActiveFrame}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          isOffline={isOffline}
          addToOfflineQueue={(actionName) => {
            setOfflineQueue((prev) => [...prev, actionName]);
          }}
          reduceMotion={reduceMotion}
          setReduceMotion={setReduceMotion}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          onOpenLiveSuite={(mode, target) => {
            setLiveSuiteMode(mode);
            setLiveSuiteTarget(target || null);
            setShowLiveSuite(true);
          }}
          onOpenEconomy={() => setShowEconomySystem(true)}
          onOpenAdministration={() => setShowAdministrationSystem(true)}
        />
      )}

      {showPrivateMessages && currentUser && (
        <PrivateMessagingSystem
          isArabic={isArabic}
          currentUser={currentUser}
          onClose={() => setShowPrivateMessages(false)}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          blackCoins={blackCoins}
          setBlackCoins={setBlackCoins}
          onOpenUserProfile={(uid) => {
            setViewedUserId(uid);
            setShowPrivateMessages(false);
          }}
        />
      )}

      {viewedUserId && currentUser && (
        <PublicProfileModal
          userId={viewedUserId}
          currentUser={currentUser}
          isArabic={isArabic}
          onClose={() => setViewedUserId(null)}
          onOpenFollowers={(type, userId) => setFollowersModalData({ type, userId })}
          onOpenMessage={(targetUser) => {
             setViewedUserId(null);
             setShowPrivateMessages(true);
             setTimeout(() => {
               window.dispatchEvent(new CustomEvent("startDirectChat", { detail: targetUser }));
             }, 350);
          }}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          triggerInAppNotification={triggerInAppNotification}
        />
      )}

      {followersModalData && (
        <FollowersModal
          userId={followersModalData.userId}
          type={followersModalData.type}
          isArabic={isArabic}
          onClose={() => setFollowersModalData(null)}
          onOpenProfile={(uid) => {
            setViewedUserId(uid);
          }}
          playSynthSound={playSynthSound}
          onOpenMessage={(targetUser) => {
            setFollowersModalData(null);
            setShowPrivateMessages(true);
          }}
        />
      )}

      {showLiveSuite && (
        <LiveStreamingSystem
          isArabic={isArabic}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          blackCoins={blackCoins}
          setBlackCoins={setBlackCoins}
          stars={stars}
          setStars={setStars}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          triggerInAppNotification={triggerInAppNotification}
          triggerCelebration={triggerCelebration}
          onClose={() => setShowLiveSuite(false)}
          initialMode={liveSuiteMode}
          initialTarget={liveSuiteTarget}
        />
      )}

      {showEconomySystem && (
        <EconomySystem
          isArabic={isArabic}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          blackCoins={blackCoins}
          setBlackCoins={setBlackCoins}
          stars={stars}
          setStars={setStars}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          triggerInAppNotification={triggerInAppNotification}
          triggerCelebration={triggerCelebration}
          onClose={() => setShowEconomySystem(false)}
          activeFrame={activeFrame}
          setActiveFrame={setActiveFrame}
        />
      )}

      {showAdministrationSystem && (
        <AdministrationSystem
          isArabic={isArabic}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          triggerInAppNotification={triggerInAppNotification}
          triggerCelebration={triggerCelebration}
          onClose={() => setShowAdministrationSystem(false)}
        />
      )}

      {/* Celebration Overlay Modal (Section 4.13) */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md select-none"
          >
            <motion.div
              initial={reduceMotion ? { scale: 1 } : { scale: 0.9, y: 50 }}
              animate={reduceMotion ? { scale: 1 } : { scale: 1, y: 0 }}
              exit={reduceMotion ? { scale: 1 } : { scale: 0.9, y: 50 }}
              className={`bg-zinc-950 border-2 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 relative overflow-hidden ${
                highContrast ? "border-white" : "border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
              }`}
            >
              {/* Animated background highlights */}
              {!reduceMotion && (
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] animate-pulse pointer-events-none" />
              )}
              
              <div className="relative z-10 space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg ${
                  highContrast ? "bg-white text-black border border-black" : "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-500/20"
                } ${reduceMotion ? "" : "animate-bounce"}`}>
                  {celebration.type === "levelup" && "👑"}
                  {celebration.type === "prestige" && "⚡"}
                  {celebration.type === "rarebox" && "📦"}
                  {celebration.type === "legendarycard" && "🃏"}
                  {celebration.type === "blackcoin" && "🪙"}
                  {celebration.type === "achievement" && "🏆"}
                  {celebration.type === "verification" && "✔"}
                </div>
                
                <div className="space-y-1">
                  <span className={`text-[10px] uppercase font-black tracking-widest block ${
                    highContrast ? "text-white" : "text-amber-500"
                  }`}>
                    {isArabic ? "مفاجأة وإنجاز خاص غير مسبوق!" : "Special Platform Event Achievement!"}
                  </span>
                  <h3 className={`text-lg font-black ${highContrast ? "text-white" : "text-white"}`}>
                    {isArabic ? celebration.titleAr : celebration.titleEn}
                  </h3>
                  <p className={`text-xs leading-relaxed ${highContrast ? "text-gray-200" : "text-zinc-400"}`}>
                    {isArabic ? celebration.descAr : celebration.descEn}
                  </p>
                </div>

                {celebration.reward && (
                  <div className={`py-2 px-4 rounded-xl inline-flex items-center gap-1.5 justify-center border ${
                    highContrast ? "bg-white border-black" : "bg-amber-500/10 border-amber-500/20"
                  }`}>
                    <span className={`text-xs font-black font-mono ${highContrast ? "text-black" : "text-amber-400"}`}>
                      +{celebration.reward}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    triggerHapticFeedback("tap");
                    playSynthSound("tap");
                    setCelebration(null);
                  }}
                  className={`w-full font-black text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer ${
                    highContrast
                      ? "bg-white text-black hover:bg-gray-100 border border-black"
                      : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-yellow-600 hover:to-amber-500 text-white active:scale-95"
                  }`}
                >
                  {isArabic ? "تابع الرحلة الأسطورية في عالم الأنمي 🚀" : "Continue Legendary Anime Journey 🚀"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Notification Overlay Banner (Section 4.15) */}
      <AnimatePresence>
        {inAppNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y < -20) {
                setInAppNotification(null);
              }
            }}
            onClick={() => {
              triggerHapticFeedback("tap");
              playSynthSound("tap");
              setInAppNotification(null);
              setShowNotificationsDrawer(true);
            }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 rounded-2xl p-4 flex gap-3 shadow-2xl z-50 cursor-pointer select-none backdrop-blur-md border ${
              highContrast ? "bg-black border-white text-white" : "bg-zinc-950/95 border-red-500/30 text-white"
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${
              highContrast ? "bg-white text-black" : "bg-gradient-to-tr from-red-600 to-orange-500"
            }`}>
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black truncate">{inAppNotification.title}</span>
                {inAppNotification.badge && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                    highContrast ? "bg-white text-black" : "bg-red-950 text-red-400"
                  }`}>
                    {inAppNotification.badge}
                  </span>
                )}
              </div>
              <p className={`text-[10px] leading-relaxed mt-0.5 truncate ${
                highContrast ? "text-gray-200" : "text-zinc-400"
              }`}>{inAppNotification.body}</p>
              <span className="text-[7px] text-zinc-600 font-mono mt-1 block">
                {isArabic ? "اسحب للأعلى للتجاهل • اضغط للتفاصيل" : "Swipe up to dismiss • Tap for details"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone Independent Notification Details Page Overlay */}
      <AnimatePresence>
        {selectedNotificationDetail && (
          <NotificationDetailsPage
            notification={selectedNotificationDetail}
            onClose={() => setSelectedNotificationDetail(null)}
            onDelete={async (id) => {
              try {
                const { doc, deleteDoc } = await import('firebase/firestore');
                await deleteDoc(doc(db, "notifications", id));
                setSelectedNotificationDetail(null);
                triggerInAppNotification(
                  isArabic ? "تم حذف الإشعار بنجاح" : "Notification Deleted",
                  isArabic ? "تم إزالة هذا التنبيه من سجلاتك." : "This alert has been removed from your history."
                );
              } catch (err) {
                console.error("Error deleting notification:", err);
              }
            }}
            onReply={async (id, text) => {
              try {
                const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
                const replyObj = {
                  id: `reply_${Date.now()}`,
                  senderName: currentUser?.name || currentUser?.username || (isArabic ? "عضو أوتوكو" : "Otaku Member"),
                  senderAvatar: currentUser?.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150",
                  text: text,
                  createdAt: new Date().toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                await updateDoc(doc(db, "notifications", id), {
                  replies: arrayUnion(replyObj)
                });
                
                // Also update the local detail state reactively
                setSelectedNotificationDetail(prev => {
                  if (prev && prev.id === id) {
                    const updatedReplies = prev.replies ? [...prev.replies, replyObj] : [replyObj];
                    return { ...prev, replies: updatedReplies };
                  }
                  return prev;
                });

                triggerInAppNotification(
                  isArabic ? "تم إرسال ردك بنجاح" : "Reply Sent Successfully",
                  isArabic ? "تم نشر الرد التفاعلي الخاص بك." : "Your interactive reply has been posted."
                );
              } catch (err) {
                console.error("Error replying to notification:", err);
              }
            }}
            isArabic={isArabic}
            posts={posts}
            currentUser={currentUser}
            playSynthSound={playSynthSound}
            triggerHapticFeedback={triggerHapticFeedback}
          />
        )}
      </AnimatePresence>

      {/* Full Screen Media Viewer Overlay (Section 4.16) */}
      <AnimatePresence>
        {activeMediaViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-50 flex flex-col justify-between p-4 backdrop-blur-md"
          >
            {/* Header toolbar */}
            <div className="flex justify-between items-center bg-black/35 p-2 rounded-xl border border-zinc-900/40 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white tracking-widest bg-red-600 px-2 py-0.5 rounded uppercase font-sans">
                  {activeMediaViewer.type === "image" ? (isArabic ? "معرض الصور" : "IMAGE VIEWER") : (isArabic ? "مشغل الفيديوهات" : "VIDEO PLAYER")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerHapticFeedback("tap");
                    alert(isArabic ? "✓ تم نسخ رابط الوسائط المباشر إلى حافظتك!" : "✓ Copied media direct link!");
                  }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    triggerHapticFeedback("success");
                    playSynthSound("success");
                    alert(isArabic ? "✓ تم حفظ وتنزيل هذا الملف على جهازك بنجاح!" : "✓ Saved and downloaded file to local device!");
                  }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    triggerHapticFeedback("tap");
                    setActiveMediaViewer(null);
                  }}
                  className="p-1.5 bg-zinc-900 hover:bg-red-600 hover:text-white rounded-full text-zinc-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media stage with Zoom */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4 select-none">
              <motion.div
                style={{ scale: activeMediaViewer.zoom }}
                drag
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                className="max-h-full max-w-full cursor-grab active:cursor-grabbing"
              >
                <img
                  src={activeMediaViewer.url}
                  className="max-h-[70vh] object-contain rounded-xl border border-zinc-900 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Footer toolbar: zoom controls */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold">{isArabic ? "مستوى التكبير الفوري للصورة:" : "Image Zoom Factor:"}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      setActiveMediaViewer(prev => prev ? { ...prev, zoom: Math.max(0.5, prev.zoom - 0.25) } : null);
                    }}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-white text-xs">{Math.round(activeMediaViewer.zoom * 100)}%</span>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      setActiveMediaViewer(prev => prev ? { ...prev, zoom: Math.min(3, prev.zoom + 0.25) } : null);
                    }}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <span className="block text-[8px] text-zinc-600 text-center uppercase tracking-wider font-semibold">
                {isArabic ? "اسحب في الفراغ للتحريك • انقر للتكبير والتصغير" : "Drag anywhere to pan • Click Zoom buttons to scale"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Menu Overlay (Section 4.4 & 4.20) */}
      <AnimatePresence>
        {contextMenu && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setContextMenu(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-zinc-950 border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-4 text-xs font-semibold space-y-2 select-none ${
                highContrast ? "border-white text-white bg-black" : "border-zinc-800 text-zinc-300"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-zinc-900 pb-2 mb-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-ping ${
                  highContrast ? "bg-white" : "bg-red-500"
                }`} />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-sans">
                  {isArabic ? "خيارات التفاعل الذكي (الضغط المطول)" : "Contextual Actions (Long Press)"}
                </span>
              </div>

              {contextMenu.type === "post" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleLikePost(contextMenu.id);
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-red-500 cursor-pointer text-left"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{isArabic ? "إعجاب سريع" : "Quick Like"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("success");
                      playSynthSound("success");
                      triggerInAppNotification(
                        isArabic ? "تم الحفظ كإشارة" : "Post Bookmarked",
                        isArabic ? "تم حفظ المنشور بنجاح في الإشارات المرجعية." : "Post saved safely to your reading list!"
                      );
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-amber-500 cursor-pointer text-left"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{isArabic ? "حفظ المنشور" : "Bookmark"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      alert(isArabic ? "تم إعادة تدوير ونشر هذا المنشور!" : "Successfully reposted this Otaku thought!");
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-emerald-500 cursor-pointer text-left"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isArabic ? "إعادة نشر" : "Repost"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      alert(isArabic ? "تم نسخ رابط المنشور!" : "Copied URL to clipboard!");
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-cyan-500 cursor-pointer text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{isArabic ? "نسخ الرابط" : "Copy URL"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("error");
                      playSynthSound("error");
                      alert(isArabic ? "تم إرسال بلاغ ضد هذا المحتوى للمشرفين." : "Report registered for content audit.");
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-red-500 cursor-pointer text-left"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{isArabic ? "بلاغ فوري" : "Report Post"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      setPosts(prev => prev.filter(p => p.id !== contextMenu.id));
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-zinc-500 cursor-pointer text-left"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isArabic ? "إخفاء المنشور" : "Hide Post"}</span>
                  </button>
                </div>
              )}

              {contextMenu.type === "image" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      triggerHapticFeedback("tap");
                      setActiveMediaViewer({ url: contextMenu.id, type: "image", zoom: 1, speed: 1, quality: "1080p" });
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-white cursor-pointer text-left"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isArabic ? "عرض بالحجم الكامل" : "View Full Size"}</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback("success");
                      playSynthSound("success");
                      alert(isArabic ? "✓ تم بدء التنزيل المباشر للصورة!" : "✓ Direct image download started!");
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 p-2.5 hover:bg-zinc-900 rounded-xl hover:text-amber-500 cursor-pointer text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isArabic ? "تنزيل الصورة" : "Download Image"}</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  triggerHapticFeedback("tap");
                  setContextMenu(null);
                }}
                className={`w-full py-2.5 rounded-2xl text-[10px] font-black uppercase text-center border mt-2 cursor-pointer ${
                  highContrast ? "bg-white text-black border-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800"
                }`}
              >
                {isArabic ? "إغلاق الخيارات" : "Cancel"}
              </button>
            </motion.div>
          </div>
        )}

        {/* STANDALONE DOWNLOAD APP PAGE OVERLAY */}
        {showDownloadAppPage && (
          <div className="fixed inset-0 z-50 bg-[#070709] overflow-y-auto">
            <DownloadAppPage onClose={() => setShowDownloadAppPage(false)} isArabic={isArabic} />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
