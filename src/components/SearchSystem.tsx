import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Mic, Camera, QrCode, X, Heart, MessageSquare, Share2,
  UserPlus, UserCheck, Volume2, MapPin, Music, Users, Radio,
  Trash2, History, Sparkles, Clock, Pin, Play, CheckCircle,
  ChevronRight, AlertCircle, Sparkle, Compass, CornerDownLeft } from
"lucide-react";
import { db } from "../firebase";
import { collection, query, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { Post, Story, Reel, Chat, User as UserType } from "../types";
import { formatFriendlyDate } from "../utils/dateFormatter";

interface SearchSystemProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  reels: Reel[];
  setReels: React.Dispatch<React.SetStateAction<Reel[]>>;
  stories: Story[];
  chats: Chat[];
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (titleAr: string, titleEn: string, type: "system" | "success" | "warning" | "achievement") => void;
  setViewedUserId: (id: string | null) => void;
  setActiveTab: (tab: "home" | "explore" | "create" | "chat" | "profile") => void;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  isPinned: boolean;
}

export default function SearchSystem({
  isArabic,
  currentUser,
  setCurrentUser,
  posts,
  setPosts,
  reels,
  setReels,
  stories,
  chats,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  setViewedUserId,
  setActiveTab
}: SearchSystemProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<
    "all" | "users" | "posts" | "reels" | "stories" | "groups" | "channels" | "hashtags" | "locations" | "music">(
    "all");

  // Real Database state
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [qrSimulationInput, setQrSimulationInput] = useState("");

  // AI Suggestions State
  const [aiCorrection, setAiCorrection] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiRelated, setAiRelated] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Pagination & Lazy loading
  const [visibleCount, setVisibleCount] = useState(10);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Search History and Users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const fetchedUsers = snapshot.docs.map((d, _autoIdx) => ({ id: d.id, ...d.data() }) as unknown as UserType);
        setAllUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users for search:", err);
      }
    };

    fetchUsers();

    // Load history from localStorage
    const savedHistory = localStorage.getItem(`search_history_${currentUser?.uid || "guest"}`);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, [currentUser]);

  // Synchronize search history to firestore for logged-in user if available
  const saveHistory = (newHistory: SearchHistoryItem[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem(`search_history_${currentUser?.uid || "guest"}`, JSON.stringify(newHistory));

    // Sync to user profile subcollection or doc fields
    if (currentUser?.uid) {
      const userRef = doc(db, "users", currentUser.uid);
      updateDoc(userRef, { searchHistory: newHistory }).catch((e) => console.warn("Failed to sync search history to Firestore:", e));
    }
  };

  // Debounced AI Search Assistant (did you mean, autocomplete)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setAiCorrection("");
      setAiSuggestions([]);
      setAiRelated([]);
      return;
    }

    const fetchAiSuggestions = async () => {
      setIsAiLoading(true);
      try {
        const response = await fetch("/api/ai/search-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, isArabic })
        });
        const data = await response.json();
        if (data) {
          setAiCorrection(data.corrected || "");
          setAiSuggestions(data.suggestions || []);
          setAiRelated(data.related || []);
        }
      } catch (err) {
        console.warn("AI suggestions fetch error:", err);
      } finally {
        setIsAiLoading(false);
      }
    };

    const timer = setTimeout(fetchAiSuggestions, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, isArabic]);

  // Add search query to history
  const triggerSearchExecute = (queryText: string) => {
    if (!queryText.trim()) return;

    const timestamp = new Date().toISOString();
    const existingIndex = searchHistory.findIndex((h) => h.query.toLowerCase() === queryText.toLowerCase());

    let updated = [...searchHistory];
    if (existingIndex > -1) {
      // Move to top if exists, keeping pin status
      const existingItem = updated[existingIndex];
      updated.splice(existingIndex, 1);
      updated.unshift({ ...existingItem, timestamp });
    } else {
      updated.unshift({
        id: Math.random().toString(36).substr(2, 9),
        query: queryText.trim(),
        timestamp,
        isPinned: false
      });
    }

    // Keep history clean (max 15 items)
    if (updated.length > 15) {
      updated = updated.slice(0, 15);
    }

    saveHistory(updated);
    setSearchQuery(queryText);

    // Check if the user is searching for a specific verified account, if so trigger a special achievement/in-app notification!
    const verifiedUser = allUsers.find((u) =>
    u.isVerified && (
    u.name?.toLowerCase() === queryText.toLowerCase() || u.username?.toLowerCase() === queryText.toLowerCase())
    );
    if (verifiedUser) {
      triggerInAppNotification(
        `🏆 عثرت على حساب موثق: ${verifiedUser.name}!`,
        `🏆 Found Verified Account: ${verifiedUser.name}!`,
        "achievement"
      );
    }
  };

  // Toggle pin in search history
  const togglePinHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthSound("tap");
    const updated = searchHistory.map((h, _autoIdx) => h.id === id ? { ...h, isPinned: !h.isPinned } : h);
    // Sort pinned items first
    updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    saveHistory(updated);
  };

  // Delete individual history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthSound("tap");
    const updated = searchHistory.filter((h) => h.id !== id);
    saveHistory(updated);
  };

  // Clear all history
  const clearAllHistory = () => {
    playSynthSound("tap");
    saveHistory([]);
    triggerInAppNotification("تم مسح سجل البحث بالكامل", "Search history cleared completely", "success");
  };

  // Voice Speech Search
  const startVoiceSearch = () => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerInAppNotification(
        "البحث الصوتي غير مدعوم في متصفحك",
        "Speech Recognition is not supported in your browser",
        "warning"
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isArabic ? "ar-SA" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      playSynthSound("error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setSearchQuery(transcript);
        triggerSearchExecute(transcript);
        playSynthSound("success");
      }
    };

    recognition.start();
  };

  // Image Search Analysis (via real server AI call)
  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSynthSound("tap");
    setIsAnalyzingImage(true);
    triggerInAppNotification("جاري تحليل الصورة بالذكاء الاصطناعي...", "Analyzing image with AI...", "system");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/ai/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String })
        });

        if (!res.ok) throw new Error("Image search endpoint failed");

        const data = await res.json();
        if (data && data.keywords && data.keywords.length > 0) {
          // Join keywords and execute
          const primaryKeyword = data.keywords[0];
          setSearchQuery(primaryKeyword);
          triggerSearchExecute(primaryKeyword);
          playSynthSound("success");
          triggerInAppNotification(
            `✨ العثور على: ${data.keywords.slice(0, 3).join(", ")}`,
            `✨ Found matches: ${data.keywords.slice(0, 3).join(", ")}`,
            "success"
          );
        } else {
          throw new Error("No keywords returned");
        }
      } catch (err: any) {
        console.error("AI Image analysis error:", err);
        playSynthSound("error");
        triggerInAppNotification("فشل تحليل الصورة. جرب أخرى.", "Failed to analyze image. Try another.", "warning");
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // QR Code Simulation Search
  const handleQRSearchExecute = () => {
    if (!qrSimulationInput.trim()) return;
    setIsScanningQR(false);
    setSearchQuery(qrSimulationInput);
    triggerSearchExecute(qrSimulationInput);
    setQrSimulationInput("");
    playSynthSound("success");
  };

  // Core Data Filtering (Strictly Real-time with Database Sync)
  const filteredUsers = allUsers.filter((u) => {
    // Respect Block settings
    if (currentUser?.blockedUsers?.includes(u.id)) return false;

    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;

    return (
      u.name?.toLowerCase().includes(queryLower) ||
      u.username?.toLowerCase().includes(queryLower) ||
      u.id?.toLowerCase() === queryLower ||
      u.role?.toLowerCase().includes(queryLower));

  });

  const filteredPosts = posts.filter((post) => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;

    // Check main text content
    const matchContent = post.content?.toLowerCase().includes(queryLower);

    // Check hashtags inside post
    const matchHashtags = post.content?.toLowerCase().includes(`#${queryLower}`) ||
    post.content?.includes("#") && queryLower.startsWith("#") && post.content.toLowerCase().includes(queryLower);

    // Check location
    const matchLocation = (post as any).location?.toLowerCase().includes(queryLower);

    return matchContent || matchHashtags || matchLocation;
  });

  const filteredReels = reels.filter((reel) => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;

    const matchCaption = reel.title?.toLowerCase().includes(queryLower);
    const matchAuthor = reel.author?.username?.toLowerCase().includes(queryLower) || reel.author?.name?.toLowerCase().includes(queryLower);
    const matchMusic = (reel as any).musicTitle?.toLowerCase().includes(queryLower) || (reel as any).musicArtist?.toLowerCase().includes(queryLower);

    return matchCaption || matchAuthor || matchMusic;
  });

  const filteredStories = stories.filter((story) => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;

    const matchEntity = story.entityName?.toLowerCase().includes(queryLower);
    const matchQuestion = story.question?.toLowerCase().includes(queryLower);
    const matchMusic = story.musicTitle?.toLowerCase().includes(queryLower) || story.musicArtist?.toLowerCase().includes(queryLower);

    return matchEntity || matchQuestion || matchMusic;
  });

  // Filter Group chats and Channel chats
  const filteredGroups = chats.filter((chat) => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;
    return chat.type === "group" && chat.name?.toLowerCase().includes(queryLower);
  });

  const filteredChannels = chats.filter((chat) => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return false;
    return chat.type === "channel" && chat.name?.toLowerCase().includes(queryLower);
  });

  // Hashtags occurrences count
  const matchingHashtags = (() => {
    const queryLower = searchQuery.toLowerCase().trim().replace("#", "");
    if (!queryLower) return [];

    const hashtagsMap: Record<string, {tag: string;count: number;}> = {};

    // Scan posts content for hashtags
    posts.forEach((p) => {
      const tags = p.content?.match(/#[a-zA-Z0-9_\u0621-\u064A]+/g);
      if (tags) {
        tags.forEach((tag) => {
          const cleanTag = tag.toLowerCase();
          if (cleanTag.includes(queryLower)) {
            if (!hashtagsMap[cleanTag]) {
              hashtagsMap[cleanTag] = { tag, count: 0 };
            }
            hashtagsMap[cleanTag].count += 1;
          }
        });
      }
    });

    return Object.values(hashtagsMap).sort((a, b) => b.count - a.count);
  })();

  // Locations search
  const matchingLocations = (() => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return [];

    const locationsSet = new Set<string>();
    posts.forEach((p: any) => {
      if (p.location && p.location.toLowerCase().includes(queryLower)) {
        locationsSet.add(p.location);
      }
    });
    return Array.from(locationsSet);
  })();

  // Music/Audio tracks search
  const matchingMusic = (() => {
    const queryLower = searchQuery.toLowerCase().trim();
    if (!queryLower) return [];

    const musicMap: Record<string, {title: string;artist: string;count: number;}> = {};
    reels.forEach((r) => {
      const rAny = r as any;
      if (rAny.musicTitle && (rAny.musicTitle.toLowerCase().includes(queryLower) || rAny.musicArtist?.toLowerCase().includes(queryLower))) {
        const key = `${rAny.musicTitle}-${rAny.musicArtist}`;
        if (!musicMap[key]) {
          musicMap[key] = { title: rAny.musicTitle, artist: rAny.musicArtist || "Unknown", count: 0 };
        }
        musicMap[key].count += 1;
      }
    });
    return Object.values(musicMap).sort((a, b) => b.count - a.count);
  })();

  // Follow User Handler
  const handleFollowUserInSearch = async (targetUser: UserType) => {
    if (!currentUser) return;
    playSynthSound("success");
    triggerHapticFeedback("tap");

    const targetUserId = (targetUser as any).id || (targetUser as any).uid || targetUser.username;
    const userRef = doc(db, "users", currentUser.uid || currentUser.id);
    const following = currentUser.following || [];
    const isFollowing = following.includes(targetUserId);

    try {
      if (isFollowing) {
        await updateDoc(userRef, { following: arrayRemove(targetUserId) });
        setCurrentUser({ ...currentUser, following: following.filter((id: string) => id !== targetUserId) });
        triggerInAppNotification(`تم إلغاء متابعة ${targetUser.name}`, `Unfollowed ${targetUser.name}`, "system");
      } else {
        await updateDoc(userRef, { following: arrayUnion(targetUserId) });
        setCurrentUser({ ...currentUser, following: [...following, targetUserId] });
        triggerInAppNotification(`أنت تتابع الآن ${targetUser.name}!`, `You are now following ${targetUser.name}!`, "success");
      }
    } catch (e) {
      console.error("Follow toggling failed in search:", e);
    }
  };

  // Like dynamic handling for post in search
  const handleLikePostInSearch = async (postId: string) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    const updated = posts.map((p, _autoIdx) => {
      if (p.id === postId) {
        const hasLiked = p.hasLiked;
        return {
          ...p,
          hasLiked: !hasLiked,
          likes: hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    });
    setPosts(updated);

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentLikes = postSnap.data().likes || 0;
        await updateDoc(postRef, {
          likes: updated.find((p) => p.id === postId)?.likes || currentLikes + 1
        });
      }
    } catch (e) {
      console.error("Failed to sync post like to Firestore", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white h-full relative" dir={isArabic ? "rtl" : "ltr"}>
      {/* Search Header and Interactive Bar */}
      <div className="p-4 bg-zinc-950/70 border-b border-zinc-900 sticky top-0 z-10 backdrop-blur-md">
        <div className="relative flex items-center gap-2">
          {/* Main Input */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-zinc-500 absolute ${isArabic ? "right-3.5" : "left-3.5"} top-3`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearchExecute(searchQuery)}
              placeholder={isArabic ? "ابحث عن أي شيء؛ مستخدمين، هاشتاقات، ريلز..." : "Search anything; users, hashtags, reels..."}
              className={`w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl ${isArabic ? "pr-10 pl-24" : "pl-10 pr-24"} py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FF3D00] focus:border-transparent transition-all`} />
            
            
            {/* Quick Actions inside Input Bar */}
            <div className={`absolute ${isArabic ? "left-2.5" : "right-2.5"} top-2 flex items-center gap-1.5`}>
              {searchQuery &&
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                
                  <X className="w-3.5 h-3.5" />
                </button>
              }
              <button
                onClick={startVoiceSearch}
                className={`p-1 rounded-lg transition-colors ${isListening ? "bg-red-600/30 text-red-500 animate-pulse" : "hover:bg-zinc-800 text-zinc-400 hover:text-white"}`}
                title={isArabic ? "بحث صوتي" : "Voice search"}>
                
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors ${isAnalyzingImage ? "animate-spin text-[#FF3D00]" : ""}`}
                title={isArabic ? "بحث بالصورة" : "Search by Image"}>
                
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSearch}
                accept="image/*"
                className="hidden" />
              
              <button
                onClick={() => setIsScanningQR(true)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title={isArabic ? "مسح كود QR" : "Scan QR Code"}>
                
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Voice Recording Pulse Overlay */}
        <AnimatePresence>
          {isListening &&
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2.5 bg-red-900/30 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
            
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-400">
                  {isArabic ? "جاري الاستماع لصوتك..." : "Listening to your voice..."}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar, _autoIdx) =>
              <span
                key={`voice_bar_${bar}_${_autoIdx}`}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 16 + 4}px`,
                  animationDelay: `${bar * 100}ms`
                }} />

              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* AI Autocomplete & Spelling Correction suggestions */}
        <AnimatePresence>
          {aiCorrection &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all"
            onClick={() => {
              setSearchQuery(aiCorrection);
              triggerSearchExecute(aiCorrection);
            }}>
            
              <div className="flex items-center gap-2 text-xs">
                <Sparkle className="w-4 h-4 text-amber-500 animate-bounce" />
                <span className="text-zinc-400">
                  {isArabic ? "هل تقصد:" : "Did you mean:"}
                </span>
                <span className="font-extrabold text-amber-400 underline">{aiCorrection}</span>
              </div>
              <CornerDownLeft className="w-3.5 h-3.5 text-zinc-500" />
            </motion.div>
          }
        </AnimatePresence>

        {/* Advanced Filters Navigation Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 shrink-0 scrollbar-none select-none">
          {[
          { id: "all", ar: "🔥 الكل", en: "🔥 All" },
          { id: "users", ar: "👥 الأعضاء", en: "👥 Members" },
          { id: "posts", ar: "📝 المنشورات", en: "📝 Posts" },
          { id: "reels", ar: "🎬 الريلز", en: "🎬 Reels" },
          { id: "stories", ar: "📖 القصص", en: "📖 Stories" },
          { id: "groups", ar: "⚔️ المجموعات", en: "⚔️ Groups" },
          { id: "channels", ar: "📢 القنوات", en: "📢 Channels" },
          { id: "hashtags", ar: "🏷️ الهاشتاقات", en: "🏷️ Tags" },
          { id: "locations", ar: "📍 المواقع", en: "📍 Locations" },
          { id: "music", ar: "🎵 الأغاني", en: "🎵 Tracks" }].
          map((cat, _autoIdx) =>
          <button
            key={`srch_cat_${cat.id}_${_autoIdx}`}
            onClick={() => {
              setSearchCategory(cat.id as any);
              playSynthSound("tap");
              triggerHapticFeedback("tap");
            }}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border ${
            searchCategory === cat.id ?
            "bg-[#FF3D00] border-[#FF3D00] text-white shadow-md shadow-[#FF3D00]/15" :
            "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"}`
            }>
            
              {isArabic ? cat.ar : cat.en}
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* LANDING VIEW: IF NO SEARCH QUERY ENTERED */}
        {!searchQuery &&
        <div className="space-y-6">
            {/* Sync search history block */}
            {searchHistory.length > 0 &&
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-500" />
                    {isArabic ? "سجل عمليات البحث الأخيرة" : "Recent Search Queries"}
                  </h3>
                  <button
                onClick={clearAllHistory}
                className="text-[10px] text-zinc-500 hover:text-red-500 flex items-center gap-1 font-bold transition-colors">
                
                    <Trash2 className="w-3 h-3" />
                    {isArabic ? "حذف الكل" : "Clear All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, _autoIdx) =>
              <div
                key={`${item.id}_${_autoIdx}`}
                onClick={() => {
                  setSearchQuery(item.query);
                  triggerSearchExecute(item.query);
                }}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-3 py-1.5 cursor-pointer text-xs transition-all group">
                
                      <Clock className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                      <span className="text-zinc-300 group-hover:text-white">{item.query}</span>
                      <button
                  onClick={(e) => togglePinHistory(item.id, e)}
                  className={`p-0.5 rounded hover:bg-zinc-700 transition-colors ${item.isPinned ? "text-[#FF3D00]" : "text-zinc-600 hover:text-zinc-400"}`}
                  title={isArabic ? "تثبيت" : "Pin search"}>
                  
                        <Pin className="w-3 h-3 transform rotate-45" />
                      </button>
                      <button
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="p-0.5 rounded hover:bg-zinc-700 text-zinc-600 hover:text-red-400 transition-colors">
                  
                        <X className="w-3 h-3" />
                      </button>
                    </div>
              )}
                </div>
              </div>
          }

            {/* AI Trending Recommendations */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 border border-zinc-900 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-red-500/10 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  {isArabic ? "اقتراحات الأوتاكو الذكية والتريند" : "Intelligent Otaku Trends"}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
              { tag: "#chainsawman", labelAr: "تشينسو مان (آرك الفيلم)", labelEn: "Chainsaw Man Movie", count: "4.1k" },
              { tag: "#attackontitan", labelAr: "هجوم العمالقة الأقوى", labelEn: "Attack on Titan Core", count: "3.2k" },
              { tag: "#onepiece", labelAr: "ون بيس الحلقة الأحدث", labelEn: "One Piece Weekly", count: "6.8k" },
              { tag: "#jujutsukaisen", labelAr: "جوجوتسو كايسن الفصل الأخير", labelEn: "Jujutsu Kaisen Final", count: "5.5k" }].
              map((item, _autoIdx) =>
              <div
                key={`trending_tag_${item.tag}_${_autoIdx}`}
                onClick={() => {
                  setSearchQuery(item.tag);
                  triggerSearchExecute(item.tag);
                }}
                className="flex justify-between items-center p-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5">
                
                    <div>
                      <span className="font-extrabold text-[#FF3D00] block">{item.tag}</span>
                      <span className="text-[10px] text-zinc-500">{isArabic ? item.labelAr : item.labelEn}</span>
                    </div>
                    <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-full text-zinc-400 font-mono font-bold">
                      {item.count} posts
                    </span>
                  </div>
              )}
              </div>
            </div>

            {/* Quick Discover Deck */}
            <div className="text-center py-10 text-zinc-600 flex flex-col items-center justify-center space-y-3">
              <Compass className="w-12 h-12 text-zinc-800 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-black text-zinc-400">{isArabic ? "استكشف محيط الأنمي الخاص بك" : "Explore Your Anime Universe"}</p>
                <p className="text-xs text-zinc-600">{isArabic ? "اكتب اسماً أو هاشتاقاً لتصنيف وبحث لحظي ذكي" : "Type a name or hashtag for intelligent, instant results"}</p>
              </div>
            </div>
          </div>
        }

        {/* SEARCH RESULTS VIEW: IF THERE IS A SEARCH QUERY */}
        {searchQuery &&
        <div className="space-y-6">
            
            {/* AI Assistant Suggestions Block */}
            {isAiLoading ?
          <div className="h-1 bg-zinc-900 overflow-hidden rounded-full">
                <div className="h-full bg-gradient-to-r from-[#FF3D00] via-purple-600 to-indigo-600 w-1/3 animate-infinite-scroll" />
              </div> :

          (aiSuggestions.length > 0 || aiRelated.length > 0) &&
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">
                      {isArabic ? "اقتراحات وبحوث ذات صلة" : "Related AI Autocomplete"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {aiSuggestions.map((s, i) =>
              <button
                key={`ai_sugg_${s}_${i}`}
                onClick={() => {
                  setSearchQuery(s);
                  triggerSearchExecute(s);
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-400 hover:text-white font-medium transition-all">
                
                        🔍 {s}
                      </button>
              )}
                    {aiRelated.map((r, i) =>
              <button
                key={`ai_rel_${r}_${i}`}
                onClick={() => {
                  setSearchQuery(r);
                  triggerSearchExecute(r);
                }}
                className="bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 rounded-xl px-3 py-1.5 text-purple-300 hover:text-white transition-all">
                
                        ✨ {r}
                      </button>
              )}
                  </div>
                </div>

          }

            {/* SECTION 1: USERS */}
            {(searchCategory === "all" || searchCategory === "users") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>👥 {isArabic ? "المستخدمون والأعضاء" : "Members & Creators"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredUsers.length}</span>
                </h3>
                {filteredUsers.length === 0 ?
            searchCategory === "users" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد حسابات مطابقة للبحث" : "No matching profiles found"}
                    </div> :


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredUsers.slice(0, searchCategory === "all" ? 3 : visibleCount).map((user, uIdx) =>
              <div
                key={user.id ? `srch_user_${user.id}_${uIdx}` : `srch_user_${uIdx}`}
                className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-all group">
                
                        <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setViewedUserId(user.id)}>
                  
                          <div className="relative">
                            <img src={user.avatar} className="w-11 h-11 rounded-full object-cover border border-zinc-800" />
                            {user.isOnline &&
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
                    }
                          </div>
                            <div className="min-w-0">
                            <div className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover:text-[#FF3D00] transition-colors">
                              {user.name}
                              {user.isVerified &&
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                      }
                            </div>
                            <div className="text-zinc-500 text-xs truncate">@{user.username}</div>
                            {user.bio &&
                    <div className="text-zinc-400 text-[10px] mt-1 line-clamp-1 italic">{user.bio}</div>
                    }
                            </div>
                        </div>

                        {/* Follow & Action controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                    onClick={() => handleFollowUserInSearch(user)}
                    className={`p-2 rounded-xl text-xs transition-all ${
                    (currentUser?.following || []).includes(user.id) ?
                    "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white" :
                    "bg-[#FF3D00] hover:bg-red-600 text-white font-extrabold shadow-sm"}`
                    }>
                    
                            {(currentUser?.following || []).includes(user.id) ?
                    <UserCheck className="w-3.5 h-3.5" /> :

                    <UserPlus className="w-3.5 h-3.5" />
                    }
                          </button>
                          <button
                    onClick={() => {
                      playSynthSound("tap");
                      setActiveTab("chat");
                    }}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                    title={isArabic ? "مراسلة" : "Message"}>
                    
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
              )}
                    {searchCategory === "all" && filteredUsers.length > 3 &&
              <button
                onClick={() => setSearchCategory("users")}
                className="col-span-full py-2 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
                
                        {isArabic ? "عرض المزيد من المستخدمين" : "View more members"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
              }
                  </div>
            }
              </div>
          }

            {/* SECTION 2: POSTS */}
            {(searchCategory === "all" || searchCategory === "posts") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>📝 {isArabic ? "المنشورات والأخبار" : "Posts & Feed"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredPosts.length}</span>
                </h3>
                {filteredPosts.length === 0 ?
            searchCategory === "posts" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد منشورات مطابقة للبحث" : "No matching posts found"}
                    </div> :


            <div className="space-y-3">
                    {filteredPosts.slice(0, searchCategory === "all" ? 3 : visibleCount).map((post, pIdx) =>
              <div
                key={post.id ? `srch_post_${post.id}_${pIdx}` : `srch_post_${pIdx}`}
                className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3 hover:border-zinc-850 transition-all">
                
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img src={post.author?.avatar} className="w-9 h-9 rounded-full object-cover border border-zinc-850" />
                            <div>
                              <div className="font-extrabold text-xs text-white flex items-center gap-1">
                                {post.author?.name}
                                {post.author?.isVerified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                              </div>
                              <div className="text-zinc-500 text-[10px]">@{post.author?.username}</div>
                            </div>
                          </div>
                          {post.createdAt && (
                            <div 
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono"
                              title={formatFriendlyDate(post.createdAt, isArabic).fullDateTime}
                            >
                              <Clock className="w-2.5 h-2.5 text-zinc-500" />
                              <span>{formatFriendlyDate(post.createdAt, isArabic).displayDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Content text */}
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {/* Media image if exists */}
                        {post.image &&
                <div className="rounded-xl overflow-hidden border border-zinc-900 max-h-56 bg-zinc-950">
                            <img src={post.image} className="w-full h-full object-cover" />
                          </div>
                }

                        {/* Footer Interactions */}
                        <div className="flex items-center gap-4 pt-2 text-[11px] text-zinc-500 border-t border-zinc-900/60">
                          <button
                    onClick={() => handleLikePostInSearch(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${post.hasLiked ? "text-red-500" : "hover:text-white"}`}>
                    
                            <Heart className={`w-4 h-4 ${post.hasLiked ? "fill-red-500" : ""}`} />
                            <span>{post.likes}</span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
              )}
                    {searchCategory === "all" && filteredPosts.length > 3 &&
              <button
                onClick={() => setSearchCategory("posts")}
                className="w-full py-2 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
                
                        {isArabic ? "عرض المزيد من المنشورات" : "View more posts"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
              }
                  </div>
            }
              </div>
          }

            {/* SECTION 3: REELS */}
            {(searchCategory === "all" || searchCategory === "reels") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>🎬 {isArabic ? "ريلز ومقاطع فيديو" : "Reels & Shorts"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredReels.length}</span>
                </h3>
                {filteredReels.length === 0 ?
            searchCategory === "reels" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد مقاطع ريلز مطابقة" : "No matching reels found"}
                    </div> :


            <div className="grid grid-cols-2 gap-3">
                    {filteredReels.slice(0, searchCategory === "all" ? 2 : visibleCount).map((reel, rIdx) =>
              <div
                key={reel.id ? `srch_reel_${reel.id}_${rIdx}` : `srch_reel_${rIdx}`}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden relative group aspect-[9/14]">
                
                        {/* Dynamic colorful placeholder simulator */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-red-950/30 to-black/80" />
                        
                        <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
                          {/* Top row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <img src={reel.author?.avatar} className="w-6 h-6 rounded-full object-cover border border-zinc-700" />
                              <span className="text-[9px] font-bold text-white shadow-md truncate max-w-20">@{reel.author?.username}</span>
                            </div>
                            <span className="text-[8px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">LIVE</span>
                          </div>

                          {/* Middle play visual */}
                          <div className="self-center p-3 rounded-full bg-black/60 border border-zinc-800 cursor-pointer hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 text-[#FF3D00] fill-[#FF3D00] translate-x-0.5" />
                          </div>

                          {/* Bottom info */}
                          <div className="space-y-1">
                            <p className="text-[10px] text-zinc-200 line-clamp-2 drop-shadow-md">{reel.title}</p>
                            {(reel as any).musicTitle &&
                    <div className="flex items-center gap-1 text-[8px] text-zinc-400">
                                <Music className="w-2.5 h-2.5 shrink-0 text-red-500 animate-pulse" />
                                <span className="truncate">{(reel as any).musicTitle} - {(reel as any).musicArtist}</span>
                              </div>
                    }
                          </div>
                        </div>
                      </div>
              )}
                    {searchCategory === "all" && filteredReels.length > 2 &&
              <button
                onClick={() => setSearchCategory("reels")}
                className="col-span-full py-2 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
                
                        {isArabic ? "عرض المزيد من مقاطع الريلز" : "View more reels"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
              }
                  </div>
            }
              </div>
          }

            {/* SECTION 4: STORIES */}
            {(searchCategory === "all" || searchCategory === "stories") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>📖 {isArabic ? "قصص الأوتوكو النشطة" : "Active Otaku Stories"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredStories.length}</span>
                </h3>
                {filteredStories.length === 0 ?
            searchCategory === "stories" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد قصص مطابقة" : "No matching stories found"}
                    </div> :


            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {filteredStories.slice(0, searchCategory === "all" ? 6 : visibleCount).map((story, sIdx) =>
              <div
                key={story.id ? `srch_story_${story.id}_${sIdx}` : `srch_story_${sIdx}`}
                className="w-24 h-36 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between p-2 shrink-0 relative overflow-hidden group cursor-pointer">
                
                        {/* Ring border */}
                        <div className="absolute inset-0 border-2 border-[#FF3D00] rounded-2xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                        <img src={story.author?.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120"} className="w-7 h-7 rounded-full object-cover border border-[#FF3D00] relative z-10" />
                        <div className="relative z-10 text-center">
                          <span className="text-[9px] font-black text-white block truncate">{story.entityName || "Otaku"}</span>
                        </div>
                      </div>
              )}
                  </div>
            }
              </div>
          }

            {/* SECTION 5: GROUPS */}
            {(searchCategory === "all" || searchCategory === "groups") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>⚔️ {isArabic ? "النقابات والمجموعات" : "Guilds & Otaku Clans"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredGroups.length}</span>
                </h3>
                {filteredGroups.length === 0 ?
            searchCategory === "groups" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد مجموعات أو نقابات تطابق البحث" : "No matching groups found"}
                    </div> :


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredGroups.map((group, gIdx) =>
              <div
                key={group.id ? `srch_grp_${group.id}_${gIdx}` : `srch_grp_${gIdx}`}
                className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-850 transition-all">
                
                        <div className="flex items-center gap-3">
                          <img src={group.avatar || "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150"} className="w-10 h-10 rounded-xl object-cover border border-zinc-800" />
                          <div>
                            <div className="font-extrabold text-xs text-white">{group.name}</div>
                            <div className="text-zinc-500 text-[10px] flex items-center gap-1.5 mt-0.5">
                              <Users className="w-3 h-3 text-zinc-600" />
                              <span>{group.messages?.length || 12} members</span>
                            </div>
                          </div>
                        </div>
                        <button
                  onClick={() => {
                    playSynthSound("success");
                    triggerInAppNotification(`انضممت إلى مجموعة ${group.name}!`, `Joined group ${group.name}!`, "success");
                  }}
                  className="px-3 py-1.5 bg-[#FF3D00]/10 border border-[#FF3D00]/20 hover:bg-[#FF3D00] text-white hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all">
                  
                          {isArabic ? "انضمام" : "Join"}
                        </button>
                      </div>
              )}
                  </div>
            }
              </div>
          }

            {/* SECTION 6: CHANNELS */}
            {(searchCategory === "all" || searchCategory === "channels") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>📢 {isArabic ? "القنوات الإخبارية وبث الأنمي" : "News & Anime Channels"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{filteredChannels.length}</span>
                </h3>
                {filteredChannels.length === 0 ?
            searchCategory === "channels" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد قنوات مطابقة للبحث" : "No matching channels found"}
                    </div> :


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredChannels.map((chan, cIdx) =>
              <div
                key={chan.id ? `srch_chan_${chan.id}_${cIdx}` : `srch_chan_${cIdx}`}
                className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-850 transition-all">
                
                        <div className="flex items-center gap-3">
                          <img src={chan.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150"} className="w-10 h-10 rounded-xl object-cover border border-zinc-800" />
                          <div>
                            <div className="font-extrabold text-xs text-white">{chan.name}</div>
                            <div className="text-zinc-500 text-[10px] flex items-center gap-1.5 mt-0.5">
                              <Radio className="w-3 h-3 text-[#FF3D00]" />
                              <span>Subscribers feed active</span>
                            </div>
                          </div>
                        </div>
                        <button
                  onClick={() => {
                    playSynthSound("success");
                    triggerInAppNotification(`اشتركت في قناة ${chan.name}!`, `Subscribed to channel ${chan.name}!`, "success");
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/10">
                  
                          {isArabic ? "اشتراك" : "Subscribe"}
                        </button>
                      </div>
              )}
                  </div>
            }
              </div>
          }

            {/* SECTION 7: HASHTAGS */}
            {(searchCategory === "all" || searchCategory === "hashtags") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>🏷️ {isArabic ? "الهاشتاقات والوسوم المتطابقة" : "Matching Hashtags"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{matchingHashtags.length}</span>
                </h3>
                {matchingHashtags.length === 0 ?
            searchCategory === "hashtags" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد هاشتاقات مطابقة للبحث" : "No matching hashtags found"}
                    </div> :


            <div className="flex flex-wrap gap-2">
                    {matchingHashtags.map((item, idx) =>
              <button
                key={`hashtag_${item.tag}_${idx}`}
                onClick={() => {
                  setSearchQuery(item.tag);
                  triggerSearchExecute(item.tag);
                }}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl px-3 py-2 text-xs flex items-center gap-2 hover:border-zinc-700 transition-all group">
                
                        <span className="font-extrabold text-[#FF3D00] group-hover:scale-105 transition-transform">#</span>
                        <span className="text-zinc-200 group-hover:text-white">{item.tag.replace("#", "")}</span>
                        <span className="text-[9px] bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded text-zinc-500 font-mono font-bold">
                          {item.count}
                        </span>
                      </button>
              )}
                  </div>
            }
              </div>
          }

            {/* SECTION 8: LOCATIONS */}
            {(searchCategory === "all" || searchCategory === "locations") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>📍 {isArabic ? "البحث بالمواقع الجغرافية" : "Geographic Locations"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{matchingLocations.length}</span>
                </h3>
                {matchingLocations.length === 0 ?
            searchCategory === "locations" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد مواقع مسجلة مطابقة للبحث" : "No matching locations found"}
                    </div> :


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchingLocations.map((loc, idx) =>
              <div
                key={`location_${loc}_${idx}`}
                onClick={() => {
                  setSearchQuery(loc);
                  triggerSearchExecute(loc);
                }}
                className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-zinc-700 transition-all group">
                
                        <div className="p-2 bg-red-600/10 rounded-xl group-hover:bg-red-600/20 transition-colors">
                          <MapPin className="w-4 h-4 text-[#FF3D00]" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-white group-hover:text-[#FF3D00] transition-colors">{loc}</div>
                          <div className="text-zinc-500 text-[10px]">Otaku activities recorded in this zone</div>
                        </div>
                      </div>
              )}
                  </div>
            }
              </div>
          }

            {/* SECTION 9: MUSIC */}
            {(searchCategory === "all" || searchCategory === "music") &&
          <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex justify-between items-center">
                  <span>🎵 {isArabic ? "البحث بالأغاني والصوتيات" : "Soundtracks & Audio"}</span>
                  <span className="text-[10px] text-[#FF3D00]">{matchingMusic.length}</span>
                </h3>
                {matchingMusic.length === 0 ?
            searchCategory === "music" &&
            <div className="text-center py-6 text-zinc-600 text-xs">
                      {isArabic ? "لا توجد صوتيات مطابقة للبحث" : "No matching soundtracks found"}
                    </div> :


            <div className="space-y-2">
                    {matchingMusic.map((item, idx) =>
              <div
                key={`music_${item.title}_${idx}`}
                onClick={() => {
                  setSearchQuery(item.title);
                  triggerSearchExecute(item.title);
                }}
                className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-zinc-800 transition-all group">
                
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600/10 rounded-xl group-hover:bg-purple-600/20 transition-colors">
                            <Music className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-white group-hover:text-purple-400 transition-colors">{item.title}</div>
                            <div className="text-zinc-500 text-[10px]">{item.artist}</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-400">
                          {item.count} reels
                        </span>
                      </div>
              )}
                  </div>
            }
              </div>
          }

            {/* Lazy Loading / Load More Trigger */}
            {searchCategory !== "all" && visibleCount < 100 &&
          <div className="pt-4 text-center">
                <button
              onClick={() => {
                playSynthSound("tap");
                setVisibleCount((prev) => prev + 10);
              }}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 text-xs font-bold rounded-xl transition-colors">
              
                  {isArabic ? "تحميل المزيد من النتائج" : "Load more results"}
                </button>
              </div>
          }
          </div>
        }
      </div>

      {/* QR Scanner Overlay Dialog */}
      <AnimatePresence>
        {isScanningQR &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          
            <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full text-center space-y-4">
            
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  {isArabic ? "مسح كود QR الأوتوكو" : "Scan Otaku QR Code"}
                </h4>
                <button onClick={() => setIsScanningQR(false)} className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* QR Scan Target Frame simulator */}
              <div className="w-44 h-44 border-2 border-dashed border-[#FF3D00] mx-auto rounded-xl flex items-center justify-center relative overflow-hidden bg-zinc-900">
                <QrCode className="w-20 h-20 text-zinc-800 animate-pulse" />
                {/* Scanner laser line */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-md shadow-red-500 top-0 animate-bounce" />
              </div>

              <div className="space-y-3">
                <p className="text-[11px] text-zinc-500">
                  {isArabic ? "أدخل معرف QR (مُعرّف العميل أو رمز منشور) للمحاكاة الفورية الدقيقة:" : "Enter simulation QR payload (username or ID) to mock scanning instantly:"}
                </p>
                <input
                type="text"
                value={qrSimulationInput}
                onChange={(e) => setQrSimulationInput(e.target.value)}
                placeholder={isArabic ? "أدخل المعرف مثلاً: s_admin أو ken_uchiha" : "Enter payload e.g. s_admin or ken_uchiha"}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-[#FF3D00]" />
              
                <button
                onClick={handleQRSearchExecute}
                className="w-full py-2 bg-[#FF3D00] hover:bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-red-600/10">
                
                  {isArabic ? "فك التشفير والمطابقة" : "Decode & Match"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}