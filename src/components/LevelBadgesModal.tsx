import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Award,
  Shield,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Crown,
  Zap,
  TrendingUp,
  Gift,
  Flame,
  Info,
  Layers,
  Filter
} from "lucide-react";
import {
  getAll100LevelBadges,
  getLevelBadgeInfo,
  TiersData,
  LevelBadgeInfo,
  LevelTier
} from "../utils/levelBadgeSystem";
import LevelBadge from "./LevelBadge";

interface LevelBadgesModalProps {
  currentUserLevel: number;
  currentUserXp: number;
  isArabic?: boolean;
  onClose: () => void;
  playSynthSound?: (type: "tap" | "success" | "levelup" | "purchase" | "error") => void;
  triggerHapticFeedback?: (type: "tap" | "success" | "levelup" | "purchase" | "error") => void;
  onEquipBadge?: (badge: LevelBadgeInfo) => void;
}

export const LevelBadgesModal: React.FC<LevelBadgesModalProps> = ({
  currentUserLevel = 1,
  currentUserXp = 120,
  isArabic = true,
  onClose,
  playSynthSound,
  triggerHapticFeedback,
  onEquipBadge
}) => {
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<LevelBadgeInfo | null>(null);
  const [equippedLevel, setEquippedLevel] = useState<number>(currentUserLevel);

  const allBadges = getAll100LevelBadges();
  const currentBadgeInfo = getLevelBadgeInfo(currentUserLevel);
  const nextBadgeInfo = getLevelBadgeInfo(Math.min(100, currentUserLevel + 1));

  // XP progress calculation
  const currentLevelXpMin = (currentUserLevel - 1) * 500;
  const currentLevelXpMax = currentUserLevel * 500;
  const xpInCurrentLevel = Math.max(0, currentUserXp - currentLevelXpMin);
  const xpRequiredForCurrentLevel = 500;
  const progressPercent = Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100)));

  // Filter logic
  const filteredBadges = allBadges.filter((b) => {
    // Tier check
    if (selectedTierId !== null && b.tierId !== selectedTierId) return false;

    // Status check
    const isUnlocked = b.level <= currentUserLevel;
    if (statusFilter === "unlocked" && !isUnlocked) return false;
    if (statusFilter === "locked" && isUnlocked) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesLvl = b.level.toString() === q || `lv.${b.level}`.includes(q);
      const matchesTitleAr = b.titleAr.toLowerCase().includes(q);
      const matchesTitleEn = b.titleEn.toLowerCase().includes(q);
      const matchesTierAr = b.tierNameAr.toLowerCase().includes(q);
      const matchesTierEn = b.tierNameEn.toLowerCase().includes(q);
      return matchesLvl || matchesTitleAr || matchesTitleEn || matchesTierAr || matchesTierEn;
    }

    return true;
  });

  const handleEquip = (b: LevelBadgeInfo) => {
    if (b.level > currentUserLevel) return;
    setEquippedLevel(b.level);
    playSynthSound?.("success");
    triggerHapticFeedback?.("success");
    onEquipBadge?.(b);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col font-sans overflow-hidden text-white">
      {/* Top Navigation Header */}
      <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-red-600/30">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{isArabic ? "موسوعة شارات المستويات (1 - 100)" : "100 Level Badges Hierarchy"}</span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-full font-mono font-bold">
                100 Badges
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              {isArabic
                ? "استعرض شارات الأوتوكو المئة الفخمة والترقيات التنافسية وتجهيز الشارة بجانب اسمك"
                : "Explore all 100 progressive anime badges, unlocks, and equip badges next to your name"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playSynthSound?.("tap");
            onClose();
          }}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        {/* User Level Status & XP Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: Active Level Badge Showcase */}
            <div className="flex items-center gap-4">
              <div
                className="relative p-1 rounded-3xl border-2 flex items-center justify-center bg-zinc-950 shadow-2xl transition-transform hover:scale-105"
                style={{
                  borderColor: currentBadgeInfo.borderColor,
                  boxShadow: `0 0 30px ${currentBadgeInfo.glowColor}`,
                }}
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${currentBadgeInfo.badgeBg} flex flex-col items-center justify-center p-2 text-center text-white relative overflow-hidden`}
                >
                  <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rounded-full blur-md" />
                  <span className="text-3xl sm:text-4xl">{currentBadgeInfo.icon}</span>
                  <span className="text-xs font-black font-mono mt-1 drop-shadow">
                    Lv.{currentBadgeInfo.level}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900/80 font-bold uppercase tracking-wider">
                    {currentBadgeInfo.rarity} {isArabic ? "شارة" : "Badge"}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {currentBadgeInfo.tierNameAr}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white" style={{ color: currentBadgeInfo.textColor }}>
                  {isArabic ? currentBadgeInfo.titleAr : currentBadgeInfo.titleEn}
                </h2>

                <p className="text-xs text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isArabic
                      ? `الشارة المجهزة بجانب اسمك حالياً: المستوى ${equippedLevel}`
                      : `Currently equipped badge next to name: Level ${equippedLevel}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: XP Meter & Next Level Progress */}
            <div className="w-full md:w-80 bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  {isArabic ? "تقدم خبرة الـ XP" : "XP Level Progress"}
                </span>
                <span className="text-amber-400 font-mono">
                  {currentUserXp} XP / {currentLevelXpMax} XP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>{isArabic ? `المستوى ${currentUserLevel}` : `Level ${currentUserLevel}`}</span>
                <span>
                  {currentUserLevel < 100
                    ? isArabic
                      ? `متبقي ${currentLevelXpMax - currentUserXp} XP للمستوى التالي`
                      : `${currentLevelXpMax - currentUserXp} XP to Lv.${currentUserLevel + 1}`
                    : isArabic
                    ? "وصلت للمستوى الأقصى 🔥"
                    : "Max Level Reached 🔥"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Filters & Tiers Horizontal Selector */}
        <div className="space-y-4">
          
          {/* Status Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            
            {/* Status Pills */}
            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
              <button
                onClick={() => {
                  playSynthSound?.("tap");
                  setStatusFilter("all");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "all"
                    ? "bg-red-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isArabic ? "جميع الشارات (100)" : "All 100 Badges"}
              </button>
              <button
                onClick={() => {
                  playSynthSound?.("tap");
                  setStatusFilter("unlocked");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "unlocked"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isArabic ? `المفتوحة (${currentUserLevel})` : `Unlocked (${currentUserLevel})`}
              </button>
              <button
                onClick={() => {
                  playSynthSound?.("tap");
                  setStatusFilter("locked");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "locked"
                    ? "bg-zinc-800 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isArabic ? `المغلقة (${100 - currentUserLevel})` : `Locked (${100 - currentUserLevel})`}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "بحث عن مستوى (1-100) أو لقب..." : "Search level number or title..."}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Tier Category Buttons Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                playSynthSound?.("tap");
                setSelectedTierId(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedTierId === null
                  ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg border border-red-500"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isArabic ? "جميع الطبقات الـ 10" : "All 10 Tiers"}</span>
            </button>

            {TiersData.tiers.map((tier, _autoIdx) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <button
                  key={`lvl_tier_${tier.id}_${_autoIdx}`}
                  onClick={() => {
                    playSynthSound?.("tap");
                    setSelectedTierId(tier.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800 text-white shadow-lg border-2"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
                  }`}
                  style={{
                    borderColor: isSelected ? tier.color : "transparent",
                    color: isSelected ? tier.color : undefined
                  }}
                >
                  <span>{tier.icon}</span>
                  <span>
                    {isArabic ? `الطبقة ${tier.id}: ${tier.minLevel}-${tier.maxLevel}` : `Tier ${tier.id}: ${tier.minLevel}-${tier.maxLevel}`}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 100 BADGES GRID DISPLAY */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredBadges.map((badge, index) => {
            const isUnlocked = badge.level <= currentUserLevel;
            const isEquipped = badge.level === equippedLevel;
            const isCurrentLevel = badge.level === currentUserLevel;

            return (
              <motion.div
                key={`badge_lvl_${badge.level}_${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: (index % 12) * 0.02 }}
                onClick={() => {
                  playSynthSound?.("tap");
                  triggerHapticFeedback?.("tap");
                  setActiveBadgeDetail(badge);
                }}
                className={`relative group bg-zinc-900/90 hover:bg-zinc-850 border rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between space-y-2.5 overflow-hidden ${
                  isUnlocked
                    ? "border-zinc-700/80 hover:border-red-500/80 shadow-md"
                    : "border-zinc-850 opacity-60 hover:opacity-90"
                } ${isEquipped ? "ring-2 ring-emerald-500 border-emerald-500 shadow-emerald-500/20" : ""}`}
              >
                {/* Top Badge Card Header */}
                <div className="flex justify-between items-center text-[10px]">
                  <span
                    className="font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800"
                    style={{ color: badge.textColor }}
                  >
                    Lv.{badge.level}
                  </span>

                  {isEquipped ? (
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {isArabic ? "مجهزة" : "Equipped"}
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                      {isArabic ? "مفتوحة" : "Unlocked"}
                    </span>
                  ) : (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      {badge.requiredXp} XP
                    </span>
                  )}
                </div>

                {/* Badge Visual Icon Center */}
                <div className="flex flex-col items-center justify-center my-1">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.badgeBg} flex items-center justify-center text-2xl shadow-lg relative transition-transform group-hover:scale-110`}
                    style={{
                      boxShadow: isUnlocked ? `0 0 12px ${badge.glowColor}` : "none"
                    }}
                  >
                    <span>{badge.icon}</span>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                        <Lock className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-center mt-2.5 line-clamp-1 text-white group-hover:text-red-400 transition-colors">
                    {isArabic ? badge.titleAr : badge.titleEn}
                  </h4>

                  <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                    {badge.tierNameAr.split("(")[0]}
                  </span>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-mono text-amber-400">+{badge.rewardCoins} 🪙</span>
                  <span className="text-red-400 group-hover:translate-x-[-2px] transition-transform font-bold">
                    {isArabic ? "تفاصيل ➔" : "Info ➔"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* DETAIL MODAL WHEN TAPPING A BADGE */}
      <AnimatePresence>
        {activeBadgeDetail && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-6 relative overflow-hidden shadow-2xl text-white"
            >
              <button
                onClick={() => setActiveBadgeDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-3">
                <div
                  className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br flex items-center justify-center text-5xl shadow-2xl relative border-2"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    borderColor: activeBadgeDetail.borderColor,
                    boxShadow: `0 0 35px ${activeBadgeDetail.glowColor}`,
                  }}
                >
                  <div className={`w-full h-full rounded-3xl bg-gradient-to-br ${activeBadgeDetail.badgeBg} flex items-center justify-center`}>
                    <span>{activeBadgeDetail.icon}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      {activeBadgeDetail.rarity}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Level {activeBadgeDetail.level}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white" style={{ color: activeBadgeDetail.textColor }}>
                    {isArabic ? activeBadgeDetail.titleAr : activeBadgeDetail.titleEn}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-1">
                    {activeBadgeDetail.tierNameAr}
                  </p>
                </div>
              </div>

              {/* Requirements & Perks Box */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-zinc-400">{isArabic ? "الخبرة المطلوبة (XP):" : "Required XP:"}</span>
                  <span className="font-mono font-bold text-amber-400">{activeBadgeDetail.requiredXp} XP</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-zinc-400">{isArabic ? "مكافأة فتح المستوى:" : "Level Unlock Reward:"}</span>
                  <span className="font-mono font-bold text-emerald-400">+{activeBadgeDetail.rewardCoins} Black Coins 🪙</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 block font-bold">{isArabic ? "المزايا الحصرية للشارة:" : "Exclusive Badge Perks:"}</span>
                  <p className="text-zinc-300 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 leading-relaxed">
                    {isArabic ? activeBadgeDetail.perksAr : activeBadgeDetail.perksEn}
                  </p>
                </div>
              </div>

              {/* Equip / Status Actions */}
              <div className="space-y-2">
                {activeBadgeDetail.level <= currentUserLevel ? (
                  <button
                    onClick={() => {
                      handleEquip(activeBadgeDetail);
                      setActiveBadgeDetail(null);
                    }}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                      equippedLevel === activeBadgeDetail.level
                        ? "bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default"
                        : "bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:opacity-90 text-black shadow-red-600/30 active:scale-95"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {equippedLevel === activeBadgeDetail.level
                        ? isArabic ? "مجهزة حالياً بجانب اسمك" : "Currently Equipped"
                        : isArabic ? "تجهيز الشارة بجانب الاسم" : "Equip Badge Next to Name"}
                    </span>
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 font-bold text-xs text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    <span>
                      {isArabic
                        ? `يتطلب الوصول للمستوى ${activeBadgeDetail.level} لفتح هذه الشارة`
                        : `Reach Level ${activeBadgeDetail.level} to unlock this badge`}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LevelBadgesModal;
