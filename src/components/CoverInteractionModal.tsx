import React, { useState } from "react";
import {
  X,
  Heart,
  Flame,
  Zap,
  Star,
  Sparkles,
  Crown,
  MessageCircle,
  Share2,
  Edit,
  Smile,
  Send,
  Eye,
  Check,
  Award,
  Layers,
  Wand2 } from
"lucide-react";

interface CoverInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverUrl: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isArabic: boolean;
  currentUser: any;
  setCurrentUser?: (user: any) => void;
  isOwner?: boolean;
  onEditCover?: () => void;
  playSynthSound?: (type: string) => void;
  triggerHapticFeedback?: (type: string) => void;
  mode?: "cover" | "profile";
}

interface CoverComment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  reactionIcon?: string;
}

export default function CoverInteractionModal({
  isOpen,
  onClose,
  coverUrl,
  username,
  displayName,
  avatarUrl,
  isArabic,
  currentUser,
  isOwner = false,
  onEditCover,
  playSynthSound,
  triggerHapticFeedback,
  mode = "profile"
}: CoverInteractionModalProps) {
  if (!isOpen) return null;

  const isProfileMode = mode === "profile";

  // Local state for reactions
  const [reactions, setReactions] = useState<Record<string, number>>({
    heart: 54,
    fire: 38,
    zap: 27,
    star: 19,
    crown: 14,
    sparkles: 22
  });

  const [activeUserReaction, setActiveUserReaction] = useState<string | null>("fire");
  const [copiedToast, setCopiedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "reactors" | "effects">("comments");

  // Visual FX overlays for media preview
  const [selectedEffect, setSelectedEffect] = useState<"none" | "sakura" | "cyber" | "aura" | "sparkles" | "glitch">("none");

  // Wall Comments
  const [comments, setComments] = useState<CoverComment[]>([
  {
    id: "c1",
    authorName: "زورو السياف",
    authorUsername: "zoro_pirate",
    authorAvatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
    text: isArabic ?
    isProfileMode ? "بروفايل فخم يليق بأوتـاكو أسطوري 🔥! التصميم والرمزيات بطلة." : "غلاف فخم يليق بأوتـاكو أسطوري 🔥! التصميم والرمزيات بطلة." :
    isProfileMode ? "Epic profile fit for a legendary otaku 🔥!" : "Epic cover fit for a legendary otaku 🔥!",
    createdAt: isArabic ? "منذ ساعتين" : "2h ago",
    reactionIcon: "🔥"
  },
  {
    id: "c2",
    authorName: "ميكاسا أتاك",
    authorUsername: "mikasa_ackerman",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: isArabic ? "ذوق عالي جداً في بروفايلك وإنجازاتك 🌸⚡" : "Superb taste in anime profile & achievements 🌸⚡",
    createdAt: isArabic ? "منذ 5 ساعات" : "5h ago",
    reactionIcon: "🌸"
  }]
  );

  const [newCommentText, setNewCommentText] = useState("");

  const handleToggleReaction = (type: keyof typeof reactions, iconSymbol: string) => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    if (activeUserReaction === type) {
      setReactions((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
      setActiveUserReaction(null);
    } else {
      setReactions((prev) => {
        const next = { ...prev };
        if (activeUserReaction && next[activeUserReaction as keyof typeof reactions] !== undefined) {
          next[activeUserReaction as keyof typeof reactions] = Math.max(0, next[activeUserReaction as keyof typeof reactions] - 1);
        }
        next[type] = next[type] + 1;
        return next;
      });
      setActiveUserReaction(type as string);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (playSynthSound) playSynthSound("success");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");

    const newComment: CoverComment = {
      id: "c_" + Date.now(),
      authorName: currentUser?.name || currentUser?.displayName || "أنمي إكسبرت",
      authorUsername: currentUser?.username || "me_otaku",
      authorAvatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      text: newCommentText.trim(),
      createdAt: isArabic ? "الآن" : "Just now",
      reactionIcon: activeUserReaction === "heart" ? "❤️" : activeUserReaction === "fire" ? "🔥" : activeUserReaction === "crown" ? "👑" : "⚡"
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
  };

  const totalReactionsCount = Object.values(reactions).reduce((a: number, b: number) => a + Number(b), 0);

  const reactionButtons = [
  { key: "fire", labelAr: "أسطوري", labelEn: "Epic", icon: Flame, color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  { key: "heart", labelAr: "إعجاب", labelEn: "Love", icon: Heart, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
  { key: "zap", labelAr: "حماس", labelEn: "Hyped", icon: Zap, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { key: "star", labelAr: "ممتاز", labelEn: "Star", icon: Star, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { key: "crown", labelAr: "ملكي", labelEn: "Royal", icon: Crown, color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  { key: "sparkles", labelAr: "كاوايي", labelEn: "Kawaii", icon: Sparkles, color: "text-pink-400 bg-pink-400/10 border-pink-400/30" }];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-[#121216] border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-right"
        dir={isArabic ? "rtl" : "ltr"}>
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 flex justify-between items-center bg-[#16161c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
              <Flame className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>
                  {isProfileMode ?
                  isArabic ? "التفاعل على البروفايل الأوتاكو 🔥" : "Otaku Profile Interaction 🔥" :
                  isArabic ? "التفاعل مع الغلاف الأوتاكو" : "Interactive Cover Display"}
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  {totalReactionsCount} {isArabic ? "تفاعل" : "Reactions"}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                @{username} • {displayName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (playSynthSound) playSynthSound("tap");
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-zinc-800">
            
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROFILE / COVER MEDIA PREVIEW CONTAINER */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-[#121216] overflow-hidden group select-none flex items-center justify-center">
          {/* Background image preview */}
          <img
            src={isProfileMode ? coverUrl : coverUrl}
            alt="Media Background"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            isProfileMode ? "opacity-35 blur-sm" : "opacity-90"} ${

            selectedEffect === "glitch" ? "contrast-125 saturate-150 animate-pulse" :
            selectedEffect === "aura" ? "brightness-110 drop-shadow-[0_0_25px_rgba(255,122,0,0.5)]" :
            selectedEffect === "cyber" ? "hue-rotate-90 saturate-200" : ""}`
            } />
          

          {/* If in profile mode, prominently show the Avatar in the center with a glowing frame */}
          {isProfileMode &&
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 my-4">
              <div className="relative group">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-orange-500 via-amber-400 to-red-500 shadow-[0_0_40px_rgba(255,122,0,0.6)] ${
              selectedEffect === "aura" ? "animate-pulse" : ""}`
              }>
                  <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover border-4 border-[#121216]" />
                
                </div>
              </div>
              <div className="text-center bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-zinc-700/60 shadow-xl">
                <h4 className="text-sm font-black text-white">{displayName}</h4>
                <p className="text-[11px] text-orange-400 font-mono font-bold">@{username}</p>
              </div>
            </div>
          }

          {/* EFFECT ANIMATED OVERLAYS */}
          {selectedEffect === "aura" &&
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-amber-500/10 to-transparent pointer-events-none animate-pulse" />
          }
          {selectedEffect === "sakura" &&
          <div className="absolute inset-0 bg-pink-500/10 pointer-events-none flex items-center justify-center">
              <div className="text-3xl animate-bounce">🌸</div>
            </div>
          }
          {selectedEffect === "sparkles" &&
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
          }

          {/* Gradient shadow overlay for info */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/40 pointer-events-none" />

          {/* Top Info / Action Buttons */}
          <div className="absolute top-3 right-3 left-3 flex justify-between items-center z-10">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-700/60 shadow-lg">
              <img src={avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[11px] font-black text-white">{displayName}</span>
            </div>

            <div className="flex items-center gap-2">
              {!isProfileMode && isOwner && onEditCover &&
              <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  onEditCover();
                }}
                className="bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:border-orange-500">
                
                  <Edit className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isArabic ? "تغيير الغلاف" : "Edit Cover"}</span>
                </button>
              }

              <button
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  navigator.clipboard?.writeText(window.location.href);
                  setCopiedToast(true);
                  setTimeout(() => setCopiedToast(false), 2000);
                }}
                className="bg-black/80 hover:bg-black text-white p-2 rounded-xl border border-zinc-700 text-xs font-bold transition-all cursor-pointer shadow-lg"
                title={isArabic ? "نسخ رابط البروفايل" : "Copy Profile Link"}>
                
                {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-zinc-300" />}
              </button>
            </div>
          </div>

          {/* Floating reaction badges overlay on bottom */}
          <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
              {reactionButtons.map((btn, _autoIdx) => {
                const IconComponent = btn.icon;
                const count = reactions[btn.key as keyof typeof reactions] || 0;
                const isActive = activeUserReaction === btn.key;
                return (
                  <button
                    key={`cov_btn_${btn.key}_${_autoIdx}`}
                    type="button"
                    onClick={() => handleToggleReaction(btn.key as keyof typeof reactions, btn.labelAr)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive ?
                    "bg-orange-500 text-white shadow-lg shadow-orange-950/50 scale-105" :
                    "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"}`
                    }>
                    
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "fill-white" : btn.color.split(" ")[0]}`} />
                    <span>{count}</span>
                  </button>);

              })}
            </div>
          </div>
        </div>

        {/* MODAL BOTTOM BODY WITH TABS (Comments, Reactors, Visual FX) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TABS HEADER */}
          <div className="flex border-b border-zinc-800 gap-4 text-xs font-black">
            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                setActiveTab("comments");
              }}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "comments" ?
              "border-orange-500 text-orange-400" :
              "border-transparent text-zinc-400 hover:text-white"}`
              }>
              
              <MessageCircle className="w-4 h-4" />
              <span>
                {isProfileMode ?
                isArabic ? "تعليقات وملاحظات البروفايل" : "Profile Notes & Comments" :
                isArabic ? "تعليقات وملاحظات الغلاف" : "Cover Notes & Comments"} ({comments.length})
              </span>
            </button>

            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                setActiveTab("reactors");
              }}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "reactors" ?
              "border-orange-500 text-orange-400" :
              "border-transparent text-zinc-400 hover:text-white"}`
              }>
              
              <Award className="w-4 h-4" />
              <span>
                {isProfileMode ?
                isArabic ? "المتفاعلون مع البروفايل" : "Profile Fans & Reactions" :
                isArabic ? "المتفاعلون مع الغلاف" : "Cover Fans & Reactions"} ({totalReactionsCount})
              </span>
            </button>

            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                setActiveTab("effects");
              }}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "effects" ?
              "border-orange-500 text-orange-400" :
              "border-transparent text-zinc-400 hover:text-white"}`
              }>
              
              <Wand2 className="w-4 h-4" />
              <span>
                {isProfileMode ?
                isArabic ? "مؤثرات بصرية للبروفايل" : "Profile Visual Effects" :
                isArabic ? "مؤثرات بصرية للغلاف" : "Cover Visual Effects"}
              </span>
            </button>
          </div>

          {/* TAB 1: COMMENTS */}
          {activeTab === "comments" &&
          <div className="space-y-4">
              {/* Comment Input Box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={isArabic ? "اترك انطباعك أو تعليقك على هذا الغلاف الأوتاكو..." : "Leave a note or comment on this cover..."}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all" />
              
                <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-950/40">
                
                  <Send className="w-3.5 h-3.5" />
                  <span>{isArabic ? "إرسال" : "Post"}</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-1">
                {comments.map((comment, _autoIdx) =>
              <div key={`${comment.id}_${_autoIdx}`} className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl flex gap-3 items-start hover:border-zinc-800 transition-all">
                    <img src={comment.authorAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{comment.authorName}</span>
                          <span className="text-[10px] text-zinc-500">@{comment.authorUsername}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.reactionIcon &&
                      <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                              {comment.reactionIcon}
                            </span>
                      }
                          <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        {comment.text}
                      </p>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* TAB 2: REACTORS LIST */}
          {activeTab === "reactors" &&
          <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                {isArabic ? "قائمة الأعضاء الذين أبدوا إعجابهم وتفاعلوا مع هذا الغلاف:" : "Members who reacted to this cover:"}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
              { name: "سينباي مانغا", user: "senpai_manga", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", reaction: "🔥 أسطوري" },
              { name: "إرين ييغر", user: "eren_titan", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", reaction: "⚡ حماس" },
              { name: "ليفي آكرمان", user: "levi_captain", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", reaction: "👑 ملكي" },
              { name: "نيزوكو تشان", user: "nezuko_chan", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", reaction: "🌸 كاوايي" }].
              map((reactor, idx) =>
              <div key={idx} className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={reactor.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
                      <div>
                        <span className="text-xs font-bold text-white block">{reactor.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">@{reactor.user}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full">
                      {reactor.reaction}
                    </span>
                  </div>
              )}
              </div>
            </div>
          }

          {/* TAB 3: VISUAL EFFECTS */}
          {activeTab === "effects" &&
          <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                {isArabic ? "جرب إضافة فلتر ومؤثر بصري متحرك لمظهر الغلاف أثناء العرض:" : "Apply dynamic visual FX filters to cover preview:"}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
              { id: "none", labelAr: "بدون مؤثرات", labelEn: "Standard", desc: "الغلاف الأصلي" },
              { id: "aura", labelAr: "هالة الهالة البرتقالية", labelEn: "Aura Glow", desc: "تألق الأوتاكو الذهبي" },
              { id: "sakura", labelAr: "تساقط الساكورا 🌸", labelEn: "Sakura Petals", desc: "أجواء الأنمي الرومانسية" },
              { id: "sparkles", labelAr: "بريق النجوم ✨", labelEn: "Star Sparkles", desc: "توهج سحري" },
              { id: "glitch", labelAr: "سايبر جليتش ⚡", labelEn: "Cyber Glitch", desc: "تأثير الخيال العلمي" },
              { id: "cyber", labelAr: "النيون الأزرق 🌌", labelEn: "Neon Cyber", desc: "مظهر طوكيو المستقبلي" }].
              map((eff, _autoIdx) =>
              <button
                key={`${eff.id}_${_autoIdx}`}
                type="button"
                onClick={() => {
                  if (playSynthSound) playSynthSound("tap");
                  setSelectedEffect(eff.id as any);
                }}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                selectedEffect === eff.id ?
                "border-orange-500 bg-orange-500/10 text-white" :
                "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"}`
                }>
                
                    <span className="text-xs font-black block text-white">{isArabic ? eff.labelAr : eff.labelEn}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{eff.desc}</span>
                  </button>
              )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

}