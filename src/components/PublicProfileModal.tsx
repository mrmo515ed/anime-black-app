import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  Shield,
  Flame,
  QrCode,
  Gift,
  Award,
  Users,
  Check,
  Bookmark,
  BarChart2,
  Share2,
  Sparkles,
  Globe,
  CheckCircle,
  Heart,
  Eye,
  Tv,
  BookOpen
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getBadgeImgForLevel, getTitleForLevel } from '../utils';
import CoverInteractionModal from "./CoverInteractionModal";
import OtakuStatsModal from "./OtakuStatsModal";
import { PostItem } from "./PostItem";
import LevelBadge from "./LevelBadge";
import { UniversalReactions } from "./UniversalReactions";

interface PublicProfileModalProps {
  userId: string;
  currentUser: any;
  isArabic: boolean;
  onClose: () => void;
  onOpenFollowers: (type: "followers" | "following", userId: string) => void;
  onOpenMessage?: (user: any) => void;
  playSynthSound: (type: "tap" | "success" | "error" | "purchase" | "levelup") => void;
  triggerHapticFeedback: (type: "tap" | "success" | "error" | "purchase" | "levelup") => void;
  triggerInAppNotification?: (title: string, body: string, badge?: string) => void;
}

const themePresets: Record<string, { gradient: string; textColor: string; borderColor: string; bgSoft: string; badgeColor: string }> = {
  crimson: {
    gradient: "from-red-600 via-orange-500 to-yellow-500",
    textColor: "text-[#FF3D00]",
    borderColor: "border-[#FF3D00]/40",
    bgSoft: "bg-red-950/20",
    badgeColor: "bg-red-950 text-red-400 border-red-900/50"
  },
  neon_cyan: {
    gradient: "from-cyan-500 via-blue-600 to-purple-600",
    textColor: "text-[#00E5FF]",
    borderColor: "border-[#00E5FF]/40",
    bgSoft: "bg-cyan-950/20",
    badgeColor: "bg-cyan-950 text-cyan-400 border-cyan-900/50"
  },
  emerald: {
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    textColor: "text-[#00E676]",
    borderColor: "border-[#00E676]/40",
    bgSoft: "bg-emerald-950/20",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-900/50"
  },
  gold: {
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    textColor: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40",
    bgSoft: "bg-amber-950/20",
    badgeColor: "bg-amber-950 text-amber-400 border-amber-900/50"
  },
  amethyst: {
    gradient: "from-purple-600 via-fuchsia-600 to-pink-500",
    textColor: "text-[#D500F9]",
    borderColor: "border-[#D500F9]/40",
    bgSoft: "bg-purple-950/20",
    badgeColor: "bg-purple-950 text-purple-400 border-purple-900/50"
  }
};

const bgStyleClasses: Record<string, string> = {
  solid: "bg-[#0C0C0C] border-zinc-800 shadow-2xl",
  cosmic: "bg-[#090810] bg-gradient-to-br from-[#090810] via-[#110A1D] to-[#05070D] border-purple-950/40 shadow-[0_0_40px_rgba(139,92,246,0.06)] relative",
  grid: "bg-[#080808] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] border-zinc-900 shadow-xl",
  matte: "bg-[#101010]/95 backdrop-blur-md border-zinc-850 shadow-2xl"
};

const framePresets = [
  { id: null, nameAr: "بدون إطار", nameEn: "No Frame", class: "" },
  { id: "fire_aura", nameAr: "إطار هالة النار المشتعلة 🔥", nameEn: "Fire Aura Frame 🔥", style: "ring-4 ring-orange-500 animate-pulse border-2 border-red-600 shadow-[0_0_15px_rgba(249,115,22,0.5)]" },
  { id: "electric_neon", nameAr: "إطار السايبر النيون الكهربائي ⚡", nameEn: "Neon Cyber Frame ⚡", style: "ring-4 ring-cyan-400 animate-pulse border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" },
  { id: "royal_gold", nameAr: "الإطار الذهبي الملكي 👑", nameEn: "Royal Gold Frame 👑", style: "ring-4 ring-yellow-500 border-2 border-amber-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]" }
];

// Guilds simulated list
const guildsList = [
  { id: "g1", nameAr: "نقابة مستكشفي الجراند لاين", nameEn: "Grand Line Explorers Guild", rank: "S-Rank", members: 420, activeRooms: 2 },
  { id: "g2", nameAr: "جمعية محبي شينغيكي", nameEn: "Shingeki Yeagerists Elite", rank: "A-Rank", members: 155, activeRooms: 0 }
];

// Achievements simulated list
const achievements = [
  { id: "a1", nameAr: "جامع البطاقات المحترف", nameEn: "Master Card Collector", descAr: "امتلاك أكثر من ١٠ بطاقات أوتـاكو نادرة", descEn: "Own 10+ rare Otaku character cards", unlocked: true, icon: "🃏" },
  { id: "a2", nameAr: "بطل المسابقات الأسطوري", nameEn: "Legendary Trivia Champion", descAr: "الفوز بالمركز الأول في بطولة الشونين الكبرى", descEn: "Win 1st place in Shonen Trivia", unlocked: true, icon: "🏆" },
  { id: "a3", nameAr: "مترجم متطوع فائق السرعة", nameEn: "High-Speed Translator Badge", descAr: "المساهمة بـ ٥ مراجعات دقيقة لقصص الأنمي", descEn: "Contribute 5 accurate anime plot reviews", unlocked: false, icon: "✍️" }
];

export default function PublicProfileModal({
  userId,
  currentUser,
  isArabic,
  onClose,
  onOpenFollowers,
  onOpenMessage,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification = () => {}
}: PublicProfileModalProps) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Interactive profile sections tab
  const [profileTab, setProfileTab] = useState<"posts" | "guilds" | "achievements">("posts");

  // Passport & Gifting State overlays
  const [showPassport, setShowPassport] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftToast, setGiftToast] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverModalMode, setCoverModalMode] = useState<"cover" | "profile">("cover");
  const [showOtakuStatsModal, setShowOtakuStatsModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        let userDoc = await getDoc(doc(db, "users", userId));
        
        if (!userDoc.exists()) {
          // Fallback query by username (for legacy compatibility)
          const q = query(collection(db, "users"), where("username", "==", userId));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            userDoc = snapshot.docs[0];
          }
        }

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileUser({ id: userDoc.id, ...data });
          if (data.followers?.includes(currentUser?.uid)) {
            setIsFollowing(true);
          }
        }
        
        // Fetch their posts
        const q = query(collection(db, "posts"), where("authorId", "==", userId));
        const postsSnap = await getDocs(q);
        const postsData = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // simple sort locally
        postsData.sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime());
        setUserPosts(postsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    try {
      playSynthSound("tap");
      triggerHapticFeedback("tap");
      const targetRef = doc(db, "users", userId);
      const myRef = doc(db, "users", currentUser.uid);
      
      if (isFollowing) {
        await updateDoc(targetRef, { followers: arrayRemove(currentUser.uid) });
        await updateDoc(myRef, { following: arrayRemove(userId) });
        setProfileUser((prev: any) => ({ ...prev, followers: (prev.followers || []).filter((id: string) => id !== currentUser.uid) }));
        setIsFollowing(false);
        triggerInAppNotification?.(
          isArabic ? "إلغاء المتابعة" : "Unfollowed",
          isArabic ? `تم إلغاء متابعة ${profileUser.name || profileUser.username}` : `Unfollowed ${profileUser.name || profileUser.username}`,
          "👤"
        );
      } else {
        await updateDoc(targetRef, { followers: arrayUnion(currentUser.uid) });
        await updateDoc(myRef, { following: arrayUnion(userId) });
        setProfileUser((prev: any) => ({ ...prev, followers: [...(prev.followers || []), currentUser.uid] }));
        setIsFollowing(true);
        playSynthSound("success");
        triggerInAppNotification?.(
          isArabic ? "متابعة جديدة" : "New Follow",
          isArabic ? `أنت الآن تتابع ${profileUser.name || profileUser.username}!` : `You are now following ${profileUser.name || profileUser.username}!`,
          "✨"
        );
      }
    } catch (e) {
      console.error(e);
      playSynthSound("error");
    }
  };

  const handleSendGift = (giftName: string, cost: number) => {
    playSynthSound("purchase");
    triggerHapticFeedback("purchase");
    setShowGiftModal(false);
    setGiftToast(isArabic ? `تم إرسال هدية (${giftName}) للعضو بنجاح! 🎁` : `Successfully sent (${giftName}) gift to member! 🎁`);
    triggerInAppNotification?.(
      isArabic ? "تم إرسال الهدية 🎁" : "Gift Sent 🎁",
      isArabic ? `تم إرسال ${giftName} إلى ${profileUser?.name || profileUser?.username}` : `Sent ${giftName} to ${profileUser?.name || profileUser?.username}`,
      "🎁"
    );
    setTimeout(() => {
      setGiftToast(null);
    }, 4000);
  };

  if (!userId) return null;

  // Read customized theme & background styles of the profile user
  const userThemeKey = profileUser?.profileTheme || "crimson";
  const userBgKey = profileUser?.profileBgStyle || "solid";

  const activeTheme = themePresets[userThemeKey] || themePresets.crimson;
  const activeBgClass = bgStyleClasses[userBgKey] || bgStyleClasses.solid;

  const currentFrameObj = framePresets.find(f => f.id === profileUser?.avatarFrame);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex justify-center sm:items-center sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl border border-zinc-800/80 flex flex-col relative overflow-hidden mt-10 sm:mt-0 transition-all duration-300 shadow-2xl ${activeBgClass}`}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
              <div className="w-10 h-10 border-3 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !profileUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
              <X className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 font-bold">{isArabic ? "المستخدم غير موجود" : "User not found"}</p>
              <button 
                onClick={onClose} 
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white font-black rounded-xl cursor-pointer shadow-lg shadow-orange-950/40 hover:scale-105 active:scale-95 transition-all"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
          ) : (
            <>
              {/* Cosmic glowing backdrop if selected */}
              {userBgKey === "cosmic" && (
                <div className="absolute top-12 left-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />
              )}

              {/* Close Button Header */}
              <div className="absolute top-4 right-4 z-30">
                <button 
                  onClick={onClose} 
                  className="p-2.5 bg-black/75 hover:bg-black/95 backdrop-blur-md rounded-full text-white border border-zinc-700/60 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title={isArabic ? "إغلاق" : "Close"}
                >
                  <X className="w-5 h-5 text-zinc-200" />
                </button>
              </div>

              {/* Cover Banner Area */}
              <div 
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setCoverModalMode("cover");
                  setShowCoverModal(true);
                }}
                className="relative h-48 sm:h-52 bg-zinc-900 shrink-0 cursor-pointer group overflow-hidden"
              >
                <img 
                  src={profileUser.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} 
                  alt="Cover" 
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-black/40 to-transparent" />

                {/* Top Action Badge on Cover */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-20">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                      setCoverModalMode("cover");
                      setShowCoverModal(true);
                    }}
                    className="bg-black/85 hover:bg-black/95 backdrop-blur-md px-3 py-1 rounded-xl border border-orange-500/60 text-orange-400 hover:text-orange-300 text-[10px] font-black flex items-center gap-1.5 shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse shrink-0" />
                    <span>{isArabic ? "تفاعل مع الغلاف 🔥" : "Cover Interaction 🔥"}</span>
                  </div>
                </div>

                {/* Universal cover photo reactions overlay */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                    setCoverModalMode("cover");
                    setShowCoverModal(true);
                  }}
                  className="absolute bottom-3 left-3 rtl:left-3 rtl:right-auto z-20 scale-85 sm:scale-90 origin-bottom-left bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-xl border border-zinc-700/60 shadow-lg cursor-pointer hover:border-orange-500/60 transition-all"
                >
                  <UniversalReactions
                    targetId={`cover_${profileUser?.username || profileUser?.id}`}
                    targetType="profile_cover"
                    currentUser={currentUser}
                    isArabic={isArabic}
                    authorId={profileUser?.id || profileUser?.uid}
                    triggerInAppNotification={triggerInAppNotification}
                  />
                </div>
              </div>

              {/* Profile Info Section Container */}
              <div className="px-6 pb-6 pt-2 relative flex-1 overflow-y-auto space-y-5">
                
                {/* Avatar Area overlapping Cover */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 -mt-16 sm:-mt-20 mb-2">
                  <div className="flex items-end gap-4">
                    <div className="relative group shrink-0">
                      <div
                        onClick={() => {
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                          setCoverModalMode("profile");
                          setShowCoverModal(true);
                        }}
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-[#0B0B0B] relative flex items-center justify-center transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.9)] shadow-[#FF7A00]/20 cursor-pointer hover:scale-105 active:scale-95 ${currentFrameObj?.style || "border-2 border-[#FF7A00]/40"}`}
                        title={isArabic ? "اضغط للتفاعل على البروفايل" : "Click for Profile Interaction"}
                      >
                        <img
                          src={profileUser.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400"}
                          alt="Profile Avatar"
                          className="w-full h-full rounded-full object-cover border-2 border-[#0B0B0B]"
                        />
                        
                        {profileUser?.prestigeLevel > 0 && (
                          <div 
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-black border-2 border-[#0B0B0B] shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-bounce" 
                            title="Prestige Elite"
                          >
                            ★
                          </div>
                        )}

                        {/* Level badge overlay */}
                        <div className="absolute -top-1 -left-1 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-black shadow-md">
                          Lvl {profileUser?.level || 1}
                        </div>
                      </div>

                      {/* Avatar / Profile Reaction Controls */}
                      <div className="mt-2 flex flex-col gap-1 w-full max-w-[130px]">
                        <button
                          onClick={() => {
                            playSynthSound("tap");
                            triggerHapticFeedback("tap");
                            setCoverModalMode("profile");
                            setShowCoverModal(true);
                          }}
                          className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 hover:from-orange-500/35 hover:to-red-500/35 text-orange-400 border border-orange-500/40 px-2 py-1 rounded-xl text-[9px] font-black flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                          <span>{isArabic ? "التفاعل 🔥" : "Interact 🔥"}</span>
                        </button>

                        <div className="scale-80 origin-left select-none bg-black/60 backdrop-blur-md px-1 py-0.5 rounded-xl border border-zinc-800 shadow-md">
                          <UniversalReactions
                            targetId={`avatar_${profileUser?.username || profileUser?.id}`}
                            targetType="profile_avatar"
                            currentUser={currentUser}
                            isArabic={isArabic}
                            authorId={profileUser?.id || profileUser?.uid}
                            triggerInAppNotification={triggerInAppNotification}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Name & Title Header */}
                    <div className="space-y-1.5 pt-12 sm:pt-16">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none flex items-center gap-2">
                          <span>{profileUser.name || "Otaku Member"}</span>
                          <CheckCircle className="w-5 h-5 text-[#FF7A00] fill-[#FF7A00]/20 inline-block" />
                        </h2>

                        <LevelBadge
                          level={profileUser?.level || 1}
                          size="sm"
                          showTitle={true}
                          showIcon={true}
                          isArabic={isArabic}
                        />
                        
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-[1.5px] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                          <div className="bg-[#0B0B0B] px-2 py-0.5 rounded-full flex items-center justify-center">
                            <span className="text-[9px] font-black text-yellow-400 tracking-wider">PRO OTAKU</span>
                          </div>
                        </div>

                        {profileUser?.role === "Owner" && (
                          <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                            <Shield className="w-3 h-3 text-red-500" />
                            <span>Owner</span>
                          </span>
                        )}

                        {profileUser?.prestigeLevel > 0 && (
                          <span className="text-[10px] bg-red-950/90 text-red-400 border border-red-800/80 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                            Prestige {profileUser.prestigeLevel}
                          </span>
                        )}
                      </div>

                      {/* Metadata Row: Username, UID, Mood, Online status, Location */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 font-medium pt-0.5">
                        <span className="text-zinc-300 font-mono font-bold">@{profileUser?.username || "user"}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-500 font-mono text-[11px]">UID: AB-{profileUser?.id?.substring(0, 6).toUpperCase()}</span>
                        <span className="text-zinc-600">•</span>
                        <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1 ${activeTheme.badgeColor}`}>
                          <span>{profileUser.mood || (isArabic ? "أوتـاكو أسطوري" : "Legendary Otaku")}</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{isArabic ? "متصل الآن" : "Active Now"}</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#FF7A00]" />
                          <span>{isArabic ? "🇯🇵 طوكيو، اليابان" : "🇯🇵 Tokyo, Japan"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIBRANT ACTION BUTTONS ROW - RICH ANIME BLACK BUTTON THEMES */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full mt-3">
                  
                  {/* 1. Follow / Unfollow Button */}
                  {currentUser?.uid !== profileUser.id && (
                    <button
                      onClick={handleFollowToggle}
                      className={`h-11 rounded-[16px] text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                        isFollowing
                          ? "bg-[#1E1118] hover:bg-[#2A1520] border border-red-500/50 text-[#FF4D4D] shadow-red-950/30"
                          : "bg-gradient-to-r from-[#FF7A00] via-[#FF3B30] to-[#E11D48] hover:from-[#FF8A10] hover:to-[#FF4B40] text-white shadow-[#FF7A00]/25 border border-orange-500/40"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 text-[#FF4D4D]" />
                          <span>{isArabic ? "تتابع العضو" : "Following"}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-white" />
                          <span>{isArabic ? "متابعة" : "Follow"}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* 2. Direct Chat / Message Button */}
                  {currentUser?.uid !== profileUser.id && (
                    <button
                      onClick={() => onOpenMessage?.(profileUser)}
                      className="h-11 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 border border-cyan-400/40 active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-200" />
                      <span>{isArabic ? "مراسلة" : "Message"}</span>
                    </button>
                  )}

                  {/* 3. Otaku Stats Comprehensive Button */}
                  <button
                    onClick={() => {
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                      setShowOtakuStatsModal(true);
                    }}
                    className="h-11 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/40 border border-purple-400/40 active:scale-95 cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4 text-pink-200" />
                    <span>{isArabic ? "الإحصائيات" : "Otaku Stats"}</span>
                  </button>

                  {/* 4. Digital Passport Button */}
                  <button
                    onClick={() => {
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                      setShowPassport(true);
                    }}
                    className="h-11 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 border border-yellow-300/50 active:scale-95 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-zinc-950" />
                    <span>{isArabic ? "جواز السفر" : "Passport"}</span>
                  </button>

                  {/* 5. Send Gift Button */}
                  <button
                    onClick={() => {
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                      setShowGiftModal(true);
                    }}
                    className="h-11 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40 border border-rose-400/40 active:scale-95 cursor-pointer"
                  >
                    <Gift className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>{isArabic ? "إرسال هدية" : "Send Gift"}</span>
                  </button>

                  {/* 6. Share Profile Button */}
                  <button
                    onClick={() => {
                      playSynthSound("success");
                      triggerHapticFeedback("tap");
                      navigator.clipboard.writeText(`https://animeblack.app/u/${profileUser?.username || profileUser?.id}`);
                      triggerInAppNotification?.(
                        isArabic ? "تم نسخ الرابط" : "Link Copied",
                        isArabic ? "تم نسخ رابط الملف الشخصي لمشاركته مع أصدقائك!" : "Profile link copied to clipboard!",
                        "🔗"
                      );
                    }}
                    className="h-11 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 border border-emerald-400/40 active:scale-95 cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <Share2 className="w-4 h-4 text-emerald-200" />
                    <span>{isArabic ? "مشاركة" : "Share"}</span>
                  </button>
                </div>

                {/* COMPREHENSIVE OTAKU STATS BANNER CARD */}
                <div className="bg-gradient-to-r from-[#18121f] via-[#14141c] to-[#18121f] border border-orange-500/30 p-4 sm:p-5 rounded-[22px] shadow-2xl relative overflow-hidden group hover:border-orange-500/60 transition-all">
                  <div className="absolute top-0 left-0 w-64 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FF3D00] flex items-center justify-center text-white shadow-lg shadow-orange-950/50 shrink-0">
                        <BarChart2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-white">{isArabic ? "إحصائيات الأوتاكو الشاملة" : "Comprehensive Otaku Analytics"}</h3>
                          <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                            PRO STATS
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {isArabic ? "تحليل كامل لساعات المشاهدة، المانجا، التصنيفات، والاستوديوهات المفضلة" : "Detailed breakdown of episodes, manga, genres, and favorite studios"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playSynthSound("tap");
                        triggerHapticFeedback("tap");
                        setShowOtakuStatsModal(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#FF3D00] hover:from-[#FF8A10] hover:to-[#FF4B40] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-950/50 hover:scale-105 active:scale-95"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>{isArabic ? "عرض الإحصائيات الكاملة" : "Open Otaku Stats"}</span>
                    </button>
                  </div>
                </div>

                {/* DEDICATED CARDS SECTION: BIO & FAVORITES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CARD 1: BIO CARD */}
                  <div className="bg-[#141414] border border-zinc-800/80 p-4 rounded-[20px] shadow-lg flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-[#FF7A00]">📝</span>
                        <span>{isArabic ? "النبذة الشخصية" : "Otaku Biography"}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{profileUser.mood || "Legendary Otaku"}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed min-h-[40px]">
                      {profileUser.bio || (isArabic ? "عاشق للأنمي والمانجا وعضو في مجتمع Anime Black الأسطوري!" : "Passionate anime & manga fan and member of Anime Black community!")}
                    </p>
                  </div>

                  {/* CARD 2: FAVORITES SHOWCASE */}
                  <div className="bg-[#141414] border border-zinc-800/80 p-4 rounded-[20px] shadow-lg flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-[#FF7A00]">⭐</span>
                        <span>{isArabic ? "المفضلات الأوتاكو" : "Otaku Favorites"}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">TOP PICKS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-950/60 border border-zinc-900 p-2 rounded-xl">
                        <span className="text-[8px] text-orange-400 uppercase tracking-widest block font-black mb-1 flex items-center gap-1">
                          <Tv className="w-2.5 h-2.5" />
                          <span>{isArabic ? "الأنمي المفضل" : "Fav Anime"}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {profileUser.favAnime && profileUser.favAnime.length > 0 ? (
                            profileUser.favAnime.map((item: string, idx: number) => (
                              <span key={idx} className="text-[9px] bg-orange-950/40 text-orange-300 px-1.5 py-0.5 rounded-md border border-orange-900/40 font-bold">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-zinc-500 font-mono">{isArabic ? "ون بيس / ون بنش مان" : "One Piece"}</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 border border-zinc-900 p-2 rounded-xl">
                        <span className="text-[8px] text-purple-400 uppercase tracking-widest block font-black mb-1 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" />
                          <span>{isArabic ? "المانجا المفضلة" : "Fav Manga"}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {profileUser.favManga && profileUser.favManga.length > 0 ? (
                            profileUser.favManga.map((item: string, idx: number) => (
                              <span key={idx} className="text-[9px] bg-purple-950/40 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-900/40 font-bold">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-zinc-500 font-mono">{isArabic ? "بيرسيرك / فاجابوند" : "Berserk"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level System XP progress bar */}
                <div className="bg-[#141414] border border-zinc-800/80 p-3.5 rounded-[20px] space-y-2 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shadow-md">
                        <img src={getBadgeImgForLevel(profileUser.level || 1)} alt="Badge" className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full ${activeTheme.badgeColor}`}>
                        {isArabic ? `مستوى ${profileUser.level || 1}` : `Level ${profileUser.level || 1}`}
                      </span>
                      <span className="text-[11px] text-zinc-300 font-black">
                        {getTitleForLevel(profileUser.level || 1)}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[11px] text-orange-400 font-mono font-black">{(profileUser.xp || 4200) % 1000}/1000 XP</span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-900">
                    <div
                      className={`bg-gradient-to-r ${activeTheme.gradient} h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,122,0,0.5)]`}
                      style={{ width: `${Math.max(5, ((profileUser.xp || 4200) % 1000) / 10)}%` }}
                    />
                  </div>
                </div>

                {/* Bento dynamic stats counting cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div 
                    className="bg-[#0B1528]/80 border border-cyan-500/30 p-3 rounded-2xl text-center cursor-pointer hover:border-cyan-400 hover:scale-105 transition-all shadow-md"
                    onClick={() => {
                      playSynthSound("tap");
                      onOpenFollowers("followers", profileUser.id);
                    }}
                  >
                    <span className="text-[9px] text-cyan-400 block uppercase font-black">{isArabic ? "المتابعون" : "Followers"}</span>
                    <span className="text-base font-black text-white font-mono">{profileUser.followers?.length || 0}</span>
                  </div>
                  
                  <div 
                    className="bg-[#0B2018]/80 border border-emerald-500/30 p-3 rounded-2xl text-center cursor-pointer hover:border-emerald-400 hover:scale-105 transition-all shadow-md"
                    onClick={() => {
                      playSynthSound("tap");
                      onOpenFollowers("following", profileUser.id);
                    }}
                  >
                    <span className="text-[9px] text-emerald-400 block uppercase font-black">{isArabic ? "يتابع" : "Following"}</span>
                    <span className="text-base font-black text-white font-mono">{profileUser.following?.length || 0}</span>
                  </div>

                  <div className="bg-[#24170A]/80 border border-amber-500/30 p-3 rounded-2xl text-center shadow-md">
                    <span className="text-[9px] text-amber-400 block uppercase font-black">{isArabic ? "أيام الـ Streak" : "Streak Days"}</span>
                    <span className="text-base font-black text-white font-mono flex items-center justify-center gap-1">
                      <span>{profileUser.streakDays || 12}</span>
                      <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                    </span>
                  </div>

                  <div className="bg-[#24200A]/80 border border-yellow-500/30 p-3 rounded-2xl text-center shadow-md">
                    <span className="text-[9px] text-yellow-400 block uppercase font-black">{isArabic ? "السمعة" : "Reputation"}</span>
                    <span className="text-base font-black text-yellow-400 font-mono">⭐ {profileUser.reputation || 142}</span>
                  </div>

                  <div className="bg-[#250F18]/80 border border-red-500/30 p-3 rounded-2xl text-center shadow-md col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-red-400 block uppercase font-black">{isArabic ? "المنشورات" : "Posts"}</span>
                    <span className="text-base font-black text-white font-mono">{userPosts.length}</span>
                  </div>
                </div>

                {/* INTERACTIVE TAB BAR FOR PROFILE SECTIONS */}
                <div className="flex bg-black/60 p-1.5 rounded-2xl border border-zinc-800/80 overflow-x-auto gap-1.5 backdrop-blur-md">
                  {[
                    { id: "posts", labelAr: "📝 المنشورات", labelEn: "Posts", count: userPosts.length },
                    { id: "guilds", labelAr: "👥 النقابات", labelEn: "Guilds", count: guildsList.length },
                    { id: "achievements", labelAr: "🏆 الإنجازات", labelEn: "Achievements", count: achievements.filter(a => a.unlocked).length }
                  ].map((tab, _autoIdx) => {
                    const isSelected = profileTab === tab.id;
                    return (
                      <button
                        key={`pubpro_tab_${tab.id}_${_autoIdx}`}
                        onClick={() => {
                          setProfileTab(tab.id as any);
                          playSynthSound("tap");
                          triggerHapticFeedback("tap");
                        }}
                        className={`text-xs font-black px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white shadow-lg shadow-orange-950/40 font-bold scale-[1.02]" 
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                        }`}
                      >
                        <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isSelected ? "bg-black/30 text-white" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* PROFILE TABS CONTENT MODULES */}
                <div className="space-y-4">
                  {/* POSTS TAB */}
                  {profileTab === "posts" && (
                    <div className="space-y-3">
                      {userPosts.length === 0 ? (
                        <div className="text-center py-12 bg-[#121212]/50 rounded-2xl border border-zinc-800/60 text-zinc-400 text-xs flex flex-col items-center gap-2">
                          <span className="text-2xl">📝</span>
                          <span className="font-bold">{isArabic ? "لم يقم هذا العضو بنشر أي شيء حتى الآن!" : "This member hasn't posted any updates yet."}</span>
                        </div>
                      ) : (
                        userPosts.map((post, idx) => {
                          const fullPost = {
                            ...post,
                            author: post.author || {
                              id: profileUser?.id,
                              uid: profileUser?.id,
                              name: profileUser?.name || "User",
                              username: profileUser?.username || "user",
                              avatar: profileUser?.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                              level: profileUser?.level || profileUser?.prestigeLevel || 1
                            }
                          };
                          return (
                            <PostItem
                              key={post.id ? `pub_post_${post.id}_${idx}` : `pub_post_idx_${idx}`}
                              post={fullPost}
                              currentUser={currentUser}
                              isArabic={isArabic}
                              playSynthSound={playSynthSound}
                              triggerHapticFeedback={triggerHapticFeedback}
                              triggerInAppNotification={triggerInAppNotification}
                              onUpdatePost={(updatedPost) => {
                                setUserPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
                              }}
                              onDeletePost={(postId) => {
                                setUserPosts((prev) => prev.filter((p) => p.id !== postId));
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* GUILDS TAB */}
                  {profileTab === "guilds" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {guildsList.map((g, gIdx) => (
                        <div key={g.id ? `pub_g_${g.id}_${gIdx}` : `pub_g_${gIdx}`} className="p-4 bg-[#141414] rounded-2xl border border-zinc-800/80 space-y-2.5 shadow-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-white">{isArabic ? g.nameAr : g.nameEn}</h4>
                              <span className="text-[10px] text-zinc-400">{g.members} {isArabic ? "عضو منضم" : "members joined"}</span>
                            </div>
                            <span className="text-[9px] bg-yellow-950/80 text-yellow-400 border border-yellow-700/50 px-2 py-0.5 rounded-full font-black">{g.rank}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-zinc-800/50 text-zinc-400">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{g.activeRooms} {isArabic ? "غرف صوتية نشطة" : "voice rooms online"}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACHIEVEMENTS TAB */}
                  {profileTab === "achievements" && (
                    <div className="space-y-2.5">
                      {achievements.map((a, aIdx) => (
                        <div key={a.id ? `pub_a_${a.id}_${aIdx}` : `pub_a_${aIdx}`} className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-md ${
                          a.unlocked ? "bg-[#141414] border-zinc-800" : "bg-zinc-950/30 border-zinc-900 opacity-50"
                        }`}>
                          <div className="text-3xl shrink-0 p-2 bg-black/40 rounded-xl border border-zinc-800">{a.icon}</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white">{isArabic ? a.nameAr : a.nameEn}</h4>
                              {a.unlocked && (
                                <span className="text-[9px] bg-green-950 text-green-400 border border-green-800/50 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {isArabic ? "مكتمل" : "Unlocked"}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400">{isArabic ? a.descAr : a.descEn}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* DIGITAL PASSPORT MODAL */}
      <AnimatePresence>
        {showPassport && profileUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setShowPassport(false)} className="fixed inset-0 bg-black/85 z-[120] backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-zinc-800 p-5 rounded-3xl z-[130] space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              {/* Card header */}
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 text-white">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF7A00]">★</span>
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    {isArabic ? "بطاقة الهوية الرقمية الموحدة" : "ANIME BLACK DIGITAL ID"}
                  </span>
                </div>
                <button onClick={() => setShowPassport(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Passport layout */}
              <div className="bg-black/45 p-4 rounded-2xl border border-zinc-850 space-y-4 relative">
                <div className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-[#0A0A0A] relative flex items-center justify-center p-0.5">
                    <img src={profileUser.avatar} className="w-full h-full object-cover rounded-lg" alt={profileUser.name} />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                      {profileUser.role || "MEMBER"}
                    </span>
                    <h4 className="text-xs font-black text-white truncate leading-none mt-1">{profileUser.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-mono truncate mt-0.5">@{profileUser.username}</p>
                    <div className="text-[8px] text-zinc-400 font-bold truncate">Title: {profileUser.activeTitle || "Rookie"}</div>
                  </div>
                </div>

                {/* Passport particulars Grid */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold border-t border-zinc-900 pt-3">
                  <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900">
                    <span className="text-zinc-500 block">UID CODE</span>
                    <span className="text-zinc-200 font-mono font-bold truncate block">{profileUser.id?.substring(0, 10).toUpperCase()}</span>
                  </div>
                  <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900">
                    <span className="text-zinc-500 block">PRESTIGE LEVEL</span>
                    <span className="text-zinc-200 font-mono font-bold">★ {profileUser.prestigeLevel || 0} Reset</span>
                  </div>
                  <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900">
                    <span className="text-zinc-500 block">JOIN DATE</span>
                    <span className="text-zinc-200 font-mono font-bold">2026-07-05</span>
                  </div>
                  <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900">
                    <span className="text-zinc-500 block">REPUTATION</span>
                    <span className="text-green-400 font-mono font-bold">ACTIVE TRUST</span>
                  </div>
                </div>

                {/* QR Code and custom short URL */}
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3.5 bg-black/10 rounded-b-2xl">
                  <div className="space-y-1">
                    <span className="text-[7px] text-zinc-500 uppercase font-black block">Passport URL</span>
                    <span className="text-[9px] text-orange-500 font-bold font-mono">animeblack.app/u/{profileUser.username}</span>
                  </div>
                  <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://animeblack.app/u/${profileUser.username}`} className="w-full h-full object-contain" alt="QR" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SEND GIFT MODAL */}
      <AnimatePresence>
        {showGiftModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setShowGiftModal(false)} className="fixed inset-0 bg-black/85 z-[120] backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-[#0C0C0E] border border-zinc-800 p-5 rounded-3xl z-[130] space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-850 pb-2 text-white">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>{isArabic ? "إرسال هدية للعضو" : "Send Gift to Member"}</span>
                </h4>
                <button onClick={() => setShowGiftModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isArabic ? "اختر هدية لإرسالها من محفظتك:" : "Choose a gift to send from your wallet:"}
              </p>
              <div className="space-y-2">
                {[
                  { nameAr: "علبة غامضة نادرة 📦", nameEn: "Rare Mystery Box 📦", cost: 150 },
                  { nameAr: "بطاقة الأوتـاكو الذهبية 🃏", nameEn: "Gold Otaku Card 🃏", cost: 300 },
                  { nameAr: "شعار النخبة الأسطوري 🏆", nameEn: "Legendary Elite Trophy 🏆", cost: 500 }
                ].map((gift, i) => (
                  <button
                    key={`gift_${gift.nameEn}_${i}`}
                    onClick={() => handleSendGift(isArabic ? gift.nameAr : gift.nameEn, gift.cost)}
                    className="w-full p-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-xl flex justify-between items-center text-xs transition-all text-white font-bold cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>{isArabic ? gift.nameAr : gift.nameEn}</span>
                    <span className="text-yellow-500 font-mono text-[10px]">🪙 {gift.cost} Coins</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Gift Success Toast */}
      <AnimatePresence>
        {giftToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-950 text-white border border-yellow-500 px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl z-[150] pointer-events-none"
          >
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping" />
            <span>{giftToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROFILE / COVER INTERACTION MODAL */}
      <CoverInteractionModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        coverUrl={profileUser?.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
        username={profileUser?.username || "user"}
        displayName={profileUser?.name || profileUser?.username || "Otaku"}
        avatarUrl={profileUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
        isArabic={isArabic}
        currentUser={currentUser}
        isOwner={currentUser?.uid === profileUser?.id}
        mode={coverModalMode}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback}
      />

      {/* COMPREHENSIVE OTAKU STATS MODAL */}
      <OtakuStatsModal
        isOpen={showOtakuStatsModal}
        onClose={() => setShowOtakuStatsModal(false)}
        isArabic={isArabic}
        currentUser={profileUser}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback}
      />
    </AnimatePresence>
  );
}
