const fs = require('fs');

const code = `import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Palette, Download, Upload, RefreshCw, ShoppingCart, CheckCircle, Paintbrush, Sliders, Star, Cloud, RefreshCcw, Heart, MessageSquare, Share2 } from "lucide-react";
import { THEME_PRESETS, ThemePreset } from "../themePresets";
import { User } from "../types";

interface ThemeEngineProps {
  isArabic: boolean;
  currentUser: User | null;
  onClose: () => void;
  onSelectTheme: (themeId: string) => void;
  currentThemeId: string;
  onPurchaseTheme: (themeId: string, price: number) => void;
  playSynthSound?: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
}

export default function ThemeEngine({
  isArabic,
  currentUser,
  onClose,
  onSelectTheme,
  currentThemeId,
  onPurchaseTheme,
  playSynthSound,
  triggerHapticFeedback
}: ThemeEngineProps) {
  const [activeTab, setActiveTab] = useState<"free" | "store" | "manage" | "custom">("free");
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [starredThemes, setStarredThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem("animeblack_starred_themes");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem("animeblack_starred_themes", JSON.stringify(starredThemes));
  }, [starredThemes]);

  const toggleStar = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playSynthSound) playSynthSound("tap");
    setStarredThemes(prev => prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]);
  };

  const handleApply = (themeId: string) => {
    setIsSyncing(true);
    if (playSynthSound) playSynthSound("tap");
    setTimeout(() => {
      setIsSyncing(false);
      if (playSynthSound) playSynthSound("success");
      if (triggerHapticFeedback) triggerHapticFeedback("success");
      onSelectTheme(themeId);
    }, 1200); // Simulated sync delay
  };

  const handleBuy = (theme: ThemePreset) => {
    if ((currentUser?.coins || 0) < theme.price) {
      if (playSynthSound) playSynthSound("error");
      if (triggerHapticFeedback) triggerHapticFeedback("error");
      alert(isArabic ? "رصيد عملاتك غير كافٍ" : "Insufficient coins");
      return;
    }
    if (playSynthSound) playSynthSound("purchase");
    if (triggerHapticFeedback) triggerHapticFeedback("purchase");
    onPurchaseTheme(theme.id, theme.price);
  };

  const freeThemes = Object.values(THEME_PRESETS).filter(t => t.price === 0);
  const paidThemes = Object.values(THEME_PRESETS).filter(t => t.price > 0);
  const userUnlocked = currentUser?.unlockedThemes || [];
  
  const sortThemes = (themes: ThemePreset[]) => {
    return [...themes].sort((a, b) => {
      const aStarred = starredThemes.includes(a.id) ? 1 : 0;
      const bStarred = starredThemes.includes(b.id) ? 1 : 0;
      return bStarred - aStarred; // Starred first
    });
  };

  const currentThemeData = THEME_PRESETS[previewThemeId || currentThemeId] || THEME_PRESETS["anime-black"];

  const renderThemeCard = (theme: ThemePreset, isStore: boolean = false) => {
    const isOwned = theme.price === 0 || userUnlocked.includes(theme.id);
    const isActive = currentThemeId === theme.id;
    const isStarred = starredThemes.includes(theme.id);

    return (
      <div 
        key={theme.id}
        onMouseEnter={() => setPreviewThemeId(theme.id)}
        onMouseLeave={() => setPreviewThemeId(null)}
        className={\`relative p-4 rounded-2xl border transition-all cursor-pointer \${
          isActive ? "border-green-500 bg-green-950/20" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
        }\`}
        style={{
          background: \`linear-gradient(135deg, \${theme.bg} 0%, \${theme.card} 100%)\`,
          borderColor: isActive ? theme.accent : theme.border
        }}
      >
        <button 
          onClick={(e) => toggleStar(theme.id, e)}
          className="absolute top-4 right-4 z-10 hover:scale-110 transition-transform"
        >
          <Star className={\`w-5 h-5 \${isStarred ? "fill-yellow-400 text-yellow-400" : "text-zinc-500 hover:text-zinc-400"}\`} />
        </button>

        <div className="flex justify-between items-start mb-4 pr-6">
          <div>
            <h3 className="text-sm font-black text-white" style={{ color: theme.text }}>
              {isArabic ? theme.nameAr : theme.nameEn}
            </h3>
            <p className="text-[10px] opacity-70" style={{ color: theme.text }}>
              {theme.category}
            </p>
          </div>
          {isActive && (
            <div className="bg-green-500/20 text-green-400 p-1.5 rounded-full flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Color Palette Preview */}
        <div className="flex gap-2 mb-4">
          <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: theme.bg, border: \`1px solid \${theme.border}\` }} />
          <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: theme.card, border: \`1px solid \${theme.border}\` }} />
          <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: theme.accent, border: \`1px solid \${theme.border}\` }} />
          <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: theme.secondary, border: \`1px solid \${theme.border}\` }} />
        </div>

        <div className="flex items-center gap-2 mt-2">
          {isOwned ? (
            <button 
              onClick={() => handleApply(theme.id)}
              disabled={isActive || isSyncing}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{ 
                backgroundColor: isActive ? 'transparent' : theme.accent, 
                color: isActive ? theme.accent : '#fff',
                border: isActive ? \`1px solid \${theme.accent}\` : 'none'
              }}
            >
              {isActive ? (isArabic ? "مُفعل حالياً" : "Currently Active") : (isArabic ? "تطبيق الثيم" : "Apply Theme")}
            </button>
          ) : (
            <button 
              onClick={() => handleBuy(theme)}
              disabled={isSyncing}
              className="flex-1 py-2 bg-[#FF3D00] hover:bg-[#E63900] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{theme.price} {isArabic ? "عملة" : "Coins"}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col font-sans backdrop-blur-3xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/80 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-wide">
              {isArabic ? "نظام الثيمات" : "Theme Engine"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-green-400 text-[10px] font-mono tracking-widest uppercase">
                {isArabic ? "متصل بالنظام" : "Engine Online"}
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} disabled={isSyncing} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50">
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left Side: Preview Panel */}
        <div className="w-full lg:w-1/3 border-r border-zinc-800/50 bg-[#0a0a0a] p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: \`radial-gradient(circle at center, \${currentThemeData.accent} 0%, transparent 70%)\` }}></div>
          
          <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-6 z-10 text-center">
            {isArabic ? "معاينة المنشور" : "Live Preview"}
            <br />
            <span className="text-white text-sm mt-1 inline-block">{isArabic ? currentThemeData.nameAr : currentThemeData.nameEn}</span>
          </h3>

          <div 
            className="w-full max-w-sm rounded-2xl p-4 shadow-2xl z-10 transition-all duration-500 border"
            style={{ 
              backgroundColor: currentThemeData.card, 
              borderColor: currentThemeData.border,
              boxShadow: \`0 20px 40px -10px \${currentThemeData.accent}30\`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-black leading-tight" style={{ color: currentThemeData.text }}>{currentUser?.name || "Anime Fan"}</h4>
                <p className="text-[10px] opacity-70" style={{ color: currentThemeData.text }}>@otaku_legend • 2h ago</p>
              </div>
            </div>
            
            <p className="text-xs mb-4 leading-relaxed" style={{ color: currentThemeData.text }}>
              {isArabic 
                ? "هكذا سيبدو شكل المنشورات والألوان عند تطبيق هذا الثيم. ما رأيك في هذه التنسيقات؟ ✨" 
                : "This is how posts and colors will look like when applying this theme. What do you think about this styling? ✨"}
            </p>

            <div className="w-full h-32 rounded-xl bg-zinc-900 overflow-hidden mb-4 border" style={{ borderColor: currentThemeData.border }}>
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500" alt="Anime Preview" className="w-full h-full object-cover opacity-80" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold border-t pt-3" style={{ borderColor: currentThemeData.border, color: currentThemeData.text }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 opacity-80"><Heart className="w-4 h-4" /> 1.2k</div>
                <div className="flex items-center gap-1.5 opacity-80"><MessageSquare className="w-4 h-4" /> 342</div>
                <div className="flex items-center gap-1.5 opacity-80"><RefreshCcw className="w-4 h-4" /> 56</div>
              </div>
              <div className="opacity-80"><Share2 className="w-4 h-4" /></div>
            </div>
          </div>
        </div>

        {/* Right Side: Theme Selection */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Syncing Overlay */}
          <AnimatePresence>
            {isSyncing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 mb-4 relative"
                >
                  <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full"></div>
                </motion.div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  {isArabic ? "جاري مزامنة الثيم..." : "Syncing Theme..."}
                </h3>
                <p className="text-zinc-400 text-xs mt-2">
                  {isArabic ? "يتم تطبيق التغييرات على جميع أجهزتك" : "Applying changes across all your devices"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-4 overflow-x-auto hide-scrollbar flex-shrink-0">
            {[
              { id: "free", labelAr: "الثيمات المجانية", labelEn: "Free Themes", icon: Paintbrush },
              { id: "store", labelAr: "متجر الثيمات", labelEn: "Theme Store", icon: ShoppingCart },
              { id: "manage", labelAr: "إدارة الثيمات", labelEn: "Manage", icon: Sliders },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex items-center gap-2 px-4 py-4 text-xs font-bold whitespace-nowrap transition-colors relative \${
                  activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }\`}
              >
                <tab.icon className={\`w-4 h-4 \${activeTab === tab.id ? "text-purple-400" : ""}\`} />
                {isArabic ? tab.labelAr : tab.labelEn}
                {activeTab === tab.id && (
                  <motion.div layoutId="themeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {activeTab === "free" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortThemes(freeThemes).map(t => renderThemeCard(t))}
              </div>
            )}
            
            {activeTab === "store" && (
              <>
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-6 flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-purple-300 font-bold text-xs uppercase tracking-wider">{isArabic ? "رصيدك الحالي" : "Your Balance"}</h4>
                    <div className="text-3xl font-black text-white flex items-center gap-2 mt-2 drop-shadow-md">
                      <div className="w-6 h-6 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center text-black">
                         <Coins className="w-3.5 h-3.5" />
                      </div>
                      {currentUser?.coins || 0}
                    </div>
                  </div>
                  <button className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95">
                    {isArabic ? "شحن عملات" : "Buy Coins"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortThemes(paidThemes).map(t => renderThemeCard(t, true))}
                </div>
              </>
            )}
            
            {activeTab === "manage" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {isArabic ? "الثيمات المملوكة" : "Owned Themes"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sortThemes(paidThemes.filter(t => userUnlocked.includes(t.id))).map(t => renderThemeCard(t))}
                    {paidThemes.filter(t => userUnlocked.includes(t.id)).length === 0 && (
                      <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                        <ShoppingCart className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm font-bold">{isArabic ? "لا توجد ثيمات مشتراة بعد" : "No purchased themes yet"}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-sm mb-4 border-t border-zinc-800 pt-8 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    {isArabic ? "أدوات متقدمة" : "Advanced Tools"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="flex flex-col items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 p-6 rounded-2xl transition-all hover:border-zinc-700 group">
                      <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-zinc-700 transition-colors">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-xs font-bold">{isArabic ? "استيراد ثيم" : "Import Theme"}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 p-6 rounded-2xl transition-all hover:border-zinc-700 group">
                      <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-zinc-700 transition-colors">
                        <Download className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-xs font-bold">{isArabic ? "تصدير ثيم" : "Export Theme"}</span>
                    </button>
                    <button onClick={() => handleApply("anime-black")} className="flex flex-col items-center justify-center gap-3 bg-red-950/10 border border-red-900/20 hover:bg-red-900/20 text-red-400 p-6 rounded-2xl transition-all hover:border-red-900/40 group">
                      <div className="p-3 bg-red-950/50 rounded-full group-hover:bg-red-900/60 transition-colors">
                        <RefreshCw className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-xs font-bold">{isArabic ? "إعادة للافتراضي" : "Reset to Default"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/ThemeEngine.tsx', code);
console.log('Rewrote ThemeEngine.tsx successfully.');
