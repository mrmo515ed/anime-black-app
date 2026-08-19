import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sliders,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Pin,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle,
  TrendingUp,
  Award,
  Flame,
  Smartphone,
  Save,
  Trash2,
  LayoutGrid } from
"lucide-react";

export type HomeSectionId = "posts" | "reels" | "news" | "events" | "trends" | "marketplace" | "guilds" | "spaces";

export interface HomeSection {
  id: HomeSectionId;
  titleAr: string;
  titleEn: string;
  isVisible: boolean;
  isPinned: boolean;
}

export type HomeWidgetId =
"jstClock" |
"quests" |
"digitalCard" |
"otakuMood" |
"xp" |
"level" |
"blackCoin" |
"stars" |
"events" |
"favAnime" |
"manga" |
"activeFriends" |
"guilds" |
"spaces" |
"marketplace" |
"themeStore" |
"news" |
"trends";

export interface HomeWidget {
  id: HomeWidgetId;
  titleAr: string;
  titleEn: string;
  isActive: boolean;
}

export interface SavedLayout {
  id: string;
  name: string;
  sections: HomeSection[];
  widgets: HomeWidget[];
  cardSize?: "small" | "medium" | "large";
  viewType?: "grid" | "list" | "compact";
}

interface HomeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  sections: HomeSection[];
  widgets: HomeWidget[];
  setSections: React.Dispatch<React.SetStateAction<HomeSection[]>>;
  setWidgets: React.Dispatch<React.SetStateAction<HomeWidget[]>>;
  savedLayouts: SavedLayout[];
  setSavedLayouts: React.Dispatch<React.SetStateAction<SavedLayout[]>>;
  cardSize: "small" | "medium" | "large";
  setCardSize: (size: "small" | "medium" | "large") => void;
  viewType: "grid" | "list" | "compact";
  setViewType: (type: "grid" | "list" | "compact") => void;
  playSynthSound?: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
}

export default function HomeCustomizer({
  isOpen,
  onClose,
  isArabic,
  sections,
  widgets,
  setSections,
  setWidgets,
  savedLayouts,
  setSavedLayouts,
  cardSize,
  setCardSize,
  viewType,
  setViewType,
  playSynthSound,
  triggerHapticFeedback
}: HomeCustomizerProps) {
  const [newLayoutName, setNewLayoutName] = useState("");

  const moveSection = (index: number, direction: "up" | "down") => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSections(updated);
  };

  const toggleVisibility = (id: string) => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    setSections(
      sections.map((sec, _autoIdx) =>
      sec.id === id ? { ...sec, isVisible: !sec.isVisible } : sec
      )
    );
  };

  const togglePin = (id: string) => {
    if (playSynthSound) playSynthSound("success");
    if (triggerHapticFeedback) triggerHapticFeedback("success");

    setSections(
      sections.map((sec, _autoIdx) =>
      sec.id === id ? { ...sec, isPinned: !sec.isPinned } : sec
      )
    );
  };

  const toggleWidget = (id: string) => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    setWidgets(
      widgets.map((wdg, _autoIdx) =>
      wdg.id === id ? { ...wdg, isActive: !wdg.isActive } : wdg
      )
    );
  };

  // Preset layouts
  const applyPresetLayout = (presetType: "classic" | "reels" | "news" | "compact") => {
    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("levelup");

    let presetSections: HomeSection[] = [];
    let presetWidgets: HomeWidget[] = [];

    // All possible sections
    const allSectionsList: HomeSectionId[] = ["posts", "reels", "news", "events", "trends", "marketplace", "guilds", "spaces"];
    // All possible widgets
    const allWidgetsList: HomeWidgetId[] = [
    "jstClock", "quests", "digitalCard", "otakuMood", "xp", "level", "blackCoin", "stars",
    "events", "favAnime", "manga", "activeFriends", "guilds", "spaces", "marketplace", "themeStore", "news", "trends"];


    const getSecArEn = (id: HomeSectionId) => {
      switch (id) {
        case "posts":return { ar: "المنشورات والمنتدى", en: "Community Posts Feed" };
        case "reels":return { ar: "مقاطع ريلز المقترحة", en: "Suggested Reels" };
        case "news":return { ar: "أخبار الأنمي والمانجا", en: "Official Otaku News" };
        case "events":return { ar: "الفعاليات المباشرة والمستمرة", en: "Active Events & Contests" };
        case "trends":return { ar: "الهاشتاغات المتداولة", en: "Trending Topics" };
        case "marketplace":return { ar: "سوق البطاقات والمقتنيات", en: "Collectible Marketplace" };
        case "guilds":return { ar: "النقابات والتحالفات", en: "Active Guilds Deck" };
        case "spaces":return { ar: "عوالم الأنمي والويكي", en: "Featured Spaces" };
      }
    };

    const getWdgArEn = (id: HomeWidgetId) => {
      switch (id) {
        case "jstClock":return { ar: "ساعة اليابان JST", en: "Tokyo Live JST Clock" };
        case "quests":return { ar: "المهام اليومية", en: "Daily Otaku Quests" };
        case "digitalCard":return { ar: "الهوية الرقمية للاعب", en: "Digital Pass Card" };
        case "otakuMood":return { ar: "مزاج الأوتاكو اليوم", en: "Otaku Hype State" };
        case "xp":return { ar: "مقياس الخبرة XP", en: "XP Level Meter" };
        case "level":return { ar: "مستوى العضوية", en: "Level Progress" };
        case "blackCoin":return { ar: "محفظة العملات السوداء", en: "Black Coin Wallet" };
        case "stars":return { ar: "النجوم المكتسبة", en: "Cosmic Stars" };
        case "events":return { ar: "الفعاليات السريعة", en: "Events Indicator" };
        case "favAnime":return { ar: "الأنمي المفضل", en: "Favorite Anime" };
        case "manga":return { ar: "متابعة المانجا", en: "Manga Progress" };
        case "activeFriends":return { ar: "الأصدقاء النشطون", en: "Active Friends" };
        case "guilds":return { ar: "نقابتي الحالية", en: "My Active Guild" };
        case "spaces":return { ar: "عوالمني النشطة", en: "My Spaces Hub" };
        case "marketplace":return { ar: "عناصر المتجر الشائعة", en: "Hot Shop Items" };
        case "themeStore":return { ar: "متجر المظهر والثيمات", en: "Theme Store Widget" };
        case "news":return { ar: "شريط العناوين الساخنة", en: "Hot Headlines Ticker" };
        case "trends":return { ar: "ترندات الأنمي", en: "Trends Ticker" };
      }
    };

    if (presetType === "classic") {
      setCardSize("medium");
      setViewType("grid");
      presetSections = allSectionsList.map((id, _autoIdx) => ({
        id,
        titleAr: getSecArEn(id).ar,
        titleEn: getSecArEn(id).en,
        isVisible: ["posts", "reels", "news", "events", "trends"].includes(id),
        isPinned: id === "posts"
      }));
      presetWidgets = allWidgetsList.map((id, _autoIdx) => ({
        id,
        titleAr: getWdgArEn(id).ar,
        titleEn: getWdgArEn(id).en,
        isActive: ["jstClock", "quests", "digitalCard", "otakuMood"].includes(id)
      }));
    } else if (presetType === "reels") {
      setCardSize("large");
      setViewType("grid");
      presetSections = allSectionsList.map((id, _autoIdx) => ({
        id,
        titleAr: getSecArEn(id).ar,
        titleEn: getSecArEn(id).en,
        isVisible: ["reels", "posts", "trends"].includes(id),
        isPinned: id === "reels"
      }));
      presetWidgets = allWidgetsList.map((id, _autoIdx) => ({
        id,
        titleAr: getWdgArEn(id).ar,
        titleEn: getWdgArEn(id).en,
        isActive: ["otakuMood", "activeFriends", "marketplace"].includes(id)
      }));
    } else if (presetType === "news") {
      setCardSize("medium");
      setViewType("list");
      presetSections = allSectionsList.map((id, _autoIdx) => ({
        id,
        titleAr: getSecArEn(id).ar,
        titleEn: getSecArEn(id).en,
        isVisible: ["news", "trends", "posts", "events"].includes(id),
        isPinned: id === "news"
      }));
      presetWidgets = allWidgetsList.map((id, _autoIdx) => ({
        id,
        titleAr: getWdgArEn(id).ar,
        titleEn: getWdgArEn(id).en,
        isActive: ["jstClock", "news", "trends"].includes(id)
      }));
    } else if (presetType === "compact") {
      setCardSize("small");
      setViewType("compact");
      presetSections = allSectionsList.map((id, _autoIdx) => ({
        id,
        titleAr: getSecArEn(id).ar,
        titleEn: getSecArEn(id).en,
        isVisible: id === "posts",
        isPinned: false
      }));
      presetWidgets = allWidgetsList.map((id, _autoIdx) => ({
        id,
        titleAr: getWdgArEn(id).ar,
        titleEn: getWdgArEn(id).en,
        isActive: ["xp", "level", "blackCoin"].includes(id)
      }));
    }

    setSections(presetSections);
    setWidgets(presetWidgets);
  };

  // Custom layout saving
  const handleSaveCustomLayout = () => {
    if (!newLayoutName.trim()) return;

    if (playSynthSound) playSynthSound("success");
    if (triggerHapticFeedback) triggerHapticFeedback("success");

    const newLayout: SavedLayout = {
      id: Date.now().toString(),
      name: newLayoutName.trim(),
      sections: [...sections],
      widgets: [...widgets],
      cardSize,
      viewType
    };

    setSavedLayouts([...savedLayouts, newLayout]);
    setNewLayoutName("");
  };

  const handleApplySavedLayout = (lay: SavedLayout) => {
    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("levelup");

    setSections(lay.sections);
    setWidgets(lay.widgets);
    if (lay.cardSize) setCardSize(lay.cardSize);
    if (lay.viewType) setViewType(lay.viewType);
  };

  const handleDeleteSavedLayout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playSynthSound) playSynthSound("error");
    if (triggerHapticFeedback) triggerHapticFeedback("error");

    setSavedLayouts(savedLayouts.filter((l) => l.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black z-50 cursor-pointer" />
        

          {/* Settings Modal */}
          <motion.div
          initial={{ x: isArabic ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: isArabic ? "100%" : "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-y-0 right-0 left-0 md:left-auto md:w-96 bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl">
          
            {/* Header */}
            <div className="h-14 border-b border-zinc-850 px-4 flex justify-between items-center bg-zinc-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--theme-accent)]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {isArabic ? "تخصيص الشاشة الرئيسية OS" : "ANIME OS HOME CUSTOMIZER"}
                  </h3>
                  <p className="text-[8px] text-zinc-500">
                    {isArabic ? "الفصل الثالث • نظام ترتيب البطاقات والأقسام" : "Vol 1 Ch 3 • Advanced Desktop layouts"}
                  </p>
                </div>
              </div>
              <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
              
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Presets Grid */}
              <div className="space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  🎨 {isArabic ? "تخطيطات جاهزة سريعة" : "Layout Presets"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                  onClick={() => applyPresetLayout("classic")}
                  className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 text-center transition-all">
                  
                    <span className="block text-xs font-bold text-white">
                      {isArabic ? "التخطيط الشامل" : "Omni Classic"}
                    </span>
                    <span className="block text-[8px] text-zinc-500 mt-0.5">
                      {isArabic ? "كامل أقسام وخدمات المنصة" : "All standard elements"}
                    </span>
                  </button>

                  <button
                  onClick={() => applyPresetLayout("reels")}
                  className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 text-center transition-all">
                  
                    <span className="block text-xs font-bold text-white">
                      {isArabic ? "فيديو وريلز أولاً" : "Fast Video First"}
                    </span>
                    <span className="block text-[8px] text-zinc-500 mt-0.5">
                      {isArabic ? "التركيز على محتوى الريلز" : "Prioritize video/reels"}
                    </span>
                  </button>

                  <button
                  onClick={() => applyPresetLayout("news")}
                  className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 text-center transition-all">
                  
                    <span className="block text-xs font-bold text-white">
                      {isArabic ? "بوابة الأخبار" : "Anime Portal"}
                    </span>
                    <span className="block text-[8px] text-zinc-500 mt-0.5">
                      {isArabic ? "التركيز على مراجعات الأخبار" : "Prioritize official news"}
                    </span>
                  </button>

                  <button
                  onClick={() => applyPresetLayout("compact")}
                  className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 text-center transition-all">
                  
                    <span className="block text-xs font-bold text-white">
                      {isArabic ? "البساطة المطلقة" : "Clean Compact"}
                    </span>
                    <span className="block text-[8px] text-zinc-500 mt-0.5">
                      {isArabic ? "عرض المنشورات والخبرة فقط" : "Standard text feed & stats"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Card Size & View Style Options */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                    📏 {isArabic ? "حجم بطاقات المحتوى" : "Content Card Size"}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-zinc-900">
                    {(["small", "medium", "large"] as const).map((size, _autoIdx) =>
                  <button
                    key={`${size}_${_autoIdx}`}
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      setCardSize(size);
                    }}
                    className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                    cardSize === size ?
                    "bg-red-600 text-white shadow-md" :
                    "text-zinc-400 hover:text-white"}`
                    }>
                    
                        {size === "small" ? isArabic ? "صغير" : "Small" :
                    size === "medium" ? isArabic ? "متوسط" : "Medium" :
                    isArabic ? "كبير" : "Large"}
                      </button>
                  )}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                    📐 {isArabic ? "شكل ونوع العرض" : "Layout View Style"}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-zinc-900">
                    {(["grid", "list", "compact"] as const).map((type, _autoIdx) =>
                  <button
                    key={`${type}_${_autoIdx}`}
                    onClick={() => {
                      if (playSynthSound) playSynthSound("tap");
                      setViewType(type);
                    }}
                    className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                    viewType === type ?
                    "bg-red-600 text-white shadow-md" :
                    "text-zinc-400 hover:text-white"}`
                    }>
                    
                        {type === "grid" ? isArabic ? "شبكة" : "Grid" :
                    type === "list" ? isArabic ? "قائمة" : "List" :
                    isArabic ? "مدمج" : "Compact"}
                      </button>
                  )}
                  </div>
                </div>
              </div>

              {/* Sections Sorting Manager */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  🔄 {isArabic ? "ترتيب وتثبيت أقسام التغذية" : "Reorder & Toggle Feed Sections"}
                </span>
                <p className="text-[9px] text-zinc-600 leading-snug">
                  {isArabic ?
                "السحب أو النقر لتعديل الترتيب. الأقسام المثبتة (📌) تظهر أعلى الصفحة بشكل مميز." :
                "Move elements up/down. Pinned (📌) items appear highlighted on top."}
                </p>

                <div className="space-y-1.5 mt-2">
                  {sections.map((sec, idx) =>
                <div
                  key={`${sec.id}_${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  sec.isPinned ?
                  "bg-red-600/10 border-red-600/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" :
                  "bg-zinc-900/50 border-zinc-850"}`
                  }>
                  
                      <div className="flex items-center gap-2">
                        <button
                      onClick={() => togglePin(sec.id)}
                      className={`p-1.5 rounded transition-colors ${
                      sec.isPinned ?
                      "text-red-500 bg-red-950/40" :
                      "text-zinc-600 hover:text-white"}`
                      }
                      title={isArabic ? "تثبيت بالقمة" : "Pin to Top"}>
                      
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="text-xs font-black text-white">
                          {isArabic ? sec.titleAr : sec.titleEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Visibility toggle */}
                        <button
                      onClick={() => toggleVisibility(sec.id)}
                      className={`p-1 hover:bg-zinc-800 rounded transition-colors ${
                      sec.isVisible ? "text-emerald-500" : "text-zinc-600"}`
                      }
                      title={isArabic ? "إخفاء / إظهار" : "Toggle visibility"}>
                      
                          {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Move Up */}
                        <button
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-400">
                      
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === sections.length - 1}
                      className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-400">
                      
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                )}
                </div>
              </div>

              {/* Active Widgets Selection */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  🔌 {isArabic ? "الأدوات التفاعلية النشطة (Widgets)" : "Active Home Widgets"}
                </span>
                <p className="text-[9px] text-zinc-600">
                  {isArabic ? "اختر الأدوات والبطاقات التي تود إضافتها لشاشتك الذكية" : "Choose which smart items are enabled on your feed"}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {widgets.map((wdg, _autoIdx) =>
                <button
                  key={`${wdg.id}_${_autoIdx}`}
                  onClick={() => toggleWidget(wdg.id)}
                  className={`p-2.5 rounded-xl border text-right flex flex-col justify-between transition-all ${
                  wdg.isActive ?
                  "bg-red-600/10 border-red-500" :
                  "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900"}`
                  }>
                  
                      <div className="flex justify-between items-center w-full mb-1">
                        <span className="text-[10px] font-black text-white">
                          {isArabic ? wdg.titleAr : wdg.titleEn}
                        </span>
                        <div
                      className={`w-2 h-2 rounded-full ${
                      wdg.isActive ? "bg-red-500 animate-pulse" : "bg-zinc-850"}`
                      } />
                    
                      </div>
                      <span className="text-[8px] text-zinc-500">
                        {wdg.id === "jstClock" && (isArabic ? "ساعة دقيقة بتوقيت اليابان" : "Ticking Tokyo time")}
                        {wdg.id === "quests" && (isArabic ? "تتبع المهام والهدايا اليومية" : "Track daily bonus coins")}
                        {wdg.id === "digitalCard" && (isArabic ? "معلومات الهوية السريعة" : "Quick Digital Passport Card")}
                        {wdg.id === "otakuMood" && (isArabic ? "حالتك ومزاجك الحالي اليوم" : "Visual Otaku hype state")}
                        {wdg.id === "xp" && (isArabic ? "تتبع نقاط الخبرة المكتسبة" : "Track earned XP points")}
                        {wdg.id === "level" && (isArabic ? "تتبع مستوى العضوية الحالي" : "Track member level and rank")}
                        {wdg.id === "blackCoin" && (isArabic ? "رصيد عملات بلاك كوين" : "Black Coins wallet balance")}
                        {wdg.id === "stars" && (isArabic ? "رصيد النجوم الكونية المباشرة" : "Cosmic Stars balance")}
                        {wdg.id === "events" && (isArabic ? "مؤشر الفعاليات المستمرة" : "Active contest updates")}
                        {wdg.id === "favAnime" && (isArabic ? "قائمتك المفضلة للأنمي المختار" : "Favorite selected anime list")}
                        {wdg.id === "manga" && (isArabic ? "معدل تقدم فصول المانجا" : "Manga reading list status")}
                        {wdg.id === "activeFriends" && (isArabic ? "الأصدقاء المتصلون حالياً" : "Online Otakus list")}
                        {wdg.id === "guilds" && (isArabic ? "تفاصيل نقابتك الحالية" : "My current active Guild rank")}
                        {wdg.id === "spaces" && (isArabic ? "عوالمني ومجتمعات الاهتمام" : "My Spaces & Interests")}
                        {wdg.id === "marketplace" && (isArabic ? "العناصر الأكثر رواجاً بالمتجر" : "Trending marketplace cards")}
                        {wdg.id === "themeStore" && (isArabic ? "متجر المظهر والثيمات النشطة" : "Active visual custom presets")}
                        {wdg.id === "news" && (isArabic ? "شريط الأخبار المباشر" : "Hot headlines scrolling ticker")}
                        {wdg.id === "trends" && (isArabic ? "الهاشتاغات الأكثر تداولاً" : "Hot trending anime hashtags")}
                      </span>
                    </button>
                )}
                </div>
              </div>

              {/* Saved Layout Decks */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  💾 {isArabic ? "مخططاتي المحفوظة" : "My Saved Decks"}
                </span>
                <div className="flex gap-1.5">
                  <input
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder={isArabic ? "اسم التخطيط الجديد..." : "Layout Name..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600" />
                
                  <button
                  onClick={handleSaveCustomLayout}
                  disabled={!newLayoutName.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shrink-0">
                  
                    <Save className="w-3.5 h-3.5" />
                    <span>{isArabic ? "حفظ" : "Save"}</span>
                  </button>
                </div>

                <div className="space-y-1 mt-2">
                  {savedLayouts.length === 0 ?
                <span className="block text-[10px] text-zinc-600 text-center py-2 italic">
                      {isArabic ? "لم تقم بحفظ أي تخطيط مخصص بعد" : "No custom layouts saved yet."}
                    </span> :

                savedLayouts.map((lay, _autoIdx) =>
                <div
                  key={`${lay.id}_${_autoIdx}`}
                  onClick={() => handleApplySavedLayout(lay)}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 cursor-pointer border border-zinc-850">
                  
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-200">
                            {lay.name}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-mono">
                            {lay.cardSize || "medium"} • {lay.viewType || "grid"}
                          </span>
                        </div>
                        <button
                    onClick={(e) => handleDeleteSavedLayout(lay.id, e)}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-red-500">
                    
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                )
                }
                </div>
              </div>

            </div>

            {/* Sticky bottom save/confirm */}
            <div className="p-3 border-t border-zinc-900 bg-[#070707] shrink-0">
              <button
              onClick={() => {
                if (playSynthSound) playSynthSound("success");
                onClose();
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all">
              
                {isArabic ? "تطبيق التغييرات وإغلاق" : "APPLY CHANGES & EXIT"}
              </button>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}