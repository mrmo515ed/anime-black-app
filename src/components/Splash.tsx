import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Clapperboard } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
  isArabic: boolean;
  key?: string;
}

export default function Splash({ onComplete, isArabic }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 650);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      id="splash_screen"
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999] overflow-hidden select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } }}
    >
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 px-3.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800/90 active:scale-95 text-zinc-300 hover:text-white rounded-full border border-zinc-800 text-[10px] font-bold tracking-wide flex items-center gap-1 transition-all backdrop-blur-sm cursor-pointer"
      >
        <span>{isArabic ? "تخطي ⚡" : "Skip ⚡"}</span>
      </button>
      {/* Background Anime Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,62,62,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-red-500 rounded-full blur-sm"
            style={{
              width: Math.random() * 6 + 4,
              height: Math.random() * 6 + 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -80],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Core Animated Logo */}
      <div className="relative flex flex-col items-center">
        {/* Glow behind logo */}
        <motion.div
          className="absolute -inset-4 bg-red-600 rounded-full blur-2xl opacity-40"
          animate={{
            scale: [0.9, 1.2, 0.9],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Dynamic Logo Icon */}
        <motion.div
          id="splash_logo_icon"
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-zinc-800 overflow-hidden"
          initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <img src="/src/assets/images/anime_black_logo_1783807735704.jpg" alt="Anime Black Logo" className="w-full h-full object-cover" />
          <motion.div
            className="absolute top-2 right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
        </motion.div>

        {/* Glowing Text */}
        <motion.h1
          id="splash_logo_text"
          className="mt-6 text-4xl font-extrabold tracking-wider bg-gradient-to-r from-white via-red-500 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,62,62,0.3)] font-sans"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          {isArabic ? "أنمي بلاك" : "ANIME BLACK"}
        </motion.h1>

        {/* Slogan */}
        <motion.p
          className="mt-2 text-xs text-gray-400 font-mono tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {isArabic ? "مجتمع الأوتـاكو الـراقي" : "THE PREMIUM OTAKU SOCIAL"}
        </motion.p>
      </div>

      {/* Modern Circular Loading Spinner */}
      <div className="absolute bottom-16 flex flex-col items-center">
        <div className="relative w-10 h-10">
          <motion.div
            className="absolute inset-0 border-2 border-red-500/20 rounded-full"
            style={{ borderTopColor: "#ef4444" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.span
          className="mt-3 text-xs text-gray-500 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isArabic ? "جاري التحميل كـتطبيق موبايل..." : "Loading Native App..."}
        </motion.span>
      </div>
    </motion.div>
  );
}
