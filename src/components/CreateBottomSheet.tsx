import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  FileText,
  Clapperboard,
  Sparkles,
  Users,
  MessageSquare,
  Compass,
  Award,
  BarChart2,
  Tv,
  Tv2,
  Calendar,
  Shield,
  Volume2
} from "lucide-react";

interface CreateBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  onCreateAction: (type: "post" | "reel" | "story" | "news" | "event" | "group" | "channel" | "space" | "guild" | "poll" | "live") => void;
  playSynthSound?: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
}

export default function CreateBottomSheet({
  isOpen,
  onClose,
  isArabic,
  onCreateAction,
  playSynthSound,
  triggerHapticFeedback
}: CreateBottomSheetProps) {
  const options = [
    {
      id: "post" as const,
      labelAr: "منشور جديد",
      labelEn: "New Post",
      descAr: "انشر أفكارك ومراجعاتك للأوتوكو",
      descEn: "Share thoughts and reviews",
      icon: FileText,
      color: "from-red-600 to-orange-500"
    },
    {
      id: "poll" as const,
      labelAr: "استطلاع رأي",
      labelEn: "Interactive Poll",
      descAr: "اطرح سؤالاً ودع المجتمع يصوت",
      descEn: "Ask a question and get votes",
      icon: BarChart2,
      color: "from-purple-600 to-indigo-500"
    },
    {
      id: "story" as const,
      labelAr: "قصة تفاعلية",
      labelEn: "New Story",
      descAr: "صورة أو سؤال يختفي بعد 24 ساعة",
      descEn: "24-hour visual or question",
      icon: Sparkles,
      color: "from-pink-600 to-rose-500"
    },
    {
      id: "reel" as const,
      labelAr: "فيديو ريلز",
      labelEn: "New Reel",
      descAr: "مقطع قصير عالي الجودة لأهم اللقطات",
      descEn: "Short highlight video clip",
      icon: Clapperboard,
      color: "from-amber-500 to-yellow-500"
    },
    {
      id: "news" as const,
      labelAr: "خبر رسمي",
      labelEn: "Official News",
      descAr: "انشر أخبار الأنمي الموثقة (صلاحية خاصة)",
      descEn: "Publish anime news (Verified)",
      icon: Tv,
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: "event" as const,
      labelAr: "فعالية مجتمعية",
      labelEn: "Special Event",
      descAr: "نظم فعالية وتحدي للأعضاء",
      descEn: "Organize community challenge",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "group" as const,
      labelAr: "مجموعة دردشة",
      labelEn: "New Group",
      descAr: "غرفة محادثة عامة أو خاصة لموضوع معين",
      descEn: "Public or private chat group",
      icon: MessageSquare,
      color: "from-sky-500 to-blue-600"
    },
    {
      id: "channel" as const,
      labelAr: "قناة بث",
      labelEn: "New Channel",
      descAr: "قناة أحادية الاتجاه لبث المحتوى والأخبار",
      descEn: "One-way channel for updates",
      icon: Tv2,
      color: "from-violet-500 to-purple-600"
    },
    {
      id: "space" as const,
      labelAr: "مجتمع (Space)",
      labelEn: "New Space",
      descAr: "فضاء خاص لعشاق أنمي معين ومناقشاته",
      descEn: "Dedicated space for specific anime",
      icon: Compass,
      color: "from-fuchsia-500 to-pink-600"
    },
    {
      id: "guild" as const,
      labelAr: "نقابة (Guild)",
      labelEn: "New Guild",
      descAr: "شكل جيش الأوتوكو الخاص بك وحارب للقمة",
      descEn: "Create Otaku army and compete",
      icon: Shield,
      color: "from-red-700 to-orange-700"
    },
    {
      id: "live" as const,
      labelAr: "بث مباشر",
      labelEn: "Go Live",
      descAr: "ابدأ بثًا مرئيًا تفاعليًا للألعاب أو الأنمي",
      descEn: "Start interactve gaming/anime stream",
      icon: Tv,
      color: "from-red-600 to-pink-700"
    }
  ];

  const handleSelect = (id: typeof options[number]["id"]) => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");
    onCreateAction(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-950 border-t border-zinc-800 rounded-t-3xl z-50 overflow-hidden flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
          >
            {/* Grabber */}
            <div className="w-full flex justify-center py-3 border-b border-zinc-900 bg-zinc-900/40">
              <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 flex justify-between items-center bg-zinc-900/20">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {isArabic ? "مركز الإنشاء الإبداعي" : "Creative Creation Hub"}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {isArabic
                    ? "اختر نوع المحتوى الذي ترغب في إضافته لمجتمع أنمي بلاك"
                    : "Select content type to add to Anime Black"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
              <div className="grid grid-cols-1 gap-2.5">
                {options.map((opt, optIdx) => {
                  const IconComponent = opt.icon;
                  return (
                    <button
                      key={`sheet_opt_${opt.id}_${optIdx}`}
                      onClick={() => handleSelect(opt.id)}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900 text-left transition-all group"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${opt.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-black text-white">
                          {isArabic ? opt.labelAr : opt.labelEn}
                        </span>
                        <span className="block text-[10px] text-zinc-500 truncate mt-0.5">
                          {isArabic ? opt.descAr : opt.descEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 font-bold transition-colors">
                        {isArabic ? "إنشاء ➔" : "Create ➔"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated footer tip */}
            <div className="p-3 border-t border-zinc-900 bg-[#070707] text-center">
              <p className="text-[9px] text-zinc-600 font-mono">
                {isArabic
                  ? "مستوى الأمان: معتدل • Anime Black Secure Protocol v1.3"
                  : "Security level: Standard • Anime Black Secure Protocol v1.3"}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
