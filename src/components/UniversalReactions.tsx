import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
  writeBatch } from
"firebase/firestore";
import { db, auth } from "../firebase";
import { handleFirestoreError, OperationType } from "../firestoreUtils";
import {
  Heart,
  ThumbsUp,
  Smile,
  Search,
  X,
  Award,
  User as UserIcon,
  Flame,
  Volume2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Zap,
  Calendar } from
"lucide-react";

export const REACTION_TYPES = [
{ type: "👍", labelAr: "إعجاب", labelEn: "Like", emoji: "👍", animation: "bounce" },
{ type: "❤️", labelAr: "حب", labelEn: "Love", emoji: "❤️", animation: "heartbeat" },
{ type: "😂", labelAr: "ضحك", labelEn: "Laugh", emoji: "😂", animation: "jump" },
{ type: "🤣", labelAr: "ضحك شديد", labelEn: "ROFL", emoji: "🤣", animation: "roll" },
{ type: "😍", labelAr: "انبهار", labelEn: "Wow", emoji: "😍", animation: "heartEyes" },
{ type: "😮", labelAr: "مفاجأة", labelEn: "Surprise", emoji: "😮", animation: "pop" },
{ type: "😱", labelAr: "صدمة", labelEn: "Shock", emoji: "😱", animation: "shake" },
{ type: "😢", labelAr: "حزن", labelEn: "Sad", emoji: "😢", animation: "tear" },
{ type: "💔", labelAr: "قلب مكسور", labelEn: "Broken Heart", emoji: "💔", animation: "break" },
{ type: "😡", labelAr: "غضب", labelEn: "Angry", emoji: "😡", animation: "redShake" },
{ type: "👏", labelAr: "تصفيق", labelEn: "Clap", emoji: "👏", animation: "clap" },
{ type: "🔥", labelAr: "رهيب", labelEn: "Fire", emoji: "🔥", animation: "fire" },
{ type: "💯", labelAr: "ممتاز", labelEn: "100", emoji: "💯", animation: "spin" },
{ type: "🤯", labelAr: "عقل انفجر", labelEn: "Mind Blown", emoji: "🤯", animation: "explode" },
{ type: "🥶", labelAr: "رهيب جدًا", labelEn: "Cold", emoji: "🥶", animation: "freeze" },
{ type: "🥹", labelAr: "مؤثر", labelEn: "Pleading", emoji: "🥹", animation: "waterEyes" },
{ type: "😭", labelAr: "بكاء", labelEn: "Cry", emoji: "😭", animation: "heavyTear" },
{ type: "🤔", labelAr: "تفكير", labelEn: "Think", emoji: "🤔", animation: "ponder" },
{ type: "😴", labelAr: "ممل", labelEn: "Bored", emoji: "😴", animation: "sleep" },
{ type: "⚡", labelAr: "أسطوري", labelEn: "Lightning", emoji: "⚡", animation: "spark" },
{ type: "⭐", labelAr: "مفضل", labelEn: "Star", emoji: "⭐", animation: "starSpin" }];


export const QUICK_RESPONSES = [
{ textAr: "رائع!", textEn: "Amazing!", emoji: "✨" },
{ textAr: "أتفق!", textEn: "Agree!", emoji: "🤝" },
{ textAr: "شكراً للمشاركة", textEn: "Thanks!", emoji: "🙏" }];


// Sound utility for premium reaction experience
const playReactionSound = (type: string) => {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    if (type === "spark") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "burst") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // standard tap
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {

    // browser might block audio context before user interaction
  }};

// Vibration support
const triggerHaptic = (type: "light" | "medium" | "heavy") => {
  if (navigator.vibrate) {
    if (type === "light") navigator.vibrate(10);else
    if (type === "medium") navigator.vibrate(25);else
    navigator.vibrate(55);
  }
};

interface UniversalReactionsProps {
  targetId: string;
  targetType: string; // "post" | "comment" | "reply" | "article" | "news" | "reel" | "story" | "user" | "anime" | "manga" | "character" | "studio" | "event" | "group" | "channel" | "guild" | "space" | "card" | "marketplace"
  currentUser: any;
  setCurrentUser?: React.Dispatch<React.SetStateAction<any>>;
  isArabic: boolean;
  authorId?: string; // ID of the creator of the target (to trigger notifications / award XP)
  className?: string;
  triggerInAppNotification?: (title: string, body: string, icon?: string) => void;
  onOpenProfile?: (userId: string) => void;
  // Privacy settings override
  allowReactions?: boolean;
  showCounters?: boolean;
  allowedReactionTypes?: string[]; // If restricted
}

interface ReactionDoc {
  id: string;
  reactionType: string;
  userId: string;
  userDisplayName: string;
  userUsername: string;
  userAvatar: string;
  userFrame?: string;
  userRole?: string;
  isVerified?: boolean;
  targetId: string;
  targetType: string;
  createdAt: any;
}

export const UniversalReactions: React.FC<UniversalReactionsProps> = ({
  targetId,
  targetType,
  currentUser,
  setCurrentUser,
  isArabic,
  authorId,
  className = "",
  triggerInAppNotification,
  onOpenProfile,
  allowReactions = true,
  showCounters = true,
  allowedReactionTypes
}) => {
  const [reactions, setReactions] = useState<ReactionDoc[]>([]);
  const [showBar, setShowBar] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [flyingEmojis, setFlyingEmojis] = useState<{id: string;char: string;x: number;y: number;}[]>([]);
  const [showBurst, setShowBurst] = useState(false);
  const [burstChar, setBurstChar] = useState("");

  const barRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const longPressedRef = useRef(false);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchActiveRef = useRef(false);

  // Clean up all active timers on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, []);

  const handleMouseEnterWidget = () => {
    // Prevent closing when mouse enters any area of the widget
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    // Only auto-open on desktop hover, touch devices should rely on long press
    if (!showBar && !isTouchActiveRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        setShowBar(true);
        triggerHaptic("light");
      }, 350); // Comfortable hover delay
    }
  };

  const handleMouseLeaveWidget = () => {
    // Clear any pending open timers
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    setHoveredIndex(null);

    // Provide a generous delay to allow the cursor to move between the button and the bar
    if (showBar) {
      closeTimerRef.current = setTimeout(() => {
        setShowBar(false);
      }, 500); // 500ms is standard, comfortable, and highly forgiving
    }
  };

  const triggerOpenProfile = (uid: string) => {
    if (onOpenProfile) {
      onOpenProfile(uid);
    } else {
      window.dispatchEvent(new CustomEvent('openProfile', { detail: uid }));
    }
  };

  // Real-time listener for this target's reactions
  useEffect(() => {
    if (!targetId) return;
    const q = query(collection(db, "reactions"), where("targetId", "==", targetId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ReactionDoc[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ReactionDoc);
      });
      setReactions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `reactions/${targetId}`);
    });

    return () => unsubscribe();
  }, [targetId]);

  // Current user's existing reaction
  const userReaction = reactions.find((r) => r.userId === currentUser?.uid || r.userId === currentUser?.username);

  // Get aggregated reaction counts
  const reactionCounts: {[type: string]: number;} = {};
  reactions.forEach((r) => {
    reactionCounts[r.reactionType] = (reactionCounts[r.reactionType] || 0) + 1;
  });

  const totalReactionsCount = reactions.length;

  // Sort reaction types by usage frequency to get top 3
  const topReactions = Object.entries(reactionCounts).
  sort((a, b) => b[1] - a[1]).
  slice(0, 3).
  map((entry, _autoIdx) => entry[0]);

  // Allowed list of reactions
  const filteredReactionsList = REACTION_TYPES.filter((r) => {
    if (allowedReactionTypes && allowedReactionTypes.length > 0) {
      return allowedReactionTypes.includes(r.type);
    }
    return true;
  });

  // Handle adding or replacing a reaction
  const handleSelectReaction = async (typeStr: string) => {
    if (!currentUser) {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تنبيه" : "Alert",
          isArabic ? "يرجى تسجيل الدخول للتفاعل!" : "Please login to react!",
          "🔒"
        );
      }
      return;
    }

    setShowBar(false);
    playReactionSound("burst");
    triggerHaptic("medium");

    // Resolve quick reaction text to standard emoji for burst & particle effects
    const quickMatch = QUICK_RESPONSES.find((qr) => qr.textAr === typeStr || qr.textEn === typeStr);
    const animChar = quickMatch ? quickMatch.emoji : typeStr;

    // Burst Animation
    setBurstChar(animChar);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 1200);

    // Save last used reaction in LocalStorage (only if it is a single emoji, i.e., length is small)
    if (typeStr.length <= 4) {
      localStorage.setItem(`last_reaction_${currentUser.uid || currentUser.username}`, typeStr);
    }

    // Trigger Flying Emojis
    const newFlying = Array.from({ length: 6 }).map((_, i) => ({
      id: `${Date.now()}_${i}_${Math.random()}`,
      char: animChar,
      x: (Math.random() - 0.5) * 80,
      y: -50 - Math.random() * 100
    }));
    setFlyingEmojis((prev) => [...prev, ...newFlying]);
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((f) => !newFlying.find((nf) => nf.id === f.id)));
    }, 1500);

    const uid = currentUser.uid || currentUser.username;
    const reactionId = `${uid}_${targetId}`;

    try {
      const isNew = !userReaction;
      const isReplacement = userReaction && userReaction.reactionType !== typeStr;

      if (isNew || isReplacement) {
        const payload = {
          reactionType: typeStr,
          userId: uid,
          userDisplayName: currentUser.name || currentUser.username || "Otaku Black",
          userUsername: currentUser.username || "otaku",
          userAvatar: currentUser.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150",
          userFrame: currentUser.frame || currentUser.avatarFrame || "",
          userRole: currentUser.role || "Rookie",
          isVerified: currentUser.isVerified || false,
          targetId: targetId,
          targetType: targetType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Save in Firestore
        await setDoc(doc(db, "reactions", reactionId), payload);

        // Notify creator if it's someone else
        if (isNew && authorId && authorId !== uid) {
          // Add notification in Firestore
          const notifId = `notif_${Date.now()}`;
          const notifPayload = {
            userId: authorId,
            type: "like",
            text: isArabic ?
            `تفاعل ${currentUser.name || currentUser.username} بـ ${typeStr} مع ${targetType === "post" ? "منشورك" : "تعليقك"}.` :
            `${currentUser.name || currentUser.username} reacted with ${typeStr} to your ${targetType}.`,
            read: false,
            createdAt: serverTimestamp()
          };
          await setDoc(doc(db, "notifications", notifId), notifPayload);

          // Award creator Reputation / XP
          const authorRef = doc(db, "users", authorId);
          getDoc(authorRef).then((snap) => {
            if (snap.exists()) {
              updateDoc(authorRef, {
                xp: increment(5),
                reputation: increment(1)
              }).catch(() => {});
            }
          }).catch(() => {});
        }

        // Award current user XP for engaging (+2 XP)
        if (isNew && setCurrentUser) {
          setCurrentUser((prev: any) => {
            if (!prev) return prev;
            const nextXp = (prev.xp || 0) + 2;
            const nextLvl = Math.floor(nextXp / 1000) + 1;
            const leveledUp = nextLvl > (prev.level || 1);
            return {
              ...prev,
              xp: nextXp,
              level: nextLvl
            };
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `reactions/${reactionId}`);
    }
  };

  // Handle single tap (applies last used reaction or default)
  const handleSingleTap = () => {
    if (!allowReactions) return;

    // If a long press was just triggered, swallow this click and reset the flag
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }

    if (showBar) {
      setShowBar(false);
      return;
    }

    if (userReaction) {
      // Remove reaction if already added
      const uid = currentUser?.uid || currentUser?.username;
      const reactionId = `${uid}_${targetId}`;
      deleteDoc(doc(db, "reactions", reactionId)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `reactions/${reactionId}`);
      });
      triggerHaptic("light");
      playReactionSound("tap");
    } else {
      // Add last reaction or 👍
      const lastReaction = localStorage.getItem(`last_reaction_${currentUser?.uid || currentUser?.username}`) || "❤️";
      handleSelectReaction(lastReaction);
    }
  };

  // Handle quick response click directly (toggle if clicked active, set active otherwise)
  const handleQuickResponseClick = async (responseText: string) => {
    if (!currentUser) {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تنبيه" : "Alert",
          isArabic ? "يرجى تسجيل الدخول للتفاعل!" : "Please login to react!",
          "🔒"
        );
      }
      return;
    }

    if (userReaction && userReaction.reactionType === responseText) {
      // Remove reaction if already added
      const uid = currentUser?.uid || currentUser?.username;
      const reactionId = `${uid}_${targetId}`;
      try {
        await deleteDoc(doc(db, "reactions", reactionId));
        triggerHaptic("light");
        playReactionSound("tap");
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `reactions/${reactionId}`);
      }
    } else {
      // Select the response text as reaction
      handleSelectReaction(responseText);
    }
  };

  // Long press detection for Touch and Mouse
  const startPressTimer = (e: any) => {
    if (!allowReactions) return;
    // Check if right click
    if (e.button === 2) return;

    if (e.type && e.type.startsWith("touch")) {
      isTouchActiveRef.current = true;
    }

    isDraggingRef.current = false;
    longPressedRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      setShowBar(true);
      longPressedRef.current = true;
      triggerHaptic("medium");
      playReactionSound("spark");
    }, 450); // 450ms long press duration
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Drag and touch tracking for slides over floating bar
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!showBar || !barRef.current) return;
    isTouchActiveRef.current = true;
    isDraggingRef.current = true;
    const touch = e.touches[0];
    const rect = barRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Is the user hovering within vertical bounds of the bar
    if (touchY >= rect.top - 60 && touchY <= rect.bottom + 60) {
      if (touchX >= rect.left && touchX <= rect.right) {
        const relativeX = touchX - rect.left;
        const index = Math.floor(relativeX / (rect.width / filteredReactionsList.length));
        if (index >= 0 && index < filteredReactionsList.length) {
          if (hoveredIndex !== index) {
            setHoveredIndex(index);
            triggerHaptic("light");
            playReactionSound("tap");
          }
        }
      } else {
        setHoveredIndex(null);
      }
    } else {
      setHoveredIndex(null);
    }
  };

  const handleTouchEnd = () => {
    cancelPressTimer();
    if (showBar) {
      // If the user actually slid onto an emoji and released, select it
      if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < filteredReactionsList.length) {
        handleSelectReaction(filteredReactionsList[hoveredIndex].type);
      } else {


        // If they released their finger on the button or in transition, DO NOT CLOSE the bar.
        // This prevents the bar from vanishing due to natural finger tremor/slight dragging on release!
      }setHoveredIndex(null);}

    // Smoothly reset touch state after a delay
    setTimeout(() => {
      isTouchActiveRef.current = false;
    }, 800);
  };

  // Generate CSS animations based on custom preset
  const getEmojiAnimClass = (animType: string, isHovered: boolean) => {
    if (!isHovered) return "transition-all duration-300 scale-100";

    switch (animType) {
      case "bounce":
        return "animate-bounce scale-150 duration-200";
      case "heartbeat":
        return "animate-pulse scale-150 duration-150";
      case "jump":
        return "translate-y-[-12px] scale-150 duration-200 rotate-12";
      case "roll":
        return "rotate-45 scale-150 duration-200";
      case "heartEyes":
        return "scale-150 duration-200 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
      case "pop":
        return "scale-175 duration-100";
      case "shake":
        return "scale-150 animate-ping duration-300";
      case "tear":
        return "translate-y-[4px] scale-150 duration-300";
      case "break":
        return "scale-150 duration-200 -rotate-12";
      case "redShake":
        return "scale-150 border-red-500 border rounded-full duration-150";
      case "clap":
        return "scale-150 -translate-x-[4px] rotate-12 duration-150";
      case "fire":
        return "scale-150 translate-y-[-8px] duration-200 shadow-[0_0_20px_rgba(249,115,22,0.6)]";
      case "spin":
        return "scale-150 rotate-[360deg] duration-300";
      case "explode":
        return "scale-160 translate-y-[-4px] duration-200";
      case "freeze":
        return "scale-150 text-blue-300 duration-200";
      case "waterEyes":
        return "scale-150 duration-200";
      case "heavyTear":
        return "scale-150 duration-200 translate-y-[8px]";
      case "ponder":
        return "scale-150 -rotate-[15deg] duration-200";
      case "sleep":
        return "scale-150 translate-y-[2px] opacity-80 duration-500";
      case "spark":
        return "scale-150 shadow-[0_0_25px_rgba(234,179,8,0.8)] duration-200";
      case "starSpin":
        return "scale-150 rotate-[180deg] duration-200 text-yellow-400";
      default:
        return "scale-150 duration-200";
    }
  };

  // Filter list of reacted people
  const filteredUsers = reactions.filter((r) => {
    const matchesSearch =
    r.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userUsername.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeFilterTab === "all" || r.reactionType === activeFilterTab;
    return matchesSearch && matchesTab;
  });

  // Unique types of reactions received on this target for tabs in details modal
  const existingReactionTabs: string[] = ["all", ...(Array.from(new Set(reactions.map((r, _autoIdx) => r.reactionType))) as string[])];

  return (
    <div
      onMouseEnter={handleMouseEnterWidget}
      onMouseLeave={handleMouseLeaveWidget}
      className={`relative inline-flex items-center gap-2 select-none ${className}`}>
      
      
      {/* Flying Emojis Particles */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {flyingEmojis.map((f, _autoIdx) =>
        <motion.div
          key={`${f.id}_${_autoIdx}`}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.8,
            x: f.x,
            y: f.y,
            rotate: f.x * 2
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute text-lg"
          style={{ left: "15px", bottom: "25px" }}>
          
            {f.char}
          </motion.div>
        )}
      </div>

      {/* Burst Celebration (Success Burst Effect) */}
      <AnimatePresence>
        {showBurst &&
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.4, 2, 2.5] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "backOut" }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex items-center justify-center">
          
            <div className="relative">
              {/* Central Emoji */}
              <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
                {burstChar}
              </span>
              {/* Colorful particles radiating */}
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30 * Math.PI / 180;
                const distance = 45;
                const px = Math.cos(angle) * distance;
                const py = Math.sin(angle) * distance;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: px, y: py, opacity: 0, scale: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                    i % 3 === 0 ? "bg-red-500" : i % 3 === 1 ? "bg-orange-400" : "bg-yellow-300"}`
                    } />);


              })}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* FLOATING FACEBOOK-LIKE GLASS REACTIONS BAR */}
      <AnimatePresence>
        {showBar &&
        <>
            {/* Backdrop to close the bar when clicking outside (visible only on mobile/touch screens) */}
            <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => {setShowBar(false);setHoveredIndex(null);}}
            onContextMenu={(e) => {e.preventDefault();setShowBar(false);}} />
          
            
            <motion.div
            ref={barRef}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: -48, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 md:left-1/2 md:-translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/80 p-2.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-xl origin-bottom max-w-[95vw] md:max-w-[90vw] overflow-x-auto scrollbar-none"
            style={{ bottom: "100%" }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={() => setHoveredIndex(null)}>
            
              {filteredReactionsList.map((r, idx) =>
            <button
              key={`${r.type}_${idx}`}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                triggerHaptic("light");
                playReactionSound("tap");
              }}
              onClick={() => handleSelectReaction(r.type)}
              className="relative flex items-center justify-center p-1.5 rounded-xl hover:bg-zinc-900/60 transition-all duration-200">
              
                  <span
                className={`text-2xl cursor-pointer select-none ${getEmojiAnimClass(r.animation, hoveredIndex === idx)}`}>
                
                    {r.emoji}
                  </span>

                  {/* Tooltip */}
                  {hoveredIndex === idx &&
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: -28 }}
                className="absolute left-1/2 -translate-x-1/2 bg-zinc-900 text-[9px] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono border border-zinc-800 whitespace-nowrap z-50 shadow-lg pointer-events-none">
                
                      {isArabic ? r.labelAr : r.labelEn}
                    </motion.div>
              }
                </button>
            )}
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* CORE TRIGGER REACTION BUTTON */}
      <button
        onMouseDown={startPressTimer}
        onMouseUp={cancelPressTimer}
        onMouseLeave={cancelPressTimer}
        onTouchStart={startPressTimer}
        onTouchEnd={handleTouchEnd}
        onClick={handleSingleTap}
        onContextMenu={(e) => {e.preventDefault();setShowBar(true);}}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
        userReaction ?
        "text-red-500 bg-red-950/20 border-red-500/30 font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
        "text-zinc-400 bg-zinc-950/50 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200"}`
        }
        title={isArabic ? "اضغط للتفاعل، اضغط مطولاً لتحديد إيموجي" : "Click to react, hold for emojis"}>
        
        <span className="text-sm">
          {userReaction ? userReaction.reactionType.length > 4 ? "❤️" : userReaction.reactionType : "❤️"}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider">
          {userReaction ?
          isArabic ? "متفاعل" : "Reacted" :
          isArabic ? "تفاعل" : "React"}
        </span>
      </button>

      {/* QUICK RESPONSES NEXT TO LIKE/REACT BUTTON IN POSTS */}
      {targetType === "post" &&
      <div className="flex items-end gap-1.5 flex-wrap pt-2">
          {QUICK_RESPONSES.map((qr, _autoIdx) => {
          const label = isArabic ? qr.textAr : qr.textEn;
          const isActive = userReaction?.reactionType === label;
          const count = reactions.filter(
            (r) => r.reactionType === qr.textAr || r.reactionType === qr.textEn
          ).length;

          return (
            <div key={`qr_${label}_${_autoIdx}`} className="flex flex-col items-center gap-1">
                {/* Small Counter Above the Button */}
                <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[8px] font-mono font-black text-red-500 bg-red-950/40 border border-red-500/20 px-1.5 py-0.2 rounded-md tracking-tighter">
                
                  {count} {isArabic ? "مستخدم" : "users"}
                </motion.div>
                <button
                onClick={() => handleQuickResponseClick(label)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer ${
                isActive ?
                "text-red-400 bg-red-950/30 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]" :
                "text-zinc-400 bg-zinc-950/50 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200"}`
                }
                title={label}>
                
                  <span className="text-xs sm:text-sm">{qr.emoji}</span>
                  <span>{label}</span>
                </button>
              </div>);

        })}
        </div>
      }

      {/* AGGREGATED DISPLAY & COUNTER */}
      {showCounters && totalReactionsCount > 0 &&
      <div
        onClick={() => setShowDetailsModal(true)}
        className="flex items-center gap-1.5 bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-900/60 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-zinc-300">
        
          {/* Top 3 Emojis */}
          <div className="flex items-center -space-x-1.5 flex-row-reverse">
            {topReactions.map((type, idx) =>
          <span key={`${type}_${idx}`} className="text-xs filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-[3]" style={{ zIndex: 10 - idx }}>
                {type}
              </span>
          )}
          </div>

          {/* Aggregated Count */}
          <span className="text-[10px] font-bold font-mono tracking-wide text-zinc-300">
            {totalReactionsCount >= 1000 ?
          `${(totalReactionsCount / 1000).toFixed(1)}K` :
          totalReactionsCount}
          </span>
        </div>
      }

      {/* FULL DETAILS BREAKDOWN MODAL / DRAWER */}
      <AnimatePresence>
        {showDetailsModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          

            {/* Modal Body */}
            <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-[#0b0b0c] border border-zinc-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),_0_0_30px_rgba(239,68,68,0.05)] overflow-hidden z-50">
            
              {/* Header */}
              <div className="flex justify-between items-center px-4.5 py-4 border-b border-zinc-900 bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-100 font-sans">
                    {isArabic ? "الأشخاص المتفاعلون" : "Reactions Breakdown"}
                  </span>
                  <span className="bg-zinc-900 border border-zinc-800 text-[9px] font-bold font-mono text-zinc-400 px-2 py-0.5 rounded-lg">
                    {totalReactionsCount}
                  </span>
                </div>
                <button
                onClick={() => setShowDetailsModal(false)}
                className="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-xl transition-all">
                
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 bg-zinc-950/40 border-b border-zinc-900">
                <div className="relative">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? "ابحث عن متفاعل بالاسم..." : "Search reacted users..."}
                  className="w-full bg-zinc-900/60 text-[11px] text-zinc-200 pl-4.5 pr-9 py-2 rounded-xl border border-zinc-800/50 focus:outline-none focus:border-red-500/40 transition-all font-sans" />
                
                </div>
              </div>

              {/* Reaction Filter Tabs */}
              <div className="flex gap-1.5 px-3 py-2 bg-zinc-950/20 border-b border-zinc-900 overflow-x-auto scrollbar-none">
                {existingReactionTabs.map((tab, _autoIdx) => {
                const isAll = tab === "all";
                const count = isAll ? totalReactionsCount : reactionCounts[tab] || 0;
                const isActive = activeFilterTab === tab;

                return (
                  <button
                    key={`reaction_tab_${tab}_${_autoIdx}`}
                    onClick={() => setActiveFilterTab(tab)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all whitespace-nowrap ${
                    isActive ?
                    "bg-red-500/10 text-red-400 border-red-500/30" :
                    "bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:text-zinc-200"}`
                    }>
                    
                      <span>{isAll ? isArabic ? "الكل" : "All" : tab}</span>
                      <span className="opacity-60 text-[8px] font-mono">({count})</span>
                    </button>);

              })}
              </div>

              {/* People List */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin p-3 space-y-2">
                {filteredUsers.length === 0 ?
              <div className="text-center py-12 text-zinc-600 text-[11px] italic">
                    {isArabic ? "لا توجد تفاعلات تطابق البحث!" : "No reactions found for this filter!"}
                  </div> :

              filteredUsers.map((r, idx) =>
              <div
                key={`${r.id || r.userId || ""}_${r.reactionType}_${idx}`}
                className="flex justify-between items-center p-2 rounded-xl bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 transition-all">
                
                      {/* Left: Avatar with Frame, Name, Level */}
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className="relative">
                          {/* Optional decorative animated frame glow */}
                          {r.userFrame &&
                    <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500 animate-spin opacity-70 blur-[1px]" />
                    }
                          <img
                      src={r.userAvatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150"}
                      alt={r.userDisplayName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150";
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-800 relative z-[2] bg-zinc-950" />
                    
                        </div>

                        {/* Name & Badge */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-zinc-100 font-sans hover:text-red-400 cursor-pointer" onClick={() => {setShowDetailsModal(false);triggerOpenProfile(r.userId);}}>
                              {r.userDisplayName}
                            </span>
                            {r.isVerified &&
                      <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 rounded font-mono font-bold">✓</span>
                      }
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold uppercase text-zinc-500">
                            <span>{r.userRole || "Rookie"}</span>
                            <span>•</span>
                            <span className="text-zinc-600">
                              {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : isArabic ? "الآن" : "Just now"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: The Emoji & Profile button */}
                      <div className="flex items-center gap-2">
                        {/* Selected emoji badge */}
                        <span className="text-lg bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-xl shadow-inner select-none animate-pulse">
                          {r.reactionType}
                        </span>

                        {/* View profile icon link */}
                        <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      triggerOpenProfile(r.userId);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1.5 rounded-lg transition-all text-zinc-400 hover:text-white"
                    title={isArabic ? "عرض الملف" : "View Profile"}>
                    
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
              )
              }
              </div>

              {/* Footer / Info */}
              <div className="p-3 border-t border-zinc-900 bg-zinc-950/50 flex justify-between items-center text-[8px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  {isArabic ? "قوة التفاعل +2 XP" : "Reaction Engages +2 XP"}
                </span>
                <span>Anime Black Reactions Engine</span>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

};