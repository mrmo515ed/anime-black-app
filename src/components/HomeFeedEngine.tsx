import { PostItem } from "./PostItem";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Plus,
  Tv,
  Flame,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Gift,
  ShoppingCart,
  Users,
  Compass,
  Radio,
  ChevronRight,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ChevronLeft,
  X,
  Play,
  CheckCircle,
  Gamepad2,
  Shield,
  Trash2,
  Copy,
  Sliders,
  Bell,
  Check,
  Zap,
  Music,
  Link,
  Palette, Eye, Repeat, Star, Coins, MoreVertical, MoreHorizontal, Flag, UserMinus, VolumeX, EyeOff, ShieldAlert, Pin, Lock, Unlock, Download, RotateCcw, AlertTriangle, UserX, FileText } from "lucide-react";
import { JstClockDisplay } from "./JstClockDisplay";

export interface HomeSection {
  id: string;
  titleAr: string;
  titleEn: string;
  isVisible: boolean;
  isPinned: boolean;
}

export interface HomeWidget {
  id: string;
  titleAr: string;
  titleEn: string;
  isActive: boolean;
}

const HOME_ACTIVE_MEMBERS = [
{
  uid: "taymour_owner",
  name: "أبو تـيم السـيد 👑",
  username: "taymour_owner",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  statusAr: "يدير السيرفر 👑⚙️",
  statusEn: "Managing Server 👑⚙️"
},
{
  uid: "mora_admin",
  name: "مـورا المـدير 🛡️",
  username: "mora_admin",
  avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  statusAr: "ينظم الفعاليات 🎪",
  statusEn: "Organizing Events 🎪"
},
{
  uid: "luffy_gear5",
  name: "لوفي قبعة القش 👒",
  username: "luffy_gear5",
  avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150",
  statusAr: "يأكل اللحم 🍖",
  statusEn: "Eating Meat 🍖"
},
{
  uid: "gojo_sixeyes",
  name: "ساتورو غوجو 🔮",
  username: "gojo_sixeyes",
  avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150",
  statusAr: "يتحدى سوكونا 🤞",
  statusEn: "Challenging Sukuna 🤞"
},
{
  uid: "mikasa_ack",
  name: "ميكاسا أكرمان 🧣",
  username: "mikasa_ack",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  statusAr: "تراقب إيرين 👀🧣",
  statusEn: "Watching Eren 👀🧣"
},
{
  uid: "zoro_swords",
  name: "رورونوا زورو 🧭",
  username: "zoro_swords",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  statusAr: "ضائع في طوكيو 🧭⚔️",
  statusEn: "Lost in Tokyo 🧭⚔️"
},
{
  uid: "sukuna_curse",
  name: "ريومن سوكونا 🔥",
  username: "sukuna_curse",
  avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
  statusAr: "يخطط للمجال الغاشم 💀",
  statusEn: "Domain Expansion 💀"
},
{
  uid: "gemini_bot",
  name: "مساعد الأوتـاكو 🤖",
  username: "gemini_bot",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
  statusAr: "يحلل المانجا المسرّبة 📊",
  statusEn: "Analyzing leaked manga 📊"
}];


interface HomeFeedEngineProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  posts: any[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  stories: any[];
  setStories: React.Dispatch<React.SetStateAction<any[]>>;
  reels: any[];
  setReels: React.Dispatch<React.SetStateAction<any[]>>;
  blackCoins: number;
  setBlackCoins: React.Dispatch<React.SetStateAction<number>>;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (title: string, body: string, badge?: string) => void;
  triggerCelebration: (type: string, titleAr: string, titleEn: string, bodyAr: string, bodyEn: string, reward: string) => void;
  sections: HomeSection[];
  setSections: React.Dispatch<React.SetStateAction<HomeSection[]>>;
  widgets: HomeWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<HomeWidget[]>>;
  cardSize: "small" | "medium" | "large";
  viewType: "grid" | "list" | "compact";
  setShowHomeCustomizer: (show: boolean) => void;
}

import { getBadgeImgForLevel, getTitleForLevel } from '../utils';

export default function HomeFeedEngine({
  isArabic,
  currentUser,
  setCurrentUser,
  posts,
  setPosts,
  stories,
  setStories,
  reels,
  setReels,
  blackCoins,
  setBlackCoins,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  triggerCelebration,
  sections,
  setSections,
  widgets,
  setWidgets,
  cardSize,
  viewType,
  setShowHomeCustomizer
}: HomeFeedEngineProps) {
  // Local States
  const [showStoryCreateModal, setShowStoryCreateModal] = useState(false);
  const [newStoryMedia, setNewStoryMedia] = useState("");
  const [newStoryQuestion, setNewStoryQuestion] = useState("");
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  // Extended Stories States
  const [newStoryType, setNewStoryType] = useState<"image" | "video" | "text" | "poll" | "qa" | "link" | "music" | "anime_card" | "character_card">("image");
  const [newStoryEntityType, setNewStoryEntityType] = useState<"user" | "friend" | "group" | "guild" | "space" | "event" | "admin">("user");
  const [newStoryEntityName, setNewStoryEntityName] = useState("");
  const [newStoryThemeFrame, setNewStoryThemeFrame] = useState<"none" | "red-dragon" | "purple-susanoo" | "neon-cyberspace" | "cherry-blossom">("none");
  const [newStoryAnimeEffect, setNewStoryAnimeEffect] = useState<"none" | "sharingan" | "ki-aura" | "sakura-leaves" | "glitch" | "fire-sparks" | "lightning">("none");
  const [newStoryMusicTitle, setNewStoryMusicTitle] = useState("");
  const [newStoryMusicArtist, setNewStoryMusicArtist] = useState("");
  const [newStoryLinkUrl, setNewStoryLinkUrl] = useState("");
  const [newStoryLinkTitle, setNewStoryLinkTitle] = useState("");
  const [newStoryPollQuestion, setNewStoryPollQuestion] = useState("");
  const [newStoryPollOptions, setNewStoryPollOptions] = useState<string[]>(["", ""]);
  const [newStoryStickers, setNewStoryStickers] = useState<string[]>([]);
  const [newStoryXpReward, setNewStoryXpReward] = useState("0");
  const [newStoryCoinReward, setNewStoryCoinReward] = useState("0");
  const [newStoryAllowReplies, setNewStoryAllowReplies] = useState(true);
  const [newStoryAllowShare, setNewStoryAllowShare] = useState(true);
  const [newStoryPreventDownload, setNewStoryPreventDownload] = useState(false);
  const [newStoryAudience, setNewStoryAudience] = useState<"public" | "friends" | "followers" | "custom">("public");

  const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>("all");
  const [userVotedStories, setUserVotedStories] = useState<Record<string, string>>({}); // storyId -> optionText
  const [claimedStoryRewards, setClaimedStoryRewards] = useState<Record<string, boolean>>({}); // storyId -> true

  // Tokyo Clock Time

  // Search and discover keyword
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSortAlgorithm, setSelectedSortAlgorithm] = useState<"ai" | "latest" | "reputation">("ai");
  
  // Post feed filter: 'trending' (الأكثر تفاعلاً) | 'latest' (الأحدث) | 'following' (المنشورات المتابعة فقط)
  const [postFilter, setPostFilter] = useState<"trending" | "latest" | "following">("trending");

  // Streak Shield Status
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakShieldCount, setStreakShieldCount] = useState(2); // simulated items
  const [streakDays, setStreakDays] = useState(12);
  const [streakBrokenReason, setStreakBrokenReason] = useState<string | null>(null);

  // Live Broadcast room simulator
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<any | null>({
    title: isArabic ? "🎙️ مناقشة مراجعة مانجا ون بيس 1115!" : "🎙️ One Piece Manga 1115 Chapter Review!",
    speakersCount: 5,
    listenersCount: 142,
    host: "Zoro_Otaku"
  });

  // Events subscriptions state
  const [eventParticipation, setEventParticipation] = useState<Record<string, boolean>>({
    "1": true,
    "2": false
  });

  // Daily Tasks state
  const [claimedTasks, setClaimedTasks] = useState<Record<string, boolean>>({
    "1": true,
    "2": false,
    "3": false
  });

  // Real-time active registered members state
  const [realActiveMembers, setRealActiveMembers] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    const loadRealUsers = async () => {
      try {
        const { db } = await import("../firebase");
        const { collection, onSnapshot } = await import("firebase/firestore");

        unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
          const usersList = snapshot.docs.
          map((doc, _autoIdx) => ({
            uid: doc.id,
            name: doc.data().name || "أوتاكو مجهول",
            username: doc.data().username || "otaku",
            avatar: doc.data().avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            statusAr: doc.data().isOnline ? "متصل الآن 🟢" : "متصل بالرادار 📡",
            statusEn: doc.data().isOnline ? "Online now 🟢" : "Radar active 📡",
            isReal: true
          })).
          filter((u) => u.uid !== currentUser?.uid);
          setRealActiveMembers(usersList);
        });
      } catch (err) {
        console.error("Error subscribing to users in HomeFeedEngine:", err);
      }
    };
    if (currentUser?.uid) {
      loadRealUsers();
    }
    return () => unsubscribe();
  }, [currentUser]);

  const combinedActiveMembers = realActiveMembers;


  // AI recommendations (8.20)
  const aiRecommendations = {
    publishTime: isArabic ? "7:00 مساءً (توقيت الذروة للأوتاكو)" : "7:00 PM (Otaku Peak Engagement)",
    userToFollow: { name: "Luffy_King", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
    guildToJoin: isArabic ? "نقابة قبعة القش (S-Rank)" : "StrawHat Pirates Guild (S-Rank)",
    bestAnime: isArabic ? "سولو ليفيلينغ الموسم الثاني" : "Solo Leveling Season 2"
  };

  // Simulated events data
  const eventsList = [
  {
    id: "1",
    titleAr: "البطولة الكبرى لمعلومات الشونين 🏆",
    titleEn: "Grand Shonen Trivia Championship 🏆",
    cover: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600",
    timeLeft: isArabic ? "متبقي 4 ساعات" : "4h remaining",
    participants: 1250,
    rewards: "500 Coins + Elite Badge",
    tag: isArabic ? "🔥 حماسي" : "🔥 Epic"
  },
  {
    id: "2",
    titleAr: "مسابقة تصميم غلاف أنمي بالذكاء الاصطناعي 🎨",
    titleEn: "AI Anime Fanart Cover Competition 🎨",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    timeLeft: isArabic ? "متبقي يومين" : "2 days remaining",
    participants: 430,
    rewards: "200 Coins + Rare Frame",
    tag: isArabic ? "✨ موسمي" : "✨ Seasonal"
  }];


  // News data
  const newsList = [
  {
    id: "n1",
    titleAr: "عاجل: الإعلان رسمياً عن فيلم أنمي جديد للمخرج ماكوتو شينكاي في 2027!",
    titleEn: "Breaking: Makoto Shinkai announces his next anime film for release in 2027!",
    source: "Anime News Network",
    category: "Movie",
    likes: 980,
    isHot: true
  },
  {
    id: "n2",
    titleAr: "مراجعة الموسم الأخير من هجوم العمالقة ومقارنته بنهاية المانجا",
    titleEn: "Attack on Titan Final Season comprehensive review & manga differences",
    source: "Otaku Portal",
    category: "Review",
    likes: 420,
    isHot: false
  }];


  // Anime Universe items (8.12)
  const universeTimeline = [
  {
    id: "u1",
    animeAr: "ون بيس - الحلقة 1118",
    animeEn: "One Piece - Episode 1118",
    typeAr: "حلقة جديدة فوراً 📺",
    typeEn: "New Episode Live 📺",
    studio: "Toei Animation",
    hypeRating: "9.9"
  },
  {
    id: "u2",
    animeAr: "جوجوتسو كايسن - الفصل 268",
    animeEn: "Jujutsu Kaisen - Chapter 268",
    typeAr: "فصل مانجا مترجم 📚",
    typeEn: "Manga Chapter 📚",
    studio: "Shueisha",
    hypeRating: "9.7"
  }];


  // Marketplace mini items (8.13)
  const marketplaceItems = [
  { id: "m1", titleAr: "إطار هالة النار المشتعلة", titleEn: "Blazing Fire Aura Frame", price: 150, type: "frame", icon: "🖼️" },
  { id: "m2", titleAr: "بطاقة هانتر أسطورية نادرة", titleEn: "Legendary Hunter Card (Rare)", price: 450, type: "card", icon: "🃏" },
  { id: "m3", titleAr: "لقب 'سيد الظلال' الفاخر", titleEn: "Sovereign of Shadows Title", price: 200, type: "title", icon: "👑" }];


  // Handler to participate in an event
  const handleParticipateEvent = (eventId: string, titleAr: string, titleEn: string) => {
    playSynthSound("success");
    triggerHapticFeedback("success");
    setEventParticipation((prev) => ({ ...prev, [eventId]: !prev[eventId] }));

    if (!eventParticipation[eventId]) {
      triggerInAppNotification(
        isArabic ? "تم الاشتراك بالفعالية!" : "Registered for Event!",
        isArabic ? `لقد انضممت بنجاح إلى: ${titleAr}` : `You have joined: ${titleEn}`,
        "🎉"
      );
    }
  };

  // Handler to claim daily mission reward (8.15)
  const handleClaimTask = (taskId: string, coinsReward: number, xpReward: number, taskName: string) => {
    if (claimedTasks[taskId]) return;
    playSynthSound("levelup");
    triggerHapticFeedback("levelup");
    setClaimedTasks((prev) => ({ ...prev, [taskId]: true }));
    setBlackCoins((prev) => prev + coinsReward);

    // Update level / XP
    setCurrentUser((prevUser: any) => {
      if (!prevUser) return prevUser;
      const nextXp = (prevUser.xp || 0) + xpReward;
      const nextLvl = Math.floor(nextXp / 1000) + 1;
      const levelUpOccurred = nextLvl > (prevUser.level || 1);

      if (levelUpOccurred) {
        setTimeout(() => {
          triggerCelebration(
            "levelup",
            `ترقية المستوى لـ ${nextLvl}!`,
            `Leveled Up to ${nextLvl}!`,
            "مبارك لك يا بطل الأوتـاكو! مستواك وتأثيرك يزداد قوة في مجتمع أنمي بلاك.",
            "Awesome! Your level and influence are growing stronger across Anime Black.",
            "100 COINS"
          );
        }, 300);
      }

      return {
        ...prevUser,
        xp: nextXp,
        level: nextLvl,
        coins: (prevUser.coins || 0) + coinsReward
      };
    });

    triggerInAppNotification(
      isArabic ? "مكافأة المهمة اليومية!" : "Daily Reward Claimed!",
      isArabic ? `تم استلام +${coinsReward} كوين و +${xpReward} XP بنجاح!` : `Received +${coinsReward} Coins & +${xpReward} XP!`,
      "🪙"
    );
  };

  // Restore Streak (8.16)
  const handleRestoreStreak = () => {
    if (streakShieldCount > 0) {
      playSynthSound("success");
      triggerHapticFeedback("success");
      setStreakShieldCount((prev) => prev - 1);
      setStreakDays((prev) => prev + 1);
      setStreakBrokenReason(null);
      triggerInAppNotification(
        isArabic ? "تم تفعيل بطاقة حماية Streak" : "Streak Shield Activated",
        isArabic ? "تم استعادة أيامك المتتالية بنجاح وحمايتها!" : "Streak successfully restored and secured!",
        "🛡️"
      );
    } else {
      playSynthSound("error");
      triggerHapticFeedback("error");
      triggerInAppNotification(
        isArabic ? "لا تملك بطاقات حماية" : "No Shields Available",
        isArabic ? "يمكنك شراء بطاقات حماية Streak من المتجر أولاً." : "Purchase Streak Shield cards in the Theme Store.",
        "⚠️"
      );
    }
  };

  // Pull to refresh simulation
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshFeed = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    setTimeout(() => {
      setIsRefreshing(false);
      triggerInAppNotification(
        isArabic ? "تم تحديث الخلاصة الفورية" : "Home Feed Refreshed",
        isArabic ? "تحديث تلقائي مخصص وتطبيق ترتيب المحتوى الذكي!" : "Content sorted by tailored Discover AI weights successfully!",
        "♻️"
      );
    }, 1200);
  };

  // Create Story Item
  const handleCreateStory = () => {
    if (newStoryType !== "text" && !newStoryMedia.trim()) return;

    playSynthSound("success");
    triggerHapticFeedback("success");

    const payload = {
      mediaType: newStoryType === "video" ? "video" : "image",
      url: newStoryMedia || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
      media: newStoryMedia || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
      question: newStoryQuestion || null,
      storyType: newStoryType,
      entityType: newStoryEntityType,
      entityName: newStoryEntityName || null,
      themeFrame: newStoryThemeFrame,
      animeEffect: newStoryAnimeEffect,
      musicTitle: newStoryMusicTitle || null,
      musicArtist: newStoryMusicArtist || null,
      linkUrl: newStoryLinkUrl || null,
      linkTitle: newStoryLinkTitle || null,
      poll: newStoryPollQuestion ? {
        question: newStoryPollQuestion,
        options: newStoryPollOptions.filter((o) => o.trim() !== "").map((o, _autoIdx) => ({ text: o, votes: 0 }))
      } : null,
      stickers: newStoryStickers,
      xpReward: Number(newStoryXpReward) || 0,
      coinReward: Number(newStoryCoinReward) || 0,
      allowReplies: newStoryAllowReplies,
      allowShare: newStoryAllowShare,
      preventDownload: newStoryPreventDownload,
      audience: newStoryAudience,
      author: {
        name: currentUser?.name || "Otaku Pioneer",
        username: currentUser?.username || "otaku",
        avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      }
    };

    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).
    then((res) => res.json()).
    then((data) => {
      setStories([data, ...stories]);
    }).
    catch((err) => {
      console.error("Failed to post story to server, falling back to local:", err);
      const fallbackStory = {
        id: "s" + Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...payload
      };
      setStories([fallbackStory, ...stories]);
    });

    // Reset All Inputs
    setNewStoryMedia("");
    setNewStoryQuestion("");
    setNewStoryType("image");
    setNewStoryEntityType("user");
    setNewStoryEntityName("");
    setNewStoryThemeFrame("none");
    setNewStoryAnimeEffect("none");
    setNewStoryMusicTitle("");
    setNewStoryMusicArtist("");
    setNewStoryLinkUrl("");
    setNewStoryLinkTitle("");
    setNewStoryPollQuestion("");
    setNewStoryPollOptions(["", ""]);
    setNewStoryStickers([]);
    setNewStoryXpReward("0");
    setNewStoryCoinReward("0");
    setNewStoryAllowReplies(true);
    setNewStoryAllowShare(true);
    setNewStoryPreventDownload(false);
    setNewStoryAudience("public");
    setShowStoryCreateModal(false);

    triggerInAppNotification(
      isArabic ? "تم نشر قصتك بنجاح!" : "Story Published!",
      isArabic ? "ستختفي قصتك التفاعلية تلقائياً بعد 24 ساعة." : "Your story is now live for all Otakus!",
      "📸"
    );
  };

  // Sort/filter posts based on search, post filter ('trending' | 'latest' | 'following'), and algorithms
  const getProcessedPosts = () => {
    let result = [...posts];

    // 1. Filter by following if postFilter is 'following' (المنشورات المتابعة فقط)
    if (postFilter === "following") {
      const followingList: string[] = currentUser?.following || [];
      result = result.filter((post) => {
        const authorId = post.authorId || post.author?.id || post.author?.uid;
        const authorUsername = post.author?.username;
        const isMe =
          (currentUser?.uid && (authorId === currentUser.uid || authorUsername === currentUser.username)) ||
          (currentUser?.id && (authorId === currentUser.id || authorUsername === currentUser.username)) ||
          (currentUser?.username && authorUsername === currentUser.username);

        const isFollowed =
          (authorId && followingList.includes(authorId)) ||
          (authorUsername && followingList.includes(authorUsername));

        return isMe || isFollowed;
      });
    }

    // 2. Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (post) =>
          post.content?.toLowerCase().includes(keyword) ||
          post.author?.name?.toLowerCase().includes(keyword) ||
          post.author?.username?.toLowerCase().includes(keyword)
      );
    }

    // 3. Sort logic based on postFilter
    if (postFilter === "trending") {
      // الأكثر تفاعلاً (Most Engaging): sorts by comprehensive engagement weight
      result.sort((a, b) => {
        const scoreA =
          (a.likes || 0) * 2 +
          (a.comments?.length || 0) * 3 +
          (a.reposts || 0) * 2 +
          (a.shares || 0) * 2 +
          (a.stars || 0) * 2 +
          (a.saves || 0) * 1.5 +
          (a.views || 0) * 0.05;
        const scoreB =
          (b.likes || 0) * 2 +
          (b.comments?.length || 0) * 3 +
          (b.reposts || 0) * 2 +
          (b.shares || 0) * 2 +
          (b.stars || 0) * 2 +
          (b.saves || 0) * 1.5 +
          (b.views || 0) * 0.05;

        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else if (postFilter === "latest") {
      // الأحدث (Latest): sorts newest posts first
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (postFilter === "following") {
      // المنشورات المتابعة فقط: sorts followed posts by newest first
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  };

  const processedPosts = getProcessedPosts();

  return (
    <div className="space-y-6 flex-1 overflow-y-auto pb-24">
      
      {/* 8.21 QUICK GLOBAL SEARCH & SORT FILTER */}
      <div className="bg-[#121212]/70 p-3 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
            <Compass className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={isArabic ? "بحث سريع في أنمي بلاك..." : "Global fast search..."}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-all" />
          
          {searchKeyword &&
          <button onClick={() => setSearchKeyword("")} className="absolute right-3 top-2.5 text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          }
        </div>
        

        {/* Algorithm selection & refresh (8.5 & 8.19) */}
        <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
          <select
            value={selectedSortAlgorithm}
            onChange={(e) => {
              setSelectedSortAlgorithm(e.target.value as any);
              playSynthSound("tap");
              triggerHapticFeedback("tap");
            }}
            className="bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-zinc-300 focus:outline-none">
            
            <option value="ai">🧠 {isArabic ? "Discover AI (خوارزمية ذكية)" : "Discover AI Engine"}</option>
            <option value="latest">⏱️ {isArabic ? "الأحدث أولاً" : "Latest Uploaded"}</option>
            <option value="reputation">⭐ {isArabic ? "حسب سمعة الناشر" : "High Reputation Creator"}</option>
          </select>

          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-300 active:scale-95 transition-all cursor-pointer"
            title={isArabic ? "سحب للتحديث" : "Pull to Refresh Feed"}>
            
            <Zap className={`w-3.5 h-3.5 text-yellow-500 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 🟢 ACTIVE ONLINE MEMBERS CAROUSEL */}
      <div className="bg-[#121212]/50 border border-zinc-900 rounded-2xl p-4 shadow-md backdrop-blur-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {isArabic ? "الأعضاء المتصلون الآن بالرادار 📡" : "Active Members Online 📡"}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 font-bold bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-900">
            {combinedActiveMembers.length} {isArabic ? "نشط" : "active"}
          </span>
        </div>

        {combinedActiveMembers.length === 0 ?
        <div className="text-center py-6 text-zinc-600 text-xs font-bold border border-zinc-900 bg-zinc-950/40 rounded-2xl">
            {isArabic ? "لا يوجد أعضاء متصلون حالياً بالرادار 📡" : "No active members online on the radar 📡"}
          </div> :

        <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent select-none">
            {combinedActiveMembers.map((member, _autoIdx) => {
            const statusText = isArabic ? member.statusAr : member.statusEn;
            return (
              <motion.div
                key={`act_mem_${member.uid || "uid"}_${_autoIdx}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  window.dispatchEvent(new CustomEvent('openProfile', { detail: member.uid }));
                }}
                className="flex flex-col items-center text-center cursor-pointer min-w-[76px] max-w-[76px] group relative">
                
                  {/* Avatar with dynamic premium gradient ring */}
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-500 via-emerald-600 to-teal-500 opacity-30 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    <img
                    src={member.avatar}
                    alt={member.name}
                    className="relative w-14 h-14 rounded-full object-cover border-2 border-zinc-950 group-hover:border-green-500 transition-all shadow-md" />
                  
                    {/* Blinking pulse green dot */}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full shadow-lg flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    </span>
                  </div>

                  {/* Name */}
                  <span className="text-[10px] font-black text-zinc-300 group-hover:text-white transition-colors truncate w-16 mt-2.5 block leading-tight">
                    {member.name}
                  </span>

                  {/* Animated visual custom status */}
                  <span className="text-[7.5px] text-zinc-500 group-hover:text-green-400 transition-colors truncate w-18 block font-medium mt-0.5 font-mono">
                    {statusText}
                  </span>
                </motion.div>);

          })}
          </div>
        }
      </div>

      {/* 8.3 HIGH-CONTRAST INTERACTIVE WIDGET DECK */}
      {widgets.some((w) => w.isActive) &&
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {widgets.filter((w) => w.isActive && w.id === "jstClock").map((_, i) =>
        <div key={`jstClock_${i}`} className="bg-gradient-to-br from-[#121212] to-zinc-950 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  {isArabic ? "توقيت طوكيو المباشر (JST)" : "Tokyo Live Time (JST)"}
                </span>
                <h4 className="text-xl font-black text-white font-mono tracking-widest drop-shadow-md">
                  <JstClockDisplay />
                </h4>
              </div>
              <Tv className="w-8 h-8 text-red-600 opacity-80 group-hover:scale-110 transition-transform" />
            </div>
        )}

          {widgets.filter((w) => w.isActive && w.id === "quests").map((_, i) =>
        <div key={`quests_${i}`} className="bg-[#121212] border border-zinc-800/80 p-4 rounded-2xl space-y-2.5 shadow-xl relative">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-red-500 uppercase font-black tracking-wider flex items-center gap-1">
                  <span>🎯 {isArabic ? "المهام اليومية والنشاط" : "Daily Otaku Tasks"}</span>
                </span>
                <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  {Object.values(claimedTasks).filter(Boolean).length}/3
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] text-zinc-300">
                  <span className={claimedTasks["1"] ? "line-through text-zinc-500" : ""}>
                    {isArabic ? "1. اقرأ فصلاً من المانجا اليوم (+100 XP)" : "1. Read 1 Manga chapter (+100 XP)"}
                  </span>
                  <button
                onClick={() => handleClaimTask("1", 50, 100, "Read Manga")}
                disabled={claimedTasks["1"]}
                className={`px-2 py-0.5 rounded text-[9px] font-black ${
                claimedTasks["1"] ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`
                }>
                
                    {claimedTasks["1"] ? isArabic ? "مكتمل" : "Claimed" : isArabic ? "استلام" : "Claim"}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-300">
                  <span className={claimedTasks["2"] ? "line-through text-zinc-500" : ""}>
                    {isArabic ? "2. تفاعل مع منشورين بالمنتدى (+50 XP)" : "2. Interact with 2 posts (+50 XP)"}
                  </span>
                  <button
                onClick={() => handleClaimTask("2", 30, 50, "Interact Posts")}
                disabled={claimedTasks["2"]}
                className={`px-2 py-0.5 rounded text-[9px] font-black ${
                claimedTasks["2"] ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`
                }>
                
                    {claimedTasks["2"] ? isArabic ? "مكتمل" : "Claimed" : isArabic ? "استلام" : "Claim"}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-300">
                  <span className={claimedTasks["3"] ? "line-through text-zinc-500" : ""}>
                    {isArabic ? "3. شاهد 15 ثانية ريلز أنمي (+150 XP)" : "3. Watch 15s anime reels (+150 XP)"}
                  </span>
                  <button
                onClick={() => handleClaimTask("3", 75, 150, "Watch Reels")}
                disabled={claimedTasks["3"]}
                className={`px-2 py-0.5 rounded text-[9px] font-black ${
                claimedTasks["3"] ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`
                }>
                
                    {claimedTasks["3"] ? isArabic ? "مكتمل" : "Claimed" : isArabic ? "استلام" : "Claim"}
                  </button>
                </div>
              </div>
            </div>
        )}

          {widgets.filter((w) => w.isActive && w.id === "digitalCard").map((_, i) =>
        <div key={`digitalCard_${i}`} className="bg-[#121212] border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="w-12 h-12 rounded-full border-2 border-red-600 p-0.5 bg-[#0A0A0A] shrink-0">
                <img src={currentUser?.avatar} className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white leading-none">{currentUser?.name}</span>
                  <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                    {currentUser?.role || (isArabic ? "عضو" : "Member")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-800 shadow-sm flex-shrink-0">
                    <img src={getBadgeImgForLevel(currentUser?.level || 1)} alt="Badge" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold truncate max-w-[150px]">{getTitleForLevel(currentUser?.level || 1)}</p>
                </div>
                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                  <span>ID: {currentUser?.id || "#AB-9039"}</span>
                  <span className="text-red-500 font-black">LVL {currentUser?.level || 42}</span>
                </div>
              </div>
            </div>
        )}

          {widgets.filter((w) => w.isActive && w.id === "otakuMood").map((_, i) =>
        <div key={`otakuMood_${i}`} className="bg-[#121212] border border-zinc-800/80 p-4 rounded-2xl space-y-2.5 shadow-xl relative overflow-hidden">
              <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">
                🎭 {isArabic ? "حالة الأوتـاكو والمزاج" : "Otaku Hype State"}
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-200">
                  {isArabic ? "أشاهد حالياً مراجعات ون بيس ومنتظر حلقة الغد! 🔥" : "Deep into One Piece reviews, hyped for tomorrow! 🔥"}
                </span>
                <div className="text-xl">🔥</div>
              </div>
              <div className="flex gap-1.5">
                <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                  {isArabic ? "الحالة: متصل" : "Status: Active"}
                </span>
                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                  {isArabic ? "السمعة: ممتازة" : "Reputation: Golden"}
                </span>
              </div>
            </div>
        )}
        </div>
      }

      {/* 8.16 DYNAMIC STREAK BANNER & BROKEN WARNING */}
      <div className="bg-[#121212] border border-zinc-850 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">
              {isArabic ? `${streakDays} يوماً متتالياً في أنمي بلاك!` : `${streakDays} Days Daily Active Streak!`}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {isArabic ? "حافظ على استمرارك للحفاظ على المكافأة والـ Multiplier!" : "Check in tomorrow to maintain your active multiplier!"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playSynthSound("tap");
            triggerHapticFeedback("tap");
            setShowStreakModal(true);
          }}
          className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all hover:scale-105">
          
          {isArabic ? "حماية Streak" : "Streak Shield"}
        </button>
      </div>

      {/* 8.10 STORY STRIP HEADER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>{isArabic ? "القصص اليومية التفاعلية" : "Interactive Otaku Stories"}</span>
          </h3>
          <button
            onClick={() => setShowStoryCreateModal(true)}
            className="text-[10px] bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 font-black px-2.5 py-1 rounded-lg shadow transition-all cursor-pointer">
            
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? "نشر قصة" : "Add Story"}</span>
          </button>
        </div>

        {/* Story Category Filters (Section 8.10) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
          {[
          { id: "all", labelAr: "🌐 الكل", labelEn: "🌐 All" },
          { id: "friends", labelAr: "👥 الأصدقاء", labelEn: "👥 Friends" },
          { id: "admin", labelAr: "👑 الإشراف", labelEn: "👑 Staff" },
          { id: "guild", labelAr: "⚔️ النقابات", labelEn: "⚔️ Guilds" },
          { id: "space", labelAr: "🌌 العوالم", labelEn: "🌌 Spaces" }].
          map((filt, _autoIdx) =>
          <button
            key={`${filt.id}_${_autoIdx}`}
            onClick={() => {
              playSynthSound("tap");
              setSelectedStoryFilter(filt.id);
            }}
            className={`px-3 py-1 text-[9px] font-black rounded-full border transition-all shrink-0 ${
            selectedStoryFilter === filt.id ?
            "bg-gradient-to-r from-red-600 to-[#FF3D00] border-red-500 text-white shadow-sm shadow-red-600/30" :
            "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"}`
            }>
            
              {isArabic ? filt.labelAr : filt.labelEn}
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1.5 select-none scrollbar-thin">
          {/* Create story trigger card */}
          <div
            onClick={() => setShowStoryCreateModal(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
            
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900/40 hover:border-red-600 transition-colors p-1">
              <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-zinc-400">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-bold">{isArabic ? "قصتك" : "Your Story"}</span>
          </div>

          {/* Stories loop */}
          {stories.
          filter((story) => {
            if (selectedStoryFilter === "all") return true;
            if (selectedStoryFilter === "friends") return story.entityType === "friend" || story.entityType === "user" || !story.entityType;
            return story.entityType === selectedStoryFilter;
          }).
          map((story, _autoIdx) => {
            // Custom Frame styling
            let frameClass = "border-2 border-red-500 p-[2px]";
            let glowStyle = {};

            if (story.themeFrame === "red-dragon") {
              frameClass = "border-2 border-red-600 p-[2px]";
              glowStyle = { boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)", border: "2px solid #ef4444" };
            } else if (story.themeFrame === "purple-susanoo") {
              frameClass = "border-2 border-purple-500 p-[2px]";
              glowStyle = { boxShadow: "0 0 10px rgba(168, 85, 247, 0.8)", border: "2px solid #a855f7" };
            } else if (story.themeFrame === "neon-cyberspace") {
              frameClass = "border-2 border-cyan-400 p-[2px]";
              glowStyle = { boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)", border: "2px solid #22d3ee" };
            } else if (story.themeFrame === "cherry-blossom") {
              frameClass = "border-2 border-pink-400 p-[2px]";
              glowStyle = { boxShadow: "0 0 10px rgba(244, 114, 182, 0.8)", border: "2px solid #f472b6" };
            }

            // Entity Badge
            let badgeIcon = "";
            if (story.entityType === "admin") badgeIcon = "👑";else
            if (story.entityType === "guild") badgeIcon = "⚔️";else
            if (story.entityType === "space") badgeIcon = "🌌";else
            if (story.entityType === "event") badgeIcon = "📅";

            return (
              <div
                key={`${story.id}_${_autoIdx}`}
                onClick={() => {
                  setSelectedStory(story);
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer relative group">
                
                  <div
                  style={glowStyle}
                  className={`w-14 h-14 rounded-full ${frameClass} bg-[#0A0A0A] hover:scale-105 transition-transform duration-300 relative`}>
                  
                    <img src={story.author.avatar} alt="Story User" className="w-full h-full rounded-full object-cover" />
                    
                    {/* Entity floating badge */}
                    {badgeIcon &&
                  <span className="absolute -bottom-1 -right-1 text-xs bg-black rounded-full w-4 h-4 flex items-center justify-center border border-zinc-800 shadow-lg">
                        {badgeIcon}
                      </span>
                  }

                    {/* Quick indicator of story content type */}
                    {story.storyType === "music" &&
                  <span className="absolute -top-1 -left-1 text-[8px] bg-black text-red-500 rounded-full w-4 h-4 flex items-center justify-center border border-zinc-800 shadow-md">
                        🎵
                      </span>
                  }
                    {story.storyType === "poll" &&
                  <span className="absolute -top-1 -left-1 text-[8px] bg-black text-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-zinc-800 shadow-md">
                        📊
                      </span>
                  }
                  </div>
                  <span className="text-[10px] text-gray-300 font-bold truncate max-w-[65px] group-hover:text-white transition-colors">
                    {story.author.name}
                  </span>
                </div>);

          })}
        </div>
      </div>

      {/* 8.17 LIVE ROOM BROADCAST ACCENT BAR */}
      {activeVoiceRoom &&
      <div className="bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-transparent border border-purple-900/40 p-3.5 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  {isArabic ? "🎙️ مباشر" : "🎙️ Live Space"}
                </span>
                <span className="text-[9px] text-zinc-500 font-bold">Hosted by @{activeVoiceRoom.host}</span>
              </div>
              <h5 className="text-xs font-black text-zinc-100 mt-1">{activeVoiceRoom.title}</h5>
            </div>
          </div>
          <button
          onClick={() => {
            playSynthSound("success");
            triggerHapticFeedback("tap");
            triggerInAppNotification(
              isArabic ? "تم الانضمام للغرفة الصوتية" : "Joined Audio Space",
              isArabic ? "أنت تستمع الآن لمراجعة مانجا ون بيس!" : "You are now listening to the chapter breakdown room!",
              "🎙️"
            );
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95">
          
            {isArabic ? "استماع" : "Listen In"}
          </button>
        </div>
      }

      {/* SECTIONS CONTROLLERS */}
      <div className="space-y-6">
        {sections.
        filter((sec) => sec.isVisible).
        map((sec, secIdx) => {
          // RENDERING: posts (8.7)
          if (sec.id === "posts") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-4">
                  {/* Posts Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                        <span>{isArabic ? "📝 منتدى منشورات الأوتـاكو" : "📝 Otaku Community Feed"}</span>
                        {sec.isPinned && <span className="text-[8px] bg-red-950 text-red-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">📌 {isArabic ? "مثبت" : "Pinned"}</span>}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                        {processedPosts.length} {isArabic ? "منشور" : "posts"}
                      </span>
                    </div>

                    {/* Active Filter Indicator Badge */}
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <span className="text-zinc-500">{isArabic ? "العرض الحالي:" : "Current View:"}</span>
                      <span className="font-bold text-red-400">
                        {postFilter === "trending" && (isArabic ? "الأكثر تفاعلاً 🔥" : "Top Engaging 🔥")}
                        {postFilter === "latest" && (isArabic ? "الأحدث ⏱️" : "Latest ⏱️")}
                        {postFilter === "following" && (isArabic ? "المتابَعة فقط 👥" : "Following Only 👥")}
                      </span>
                    </div>
                  </div>

                  {/* 🎯 SHORTER & MODERN POST FEED FILTER BAR (شريط فلاتر المنشورات) */}
                  <div className="bg-[#121212]/95 p-1.5 rounded-2xl border border-zinc-800/90 shadow-xl backdrop-blur-md">
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* 1. الأكثر تفاعلاً */}
                      <button
                        id="btn-filter-trending"
                        onClick={() => {
                          setPostFilter("trending");
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                        }}
                        className={`relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                          postFilter === "trending"
                            ? "bg-gradient-to-r from-red-600 via-[#FF3D00] to-amber-600 text-white shadow-lg shadow-red-600/30 border border-red-500/50 scale-[1.02]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent"
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 shrink-0 ${postFilter === "trending" ? "text-yellow-300 animate-pulse" : "text-zinc-500"}`} />
                        <span className="truncate">{isArabic ? "الأكثر تفاعلاً" : "Top Engaging"}</span>
                      </button>

                      {/* 2. الأحدث */}
                      <button
                        id="btn-filter-latest"
                        onClick={() => {
                          setPostFilter("latest");
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                        }}
                        className={`relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                          postFilter === "latest"
                            ? "bg-gradient-to-r from-red-600 via-[#FF3D00] to-amber-600 text-white shadow-lg shadow-red-600/30 border border-red-500/50 scale-[1.02]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent"
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${postFilter === "latest" ? "text-white" : "text-zinc-500"}`} />
                        <span className="truncate">{isArabic ? "الأحدث" : "Latest"}</span>
                      </button>

                      {/* 3. المنشورات المتابعة فقط */}
                      <button
                        id="btn-filter-following"
                        onClick={() => {
                          setPostFilter("following");
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                        }}
                        className={`relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                          postFilter === "following"
                            ? "bg-gradient-to-r from-red-600 via-[#FF3D00] to-amber-600 text-white shadow-lg shadow-red-600/30 border border-red-500/50 scale-[1.02]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent"
                        }`}
                      >
                        <Users className={`w-3.5 h-3.5 shrink-0 ${postFilter === "following" ? "text-purple-200" : "text-zinc-500"}`} />
                        <span className="truncate">{isArabic ? "المتابَعة فقط" : "Following"}</span>
                        {(currentUser?.following?.length || 0) > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 hidden sm:inline-block ${
                            postFilter === "following" ? "bg-black/40 text-purple-200" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {currentUser?.following?.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Discover AI helper box suggestion (8.20) */}
                  <div className="bg-gradient-to-l from-red-600/10 via-amber-500/5 to-transparent rounded-2xl p-4 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-1 relative z-10 text-center sm:text-left">
                      <h4 className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{isArabic ? "المساعد الذكي (Anime AI)" : "Gemini Intelligent Assistant"}</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed max-w-lg">
                        {isArabic ?
                      `أفضل وقت مخصص للنشر لك هو ${aiRecommendations.publishTime}. نقترح عليك الانضمام إلى ${aiRecommendations.guildToJoin} لزيادة السمعة!` :
                      `Your personalized best posting window is ${aiRecommendations.publishTime}. Consider joining ${aiRecommendations.guildToJoin} for maximum engagement!`}
                      </p>
                    </div>
                  </div>

                  {/* List of Posts */}
                  <div className="grid grid-cols-1 gap-4">
                    {processedPosts.length === 0 ? (
                      postFilter === "following" ? (
                        <div className="text-center py-10 px-5 bg-zinc-950/70 rounded-2xl border border-zinc-850 space-y-3 shadow-inner">
                          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400 shadow-md">
                            <Users className="w-6 h-6" />
                          </div>
                          <div className="space-y-1 max-w-md mx-auto">
                            <h4 className="text-xs font-black text-white">
                              {isArabic ? "لا توجد منشورات من الحسابات المتابَعة" : "No posts from followed creators yet"}
                            </h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                              {isArabic
                                ? "لم يقم المستخدمون الذين تتابعهم بنشر أي محتوى جديد مؤخراً، أو أنك لم تتابع حسابات بعد. تابع المزيد من مبدعي الأوتاكو لتظهر منشوراتهم هنا!"
                                : "The creators you follow haven't posted recently, or you haven't followed any creators yet. Follow more members to see their updates here!"}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setPostFilter("trending");
                                playSynthSound("tap");
                                triggerHapticFeedback("tap");
                              }}
                              className="bg-gradient-to-r from-red-600 to-[#FF3D00] hover:from-red-500 hover:to-[#FF5722] text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-1.5"
                            >
                              <Flame className="w-3.5 h-3.5 text-yellow-300" />
                              <span>{isArabic ? "عرض الأكثر تفاعلاً" : "Explore Top Posts"}</span>
                            </button>
                            <button
                              onClick={() => {
                                setPostFilter("latest");
                                playSynthSound("tap");
                                triggerHapticFeedback("tap");
                              }}
                              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-2 rounded-xl border border-zinc-800 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isArabic ? "الأحدث" : "Latest"}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 px-4 bg-zinc-950/50 rounded-2xl border border-zinc-850 space-y-2">
                          <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-xs text-zinc-300 font-black">
                            {isArabic ? "لا توجد منشورات مطابقة" : "No matching posts found"}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {searchKeyword.trim()
                              ? (isArabic ? `لا توجد نتائج بحث لكلمة "${searchKeyword}"` : `No results found for "${searchKeyword}"`)
                              : (isArabic ? "جرّب تغيير الفلتر للاطلاع على محتوى جديد" : "Try changing filters to discover new posts")}
                          </p>
                        </div>
                      )
                    ) : (
                      processedPosts.map((post, postIdx) => (
                        <PostItem
                          key={post.id ? `${post.id}_${postIdx}` : `post_${postIdx}`}
                          post={post as any}
                          currentUser={currentUser}
                          isArabic={isArabic}
                          playSynthSound={playSynthSound}
                          triggerHapticFeedback={triggerHapticFeedback}
                          triggerInAppNotification={triggerInAppNotification}
                          onUpdatePost={async (updatedPost) => {
                            // Optimistic UI update
                            setPosts((prev) => prev.map((p, _autoIdx) => (p.id === updatedPost.id ? updatedPost : p)));

                            // Real-time Firebase sync
                            try {
                              const { db } = await import("../firebase");
                              const { doc, updateDoc } = await import("firebase/firestore");
                              const postRef = doc(db, "posts", updatedPost.id);

                              await updateDoc(postRef, {
                                likes: updatedPost.likes ?? 0,
                                saves: updatedPost.saves ?? 0,
                                reposts: updatedPost.reposts ?? 0,
                                stars: updatedPost.stars ?? 0,
                                coins: updatedPost.coins ?? 0,
                                views: updatedPost.views ?? 0,
                                content: updatedPost.content ?? "",
                                isEdited: updatedPost.isEdited ?? false,
                              });
                            } catch (e) {
                              const { handleFirestoreError, OperationType } = await import("../firestoreUtils");
                              handleFirestoreError(e, OperationType.UPDATE, `posts/${updatedPost.id}`);
                            }
                          }}
                          onDeletePost={async (postId) => {
                            // Optimistic UI update: remove post immediately
                            setPosts((prev) => prev.filter((p) => p.id !== postId));
                            playSynthSound("error");
                            triggerHapticFeedback("error");

                            try {
                              const { db } = await import("../firebase");
                              const { doc, deleteDoc } = await import("firebase/firestore");
                              await deleteDoc(doc(db, "posts", postId));
                              triggerInAppNotification(
                                isArabic ? "تم حذف المنشور" : "Post Deleted",
                                isArabic ? "تم إزالة المنشور بنجاح" : "Post removed successfully",
                                "🗑️"
                              );
                            } catch (e) {
                              console.error("Failed to delete post:", e);
                            }
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>);

          }

          // RENDERING: reels (8.11)
          if (sec.id === "reels") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center justify-between">
                    <span>🎬 {isArabic ? "ريلز الأنمي الموصى بها" : "Suggested Reels Feed"}</span>
                    <span className="text-[8px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-black uppercase">
                      {isArabic ? "خوارزمية المشاهدة" : "Hype Engine"}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {reels.slice(0, 4).map((reel, rIdx) =>
                  <div key={reel.id ? `${reel.id}_${rIdx}` : `reel_${rIdx}`} className="aspect-[9/16] bg-black rounded-xl border border-zinc-850 relative overflow-hidden group">
                        <img src={reel.thumbnail || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-2.5">
                          <span className="self-end text-[8px] bg-black/60 px-1.5 py-0.5 rounded font-bold text-white flex items-center gap-1">
                            👁️ {reel.views || "1.2K"}
                          </span>
                          <div className="space-y-1">
                            <span className="block text-[10px] text-white font-bold truncate">{reel.title}</span>
                            <span className="block text-[8px] text-zinc-400 truncate">@{reel.author?.username || reel.author?.name || reel.author}</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer">
                          <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                      </div>
                  )}
                  </div>
                </div>);

          }

          // RENDERING: news (8.9)
          if (sec.id === "news") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                    <span>📰 {isArabic ? "آخر أخبار الأنمي العاجلة" : "Latest Anime News"}</span>
                  </h3>
                  <div className="space-y-2.5">
                    {newsList.map((news, nIdx) =>
                  <div key={news.id ? `${news.id}_${nIdx}` : `news_${nIdx}`} className="p-3 bg-zinc-900/60 hover:bg-zinc-900/90 rounded-xl border border-zinc-850 flex items-center justify-between gap-3 transition-colors">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{news.category}</span>
                            {news.isHot && <span className="text-[8px] text-yellow-400 font-bold flex items-center gap-0.5">🔥 HOT</span>}
                          </div>
                          <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                            {isArabic ? news.titleAr : news.titleEn}
                          </h4>
                          <span className="block text-[8px] text-zinc-500 font-mono">via {news.source} • {news.likes} reads</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      </div>
                  )}
                  </div>
                </div>);

          }

          // RENDERING: events (8.8)
          if (sec.id === "events") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500">
                    <span>🎉 {isArabic ? "الفعاليات الحالية والمسابقات" : "Active Events & Quizzes"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {eventsList.map((ev, evIdx) => {
                    const joined = eventParticipation[ev.id];
                    return (
                      <div key={ev.id ? `${ev.id}_${evIdx}` : `ev_${evIdx}`} className="bg-zinc-900/60 rounded-xl border border-zinc-850 overflow-hidden flex flex-col justify-between">
                          <div className="h-28 relative">
                            <img src={ev.cover} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                            <div className="absolute top-2 left-2 flex gap-1.5">
                              <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{ev.tag}</span>
                              <span className="text-[8px] bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded-full font-mono">{ev.timeLeft}</span>
                            </div>
                          </div>
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-black text-white">{isArabic ? ev.titleAr : ev.titleEn}</h4>
                              <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? `الجوائز: ${ev.rewards}` : `Rewards: ${ev.rewards}`}</p>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-900/40">
                              <span className="text-[8px] text-zinc-400">{ev.participants} joined</span>
                              <button
                              onClick={() => handleParticipateEvent(ev.id, ev.titleAr, ev.titleEn)}
                              className={`text-[9px] font-black px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                              joined ? "bg-zinc-800 text-zinc-400" : "bg-red-600 text-white hover:bg-red-700"}`
                              }>
                              
                                {joined ? isArabic ? "تم الاشتراك ✓" : "Registered ✓" : isArabic ? "شارك الآن" : "Join Event"}
                              </button>
                            </div>
                          </div>
                        </div>);

                  })}
                  </div>
                </div>);

          }

          // RENDERING: trends (8.2, 8.5)
          if (sec.id === "trends") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500">
                    <span>📈 {isArabic ? "الهاشتاجات والترند اليوم" : "Trending Otaku Tags"}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-white block">#OnePiece1115</span>
                        <span className="text-[8px] text-zinc-500 block mt-0.5">14.2K {isArabic ? "منشور" : "posts"}</span>
                      </div>
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-white block">#SoloLeveling_S2</span>
                        <span className="text-[8px] text-zinc-500 block mt-0.5">9.5K {isArabic ? "منشور" : "posts"}</span>
                      </div>
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  </div>
                </div>);

          }

          // RENDERING: animeUniverse (8.12)
          if (sec.id === "animeUniverse") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-500">
                      <span>🪐 {isArabic ? "كون الأنمي (Anime Universe)" : "Anime Universe updates"}</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {universeTimeline.map((uni, uIdx) =>
                  <div key={uni.id ? `${uni.id}_${uIdx}` : `uni_${uIdx}`} className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-850 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-black">{isArabic ? uni.typeAr : uni.typeEn}</span>
                          <h4 className="text-xs font-bold text-white">{isArabic ? uni.animeAr : uni.animeEn}</h4>
                          <span className="block text-[8px] text-zinc-500">{uni.studio} • Hype {uni.hypeRating}/10</span>
                        </div>
                        <Tv className="w-5 h-5 text-red-500 opacity-60" />
                      </div>
                  )}
                  </div>
                </div>);

          }

          // RENDERING: marketplace (8.13, 8.14)
          if (sec.id === "marketplace") {
            return (
              <div key={`sec_${sec.id}_${secIdx}`} className="space-y-3 bg-[#121212]/30 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center justify-between">
                    <span>🛒 {isArabic ? "متجر العناصر النادرة والبطاقات" : "Rare Items Marketplace"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {marketplaceItems.map((item, mIdx) =>
                  <div key={item.id ? `${item.id}_${mIdx}` : `item_${mIdx}`} className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850 flex flex-col justify-between h-24">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-[10px] font-black text-zinc-200 line-clamp-1">{isArabic ? item.titleAr : item.titleEn}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900/40">
                          <span className="text-[9px] text-yellow-500 font-mono font-black">🪙 {item.price} Coins</span>
                          <button
                        onClick={() => {
                          if (blackCoins >= item.price) {
                            playSynthSound("purchase");
                            triggerHapticFeedback("purchase");
                            setBlackCoins((prev) => prev - item.price);
                            triggerInAppNotification(
                              isArabic ? "تم شراء العنصر!" : "Item Purchased!",
                              isArabic ? "تم حفظ العنصر بحقيبتك الشخصية بنجاح." : "Item added to your Digital Inventory.",
                              "🛍️"
                            );
                          } else {
                            playSynthSound("error");
                            triggerHapticFeedback("error");
                            triggerInAppNotification(
                              isArabic ? "فشل الشراء" : "Purchase Failed",
                              isArabic ? "عذراً، رصيدك من الكوينز غير كافٍ!" : "Insufficient Black Coins in your wallet!",
                              "⚠️"
                            );
                          }
                        }}
                        className="bg-yellow-600 text-black text-[8px] font-black px-2 py-1 rounded hover:bg-yellow-500">
                        
                            {isArabic ? "شراء" : "Buy"}
                          </button>
                        </div>
                      </div>
                  )}
                  </div>
                </div>);

          }

          return null;
        })}
      </div>

      {/* 8.18 PAGE EMPTY / SUGGESTION REELS IN CASE */}
      {processedPosts.length === 0 &&
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 text-center space-y-4">
          <h4 className="text-xs font-black text-white">{isArabic ? "مرحباً بك في أنمي بلاك! 🌟" : "Welcome to Anime Black! 🌟"}</h4>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            {isArabic ? "الصفحة الرئيسية قابلة للتخصيص بالكامل. تابع بعض المستخدمين واشترك بالمسابقات لتلقي تحديثات فروع الأوتاكو المباشرة!" : "Your Home Feed can be configured to any liking. Follow other Otakus to get real time feed updates."}
          </p>
        </div>
      }

      {/* 8.16 STREAK COOLDOWN AND CARD MODAL */}
      <AnimatePresence>
        {showStreakModal &&
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setShowStreakModal(false)} className="fixed inset-0 bg-black z-50" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl z-50 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-white">{isArabic ? "نظام حماية الـ Streak" : "Streak Shield Protection"}</span>
                <button onClick={() => setShowStreakModal(false)} className="p-1 hover:bg-zinc-900 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 text-2xl animate-bounce">
                  🛡️
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {isArabic ?
                `أنت تملك حالياً ${streakShieldCount} بطاقة حماية لـ Streak الخاص بك. إذا انقطع نشاطك، سيتم استهلاك بطاقة واحدة تلقائياً لحماية أيامك!` :
                `You have ${streakShieldCount} Streak Shield cards left. If you miss a day, 1 shield card will be consumed automatically to protect your active multiplier.`}
                </p>
                {streakBrokenReason &&
              <span className="block text-[10px] text-red-400 bg-red-950/20 py-1 rounded">
                    {streakBrokenReason}
                  </span>
              }
              </div>
              <div className="flex gap-2">
                <button
                onClick={handleRestoreStreak}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] rounded-xl active:scale-95 transition-all">
                
                  {isArabic ? "تفعيل بطاقة حماية" : "Use Streak Shield"}
                </button>
                <button
                onClick={() => {
                  playSynthSound("tap");
                  setShowStreakModal(false);
                  triggerInAppNotification(
                    isArabic ? "متجر المظهر" : "Theme Store",
                    isArabic ? "قم بزيارة متجر العناصر لشراء المزيد من بطاقات الحماية." : "Streak Shield cards are sold in the Theme Store marketplace.",
                    "🛍️"
                  );
                }}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-[10px] rounded-xl">
                
                  {isArabic ? "شراء بطاقات" : "Buy Cards"}
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* 8.10 STORY PREVIEW MODAL */}
      <AnimatePresence>
        {selectedStory &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950 z-50 flex flex-col justify-between p-4 overflow-hidden">
            
              {/* Background anime effects & particles overlays */}
              {selectedStory.animeEffect === "ki-aura" &&
            <div className="absolute inset-0 bg-red-600/5 animate-pulse blur-xl pointer-events-none border-[12px] border-red-600/10" />
            }
              {selectedStory.animeEffect === "sharingan" &&
            <div className="absolute top-20 right-4 w-16 h-16 bg-[#FF3D00]/10 rounded-full flex items-center justify-center animate-spin pointer-events-none border border-red-600/30 shadow-[0_0_15px_rgba(255,61,0,0.4)]" style={{ animationDuration: "12s" }}>
                  <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                    <div className="absolute top-0 w-2 h-2 bg-black rounded-full" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 bg-black rounded-full" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-black rounded-full" />
                  </div>
                </div>
            }
              {selectedStory.animeEffect === "sakura-leaves" &&
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  {[...Array(6)].map((_, i) =>
              <motion.div
                key={`sakura_leaf_${selectedStory.id || 'curr'}_${i}`}
                initial={{ y: -50, x: Math.random() * 320, opacity: 0.8, rotate: 0 }}
                animate={{ y: 800, x: Math.random() * 320 + 50, opacity: 0, rotate: 360 }}
                transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "linear" }}
                className="absolute text-pink-400 text-lg">
                
                      🌸
                    </motion.div>
              )}
                </div>
            }
              {selectedStory.animeEffect === "glitch" &&
            <div className="absolute inset-0 pointer-events-none bg-zinc-950/10 z-10">
                  <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-pulse" />
                </div>
            }
              {selectedStory.animeEffect === "fire-sparks" &&
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  {[...Array(8)].map((_, i) =>
              <motion.div
                key={`fire_spark_${selectedStory.id || 'curr'}_${i}`}
                initial={{ y: 650, x: Math.random() * 320, scale: 0.5 + Math.random(), opacity: 1 }}
                animate={{ y: -100, x: Math.random() * 320 - 50, opacity: 0 }}
                transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-2 h-2 bg-gradient-to-t from-red-500 to-amber-400 rounded-full blur-[1px]" />

              )}
                </div>
            }
              {selectedStory.animeEffect === "lightning" &&
            <motion.div
              animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-blue-500/10 pointer-events-none z-10" />

            }

              {/* Story Top Header Bar */}
              <div className="flex justify-between items-center text-white z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-red-500 p-0.5">
                    <img src={selectedStory.author.avatar} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black">{selectedStory.author.name}</span>
                      {selectedStory.entityType === "admin" &&
                    <span className="text-[8px] bg-red-600 text-white font-black px-1 py-0.5 rounded uppercase tracking-wider">STAFF</span>
                    }
                      {selectedStory.entityType === "guild" &&
                    <span className="text-[8px] bg-purple-600 text-white font-black px-1 py-0.5 rounded uppercase tracking-wider">GUILD</span>
                    }
                      {selectedStory.entityType === "space" &&
                    <span className="text-[8px] bg-blue-600 text-white font-black px-1 py-0.5 rounded uppercase tracking-wider">SPACE</span>
                    }
                    </div>
                    <span className="block text-[8px] text-zinc-400 font-mono">@{selectedStory.author.username || "otaku"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share button */}
                  {selectedStory.allowShare &&
                <button
                  onClick={() => {
                    playSynthSound("tap");
                    triggerInAppNotification(
                      isArabic ? "تم نسخ رابط القصة!" : "Story Link Copied!",
                      isArabic ? "شارك القصة الآن مع زملائك الأوتاكو." : "Share this story to your friends!",
                      "🔗"
                    );
                  }}
                  className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 rounded-full text-zinc-300">
                  
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                }
                  <button
                  onClick={() => setSelectedStory(null)}
                  className="p-1.5 bg-zinc-900/60 hover:bg-zinc-850 rounded-full text-zinc-300 hover:text-white">
                  
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Showcase */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full relative z-10 px-2 py-4">
                
                {/* 1. TEXT STORY BACKDROP TYPE */}
                {selectedStory.storyType === "text" ?
              <div className="w-full min-h-[40vh] bg-gradient-to-br from-purple-950 via-zinc-950 to-red-950 rounded-3xl border border-zinc-800/80 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-amber-500 animate-bounce" />
                    <p className="text-sm md:text-base text-gray-100 font-black tracking-wide leading-relaxed">
                      {selectedStory.question || selectedStory.media}
                    </p>
                  </div> : (

              /* 2. MEDIA STORY WITH OVERLAYS (IMAGE/VIDEO) */
              <div className="w-full relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 flex items-center justify-center min-h-[50vh]">
                    <img src={selectedStory.url || selectedStory.media} alt="Story Media" className="max-h-[60vh] w-full object-contain" />
                    
                    {/* Character Card overlay theme */}
                    {(selectedStory.storyType === "character_card" || selectedStory.storyType === "anime_card") &&
                <div className="absolute inset-x-4 top-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-amber-500/40 text-center space-y-1">
                        <span className="text-[8px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded">★ OTC LEGEND CARD ★</span>
                        <h4 className="text-xs text-white font-black">{selectedStory.entityName || (isArabic ? "بطاقة مقتنيات نادرة" : "Limited Collectible Card")}</h4>
                        <div className="flex justify-around text-[9px] text-zinc-400 font-mono">
                          <span>STR: 94</span>
                          <span>INT: 99</span>
                          <span>AGI: 88</span>
                        </div>
                      </div>
                }

                    {/* Stickers Display */}
                    {selectedStory.stickers && selectedStory.stickers.map((stk: string, idx: number) =>
                <motion.div
                  key={`stk_${selectedStory.id || 'curr'}_${stk}_${idx}`}
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                  className="absolute text-4xl cursor-grab active:cursor-grabbing select-none"
                  style={{ top: "30%", left: `${20 + idx * 25}%` }}>
                  
                        {stk}
                      </motion.div>
                )}
                  </div>)
              }

                {/* 3. MUSIC WIDGET OVERLAY */}
                {selectedStory.storyType === "music" && selectedStory.musicTitle &&
              <div className="w-full mt-4 bg-zinc-950/90 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600/10 border border-red-500/40 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: "5s" }}>
                      <Music className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[8px] uppercase tracking-widest text-red-500 font-bold">{isArabic ? "🎵 يعمل الآن" : "🎵 Now Playing"}</span>
                      <h5 className="text-xs font-black text-white truncate">{selectedStory.musicTitle}</h5>
                      <p className="text-[10px] text-zinc-400 truncate">{selectedStory.musicArtist || "Otaku OST"}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-red-600 rounded animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-1 h-5 bg-red-600 rounded animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1 h-2 bg-red-600 rounded animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
              }

                {/* 4. INTERACTIVE POLL OVERLAY */}
                {selectedStory.storyType === "poll" && selectedStory.poll &&
              <div className="w-full mt-4 bg-zinc-950/95 border border-yellow-500/30 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📊</span>
                      <h4 className="text-xs font-black text-white">{selectedStory.poll.question}</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedStory.poll.options.map((opt: any, idx: number) => {
                    const hasVoted = !!userVotedStories[selectedStory.id];
                    const isVotedOption = userVotedStories[selectedStory.id] === opt.text;
                    return (
                      <button
                        key={`story_poll_${selectedStory.id || 'curr'}_${opt.text || idx}_${idx}`}
                        disabled={hasVoted}
                        onClick={() => {
                          playSynthSound("success");
                          triggerHapticFeedback("success");
                          setUserVotedStories((prev) => ({ ...prev, [selectedStory.id]: opt.text }));
                          // Award XP and coins
                          setBlackCoins((c) => c + 5);
                          triggerInAppNotification(
                            isArabic ? "مكافأة المشاركة!" : "Engagement Reward!",
                            isArabic ? "حصلت على +5 عملات سوداء و +20 XP مكافأة تصويت!" : "You claimed +5 Black Coins and +20 XP!",
                            "🎁"
                          );
                        }}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between border ${
                        isVotedOption ?
                        "bg-yellow-500/10 border-yellow-500 text-yellow-400" :
                        "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"}`
                        }>
                        
                            <span>{opt.text}</span>
                            {hasVoted &&
                        <span className="text-[10px] font-mono text-zinc-500">
                                {isVotedOption ? "✓ Voted" : ""}
                              </span>
                        }
                          </button>);

                  })}
                    </div>
                  </div>
              }

                {/* 5. LINK CTA CARD OVERLAY */}
                {selectedStory.storyType === "link" && selectedStory.linkUrl &&
              <a
                href={selectedStory.linkUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                }}
                className="w-full mt-4 bg-gradient-to-r from-red-600 to-[#FF3D00] p-3 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-red-600/20 hover:opacity-90 transition-all">
                
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider font-bold opacity-85">{isArabic ? "زيارة الرابط المرفق" : "Visit Attached Link"}</span>
                        <span className="text-xs font-black">{selectedStory.linkTitle || (isArabic ? "انقر للمتابعة" : "Click to view detail")}</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </a>
              }

                {/* 6. QA BOX OVERLAY */}
                {selectedStory.question && selectedStory.storyType === "qa" &&
              <div className="w-full mt-4 bg-zinc-950/95 border border-red-500/30 p-4 rounded-2xl text-center space-y-3 shadow-lg">
                    <span className="text-[9px] text-red-500 uppercase tracking-widest font-black block">❓ {isArabic ? "صندوق أسئلة الأوتاكو" : "Otaku Q&A Box"}</span>
                    <p className="text-xs text-white font-bold">{selectedStory.question}</p>
                    <div className="flex gap-2">
                      <input
                    type="text"
                    placeholder={isArabic ? "اكتب إجابتك المباشرة هنا..." : "Type your answer..."}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-red-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSelectedStory(null);
                        playSynthSound("success");
                        triggerHapticFeedback("success");
                        triggerInAppNotification(
                          isArabic ? "تم إرسال ردك بنجاح!" : "Answer Sent!",
                          isArabic ? "تم إرسال الرد السريع للمنشئ." : "Answer delivered straight to creator inbox.",
                          "💬"
                        );
                      }
                    }} />
                  
                    </div>
                  </div>
              }

                {/* 7. XP / COIN ENGAGEMENT REWARDS */}
                {(selectedStory.xpReward > 0 || selectedStory.coinReward > 0) &&
              <div className="w-full mt-4 flex justify-between items-center bg-[#1A1105] border border-amber-600/30 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                      <div>
                        <span className="block text-[8px] uppercase text-amber-500 font-bold">{isArabic ? "هدية القصة" : "Story Gift Active"}</span>
                        <span className="text-[10px] text-zinc-300 font-bold">
                          {isArabic ?
                      `احصل على ${selectedStory.xpReward} XP و ${selectedStory.coinReward} عملات` :
                      `Claims +${selectedStory.xpReward} XP & +${selectedStory.coinReward} Coins`}
                        </span>
                      </div>
                    </div>
                    {claimedStoryRewards[selectedStory.id] ?
                <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                        {isArabic ? "✓ تم المطالبة" : "✓ Claimed"}
                      </span> :

                <button
                  onClick={() => {
                    playSynthSound("levelup");
                    triggerHapticFeedback("levelup");
                    setClaimedStoryRewards((prev) => ({ ...prev, [selectedStory.id]: true }));
                    setBlackCoins((c) => c + Number(selectedStory.coinReward || 0));

                    triggerCelebration(
                      "STORY_REWARD",
                      "هدية تفاعل القصة",
                      "Story Interaction Reward",
                      `حصلت على ${selectedStory.xpReward} XP و ${selectedStory.coinReward} عملة سوداء!`,
                      `You earned +${selectedStory.xpReward} XP and +${selectedStory.coinReward} Black Coins!`,
                      `+${selectedStory.coinReward} Coins`
                    );
                  }}
                  className="text-[10px] bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black px-3 py-1.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
                  
                        {isArabic ? "المطالبة بالهدية" : "Claim Now"}
                      </button>
                }
                  </div>
              }

              </div>

              {/* Story footer */}
              <div className="text-center text-[10px] text-zinc-500 font-mono z-20 bg-gradient-to-t from-black via-black/40 to-transparent p-2">
                {isArabic ? "انقر بالخارج للإغلاق أو السحب لأسفل" : "Press X button above to close"}
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* STORY CREATE POPUP FORM */}
      <AnimatePresence>
        {showStoryCreateModal &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStoryCreateModal(false)}
            className="fixed inset-0 bg-black z-50" />
          
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] max-h-[85vh] overflow-y-auto bg-zinc-950 border border-zinc-800 p-5 rounded-3xl z-50 space-y-4 shadow-2xl scrollbar-thin">
            
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-white">{isArabic ? "إضافة قصة أنمي تفاعلية" : "New Interactive Story"}</span>
                <button onClick={() => setShowStoryCreateModal(false)} className="p-1 hover:bg-zinc-900 rounded">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. STORY TYPE SELECTOR */}
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1.5 font-black uppercase tracking-wider">{isArabic ? "نوع القصة" : "Story Type"}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                  { id: "image", labelAr: "🖼️ صورة", labelEn: "🖼️ Image" },
                  { id: "text", labelAr: "📝 نصية", labelEn: "📝 Text Only" },
                  { id: "music", labelAr: "🎵 موسيقى", labelEn: "🎵 Music" },
                  { id: "poll", labelAr: "📊 تصويت", labelEn: "📊 Poll" },
                  { id: "qa", labelAr: "❓ سؤال", labelEn: "❓ Q&A Box" },
                  { id: "link", labelAr: "🔗 رابط", labelEn: "🔗 Link" }].
                  map((t, _autoIdx) =>
                  <button
                    key={`${t.id}_${_autoIdx}`}
                    type="button"
                    onClick={() => setNewStoryType(t.id as any)}
                    className={`p-2 text-[10px] font-bold rounded-xl border text-center transition-all ${
                    newStoryType === t.id ?
                    "bg-red-600/10 border-red-500 text-red-500 animate-pulse" :
                    "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`
                    }>
                    
                        {isArabic ? t.labelAr : t.labelEn}
                      </button>
                  )}
                  </div>
                </div>

                {/* 2. MEDIA URL INPUT (Hide if text-only story) */}
                {newStoryType !== "text" &&
              <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "رابط الصورة أو الخلفية" : "Media URL"}</label>
                    <input
                  type="text"
                  value={newStoryMedia}
                  onChange={(e) => setNewStoryMedia(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600" />
                
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                    type="button"
                    onClick={() => setNewStoryMedia("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600")}
                    className="text-[9px] bg-zinc-900 hover:bg-zinc-850 px-2.5 py-1 rounded text-zinc-300 font-bold">
                    
                        {isArabic ? "أنمي فن" : "Anime Fanart"}
                      </button>
                      <button
                    type="button"
                    onClick={() => setNewStoryMedia("https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600")}
                    className="text-[9px] bg-zinc-900 hover:bg-zinc-850 px-2.5 py-1 rounded text-zinc-300 font-bold">
                    
                        {isArabic ? "خلفية نيون" : "Neon Cyber"}
                      </button>
                    </div>
                  </div>
              }

                {/* 3. CONDITIONAL INPUTS PER TYPE */}
                {newStoryType === "qa" &&
              <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "سؤال تفاعلي للمشاهدين" : "Interactive Question"}</label>
                    <input
                  type="text"
                  value={newStoryQuestion}
                  onChange={(e) => setNewStoryQuestion(e.target.value)}
                  placeholder={isArabic ? "ما هي أكثر لقطة أثارت حماسك؟" : "What is the most epic scene in anime?"}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600" />
                
                  </div>
              }

                {newStoryType === "text" &&
              <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "محتوى القصة النصية" : "Story Text Content"}</label>
                    <textarea
                  value={newStoryQuestion}
                  onChange={(e) => setNewStoryQuestion(e.target.value)}
                  placeholder={isArabic ? "اكتب حكمة اليوم للأوتاكو أو اقتباس مفضل..." : "Write quote or wise words..."}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none" />
                
                  </div>
              }

                {newStoryType === "music" &&
              <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "اسم الأغنية / الأوست" : "OST / Song Title"}</label>
                      <input
                    type="text"
                    value={newStoryMusicTitle}
                    onChange={(e) => setNewStoryMusicTitle(e.target.value)}
                    placeholder="Gurenge - Demon Slayer OST"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "اسم المغني / المؤدي" : "Artist Name"}</label>
                      <input
                    type="text"
                    value={newStoryMusicArtist}
                    onChange={(e) => setNewStoryMusicArtist(e.target.value)}
                    placeholder="LiSA"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                  </div>
              }

                {newStoryType === "poll" &&
              <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "سؤال التصويت" : "Poll Question"}</label>
                      <input
                    type="text"
                    value={newStoryPollQuestion}
                    onChange={(e) => setNewStoryPollQuestion(e.target.value)}
                    placeholder={isArabic ? "من الأقوى؟" : "Who is stronger?"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                    type="text"
                    value={newStoryPollOptions[0]}
                    onChange={(e) => {
                      const arr = [...newStoryPollOptions];
                      arr[0] = e.target.value;
                      setNewStoryPollOptions(arr);
                    }}
                    placeholder={isArabic ? "الخيار ١" : "Option 1"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                      <input
                    type="text"
                    value={newStoryPollOptions[1]}
                    onChange={(e) => {
                      const arr = [...newStoryPollOptions];
                      arr[1] = e.target.value;
                      setNewStoryPollOptions(arr);
                    }}
                    placeholder={isArabic ? "الخيار ٢" : "Option 2"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                  </div>
              }

                {newStoryType === "link" &&
              <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "رابط المتابعة URL" : "Link URL"}</label>
                      <input
                    type="text"
                    value={newStoryLinkUrl}
                    onChange={(e) => setNewStoryLinkUrl(e.target.value)}
                    placeholder="https://animeblack.com/news/12"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-black uppercase tracking-wider">{isArabic ? "عنوان الزر" : "Link Button Title"}</label>
                      <input
                    type="text"
                    value={newStoryLinkTitle}
                    onChange={(e) => setNewStoryLinkTitle(e.target.value)}
                    placeholder={isArabic ? "اقرأ الخبر الكامل" : "Read Full Chapter"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                  
                    </div>
                  </div>
              }

                {/* 4. THEME FRAME SELECTOR */}
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1.5 font-black uppercase tracking-wider">{isArabic ? "إطار القصة الجمالي" : "Theme Visual Frame"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                  { id: "none", nameAr: "بدون إطار", nameEn: "No Frame" },
                  { id: "red-dragon", nameAr: "🐉 التنين الأحمر", nameEn: "🐉 Red Dragon" },
                  { id: "purple-susanoo", nameAr: "🌌 السوسانو الأرجواني", nameEn: "🌌 Purple Susanoo" },
                  { id: "neon-cyberspace", nameAr: "⚡ السايبر المضيء", nameEn: "⚡ Cyber Glow" },
                  { id: "cherry-blossom", nameAr: "🌸 أزهار الساكورا", nameEn: "🌸 Cherry Sakura" }].
                  map((f, _autoIdx) =>
                  <button
                    key={`${f.id}_${_autoIdx}`}
                    type="button"
                    onClick={() => setNewStoryThemeFrame(f.id as any)}
                    className={`p-2 text-[9px] font-black rounded-xl border transition-all ${
                    newStoryThemeFrame === f.id ?
                    "bg-red-600/10 border-red-500 text-red-500" :
                    "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`
                    }>
                    
                        {isArabic ? f.nameAr : f.nameEn}
                      </button>
                  )}
                  </div>
                </div>

                {/* 5. ANIME SPECIAL EFFECT */}
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1.5 font-black uppercase tracking-wider">{isArabic ? "مؤثر البصري للأنمي" : "Visual Anime Effect"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                  { id: "none", nameAr: "بدون تأثير", nameEn: "No Special Effect" },
                  { id: "sharingan", nameAr: "👁️ الشارينغان الدوارة", nameEn: "👁️ Sharingan Spin" },
                  { id: "ki-aura", nameAr: "🔥 هالة التشاكرا", nameEn: "🔥 Chakra Aura" },
                  { id: "sakura-leaves", nameAr: "🌸 تساقط الساكورا", nameEn: "🌸 Falling Sakura" },
                  { id: "glitch", nameAr: "📺 تشويش رقمي", nameEn: "📺 Cyber Glitch" },
                  { id: "fire-sparks", nameAr: "☄️ جمرات متطايرة", nameEn: "☄️ Flame Sparks" },
                  { id: "lightning", nameAr: "⚡ صعقات البرق", nameEn: "⚡ Lightning Flash" }].
                  map((e, _autoIdx) =>
                  <button
                    key={`${e.id}_${_autoIdx}`}
                    type="button"
                    onClick={() => setNewStoryAnimeEffect(e.id as any)}
                    className={`p-2 text-[9px] font-black rounded-xl border transition-all ${
                    newStoryAnimeEffect === e.id ?
                    "bg-red-600/10 border-red-500 text-red-500" :
                    "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`
                    }>
                    
                        {isArabic ? e.nameAr : e.nameEn}
                      </button>
                  )}
                  </div>
                </div>

                {/* 6. ENTITY ROLE & PUBLISHER TYPE */}
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1.5 font-black uppercase tracking-wider">{isArabic ? "نشر بصفتك" : "Publish As Identity"}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                  { id: "user", labelAr: "👤 شخصي", labelEn: "👤 Personal" },
                  { id: "guild", labelAr: "⚔️ نقابة", labelEn: "⚔️ Guild" },
                  { id: "space", labelAr: "🌌 عالم", labelEn: "🌌 Space" }].
                  map((ent, _autoIdx) =>
                  <button
                    key={`${ent.id}_${_autoIdx}`}
                    type="button"
                    onClick={() => setNewStoryEntityType(ent.id as any)}
                    className={`p-2 text-[9px] font-black rounded-xl border transition-all ${
                    newStoryEntityType === ent.id ?
                    "bg-red-600/10 border-red-500 text-red-500" :
                    "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`
                    }>
                    
                        {isArabic ? ent.labelAr : ent.labelEn}
                      </button>
                  )}
                  </div>
                </div>

                {/* 7. ALLOCATE REWARDS (XP/COINS) FOR VIEWERS */}
                <div className="bg-[#1C1206] p-3 rounded-2xl border border-amber-500/20 space-y-2">
                  <span className="text-[10px] text-amber-500 font-black block">🎁 مكافآت للمشاهدين المتفاعلين</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-zinc-400 mb-0.5">{isArabic ? "مكافأة خبرة XP" : "XP Reward"}</label>
                      <input
                      type="number"
                      min="0"
                      max="100"
                      value={newStoryXpReward}
                      onChange={(e) => setNewStoryXpReward(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white" />
                    
                    </div>
                    <div>
                      <label className="block text-[8px] text-zinc-400 mb-0.5">{isArabic ? "مكافأة عملات Coins" : "Coin Reward"}</label>
                      <input
                      type="number"
                      min="0"
                      max="50"
                      value={newStoryCoinReward}
                      onChange={(e) => setNewStoryCoinReward(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white" />
                    
                    </div>
                  </div>
                </div>

                {/* 8. AUDIENCE & PRIVACY */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <label className="block text-[9px] text-zinc-400 mb-1">{isArabic ? "الجمهور المستهدف" : "Target Audience"}</label>
                    <select
                    value={newStoryAudience}
                    onChange={(e) => setNewStoryAudience(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none">
                    
                      <option value="public">{isArabic ? "الكل (عام)" : "Public"}</option>
                      <option value="friends">{isArabic ? "الأصدقاء فقط" : "Friends Only"}</option>
                      <option value="followers">{isArabic ? "المتابعون" : "Followers Only"}</option>
                    </select>
                  </div>

                  {/* Anti-screenshot/prevent download toggle */}
                  <div className="flex flex-col justify-end">
                    <button
                    type="button"
                    onClick={() => setNewStoryPreventDownload(!newStoryPreventDownload)}
                    className={`w-full p-2 text-[9px] font-bold rounded-xl border text-center transition-all ${
                    newStoryPreventDownload ?
                    "bg-amber-600/10 border-amber-500 text-amber-500" :
                    "bg-zinc-900 border-zinc-800 text-zinc-500"}`
                    }>
                    
                      🛡️ {isArabic ? "منع حفظ القصة" : "Block Downloads"}
                    </button>
                  </div>
                </div>

              </div>

              <button
              type="button"
              onClick={handleCreateStory}
              disabled={newStoryType !== "text" && !newStoryMedia}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-[#FF3D00] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg hover:opacity-95 transition-all mt-4">
              
                {isArabic ? "نشر القصة التفاعلية الآن 🚀" : "Publish Interactive Story 🚀"}
              </button>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}