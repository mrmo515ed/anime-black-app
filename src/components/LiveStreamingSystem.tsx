import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ScreenShare,
  Hand,
  Share2,
  Heart,
  MessageSquare,
  Star,
  Gift,
  Users,
  Settings,
  Plus,
  Play,
  Pause,
  RotateCw,
  Volume2,
  Shield,
  Sparkles,
  Trophy,
  Flame,
  HelpCircle,
  Monitor,
  Radio,
  Tv,
  Languages,
  BarChart2,
  MessageCircle,
  AlertCircle,
  X,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Send,
  Trash2,
  Camera,
  UserPlus,
  Zap,
  Info,
  Sliders,
  Check,
  Award,
  Coins } from
"lucide-react";

interface LiveStreamingSystemProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  blackCoins: number;
  setBlackCoins: React.Dispatch<React.SetStateAction<number>>;
  stars: number;
  setStars: React.Dispatch<React.SetStateAction<number>>;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (title: string, body: string, type?: "success" | "info" | "warning" | "error") => void;
  triggerCelebration: (type: string, titleAr: string, titleEn: string, descAr: string, descEn: string, reward?: string) => void;
  onClose: () => void;
  initialMode?: "call" | "stream" | "watchparty" | null;
  initialTarget?: string | null;
}

export default function LiveStreamingSystem({
  isArabic,
  currentUser,
  setCurrentUser,
  blackCoins,
  setBlackCoins,
  stars,
  setStars,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  triggerCelebration,
  onClose,
  initialMode = null,
  initialTarget = null
}: LiveStreamingSystemProps) {
  // Navigation: "lobby" | "call" | "stream_host" | "stream_viewer" | "watchparty" | "analytics"
  const [currentView, setCurrentView] = useState<string>("lobby");

  // Selection states
  const [callType, setCallType] = useState<"voice" | "video" | "screen">("voice");
  const [activeCallRoom, setActiveCallRoom] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [callDuration, setCallDuration] = useState(0);

  // Filters and VFX
  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isAiModEnabled, setIsAiModEnabled] = useState(true);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"ar" | "en" | "ja">("ar");

  // Call duration interval
  useEffect(() => {
    let timer: any = null;
    if (currentView === "call" || currentView === "stream_host" || currentView === "stream_viewer" || currentView === "watchparty") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [currentView]);

  // Form states
  const [streamForm, setStreamForm] = useState({
    title: "",
    desc: "",
    category: "gaming",
    tags: "anime, live, gaming",
    audience: "public",
    recording: true,
    donations: true,
    comments: true,
    guests: true,
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
  });

  const [watchPartyForm, setWatchPartyForm] = useState({
    title: "",
    animeTitle: "Attack on Titan",
    episode: "12",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    maxMembers: 15,
    private: false
  });

  // Streaming State (Simulated)
  const [viewerCount, setViewerCount] = useState(128);
  const [streamLikes, setStreamLikes] = useState(482);
  const [streamComments, setStreamComments] = useState([
  { id: 1, user: "Otaku_Zoro", text: "يا رباااه! الرسم جبار 🔥🍿", translated: "OMG! The art is insane! 🔥🍿", stars: 10, time: "12:01" },
  { id: 2, user: "Mikasa_Fan", text: "متحمسين للحلقة القادمة!", translated: "Excited for the next episode!", stars: 0, time: "12:02" },
  { id: 3, user: "Luffy_King", text: "هل سيهزم كايدو في هذا الآرك؟ 🤔🎮", translated: "Will Kaido be defeated in this arc? 🤔🎮", stars: 50, time: "12:03" }]
  );
  const [chatInput, setChatInput] = useState("");
  const [pinnedComment, setPinnedComment] = useState<any>({
    user: "الإدارة (Anime Black)",
    text: "⚠️ أهلاً بكم في البث الرسمي للعبة القادمة! يرجى الالتزام بالاحترام والاستمتاع بالمسابقات والجوائز."
  });

  // Gifts & Coins list
  const giftsList = [
  { id: "gift_flame", labelAr: "لهيب الأوتاكو", labelEn: "Otaku Flame", icon: "🔥", cost: 10 },
  { id: "gift_ramen", labelAr: "رامين ساخن", labelEn: "Hot Ramen", icon: "🍜", cost: 25 },
  { id: "gift_devil_fruit", labelAr: "فاكهة الشيطان", labelEn: "Devil Fruit", icon: "🍇", cost: 100 },
  { id: "gift_crown", labelAr: "تاج الشوغن", labelEn: "Shogun Crown", icon: "👑", cost: 250 }];


  // Active floating gift overlay state
  const [activeGifts, setActiveGifts] = useState<any[]>([]);

  // Supporters ranking
  const [supporters, setSupporters] = useState([
  { name: "Luffy_King", coins: 1250, stars: 120, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
  { name: "Otaku_Zoro", coins: 850, stars: 90, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" },
  { name: "Goku_Super", coins: 450, stars: 40, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" }]
  );

  // Giveaways
  const [giveawayStatus, setGiveawayStatus] = useState<"none" | "active" | "ended">("none");
  const [giveawayReward, setGiveawayReward] = useState("Premium Black Month Badge");
  const [giveawayParticipants, setGiveawayParticipants] = useState<string[]>([]);
  const [giveawayWinner, setGiveawayWinner] = useState<string | null>(null);

  // Polls
  const [activePoll, setActivePoll] = useState<any>({
    question: "ما رأيك بآرك القصة الأخير في الأنمي؟",
    options: [
    { text: "أسطوري وخرافي 🔥", votes: 142 },
    { text: "متوسط ومقبول 👍", votes: 53 },
    { text: "سيء ومخيب للآمال 👎", votes: 14 }],

    userVoted: false
  });

  // Call Participants
  const [participants, setParticipants] = useState<any[]>([
  { name: "كين أوتشيها (Host)", username: "ken_uchiha", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100", level: 25, isMuted: false, isCameraOff: false, hasHandUp: false, network: "Excellent" },
  { name: "زورو_ساما", username: "zoro_sama", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", level: 18, isMuted: true, isCameraOff: false, hasHandUp: false, network: "Good" },
  { name: "نامي_تشان", username: "nami_chan", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", level: 14, isMuted: false, isCameraOff: true, hasHandUp: true, network: "Fair" }]
  );

  // Watch Party video controls (Host vs Viewer)
  const [videoState, setVideoState] = useState({
    playing: true,
    currentTime: 42, // seconds
    duration: 1200 // 20 mins
  });

  // AI Moderation Alerts history
  const [aiModLogs, setAiModLogs] = useState<string[]>([]);

  // Setup initial view if props are set
  useEffect(() => {
    if (initialMode) {
      if (initialMode === "call") {
        setCallType("video");
        setActiveCallRoom(initialTarget || "مكالمة خاصة");
        setCurrentView("call");
      } else if (initialMode === "stream") {
        setCurrentView("stream_viewer");
      } else if (initialMode === "watchparty") {
        setCurrentView("watchparty");
      }
    }
  }, [initialMode, initialTarget]);

  // Helper formatting for call timer
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor(totalSeconds % 3600 / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start Call Function
  const handleStartCall = (type: "voice" | "video" | "screen") => {
    setCallType(type);
    setIsMuted(false);
    setIsCameraOff(type === "voice");
    setIsScreenSharing(type === "screen");
    setCurrentView("call");
    playSynthSound("levelup");
    triggerHapticFeedback("levelup");
    triggerInAppNotification(
      isArabic ? "مكالمة جارية" : "Call Initialized",
      isArabic ? `بدأت مكالمة ${type === "voice" ? "صوتية" : type === "video" ? "فيديو" : "مشاركة شاشة"}` : `Started a ${type} call`,
      "success"
    );
  };

  // Handle Send Chat in Live Stream
  const handleSendLiveChat = () => {
    if (!chatInput.trim()) return;

    // AI Moderator check (Requirement 12.17 & Additions)
    if (isAiModEnabled) {
      const toxicKeywords = ["مخالف", "سيء", "سب", "شتيمة", "روابط خارجية", "هاك", "سبام", "ممل"];
      const lowerInput = chatInput.toLowerCase();
      const isToxic = toxicKeywords.some((keyword) => lowerInput.includes(keyword));

      if (isToxic) {
        playSynthSound("error");
        triggerHapticFeedback("error");
        triggerInAppNotification(
          isArabic ? "مراقب الذكاء الاصطناعي 🤖" : "AI Moderator 🤖",
          isArabic ? "تم حظر رسالتك لمخالفتها قوانين الأنمي بلاك!" : "Your message violates Anime Black community guidelines!",
          "error"
        );
        setAiModLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Blocked toxic input from @${currentUser?.username || "user"}`]
        );
        setChatInput("");
        return;
      }
    }

    const newComment = {
      id: Date.now(),
      user: currentUser?.username || "Guest_Black",
      text: chatInput,
      translated: `Translated chat message of "${chatInput}"`,
      stars: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setStreamComments((prev) => [...prev, newComment]);
    setChatInput("");
    playSynthSound("tap");

    // Random chance of triggering interactive response
    if (Math.random() > 0.6) {
      setTimeout(() => {
        const reactions = [
        "يا سلام على الأجواء! 😍🔥",
        "بث أسطوري يا صاحبي 👑🎬",
        "أتفق تماماً مع هذا الرأي!",
        "أوه، تابع ولا تتوقف!"];

        const randomUser = ["Natsu_G", "Rin_Okumura", "Otaku_Girl", "Kira_Light"][Math.floor(Math.random() * 4)];
        setStreamComments((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          user: randomUser,
          text: reactions[Math.floor(Math.random() * reactions.length)],
          translated: "Amazing streams!",
          stars: 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]
        );
      }, 1500);
    }
  };

  // Pinned Message toggle
  const handlePinComment = (comment: any) => {
    setPinnedComment(comment);
    playSynthSound("success");
    triggerInAppNotification(
      isArabic ? "تثبيت تعليق" : "Pinned Message",
      isArabic ? "تم تثبيت التعليق في أعلى الدردشة" : "Pinned comment to top of chat",
      "success"
    );
  };

  // Unsend Live Stream Chat Comment
  const handleUnsendLiveComment = (commentId: number) => {
    setStreamComments((prev) => prev.filter((c) => c.id !== commentId));
    playSynthSound("error");
    triggerInAppNotification(
      isArabic ? "سحب التعليق" : "Comment Unsent",
      isArabic ? "تم سحب تعليقك بنجاح للجميع من البث." : "Your comment has been successfully recalled from the live stream.",
      "success"
    );
  };

  // Virtual Gifts System (Requirement 12.8 & 12.9 & Additions)
  const handleSendGift = (gift: any) => {
    if (blackCoins < gift.cost) {
      playSynthSound("error");
      triggerInAppNotification(
        isArabic ? "رصيد غير كافٍ" : "Insufficient Balance",
        isArabic ? "تحتاج لعملات سوداء أكثر لإرسال هذه الهدية الفخمة" : "You need more Black Coins to send this gift",
        "error"
      );
      return;
    }

    // Deduct coins
    setBlackCoins((p) => p - gift.cost);
    playSynthSound("purchase");
    triggerHapticFeedback("purchase");

    // Add floating gift animation
    const giftAnim = {
      id: Date.now(),
      icon: gift.icon,
      name: isArabic ? gift.labelAr : gift.labelEn,
      sender: currentUser?.name || "Premium Member"
    };
    setActiveGifts((prev) => [...prev, giftAnim]);

    // Update supporters list
    setSupporters((prev) => {
      const existing = prev.find((s) => s.name === (currentUser?.username || "You"));
      if (existing) {
        return prev.map((s, _autoIdx) => s.name === (currentUser?.username || "You") ? { ...s, coins: s.coins + gift.cost } : s).
        sort((a, b) => b.coins - a.coins);
      } else {
        return [...prev, {
          name: currentUser?.username || "You",
          coins: gift.cost,
          stars: 5,
          avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        }].sort((a, b) => b.coins - a.coins);
      }
    });

    // Notify host or streamer
    triggerInAppNotification(
      isArabic ? "إرسال هدية 🎁" : "Gift Sent 🎁",
      isArabic ? `لقد أرسلت ${gift.labelAr} بقيمة ${gift.cost} عملة سوداء!` : `Sent ${gift.labelEn} for ${gift.cost} Coins!`,
      "success"
    );

    // Auto clear gift animation after 3.5s
    setTimeout(() => {
      setActiveGifts((prev) => prev.filter((g) => g.id !== giftAnim.id));
    }, 3500);
  };

  // Send Stars (Requirement 12.8 & 12.9)
  const handleSendStars = (count: number) => {
    if (stars < count) {
      playSynthSound("error");
      triggerInAppNotification(
        isArabic ? "نجوم غير كافية" : "Insufficient Stars",
        isArabic ? "يرجى شحن النجوم من المتجر لدعم البث المباشر" : "Please refill stars in the shop to support live streams",
        "error"
      );
      return;
    }

    setStars((p) => p - count);
    playSynthSound("success");
    triggerHapticFeedback("levelup");

    // Add comment about stars
    setStreamComments((prev) => [
    ...prev,
    {
      id: Date.now(),
      user: currentUser?.username || "Patron_Black",
      text: `أرسل ${count} نجمة ساطعة لدعم البث! ⭐✨`,
      translated: `Sent ${count} bright stars to support! ⭐✨`,
      stars: count,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
    );

    triggerInAppNotification(
      isArabic ? "إرسال نجوم ⭐" : "Stars Sent ⭐",
      isArabic ? `لقد أهديت ${count} نجمة لصانع المحتوى!` : `Gifted ${count} stars to the creator!`,
      "success"
    );
  };

  // Giveaway Handler (Legendary additions)
  const handleStartGiveaway = () => {
    setGiveawayReward(isArabic ? "رتبة عضو أسود مميز لمشاهد فائز" : "Special Black Member Rank for 1 Winner");
    setGiveawayParticipants([]);
    setGiveawayWinner(null);
    setGiveawayStatus("active");
    playSynthSound("levelup");
    triggerHapticFeedback("levelup");

    triggerInAppNotification(
      isArabic ? "سحب عشوائي أسطوري 🎉" : "Legendary Giveaway 🎉",
      isArabic ? "بدأ سحب عشوائي مباشر على الجوائز للمشاهدين!" : "Began live giveaway event in the chat!",
      "info"
    );

    // Mock participants joining
    setTimeout(() => {
      setGiveawayParticipants(["Otaku_Zoro", "Mikasa_Fan", "Luffy_King", "Goku_Super", "Shinichi_7"]);
    }, 2000);
  };

  const handleJoinGiveaway = () => {
    const myUser = currentUser?.username || "You";
    if (giveawayParticipants.includes(myUser)) return;

    setGiveawayParticipants((prev) => [...prev, myUser]);
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    triggerInAppNotification(
      isArabic ? "انضمام للسحب" : "Joined Giveaway",
      isArabic ? "تم تسجيل اسمك بنجاح في السحب العشوائي المباشر!" : "Successfully registered for the live draw!",
      "success"
    );
  };

  const handleDrawGiveaway = () => {
    if (giveawayParticipants.length === 0) return;
    playSynthSound("success");
    triggerHapticFeedback("levelup");

    const winner = giveawayParticipants[Math.floor(Math.random() * giveawayParticipants.length)];
    setGiveawayWinner(winner);
    setGiveawayStatus("ended");

    triggerCelebration(
      "levelup",
      "الفائز بالسحب المباشر 🏆",
      "Live Giveaway Winner 🏆",
      `تهانينا لـ @${winner} الفوز بـ: ${giveawayReward}!`,
      `Congratulations to @${winner} for winning: ${giveawayReward}!`,
      "50"
    );

    setStreamComments((prev) => [
    ...prev,
    {
      id: Date.now(),
      user: "نظام الجوائز",
      text: `🎉 مبروك لـ @${winner} الفوز بالجائزة الكبرى في السحب المباشر! 🎉`,
      translated: `🎉 Congratulations to @${winner} for winning the giveaway! 🎉`,
      stars: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
    );
  };

  // Poll Voter
  const handleVotePoll = (index: number) => {
    if (activePoll.userVoted) return;

    setActivePoll((prev: any) => {
      const newOptions = prev.options.map((opt: any, idx: number) =>
      idx === index ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return { ...prev, options: newOptions, userVoted: true };
    });

    playSynthSound("success");
    triggerHapticFeedback("tap");
    triggerInAppNotification(
      isArabic ? "تم التصويت" : "Voted Successfully",
      isArabic ? "نشكرك على مشاركتك في استطلاع الرأي المباشر!" : "Thank you for participating in the live poll!",
      "success"
    );
  };

  // Voice room user controls (Host Actions)
  const handleToggleMuteUser = (name: string) => {
    setParticipants((prev) =>
    prev.map((p, _autoIdx) => p.name === name ? { ...p, isMuted: !p.isMuted } : p)
    );
    playSynthSound("tap");
    triggerInAppNotification(
      isArabic ? "صلاحية الصوت" : "Voice Authority",
      isArabic ? `تم كتم/إلغاء كتم العضو ${name}` : `Muted/Unmuted member ${name}`,
      "info"
    );
  };

  const handleKickUser = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p.name !== name));
    playSynthSound("error");
    triggerInAppNotification(
      isArabic ? "طرد عضو" : "Kick Member",
      isArabic ? `تم طرد ${name} من الغرفة المباشرة` : `Kicked ${name} from live room`,
      "warning"
    );
  };

  // Stream Establishment (12.7)
  const handleEstablishStream = (type: "host" | "watchparty") => {
    playSynthSound("levelup");
    triggerHapticFeedback("levelup");
    setCurrentView(type === "host" ? "stream_host" : "watchparty");
    triggerInAppNotification(
      isArabic ? "بداية البث" : "Live Streaming Started",
      isArabic ? "قناتك الآن تبث مباشرة لجميع مستخدمي أنمي بلاك!" : "Your channel is now broadcasting to everyone!",
      "success"
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#060606] flex flex-col font-sans text-zinc-100 overflow-hidden">
      
      {/* UPPER TOP STATUS HEADER (12.1) */}
      <header className="h-14 bg-[#0A0A0A] border-b border-zinc-800 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF3D00] to-[#FF9100] flex items-center justify-center font-black text-white text-xs">
            AB
          </div>
          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#FF3D00] animate-pulse" />
              {isArabic ? "استوديو البث والمكالمات" : "Media Live Suite"}
            </h1>
            <p className="text-[9px] text-zinc-500 font-mono">
              Volume 2 • Chapter 12 • Real-time Engine
            </p>
          </div>
        </div>

        {/* Global Wallet Info */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="bg-[#111] border border-zinc-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-orange-400">
            <span>🪙 {blackCoins.toLocaleString()}</span>
            <span className="text-[8px] text-zinc-500">Coins</span>
          </div>
          <div className="bg-[#111] border border-zinc-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-amber-400">
            <span>⭐ {stars}</span>
            <span className="text-[8px] text-zinc-500">Stars</span>
          </div>

          <button
            onClick={() => {
              playSynthSound("error");
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer">
            
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* RENDER DYNAMIC VIEWS */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* VIEW: LOBBY & SETUP (12.1 - 12.3) */}
          {currentView === "lobby" &&
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
            
              
              {/* Introduction Banner */}
              <div className="bg-gradient-to-br from-[#120502] via-[#080808] to-[#0A0A0A] border border-orange-950 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3D00]/5 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-2">
                  <span className="bg-orange-500/15 text-[#FF3D00] border border-orange-500/25 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
                    LIVE STREAMING ENGINE
                  </span>
                  <h2 className="text-lg md:text-xl font-black text-white">
                    {isArabic ? "نظام البث المباشر، مكالمات الفيديو وغرف المشاهدة المشتركة" : "Live Streaming, Voice, Video & Watch Party System"}
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    {isArabic ?
                  "محرك تواصل متطور يدمج مزايا ديسكورد، تليجرام، وتويتش في منصة واحدة تدعم البث بأعلى دقة، غرف سينما لمشاهدة الأنمي جماعياً، وتفاعل حي بالعملات والنجوم مع حماية ذكاء اصطناعي." :
                  "A cutting-edge interactive suite blending Discord chambers, Twitch live streams, and watch parties. Engage with Stars, live giveaways, and virtual anime filters with real-time sync."}
                  </p>
                </div>
              </div>

              {/* THREE MAIN MODULE TILES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Tile 1: Voice & Video Call */}
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-800/40 flex items-center justify-center text-orange-400">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black text-white">
                      {isArabic ? "🎙️ مكالمات غرف النقابات والفيديو" : "Voice & Video Call"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      {isArabic ?
                    "ابدأ مكالمة فردية أو انضم لغرفة نقابة (Guild) صوتية دائمة مع مشاركة شاشة، رفع يد وجودة 4K." :
                    "Start instant voice, high-definition video calls, or screen share in private chambers or guilds."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <button
                      onClick={() => handleStartCall("voice")}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer">
                      
                        🎙️ {isArabic ? "صوت فقط" : "Voice Only"}
                      </button>
                      <button
                      onClick={() => handleStartCall("video")}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black py-2 rounded-xl transition-all cursor-pointer">
                      
                        📹 {isArabic ? "فيديو" : "Video"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tile 2: Go Live Stream */}
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
                      <Tv className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black text-white">
                      {isArabic ? "📺 البث المباشر (Go Live)" : "Broadcast Stream"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      {isArabic ?
                    "أنتج محتواك الخاص، واجه جمهورك، شغل استطلاعات الرأي، سحوبات Giveaway واستلم تبرعات النجوم والعملات." :
                    "Broadcast gameplay, news, or cosplay. Run giveaways, live polls, and receive direct gifts."}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                    onClick={() => setCurrentView("stream_viewer")}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer">
                    
                      🍿 {isArabic ? "مشاهدة بث" : "Watch Live"}
                    </button>
                    <button
                    onClick={() => setCurrentView("setup_stream")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black py-2 rounded-xl transition-all cursor-pointer">
                    
                      🎮 {isArabic ? "إعداد بث" : "Create Broadcast"}
                    </button>
                  </div>
                </div>

                {/* Tile 3: Watch Party */}
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black text-white">
                      {isArabic ? "🍿 غرف المشاهدة (Watch Party)" : "Watch Party Room"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      {isArabic ?
                    "وضع السينما لمشاهدة حلقات الأنمي والأفلام مع مزامنة كاملة للتشغيل، التوقف والتقديم ودردشة جانبية صوتية." :
                    "Co-watch anime with friends with synced playback, ambient cinema lighting, and emoji bursts."}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                    onClick={() => setCurrentView("setup_watchparty")}
                    className="w-full bg-[#FF3D00] hover:bg-orange-600 text-white text-[10px] font-black py-2 rounded-xl transition-all cursor-pointer">
                    
                      🎬 {isArabic ? "تأسيس غرفة مشاهدة" : "Start Watch Party"}
                    </button>
                  </div>
                </div>

              </div>

              {/* INTEGRATION FEEDBACK & SIMULATED ROOMS */}
              <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  {isArabic ? "الغرف والفعاليات الجارية الآن" : "Active Rooms & Live Events"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Item 1 */}
                  <div className="bg-[#111] border border-zinc-900 rounded-xl p-3 flex justify-between items-center hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-white text-xs">{isArabic ? "مراجعة مانجا ون بيس 1115" : "One Piece 1115 Review"}</h4>
                        <p className="text-[9px] text-zinc-500">Live • Host: @ken_uchiha • 142 {isArabic ? "مشاهد" : "viewers"}</p>
                      </div>
                    </div>
                    <button
                    onClick={() => setCurrentView("stream_viewer")}
                    className="bg-orange-500/10 hover:bg-orange-500 text-[#FF3D00] hover:text-white border border-orange-500/30 px-3 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer">
                    
                      {isArabic ? "انضمام" : "Join"}
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#111] border border-zinc-900 rounded-xl p-3 flex justify-between items-center hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-white text-xs">{isArabic ? "مشاهدة حلقة قاتل الشياطين 🍿" : "Demon Slayer Watchparty"}</h4>
                        <p className="text-[9px] text-zinc-500">Watch Party • Host: @nami_chan • 8 {isArabic ? "أعضاء" : "members"}</p>
                      </div>
                    </div>
                    <button
                    onClick={() => setCurrentView("watchparty")}
                    className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 px-3 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer">
                    
                      {isArabic ? "دخول السينما" : "Enter Cinema"}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          }

          {/* VIEW: SETUP STREAM (12.7) */}
          {currentView === "setup_stream" &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-6 max-w-xl mx-auto w-full space-y-5">
            
              <div className="flex items-center gap-2">
                <button
                onClick={() => setCurrentView("lobby")}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer">
                
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="text-sm font-black text-white">
                  {isArabic ? "إعداد البث المباشر الشخصي" : "Setup Live Stream"}
                </h2>
              </div>

              <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">
                    {isArabic ? "عنوان البث المباشر" : "Stream Title"}
                  </label>
                  <input
                  type="text"
                  value={streamForm.title}
                  onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
                  placeholder={isArabic ? "أدخل عنواناً جذاباً لمشاهديك..." : "Enter catching title..."}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                
                </div>

                {/* Desc */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">
                    {isArabic ? "وصف البث" : "Stream Description"}
                  </label>
                  <textarea
                  value={streamForm.desc}
                  onChange={(e) => setStreamForm({ ...streamForm, desc: e.target.value })}
                  placeholder={isArabic ? "ماذا ستقدم في هذا البث الحي؟" : "Describe your live broadcast..."}
                  className="w-full h-16 bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none" />
                
                </div>

                {/* Image Cover URL selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">
                    {isArabic ? "رابط غلاف البث المخصص" : "Cover Thumbnail URL"}
                  </label>
                  <input
                  type="text"
                  value={streamForm.cover}
                  onChange={(e) => setStreamForm({ ...streamForm, cover: e.target.value })}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                
                </div>

                {/* Category & Audience */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "التصنيف" : "Category"}</label>
                    <select
                    value={streamForm.category}
                    onChange={(e) => setStreamForm({ ...streamForm, category: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    
                      <option value="gaming">{isArabic ? "🎮 ألعاب وتسلية" : "Gaming"}</option>
                      <option value="anime_talk">{isArabic ? "🍿 نقاشات الأنمي" : "Anime Talk"}</option>
                      <option value="news">{isArabic ? "📢 أخبار عاجلة" : "Breaking News"}</option>
                      <option value="cosplay">{isArabic ? "🎭 تنكر ومرح" : "Cosplay & Fun"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "الجمهور" : "Audience"}</label>
                    <select
                    value={streamForm.audience}
                    onChange={(e) => setStreamForm({ ...streamForm, audience: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    
                      <option value="public">{isArabic ? "🌍 عام للجميع" : "Public"}</option>
                      <option value="followers">{isArabic ? "👥 للمتابعين فقط" : "Followers Only"}</option>
                      <option value="private">{isArabic ? "🔒 خاص (سرّي)" : "Private Room"}</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Toggles */}
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-300">{isArabic ? "تمكين تبرعات الدعم المالي (Stars & Coins)" : "Allow Stars & Coins Donations"}</span>
                    <input
                    type="checkbox"
                    checked={streamForm.donations}
                    onChange={(e) => setStreamForm({ ...streamForm, donations: e.target.checked })}
                    className="accent-[#FF3D00]" />
                  
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-300">{isArabic ? "تمكين تسجيل البث المباشر وحفظه بالأرشيف" : "Enable Stream Auto-Recording"}</span>
                    <input
                    type="checkbox"
                    checked={streamForm.recording}
                    onChange={(e) => setStreamForm({ ...streamForm, recording: e.target.checked })}
                    className="accent-[#FF3D00]" />
                  
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-300">{isArabic ? "السماح بانضمام ضيوف للبث (Guests)" : "Allow Guests to join Video"}</span>
                    <input
                    type="checkbox"
                    checked={streamForm.guests}
                    onChange={(e) => setStreamForm({ ...streamForm, guests: e.target.checked })}
                    className="accent-[#FF3D00]" />
                  
                  </div>
                </div>

                <button
                onClick={() => handleEstablishStream("host")}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-black text-xs transition-all cursor-pointer">
                
                  🚀 {isArabic ? "بدء البث المباشر (Go Live)" : "Launch Live Stream"}
                </button>

              </div>
            </motion.div>
          }

          {/* VIEW: SETUP WATCH PARTY (12.11) */}
          {currentView === "setup_watchparty" &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-6 max-w-xl mx-auto w-full space-y-5">
            
              <div className="flex items-center gap-2">
                <button
                onClick={() => setCurrentView("lobby")}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer">
                
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="text-sm font-black text-white">
                  {isArabic ? "تأسيس سينما المشاهدة المشتركة (Watch Party)" : "Establish Watch Party"}
                </h2>
              </div>

              <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "عنوان الغرفة" : "Room Title"}</label>
                  <input
                  type="text"
                  value={watchPartyForm.title}
                  onChange={(e) => setWatchPartyForm({ ...watchPartyForm, title: e.target.value })}
                  placeholder={isArabic ? "مشاهدة الأسبوع مع نقابة الأوتشيها" : "Weekly watch room..."}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "اسم الأنمي" : "Anime Name"}</label>
                    <input
                    type="text"
                    value={watchPartyForm.animeTitle}
                    onChange={(e) => setWatchPartyForm({ ...watchPartyForm, animeTitle: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                  
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "الحلقة" : "Episode"}</label>
                    <input
                    type="text"
                    value={watchPartyForm.episode}
                    onChange={(e) => setWatchPartyForm({ ...watchPartyForm, episode: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                  
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">{isArabic ? "رابط ملف الفيديو (Direct URL)" : "Direct Video URL"}</label>
                  <input
                  type="text"
                  value={watchPartyForm.videoUrl}
                  onChange={(e) => setWatchPartyForm({ ...watchPartyForm, videoUrl: e.target.value })}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-zinc-300">{isArabic ? "تفعيل وضع السينما والمؤثرات البصرية المحيطية" : "Enable Cinema Ambient glow lighting"}</span>
                  <input
                  type="checkbox"
                  checked={isCinemaMode}
                  onChange={(e) => setIsCinemaMode(e.target.checked)}
                  className="accent-[#FF3D00]" />
                
                </div>

                <button
                onClick={() => handleEstablishStream("watchparty")}
                className="w-full bg-gradient-to-r from-orange-500 to-[#FF3D00] hover:from-orange-600 hover:to-[#FF3D00] text-white py-3 rounded-xl font-black text-xs transition-all cursor-pointer">
                
                  🍿 {isArabic ? "إطلاق غرفة المشاهدة والسينما" : "Launch Cinema Watch Room"}
                </button>

              </div>
            </motion.div>
          }

          {/* VIEW: ACTIVE CALL & SCREEN SHARE (12.4 & 12.5) */}
          {currentView === "call" &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4 bg-[#080808]">
            
              
              {/* Call Top Info */}
              <div className="flex justify-between items-center mb-4 bg-[#111] p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <h3 className="text-xs font-black text-white">{isArabic ? "غرفة مكالمة الصوت والفيديو النشطة" : "Active Video/Audio Chamber"}</h3>
                    <p className="text-[8px] font-mono text-zinc-500">
                      ⏱️ {formatTime(callDuration)} • Quality: {selectedQuality} • Network: {isArabic ? "ممتازة (24ms)" : "Excellent (24ms)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400">{isArabic ? "تعديل الجودة:" : "Quality:"}</span>
                  <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-[10px] rounded px-1 text-white">
                  
                    <option value="Auto">Auto</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K (UHD)</option>
                  </select>
                </div>
              </div>

              {/* GRID OF PARTICIPANTS with applied Virtual Masks */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {participants.map((person, idx) =>
              <div
                key={person.id ? `${person.id}_grid_${idx}` : `participant_grid_${idx}`}
                className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden group shadow-lg">
                
                    {/* Simulated video background */}
                    {!person.isCameraOff ?
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center">
                        <img
                    src={person.avatar}
                    alt="video simulation"
                    className="w-full h-full object-cover opacity-60 filter blur-[1px]" />
                  
                        {/* Virtual Anime VFX (Legendary Mask Overlay simulation) */}
                        {person.username === "ken_uchiha" && activeFilter !== "none" &&
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            {activeFilter === "sharingan" &&
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="w-20 h-20 rounded-full border-4 border-red-600 border-t-black border-b-black flex items-center justify-center">
                      
                                <span className="text-xs text-red-500">🔴</span>
                              </motion.div>
                    }
                            {activeFilter === "strawhat" &&
                    <div className="absolute top-4 bg-amber-200 text-amber-900 border border-amber-800 rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest animate-bounce">
                                👒 Luffy Strawhat
                              </div>
                    }
                            {activeFilter === "ghoul" &&
                    <div className="absolute inset-0 bg-red-950/40 mix-blend-color-burn flex items-center justify-center">
                                <span className="text-[10px] font-black tracking-widest text-red-500 bg-black/60 px-2 py-1 rounded">🎭 GHOUL ACTIVE</span>
                              </div>
                    }
                          </div>
                  }
                        <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[8px] text-zinc-400 font-mono">
                          Simulated Webcam Video Feed ({selectedQuality})
                        </span>
                      </div> :

                <div className="absolute inset-0 bg-[#0E0E0E] flex items-center justify-center">
                        <img
                    src={person.avatar}
                    alt="avatar large"
                    className="w-20 h-20 rounded-full object-cover border-4 border-zinc-800" />
                  
                      </div>
                }

                    {/* Participant Details Overlay */}
                    <div className="relative z-10 w-full flex justify-between items-start">
                      <span className="bg-orange-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
                        LVL {person.level}
                      </span>
                      {person.hasHandUp &&
                  <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-bounce" title="Raised Hand">
                          ✋
                        </span>
                  }
                    </div>

                    <div className="relative z-10 text-center space-y-1 mt-auto">
                      <h4 className="text-xs font-black text-white drop-shadow-md">
                        {person.name}
                      </h4>
                      <p className="text-[8px] text-zinc-400 font-mono">
                        @{person.username} • {person.network} Net
                      </p>
                    </div>

                    {/* Host action triggers */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1.5 rounded-xl flex gap-1.5 z-20">
                      <button
                    onClick={() => handleToggleMuteUser(person.name)}
                    className="p-1 hover:bg-zinc-800 rounded text-amber-500 cursor-pointer"
                    title="Mute User">
                    
                        {person.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                      <button
                    onClick={() => handleKickUser(person.name)}
                    className="p-1 hover:bg-zinc-800 rounded text-red-500 cursor-pointer"
                    title="Kick from Room">
                    
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
              )}
              </div>

              {/* MOCK VIRTUAL MASKS PALETTE */}
              <div className="bg-[#0A0A0A] border border-zinc-800 p-3 rounded-2xl mb-4 flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-orange-400">
                  <Sparkles className="w-4 h-4" />
                  {isArabic ? "فلاتر وأقنعة الأنمي الحية (VFX Filters):" : "Anime Virtual Masks & Filters:"}
                </span>
                <div className="flex gap-2 text-[10px] font-bold">
                  <button
                  onClick={() => {setActiveFilter("none");playSynthSound("tap");}}
                  className={`px-3 py-1.5 rounded-lg border ${activeFilter === "none" ? "bg-orange-500 text-black border-orange-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                  
                    ❌ {isArabic ? "بلا تأثير" : "No Filter"}
                  </button>
                  <button
                  onClick={() => {setActiveFilter("sharingan");playSynthSound("success");}}
                  className={`px-3 py-1.5 rounded-lg border ${activeFilter === "sharingan" ? "bg-red-600 text-white border-red-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                  
                    🔴 {isArabic ? "شارينغان" : "Sharingan Eye"}
                  </button>
                  <button
                  onClick={() => {setActiveFilter("strawhat");playSynthSound("success");}}
                  className={`px-3 py-1.5 rounded-lg border ${activeFilter === "strawhat" ? "bg-amber-500 text-black border-amber-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                  
                    👒 {isArabic ? "قبعة القش" : "Luffy Hat"}
                  </button>
                  <button
                  onClick={() => {setActiveFilter("ghoul");playSynthSound("success");}}
                  className={`px-3 py-1.5 rounded-lg border ${activeFilter === "ghoul" ? "bg-purple-600 text-white border-purple-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                  
                    🎭 {isArabic ? "غول كين" : "Ghoul Mask"}
                  </button>
                </div>
              </div>

              {/* LOWER DIAL TOOLBAR (12.4) */}
              <div className="bg-[#0A0A0A] border border-zinc-800 p-4 rounded-3xl flex justify-between items-center shrink-0 shadow-xl max-w-2xl mx-auto w-full">
                
                {/* Audio/Video controllers */}
                <div className="flex items-center gap-2">
                  <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${isMuted ? "bg-red-950/40 border-red-800 text-red-500" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`}>
                  
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                  onClick={() => {
                    setIsCameraOff(!isCameraOff);
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${isCameraOff ? "bg-red-950/40 border-red-800 text-red-500" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`}>
                  
                    {isCameraOff ? <PhoneOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                  </button>
                </div>

                {/* Auxiliary Controls */}
                <div className="flex items-center gap-2">
                  <button
                  onClick={() => {
                    setIsScreenSharing(!isScreenSharing);
                    playSynthSound("tap");
                    triggerInAppNotification(
                      isArabic ? "مشاركة الشاشة" : "Screen Sharing",
                      isScreenSharing ? "تم إيقاف بث شاشتك" : "جاري مشاركة نافذة التطبيق بجودة عالية...",
                      "info"
                    );
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${isScreenSharing ? "bg-blue-950/40 border-blue-800 text-blue-500" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`}
                  title="Screen Share">
                  
                    <ScreenShare className="w-5 h-5" />
                  </button>

                  <button
                  onClick={() => {
                    setRaisedHand(!raisedHand);
                    playSynthSound("tap");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${raisedHand ? "bg-amber-950/40 border-amber-800 text-amber-500" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`}
                  title="Raise Hand">
                  
                    <Hand className="w-5 h-5" />
                  </button>

                  <button
                  onClick={() => {
                    setIsTranslationEnabled(!isTranslationEnabled);
                    playSynthSound("tap");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${isTranslationEnabled ? "bg-emerald-950/40 border-emerald-800 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`}
                  title="Live Speech Translation">
                  
                    <Languages className="w-5 h-5" />
                  </button>
                </div>

                {/* Terminate Call */}
                <button
                onClick={() => {
                  playSynthSound("error");
                  setCurrentView("lobby");
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20">
                
                  <Phone className="w-4 h-4 rotate-135" />
                  {isArabic ? "إنهاء المكالمة" : "Disconnect"}
                </button>

              </div>

            </motion.div>
          }

          {/* VIEW: LIVE STREAM BROADCAST (Viewer or Host) (12.8 - 12.10) */}
          {(currentView === "stream_host" || currentView === "stream_viewer") &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col md:flex-row bg-[#080808] relative">
            
              
              {/* Left Panel: Stream Video Feed */}
              <div className="flex-1 flex flex-col p-4 relative">
                
                {/* Header Information over video */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF3D00] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
                      🔴 LIVE
                    </span>
                    <span className="bg-black/60 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                      <Eye className="w-3 h-3 text-orange-400" />
                      {viewerCount} {isArabic ? "مشاهد" : "viewers"}
                    </span>
                    <span className="bg-black/60 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-mono">
                      ⏱️ {formatTime(callDuration)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                    onClick={() => {
                      setStreamLikes((p) => p + 1);
                      playSynthSound("success");
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 rounded-xl text-pink-500 flex items-center gap-1.5 text-[10px] cursor-pointer">
                    
                      <Heart className="w-4 h-4 fill-pink-500" />
                      {streamLikes}
                    </button>

                    {currentView === "stream_host" &&
                  <button
                    onClick={() => setCurrentView("analytics")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl text-[10px] flex items-center gap-1 font-bold cursor-pointer">
                    
                        <BarChart2 className="w-4 h-4" />
                        {isArabic ? "لوحة التحليلات" : "Stats Panel"}
                      </button>
                  }
                  </div>
                </div>

                {/* MAIN SCREEN SIMULATED BROADCAST FEED (Anime gameplay/content) */}
                <div className="flex-1 bg-black rounded-2xl border border-zinc-800 relative overflow-hidden flex items-center justify-center group shadow-2xl">
                  
                  {/* Simulated Dynamic Anime Game Stream background */}
                  <div className="absolute inset-0 bg-[#0c0515]">
                    <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000"
                    alt="streaming background"
                    className="w-full h-full object-cover opacity-40 mix-blend-screen" />
                  
                    
                    {/* Simulated live characters */}
                    <div className="absolute bottom-4 right-4 bg-black/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-xs">🎮</div>
                      <div>
                        <h5 className="text-[9px] font-bold text-white">Cyber Gaming Mode</h5>
                        <p className="text-[7px] text-[#FF3D00] font-mono">FPS: 144 • PING: 18ms • GPU: 68%</p>
                      </div>
                    </div>

                    {/* Animated confetti or stars inside stream */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {activeGifts.map((animGift, _autoIdx) =>
                    <motion.div
                      key={`${animGift.id}_${_autoIdx}`}
                      initial={{ opacity: 0, y: 150, scale: 0.5 }}
                      animate={{ opacity: 1, y: -80, scale: 2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 3 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                      
                          <span className="text-6xl drop-shadow-lg">{animGift.icon}</span>
                          <span className="bg-[#FF3D00] text-white text-[9px] font-black px-2 py-0.5 rounded-full mt-2 border border-orange-400">
                            {animGift.sender} {isArabic ? "أرسل" : "sent"} {animGift.name}!
                          </span>
                        </motion.div>
                    )}
                    </div>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute top-4 left-4 bg-black/70 p-3 rounded-xl border border-zinc-800/80 max-w-xs space-y-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {streamForm.title || (isArabic ? "بث مراجعة حلقة ون بيس الأخيرة 🔥🍿" : "Live One Piece Special Review")}
                    </h4>
                    <p className="text-[8px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {streamForm.desc || (isArabic ? "نناقش معاً التطورات والقتالات الخرافية ونسحب هدايا للمشاهدين!" : "Discussing the latest amazing fights with direct community giveaways!")}
                    </p>
                  </div>

                  {/* Guest Video Slot Simulation (12.10) */}
                  {streamForm.guests &&
                <div className="absolute top-4 right-4 w-28 h-20 bg-black/90 rounded-xl border border-zinc-800 overflow-hidden flex flex-col justify-between p-1.5 shadow-md">
                      <div className="flex justify-between items-center text-[7px] font-bold text-zinc-400">
                        <span className="bg-[#FF3D00] text-white px-1 rounded">GUEST</span>
                        <span className="text-green-500 font-mono">Mic On</span>
                      </div>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="guest avatar" className="w-8 h-8 rounded-full mx-auto object-cover border border-zinc-700" />
                      <span className="text-[7px] text-white block text-center truncate font-bold">@zoro_sama</span>
                    </div>
                }

                  {/* Live AI Moderator Indicator (Legendary features) */}
                  {isAiModEnabled &&
                <div className="absolute bottom-4 left-4 bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-1 rounded-xl text-[9px] font-bold flex items-center gap-1.5 animate-pulse">
                      <Shield className="w-3.5 h-3.5" />
                      {isArabic ? "الذكاء الاصطناعي يراقب البث 🤖" : "AI Moderator Watchful 🤖"}
                    </div>
                }

                </div>

                {/* BOTTOM INTERACTIVE CONTROLS (SEND GIFTS, COINS, STARS) */}
                <div className="mt-3 bg-[#0A0A0A] border border-zinc-800 p-3 rounded-2xl flex flex-wrap gap-3 justify-between items-center">
                  
                  {/* Gift selection panel */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-orange-500" />
                      {isArabic ? "أرسل هدية مميزة:" : "Send virtual gift:"}
                    </span>
                    <div className="flex gap-1.5">
                      {giftsList.map((gift, _autoIdx) =>
                    <button
                      key={`${gift.id}_${_autoIdx}`}
                      onClick={() => handleSendGift(gift)}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title={`${gift.labelEn} - Cost: ${gift.cost} Coins`}>
                      
                          <span className="text-sm">{gift.icon}</span>
                          <span className="text-[8px] text-zinc-400">{gift.cost}🪙</span>
                        </button>
                    )}
                    </div>
                  </div>

                  {/* Donate stars button */}
                  <div className="flex gap-2">
                    <button
                    onClick={() => handleSendStars(10)}
                    className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 transition-all cursor-pointer">
                    
                      <Star className="w-3.5 h-3.5" />
                      +10 ⭐
                    </button>
                    <button
                    onClick={() => handleSendStars(50)}
                    className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 transition-all cursor-pointer animate-pulse">
                    
                      <Star className="w-3.5 h-3.5" />
                      +50 ⭐
                    </button>

                    <button
                    onClick={() => {
                      playSynthSound("error");
                      setCurrentView("lobby");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black transition-all cursor-pointer">
                    
                      {isArabic ? "مغادرة البث" : "Leave Stream"}
                    </button>
                  </div>

                </div>

              </div>

              {/* Right Panel: Live Comments, Polls & Supporters Tab */}
              <div className="w-full md:w-80 bg-[#0A0A0A] border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col shrink-0">
                
                {/* Supporter Ranking tab header */}
                <div className="p-3 border-b border-zinc-800 bg-[#111] flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span className="text-white flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                    {isArabic ? "لوحة كبار الداعمين" : "Top Live Supporters"}
                  </span>
                  <span className="text-[8px] font-mono text-amber-400 animate-pulse">RANKING LIVE</span>
                </div>

                {/* Supporters list */}
                <div className="p-2 bg-[#0E0E0E] border-b border-zinc-800 flex gap-2 overflow-x-auto">
                  {supporters.map((sup, sidx) =>
                <div key={sidx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex items-center gap-2 min-w-[110px]">
                      <img src={sup.avatar} alt="sup avatar" className="w-6 h-6 rounded-full object-cover border border-amber-500/30" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-white truncate">@{sup.name}</p>
                        <p className="text-[7px] text-amber-400">🪙 {sup.coins} Coins</p>
                      </div>
                    </div>
                )}
                </div>

                {/* ACTIVE LIVE POLL PANEL (12.9) */}
                <div className="p-3 bg-zinc-950/40 border-b border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                      {isArabic ? "استطلاع رأي البث المباشر" : "Live Stream Survey"}
                    </span>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 font-bold">{activePoll.question}</p>
                  
                  <div className="space-y-1.5 pt-1">
                    {activePoll.options.map((opt: any, idx: number) =>
                  <button
                    key={`poll_opt_${opt.text ? opt.text.slice(0, 10) : idx}_${idx}`}
                    disabled={activePoll.userVoted}
                    onClick={() => handleVotePoll(idx)}
                    className={`w-full text-left p-2 rounded-xl text-[9px] font-bold border relative overflow-hidden transition-all flex justify-between items-center ${activePoll.userVoted ? "bg-zinc-900/60 border-zinc-800 cursor-default" : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 cursor-pointer"}`}>
                    
                        <span className="relative z-10 text-white">{opt.text}</span>
                        <span className="relative z-10 text-zinc-400">{opt.votes} votes</span>
                        {activePoll.userVoted &&
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-purple-500/15"
                      style={{ width: `${opt.votes / 209 * 100}%` }} />

                    }
                      </button>
                  )}
                  </div>
                </div>

                {/* PINNED COMMENT BOX (Legendary addition) */}
                {pinnedComment &&
              <div className="p-2.5 bg-amber-500/5 border-b border-amber-500/25 flex gap-2 items-start text-[10px] relative">
                    <span className="absolute top-1 right-2 text-[8px] bg-amber-500/15 text-amber-400 font-black px-1 rounded uppercase tracking-widest">PINNED</span>
                    <Sliders className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-amber-400">{pinnedComment.user}</span>
                      <p className="text-zinc-300 mt-0.5 leading-relaxed">{pinnedComment.text}</p>
                    </div>
                  </div>
              }

                {/* LIVE COMMENTS CONTAINER */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
                  {streamComments.map((comment, _autoIdx) =>
                <div key={`${comment.id}_${_autoIdx}`} className="text-[10px] group relative">
                      <div className="flex justify-between items-start">
                        <span className="font-black text-orange-400 cursor-pointer">@{comment.user}</span>
                        <span className="text-[7px] text-zinc-600">{comment.time}</span>
                      </div>
                      
                      <p className="text-zinc-200 mt-0.5 leading-relaxed">{comment.text}</p>
                      
                      {/* Interactive translation overlay */}
                      {isTranslationEnabled &&
                  <p className="text-zinc-500 text-[8px] italic mt-0.5 border-t border-zinc-900 pt-0.5">
                          🇯🇵 Translator: {comment.translated}
                        </p>
                  }

                      {/* Stars badge if any */}
                      {comment.stars > 0 &&
                  <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-bold mt-1">
                          ⭐ {comment.stars} Stars SuperDonation
                        </span>
                  }

                      {/* Pin button on hover for hosts */}
                      {currentView === "stream_host" &&
                  <button
                    onClick={() => handlePinComment(comment)}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 bg-zinc-900 border border-zinc-800 text-[8px] px-1 py-0.5 rounded text-zinc-400 hover:text-white transition-opacity cursor-pointer">
                    
                          Pin
                        </button>
                  }

                      {/* Unsend button for own comment */}
                      {comment.user === (currentUser?.username || "Guest_Black") &&
                  <button
                    onClick={() => {
                      if (confirm(isArabic ? "هل تريد سحب هذا التعليق؟" : "Do you want to unsend this comment?")) {
                        handleUnsendLiveComment(comment.id);
                      }
                    }}
                    className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 bg-red-950/80 border border-red-900/40 text-[8px] px-1.5 py-0.5 rounded text-red-400 hover:text-white hover:bg-red-900 transition-opacity cursor-pointer font-bold">
                    
                          {isArabic ? "سحب" : "Unsend"}
                        </button>
                  }
                    </div>
                )}
                </div>

                {/* LIVE GIVEAWAY SPECIAL BAR (Legendary features) */}
                {giveawayStatus !== "none" &&
              <div className="p-3 bg-gradient-to-tr from-purple-950/40 to-indigo-950/40 border-t border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-white flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                        {isArabic ? "السحب العشوائي المباشر (Giveaway)" : "Live Sweepstakes Drawing"}
                      </span>
                      <span className="text-[8px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-black">
                        {giveawayStatus === "active" ? isArabic ? "نشط" : "ACTIVE" : isArabic ? "انتهى" : "DRAWN"}
                      </span>
                    </div>

                    {giveawayStatus === "active" ?
                <div className="space-y-2">
                        <p className="text-[9px] text-zinc-400">
                          {isArabic ? `الجائزة: ${giveawayReward}` : `Reward: ${giveawayReward}`} • {giveawayParticipants.length} {isArabic ? "مسجل بالسحب" : "registered users"}
                        </p>
                        <div className="flex gap-2">
                          <button
                      onClick={handleJoinGiveaway}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black py-1.5 rounded-lg transition-all cursor-pointer">
                      
                            🎟️ {isArabic ? "تسجيل اسمي" : "Enter Giveaway"}
                          </button>
                          {currentView === "stream_host" &&
                    <button
                      onClick={handleDrawGiveaway}
                      className="bg-amber-500 text-black text-[10px] font-black px-4 py-1.5 rounded-lg hover:bg-amber-600 transition-all cursor-pointer">
                      
                              🏆 {isArabic ? "سحب الفائز" : "Draw Winner"}
                            </button>
                    }
                        </div>
                      </div> :

                <div className="bg-black/40 p-2 rounded-xl border border-purple-500/20 text-center">
                        <p className="text-[10px] text-zinc-300">
                          🎉 {isArabic ? `الفائز الأسطوري بالسحب:` : `Legendary Winner chosen:`} <span className="text-amber-400 font-bold">@{giveawayWinner}</span> 🎉
                        </p>
                      </div>
                }
                  </div>
              }

                {/* Stream Host controls (Giveaway starter) */}
                {currentView === "stream_host" && giveawayStatus === "none" &&
              <div className="p-2 border-t border-zinc-800">
                    <button
                  onClick={handleStartGiveaway}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer">
                  
                      🎁 {isArabic ? "إطلاق مسابقة سحب Giveaway" : "Launch Chat Giveaway"}
                    </button>
                  </div>
              }

                {/* Comments Input (12.8) */}
                <div className="p-3 border-t border-zinc-800 bg-[#0F0F0F] flex items-center gap-2">
                  <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendLiveChat()}
                  placeholder={isArabic ? "اكتب تعليقك المباشر هنا..." : "Type live comments..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-[#FF3D00]" />
                
                  <button
                  onClick={handleSendLiveChat}
                  className="bg-[#FF3D00] hover:bg-orange-600 p-2 rounded-xl text-white transition-all cursor-pointer">
                  
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </motion.div>
          }

          {/* VIEW: WATCH PARTY & CINEMA MODE (12.11 - 12.12) */}
          {currentView === "watchparty" &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex-1 flex flex-col md:flex-row relative transition-all duration-500 ${isCinemaMode ? "bg-[#020202]" : "bg-[#080808]"}`}>
            
              
              {/* Cinema Frame Screen */}
              <div className="flex-1 flex flex-col p-4 justify-between relative">
                
                {/* Cinema Top Header */}
                <div className="flex justify-between items-center mb-4 bg-black/40 p-3 rounded-xl border border-zinc-800 z-10">
                  <div>
                    <span className="bg-cyan-500 text-black text-[9px] font-black px-2 py-0.5 rounded">
                      🍿 WATCH PARTY
                    </span>
                    <h3 className="text-xs font-black text-white mt-1">
                      {isArabic ? `عرض سينما: ${watchPartyForm.animeTitle} - حلقة ${watchPartyForm.episode}` : `Cinema Party: ${watchPartyForm.animeTitle} - Episode ${watchPartyForm.episode}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                    onClick={() => {
                      setIsCinemaMode(!isCinemaMode);
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${isCinemaMode ? "bg-amber-500 text-black border-amber-400 animate-pulse" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                    
                      🎬 {isArabic ? "وضع السينما المظلم" : "Cinema Mode"}
                    </button>
                  </div>
                </div>

                {/* THE MOVIE SCREEN with Ambient Lighting Glow */}
                <div className="flex-1 flex flex-col items-center justify-center relative mb-4">
                  
                  {/* Ambient Glow backing if Cinema Mode active */}
                  {isCinemaMode &&
                <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-cyan-500/10 rounded-full blur-[120px] transition-all duration-1000 animate-pulse" />
                }

                  {/* Simulated Cinema Screen Frame */}
                  <div className="w-full max-w-3xl aspect-video bg-[#050505] rounded-3xl border-4 border-zinc-900 relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl z-10">
                    
                    {/* Simulated Film / Anime play animation */}
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-center space-y-3 z-10 p-4">
                        <Sparkles className="w-10 h-10 mx-auto text-cyan-400 animate-spin" />
                        <h4 className="text-sm font-black text-white">
                          {isArabic ? "عرض تجريبي لملف الأنمي الملحمي" : "Epic Anime Video Stream Preview"}
                        </h4>
                        <p className="text-[10px] text-zinc-500">
                          {isArabic ? "مشغل وسائط المزامنة النشط لـ 12 صديق متصل" : "Synchronized player active for 12 co-viewers"}
                        </p>
                      </div>
                      
                      {/* Synced status ticker */}
                      <span className="absolute bottom-4 left-4 text-[9px] font-mono text-cyan-500 animate-pulse">
                        ● SYNCED VIDEO FEED @ {videoState.currentTime}s
                      </span>
                    </div>

                    {/* Movie Control Overlay (12.12) */}
                    <div className="relative z-10 mt-auto bg-black/80 border border-zinc-800/60 p-2 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                        onClick={() => {
                          setVideoState({ ...videoState, playing: !videoState.playing });
                          playSynthSound("tap");
                          triggerInAppNotification(
                            isArabic ? "تعديل تشغيل الأنمي" : "Playback Altered",
                            videoState.playing ? "تم إيقاف الأنمي مؤقتاً للجميع" : "تم استئناف الأنمي للجميع مزامنةً",
                            "info"
                          );
                        }}
                        className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer">
                        
                          {videoState.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                        onClick={() => {
                          setVideoState({ ...videoState, currentTime: Math.max(0, videoState.currentTime - 10) });
                          playSynthSound("tap");
                        }}
                        className="text-[9px] font-mono font-bold hover:text-white text-zinc-400 cursor-pointer">
                        
                          ⏪ -10s
                        </button>
                        <button
                        onClick={() => {
                          setVideoState({ ...videoState, currentTime: Math.min(videoState.duration, videoState.currentTime + 10) });
                          playSynthSound("tap");
                        }}
                        className="text-[9px] font-mono font-bold hover:text-white text-zinc-400 cursor-pointer">
                        
                          ⏩ +10s
                        </button>
                      </div>

                      {/* Time Slider */}
                      <div className="flex-1 mx-4 flex items-center gap-2 text-[9px] text-zinc-400 font-mono">
                        <span>{formatTime(videoState.currentTime)}</span>
                        <div className="flex-1 bg-zinc-800 h-1.5 rounded-full relative overflow-hidden">
                          <div
                          className="absolute left-0 top-0 bottom-0 bg-cyan-400"
                          style={{ width: `${videoState.currentTime / videoState.duration * 100}%` }} />
                        
                        </div>
                        <span>{formatTime(videoState.duration)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
                      </div>
                    </div>

                  </div>

                </div>

                {/* CINEMA ROOM NOTIFICATION OVERLAY */}
                <div className="bg-[#0A0A0A] border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-xs z-10">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Info className="w-4 h-4 text-cyan-400" />
                    {isArabic ? "جميع عناصر التحكم بالأنمي متزامنة بالملي ثانية مع أصدقائك." : "Play, pause, and seek functions are millisecond synchronized."}
                  </span>

                  <button
                  onClick={() => {
                    playSynthSound("error");
                    setCurrentView("lobby");
                  }}
                  className="bg-red-950/40 border border-red-800 text-red-400 px-4 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-red-900 hover:text-white transition-all text-[10px]">
                  
                    {isArabic ? "إغلاق السينما والمغادرة" : "Close Cinema Room"}
                  </button>
                </div>

              </div>

              {/* Watch Party Side Sidebar */}
              <div className="w-full md:w-80 bg-[#0A0A0A] border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col shrink-0 z-10">
                <div className="p-3 border-b border-zinc-800 bg-[#111] flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    {isArabic ? "المستمعون والدردشة" : "Co-Watchers & Chat"}
                  </span>
                  <span className="text-cyan-400">12 Online</span>
                </div>

                {/* Co-watcher Avatars list */}
                <div className="p-2 bg-[#0E0E0E] border-b border-zinc-800 flex gap-2 overflow-x-auto">
                  {participants.map((person, idx) =>
                <div key={person.id ? `${person.id}_cowatch_${idx}` : `cowatch_${idx}`} className="flex flex-col items-center gap-1 min-w-[50px]">
                      <img src={person.avatar} alt="watcher" className="w-7 h-7 rounded-full object-cover border border-cyan-500/30" />
                      <span className="text-[7px] text-zinc-400 block truncate max-w-[45px]">@{person.username}</span>
                    </div>
                )}
                </div>

                {/* Watch party comments / side discussion */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
                  <div className="text-[10px]">
                    <span className="font-bold text-cyan-400">@ken_uchiha:</span>
                    <p className="text-zinc-200 mt-0.5">البداية حماسية جداً! لا أستطيع الانتظار للقتال الرئيسي ⚔️🍿</p>
                  </div>
                  <div className="text-[10px]">
                    <span className="font-bold text-zinc-400">@zoro_sama:</span>
                    <p className="text-zinc-200 mt-0.5">أعتقد أنه أفضل آرك إنتاجي على الإطلاق!</p>
                  </div>
                  <div className="text-[10px]">
                    <span className="font-bold text-zinc-400">@nami_chan:</span>
                    <p className="text-zinc-200 mt-0.5">مزامنة ممتازة، لا يوجد أي تقطيع في الصوت.</p>
                  </div>
                </div>

                {/* Send chat */}
                <div className="p-3 border-t border-zinc-800 bg-[#0F0F0F] flex items-center gap-2">
                  <input
                  type="text"
                  placeholder={isArabic ? "دردشة الأصدقاء..." : "Message friends..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none" />
                
                  <button className="bg-cyan-500 hover:bg-cyan-600 p-2 rounded-xl text-black transition-all cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </motion.div>
          }

          {/* VIEW: BROADCAST ANALYTICS PANEL (12.18) */}
          {currentView === "analytics" &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
            
              
              <div className="flex items-center gap-2">
                <button
                onClick={() => setCurrentView("stream_host")}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer">
                
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="text-sm font-black text-white">
                  {isArabic ? "لوحة تحليلات وإحصائيات البث المباشر" : "Broadcast Analytics Dashboard"}
                </h2>
              </div>

              {/* Cards row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">{isArabic ? "إجمالي المشاهدين" : "Total Viewers"}</span>
                  <p className="text-lg font-black text-white mt-1">1,482</p>
                </div>
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-4 text-center">
                  <Star className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">{isArabic ? "النجوم المستلمة" : "Stars Received"}</span>
                  <p className="text-lg font-black text-white mt-1">284 ⭐</p>
                </div>
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-4 text-center">
                  <Coins className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">{isArabic ? "العملات السوداء كسب" : "Black Coins Earned"}</span>
                  <p className="text-lg font-black text-white mt-1">1,250 🪙</p>
                </div>
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-4 text-center">
                  <Zap className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">{isArabic ? "مستوى التفاعل" : "Engagement Rate"}</span>
                  <p className="text-lg font-black text-white mt-1">94.2%</p>
                </div>
              </div>

              {/* Countries & Devices Simulation Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Countries list */}
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    {isArabic ? "التوزيع الجغرافي للمشاهدين" : "Viewer Countries Distribution"}
                  </h3>
                  
                  <div className="space-y-2 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>المملكة العربية السعودية 🇸🇦</span>
                        <span>42%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-[#FF3D00] h-full" style={{ width: "42%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>مصر 🇪🇬</span>
                        <span>24%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-[#FF3D00] h-full" style={{ width: "24%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>اليابان 🇯🇵</span>
                        <span>18%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-[#FF3D00] h-full" style={{ width: "18%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>باقي الدول 🌍</span>
                        <span>16%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-[#FF3D00] h-full" style={{ width: "16%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device stats */}
                <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    {isArabic ? "الأجهزة ومنصات المشاهدة" : "Viewer Devices & Platforms"}
                  </h3>
                  
                  <div className="space-y-2 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>الهواتف الذكية 📱</span>
                        <span>68%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: "68%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>أجهزة الكمبيوتر 💻</span>
                        <span>22%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: "22%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>شاشات التلفزيون الذكية 📺</span>
                        <span>10%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: "10%" }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Moderation logs overlay */}
              <div className="bg-[#0B0B0B] border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#FF3D00]" />
                  {isArabic ? "سجل نظام الرقابة والذكاء الاصطناعي للبث" : "AI Content Moderation Log"}
                </h3>
                
                {aiModLogs.length === 0 ?
              <p className="text-[10px] text-zinc-500">
                    {isArabic ? "لم يتم رصد أي كلمات بذيئة أو مخالفات حتى الآن. البث نظيف وممتاز." : "No violations detected so far. Broadcast is completely clean."}
                  </p> :

              <div className="space-y-1.5 font-mono text-[9px] text-zinc-400">
                    {aiModLogs.map((log, lidx) =>
                <div key={`ailog_${lidx}`} className="bg-black/60 p-2 rounded border border-red-950/40 text-red-400">
                        {log}
                      </div>
                )}
                  </div>
              }
              </div>

            </motion.div>
          }

        </AnimatePresence>
      </div>

    </div>);

}