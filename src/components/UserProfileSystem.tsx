import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Shield,
  Coins,
  Star,
  Plus,
  Compass,
  Tv,
  Radio,
  Share2,
  Trash2,
  Copy,
  Sliders,
  Bell,
  Check,
  Zap,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Gift,
  ShoppingCart,
  Users,
  ChevronRight,
  TrendingUp,
  Heart,
  MessageSquare,
  Bookmark,
  ChevronLeft,
  X,
  Play,
  CheckCircle,
  Gamepad2,
  Edit,
  Activity,
  QrCode,
  Download,
  Database,
  Grid,
  BarChart2,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Globe,
  Clock,
  Sparkles,
  MapPin } from
"lucide-react";
import AccountCustomizationSystem from "./AccountCustomizationSystem";
import { UniversalReactions } from "./UniversalReactions";
import { PostItem } from "./PostItem";
import { getBadgeImgForLevel, getTitleForLevel } from '../utils';
import CoverInteractionModal from "./CoverInteractionModal";
import OtakuStatsModal from "./OtakuStatsModal";
import LevelBadge from "./LevelBadge";
import LevelBadgesModal from "./LevelBadgesModal";

interface UserProfileSystemProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  posts: any[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  reels: any[];
  blackCoins: number;
  setBlackCoins: React.Dispatch<React.SetStateAction<number>>;
  stars: number;
  setStars: React.Dispatch<React.SetStateAction<number>>;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (title: string, body: string, badge?: string) => void;
  triggerCelebration: (type: string, titleAr: string, titleEn: string, bodyAr: string, bodyEn: string, reward: string) => void;
}

const themePresets: Record<string, {gradient: string;textColor: string;borderColor: string;bgSoft: string;badgeColor: string;}> = {
  crimson: {
    gradient: "from-[#FF7A00] via-[#FF3B30] to-[#E60000]",
    textColor: "text-[#FF7A00]",
    borderColor: "border-[#FF7A00]/40",
    bgSoft: "bg-[#FF7A00]/10",
    badgeColor: "bg-[#FF7A00]/15 text-[#FF7A00] border-[#FF7A00]/30"
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
  solid: "bg-[#0B0B0B]",
  cosmic: "bg-[#0B0B0B] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,122,0,0.15),rgba(255,255,255,0))]",
  grid: "bg-[#0B0B0B] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]",
  matte: "bg-[#0B0B0B] backdrop-blur-xl"
};

const framePresets = [
{ id: null, nameAr: "بدون إطار", nameEn: "No Frame", class: "" },
{ id: "fire_aura", nameAr: "إطار هالة النار المشتعلة 🔥", nameEn: "Fire Aura Frame 🔥", style: "ring-4 ring-[#FF7A00] animate-pulse border-2 border-[#FF3B30] shadow-[0_0_20px_rgba(255,122,0,0.6)]" },
{ id: "electric_neon", nameAr: "إطار السايبر النيون الكهربائي ⚡", nameEn: "Neon Cyber Frame ⚡", style: "ring-4 ring-cyan-400 animate-pulse border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" },
{ id: "royal_gold", nameAr: "الإطار الذهبي الملكي 👑", nameEn: "Royal Gold Frame 👑", style: "ring-4 ring-yellow-500 border-2 border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)]" }];


const titlePresets = [
"أوتاكو نصل الشيطان 🔥",
"ملك القراصنة القادم 👒",
"إمبراطور الهالة السوداء 👑",
"شينوبي القرية الخفية 🍥",
"مستكشف العالم المظلم 🌌",
"قائد فرقة الاستطلاع 🧣"];


const guildsList = [
{ id: "g1", nameAr: "نقابة مستكشفي الجراند لاين", nameEn: "Grand Line Explorers Guild", rank: "S-Rank", members: 420, activeRooms: 2 },
{ id: "g2", nameAr: "جمعية محبي شينغيكي", nameEn: "Shingeki Yeagerists Elite", rank: "A-Rank", members: 155, activeRooms: 0 }];


const achievements = [
{ id: "a1", nameAr: "جامع البطاقات المحترف", nameEn: "Master Card Collector", descAr: "امتلاك أكثر من ١٠ بطاقات أوتـاكو نادرة", descEn: "Own 10+ rare Otaku character cards", unlocked: true, icon: "🃏" },
{ id: "a2", nameAr: "بطل المسابقات الأسطوري", nameEn: "Legendary Trivia Champion", descAr: "الفوز بالمركز الأول في بطولة الشونين الكبرى", descEn: "Win 1st place in Shonen Trivia", unlocked: true, icon: "🏆" },
{ id: "a3", nameAr: "مترجم متطوع فائق السرعة", nameEn: "High-Speed Translator Badge", descAr: "المساهمة بـ ٥ مراجعات دقيقة لقصص الأنمي", descEn: "Contribute 5 accurate anime plot reviews", unlocked: false, icon: "✍️" }];


const savedItems = [
{ id: "s1", type: "ANIME_REEL", titleAr: "لحظة غوكو التحول الأسطوري غريزة فائقة", titleEn: "Goku Ultra Instinct Legendary Scene" },
{ id: "s2", type: "POST_CAPSULE", titleAr: "تحليل النظريات النهائية لمانجا ون بيس الفصل 1110", titleEn: "One Piece Chapter 1110 Theory Analysis" }];


const analyticsData = {
  averageHypeFactor: "9.8 / 10",
  bestPublishTime: "09:30 PM (بتوقيت مكة)",
  activityScore: [40, 65, 80, 50, 95, 100]
};

export default function UserProfileSystem({
  isArabic,
  currentUser,
  setCurrentUser,
  posts,
  setPosts,
  reels,
  blackCoins,
  setBlackCoins,
  stars,
  setStars,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  triggerCelebration
}: UserProfileSystemProps) {

  const [profileTab, setProfileTab] = useState<"posts" | "reels" | "saved" | "guilds" | "achievements" | "inventory" | "analytics">("posts");

  const [isEditing, setIsEditing] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showAccountCustomization, setShowAccountCustomization] = useState(false);
  const [customizationInitialPage, setCustomizationInitialPage] = useState<number | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverModalMode, setCoverModalMode] = useState<"cover" | "profile">("cover");
  const [showOtakuStatsModal, setShowOtakuStatsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [show100LevelBadgesModal, setShow100LevelBadgesModal] = useState(false);
  const [secTab, setSecTab] = useState<"info" | "wallet" | "sessions">("info");

  const [tempName, setTempName] = useState(currentUser?.name || "Luffy Otaku");
  const [tempAvatar, setTempAvatar] = useState(currentUser?.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400");
  const [tempCover, setTempCover] = useState(currentUser?.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
  const [tempBio, setTempBio] = useState(currentUser?.bio || "عاشق لأنمي الشونين، جامع بطاقات أوتـاكو نادرة، ومصمم محتوى في مجتمع الأنمي العربي 🔥🏴‍☠️");
  const [tempTitle, setTempTitle] = useState(currentUser?.title || "ملك القراصنة القادم 👒");
  const [tempMood, setTempMood] = useState(currentUser?.mood || "🔥 حماس أوتـاكو");

  const [selectedTheme, setSelectedTheme] = useState<string>(currentUser?.profileTheme || "crimson");
  const [selectedBgStyle, setSelectedBgStyle] = useState<string>(currentUser?.profileBgStyle || "solid");
  const [selectedFrame, setSelectedFrame] = useState<string | null>(currentUser?.avatarFrame || "fire_aura");

  const [tempFavAnime, setTempFavAnime] = useState<string>(currentUser?.favAnime ? currentUser.favAnime.join(", ") : "One Piece, Attack on Titan, Jujutsu Kaisen");
  const [tempFavManga, setTempFavManga] = useState<string>(currentUser?.favManga ? currentUser.favManga.join(", ") : "Berserk, Solo Leveling, Vagabond");

  const [activityLogs, setActivityLogs] = useState([
  { id: "1", actionAr: "سجلت الدخول اليومي وحصلت على +50 XP", actionEn: "Logged in daily & claimed +50 XP", time: "09:30 AM" },
  { id: "2", actionAr: "قمت بفتح بطاقة شخصية نادرة S-Rank", actionEn: "Opened S-Rank character card", time: "أمس" },
  { id: "3", actionAr: "شاركت كبسولة أنمي جديدة وحصلت على 20 إعجاب", actionEn: "Shared new anime capsule and gained 20 likes", time: "منذ يومين" }]
  );

  useEffect(() => {
    if (currentUser) {
      setTempName(currentUser.name || "Luffy Otaku");
      setTempAvatar(currentUser.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400");
      setTempCover(currentUser.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
      setTempBio(currentUser.bio || "عاشق لأنمي الشونين، جامع بطاقات أوتـاكو نادرة، ومصمم محتوى في مجتمع الأنمي العربي 🔥🏴‍☠️");
      setTempTitle(currentUser.title || "ملك القراصنة القادم 👒");
      setTempMood(currentUser.mood || "🔥 حماس أوتـاكو");
      if (currentUser.profileTheme) setSelectedTheme(currentUser.profileTheme);
      if (currentUser.profileBgStyle) setSelectedBgStyle(currentUser.profileBgStyle);
      if (currentUser.avatarFrame !== undefined) setSelectedFrame(currentUser.avatarFrame);
      if (currentUser.favAnime) setTempFavAnime(currentUser.favAnime.join(", "));
      if (currentUser.favManga) setTempFavManga(currentUser.favManga.join(", "));
    }
  }, [currentUser]);

  const activeTheme = themePresets[selectedTheme] || themePresets.crimson;
  const activeBgClass = bgStyleClasses[selectedBgStyle] || bgStyleClasses.solid;
  const currentFrameObj = framePresets.find((f) => f.id === selectedFrame);

  const handlePrestigeUpgrade = async () => {
    if ((currentUser?.level || 1) < 100) {
      playSynthSound("error");
      triggerHapticFeedback("error");
      alert(isArabic ? "⚠️ يجب أن تصل للمستوى 100 لتتمكن من إعادة تعيين الهيبة (Prestige Reset)!" : "⚠️ You must reach Level 100 to trigger a Prestige Reset!");
      return;
    }
    const newPrestige = (currentUser?.prestigeLevel || 0) + 1;
    const updated = {
      ...currentUser,
      level: 1,
      xp: 0,
      prestigeLevel: newPrestige
    };
    setCurrentUser(updated);
    playSynthSound("levelup");
    triggerHapticFeedback("levelup");
    triggerCelebration("prestige", "ترقية الهيبة 👑", "Prestige Reset 👑", "تمت ترقية حسابك إلى رتبة الهيبة الأسطورية بنجاح!", "Your account has been reset to Prestige level successfully!", "+1,000 Black Coins");
    setBlackCoins((prev) => prev + 1000);
    try {
      const { db } = await import('../firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, "users", currentUser.uid), {
        level: 1,
        xp: 0,
        prestigeLevel: newPrestige
      });
    } catch (err) {
      console.error("Prestige sync error:", err);
    }
  };

  const handleSaveProfile = async () => {
    playSynthSound("success");
    triggerHapticFeedback("success");
    setIsEditing(false);

    const updatedUser = {
      ...currentUser,
      name: tempName,
      avatar: tempAvatar,
      cover: tempCover,
      bio: tempBio,
      title: tempTitle,
      mood: tempMood,
      avatarFrame: selectedFrame,
      profileTheme: selectedTheme,
      profileBgStyle: selectedBgStyle,
      favAnime: tempFavAnime ? tempFavAnime.split(',').map((s, _autoIdx) => s.trim()) : [],
      favManga: tempFavManga ? tempFavManga.split(',').map((s, _autoIdx) => s.trim()) : []
    };

    setCurrentUser(updatedUser);
    triggerInAppNotification(
      isArabic ? "تحديث الهوية الرقمية" : "Digital ID Updated",
      isArabic ? "تم حفظ التعديلات على ملفك الشخصي وتحديث السجل الموحد." : "Profile updates were saved successfully.",
      "✨"
    );

    try {
      const { db } = await import('../firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: tempName,
        avatar: tempAvatar,
        cover: tempCover,
        bio: tempBio,
        title: tempTitle,
        mood: tempMood,
        avatarFrame: selectedFrame,
        profileTheme: selectedTheme,
        profileBgStyle: selectedBgStyle,
        favAnime: tempFavAnime ? tempFavAnime.split(',').map((s, _autoIdx) => s.trim()) : [],
        favManga: tempFavManga ? tempFavManga.split(',').map((s, _autoIdx) => s.trim()) : []
      });
    } catch (err: any) {
      console.error("Firestore update profile failed:", err);
    }
  };

  const handleSendGift = (giftName: string, cost: number) => {
    if (blackCoins < cost) {
      playSynthSound("error");
      triggerHapticFeedback("error");
      alert(isArabic ? `❌ ليس لديك كوينز سوداء كافية! تكلفة الهدية ${cost} كوينز.` : `❌ Not enough Black Coins! Gift costs ${cost} coins.`);
      return;
    }
    setBlackCoins((prev) => prev - cost);
    playSynthSound("purchase");
    triggerHapticFeedback("purchase");
    setShowGiftModal(false);
    triggerInAppNotification(
      isArabic ? "إرسال هدية مميزة 🎁" : "Gift Sent 🎁",
      isArabic ? `تم إرسال هدية (${giftName}) بنجاح بقيمة ${cost} كوينز سوداء!` : `Successfully sent (${giftName}) gift worth ${cost} Black Coins!`,
      "🎁"
    );
  };

  const userPostsList = posts.filter((p) => p.author?.username === currentUser?.username || p.authorId === currentUser?.uid);

  return (
    <div className={`min-h-screen text-white pb-24 space-y-6 ${activeBgClass} select-none transition-colors duration-500`}>

      {/* HEADER & COVER BLOCK */}
      <div className="relative rounded-[24px] overflow-hidden border border-zinc-800/80 bg-[#141414] shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        
        {/* Cover Photo */}
        <div
          onClick={() => {
            if (playSynthSound) playSynthSound("tap");
            if (triggerHapticFeedback) triggerHapticFeedback("tap");
            setCoverModalMode("cover");
            setShowCoverModal(true);
          }}
          className="relative h-56 sm:h-64 w-full overflow-hidden group cursor-pointer">
          
          <img
            src={tempCover}
            alt="Cover Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90" />
          
          {/* Cover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/30 to-transparent" />

          {/* Universal cover photo reactions & Interactive Cover Badge - MOVED to OPPOSITE side (left side) so it never overlaps the avatar circle */}
          <div className="absolute top-3 left-3 rtl:left-3 rtl:right-auto z-10 flex items-center gap-1.5 flex-wrap max-w-[70%]">
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (playSynthSound) playSynthSound("tap");
                if (triggerHapticFeedback) triggerHapticFeedback("tap");
                setCoverModalMode("cover");
                setShowCoverModal(true);
              }}
              className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-orange-500/50 text-white text-[10px] font-black flex items-center gap-1 shadow-xl hover:border-orange-400 hover:scale-105 transition-all cursor-pointer">
              
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse shrink-0" />
              <span className="truncate">{isArabic ? "التفاعل مع الغلاف 🔥" : "Interact with Cover 🔥"}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (playSynthSound) playSynthSound("tap");
                if (triggerHapticFeedback) triggerHapticFeedback("tap");
                setCustomizationInitialPage(2);
                setShowAccountCustomization(true);
              }}
              className="bg-black/85 hover:bg-black/95 px-2.5 py-1 rounded-xl border border-zinc-700/60 text-zinc-200 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-lg active:scale-95 hover:border-[#FF7A00]">
              
              <Edit className="w-3 h-3 text-[#FF7A00] shrink-0" />
              <span className="hidden sm:inline">{isArabic ? "تعديل الغلاف" : "Edit Cover"}</span>
            </button>
          </div>

          {/* Universal cover photo reactions under it - MOVED to OPPOSITE side (left side) as well */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (playSynthSound) playSynthSound("tap");
              if (triggerHapticFeedback) triggerHapticFeedback("tap");
              setCoverModalMode("cover");
              setShowCoverModal(true);
            }}
            className="absolute bottom-3 left-3 rtl:left-3 rtl:right-auto z-10 scale-80 sm:scale-90 origin-bottom-left bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-xl border border-zinc-700/60 shadow-lg cursor-pointer hover:border-orange-500/60 transition-all">
            
            <UniversalReactions
              targetId={`cover_${currentUser?.username || "me"}`}
              targetType="profile_cover"
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isArabic={isArabic}
              authorId={currentUser?.uid || currentUser?.username}
              triggerInAppNotification={triggerInAppNotification} />
            
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-2 relative">
          
          {/* Avatar Area overlapping Cover */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative group shrink-0">
                <div
                  onClick={() => {
                    if (playSynthSound) playSynthSound("tap");
                    if (triggerHapticFeedback) triggerHapticFeedback("tap");
                    setCoverModalMode("profile");
                    setShowCoverModal(true);
                  }}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] bg-[#0B0B0B] relative flex items-center justify-center transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.9)] shadow-[#FF7A00]/20 cursor-pointer hover:scale-105 active:scale-95 ${currentFrameObj?.style || "border-2 border-[#FF7A00]/40"}`}
                  title={isArabic ? "اضغط للتفاعل على البروفايل" : "Click for Profile Interaction"}>
                  
                  <img
                    src={tempAvatar}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover border-2 border-[#0B0B0B]" />
                  
                  {currentUser?.prestigeLevel > 0 &&
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-black border-2 border-[#0B0B0B] shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-bounce" title="Prestige Elite">
                      ★
                    </div>
                  }
                  {/* Level badge overlay */}
                  <div className="absolute -top-1 -left-1 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-black shadow-md">
                    Lvl {currentUser?.level || 42}
                  </div>
                </div>

                {/* Avatar / Profile Reaction Controls */}
                <div className="mt-2.5 flex flex-col gap-1.5 w-full">
                  <button
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      if (triggerHapticFeedback) triggerHapticFeedback("tap");
                      setCoverModalMode("profile");
                      setShowCoverModal(true);
                    }}
                    className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 hover:from-orange-500/35 hover:to-red-500/35 text-orange-400 border border-orange-500/40 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95">
                    
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                    <span>{isArabic ? "التفاعل على البروفايل 🔥" : "Interact with Profile 🔥"}</span>
                  </button>

                  <div className="scale-85 origin-left select-none bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-xl border border-zinc-800 shadow-md">
                    <UniversalReactions
                      targetId={`avatar_${currentUser?.username || "me"}`}
                      targetType="profile_avatar"
                      currentUser={currentUser}
                      setCurrentUser={setCurrentUser}
                      isArabic={isArabic}
                      authorId={currentUser?.uid || currentUser?.username}
                      triggerInAppNotification={triggerInAppNotification} />
                    
                  </div>
                </div>
              </div>

              {/* Name & Title Header */}
              <div className="space-y-1.5 pt-12 sm:pt-16">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2">
                    <span>{tempName}</span>
                    <CheckCircle className="w-5 h-5 text-[#FF7A00] fill-[#FF7A00]/20 inline-block" />
                  </h1>

                  <LevelBadge
                    level={currentUser?.level || 1}
                    size="sm"
                    showTitle={true}
                    showIcon={true}
                    isArabic={isArabic}
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      setShow100LevelBadgesModal(true);
                    }} />
                  
                  
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-[1.5px] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                    <div className="bg-[#0B0B0B] px-2 py-0.5 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-yellow-400 tracking-wider">PRO OTAKU</span>
                    </div>
                  </div>

                  {currentUser?.prestigeLevel > 0 &&
                  <span className="text-[10px] bg-red-950/90 text-red-400 border border-red-800/80 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                      Prestige {currentUser?.prestigeLevel}
                    </span>
                  }
                </div>

                {/* Metadata Row: Username, UID, Mood, Online status, Location */}
                <div className="flex items-center gap-2.5 flex-wrap text-xs text-zinc-400 font-medium pt-0.5">
                  <span className="text-zinc-400 font-mono font-bold">@{currentUser?.username || "luffy_otaku"}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-mono text-[11px]">UID: AB-983021-99</span>
                  <span className="text-zinc-600">•</span>
                  <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1 ${activeTheme.badgeColor}`}>
                    <span>{tempMood}</span>
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

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full mt-4">
              <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  if (triggerHapticFeedback) triggerHapticFeedback("tap");
                  setCustomizationInitialPage(null);
                  setShowAccountCustomization(true);
                }}
                className="h-11 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] hover:from-[#FF8A10] hover:to-[#FF4B40] text-white text-xs font-black rounded-[18px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF7A00]/20 active:scale-95 cursor-pointer">
                
                <Shield className="w-4 h-4" />
                <span>{isArabic ? "تخصيص الحساب" : "Account Customization"}</span>
              </button>

              <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  if (triggerHapticFeedback) triggerHapticFeedback("tap");
                  setCustomizationInitialPage(null);
                  setShowAccountCustomization(true);
                }}
                className="h-11 bg-[#1A1A1E] hover:bg-[#222228] border border-zinc-700/60 text-white text-xs font-black rounded-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
                
                <Sliders className="w-4 h-4 text-[#FF7A00]" />
                <span>{isArabic ? "تخصيص الهوية" : "Customize Profile"}</span>
              </button>

              <button
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setShowGiftModal(true);
                }}
                className="h-11 bg-[#1A1A1E] hover:bg-[#222228] border border-zinc-700/60 text-white text-xs font-black rounded-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
                
                <Gift className="w-4 h-4 text-red-500 animate-pulse" />
                <span>{isArabic ? "إرسال هدية" : "Send Gift"}</span>
              </button>

              <button
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setShowPassport(true);
                }}
                className="h-11 bg-[#1A1A1E] hover:bg-[#222228] border border-zinc-700/60 text-white text-xs font-black rounded-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
                
                <QrCode className="w-4 h-4 text-zinc-300" />
                <span>{isArabic ? "جواز السفر" : "My Passport"}</span>
              </button>

              <button
                onClick={() => {
                  playSynthSound("success");
                  triggerHapticFeedback("tap");
                  navigator.clipboard.writeText(`https://animeblack.app/u/${currentUser?.username || "me"}`);
                  triggerInAppNotification(
                    isArabic ? "تم نسخ الرابط" : "Link Copied",
                    isArabic ? "تم نسخ رابط الملف الشخصي لمشاركته مع أصدقائك!" : "Profile link copied to clipboard!",
                    "🔗"
                  );
                }}
                className="h-11 bg-[#1A1A1E] hover:bg-[#222228] border border-zinc-700/60 text-zinc-200 text-xs font-black rounded-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer col-span-2 sm:col-span-1">
                
                <Share2 className="w-4 h-4 text-[#FF7A00]" />
                <span>{isArabic ? "مشاركة الملف" : "Share Profile"}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* COMPREHENSIVE OTAKU STATS BANNER CARD */}
      <div className="bg-gradient-to-r from-[#18121f] via-[#14141c] to-[#18121f] border border-orange-500/30 p-5 rounded-[24px] shadow-2xl relative overflow-hidden group hover:border-orange-500/60 transition-all">
        <div className="absolute top-0 left-0 w-64 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FF3D00] flex items-center justify-center text-white shadow-lg shadow-orange-950/50 shrink-0">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">{isArabic ? "إحصائيات الأوتاكو الشاملة" : "Comprehensive Otaku Analytics"}</h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  PRO STATS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isArabic ? "تحليل كامل لساعات المشاهدة، المانجا، التصنيفات، والاستوديوهات المفضلة" : "Detailed breakdown of episodes, manga, genres, and favorite studios"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (playSynthSound) playSynthSound("tap");
              if (triggerHapticFeedback) triggerHapticFeedback("tap");
              setShowOtakuStatsModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF3D00] hover:from-[#FF8A10] hover:to-[#FF4B40] text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-950/50 hover:scale-105 active:scale-95">
            
            <BarChart2 className="w-4 h-4" />
            <span>{isArabic ? "فتح الإحصائيات الشاملة" : "Open Otaku Stats"}</span>
          </button>
        </div>
      </div>

      {/* DEDICATED CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* CARD 1: BIO CARD */}
        <div className="bg-[#141414] border border-zinc-800/80 p-5 rounded-[22px] shadow-lg flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#FF7A00]">📝</span>
              <span>{isArabic ? "النبذة الشخصية" : "Otaku Biography"}</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">{tempTitle}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {tempBio}
          </p>
        </div>

        {/* CARD 2: FAVORITE ANIME & MANGA CARD */}
        <div className="bg-[#141414] border border-zinc-800/80 p-5 rounded-[22px] shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#FF7A00]">⭐</span>
              <span>{isArabic ? "الأنمي والمانجا المفضلة" : "Favorite Anime & Manga"}</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1.5">🎬 {isArabic ? "الأنمي" : "Anime"}</span>
              <div className="flex flex-wrap gap-1.5">
                {tempFavAnime ? tempFavAnime.split(",").map((item, idx) =>
                <span key={`fav_anime_${item}_${idx}`} className="text-[10px] bg-[#1E1E24] px-2.5 py-1 rounded-xl border border-zinc-700/60 text-zinc-200 font-bold hover:border-[#FF7A00] transition-colors">
                    {item.trim()}
                  </span>
                ) : <span className="text-[10px] text-zinc-600">{isArabic ? "غير محدد" : "None"}</span>}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1.5">📚 {isArabic ? "المانجا" : "Manga"}</span>
              <div className="flex flex-wrap gap-1.5">
                {tempFavManga ? tempFavManga.split(",").map((item, idx) =>
                <span key={`fav_manga_${item}_${idx}`} className="text-[10px] bg-[#1E1E24] px-2.5 py-1 rounded-xl border border-zinc-700/60 text-zinc-200 font-bold hover:border-purple-500 transition-colors">
                    {item.trim()}
                  </span>
                ) : <span className="text-[10px] text-zinc-600">{isArabic ? "غير محدد" : "None"}</span>}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CARD 3: LEVEL & RANK PROGRESS CARD */}
      <div className="bg-[#141414] border border-zinc-800/80 p-5 rounded-[22px] shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 flex-wrap gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (playSynthSound) playSynthSound("tap");
              setShow100LevelBadgesModal(true);
            }}>
            
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.4)] flex items-center justify-center p-1 bg-[#0B0B0B] group-hover:scale-105 transition-transform">
              <img src={getBadgeImgForLevel(currentUser?.level || 1)} alt="Badge" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <LevelBadge
                  level={currentUser?.level || 1}
                  size="sm"
                  showTitle={true}
                  showIcon={true}
                  isArabic={isArabic} />
                
              </div>
              <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">{isArabic ? "رتبة الأوتاكو الرسمية (اضغط لاستعراض 100 شارة)" : "Official Otaku Tier Rank (Tap for 100 Badges)"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                setShow100LevelBadgesModal(true);
              }}
              className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer">
              
              <Award className="w-3.5 h-3.5 text-white shrink-0" />
              <span>🏆 {isArabic ? "استعراض الـ 100 شارة" : "100 Badges Hub"}</span>
            </button>

            <button
              onClick={handlePrestigeUpgrade}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-black text-[10px] font-black px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer">
              
              <Award className="w-3.5 h-3.5 text-black shrink-0" />
              <span>👑 Prestige Reset</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#0B0B0B] rounded-full h-3 overflow-hidden border border-zinc-800 p-[2px]">
            <div
              className="bg-gradient-to-r from-[#FF7A00] via-[#FF3B30] to-yellow-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(255,122,0,0.6)]"
              style={{ width: `${(currentUser?.xp || 4200) % 1000 / 10}%` }} />
            
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>Level {currentUser?.level || 42}</span>
            <span>Next Rank: Level {(currentUser?.level || 42) + 1}</span>
          </div>
        </div>
      </div>

      {/* CARD 4: COMPACT SECURITY & WALLET OPTION */}
      <div
        onClick={() => {
          if (playSynthSound) playSynthSound("tap");
          if (triggerHapticFeedback) triggerHapticFeedback("tap");
          setShowSecurityModal(true);
        }}
        className="bg-[#141414] border border-zinc-800/80 hover:border-[#FF7A00]/60 p-4 rounded-[22px] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden transition-all hover:bg-[#18181c] cursor-pointer group">
        
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500/20 via-red-500/10 to-amber-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF7A00] shadow-inner shrink-0">
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[#FF7A00] transition-colors">
                {isArabic ? "مركز معلومات الأمان والمحفظة" : "Security & Wallet Center"}
              </h3>
              <span className="text-[9px] bg-red-950/60 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full font-black uppercase">
                {isArabic ? "خاص بك" : "Private"}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isArabic ? "انقر للدخول إلى صفحات الأمان، المحفظة، البريد الإلكتروني، والجلسات المشفرة" : "Click to view pages for security info, wallet balances, email, and active sessions"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isArabic ? "مُؤمّن 2FA" : "2FA Active"}
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* CARD 5: STREAMLINED QUICK STATS STRIP & PRO STATS HUB BUTTON */}
      <div className="bg-[#141414] border border-zinc-800/80 p-4 rounded-[22px] shadow-lg space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-[#FF7A00]">📊</span>
            <span>{isArabic ? "ملخص النشاط والتفاعل" : "Activity & Engagement Summary"}</span>
          </span>
          <button
            onClick={() => {
              if (playSynthSound) playSynthSound("tap");
              if (triggerHapticFeedback) triggerHapticFeedback("tap");
              setShowOtakuStatsModal(true);
            }}
            className="text-[11px] font-bold text-[#FF7A00] hover:text-[#FFA040] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isArabic ? "عرض لوحة الإحصائيات الكاملة" : "Full Analytics Hub"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            onClick={() => {
              playSynthSound?.("tap");
              window.dispatchEvent(new CustomEvent('openFollowers', { detail: { type: "followers", userId: currentUser.uid } }));
            }}
            className="p-3 bg-[#1A1A1E] border border-zinc-800/80 hover:border-[#FF7A00]/50 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-1 group active:scale-95"
          >
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>{isArabic ? "المتابعين" : "Followers"}</span>
            </span>
            <span className="text-base font-black text-white font-mono group-hover:text-[#FF7A00] transition-colors">
              {currentUser?.followers?.length || 0}
            </span>
          </div>

          <div
            onClick={() => {
              playSynthSound?.("tap");
              window.dispatchEvent(new CustomEvent('openFollowers', { detail: { type: "following", userId: currentUser.uid } }));
            }}
            className="p-3 bg-[#1A1A1E] border border-zinc-800/80 hover:border-purple-500/50 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-1 group active:scale-95"
          >
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-purple-400" />
              <span>{isArabic ? "يتابع" : "Following"}</span>
            </span>
            <span className="text-base font-black text-white font-mono group-hover:text-purple-400 transition-colors">
              {currentUser?.following?.length || 0}
            </span>
          </div>

          <div
            onClick={() => {
              playSynthSound?.("tap");
              setProfileTab("posts");
            }}
            className="p-3 bg-[#1A1A1E] border border-zinc-800/80 hover:border-cyan-500/50 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-1 group active:scale-95"
          >
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isArabic ? "المنشورات" : "Posts"}</span>
            </span>
            <span className="text-base font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
              {userPostsList.length}
            </span>
          </div>

          <div
            onClick={() => {
              playSynthSound?.("tap");
              if (triggerHapticFeedback) triggerHapticFeedback("tap");
              setShowOtakuStatsModal(true);
            }}
            className="p-3 bg-[#1A1A1E] border border-zinc-800/80 hover:border-amber-500/50 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-1 group active:scale-95"
          >
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
              <span>{isArabic ? "السمعة" : "Reputation"}</span>
            </span>
            <span className="text-base font-black text-yellow-400 font-mono flex items-center gap-1">
              <span>⭐ {currentUser?.reputation || 142}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SEGMENTED TABS BAR */}
      <div className="relative bg-[#141414] p-1.5 rounded-[20px] border border-zinc-800/80 flex overflow-x-auto gap-1 scrollbar-none shadow-md">
        {[
        { id: "posts", labelAr: "📝 منشوراتي", labelEn: "My Posts", count: userPostsList.length },
        { id: "reels", labelAr: "🎥 ريلز", labelEn: "My Reels", count: reels.length },
        { id: "saved", labelAr: "🔒 المحفوظات", labelEn: "Saved Vault", count: savedItems.length },
        { id: "guilds", labelAr: "👥 نقاباتي", labelEn: "My Guilds", count: guildsList.length },
        { id: "achievements", labelAr: "🏆 الإنجازات", labelEn: "Achievements", count: achievements.length },
        { id: "inventory", labelAr: "🔒 الحقيبة", labelEn: "My Backpack", count: 3 },
        { id: "analytics", labelAr: "🔒 الإحصائيات", labelEn: "Analytics", count: null }].
        map((tab, _autoIdx) => {
          const isSelected = profileTab === tab.id;
          return (
            <button
              key={`usr_tab_${tab.id}_${_autoIdx}`}
              onClick={() => {
                setProfileTab(tab.id as any);
                playSynthSound("tap");
                triggerHapticFeedback("tap");
              }}
              className={`relative z-10 text-xs font-black px-4 py-2.5 rounded-[16px] transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              isSelected ? "text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"}`
              }>
              
              {isSelected &&
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute inset-0 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] rounded-[16px] -z-10 shadow-md shadow-[#FF7A00]/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />

              }
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.count !== null &&
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${isSelected ? "bg-black/30 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                  {tab.count}
                </span>
              }
            </button>);

        })}
      </div>

      {/* TABS CONTENT PANELS */}
      <div className="space-y-4">
        
        {/* POSTS TAB */}
        {profileTab === "posts" &&
        <div className="space-y-3">
            {userPostsList.length === 0 ?
          <div className="text-center py-12 bg-[#141414] rounded-[22px] border border-zinc-800/80 text-zinc-500 text-xs font-medium">
                {isArabic ? "لم تقم بنشر أي منشور حتى الآن! توجه لمنشئ المحتوى وانشر أول كبسولة أوتـاكو." : "You haven't posted any updates yet. Share your first Otaku capsule."}
              </div> :

          userPostsList.map((post, idx) => {
            const fullPost = {
              ...post,
              author: post.author || {
                id: currentUser?.uid || currentUser?.id,
                uid: currentUser?.uid || currentUser?.id,
                name: currentUser?.name || "User",
                username: currentUser?.username || "user",
                avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                level: currentUser?.level || currentUser?.prestigeLevel || 1
              }
            };
            return (
              <PostItem
                key={post.id ? `usr_post_${post.id}_${idx}` : `usr_post_idx_${idx}`}
                post={fullPost}
                currentUser={currentUser}
                isArabic={isArabic}
                playSynthSound={playSynthSound}
                triggerHapticFeedback={triggerHapticFeedback}
                triggerInAppNotification={triggerInAppNotification}
                onUpdatePost={(updatedPost) => {
                  setPosts((prev) => prev.map((p, _autoIdx) => p.id === updatedPost.id ? updatedPost : p));
                }}
                onDeletePost={(postId) => {
                  setPosts((prev) => prev.filter((p) => p.id !== postId));
                  triggerInAppNotification(
                    isArabic ? "تم الحذف" : "Post Deleted",
                    isArabic ? "تم حذف المنشور بنجاح" : "Post deleted successfully",
                    "🗑️"
                  );
                }} />);


          })
          }
          </div>
        }

        {/* REELS TAB */}
        {profileTab === "reels" &&
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {reels.map((reel, rIdx) =>
          <div key={reel.id ? `pro_reel_${reel.id}_${rIdx}` : `pro_reel_${rIdx}`} className="aspect-[9/16] bg-[#141414] rounded-[20px] border border-zinc-800 overflow-hidden relative group shadow-md hover:border-[#FF7A00] transition-all cursor-pointer">
                <img src={reel.thumbnail || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300"} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-xs text-white font-bold block truncate">{reel.title}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">👁️ {reel.views || "430 views"}</span>
                </div>
              </div>
          )}
          </div>
        }

        {/* SAVED ITEMS TAB */}
        {profileTab === "saved" &&
        <div className="space-y-3">
            {savedItems.map((item, idx) =>
          <div key={item.id ? `pro_saved_${item.id}_${idx}` : `pro_saved_${idx}`} className="p-4 bg-[#141414] rounded-[20px] border border-zinc-800 flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <span className="text-[9px] bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-bold uppercase">{item.type}</span>
                  <h4 className="text-xs font-bold text-white">{isArabic ? item.titleAr : item.titleEn}</h4>
                </div>
                <Bookmark className="w-5 h-5 text-[#FF7A00] fill-[#FF7A00]" />
              </div>
          )}
          </div>
        }

        {/* GUILDS TAB */}
        {profileTab === "guilds" &&
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guildsList.map((g, idx) =>
          <div key={g.id ? `pro_guild_${g.id}_${idx}` : `pro_guild_${idx}`} className="p-4 bg-[#141414] rounded-[20px] border border-zinc-800 space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-white">{isArabic ? g.nameAr : g.nameEn}</h4>
                    <span className="text-[10px] text-zinc-500">{g.members} members joined</span>
                  </div>
                  <span className="text-[9px] bg-yellow-950/80 text-yellow-400 border border-yellow-800/60 px-2 py-0.5 rounded font-black">{g.rank}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-2 border-t border-zinc-800/60 text-zinc-400">
                  <span>{g.activeRooms} voice rooms online</span>
                  <button className="text-[10px] bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white font-black px-3 py-1.5 rounded-xl cursor-pointer shadow-md">
                    {isArabic ? "دخول" : "Enter"}
                  </button>
                </div>
              </div>
          )}
          </div>
        }

        {/* ACHIEVEMENTS TAB */}
        {profileTab === "achievements" &&
        <div className="space-y-3">
            {achievements.map((a, idx) =>
          <div key={a.id ? `pro_achieve_${a.id}_${idx}` : `pro_achieve_${idx}`} className={`p-4 rounded-[20px] border flex items-center gap-4 transition-all ${
          a.unlocked ? "bg-[#141414] border-zinc-800 shadow-md" : "bg-[#141414]/50 border-zinc-900 opacity-50"}`
          }>
                <div className="text-3xl shrink-0">{a.icon}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">{isArabic ? a.nameAr : a.nameEn}</h4>
                    {a.unlocked && <span className="text-[9px] bg-green-950/80 text-green-400 border border-green-800/60 px-2 py-0.5 rounded font-bold uppercase">{isArabic ? "مكتمل" : "Unlocked"}</span>}
                  </div>
                  <p className="text-[11px] text-zinc-400">{isArabic ? a.descAr : a.descEn}</p>
                </div>
              </div>
          )}
          </div>
        }

        {/* INVENTORY TAB */}
        {profileTab === "inventory" &&
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#141414] border border-zinc-800 rounded-[20px] text-center space-y-2 shadow-md">
              <span className="text-3xl">🖼️</span>
              <h5 className="text-xs font-black text-zinc-200">{isArabic ? "إطار هالة النار" : "Fire Aura Frame"}</h5>
              <span className="block text-[9px] text-green-400 bg-green-950/40 py-1 rounded-xl border border-green-800/40 font-bold uppercase">{isArabic ? "مفعل حالياً" : "Active"}</span>
            </div>
            <div className="p-4 bg-[#141414] border border-zinc-800 rounded-[20px] text-center space-y-2 shadow-md">
              <span className="text-3xl">🛡️</span>
              <h5 className="text-xs font-black text-zinc-200">{isArabic ? "بطاقات حماية Streak (٢)" : "Streak Shields (2)"}</h5>
              <span className="block text-[9px] text-zinc-400 bg-zinc-800/60 py-1 rounded-xl font-bold uppercase">{isArabic ? "قابل للاستخدام" : "Usable"}</span>
            </div>
            <div className="p-4 bg-[#141414] border border-zinc-800 rounded-[20px] text-center space-y-2 opacity-60 shadow-md">
              <span className="text-3xl">🃏</span>
              <h5 className="text-xs font-black text-zinc-200">{isArabic ? "بطاقة هنتر كارد" : "Hunter Card"}</h5>
              <span className="block text-[9px] text-zinc-500 font-bold uppercase">{isArabic ? "مغلقة" : "Locked"}</span>
            </div>
          </div>
        }

        {/* ANALYTICS TAB */}
        {profileTab === "analytics" &&
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#141414] p-4 rounded-[20px] border border-zinc-800 space-y-1 shadow-md">
                <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "أوقات النشر الفعالة للأوتاكو" : "Personal Best Publish Window"}</span>
                <span className="text-xs font-black text-[#FF7A00] block">{analyticsData.bestPublishTime}</span>
              </div>
              <div className="bg-[#141414] p-4 rounded-[20px] border border-zinc-800 space-y-1 shadow-md">
                <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "متوسط تقييم حماس منشوراتك" : "Avg Post Hype Factor"}</span>
                <span className="text-xs font-black text-cyan-400 block font-mono">{analyticsData.averageHypeFactor}</span>
              </div>
            </div>

            <div className="bg-[#141414] p-5 rounded-[22px] border border-zinc-800 space-y-3 shadow-md">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest block">📈 {isArabic ? "منحنى نمو التفاعل (آخر ٦ أيام)" : "Weekly Otaku Engagement Curve"}</span>
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {analyticsData.activityScore.map((score, idx) =>
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[9px] text-zinc-400 font-mono font-bold">{score}%</div>
                    <div
                  className="w-full bg-gradient-to-t from-[#FF3B30] to-[#FF7A00] rounded-t-xl transition-all duration-500"
                  style={{ height: `${score}%` }} />
                
                    <span className="text-[9px] text-zinc-500 font-mono">Day {idx + 1}</span>
                  </div>
              )}
              </div>
            </div>

            <div className="bg-[#141414] p-5 rounded-[22px] border border-zinc-800 space-y-3 shadow-md">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest block">📜 {isArabic ? "سجل النشاطات الفورية" : "Personal Action Logs"}</span>
              <div className="space-y-2">
                {activityLogs.map((log, _autoIdx) =>
              <div key={`${log.id}_${_autoIdx}`} className="flex justify-between text-xs bg-[#1A1A1E] p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-zinc-300 font-medium">✓ {isArabic ? log.actionAr : log.actionEn}</span>
                    <span className="text-zinc-500 text-[10px] font-mono">{log.time}</span>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

      </div>

      {/* DIGITAL PASSPORT MODAL */}
      <AnimatePresence>
        {showPassport &&
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowPassport(false)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm" />
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-[#141414] border-2 border-zinc-800 p-5 rounded-[24px] z-[125] space-y-4 shadow-2xl relative overflow-hidden">
            
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF7A00]">★</span>
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">
                    {isArabic ? "بطاقة الهوية الرقمية الموحدة" : "ANIME BLACK DIGITAL ID"}
                  </span>
                </div>
                <button onClick={() => setShowPassport(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#0B0B0B] p-4 rounded-2xl border border-zinc-800 space-y-4 relative">
                <div className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-black relative flex items-center justify-center p-0.5">
                    <img src={tempAvatar} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                      {currentUser?.role || "PRO OTAKU"}
                    </span>
                    <h4 className="text-xs font-black text-white truncate leading-none mt-1">{tempName}</h4>
                    <p className="text-[9px] text-zinc-500 font-mono truncate mt-0.5">@{currentUser?.username || "luffy_otaku"}</p>
                    <div className="text-[8px] text-zinc-400 font-bold truncate">Title: {tempTitle}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold border-t border-zinc-800 pt-3">
                  <div className="bg-[#141414] p-1.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">UID CODE</span>
                    <span className="text-zinc-200 font-mono font-bold">AB-983021-99</span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">PRESTIGE LEVEL</span>
                    <span className="text-zinc-200 font-mono font-bold">★ {currentUser?.prestigeLevel || 0} Reset</span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">JOIN DATE</span>
                    <span className="text-zinc-200 font-mono font-bold">2026-07-05</span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">REPUTATION</span>
                    <span className="text-green-400 font-mono font-bold">GOLDEN TRUST</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-zinc-500 uppercase font-black block">Passport URL</span>
                    <span className="text-[9px] text-[#FF7A00] font-bold font-mono">animeblack.app/u/{currentUser?.username || "me"}</span>
                  </div>
                  <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://animeblack.app/u/${currentUser?.username || "me"}`} className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center bg-[#0B0B0B] border border-zinc-800 p-2.5 rounded-2xl relative z-10">
                <UniversalReactions
                targetId={`idcard_${currentUser?.username || "me"}`}
                targetType="id_card"
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                isArabic={isArabic}
                authorId={currentUser?.uid || currentUser?.username}
                triggerInAppNotification={triggerInAppNotification} />
              
              </div>

              <div className="flex gap-2">
                <button
                onClick={() => {
                  playSynthSound("success");
                  triggerHapticFeedback("success");
                  triggerInAppNotification(
                    isArabic ? "تم حفظ الهوية بجهازك!" : "Saved to Photos!",
                    isArabic ? "تم تحميل جواز سفر الأوتـاكو الخاص بك بنجاح." : "Your Digital Otaku passport image was saved.",
                    "📸"
                  );
                }}
                className="flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FF3B30] text-white font-black text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                
                  <Download className="w-3.5 h-3.5" />
                  <span>{isArabic ? "تحميل البطاقة" : "Save Image"}</span>
                </button>
                <button
                onClick={() => {
                  playSynthSound("success");
                  triggerHapticFeedback("tap");
                  navigator.clipboard.writeText(`https://animeblack.app/u/${currentUser?.username || "me"}`);
                  triggerInAppNotification(
                    isArabic ? "تم نسخ الرابط" : "Link Copied",
                    isArabic ? "تم نسخ رابط جواز السفر الخاص بك بنجاح!" : "Passport link copied!",
                    "🔗"
                  );
                }}
                className="bg-[#1A1A1E] border border-zinc-800 text-zinc-300 font-bold text-[10px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isArabic ? "نسخ الرابط" : "Copy Link"}</span>
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* SEND GIFT MODAL */}
      <AnimatePresence>
        {showGiftModal &&
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowGiftModal(false)} className="fixed inset-0 bg-black z-[120]" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#141414] border border-zinc-800 p-5 rounded-[22px] z-[125] space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-white">{isArabic ? "إرسال هدية لأوتـاكو آخر" : "Send Otaku Gift"}</span>
                <button onClick={() => setShowGiftModal(false)} className="p-1 hover:bg-zinc-800 rounded cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isArabic ? "اختر هدية مميزة لتبادلها مع أصدقائك في المنصة لدعم مستواهم ومصداقيتهم!" : "Select a gift to support other creators."}
              </p>
              <div className="space-y-2">
                <button
                onClick={() => handleSendGift("Shonen Ramen Cup 🍜", 50)}
                className="w-full p-3 bg-[#0B0B0B] hover:bg-[#1A1A1E] border border-zinc-800 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer">
                
                  <span className="flex items-center gap-2">
                    <span>🍜</span>
                    <span>Shonen Ramen Cup</span>
                  </span>
                  <span className="text-yellow-400 font-black">50 Coins</span>
                </button>
                <button
                onClick={() => handleSendGift("Hokage Scroll 📜", 150)}
                className="w-full p-3 bg-[#0B0B0B] hover:bg-[#1A1A1E] border border-zinc-800 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer">
                
                  <span className="flex items-center gap-2">
                    <span>📜</span>
                    <span>Hokage Scroll</span>
                  </span>
                  <span className="text-yellow-400 font-black">150 Coins</span>
                </button>
                <button
                onClick={() => handleSendGift("S-Rank Devil Fruit 🍇", 350)}
                className="w-full p-3 bg-[#0B0B0B] hover:bg-[#1A1A1E] border border-zinc-800 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer">
                
                  <span className="flex items-center gap-2">
                    <span>🍇</span>
                    <span>S-Rank Devil Fruit</span>
                  </span>
                  <span className="text-yellow-400 font-black">350 Coins</span>
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* ACCOUNT CUSTOMIZATION MODAL */}
      <AnimatePresence>
        {showAccountCustomization &&
        <AccountCustomizationSystem
          isArabic={isArabic}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          playSynthSound={playSynthSound}
          triggerHapticFeedback={triggerHapticFeedback}
          triggerInAppNotification={triggerInAppNotification}
          initialPage={customizationInitialPage}
          onClose={() => setShowAccountCustomization(false)} />

        }
      </AnimatePresence>

      {/* COVER INTERACTION MODAL */}
      <CoverInteractionModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        coverUrl={tempCover}
        username={currentUser?.username || "me"}
        displayName={tempName}
        avatarUrl={tempAvatar}
        isArabic={isArabic}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isOwner={true}
        mode={coverModalMode}
        onEditCover={() => {
          setShowCoverModal(false);
          setIsEditing(true);
        }}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback} />
      

      {/* COMPREHENSIVE OTAKU STATS MODAL */}
      <OtakuStatsModal
        isOpen={showOtakuStatsModal}
        onClose={() => setShowOtakuStatsModal(false)}
        isArabic={isArabic}
        currentUser={currentUser}
        playSynthSound={playSynthSound}
        triggerHapticFeedback={triggerHapticFeedback} />
      

      {/* SECURITY & WALLET MODAL WITH MULTIPLE PAGES/TABS */}
      <AnimatePresence>
        {showSecurityModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowSecurityModal(false)}>
          
            <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121216] border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-850 flex justify-between items-center bg-[#16161c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                    <Shield className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{isArabic ? "مركز معلومات الأمان والمحفظة" : "Private Security & Wallet Center"}</span>
                      <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full font-black">
                        {isArabic ? "مرئي لك فقط" : "Private"}
                      </span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ? "إدارة أمان الحساب، البريد، الـ UID، الأرصدة والجلسات النشطة" : "Manage credentials, UID, wallet balances, and active sessions"}
                    </p>
                  </div>
                </div>

                <button
                onClick={() => setShowSecurityModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer">
                
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs (Pages) */}
              <div className="flex border-b border-zinc-850 bg-[#141418] p-1.5 gap-1 overflow-x-auto">
                <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  setSecTab("info");
                }}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                secTab === "info" ?
                "bg-[#FF7A00] text-white shadow-lg shadow-orange-950/40" :
                "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`
                }>
                
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isArabic ? "معلومات الحساب" : "Credentials"}</span>
                </button>

                <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  setSecTab("wallet");
                }}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                secTab === "wallet" ?
                "bg-[#FF7A00] text-white shadow-lg shadow-orange-950/40" :
                "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`
                }>
                
                  <Coins className="w-3.5 h-3.5" />
                  <span>{isArabic ? "المحفظة والأرصدة" : "Wallet Ledger"}</span>
                </button>

                <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  setSecTab("sessions");
                }}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                secTab === "sessions" ?
                "bg-[#FF7A00] text-white shadow-lg shadow-orange-950/40" :
                "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`
                }>
                
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isArabic ? "الأجهزة والجلسات" : "Active Sessions"}</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {secTab === "info" &&
              <div className="space-y-4">
                    <div className="flex justify-between items-center bg-[#18181f] p-3 rounded-2xl border border-zinc-800">
                      <span className="text-xs font-black text-zinc-300">{isArabic ? "حالة إظهار البيانات الحساسة" : "Sensitive Data Privacy"}</span>
                      <button
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="text-xs bg-black hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                    
                        {showSensitiveData ? <EyeOff className="w-3.5 h-3.5 text-red-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{showSensitiveData ? isArabic ? "إخفاء البيانات" : "Hide Data" : isArabic ? "إظهار البيانات" : "Show Data"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 space-y-2">
                        <span className="text-zinc-400 text-[10px] uppercase font-black block">{isArabic ? "البريد الإلكتروني المسجل" : "Registered Email"}</span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-white font-mono font-bold truncate">
                            {showSensitiveData ? currentUser?.email || "luffy_secure_otaku@gmail.com" : "luff***@gmail.com"}
                          </span>
                          <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentUser?.email || "luffy_secure_otaku@gmail.com");
                          triggerInAppNotification(isArabic ? "تم النسخ" : "Copied", isArabic ? "تم نسخ البريد الإلكتروني" : "Email copied");
                        }}
                        className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-2.5 py-1 rounded-lg border border-zinc-700 cursor-pointer shrink-0">
                        
                            {isArabic ? "نسخ" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 space-y-2">
                        <span className="text-zinc-400 text-[10px] uppercase font-black block">{isArabic ? "معرف المستند UID" : "Account UID"}</span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-white font-mono font-bold truncate">
                            {showSensitiveData ? currentUser?.uid || "UID_UNKNOWN_983" : "AB-983***99"}
                          </span>
                          <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentUser?.uid || "AB-983021-99");
                          triggerInAppNotification(isArabic ? "تم النسخ" : "Copied", isArabic ? "تم نسخ UID" : "UID copied");
                        }}
                        className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-2.5 py-1 rounded-lg border border-zinc-700 cursor-pointer shrink-0">
                        
                            {isArabic ? "نسخ" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white block">{isArabic ? "تخصيص الأمان وكلمة المرور" : "Security & Password Setup"}</span>
                        <span className="text-[10px] text-zinc-400 block">{isArabic ? "تعديل الـ PIN، البريد الإلكتروني، والتحقق بخطوتين" : "Update PIN, security recovery email, and 2FA settings"}</span>
                      </div>
                      <button
                    onClick={() => {
                      setShowSecurityModal(false);
                      setShowAccountCustomization(true);
                    }}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0">
                    
                        {isArabic ? "إعدادات الأمان" : "Security Options"}
                      </button>
                    </div>
                  </div>
              }

                {secTab === "wallet" &&
              <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 rounded-2xl border border-yellow-500/30 space-y-2">
                        <span className="text-yellow-400 text-[10px] uppercase font-black block">{isArabic ? "محفظة كوينز المظلمة" : "Black Coins Ledger"}</span>
                        <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                          <span>🪙 {blackCoins}</span>
                          <span className="text-xs text-zinc-400 font-normal">Coins</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-600/5 rounded-2xl border border-amber-500/30 space-y-2">
                        <span className="text-amber-400 text-[10px] uppercase font-black block">{isArabic ? "نجوم الدعم الذهبي" : "Gold Stars Ledger"}</span>
                        <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                          <span>⭐ {stars}</span>
                          <span className="text-xs text-zinc-400 font-normal">Stars</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 space-y-2">
                      <h4 className="text-xs font-black text-white">{isArabic ? "حماية وتدقيق المحفظة" : "Wallet Audit & Ledger Integrity"}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {isArabic ? "جميع المعاملات المالية والمكافآت يتم تسجيلها وتشفيرها في السجل اللامركزي للحساب." : "All ledger rewards and transactions are cryptographically signed and logged."}
                      </p>
                    </div>
                  </div>
              }

                {secTab === "sessions" &&
              <div className="space-y-3">
                    <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-black text-white">{isArabic ? "الجلسة الحالية النشطة" : "Current Active Session"}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {isArabic ? "نشط الآن" : "Active Now"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300 bg-black/40 p-3 rounded-xl border border-zinc-850">
                        <div>
                          <span className="text-zinc-500 text-[9px] block uppercase font-sans font-bold">{isArabic ? "الجهاز" : "Device"}</span>
                          <span>iPhone 15 Pro Max</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block uppercase font-sans font-bold">{isArabic ? "آخر وصول" : "Last Access"}</span>
                          <span>{isArabic ? "اليوم 09:30 AM" : "Today 09:30 AM"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#18181f] rounded-2xl border border-zinc-800 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-white block">{isArabic ? "تسجيل الخروج من بقية الأجهزة" : "Revoke Other Sessions"}</span>
                        <span className="text-[10px] text-zinc-400 block">{isArabic ? "إنهاء كافة الجلسات النشطة على الأجهزة الأخرى" : "Terminate all active sandbox logins on other browsers"}</span>
                      </div>
                      <button
                    onClick={() => {
                      triggerInAppNotification(isArabic ? "تم الأمان" : "Sessions Revoked", isArabic ? "تم إلغاء الجلسات الأخرى بنجاح" : "Other active sessions terminated");
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0">
                    
                        {isArabic ? "إنهاء الجلسات" : "Revoke All"}
                      </button>
                    </div>
                  </div>
              }
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* 100 LEVEL BADGES GALLERY MODAL */}
      <AnimatePresence>
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
            triggerInAppNotification?.(
              isArabic ? "تم تجهيز الشارة! 🏅" : "Badge Equipped! 🏅",
              isArabic ? `تم تجهيز شارة المستوى ${b.level} (${b.titleAr}) بجانب اسمك!` : `Equipped Level ${b.level} badge (${b.titleEn}) next to your name!`,
              "🏆"
            );
          }} />

        }
      </AnimatePresence>

      {/* COMPREHENSIVE OTAKU STATS MODAL (STANDALONE DEDICATED HUB) */}
      <AnimatePresence>
        {showOtakuStatsModal && (
          <OtakuStatsModal
            isOpen={showOtakuStatsModal}
            onClose={() => setShowOtakuStatsModal(false)}
            isArabic={isArabic}
            currentUser={currentUser}
            playSynthSound={playSynthSound}
            triggerHapticFeedback={triggerHapticFeedback}
          />
        )}
      </AnimatePresence>

    </div>);

}