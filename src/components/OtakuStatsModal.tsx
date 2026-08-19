import React, { useState } from "react";
import {
  X,
  Award,
  Tv,
  BookOpen,
  CheckCircle,
  Star,
  Clock,
  TrendingUp,
  Flame,
  Zap,
  BarChart3,
  Share2,
  Check,
  Building2,
  Sparkles,
  PieChart as PieChartIcon,
  Copy,
  Download,
  Shield,
  Layers } from
"lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell } from
"recharts";

interface OtakuStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  currentUser: any;
  playSynthSound?: (type: string) => void;
  triggerHapticFeedback?: (type: string) => void;
}

export default function OtakuStatsModal({
  isOpen,
  onClose,
  isArabic,
  currentUser,
  playSynthSound,
  triggerHapticFeedback
}: OtakuStatsModalProps) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "genres" | "studios" | "history" | "favorites">("overview");

  // User Stats Data (Fallback if not directly present on currentUser)
  const otakuStats = currentUser?.otakuStats || {
    episodesWatched: 1420,
    mangaChaptersRead: 3850,
    animeCompleted: 148,
    mangaCompleted: 62,
    hoursWatched: 473,
    daysWatched: 19.7,
    averageRating: 8.8,
    totalOtakuScore: 98450,
    currentStreakDays: 14
  };

  // Genre distribution data
  const genreData = [
  { genre: isArabic ? "شونين (Shonen)" : "Shonen", percent: 35, count: 52, color: "#FF7A00" },
  { genre: isArabic ? "أكشن (Action)" : "Action", percent: 25, count: 37, color: "#EF4444" },
  { genre: isArabic ? "إيسيكاي (Isekai)" : "Isekai", percent: 18, count: 26, color: "#8B5CF6" },
  { genre: isArabic ? "سينين (Seinen)" : "Seinen", percent: 12, count: 18, color: "#10B981" },
  { genre: isArabic ? "فانتازيا (Fantasy)" : "Fantasy", percent: 10, count: 15, color: "#F59E0B" }];


  // Studio breakdown data
  const studioData = [
  { name: "MAPPA", count: 42, rating: "9.2" },
  { name: "Ufotable", count: 28, rating: "9.5" },
  { name: "Wit Studio", count: 22, rating: "9.0" },
  { name: "Madhouse", count: 19, rating: "8.9" },
  { name: "Kyoto Animation", count: 15, rating: "9.1" },
  { name: "Bones", count: 14, rating: "8.7" }];


  // Monthly activity chart data
  const monthlyActivity = [
  { month: isArabic ? "يناير" : "Jan", episodes: 180, chapters: 320 },
  { month: isArabic ? "فبراير" : "Feb", episodes: 210, chapters: 450 },
  { month: isArabic ? "مارس" : "Mar", episodes: 195, chapters: 380 },
  { month: isArabic ? "أبريل" : "Apr", episodes: 260, chapters: 520 },
  { month: isArabic ? "مايو" : "May", episodes: 240, chapters: 610 },
  { month: isArabic ? "يونيو" : "Jun", episodes: 290, chapters: 740 },
  { month: isArabic ? "يوليو" : "Jul", episodes: 310, chapters: 830 }];


  // Badges list
  const badgesList = [
  { titleAr: "قاهر الإيسيكاي", titleEn: "Isekai Conqueror", descAr: "شاهدت أكثر من 20 أنمي إيسيكاي", descEn: "Watched 20+ Isekai anime", icon: "🌌", color: "from-[#FF7A00] to-yellow-500" },
  { titleAr: "ملك الشونين", titleEn: "Shonen King", descAr: "تجاوزت 1,000 حلقة شونين حماسية", descEn: "Passed 1,000+ Shonen episodes", icon: "👑", color: "from-[#FF7A00] to-[#FF3D00]" },
  { titleAr: "قارئ المانجا الأسطوري", titleEn: "Manga Master", descAr: "قرأت أكثر من 3,000 فصل مانجا", descEn: "Read 3,000+ Manga chapters", icon: "📚", color: "from-purple-600 to-indigo-600" },
  { titleAr: "خبير الاستوديوهات", titleEn: "Studio Expert", descAr: "تابعت أعمال أهم 5 استوديوهات عالمية", descEn: "Followed top 5 global studios", icon: "🏢", color: "from-emerald-600 to-teal-600" },
  { titleAr: "ناقد الأنمي الذهبي", titleEn: "Golden Critic", descAr: "قيمت أكثر من 100 عمل أنمي بإنصاف", descEn: "Rated 100+ Anime shows fairly", icon: "⭐", color: "from-amber-500 to-orange-500" }];


  // Top Anime / Manga List
  const topFavorites = [
  { title: "Attack on Titan (هجوم العمالقة)", type: "Anime", episodes: "89/89", rating: "10/10", studio: "Wit / MAPPA", cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80" },
  { title: "One Piece (ون بيس)", type: "Anime & Manga", episodes: "1100+", rating: "9.9/10", studio: "Toei Animation", cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80" },
  { title: "Jujutsu Kaisen (جوجوتسو كايسن)", type: "Anime", episodes: "47/47", rating: "9.6/10", studio: "MAPPA", cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80" },
  { title: "Solo Leveling (سولو ليفلينج)", type: "Manhwa", episodes: "200+ Ch", rating: "9.8/10", studio: "A-1 Pictures", cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80" }];


  const handleCopySummary = () => {
    if (playSynthSound) playSynthSound("success");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    const text = isArabic ?
    `📊 إحصائيات الأوتاكو الشاملة للأسطورة @${currentUser?.username || "otaku"}:\n` +
    `🎬 الحلقات المشاهدة: ${otakuStats.episodesWatched} حلقة (${otakuStats.hoursWatched} ساعة)\n` +
    `📚 فصول المانجا: ${otakuStats.mangaChaptersRead} فصل\n` +
    `🏆 الأنميات المكتملة: ${otakuStats.animeCompleted} أنمي\n` +
    `⭐ متوسط التقييم: ${otakuStats.averageRating}/10\n` +
    `🔥 نقاط الأوتاكو: ${otakuStats.totalOtakuScore.toLocaleString()} نقطة` :
    `📊 Otaku Stats for @${currentUser?.username || "otaku"}:\n` +
    `🎬 Episodes: ${otakuStats.episodesWatched} (${otakuStats.hoursWatched}h)\n` +
    `📚 Manga Chapters: ${otakuStats.mangaChaptersRead}\n` +
    `🏆 Completed Anime: ${otakuStats.animeCompleted}\n` +
    `⭐ Avg Rating: ${otakuStats.averageRating}/10\n` +
    `🔥 Score: ${otakuStats.totalOtakuScore.toLocaleString()}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-[#0D0D11] border border-zinc-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-right"
        dir={isArabic ? "rtl" : "ltr"}>
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-zinc-850 bg-gradient-to-r from-[#14141c] via-[#101017] to-[#14141c] flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FF3D00] flex items-center justify-center text-white shadow-lg shadow-[#FF7A00]/30 border border-amber-400/30">
              <BarChart3 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isArabic ? "إحصائيات الأوتاكو الشاملة" : "Comprehensive Otaku Analytics"}</span>
                <span className="text-[10px] bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 px-2.5 py-0.5 rounded-full font-bold">
                  PRO STATS
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {isArabic ? "تحليل دقيق لساعات المشاهدة، المانجا، التصنيفات، والاستوديوهات" : "Detailed breakdown of watch time, manga, genres, and studios"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={handleCopySummary}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-2xl border border-zinc-700 text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:border-[#FF7A00]">
              
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-300" />}
              <span className="hidden sm:inline">{copied ? isArabic ? "تم النسخ!" : "Copied!" : isArabic ? "مشاركة الإحصائيات" : "Share Stats"}</span>
            </button>

            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-zinc-800">
              
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROFILE IDENTIFIER BANNER */}
        <div className="bg-[#13131a] border-b border-zinc-850 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF7A00] shadow-md" />
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{currentUser?.name || currentUser?.displayName || "أوتاكو أسطوري"}</h3>
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2 py-0.5 rounded-full font-black">
                  Lvl {currentUser?.level || 42}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                @{currentUser?.username || "me_otaku"} • {isArabic ? "حاكم الشونين الأسطوري" : "Legendary Shonen Master"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "نقاط الأوتاكو الكلية" : "Total Otaku Score"}</span>
              <span className="text-lg font-black text-[#FF7A00] font-mono">{otakuStats.totalOtakuScore.toLocaleString()}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "سلسلة المشاهدة" : "Streak"}</span>
              <span className="text-lg font-black text-amber-400 flex items-center gap-1 font-mono justify-center sm:justify-start">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
                <span>{otakuStats.currentStreakDays} {isArabic ? "يوم" : "Days"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-[#111116] px-4 pt-3 border-b border-zinc-850 flex gap-2 sm:gap-4 text-xs font-black overflow-x-auto no-scrollbar">
          {[
          { id: "overview", labelAr: "نظرة عامة", labelEn: "Overview", icon: BarChart3 },
          { id: "genres", labelAr: "التصنيفات المفضلة", labelEn: "Genres", icon: PieChartIcon },
          { id: "studios", labelAr: "الأستوديوهات", labelEn: "Studios", icon: Building2 },
          { id: "history", labelAr: "النشاط الشهري", labelEn: "Activity", icon: TrendingUp },
          { id: "favorites", labelAr: "أفضل الأعمال", labelEn: "Top Favorites", icon: Star }].
          map((tab, _autoIdx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`otaku_tab_${tab.id}_${_autoIdx}`}
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  setActiveTab(tab.id as any);
                }}
                className={`pb-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive ?
                "border-[#FF7A00] text-[#FF7A00]" :
                "border-transparent text-zinc-400 hover:text-white"}`
                }>
                
                <Icon className="w-4 h-4" />
                <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              </button>);

          })}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" &&
          <div className="space-y-6">
              
              {/* 4 CORE STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-[#16161f] border border-zinc-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-[#FF7A00]/50 transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF7A00]/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase mb-2">
                    <Tv className="w-4 h-4 text-[#FF7A00]" />
                    <span>{isArabic ? "حلقات الأنمي" : "Episodes"}</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                    {otakuStats.episodesWatched.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{otakuStats.hoursWatched} {isArabic ? "ساعة مشاهدة" : "hours"} ({otakuStats.daysWatched}d)</span>
                  </p>
                </div>

                <div className="bg-[#16161f] border border-zinc-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase mb-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>{isArabic ? "فصول المانجا" : "Manga Chapters"}</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                    {otakuStats.mangaChaptersRead.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-purple-400 mt-1 font-bold">
                    ~240 {isArabic ? "مجلد مكتمل" : "Volumes"}
                  </p>
                </div>

                <div className="bg-[#16161f] border border-zinc-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{isArabic ? "الأعمال المكتملة" : "Completed"}</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                    {otakuStats.animeCompleted + otakuStats.mangaCompleted}
                  </span>
                  <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                    {otakuStats.animeCompleted} {isArabic ? "أنمي" : "Anime"} • {otakuStats.mangaCompleted} {isArabic ? "مانجا" : "Manga"}
                  </p>
                </div>

                <div className="bg-[#16161f] border border-zinc-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-black uppercase mb-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{isArabic ? "متوسط التقييم" : "Avg Rating"}</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">
                    {otakuStats.averageRating} <span className="text-xs text-zinc-500 font-normal">/10</span>
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-1 font-bold">
                    {isArabic ? "تقييم ممتاز ومنصف" : "High Quality Taste"}
                  </p>
                </div>
              </div>

              {/* QUICK GENRE BREAKDOWN BAR */}
              <div className="bg-[#14141c] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#FF7A00]" />
                    <span>{isArabic ? "التصنيفات الأكثر مشاهدة" : "Top Anime Genres"}</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-bold">{isArabic ? "بناءً على سجل المشاهدة" : "Based on watch history"}</span>
                </div>

                <div className="space-y-3">
                  {genreData.map((item, _autoIdx) =>
                <div key={`${item.genre}_${_autoIdx}`} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-200">{item.genre}</span>
                        <span className="text-zinc-400 font-mono">{item.percent}% ({item.count} {isArabic ? "عمل" : "shows"})</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                        <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                    
                      </div>
                    </div>
                )}
                </div>
              </div>

              {/* OTAKU BADGES GRID */}
              <div className="bg-[#14141c] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? "ميداليات وألقاب الأوتاكو المحققة" : "Unlocked Otaku Badges"}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {badgesList.map((badge, idx) =>
                <div key={idx} className="bg-[#181822] border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-lg shadow-md shrink-0`}>
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{isArabic ? badge.titleAr : badge.titleEn}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{isArabic ? badge.descAr : badge.descEn}</p>
                      </div>
                    </div>
                )}
                </div>
              </div>

            </div>
          }

          {/* TAB 2: GENRES */}
          {activeTab === "genres" &&
          <div className="space-y-6">
              <div className="bg-[#14141c] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#FF7A00]" />
                  <span>{isArabic ? "توزيع تصنيفات الأنمي والمانجا المفضلة" : "Detailed Genre Analytics"}</span>
                </h3>

                {/* Recharts Bar Chart */}
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genreData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" stroke="#666" fontSize={11} />
                      <YAxis dataKey="genre" type="category" stroke="#888" fontSize={11} width={110} />
                      <Tooltip
                      contentStyle={{ backgroundColor: "#181820", borderColor: "#333", borderRadius: "12px", color: "#fff" }}
                      formatter={(val: any) => [`${val}%`, isArabic ? "النسبة" : "Percentage"]} />
                    
                      <Bar dataKey="percent" radius={[0, 8, 8, 0]}>
                        {genreData.map((entry, index) =>
                      <Cell key={`cell-${index}`} fill={entry.color} />
                      )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          }

          {/* TAB 3: STUDIOS */}
          {activeTab === "studios" &&
          <div className="space-y-4">
              <div className="bg-[#14141c] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? "تصنيف استوديوهات الأنمي الأكثر متابعة" : "Most Watched Anime Studios"}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {studioData.map((std, idx) =>
                <div key={idx} className="bg-[#181822] border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-xs flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{std.name}</h4>
                          <span className="text-[10px] text-zinc-400">{std.count} {isArabic ? "أنمي مشاهد" : "shows watched"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{std.rating}</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 block">{isArabic ? "متوسط تقييمك" : "Avg rating"}</span>
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>
          }

          {/* TAB 4: ACTIVITY HISTORY */}
          {activeTab === "history" &&
          <div className="space-y-4">
              <div className="bg-[#14141c] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF7A00]" />
                  <span>{isArabic ? "نشاط المشاهدة وقراءة المانجا الشهري" : "Monthly Anime & Manga Consumption"}</span>
                </h3>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#181820", borderColor: "#333", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="episodes" name={isArabic ? "حلقات أنمي" : "Episodes"} stroke="#FF7A00" fillOpacity={1} fill="url(#colorEp)" />
                      <Area type="monotone" dataKey="chapters" name={isArabic ? "فصول مانجا" : "Chapters"} stroke="#8B5CF6" fillOpacity={1} fill="url(#colorCh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          }

          {/* TAB 5: FAVORITES */}
          {activeTab === "favorites" &&
          <div className="space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{isArabic ? "قائمة الأعمال الأسطورية الأعلى تقييماً لديك" : "Top Rated Favorites"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {topFavorites.map((fav, idx) =>
              <div key={idx} className="bg-[#14141c] border border-zinc-800 p-3.5 rounded-2xl flex gap-3 items-center">
                    <img src={fav.cover} alt="Cover" className="w-14 h-20 rounded-xl object-cover border border-zinc-700 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-black">
                        {fav.type}
                      </span>
                      <h4 className="text-xs font-black text-white line-clamp-1">{fav.title}</h4>
                      <p className="text-[10px] text-zinc-400">{isArabic ? "الأستوديو:" : "Studio:"} {fav.studio}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-400 font-mono">{fav.episodes}</span>
                        <span className="text-xs font-black text-amber-400 font-mono">{fav.rating}</span>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

        </div>

      </div>
    </div>);

}