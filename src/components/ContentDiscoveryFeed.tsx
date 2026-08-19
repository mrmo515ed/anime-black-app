import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Sliders,
  Database,
  Activity,
  ThumbsDown,
  Heart,
  UserPlus,
  Tv,
  Check,
  RefreshCw,
  Plus,
  Flame,
  Info,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Trash2,
  UserCheck,
  Award,
  MoreHorizontal,
  MessageSquare,
  Repeat,
  AlertTriangle,
  Pin,
  ShieldAlert,
  Copy,
  Edit3,
  X,
  Share,
  Ban,
  BookmarkCheck,
  CheckCircle2,
  EyeOff } from
"lucide-react";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UniversalReactions } from "./UniversalReactions";
import LevelBadge from "./LevelBadge";

interface ContentDiscoveryFeedProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  posts: any[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  reels: any[];
  setReels: React.Dispatch<React.SetStateAction<any[]>>;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (title: string, body: string, badge?: string) => void;
}

// Genre Categories and their metadata
const GENRES = [
{ id: "shonen", nameEn: "Shonen (Action & Adventure)", nameAr: "شونين (أكشن ومغامرات)", color: "from-orange-500 to-red-600", keywords: ["one piece", "naruto", "bleach", "shonen", "luffy", "dbz", "goku", "chainsaw", "manga", "battle"] },
{ id: "seinen", nameEn: "Seinen (Mature & Psychological)", nameAr: "سينين (نفسي وعميق)", color: "from-zinc-700 to-zinc-900", keywords: ["berserk", "vagabond", "seinen", "tokyo ghoul", "psychological", "adult", "seinen", "dark", "kaneki"] },
{ id: "shoujo", nameEn: "Shoujo & Romcom (Drama & Romance)", nameAr: "شوجو ورومانسية (دراما)", color: "from-pink-500 to-rose-600", keywords: ["shoujo", "romance", "romcom", "love", "drama", "school", "relationship", "sailor moon"] },
{ id: "isekai", nameEn: "Isekai (Fantasy Worlds)", nameAr: "إيسيكاي (عوالم خيالية)", color: "from-emerald-500 to-teal-600", keywords: ["isekai", "re:zero", "slime", "sword art", "fantasy", "world", "reincarnation", "hero"] },
{ id: "cyberpunk", nameEn: "Cyberpunk & Sci-Fi", nameAr: "سايبربانك وخيال علمي", color: "from-cyan-500 to-blue-600", keywords: ["cyberpunk", "sci-fi", "mech", "gundam", "space", "robot", "neon", "technology", "evangelion"] },
{ id: "sliceoflife", nameEn: "Slice of Life & Comedy", nameAr: "شريحة من الحياة وكوميديا", color: "from-amber-400 to-yellow-500", keywords: ["comedy", "funny", "slice of life", "school", "daily", "chill", "hanyou", "relaxing", "food"] }];


export default function ContentDiscoveryFeed({
  isArabic,
  currentUser,
  setCurrentUser,
  posts,
  setPosts,
  reels,
  setReels,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification
}: ContentDiscoveryFeedProps) {
  // 1. Core Taste Profile State
  const defaultTaste = {
    shonen: 30,
    seinen: 20,
    shoujo: 15,
    isekai: 15,
    cyberpunk: 10,
    sliceoflife: 10
  };

  const [taste, setTaste] = useState<Record<string, number>>(() => {
    return currentUser?.tasteProfile || defaultTaste;
  });

  const [revealedComments, setRevealedComments] = useState<Record<string, boolean>>({});

  // 2. Active Interaction Log State
  const [logs, setLogs] = useState<string[]>(() => {
    return currentUser?.discoveryLogs || [
    isArabic ?
    "⚙️ تم تشغيل المحرك الذكي لنظام الأوتـاكو." :
    "⚙️ Otaku intelligence engine initialized.",
    isArabic ?
    "🤖 تم معايرة تصنيفات الأنمي بناءً على اهتماماتك العامة." :
    "🤖 Anime categories calibrated based on general platform interests."];

  });

  // 3. UI control states
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "reels" | "creators">("posts");
  const [isSaving, setIsSaving] = useState(false);
  const [algorithmMode, setAlgorithmMode] = useState<"balanced" | "trending" | "deep_cuts">("balanced");
  const [dismissedPostIds, setDismissedPostIds] = useState<Set<string>>(new Set());
  const [dismissedReelIds, setDismissedReelIds] = useState<Set<string>>(new Set());

  // 4. Interactive Feedback & Options state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [activeMoreOptionsPost, setActiveMoreOptionsPost] = useState<any | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState<string>("");

  // Persistent user save/bookmark state
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("saved_posts_ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persistent user repost state
  const [repostedPostIds, setRepostedPostIds] = useState<Set<string>>(() => {
    try {
      const reps = localStorage.getItem("reposted_posts_ids");
      return reps ? new Set(JSON.parse(reps)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Keep track of locally banned usernames to filter them out of display
  const [bannedUsernames, setBannedUsernames] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("banned_usernames");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Sync saved posts
  useEffect(() => {
    localStorage.setItem("saved_posts_ids", JSON.stringify(Array.from(savedPostIds)));
  }, [savedPostIds]);

  // Sync reposted posts
  useEffect(() => {
    localStorage.setItem("reposted_posts_ids", JSON.stringify(Array.from(repostedPostIds)));
  }, [repostedPostIds]);

  // Sync banned usernames
  useEffect(() => {
    localStorage.setItem("banned_usernames", JSON.stringify(Array.from(bannedUsernames)));
  }, [bannedUsernames]);

  // Check if current user has moderator/admin credentials
  const isUserAdminOrMod = (user: any) => {
    if (!user || !user.role) return false;
    const adminModRoles = [
    "TraineeModerator", "Moderator", "SeniorModerator", "SectionManager",
    "Administrator", "SuperAdministrator", "Developer", "Owner"];

    return adminModRoles.includes(user.role);
  };

  // Keep state synchronized with currentUser updates
  useEffect(() => {
    if (currentUser?.tasteProfile) {
      setTaste(currentUser.tasteProfile);
    }
    if (currentUser?.discoveryLogs) {
      setLogs(currentUser.discoveryLogs);
    }
  }, [currentUser]);

  // Normalize weights so they always sum up to 100%
  const handleSliderChange = (genreId: string, value: number) => {
    const diff = value - taste[genreId];
    const otherGenres = GENRES.filter((g) => g.id !== genreId);
    const sumOthers = otherGenres.reduce((acc, g) => acc + taste[g.id], 0);

    let nextTaste = { ...taste, [genreId]: value };

    if (sumOthers > 0) {
      // Scale other fields proportionally
      otherGenres.forEach((g) => {
        const proportion = taste[g.id] / sumOthers;
        let newValue = Math.max(0, taste[g.id] - diff * proportion);
        nextTaste[g.id] = Math.round(newValue);
      });
    } else {
      // If others are zero, distribute evenly
      otherGenres.forEach((g) => {
        nextTaste[g.id] = Math.max(0, Math.round((100 - value) / otherGenres.length));
      });
    }

    // Force exact 100 sum correction
    const total = (Object.values(nextTaste) as number[]).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const scaleDiff = 100 - total;
      // Adjust the first other genre that is non-zero
      const targetGenre = otherGenres.find((g) => nextTaste[g.id] + scaleDiff >= 0);
      if (targetGenre) {
        nextTaste[targetGenre.id] += scaleDiff;
      }
    }

    setTaste(nextTaste);
    playSynthSound("tap");
  };

  // Log and save taste changes to Cloud/Local
  const addLogMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedLog = `[${timestamp}] ${message}`;
    setLogs((prev) => [formattedLog, ...prev.slice(0, 19)]); // Cap at last 20 logs
  };

  const saveTasteProfile = async (currentTaste: Record<string, number>, currentLogs: string[]) => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        tasteProfile: currentTaste,
        discoveryLogs: currentLogs
      });
      setCurrentUser((prev) => ({
        ...prev,
        tasteProfile: currentTaste,
        discoveryLogs: currentLogs
      }));
    } catch (e) {
      console.error("Failed to persist taste profile to Firestore:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Action Simulator Handler
  const simulateAction = (type: "shonen" | "seinen" | "shoujo" | "isekai" | "cyberpunk" | "sliceoflife", actionNameAr: string, actionNameEn: string) => {
    triggerHapticFeedback("success");
    playSynthSound("success");

    // Boost the selected category by 15% and normalize others
    const boostValue = 15;
    const nextTaste = { ...taste };

    // Decrease other categories proportionally to fit 100%
    const totalOthers = GENRES.filter((g) => g.id !== type).reduce((acc, g) => acc + nextTaste[g.id], 0);

    nextTaste[type] = Math.min(100, nextTaste[type] + boostValue);
    const addedDiff = nextTaste[type] - taste[type];

    if (addedDiff > 0 && totalOthers > 0) {
      GENRES.filter((g) => g.id !== type).forEach((g) => {
        const share = taste[g.id] / totalOthers;
        nextTaste[g.id] = Math.max(0, Math.round(taste[g.id] - addedDiff * share));
      });
    }

    // Force sum to 100
    const total = (Object.values(nextTaste) as number[]).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const scaleDiff = 100 - total;
      const adjustTarget = GENRES.filter((g) => g.id !== type).find((g) => nextTaste[g.id] + scaleDiff >= 0);
      if (adjustTarget) {
        nextTaste[adjustTarget.id] += scaleDiff;
      }
    }

    const logText = isArabic ?
    `⚡ تم محاكاة: ${actionNameAr} -> زاد اهتمام ${GENRES.find((g) => g.id === type)?.nameAr.split(" ")[0]} بمقدار +${addedDiff}%` :
    `⚡ Simulated: ${actionNameEn} -> boosted ${GENRES.find((g) => g.id === type)?.nameEn.split(" ")[0]} by +${addedDiff}%`;

    const nextLogs = [
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${logText}`,
    ...logs.slice(0, 19)];


    setTaste(nextTaste);
    setLogs(nextLogs);
    saveTasteProfile(nextTaste, nextLogs);

    triggerInAppNotification(
      isArabic ? "تكيّف الخوارزمية الذكية!" : "Adaptive AI Calibrated!",
      isArabic ? "تم تحديث أوزان التفضيل فورياً وإعادة ترتيب الخلاصة!" : "Preference weights updated instantly and feed re-ranked!",
      "🧠"
    );
  };

  // Simulate Dislike / Negative feedback
  const handleDislikeTag = (genreId: string) => {
    triggerHapticFeedback("error");
    playSynthSound("error");

    const decrement = 12;
    const nextTaste = { ...taste };
    const oldVal = nextTaste[genreId];
    nextTaste[genreId] = Math.max(0, nextTaste[genreId] - decrement);
    const reducedAmount = oldVal - nextTaste[genreId];

    if (reducedAmount > 0) {
      // Distribute saved percentage to others
      const others = GENRES.filter((g) => g.id !== genreId);
      others.forEach((o) => {
        nextTaste[o.id] += Math.round(reducedAmount / others.length);
      });
    }

    // Adjust exact sum
    const total = (Object.values(nextTaste) as number[]).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      const target = GENRES.filter((g) => g.id !== genreId)[0];
      if (target) nextTaste[target.id] += diff;
    }

    const logText = isArabic ?
    `🚫 تم تقليل تفضيل: ${GENRES.find((g) => g.id === genreId)?.nameAr.split(" ")[0]} بمقدار -${reducedAmount}%` :
    `🚫 Muted preference for: ${GENRES.find((g) => g.id === genreId)?.nameEn.split(" ")[0]} by -${reducedAmount}%`;

    const nextLogs = [
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${logText}`,
    ...logs.slice(0, 19)];


    setTaste(nextTaste);
    setLogs(nextLogs);
    saveTasteProfile(nextTaste, nextLogs);

    triggerInAppNotification(
      isArabic ? "تم تقليل التوصية" : "Recommendation Tuned Down",
      isArabic ? "سنقلل من عرض هذا النوع من المحتوى في مستقبلاً." : "We'll show you less of this category from now on.",
      "🔇"
    );
  };

  // Reset Taste profile
  const handleResetTaste = () => {
    triggerHapticFeedback("tap");
    playSynthSound("tap");
    setTaste(defaultTaste);
    const resetMsg = isArabic ?
    "🔄 تم إعادة تعيين تفضيلات الأوتـاكو للقيم الافتراضية." :
    "🔄 Reset Otaku preferences to balanced default weights.";
    const nextLogs = [
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${resetMsg}`,
    ...logs.slice(0, 19)];

    setLogs(nextLogs);
    saveTasteProfile(defaultTaste, nextLogs);
  };

  // Algorithm Scorer: assign relevance score to any post or reel
  const calculateScore = (item: any, isReel: boolean = false) => {
    let score = 0;
    const contentText = ((item.content || item.title || "") + " " + (item.tags?.join(" ") || "")).toLowerCase();

    // 1. Genre affinity matching
    GENRES.forEach((g) => {
      const weight = taste[g.id] || 0;
      let matchedCount = 0;
      g.keywords.forEach((keyword) => {
        if (contentText.includes(keyword)) {
          matchedCount++;
        }
      });
      if (matchedCount > 0) {
        score += weight * (1 + matchedCount * 0.4);
      }
    });

    // 2. Algorithm Modes Tuning
    if (algorithmMode === "trending") {
      // High weight to total likes / comments
      const popularity = (item.likes || 0) * 2 + (isReel ? (item.commentsCount || 0) * 4 : (item.comments?.length || 0) * 3);
      score += popularity * 0.8;
    } else if (algorithmMode === "deep_cuts") {
      // Boost creators with high reputation and followed creators
      const rep = item.author?.reputation || 0;
      score += rep * 3;
      if (currentUser?.following?.includes(item.authorId || item.author?.username)) {
        score += 150; // Mass follow boost
      }
    } else {
      // Balanced
      const popularity = (item.likes || 0) * 1 + (isReel ? (item.commentsCount || 0) * 2 : (item.comments?.length || 0) * 1.5);
      score += popularity * 0.4;
      const rep = item.author?.reputation || 0;
      score += rep * 1;
    }

    // Boost if verified author
    if (item.author?.isVerified) {
      score += 40;
    }

    return score;
  };

  // Process & Sort Posts
  const getPersonalizedPosts = () => {
    return posts.
    filter((p) => !dismissedPostIds.has(p.id) && !bannedUsernames.has(p.author?.username)).
    map((p, _autoIdx) => {
      const rawScore = calculateScore(p);
      // Normalize score into a friendly 0-100% Match Badge
      const matchPercent = Math.min(99, Math.max(45, Math.round(45 + rawScore / 8)));
      return { ...p, matchPercent };
    }).
    sort((a, b) => b.matchPercent - a.matchPercent);
  };

  // Process & Sort Reels
  const getPersonalizedReels = () => {
    return reels.
    filter((r) => !dismissedReelIds.has(r.id)).
    map((r, _autoIdx) => {
      const rawScore = calculateScore(r, true);
      const matchPercent = Math.min(99, Math.max(45, Math.round(45 + rawScore / 6)));
      return { ...r, matchPercent };
    }).
    sort((a, b) => b.matchPercent - a.matchPercent);
  };

  // Get Suggested Users to Follow
  const getPersonalizedCreators = () => {
    // Generate simulated high-affinity otaku users if not fully populated
    const simulatedCreators = [
    { name: "Luffy King", username: "Luffy_King", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", bioAr: "ملك القراصنة المستقبلي • مهتم بالشونين والقتالات الحماسية", bioEn: "Future pirate king • Focuses on hyped Shonen & battles", level: 64, reputation: 95, mainGenre: "shonen" },
    { name: "Zoro Shogun", username: "Zoro_Otaku", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100", bioAr: "عاشق السيف والقتال الهادئ • مهتم بالسينين والغموض", bioEn: "Sword master & quiet resolve • Seinen & mystery expert", level: 48, reputation: 88, mainGenre: "seinen" },
    { name: "Sakura Blossom", username: "Sakura_Blossom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", bioAr: "كتابة مراجعات لقصص الشوجو الدافئة والرومانسية 🌸", bioEn: "Reviewing warm Shoujo romance and dramas 🌸", level: 32, reputation: 79, mainGenre: "shoujo" },
    { name: "Rimuru Tempest", username: "Rimuru_Isekai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", bioAr: "زعيم عوالم الإيسيكاي الخيالية • مراجعة روايات خفيفة", bioEn: "Leader of Isekai fantasy realms • Light novel reviewer", level: 55, reputation: 91, mainGenre: "isekai" },
    { name: "Motoko Cyber", username: "Motoko_99", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", bioAr: "سايبربانك وميكا كلاسيكية • نقاشات إيفانجيليون وفلسفتها", bioEn: "Cyberpunk & classic mecha discussions • Evangelion philosophy", level: 41, reputation: 84, mainGenre: "cyberpunk" }];


    return simulatedCreators.
    map((c, _autoIdx) => {
      // Calculate match percentage based on user's preference in their primary genre
      const genreWeight = taste[c.mainGenre] || 0;
      const matchPercent = Math.min(99, Math.max(50, Math.round(50 + genreWeight * 0.49)));
      return { ...c, matchPercent };
    }).
    sort((a, b) => b.matchPercent - a.matchPercent);
  };

  const handleLikePost = async (postId: string) => {
    triggerHapticFeedback("tap");
    playSynthSound("tap");
    let hasLikedNow = false;
    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        hasLikedNow = !p.hasLiked;
        return { ...p, hasLiked: hasLikedNow, likes: p.likes + (hasLikedNow ? 1 : -1) };
      }
      return p;
    }));

    const postObj = posts.find((p) => p.id === postId);
    if (postObj) {
      let matchedGenre = "shonen";
      GENRES.forEach((g) => {
        g.keywords.forEach((keyword) => {
          if (postObj.content.toLowerCase().includes(keyword)) matchedGenre = g.id;
        });
      });
      simulateAction(
        matchedGenre as any,
        `الإعجاب بمنشور بقلم @${postObj.author?.username}`,
        `Liked post by @${postObj.author?.username}`
      );

      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const currentLikes = postSnap.data().likes || 0;
          await updateDoc(postRef, {
            likes: Math.max(0, currentLikes + (hasLikedNow ? 1 : -1))
          });
        }
      } catch (err) {
        console.error("Firestore error while liking post:", err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = newCommentTexts[postId]?.trim();
    if (!text) return;

    triggerHapticFeedback("success");
    playSynthSound("tap");

    // Get AI Moderation settings from Firestore first
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

    if (text && (isHateSpeechOn || isNudityOn || isSpamOn)) {
      try {
        const modRes = await fetch("/api/ai/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text, contentType: "comment" })
        });
        if (modRes.ok) {
          const modData = await modRes.json();
          const isCategoryEnabled =
          modData.category === "hate_speech" && isHateSpeechOn ||
          modData.category === "nudity" && isNudityOn ||
          modData.category === "spam" && isSpamOn;

          if (modData.flagged && isCategoryEnabled && modData.confidence * 100 >= confThreshold) {
            isFlaggedByAI = true;
            aiCategory = modData.category;
            aiConfidence = modData.confidence;
            aiReasonEn = modData.reasonEn;
            aiReasonAr = modData.reasonAr;
          }
        }
      } catch (modErr) {
        console.error("AI Moderation error during comment submission in feed:", modErr);
      }
    }

    if (isFlaggedByAI && modPolicy === "automated_removal") {
      try {
        const { collection, addDoc } = await import("firebase/firestore");
        await addDoc(collection(db, "moderation_reports"), {
          id: "rep_" + Date.now(),
          contentType: "comment",
          contentId: "blocked_comment_" + Date.now(),
          content: text,
          authorId: currentUser?.uid || "",
          authorName: currentUser?.name || currentUser?.username || "Otaku",
          flaggedCategory: aiCategory,
          confidence: aiConfidence,
          reasonEn: aiReasonEn,
          reasonAr: aiReasonAr,
          status: "removed",
          createdAt: new Date().toISOString(),
          actionTaken: "automated_removed"
        });
      } catch (repErr) {
        console.error(repErr);
      }

      triggerInAppNotification(
        isArabic ? "⚠️ تعليق غير لائق" : "⚠️ Inappropriate Comment",
        isArabic ?
        `تم حظر تعليقك تلقائياً بواسطة الذكاء الاصطناعي: ${aiReasonAr}` :
        `Your comment was automatically blocked by AI: ${aiReasonEn}`,
        "error"
      );
      if (playSynthSound) playSynthSound("error");
      triggerHapticFeedback("error");
      return; // Block submission completely!
    }

    const commentId = "c_" + Date.now();
    const newComment = {
      id: commentId,
      author: currentUser?.name || currentUser?.username || (isArabic ? "أوتاكو مجهول" : "Anonymous Otaku"),
      text: text,
      flagged: isFlaggedByAI,
      moderationStatus: isFlaggedByAI ? "pending" : "approved",
      createdAt: new Date().toISOString()
    };

    if (isFlaggedByAI && modPolicy === "review_by_human") {
      try {
        const { collection, addDoc } = await import("firebase/firestore");
        await addDoc(collection(db, "moderation_reports"), {
          id: "rep_" + Date.now(),
          contentType: "comment",
          contentId: commentId,
          content: text,
          authorId: currentUser?.uid || "",
          authorName: currentUser?.name || currentUser?.username || "Otaku",
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

      triggerInAppNotification(
        isArabic ? "⚠️ تم وضع علامة مراجعة" : "⚠️ Comment Flagged",
        isArabic ?
        "تم إرسال التعليق ولكنه بانتظار المراجعة بسبب سياسة الذكاء الاصطناعي." :
        "Comment submitted but marked for review due to AI policies.",
        "warning"
      );
    }

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));

    setNewCommentTexts((prev) => ({ ...prev, [postId]: "" }));

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const p = postSnap.data();
        const updatedComments = [...(p.comments || []), newComment];
        await updateDoc(postRef, {
          comments: updatedComments
        });
      }
    } catch (err) {
      console.error("Error adding comment in Firestore:", err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    triggerHapticFeedback("error");
    playSynthSound("tap");

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        return { ...p, comments: (p.comments || []).filter((c: any) => c.id !== commentId) };
      }
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const p = postSnap.data();
        const updatedComments = (p.comments || []).filter((c: any) => c.id !== commentId);
        await updateDoc(postRef, {
          comments: updatedComments
        });
      }
    } catch (err) {
      console.error("Error deleting comment in Firestore:", err);
    }

    triggerInAppNotification(
      isArabic ? "تم حذف التعليق" : "Comment Deleted",
      isArabic ? "تمت إزالة التعليق من المنشور." : "Comment removed from the post.",
      "🗑️"
    );
  };

  const handleToggleSavePost = async (post: any) => {
    triggerHapticFeedback("success");
    playSynthSound("tap");

    const postId = post.id;
    const isSaved = savedPostIds.has(postId);

    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(postId);else
      next.add(postId);
      return next;
    });

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        const currentSaves = p.saves || 0;
        return { ...p, saves: Math.max(0, currentSaves + (isSaved ? -1 : 1)) };
      }
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentSaves = postSnap.data().saves || 0;
        await updateDoc(postRef, {
          saves: Math.max(0, currentSaves + (isSaved ? -1 : 1))
        });
      }
    } catch (err) {
      console.error("Error toggling save post:", err);
    }

    const logText = isArabic ?
    `${isSaved ? "🔓 ألغيت حفظ" : "💾 حفظت"} منشور بقلم @${post.author?.username} في المفضلة` :
    `${isSaved ? "🔓 Unsaved" : "💾 Bookmarked"} post by @${post.author?.username}`;
    addLogMessage(logText);

    triggerInAppNotification(
      isArabic ? isSaved ? "تم إلغاء الحفظ" : "تم حفظ المنشور" : isSaved ? "Unsaved Post" : "Post Bookmarked",
      isArabic ?
      isSaved ? "تمت إزالة المنشور من مفضلتك السحابية." : "تمت إضافة هذا المنشور إلى مكتبتك المحفوظة بنجاح!" :
      isSaved ? "Post removed from your bookmarks." : "Post added to your bookmarks library successfully!",
      "💾"
    );
  };

  const handleRepostPost = async (post: any) => {
    const postId = post.id;
    if (repostedPostIds.has(postId)) {
      triggerInAppNotification(
        isArabic ? "مكرر" : "Already Reposted",
        isArabic ? "لقد قمت بإعادة نشر هذا المنشور بالفعل!" : "You have already reposted this post!",
        "🔄"
      );
      return;
    }

    triggerHapticFeedback("levelup");
    playSynthSound("levelup");

    setRepostedPostIds((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        return { ...p, reposts: (p.reposts || 0) + 1 };
      }
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentReposts = postSnap.data().reposts || 0;
        await updateDoc(postRef, {
          reposts: currentReposts + 1
        });
      }
    } catch (err) {
      console.error("Error reposting:", err);
    }

    const logText = isArabic ?
    `🔁 أعدت نشر بوست @${post.author?.username} للجمهور` :
    `🔁 Reposted @${post.author?.username}'s post to your feed`;
    addLogMessage(logText);

    let itemGenre = "shonen";
    GENRES.forEach((g) => {
      g.keywords.forEach((kw) => {
        if (post.content.toLowerCase().includes(kw)) itemGenre = g.id;
      });
    });
    simulateAction(
      itemGenre as any,
      `إعادة نشر منشور لـ @${post.author?.username}`,
      `Reposted post by @${post.author?.username}`
    );

    triggerInAppNotification(
      isArabic ? "تمت إعادة النشر!" : "Reposted Successfully!",
      isArabic ? "تم ترويج هذا المنشور لجميع الأعضاء وزيادة أوزان التفضيل!" : "This post has been boosted and shared with the community!",
      "🔁"
    );
  };

  const handleCopyPostLink = (postId: string) => {
    triggerHapticFeedback("tap");
    playSynthSound("tap");

    const dummyLink = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(dummyLink);

    triggerInAppNotification(
      isArabic ? "تم نسخ الرابط!" : "Link Copied!",
      isArabic ? "تم نسخ رابط المنشور إلى الحافظة بنجاح." : "Post link has been copied to your clipboard.",
      "📋"
    );
  };

  const handleSharePost = (post: any) => {
    triggerHapticFeedback("tap");
    playSynthSound("tap");

    const shareText = isArabic ?
    `شاهد هذا المنشور الرائع من @${post.author?.username} في تطبيق Otaku Black!` :
    `Check out this amazing post by @${post.author?.username} in Otaku Black!`;
    const dummyLink = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      navigator.share({
        title: "Otaku Black",
        text: shareText,
        url: dummyLink
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${dummyLink}`);
      triggerInAppNotification(
        isArabic ? "تم تجهيز المشاركة" : "Share Prepared",
        isArabic ? "تم نسخ نص المشاركة ورابط المنشور للتواصل الاجتماعي." : "Share text and link copied to clipboard.",
        "📤"
      );
    }
  };

  const handleSubmitReport = (postId: string) => {
    triggerHapticFeedback("success");
    playSynthSound("purchase");

    const post = posts.find((p) => p.id === postId);
    const authorName = post?.author?.username || "unknown";

    const logText = isArabic ?
    `⚠️ تم الإبلاغ عن منشور @${authorName} بسبب: ${reportReason}` :
    `⚠️ Reported post by @${authorName} for: ${reportReason}`;
    addLogMessage(logText);

    setReportingPostId(null);
    setReportDetails("");

    triggerInAppNotification(
      isArabic ? "تم إرسال البلاغ" : "Report Submitted",
      isArabic ? "نشكرك على مساهمتك! سيقوم المشرفون بمراجعة هذا المنشور فوراً واتخاذ الإجراء المناسب." : "Thank you! Our moderation team will review this post immediately.",
      "⚠️"
    );
  };

  const handleSaveEditedPost = async (postId: string) => {
    if (!editingPostContent.trim()) return;

    triggerHapticFeedback("success");
    playSynthSound("tap");

    const postObj = posts.find((p) => p.id === postId);
    const isUserAdmin = isUserAdminOrMod(currentUser);
    const suffix = isUserAdmin && postObj?.authorId !== currentUser?.uid ?
    `\n\n*(تم التعديل بواسطة الإدارة للالتزام بالمعايير)*` :
    ` *(معدل)*`;

    const finalContent = editingPostContent.trim() + suffix;

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) {
        return { ...p, content: finalContent, isEdited: true };
      }
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        content: finalContent,
        isEdited: true
      });
    } catch (err) {
      console.error("Error editing post:", err);
    }

    setEditingPostId(null);
    setEditingPostContent("");

    triggerInAppNotification(
      isArabic ? "تم تعديل المنشور" : "Post Edited",
      isArabic ? "تم تحديث محتوى المنشور بنجاح!" : "Post content has been successfully updated!",
      "📝"
    );
  };

  const handleDeletePost = async (postId: string) => {
    triggerHapticFeedback("error");
    playSynthSound("error");

    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }

    triggerInAppNotification(
      isArabic ? "تم حذف المنشور" : "Post Deleted",
      isArabic ? "تم حذف المنشور بشكل نهائي ونجاح!" : "The post was deleted permanently!",
      "🗑️"
    );
  };

  const handleTogglePinPost = async (post: any) => {
    triggerHapticFeedback("levelup");
    playSynthSound("levelup");

    const postId = post.id;
    const isPinnedNow = !post.isPinned;

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) return { ...p, isPinned: isPinnedNow };
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        isPinned: isPinnedNow
      });
    } catch (err) {
      console.error("Error pinning post:", err);
    }

    const logText = isArabic ?
    `📌 ${isPinnedNow ? "ثبّت" : "ألغيت تثبيت"} منشور لـ @${post.author?.username}` :
    `📌 ${isPinnedNow ? "Pinned" : "Unpinned"} post by @${post.author?.username}`;
    addLogMessage(logText);

    triggerInAppNotification(
      isArabic ? isPinnedNow ? "تم تثبيت المنشور" : "تم إلغاء التثبيت" : isPinnedNow ? "Post Pinned" : "Post Unpinned",
      isArabic ?
      isPinnedNow ? "سيظهر هذا المنشور مثبت في أعلى قائمة الاكتشاف!" : "تمت إزالة التثبيت من الخلاصة." :
      isPinnedNow ? "This post will stay featured at the top of the feeds!" : "Unpinned from the discovery feeds.",
      "📌"
    );
  };

  const handleToggleFeaturePost = async (post: any) => {
    triggerHapticFeedback("levelup");
    playSynthSound("levelup");

    const postId = post.id;
    const isFeaturedNow = !post.isFeatured;

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.id === postId) return { ...p, isFeatured: isFeaturedNow };
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        isFeatured: isFeaturedNow
      });
    } catch (err) {
      console.error("Error featuring post:", err);
    }

    const logText = isArabic ?
    `✨ ${isFeaturedNow ? "ميّزت" : "ألغيت تمييز"} منشور لـ @${post.author?.username} بهالة ذهبية حارقة` :
    `✨ ${isFeaturedNow ? "Featured" : "Unfeatured"} post by @${post.author?.username} with golden aura glow`;
    addLogMessage(logText);

    triggerInAppNotification(
      isArabic ? isFeaturedNow ? "تم تمييز المنشور" : "تم إلغاء التمييز" : isFeaturedNow ? "Post Featured" : "Post Unfeatured",
      isArabic ?
      isFeaturedNow ? "تم إعطاء المنشور زخرفة هالة حماسية ذهبية!" : "تمت إزالة الزخرفة الذهبية." :
      isFeaturedNow ? "The post has been adorned with a golden flaming aura!" : "Golden aura removed.",
      "✨"
    );
  };

  const handleVerifyAuthor = async (post: any) => {
    triggerHapticFeedback("success");
    playSynthSound("levelup");

    const authorUid = post.authorId;
    const authorUsername = post.author?.username;

    setPosts((prev) => prev.map((p, _autoIdx) => {
      if (p.author?.username === authorUsername) {
        return { ...p, author: { ...p.author, isVerified: true } };
      }
      return p;
    }));

    if (authorUid) {
      try {
        const userRef = doc(db, "users", authorUid);
        await updateDoc(userRef, {
          isVerified: true
        });
      } catch (err) {
        console.error("Error verifying user doc:", err);
      }
    }

    const logText = isArabic ?
    `👑 وثقت حساب العضو @${authorUsername} رسمياً` :
    `👑 Officially verified user @${authorUsername}`;
    addLogMessage(logText);

    triggerInAppNotification(
      isArabic ? "تم توثيق العضو!" : "User Verified!",
      isArabic ? `تم توثيق حساب @${authorUsername} وستظهر علامة النجمة الخضراء.` : `User @${authorUsername} is now officially verified!`,
      "👑"
    );
  };

  const handleSuspendAuthor = (post: any) => {
    triggerHapticFeedback("error");
    playSynthSound("error");

    const authorUsername = post.author?.username;
    if (!authorUsername) return;

    setBannedUsernames((prev) => {
      const next = new Set(prev);
      next.add(authorUsername);
      return next;
    });

    const logText = isArabic ?
    `🚫 حظرت صانع المحتوى @${authorUsername} وأخفيت منشوراته فورياً` :
    `🚫 Suspended creator @${authorUsername} and filtered out their posts`;
    addLogMessage(logText);

    triggerInAppNotification(
      isArabic ? "تم حظر المستخدم" : "User Banned",
      isArabic ? `تم حظر @${authorUsername} وإخفاء جميع منشوراته من خلاصة الاكتشاف الخاصة بك.` : `Creator @${authorUsername} has been suspended from your discovery stream.`,
      "🚫"
    );
  };

  const handleFollowCreator = (username: string) => {
    triggerHapticFeedback("levelup");
    playSynthSound("levelup");

    // Add to user following array
    const currentFollowing = currentUser?.following || [];
    let nextFollowing = [...currentFollowing];
    if (nextFollowing.includes(username)) {
      nextFollowing = nextFollowing.filter((u) => u !== username);
    } else {
      nextFollowing.push(username);
    }

    setCurrentUser((prev) => ({ ...prev, following: nextFollowing }));

    // Update local taste log
    const isNowFollowing = nextFollowing.includes(username);
    const followMsg = isArabic ?
    `${isNowFollowing ? "👤 تابعت" : "❌ ألغيت متابعة"} المستخدم @${username} - تكيفت الخوارزمية مع صانع المحتوى.` :
    `${isNowFollowing ? "👤 Followed" : "❌ Unfollowed"} user @${username} - calibrated recommendation weights.`;

    const nextLogs = [
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${followMsg}`,
    ...logs.slice(0, 19)];


    setLogs(nextLogs);
    saveTasteProfile(taste, nextLogs);

    triggerInAppNotification(
      isArabic ? "تحديث قائمة المتابعة" : "Follow List Updated",
      isArabic ? `أنت تتابع الآن @${username} بنجاح!` : `You are now following @${username}!`,
      "👤"
    );
  };

  const handleDismissPost = (postId: string, category: string) => {
    setDismissedPostIds((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    handleDislikeTag(category);
  };

  const handleDismissReel = (reelId: string, category: string) => {
    setDismissedReelIds((prev) => {
      const next = new Set(prev);
      next.add(reelId);
      return next;
    });
    handleDislikeTag(category);
  };

  const personalizedPosts = getPersonalizedPosts();
  const personalizedReels = getPersonalizedReels();
  const personalizedCreators = getPersonalizedCreators();

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Intro */}
      <div className="bg-gradient-to-r from-red-600/10 via-purple-900/15 to-transparent border border-zinc-800 p-4 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF3D00]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3D00] to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{isArabic ? "خلاصة الاكتشاف الذكي المخصصة" : "Personalized Discover AI Feed"}</span>
              <span className="text-[8px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-sans">Active AI</span>
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {isArabic ?
              "تقوم الخوارزمية بتحليل تفاعلاتك، الإعجابات، المتابعة، والزيارات لإعادة تشكيل أوزان اهتمامك وتقديم المحتوى الأكثر ملاءمة لشخصيتك كأوتاكو!" :
              "Our adaptive algorithm scores posts, videos, and creator profiles in real-time based on your viewing habits, followed accounts, and custom genre affinity!"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Taste Profile (Sliders) */}
      <div className="bg-[#121212] border border-zinc-850 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF3D00]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">
              {isArabic ? "بصمة ذوقك كأوتاكو (AI Taste Profile)" : "Your Otaku Taste Profile"}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetTaste}
              className="text-[10px] text-zinc-500 hover:text-white font-bold bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg transition-colors">
              
              {isArabic ? "إعادة تعيين" : "Reset Weights"}
            </button>
            <button
              onClick={() => saveTasteProfile(taste, logs)}
              disabled={isSaving}
              className="text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5">
              
              {isSaving ?
              <RefreshCw className="w-3 h-3 animate-spin" /> :

              <Database className="w-3 h-3" />
              }
              <span>{isSaving ? isArabic ? "جاري الحفظ..." : "Saving..." : isArabic ? "حفظ السحابة" : "Save Cloud"}</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GENRES.map((g, _autoIdx) => {
            const val = taste[g.id] || 0;
            return (
              <div key={`genre_${g.id}_${_autoIdx}`} className="space-y-1.5 bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-200">{isArabic ? g.nameAr : g.nameEn}</span>
                  <span className="font-mono text-[#FF3D00]">{val}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => handleSliderChange(g.id, parseInt(e.target.value))}
                    className="flex-1 accent-[#FF3D00] bg-zinc-800 h-1 rounded-lg cursor-pointer" />
                  
                  <button
                    onClick={() => handleDislikeTag(g.id)}
                    className="p-1 bg-zinc-900 hover:bg-red-950/40 border border-zinc-850 rounded text-zinc-500 hover:text-red-500 transition-colors shrink-0"
                    title={isArabic ? "تقليل الاهتمام" : "Reduce weight"}>
                    
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>);

          })}
        </div>

        <div className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 bg-zinc-950/20 p-2 rounded-xl border border-zinc-900/40">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{isArabic ? "تقوم أشرطة التمرير بتحديث نفسها تلقائياً عند قيامك بأي نشاط مخصص للحفاظ على المجموع 100%." : "Adjusting sliders manually re-balances other categories dynamically to keep the total at exactly 100%."}</span>
        </div>
      </div>

      {/* 3. Action Simulator Panel */}
      <div className="bg-[#121212] border border-zinc-850 rounded-2xl p-4 space-y-4.5 shadow-lg">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">
              {isArabic ? "محاكي التفاعل لتكييف الذكاء الاصطناعي" : "Real-time AI Adaptation Simulator"}
            </h3>
          </div>
          <div className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
            {isArabic ? "تعلّم مستمر نشط" : "Continuous Active Learning"}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          {isArabic ?
          "انقر على أي من أزرار المحاكاة التفاعلية أدناه لمحاكاة تفاعلك الفعلي (مثل الإعجاب، المتابعة، أو المشاهدة). ستشاهد أوزان الذوق ومكعب النشاط يتكيفان فورياً!" :
          "Click any interaction chip below to simulate real-time platform behaviors. Watch how your Otaku Taste Profile re-calibrates instantly and updates your recommended feeds!"}
        </p>

        {/* Simulation Chips */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => simulateAction("shonen", "مشاهدة قتال لوفي ضد كايدو (#ون_بيس)", "Watched Luffy vs Kaido fight scene (#onepiece)")}
            className="px-3 py-2 bg-orange-950/20 hover:bg-orange-950/40 border border-orange-900/30 text-orange-400 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95">
            
            💥 {isArabic ? "لايك بوست شونين حماسي" : "Like Shonen Post"}
          </button>
          <button
            onClick={() => simulateAction("seinen", "قراءة مراجعة فلسفية لمانجا Berserk", "Read dark psychological review of Berserk")}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95">
            
            💀 {isArabic ? "قراءة مقال سينين مظلم" : "Read Seinen Article"}
          </button>
          <button
            onClick={() => simulateAction("shoujo", "حفظ رسمة فان آرت لأنمي رومانسي دافئ", "Saved romantic fanart of Sailor Moon")}
            className="px-3 py-2 bg-pink-950/20 hover:bg-pink-950/40 border border-pink-900/30 text-pink-400 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95">
            
            🌸 {isArabic ? "حفظ فن آرت شوجو/رومانس" : "Save Shoujo Art"}
          </button>
          <button
            onClick={() => simulateAction("isekai", "متابعة صانع محتوى ينشر فيديوهات ريلز عن Re:Zero", "Followed an Isekai reel creator posting Re:Zero")}
            className="px-3 py-2 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95">
            
            🌀 {isArabic ? "متابعة ريلز إيسيكاي" : "Follow Isekai Reels"}
          </button>
          <button
            onClick={() => simulateAction("cyberpunk", "البحث عن هاشتاق ميكا وإيفانجيليون", "Searched mecha and Evangelion universe tags")}
            className="px-3 py-2 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-900/30 text-cyan-400 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95">
            
            💻 {isArabic ? "تصفح هاشتاق سايبربانك" : "Browse Cyberpunk"}
          </button>
        </div>

        {/* Terminal Logger */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
            ⌨️ {isArabic ? "سجل نشاط معايرة الخوارزمية (Live Console Logs)" : "Live Console Calibration Logs"}
          </span>
          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl font-mono text-[9px] text-zinc-400 max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {logs.map((log, i) =>
            <div key={i} className={`truncate ${i === 0 ? "text-emerald-400 font-bold" : "opacity-75"}`}>
                {log}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recommendation Mode and Segmented Tabs */}
      <div className="space-y-4">
        
        {/* Settings & Mode Selector Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
          
          {/* Mode Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">{isArabic ? "نمط الترشيح:" : "Engine Filter:"}</span>
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              {(["balanced", "trending", "deep_cuts"] as const).map((mode, _autoIdx) =>
              <button
                key={`${mode}_${_autoIdx}`}
                onClick={() => {
                  setAlgorithmMode(mode);
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  addLogMessage(
                    isArabic ?
                    `⚙️ تم تبديل نمط التصفية إلى: ${mode === "balanced" ? "متوازن" : mode === "trending" ? "رائج" : "عميق"}` :
                    `⚙️ Switched algorithm mode to: ${mode}`
                  );
                }}
                className={`px-2 py-1 rounded text-[9px] font-black transition-all ${
                algorithmMode === mode ?
                "bg-red-600 text-white shadow" :
                "text-zinc-500 hover:text-white"}`
                }>
                
                  {mode === "balanced" && (isArabic ? "متوازن" : "Balanced")}
                  {mode === "trending" && (isArabic ? "شعبية ورائج" : "Hype Trends")}
                  {mode === "deep_cuts" && (isArabic ? "قنوات عميقة" : "Deep Cuts")}
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs selection */}
          <div className="flex gap-1.5 select-none w-full sm:w-auto justify-end">
            {(["posts", "reels", "creators"] as const).map((sub, _autoIdx) => {
              const isActive = activeSubTab === sub;
              return (
                <button
                  key={`subtab_${sub}_${_autoIdx}`}
                  onClick={() => {
                    setActiveSubTab(sub);
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                  isActive ?
                  "bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20" :
                  "bg-[#121212] border-zinc-800 text-zinc-400 hover:text-white"}`
                  }>
                  
                  {sub === "posts" && (isArabic ? "📝 منشورات مقترحة" : "📝 Recommended Posts")}
                  {sub === "reels" && (isArabic ? "🎬 ريلز الأنمي" : "🎬 Anime Videos")}
                  {sub === "creators" && (isArabic ? "👥 حسابات أوتاكو" : "👥 Top Otakus")}
                </button>);

            })}
          </div>

        </div>

        {/* FEED BODY */}
        <AnimatePresence mode="wait">
          {activeSubTab === "posts" &&
          <motion.div
            key="posts-feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            
              {personalizedPosts.length === 0 ?
            <div className="text-center py-12 bg-[#121212] border border-zinc-900 rounded-2xl text-xs text-zinc-500">
                  {isArabic ? "لا توجد المزيد من المنشورات الموصى بها!" : "No more recommended posts available!"}
                </div> :

            personalizedPosts.slice(0, 4).map((post, _autoIdx) => {
              // Determine primary genre tag
              let itemGenre = "shonen";
              GENRES.forEach((g) => {
                g.keywords.forEach((kw) => {
                  if (post.content.toLowerCase().includes(kw)) itemGenre = g.id;
                });
              });

              const isSaved = savedPostIds.has(post.id);
              const isReposted = repostedPostIds.has(post.id);
              const showComments = activeCommentsPostId === post.id;
              const isPostAuthor = post.authorId === currentUser?.uid || post.author?.username === currentUser?.username;

              return (
                <motion.div
                  key={`${post.id}_${_autoIdx}`}
                  layout
                  exit={{ scale: 0.9, opacity: 0, height: 0 }}
                  className={`relative border rounded-2xl p-4.5 shadow-md hover:border-zinc-700 transition-all space-y-3.5 ${
                  post.isFeatured ?
                  "bg-gradient-to-b from-amber-950/20 via-[#121212] to-[#121212] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]" :
                  "bg-[#121212] border-zinc-850"}`
                  }>
                  
                      {/* Pinned status badge */}
                      {post.isPinned &&
                  <div className="flex items-center gap-1 text-[10px] text-purple-400 font-black tracking-wider uppercase bg-purple-950/40 border border-purple-900/50 px-2.5 py-0.5 rounded-md w-max">
                          <Pin className="w-3 h-3 fill-purple-400 shrink-0" />
                          <span>{isArabic ? "منشور مثبت بواسطة الإدارة" : "Pinned by Moderation"}</span>
                        </div>
                  }

                      {/* Featured status badge */}
                      {post.isFeatured &&
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-black tracking-wider uppercase bg-amber-950/40 border border-amber-900/50 px-2.5 py-0.5 rounded-md w-max">
                          <Sparkles className="w-3 h-3 fill-amber-400 shrink-0 animate-pulse" />
                          <span>{isArabic ? "محتوى مميز وموثق" : "Featured Premium Content"}</span>
                        </div>
                  }

                      {/* Top profile bar & AI match badge */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <img src={post.author?.avatar} className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-850" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white">{post.author?.name}</span>
                              <LevelBadge level={(post.author as any)?.level || (post.author as any)?.rankLevel || 15} size="xs" />
                              {post.author?.isVerified &&
                          <span className="flex items-center text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-sans font-black flex-row gap-0.5">
                                  <UserCheck className="w-2.5 h-2.5" />
                                  <span>{isArabic ? "موثق" : "Verified"}</span>
                                </span>
                          }
                              {isUserAdminOrMod({ role: post.author?.role }) &&
                          <span className="text-[8px] bg-red-950/80 text-red-400 border border-red-900/30 px-1 rounded font-bold uppercase font-sans">
                                  {isArabic ? "إدارة" : "Staff"}
                                </span>
                          }
                            </div>
                            <span className="text-[9px] text-zinc-500 block font-mono">@{post.author?.username}</span>
                          </div>
                        </div>

                        {/* Right side controls: Match Badge + More Options Button */}
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-900">
                            <span className="text-[8px] text-zinc-500 uppercase font-black">
                              {isArabic ? "ملائمة:" : "Match:"}
                            </span>
                            <span className="text-[9px] text-[#FF3D00] font-mono font-black">
                              {post.matchPercent}%
                            </span>
                          </div>

                          <button
                        onClick={() => {
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                          setActiveMoreOptionsPost(post);
                        }}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title={isArabic ? "المزيد من الخيارات" : "More Options"}>
                        
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content Section (Normal vs Edit Mode) */}
                      {editingPostId === post.id ?
                  <div className="space-y-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                          <textarea
                      value={editingPostContent}
                      onChange={(e) => setEditingPostContent(e.target.value)}
                      className="w-full text-xs bg-[#121212] text-zinc-100 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:border-red-600 font-sans resize-none h-20"
                      placeholder={isArabic ? "اكتب المحتوى الجديد هنا..." : "Type the new content here..."} />
                    
                          <div className="flex justify-end gap-2 text-[10px]">
                            <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1 bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded-md border border-zinc-800">
                        
                              {isArabic ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                        onClick={() => handleSaveEditedPost(post.id)}
                        className="px-3 py-1 bg-red-600 text-white font-black rounded-md hover:bg-red-700">
                        
                              {isArabic ? "حفظ التعديلات" : "Save Changes"}
                            </button>
                          </div>
                        </div> :

                  <div className="space-y-2">
                          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                          {post.isEdited &&
                    <span className="text-[9px] text-zinc-600 italic font-mono block">
                              {isArabic ? "* معدل بواسطة الكاتب أو الإشراف" : "* Edited by author or moderator"}
                            </span>
                    }
                        </div>
                  }

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 &&
                  <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((tag: string, idx: number) =>
                    <span key={idx} className="text-[9px] bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-bold">
                              {tag}
                            </span>
                    )}
                        </div>
                  }

                      {/* Bottom action controls */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-t border-zinc-900 pt-3 text-xs text-zinc-400">
                        <div className="flex flex-wrap gap-4 items-center">
                          {/* 1. Like Button */}
                          <UniversalReactions
                        targetId={post.id}
                        targetType="post"
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        isArabic={isArabic}
                        authorId={post.authorId || post.author?.id || post.author?.username}
                        triggerInAppNotification={triggerInAppNotification} />
                      

                          {/* 2. Comments Button */}
                          <button
                        onClick={() => {
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                          setActiveCommentsPostId(showComments ? null : post.id);
                        }}
                        className={`flex items-center gap-1.5 hover:text-blue-400 transition-colors ${
                        showComments ? "text-blue-400 font-bold" : ""}`
                        }>
                        
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-mono text-[10px]">{post.comments?.length || 0}</span>
                          </button>

                          {/* 3. Repost Button */}
                          <button
                        onClick={() => handleRepostPost(post)}
                        className={`flex items-center gap-1.5 hover:text-emerald-400 transition-colors ${
                        isReposted ? "text-emerald-400 font-bold" : ""}`
                        }
                        title={isArabic ? "إعادة النشر لزيادة التقييم" : "Repost to boost rating"}>
                        
                            <Repeat className={`w-4 h-4 ${isReposted ? "stroke-[2.5]" : ""}`} />
                            <span className="font-mono text-[10px]">{post.reposts || 0}</span>
                          </button>

                          {/* 4. Save/Bookmark Button */}
                          <button
                        onClick={() => handleToggleSavePost(post)}
                        className={`flex items-center gap-1.5 hover:text-yellow-400 transition-colors ${
                        isSaved ? "text-yellow-400 font-bold" : ""}`
                        }>
                        
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-yellow-400 text-yellow-400" : ""}`} />
                            <span className="font-mono text-[10px]">{post.saves || 0}</span>
                          </button>

                          {/* 5. External Share Button */}
                          <button
                        onClick={() => handleSharePost(post)}
                        className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                        
                            <Share2 className="w-4 h-4" />
                            <span className="text-[10px] hidden md:inline">{isArabic ? "مشاركة" : "Share"}</span>
                          </button>
                        </div>

                        {/* Feedback controls for AI (Dismiss) */}
                        <div className="flex gap-2 justify-end">
                          <button
                        onClick={() => handleDismissPost(post.id, itemGenre)}
                        className="text-[9px] bg-zinc-950 hover:bg-red-950/40 border border-zinc-900 hover:border-red-900/40 px-2.5 py-1 rounded-lg text-zinc-500 hover:text-red-400 transition-all flex items-center gap-1"
                        title={isArabic ? "إخفاء وتقليل تفضيل هذا النوع" : "Hide & show less like this"}>
                        
                            <ThumbsDown className="w-3 h-3" />
                            <span>{isArabic ? "أقل تكراراً" : "Less like this"}</span>
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED INLINE COMMENTS SECTION */}
                      {showComments &&
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 space-y-3 mt-3 overflow-hidden">
                    
                          <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider pb-1 border-b border-zinc-900">
                            💬 {isArabic ? "قسم النقاش والتعليقات" : "Discussion Board"}
                          </div>

                          {/* Comments List */}
                          <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                            {!post.comments || post.comments.length === 0 ?
                      <div className="text-center py-4 text-zinc-600 text-[10px] italic">
                                {isArabic ? "لا توجد تعليقات هنا بعد. ابدأ النقاش!" : "No comments yet. Start the debate!"}
                              </div> :

                      post.comments.map((comment: any, cidx: number) => {
                        const isCommentAuthor = comment.author === currentUser?.name || comment.author === currentUser?.username;
                        const isStaff = isUserAdminOrMod(currentUser);

                        return (
                          <div key={comment.id || cidx} className="bg-[#121212]/60 p-2.5 rounded-lg border border-zinc-900 flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-zinc-200">
                                          {comment.author}
                                        </span>
                                        {isUserAdminOrMod({ role: comment.role }) &&
                                <span className="text-[7px] bg-red-950 text-red-400 px-1 rounded font-bold font-sans">Staff</span>
                                }
                                      </div>
                                      {comment.flagged && !revealedComments[comment.id] ?
                              <p className="text-[10px] text-red-400 bg-red-950/20 px-2 py-1 rounded border border-red-500/15 cursor-pointer hover:bg-red-950/30 select-none transition-colors"
                              onClick={() => setRevealedComments((prev) => ({ ...prev, [comment.id]: true }))}>
                                          ⚠️ {isArabic ? "محتوى تعليق حساس. اضغط للكشف" : "Flagged comment. Click to reveal"}
                                        </p> :

                              <p className="text-[11px] text-zinc-300 leading-normal">
                                          {comment.text}
                                          {comment.flagged &&
                                <span className="ml-1.5 text-[8px] font-mono text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                                              flagged
                                            </span>
                                }
                                        </p>
                              }
                                      
                                      {/* Comment reactions */}
                                      <div className="pt-1.5">
                                        <UniversalReactions
                                  targetId={comment.id || `c_${post.id}_${cidx}`}
                                  targetType="comment"
                                  currentUser={currentUser}
                                  setCurrentUser={setCurrentUser}
                                  isArabic={isArabic}
                                  authorId={comment.authorId || comment.author}
                                  triggerInAppNotification={triggerInAppNotification} />
                                
                                      </div>
                                    </div>

                                    {/* Delete comment option if owner or admin/mod */}
                                    {(isCommentAuthor || isStaff) &&
                            <button
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                              title={isArabic ? "حذف التعليق" : "Delete Comment"}>
                              
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                            }
                                  </div>);

                      })
                      }
                          </div>

                          {/* Add Comment Input Row */}
                          <div className="flex gap-2 pt-2 border-t border-zinc-900">
                            <input
                        type="text"
                        value={newCommentTexts[post.id] || ""}
                        onChange={(e) => setNewCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        placeholder={isArabic ? "أضف تعليقاً حماسياً..." : "Write a hyped comment..."}
                        className="flex-1 bg-[#121212] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600" />
                      
                            <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs transition-colors shrink-0">
                        
                              {isArabic ? "نشر" : "Post"}
                            </button>
                          </div>
                        </motion.div>
                  }
                    </motion.div>);

            })
            }
            </motion.div>
          }

          {activeSubTab === "reels" &&
          <motion.div
            key="reels-feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
              {personalizedReels.length === 0 ?
            <div className="col-span-2 text-center py-12 bg-[#121212] border border-zinc-900 rounded-2xl text-xs text-zinc-500">
                  {isArabic ? "لا توجد فيديوهات ريلز موصى بها حالياً!" : "No more recommended reels available!"}
                </div> :

            personalizedReels.slice(0, 4).map((reel, _autoIdx) => {
              let reelGenre = "shonen";
              GENRES.forEach((g) => {
                g.keywords.forEach((kw) => {
                  if (reel.title.toLowerCase().includes(kw)) reelGenre = g.id;
                });
              });

              return (
                <motion.div
                  key={`${reel.id}_${_autoIdx}`}
                  layout
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#121212] border border-zinc-850 rounded-2xl overflow-hidden shadow-lg relative flex flex-col group">
                  
                      <div className="aspect-[9/16] w-full max-h-[380px] bg-zinc-950 flex flex-col justify-between p-4 relative overflow-hidden">
                        
                        {/* Dynamic Background glowing aura based on match */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3D00]/10 via-purple-600/5 to-transparent animate-pulse" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.8)_100%)] z-10" />

                        {/* Top bar with match badge */}
                        <div className="flex justify-between items-center relative z-20">
                          <div className="flex items-center gap-1.5">
                            <img src={reel.author?.avatar} className="w-6 h-6 rounded-full object-cover border border-[#FF3D00]" />
                            <span className="text-[10px] font-bold text-white shadow-md">@{reel.author?.username}</span>
                          </div>

                          <span className="text-[9px] bg-red-600 text-white font-mono font-black px-2 py-0.5 rounded-full">
                            {reel.matchPercent}% {isArabic ? "مطابقة" : "Match"}
                          </span>
                        </div>

                        {/* Center Player Icon */}
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center space-y-1">
                          <div className="w-12 h-12 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Tv className="w-5 h-5 text-[#FF3D00] animate-bounce" />
                          </div>
                          <span className="text-[8px] text-zinc-500 font-mono">Dynamic Stream Player</span>
                        </div>

                        {/* Sidebar buttons */}
                        <div className="absolute right-3 bottom-12 flex flex-col gap-3 items-center z-20">
                          <UniversalReactions
                        targetId={reel.id}
                        targetType="reel"
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        isArabic={isArabic}
                        authorId={reel.authorId}
                        triggerInAppNotification={triggerInAppNotification}
                        className="flex-col !items-center !gap-1" />
                      
                        </div>

                        {/* Bottom details */}
                        <div className="relative z-20 text-white space-y-1 pr-10">
                          <h4 className="text-xs font-black leading-snug drop-shadow text-zinc-100 line-clamp-2">{reel.title}</h4>
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">{reelGenre} Category</span>
                        </div>

                      </div>

                      {/* Bottom Adaptive Dismiss action */}
                      <div className="bg-zinc-950 p-2 border-t border-zinc-900 flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500 font-bold">Feedback Loop</span>
                        <button
                      onClick={() => handleDismissReel(reel.id, reelGenre)}
                      className="text-[8px] bg-zinc-900 hover:bg-red-950/40 border border-zinc-850 text-zinc-400 hover:text-red-400 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      
                          <ThumbsDown className="w-2.5 h-2.5" />
                          <span>{isArabic ? "عدم اقتراح هذا النوع" : "Mute category"}</span>
                        </button>
                      </div>

                    </motion.div>);

            })
            }
            </motion.div>
          }

          {activeSubTab === "creators" &&
          <motion.div
            key="creators-feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3">
            
              {personalizedCreators.map((creator, _autoIdx) => {
              const isFollowing = currentUser?.following?.includes(creator.username);
              return (
                <div
                  key={`${creator.username}_${_autoIdx}`}
                  className="bg-[#121212] border border-zinc-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md hover:border-zinc-800 transition-all">
                  
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} className="w-11 h-11 rounded-full object-cover border-2 border-purple-900/30" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs">{creator.name}</h4>
                          <span className="text-[8px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                            LVL {creator.level}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block">@{creator.username}</span>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {isArabic ? creator.bioAr : creator.bioEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-zinc-900 sm:border-0 pt-2.5 sm:pt-0 shrink-0">
                      
                      {/* Match percentage */}
                      <div className="text-right">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">Taste Match</span>
                        <span className="text-[11px] font-mono font-black text-[#FF3D00]">{creator.matchPercent}%</span>
                      </div>

                      {/* Follow trigger */}
                      <button
                      onClick={() => handleFollowCreator(creator.username)}
                      className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                      isFollowing ?
                      "bg-zinc-900 text-zinc-400 border border-zinc-800" :
                      "bg-red-600 text-white hover:bg-red-700 hover:scale-105"}`
                      }>
                      
                        {isFollowing ?
                      <div className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isArabic ? "يتابع" : "Following"}</span>
                          </div> :

                      <div className="flex items-center gap-1">
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{isArabic ? "متابعة" : "Follow"}</span>
                          </div>
                      }
                      </button>

                    </div>
                  </div>);

            })}
            </motion.div>
          }
        </AnimatePresence>

      </div>

      {/* MORE OPTIONS BOTTOM SHEET / OVERLAY */}
      <AnimatePresence>
        {activeMoreOptionsPost &&
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMoreOptionsPost(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs" />
          

            {/* Modal Box */}
            <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="relative w-full sm:max-w-md bg-zinc-950 border-t sm:border border-zinc-850 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl z-10 overflow-hidden space-y-4 text-right"
            dir={isArabic ? "rtl" : "ltr"}>
            
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <img
                  src={activeMoreOptionsPost.author?.avatar}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-800" />
                
                  <div className="text-left">
                    <span className="text-[11px] font-black text-white block">
                      {isArabic ? "منشور بقلم" : "Post by"} @{activeMoreOptionsPost.author?.username}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block">
                      {isArabic ? "معرّف البوست:" : "ID:"} {activeMoreOptionsPost.id}
                    </span>
                  </div>
                </div>
                <button
                onClick={() => setActiveMoreOptionsPost(null)}
                className="p-1 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Rows */}
              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto scrollbar-thin">
                
                {/* 1. Toggle Bookmark */}
                <button
                onClick={() => {
                  handleToggleSavePost(activeMoreOptionsPost);
                  setActiveMoreOptionsPost(null);
                }}
                className="w-full text-right flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>
                      {savedPostIds.has(activeMoreOptionsPost.id) ?
                    isArabic ? "إلغاء الحفظ من المفضلة" : "Unsave from Library" :
                    isArabic ? "حفظ المنشور في المفضلة" : "Save to Bookmarks"}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {activeMoreOptionsPost.saves || 0}
                  </span>
                </button>

                {/* 2. Repost / Boost */}
                <button
                onClick={() => {
                  handleRepostPost(activeMoreOptionsPost);
                  setActiveMoreOptionsPost(null);
                }}
                className="w-full text-right flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                
                  <div className="flex items-center gap-2.5">
                    <Repeat className="w-4 h-4 text-zinc-400" />
                    <span>{isArabic ? "إعادة نشر بوست الأوتـاكو" : "Repost Post to Feed"}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {activeMoreOptionsPost.reposts || 0}
                  </span>
                </button>

                {/* 3. Copy Link */}
                <button
                onClick={() => {
                  handleCopyPostLink(activeMoreOptionsPost.id);
                  setActiveMoreOptionsPost(null);
                }}
                className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>{isArabic ? "نسخ رابط المنشور المباشر" : "Copy Direct Post Link"}</span>
                </button>

                {/* 4. Social Share */}
                <button
                onClick={() => {
                  handleSharePost(activeMoreOptionsPost);
                  setActiveMoreOptionsPost(null);
                }}
                className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                
                  <Share2 className="w-4 h-4 text-zinc-400" />
                  <span>{isArabic ? "مشاركة المنشور عبر تطبيقات أخرى" : "Share via External Apps"}</span>
                </button>

                {/* 5. Report */}
                <button
                onClick={() => {
                  setReportingPostId(activeMoreOptionsPost.id);
                  setActiveMoreOptionsPost(null);
                }}
                className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-all text-xs border border-transparent hover:border-red-950/30">
                
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isArabic ? "الإبلاغ عن محتوى غير لائق" : "Report Post to Staff"}</span>
                </button>

                {/* ADMINISTRATIVE MODERATION DESK CONTROLS */}
                {isUserAdminOrMod(currentUser) &&
              <div className="pt-3.5 mt-3 border-t border-zinc-900 space-y-2">
                    <div className="px-3 text-[10px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
                      <span>🛡️ {isArabic ? "لوحة تحكم وإجراءات الإشراف" : "Staff Moderation Actions"}</span>
                      <span className="text-[7px] bg-red-950 text-red-400 px-1 py-0.2 rounded font-mono">ADMIN ACCESS</span>
                    </div>

                    {/* Pin/Unpin */}
                    <button
                  onClick={() => {
                    handleTogglePinPost(activeMoreOptionsPost);
                    setActiveMoreOptionsPost(null);
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                  
                      <Pin className={`w-4 h-4 ${activeMoreOptionsPost.isPinned ? "fill-purple-400 text-purple-400" : "text-zinc-500"}`} />
                      <span>
                        {activeMoreOptionsPost.isPinned ?
                    isArabic ? "إلغاء تثبيت البوست من القمة" : "Unpin Post from Top" :
                    isArabic ? "تثبيت البوست في أعلى الخلاصة" : "Pin Post to Discovery Top"}
                      </span>
                    </button>

                    {/* Gold feature / Glow */}
                    <button
                  onClick={() => {
                    handleToggleFeaturePost(activeMoreOptionsPost);
                    setActiveMoreOptionsPost(null);
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                  
                      <Sparkles className={`w-4 h-4 ${activeMoreOptionsPost.isFeatured ? "fill-amber-400 text-amber-400" : "text-zinc-500"}`} />
                      <span>
                        {activeMoreOptionsPost.isFeatured ?
                    isArabic ? "إلغاء تمييز المنشور (إطفاء الهالة)" : "Remove Gold Aura Glow" :
                    isArabic ? "تمييز المنشور (إعطاء الهالة الذهبية)" : "Adorn with Golden Aura Glow"}
                      </span>
                    </button>

                    {/* Verify Creator */}
                    {!activeMoreOptionsPost.author?.isVerified &&
                <button
                  onClick={() => {
                    handleVerifyAuthor(activeMoreOptionsPost);
                    setActiveMoreOptionsPost(null);
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                  
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        <span>{isArabic ? "توثيق حساب الكاتب رسمياً 👑" : "Verify Creator Account 👑"}</span>
                      </button>
                }

                    {/* Edit post */}
                    <button
                  onClick={() => {
                    setEditingPostId(activeMoreOptionsPost.id);
                    setEditingPostContent(activeMoreOptionsPost.content);
                    setActiveMoreOptionsPost(null);
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs">
                  
                      <Edit3 className="w-4 h-4 text-zinc-400" />
                      <span>{isArabic ? "تعديل محتوى البوست (قوة المشرف)" : "Edit Content (Staff Power)"}</span>
                    </button>

                    {/* Delete post */}
                    <button
                  onClick={() => {
                    if (window.confirm(isArabic ? "هل أنت متأكد من حذف هذا المنشور نهائياً من قاعدة البيانات السحابية؟" : "Are you sure you want to permanently delete this post from cloud?")) {
                      handleDeletePost(activeMoreOptionsPost.id);
                      setActiveMoreOptionsPost(null);
                    }
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all text-xs">
                  
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>{isArabic ? "حذف البوست نهائياً 🗑️" : "Delete Post Permanently 🗑️"}</span>
                    </button>

                    {/* Suspend Creator */}
                    <button
                  onClick={() => {
                    if (window.confirm(isArabic ? `هل تريد حظر صانع المحتوى @${activeMoreOptionsPost.author?.username} وإخفاء جميع منشوراته من الخلاصة؟` : `Ban creator @${activeMoreOptionsPost.author?.username} and purge all their posts?`)) {
                      handleSuspendAuthor(activeMoreOptionsPost);
                      setActiveMoreOptionsPost(null);
                    }
                  }}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-all text-xs">
                  
                      <Ban className="w-4 h-4 text-zinc-500" />
                      <span>{isArabic ? "حظر صانع المحتوى وإخفاء منشوراته 🚫" : "Suspend Creator & Hide Content 🚫"}</span>
                    </button>

                  </div>
              }

              </div>

              {/* Footer Close Button */}
              <button
              onClick={() => setActiveMoreOptionsPost(null)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs transition-all text-center">
              
                {isArabic ? "إغلاق قائمة الخيارات" : "Close Options"}
              </button>

            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* REPORT SUBMISSION DIALOG */}
      <AnimatePresence>
        {reportingPostId &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReportingPostId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs" />
          

            {/* Modal Box */}
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-2xl z-10 space-y-4 text-right"
            dir={isArabic ? "rtl" : "ltr"}>
            
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>{isArabic ? "إبلاغ المشرفين عن محتوى غير لائق" : "Submit Report to Moderation"}</span>
                </h3>
                <button
                onClick={() => setReportingPostId(null)}
                className="p-1 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors animate-spin-once">
                
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form content */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black block uppercase tracking-wider mb-1.5 text-right">
                    {isArabic ? "اختر سبب الإبلاغ الرئيسي:" : "Select Primary Violation Reason:"}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-zinc-300">
                    {[
                  { key: "nsfw", ar: "🔞 محتوى غير لائق أو للكبار", en: "🔞 Inappropriate or Adult content" },
                  { key: "hate", ar: "😡 خطاب كراهية أو مضايقة للأعضاء", en: "😡 Hate speech or Harassment" },
                  { key: "spoiler", ar: "⚠️ حرق أحداث القصة بدون تحذير مسبق", en: "⚠️ Spoilers without notice" },
                  { key: "spam", ar: "🗑️ منشور عشوائي أو تكرار مفرط", en: "🗑️ Spam or duplicate content" },
                  { key: "plag", ar: "🎨 سرقة حقوق الرسم والفان آرت", en: "🎨 Plagiarism of Fanart/Drawings" }].
                  map((reason, _autoIdx) =>
                  <button
                    key={`${reason.key}_${_autoIdx}`}
                    onClick={() => setReportReason(reason.key)}
                    className={`w-full text-right flex items-center justify-between p-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                    reportReason === reason.key ?
                    "bg-red-950/40 border-red-500/50 text-white shadow" :
                    "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`
                    }>
                    
                        <span>{isArabic ? reason.ar : reason.en}</span>
                        {reportReason === reason.key && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                      </button>
                  )}
                  </div>
                </div>

                {/* Additional description */}
                <div>
                  <label className="text-[10px] text-zinc-500 font-black block uppercase tracking-wider mb-1.5 text-right">
                    {isArabic ? "تفاصيل إضافية (اختياري):" : "Additional Context (Optional):"}
                  </label>
                  <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full text-xs bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:border-red-600 h-16 resize-none font-sans"
                  placeholder={isArabic ? "صف سبب المشكلة بوضوح لمساعدة المشرفين..." : "Describe the issue to help our moderators..."} />
                
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-zinc-900 text-xs">
                <button
                onClick={() => setReportingPostId(null)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded-lg border border-zinc-800">
                
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                onClick={() => handleSubmitReport(reportingPostId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg transition-colors shadow-lg shadow-red-600/20">
                
                  {isArabic ? "إرسال البلاغ فورياً" : "Submit Report Now"}
                </button>
              </div>

            </motion.div>
          </div>
        }
      </AnimatePresence>

    </div>);

}