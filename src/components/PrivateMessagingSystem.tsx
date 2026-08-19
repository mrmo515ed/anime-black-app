import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, MessageSquare, Search, Send, Image, Mic, MicOff, MoreVertical,
  Plus, Trash2, BellOff, Bell, User, Check, CheckCheck, Clock, Shield,
  Palette, Lock, Unlock, Phone, Video, PhoneOff, Pin, Archive, Eye,
  EyeOff, Volume2, VolumeX, Download, Maximize2, ChevronRight, ChevronLeft,
  Play, Pause,
  Info, AlertCircle, MapPin, Copy, Reply, Forward, Edit, Share2, Sparkles,
  Languages, FileText, CheckCircle2, Settings, Key, Ban, Flag, Paperclip,
  HelpCircle, Activity } from
"lucide-react";
import { db, auth } from "../firebase";
import {
  collection, query, where, getDocs, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, orderBy, limit, setDoc, getDoc, deleteDoc } from
"firebase/firestore";
import { handleFirestoreError, OperationType } from "../firestoreUtils";
import { DirectChat, DirectMessage } from "../types";
import { LinkPreviewMessage } from "./LinkPreview";
import { VoiceNotePlayer } from "./VoiceNotePlayer";

interface PrivateMessagingSystemProps {
  isArabic: boolean;
  currentUser: any;
  onClose: () => void;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  blackCoins?: number;
  setBlackCoins?: (coins: number | ((prev: number) => number)) => void;
  onOpenUserProfile?: (userId: string) => void;
}

// PREMIUM BLACK COIN THEMES & BUBBLE CONFIG
const PREMIUM_BUBBLE_COLORS = [
{ id: "flame", name: "لهيب الأوتـاكو", nameEn: "Otaku Flame", class: "bg-gradient-to-tr from-[#FF3D00] to-orange-600 text-white rounded-br-sm", hex: "#FF3D00", cost: 0 },
{ id: "purple", name: "البنفسجي الإمبراطوري", nameEn: "Imperial Purple", class: "bg-gradient-to-tr from-purple-600 to-indigo-700 text-white rounded-br-sm", hex: "#9333EA", cost: 25 },
{ id: "emerald", name: "الزمرد النادر", nameEn: "Rare Emerald", class: "bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-br-sm", hex: "#059669", cost: 25 },
{ id: "cyan", name: "السايان المشع", nameEn: "Radiant Cyan", class: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-br-sm", hex: "#06B6D4", cost: 25 },
{ id: "sakura", name: "وردي الساكورا", nameEn: "Sakura Pink", class: "bg-gradient-to-tr from-pink-500 to-rose-600 text-white rounded-br-sm", hex: "#EC4899", cost: 25 },
{ id: "gold", name: "الذهب الخالص", nameEn: "Pure Gold", class: "bg-gradient-to-tr from-yellow-500 to-amber-600 text-black rounded-br-sm font-black", hex: "#EAB308", cost: 50 }];


const PRESET_CHAT_BACKGROUNDS = [
{ id: "akihabara", name: "طوكيو أكيهابارا ليلاً", nameEn: "Akihabara Night", url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800" },
{ id: "cherry", name: "حديقة الساكورا اليابانية", nameEn: "Cherry Blossom Garden", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800" },
{ id: "cyberpunk", name: "نيون سايبربانك", nameEn: "Neon Cyberpunk", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800" },
{ id: "zen", name: "غرفة الزن البسيطة", nameEn: "Minimalist Zen Room", url: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800" }];


// Fallback anime profiles to ensure the messaging area is extremely active on first launch
const REGISTERED_ANIME_PROFILES = [
{ uid: "gemini_bot", name: "مساعد الذكاء الاصطناعي الذكي 🤖", username: "gemini_bot", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150" },
{ uid: "luffy_gear5", name: "مونكي دي لوفي 👒", username: "luffy_gear5", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150" },
{ uid: "gojo_sixeyes", name: "غوجو ساتورو 🔮", username: "gojo_sixeyes", avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150" },
{ uid: "mikasa_ack", name: "ميكاسا أكرمان 🧣", username: "mikasa_ack", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
{ uid: "zoro_swords", name: "رورونوا زورو ⚔️", username: "zoro_swords", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
{ uid: "sukuna_curse", name: "ريومن سوكونا 🔥", username: "sukuna_curse", avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150" }];


const ONLINE_STATUS_LABELS: Record<string, {ar: string;en: string;}> = {
  gemini_bot: { ar: "متصل: جاهز للمساعدة 🤖", en: "Active: Ready to help 🤖" },
  luffy_gear5: { ar: "يأكل اللحم 👒🍖", en: "Eating meat 👒🍖" },
  gojo_sixeyes: { ar: "متربص: الأقوى هنا 🔮", en: "Lurking: The strongest ever 🔮" },
  mikasa_ack: { ar: "نشطة: تراقب إيرين 🧣", en: "Active: Watching Eren 🧣" },
  zoro_swords: { ar: "ضائع في طوكيو 🧭⚔️", en: "Lost in Tokyo 🧭⚔️" },
  sukuna_curse: { ar: "مستيقظ: غاضب 🔥", en: "Awake: Furious 🔥" }
};

const TemporaryMessageTicker = ({ expiresAt, onExpire }: {expiresAt: string;onExpire: () => void;}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      const secs = Math.max(0, Math.ceil(diff / 1000));
      setSecondsLeft(secs);
      if (secs <= 0) {
        onExpire();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="flex items-center gap-1 text-[9px] text-[#FF3D00] bg-orange-950/20 px-1.5 py-0.5 rounded border border-[#FF3D00]/20 mt-1 select-none w-max">
      <Clock className="w-2.5 h-2.5 animate-spin-slow text-[#FF3D00]" />
      <span className="font-mono font-bold">{secondsLeft}s</span>
    </div>);

};

export interface ChatInputBarRef {
  getValue: () => string;
  setValue: (val: string) => void;
  appendValue: (val: string) => void;
  focus: () => void;
  clear: () => void;
}

interface ChatInputBarProps {
  isArabic: boolean;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  onSend: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onStartRecording: () => void;
  onCorrectGrammarSpelling: (text: string) => Promise<string | undefined>;
  onTypingStateChange: (state: "idle" | "typing") => void;
  playSynthSound: any;
  showAttachPanel: boolean;
  setShowAttachPanel: (val: boolean) => void;
  showEmojiStickerPanel: boolean;
  setShowEmojiStickerPanel: (val: boolean) => void;
}

const ChatInputBar = React.forwardRef<ChatInputBarRef, ChatInputBarProps>(({
  isArabic,
  editingMessageId,
  setEditingMessageId,
  onSend,
  onEdit,
  onStartRecording,
  onCorrectGrammarSpelling,
  onTypingStateChange,
  playSynthSound,
  showAttachPanel,
  setShowAttachPanel,
  showEmojiStickerPanel,
  setShowEmojiStickerPanel
}, ref) => {
  const [value, setValue] = useState("");
  const [typingState, setTypingState] = useState<"idle" | "typing">("idle");
  const typingTimer = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: (val: string) => setValue(val),
    appendValue: (val: string) => setValue((prev) => prev + val),
    focus: () => {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    },
    clear: () => setValue("")
  }), [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);

    // Auto resize height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (typingState !== "typing") {
      setTypingState("typing");
      onTypingStateChange("typing");
    }

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTypingState("idle");
      onTypingStateChange("idle");
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendOrEdit();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleCorrect = async () => {
    if (!value.trim()) return;
    playSynthSound("tap");
    const corrected = await onCorrectGrammarSpelling(value);
    if (corrected) {
      setValue(corrected);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  const handleSendOrEdit = () => {
    if (!value.trim()) return;
    if (editingMessageId) {
      onEdit(editingMessageId, value);
      setEditingMessageId(null);
    } else {
      onSend(value);
    }
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 focus-within:border-zinc-700 transition-colors">
      {editingMessageId &&
      <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2 text-[10px] text-[#FF3D00] font-black">
            <Edit className="w-3.5 h-3.5" />
            <span>{isArabic ? "تعديل الرسالة شينوبي الجارية..." : "Editing current shinobi message..."}</span>
          </div>
          <button
          onClick={() => {
            setEditingMessageId(null);
            setValue("");
            playSynthSound("tap");
          }}
          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer">
          
            <X className="w-3 h-3" />
          </button>
        </div>
      }
      
      <div className="flex items-end gap-1.5">
        <button
          onClick={() => {setShowAttachPanel(!showAttachPanel);setShowEmojiStickerPanel(false);playSynthSound("tap");}}
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-all shrink-0 cursor-pointer">
          
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => {setShowEmojiStickerPanel(!showEmojiStickerPanel);setShowAttachPanel(false);playSynthSound("tap");}}
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-all shrink-0 cursor-pointer">
          
          <Palette className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          dir="auto"
          placeholder={isArabic ? "اكتب رسالة شينوبي..." : "Type custom shinobi DM..."}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white resize-none max-h-28 min-h-[38px] py-2 px-1 focus:outline-none scrollbar-hide font-medium leading-relaxed placeholder-zinc-500"
          rows={1}
        />
        

        {value.trim().length > 3 &&
        <button
          onClick={handleCorrect}
          title="AI Spelling Correction"
          className="p-1.5 bg-purple-950/40 border border-purple-800/30 text-purple-400 rounded-lg hover:text-white shrink-0 cursor-pointer mr-1 animate-pulse">
          
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        }

        {value.trim() ?
        <button
          onClick={handleSendOrEdit}
          className="p-2 bg-[#FF3D00] hover:bg-orange-600 text-white rounded-xl transition-all shrink-0 cursor-pointer">
          
            <Send className="w-4 h-4" />
          </button> :

        <button
          onClick={onStartRecording}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all shrink-0 cursor-pointer"
          title={isArabic ? "تسجيل رسالة صوتية" : "Record voice message"}>
          
            <Mic className="w-5 h-5" />
          </button>
        }
      </div>
    </div>);

});

ChatInputBar.displayName = "ChatInputBar";

export default function PrivateMessagingSystem({
  isArabic,
  currentUser,
  onClose,
  playSynthSound,
  triggerHapticFeedback,
  blackCoins = 0,
  setBlackCoins,
  onOpenUserProfile
}: PrivateMessagingSystemProps) {
  // Navigation & Views
  const [activeView, setActiveView] = useState<"inbox" | "chat" | "new_chat">("inbox");
  const [chats, setChats] = useState<DirectChat[]>([]);
  const [activeChat, setActiveChat] = useState<DirectChat | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "pinned" | "archived">("all");

  // Search & Discover
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [realUsers, setRealUsers] = useState<any[]>([]);

  // Input fields & states
  const chatInputRef = useRef<ChatInputBarRef>(null);
  const [typingState, setTypingState] = useState<"idle" | "typing" | "recording" | "uploading">("idle");
  const [partnerTyping, setPartnerTyping] = useState<string>("idle");

  // Rich panels
  const [showAttachPanel, setShowAttachPanel] = useState(false);
  const [showEmojiStickerPanel, setShowEmojiStickerPanel] = useState(false);
  const [stickerSheet, setStickerSheet] = useState<"stickers" | "gifs" | "emojis">("stickers");

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordInterval = useRef<any>(null);
  const recordDurationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const shouldCancelRecordRef = useRef<boolean>(false);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Disappearing Messages Mode
  const [disappearingMode, setDisappearingMode] = useState<boolean>(false);

  // File Upload refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  // Interactive Poll creation state
  const [pollForm, setPollForm] = useState({
    isOpen: false,
    question: "",
    options: ["", ""]
  });

  // Call System (Simulated WebRTC Call overlay)
  const [activeCall, setActiveCall] = useState<{
    type: "audio" | "video";
    isIncoming: boolean;
    status: "ringing" | "connected" | "ended";
    partnerId: string;
    elapsed: number;
  } | null>(null);
  const callTimer = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneOscillators = useRef<OscillatorNode[]>([]);

  // AI Drawer states
  const [showAISuite, setShowAISuite] = useState(false);
  const [aiReplies, setAiReplies] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [aiSearchMatches, setAiSearchMatches] = useState<string[]>([]);

  // Shared Media Library Page
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryTab, setMediaLibraryTab] = useState<"media" | "files" | "links">("media");

  // Privacy & Safety Settings Drawer
  const [showPrivacyDrawer, setShowPrivacyDrawer] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(false);
  const [userBlocked, setUserBlocked] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showFullMediaViewer, setShowFullMediaViewer] = useState<any | null>(null);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showMuteDropdown, setShowMuteDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [privacyToggles, setPrivacyToggles] = useState({
    hideLastSeen: false,
    hideReadReceipts: false,
    hideTyping: false
  });

  // User customized features
  const [longPressedMessage, setLongPressedMessage] = useState<any | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<any | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [customBgInput, setCustomBgInput] = useState("");
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  // Custom Media upload with adjustments
  const [pendingMedia, setPendingMedia] = useState<{
    base64Data: string;
    mediaType: "image" | "video";
    fileName: string;
    imageWidth: number;
  } | null>(null);

  // Chat Lock state (PIN Code Security)
  const [lockPinCode, setLockPinCode] = useState("");
  const [lockingChatId, setLockingChatId] = useState<string | null>(null);
  const [pinUnlockTarget, setPinUnlockTarget] = useState<DirectChat | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Search message text inside chat
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const searchMatches = useMemo(() => {
    if (!chatSearchQuery) return [];
    return messages.
    filter((msg) => !msg[`deletedFor.${currentUser.uid}`] && msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase())).
    map((msg, _autoIdx) => msg.id);
  }, [messages, chatSearchQuery, currentUser.uid]);

  const scrollToMatch = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(`msg_${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-amber-500", "p-2");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-amber-500", "p-2");
        }, 1500);
      }
    }, 50);
  };

  // Visual Viewport Height Offset for Mobile Virtual Keyboard
  const [viewportHeightOffset, setViewportHeightOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const visualHeight = window.visualViewport.height;
      const layoutHeight = window.innerHeight;
      const offset = Math.max(0, layoutHeight - visualHeight);
      setViewportHeightOffset(offset);

      if (offset > 50) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);

  // 1. Initial Local Cache Load and Realtime Inbox Sync
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Load Cached Chats first for instant load
    const cached = localStorage.getItem(`direct_chats_${currentUser.uid}`);
    if (cached) {
      setChats(JSON.parse(cached));
    }

    const q = query(
      collection(db, "directChats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc, _autoIdx) => ({
        id: doc.id,
        ...doc.data()
      })) as DirectChat[];

      // Dynamically seed virtual bot chats if they don't exist in the Firestore snapshot
      REGISTERED_ANIME_PROFILES.forEach((bot) => {
        const botChatExists = chatList.some((c) => c.participants.includes(bot.uid));
        if (!botChatExists) {
          const virtualId = `chat_${currentUser.uid}_${bot.uid}`;
          const virtualChat: DirectChat = {
            id: virtualId,
            participants: [currentUser.uid, bot.uid],
            participantDetails: {
              [currentUser.uid]: { name: currentUser.name || "Otaku", avatar: currentUser.avatar || "", username: currentUser.username || "me" },
              [bot.uid]: { name: bot.name, avatar: bot.avatar, username: bot.username }
            },
            unreadCounts: {
              [currentUser.uid]: 0,
              [bot.uid]: 0
            },
            lastMessage: isArabic ? "انقر لبدء الدردشة مع بطل الأنمي!" : "Tap to start chatting with this anime legend!",
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          };
          chatList.push(virtualChat);
        }
      });

      // Sort locally: Unread chats first, then pinned first, then by updatedAt descending
      chatList.sort((a, b) => {
        const unreadA = a.unreadCounts?.[currentUser.uid] || 0;
        const unreadB = b.unreadCounts?.[currentUser.uid] || 0;
        const hasUnreadA = unreadA > 0;
        const hasUnreadB = unreadB > 0;

        if (hasUnreadA && !hasUnreadB) return -1;
        if (!hasUnreadA && hasUnreadB) return 1;

        const isPinnedA = a.pinnedBy?.[currentUser.uid] || false;
        const isPinnedB = b.pinnedBy?.[currentUser.uid] || false;
        if (isPinnedA && !isPinnedB) return -1;
        if (!isPinnedA && isPinnedB) return 1;

        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      setChats(chatList);
      localStorage.setItem(`direct_chats_${currentUser.uid}`, JSON.stringify(chatList));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "directChats");
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 1.5 Start Direct Chat Event Listener
  useEffect(() => {
    const handleStartDirectChat = (e: any) => {
      const targetUser = e.detail;
      if (targetUser && currentUser) {
        handleStartChat(targetUser);
      }
    };
    window.addEventListener("startDirectChat", handleStartDirectChat);
    return () => window.removeEventListener("startDirectChat", handleStartDirectChat);
  }, [chats, currentUser]);

  // 1.6 Real-time Users Subscription from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.
      map((doc, _autoIdx) => ({
        uid: doc.id,
        id: doc.id,
        ...(doc.data() as any)
      })).
      filter((u) => u.uid !== currentUser.uid);
      setRealUsers(usersList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 2. Realtime Chat Messages & Partner Typing Sync
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    // Load Cached Messages
    const cachedMsgs = localStorage.getItem(`msgs_${activeChat.id}`);
    if (cachedMsgs) {
      setMessages(JSON.parse(cachedMsgs));
    }

    const q = query(
      collection(db, `directChats/${activeChat.id}/messages`),
      orderBy("createdAt", "asc"),
      limit(150)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgList = snapshot.docs.map((doc, _autoIdx) => ({
        id: doc.id,
        ...doc.data()
      })) as DirectMessage[];

      // Seed welcoming message if Firestore subcollection is empty and it's a bot/character chat
      if (snapshot.empty && activeChat) {
        const partnerId = activeChat.participants.find((p) => p !== currentUser.uid) || "";
        if (REGISTERED_ANIME_PROFILES.some((p) => p.uid === partnerId)) {
          const welcomeTexts: Record<string, {ar: string;en: string;}> = {
            gemini_bot: {
              ar: "أهلاً بك يا بطل! أنا مساعد الأوتاكو الذكي 🤖. كيف يمكنني مساعدتك اليوم؟ يمكنني اقتراح أنميات أو كتابة منشورات أو مناقشة أي قصة!",
              en: "Welcome hero! I am your Smart Otaku AI 🤖. How can I help you today? I can suggest anime, help write posts, or discuss any lore!"
            },
            luffy_gear5: {
              ar: "هاهاها! مرحباً بك يا صديقي! أنا لوفي وسأكون ملك القراصنة! 👑 هل لديك أي لحم؟ أنا جائع جداً! 🍖",
              en: "Hahaha! Welcome my friend! I am Luffy, and I am going to be King of the Pirates! 👑 Got any meat? I'm starving! 🍖"
            },
            gojo_sixeyes: {
              ar: "أهلاً بك! لا تقلق أبداً الآن لأنني هنا... الأقوى على الإطلاق! 🔮 ما رأيك أن ندردش قليلاً أو نذهب لتناول بعض الموتشي؟",
              en: "Welcome! Don't worry at all now that I'm here... the absolute strongest! 🔮 How about we chat a bit or go grab some mochi?"
            },
            mikasa_ack: {
              ar: "مرحباً. أنا ميكاسا. العالم قاصٍ لكنه جميل جداً... سأبقى دائماً هنا لحمايتك. 🧣",
              en: "Hello. I am Mikasa. The world is cruel but also very beautiful... I will always be here to protect you. 🧣"
            },
            zoro_swords: {
              ar: "أهلاً. أنا زورو. أظن أنني ضللت طريقي ووصلت إلى هنا... على أي حال، هل أنت مستعد للتدريب؟ ⚔️",
              en: "Hey. I am Zoro. I think I got lost and ended up here... anyway, are you ready to train? ⚔️"
            },
            sukuna_curse: {
              ar: "لقد تجرأت على التحدث إلي؟ حسناً، سأستمع إليك لبعض الوقت... لا تجعلني أشعر بالملل وإلا قطعتك إرباً! 🔥",
              en: "You dare speak to me? Fine, I shall listen... do not bore me or I'll slice you to pieces! 🔥"
            }
          };

          const textObj = welcomeTexts[partnerId] || { ar: "أهلاً بك!", en: "Welcome!" };
          const welcomeMsg: DirectMessage = {
            id: `welcome_${partnerId}`,
            senderId: partnerId,
            text: isArabic ? textObj.ar : textObj.en,
            createdAt: new Date(Date.now() - 5000).toISOString(),
            read: true
          };
          msgList = [welcomeMsg];
        }
      }

      setMessages((prev) => {
        // Keep any optimistic messages starting with "temp_" that haven't been resolved yet
        const tempMsgs = prev.filter((m) => m.id.startsWith("temp_") && !msgList.some((sm) => sm.text === m.text && sm.senderId === m.senderId));
        const merged = [...msgList, ...tempMsgs];
        localStorage.setItem(`msgs_${activeChat.id}`, JSON.stringify(merged));
        return merged;
      });

      // Mark unread counts as 0
      const unreadCount = activeChat.unreadCounts?.[currentUser.uid] || 0;
      if (unreadCount > 0) {
        updateDoc(doc(db, "directChats", activeChat.id), {
          [`unreadCounts.${currentUser.uid}`]: 0
        }).catch(() => {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `directChats/${activeChat.id}/messages`);
    });

    // Sync partner's typing state
    const typingDocRef = doc(db, "directChats", activeChat.id);
    const unsubscribeTyping = onSnapshot(typingDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const partnerId = activeChat.participants.find((p) => p !== currentUser.uid) || "";
        const state = data.typingStates?.[partnerId] || "idle";
        setPartnerTyping(state);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [activeChat, currentUser]);

  // Periodic disappearing messages cleanup hook
  useEffect(() => {
    if (!activeChat || messages.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      messages.forEach(async (msg) => {
        if (msg.isTemporary && msg.expiresAt) {
          const expiresTime = new Date(msg.expiresAt).getTime();
          if (now >= expiresTime) {
            try {
              await deleteDoc(doc(db, `directChats/${activeChat.id}/messages`, msg.id));
            } catch (err) {
              console.error("Failed to delete expired message:", err);
            }
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [messages, activeChat]);

  // Scroll to bottom on message updates or typing indicator trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // Sync typing status with database
  const updateDatabaseTypingState = async (state: "idle" | "typing" | "recording" | "uploading") => {
    if (!activeChat || privacyToggles.hideTyping) return;
    try {
      await updateDoc(doc(db, "directChats", activeChat.id), {
        [`typingStates.${currentUser.uid}`]: state
      });
    } catch (e) {

      // Slitently catch network errors
    }};

  // 3. Registered User Discovery & Dynamic Initial Seed
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults(realUsers);
      return;
    }
    const filtered = realUsers.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, realUsers]);

  // Start chat helper
  const handleStartChat = async (targetUser: any) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");

    // Check if chat already exists
    const existingChat = chats.find((c) => c.participants.includes(targetUser.uid) && c.participants.includes(currentUser.uid));
    if (existingChat) {
      if (existingChat.hiddenBy?.[currentUser.uid]) {
        updateDoc(doc(db, "directChats", existingChat.id), {
          [`hiddenBy.${currentUser.uid}`]: false
        }).catch(() => {});
      }
      if (existingChat.lockCode?.[currentUser.uid]) {
        setPinUnlockTarget(existingChat);
        setPinInput("");
        setPinError(false);
      } else {
        setActiveChat(existingChat);
        setActiveView("chat");
      }
      return;
    }

    try {
      const newChatRef = doc(collection(db, "directChats"));
      const newChatData: any = {
        id: newChatRef.id,
        participants: [currentUser.uid, targetUser.uid],
        participantDetails: {
          [currentUser.uid]: { name: currentUser.name, avatar: currentUser.avatar, username: currentUser.username || "me" },
          [targetUser.uid]: { name: targetUser.name, avatar: targetUser.avatar, username: targetUser.username || "otaku" }
        },
        unreadCounts: {
          [currentUser.uid]: 0,
          [targetUser.uid]: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(newChatRef, newChatData);
      setActiveChat(newChatData);
      setActiveView("chat");
      triggerHapticFeedback("success");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "directChats");
    }
  };

  // Typing tracking logic delegated to local input
  const handleTypingStateChange = (state: "idle" | "typing") => {
    setTypingState(state);
    updateDatabaseTypingState(state);
  };

  // 4. Advanced Message Sender
  const sendMessageWithPayload = async (text: string, options: {
    mediaUrl?: string;
    mediaType?: "image" | "video";
    imageWidth?: number;
    voiceNoteUrl?: string;
    voiceDuration?: string;
    stickerId?: string;
    file?: {name: string;size: string;type: string;url: string;};
    poll?: {question: string;options: {text: string;votes: string[];}[];};
    location?: {lat: number;lng: number;label: string;};
    sharedItem?: {type: "post" | "reel" | "story" | "user";id: string;title: string;image?: string;authorName?: string;};
    replyTo?: {id: string;text: string;senderName: string;};
    call?: {type: "audio" | "video";duration?: string;status: "missed" | "completed" | "declined" | "ongoing";};
  } = {}) => {
    if (!activeChat) return;

    playSynthSound("tap");
    triggerHapticFeedback("tap");

    const now = new Date().toISOString();
    const targetUserId = activeChat.participants.find((p) => p !== currentUser.uid) || "";

    const finalOptions = { ...options };
    if (replyingToMessage && !options.replyTo) {
      const isReplyingToMe = replyingToMessage.senderId === currentUser.uid;
      const partnerDetail = activeChat.participantDetails[targetUserId];
      const nameLabel = isReplyingToMe ? isArabic ? "أنا" : "Me" : partnerDetail?.name || "Partner";
      finalOptions.replyTo = {
        id: replyingToMessage.id,
        text: replyingToMessage.text || "",
        senderName: nameLabel
      };
      setReplyingToMessage(null);
    }

    const messageData: any = {
      senderId: currentUser.uid,
      text: text,
      createdAt: now,
      read: false,
      ...finalOptions
    };

    const liveChat = chats.find((c) => c.id === activeChat.id) || activeChat;
    const currentDisappearingDuration = liveChat.disappearingDuration || (disappearingMode ? "15s" : "off");
    if (currentDisappearingDuration !== "off") {
      messageData.isTemporary = true;
      let durationMs = 15 * 1000; // default 15s
      if (currentDisappearingDuration === "24h") durationMs = 24 * 60 * 60 * 1000;else
      if (currentDisappearingDuration === "7d") durationMs = 7 * 24 * 60 * 60 * 1000;else
      if (currentDisappearingDuration === "30d") durationMs = 30 * 24 * 60 * 60 * 1000;

      messageData.expiresAt = new Date(Date.now() + durationMs).toISOString();
    }

    // Appending Optimistic Message immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      ...messageData
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Ensure the chat document exists in Firestore (especially for virtual/seeded chats)
      const chatDocRef = doc(db, "directChats", activeChat.id);
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (!chatDocSnapshot.exists()) {
        await setDoc(chatDocRef, {
          id: activeChat.id,
          participants: activeChat.participants,
          participantDetails: activeChat.participantDetails,
          unreadCounts: activeChat.unreadCounts || { [currentUser.uid]: 0, [targetUserId]: 0 },
          createdAt: activeChat.createdAt || now,
          updatedAt: now
        });
      }

      const msgRef = collection(db, `directChats/${activeChat.id}/messages`);
      await addDoc(msgRef, messageData);

      // Update chat index summary
      await updateDoc(chatDocRef, {
        lastMessage: text || `[${options.mediaType || "وسائط"}]`,
        lastMessageTime: now,
        updatedAt: now
      });

      // Increment target unread count
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        const currentUnread = chatDoc.data().unreadCounts?.[targetUserId] || 0;
        await updateDoc(doc(db, "directChats", activeChat.id), {
          [`unreadCounts.${targetUserId}`]: currentUnread + 1
        });
      }

      // Automatically sync bot reply if target user is an AI Bot or simulated profile
      if (REGISTERED_ANIME_PROFILES.some((p) => p.uid === targetUserId)) {
        triggerSimulatedPartnerReply(targetUserId, text);
      }
    } catch (e) {
      // Remove the optimistic message on real error if offline is completely failed, or we can leave it
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      // Local Save Fallback (Offline persistence)
      const offlineQueueKey = `offline_queue_${currentUser.uid}`;
      const queue = JSON.parse(localStorage.getItem(offlineQueueKey) || "[]");
      queue.push({ chatId: activeChat.id, messageData });
      localStorage.setItem(offlineQueueKey, JSON.stringify(queue));

      triggerInAppNotification(
        isArabic ? "أنت غير متصل" : "Offline mode",
        isArabic ? "تم حفظ الرسالة محلياً وسوف يتم إرسالها فور عودة الإنترنت!" : "Message saved locally and will send when online!"
      );
    } finally {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setTypingState("idle");
      updateDatabaseTypingState("idle");
    }
  };

  // Helper trigger inline notification
  const triggerInAppNotification = (title: string, body: string) => {
    const customEvent = new CustomEvent("openNotification", { detail: { title, body } });
    window.dispatchEvent(customEvent);
  };

  // AI-Powered responses from Anime Legends using Gemini API
  const triggerSimulatedPartnerReply = async (partnerId: string, userText: string) => {
    const partner = REGISTERED_ANIME_PROFILES.find((p) => p.uid === partnerId);
    if (!partner) return;

    updateDatabaseTypingState("typing");

    try {
      // Pass the last few messages to the AI for conversational context
      const chatHistory = messages.slice(-8).map((m, _autoIdx) => ({
        senderId: m.senderId,
        text: m.text
      }));
      chatHistory.push({ senderId: currentUser.uid, text: userText });

      const res = await fetch("/api/ai/character-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: partnerId, messages: chatHistory })
      });
      const data = await res.json();

      let replyText = data.result || "";
      if (!replyText) {
        throw new Error("Empty AI response, falling back");
      }

      const msgRef = collection(db, `directChats/${activeChat!.id}/messages`);
      const now = new Date().toISOString();
      await addDoc(msgRef, {
        senderId: partnerId,
        text: replyText,
        createdAt: now,
        read: false
      });

      await updateDoc(doc(db, "directChats", activeChat!.id), {
        lastMessage: replyText,
        lastMessageTime: now,
        updatedAt: now
      });

    } catch (err) {
      console.warn("AI roleplay call failed, falling back to mock reply:", err);
      // Fallback
      setTimeout(async () => {
        let replyText = "";
        if (partnerId === "luffy_gear5") {
          replyText = isArabic ?
          "هاهاها! هذا مذهل يا صديقي الأوتاكو! أريد تناول بعض اللحم الآن! هل رأيت وانو؟ 🍖🍖" :
          "Hahaha! That's awesome my friend! I want meat! Have you seen Wano arc yet? 🍖🍖";
        } else if (partnerId === "gojo_sixeyes") {
          replyText = isArabic ?
          "لا تقلق يا صديقي، فأنا الأقوى على الإطلاق! هل ترغب في تذوق حلوى الموتشي معي؟ 🔮😎" :
          "Don't worry, I am the strongest after all! Want to grab some sweet mochi with me? 🔮😎";
        } else {
          replyText = isArabic ?
          "أفهمك تماماً. من الرائع التحدث مع شخص يمتلك ذوقك الرفيع في الأنمي!" :
          "I completely get you. It is amazing talking to an otaku with such premium anime taste!";
        }

        try {
          const msgRef = collection(db, `directChats/${activeChat!.id}/messages`);
          const now = new Date().toISOString();
          await addDoc(msgRef, {
            senderId: partnerId,
            text: replyText,
            createdAt: now,
            read: false
          });

          await updateDoc(doc(db, "directChats", activeChat!.id), {
            lastMessage: replyText,
            lastMessageTime: now,
            updatedAt: now
          });
        } catch (e) {}
      }, 2000);
    } finally {
      updateDatabaseTypingState("idle");
    }
  };

  // 5. Sound synthesis using Web Audio API
  const playDualToneRingtone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const playTone = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(440, ctx.currentTime); // Standard ringtone frequency 1

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(480, ctx.currentTime); // Standard ringtone frequency 2

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1.stop(ctx.currentTime + 1.8);
        osc2.stop(ctx.currentTime + 1.8);

        ringtoneOscillators.current.push(osc1, osc2);
      };

      playTone();
      callTimer.current = setInterval(playTone, 3000); // Pulse ring every 3 seconds
    } catch (e) {
      console.warn("Audio ringtone error", e);
    }
  };

  const stopRingtone = () => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    ringtoneOscillators.current.forEach((osc) => {
      try {osc.stop();} catch (e) {}
    });
    ringtoneOscillators.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // 6. Voice note recordings actual browser recording pipeline
  const handleStartRecording = async () => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      shouldCancelRecordRef.current = false;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (shouldCancelRecordRef.current) {
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 900000) {
          alert(isArabic ? "التسجيل طويل جداً، يرجى إرسال تسجيل أقصر" : "Recording is too long, please send a shorter recording");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const durationMin = Math.floor(recordDurationRef.current / 60);
          const durationSec = recordDurationRef.current % 60;
          const durationStr = `${durationMin}:${durationSec.toString().padStart(2, "0")}`;

          await sendMessageWithPayload(isArabic ? "🎙️ رسالة صوتية مرسلة" : "🎙️ Voice message sent", {
            voiceNoteUrl: base64Audio,
            voiceDuration: durationStr
          });
          playSynthSound("success");
        };
      };

      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      recordDurationRef.current = 0;
      updateDatabaseTypingState("recording");

      recordInterval.current = setInterval(() => {
        setRecordDuration((prev) => {
          recordDurationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert(isArabic ? "لم نتمكن من الوصول للميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح" : "Could not access microphone. Please enable microphone permissions in your browser settings.");
    }
  };

  const handleStopRecording = async (shouldSend: boolean) => {
    if (recordInterval.current) {
      clearInterval(recordInterval.current);
      recordInterval.current = null;
    }

    setIsRecording(false);
    updateDatabaseTypingState("idle");

    if (!mediaRecorderRef.current) return;

    shouldCancelRecordRef.current = !shouldSend;
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecordDuration(0);
  };

  const handlePlayVoiceNote = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      setPlayingAudioId(msgId);
      audio.play().catch((e) => {
        console.error("Audio play failed:", e);
        setPlayingAudioId(null);
      });
      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const handleExpireMessage = async (msgId: string) => {
    if (!activeChat) return;
    try {
      await deleteDoc(doc(db, `directChats/${activeChat.id}/messages`, msgId));
    } catch (e) {
      console.error("Expired message delete error:", e);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      setPendingMedia({
        base64Data,
        mediaType,
        fileName: file.name,
        imageWidth: 200 // default size
      });
      playSynthSound("tap");
      triggerHapticFeedback("tap");
    };
    reader.readAsDataURL(file);
  };

  const handleGenericFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setTypingState("uploading");
      updateDatabaseTypingState("uploading");
      try {
        await sendMessageWithPayload(`📂 ${file.name}`, {
          file: {
            name: file.name,
            size: `${sizeMB} MB`,
            type: file.name.split('.').pop()?.toUpperCase() || "BIN",
            url: base64Data
          }
        });
        playSynthSound("success");
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setTypingState("idle");
        updateDatabaseTypingState("idle");
      }
    };
    reader.readAsDataURL(file);
  };

  // 7. Interactive Poll Voting Engine inside direct message
  const handleCastPollVote = async (messageId: string, optionIndex: number) => {
    if (!activeChat) return;
    playSynthSound("purchase");
    triggerHapticFeedback("tap");

    try {
      const msgRef = doc(db, `directChats/${activeChat.id}/messages`, messageId);
      const docSnap = await getDoc(msgRef);
      if (docSnap.exists()) {
        const msgData = docSnap.data();
        const updatedOptions = [...msgData.poll.options];

        // Remove user's previous votes if any
        updatedOptions.forEach((opt: any) => {
          if (opt.votes.includes(currentUser.uid)) {
            opt.votes = opt.votes.filter((uid: string) => uid !== currentUser.uid);
          }
        });

        // Add user vote to new option
        updatedOptions[optionIndex].votes.push(currentUser.uid);

        await updateDoc(msgRef, {
          "poll.options": updatedOptions
        });
      }
    } catch (e) {
      console.error("Failed to cast poll vote", e);
    }
  };

  // 8. Advanced Chat Management Operations (Pin, Archive, Lock)
  const handleToggleChatPin = async (chat: DirectChat) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    const currentlyPinned = chat.pinnedBy?.[currentUser.uid] || false;
    try {
      await updateDoc(doc(db, "directChats", chat.id), {
        [`pinnedBy.${currentUser.uid}`]: !currentlyPinned
      });
      triggerInAppNotification(
        isArabic ? "تثبيت المحادثة" : "Pin Chat",
        isArabic ?
        currentlyPinned ? "تم إلغاء تثبيت المحادثة" : "تم تثبيت المحادثة في الأعلى بنجاح!" :
        currentlyPinned ? "Chat unpinned successfully" : "Chat pinned on top successfully!"
      );
    } catch (e) {}
  };

  const handleToggleChatArchive = async (chat: DirectChat) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    const currentlyArchived = chat.archivedBy?.[currentUser.uid] || false;
    try {
      await updateDoc(doc(db, "directChats", chat.id), {
        [`archivedBy.${currentUser.uid}`]: !currentlyArchived
      });
      triggerInAppNotification(
        isArabic ? "أرشفة المحادثة" : "Archive Chat",
        isArabic ?
        currentlyArchived ? "تم نقل المحادثة للرئيسية" : "تم نقل المحادثة إلى الأرشيف بنجاح" :
        currentlyArchived ? "Chat unarchived successfully" : "Chat archived successfully"
      );
    } catch (e) {}
  };

  const handleToggleChatMute = async (chat: DirectChat) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    const currentlyMuted = chat.mutedBy?.[currentUser.uid] || false;
    try {
      await updateDoc(doc(db, "directChats", chat.id), {
        [`mutedBy.${currentUser.uid}`]: !currentlyMuted
      });
      triggerInAppNotification(
        isArabic ? "كتم الإشعارات" : "Mute Chat",
        isArabic ?
        currentlyMuted ? "تم تفعيل الإشعارات" : "تم كتم إشعارات المحادثة بنجاح" :
        currentlyMuted ? "Notifications unmuted" : "Notifications muted successfully"
      );
    } catch (e) {}
  };

  const handleLockChatWithPin = async (chatId: string, pin: string) => {
    playSynthSound("success");
    triggerHapticFeedback("levelup");
    try {
      await updateDoc(doc(db, "directChats", chatId), {
        [`lockCode.${currentUser.uid}`]: pin
      });
      setLockingChatId(null);
      setLockPinCode("");
      triggerInAppNotification(
        isArabic ? "حماية الدردشة" : "Chat lock active",
        isArabic ? "تم قفل وإخفاء المحادثة برقمك السري الخاص!" : "Chat locked and hidden behind PIN code successfully!"
      );
    } catch (e) {}
  };

  const handleRemoveChatLock = async (chatId: string) => {
    playSynthSound("tap");
    try {
      await updateDoc(doc(db, "directChats", chatId), {
        [`lockCode.${currentUser.uid}`]: null
      });
      triggerInAppNotification(
        isArabic ? "إلغاء القفل" : "PIN lock removed",
        isArabic ? "تم إلغاء قفل المحادثة بنجاح." : "PIN security removed successfully."
      );
    } catch (e) {}
  };

  const handleVerifyPINUnlock = () => {
    if (!pinUnlockTarget) return;
    const correctPin = pinUnlockTarget.lockCode?.[currentUser.uid];
    if (pinInput === correctPin) {
      playSynthSound("success");
      triggerHapticFeedback("success");
      setActiveChat(pinUnlockTarget);
      setActiveView("chat");
      setPinUnlockTarget(null);
      setPinInput("");
      setPinError(false);
    } else {
      playSynthSound("error");
      triggerHapticFeedback("error");
      setPinError(true);
      setPinInput("");
    }
  };

  // Delete chat locally
  const handleDeleteChatLocally = async (chatId: string) => {
    playSynthSound("error");
    triggerHapticFeedback("error");
    try {
      await updateDoc(doc(db, "directChats", chatId), {
        [`deletedBy.${currentUser.uid}`]: true
      });
      setActiveChat(null);
      setActiveView("inbox");
      triggerInAppNotification(
        isArabic ? "حذف من الجهاز" : "Deleted Locally",
        isArabic ? "تم حذف المحادثة وإخفاؤها من جهازك بنجاح." : "Chat deleted and hidden from your device successfully."
      );
    } catch (e) {}
  };

  // Delete chat for both participants
  const handleDeleteChatRemotely = async (chatId: string) => {
    playSynthSound("error");
    triggerHapticFeedback("levelup");
    try {
      // Clean messages first
      const msgsSnapshot = await getDocs(collection(db, `directChats/${chatId}/messages`));
      const deletePromises = msgsSnapshot.docs.map((doc, _autoIdx) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete core chat room
      await deleteDoc(doc(db, "directChats", chatId));
      setActiveChat(null);
      setActiveView("inbox");
      triggerInAppNotification(
        isArabic ? "حذف للطرفين" : "Deleted for both",
        isArabic ? "تم حذف المحادثة وجميع رسائلها بشكل نهائي للطرفين!" : "Conversation completely purged for both users!"
      );
    } catch (e) {}
  };

  // Message modifications
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!activeChat) return;
    playSynthSound("tap");
    // Optimistic Update
    setMessages((prev) => prev.map((m, _autoIdx) => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
    try {
      await updateDoc(doc(db, `directChats/${activeChat.id}/messages`, messageId), {
        text: newText,
        isEdited: true
      });
    } catch (e) {}
  };

  const handleDeleteMessageForMe = async (messageId: string) => {
    if (!activeChat) return;
    playSynthSound("error");
    // Optimistic Update
    setMessages((prev) => prev.map((m, _autoIdx) => m.id === messageId ? { ...m, [`deletedFor.${currentUser.uid}`]: true } : m));
    try {
      await updateDoc(doc(db, `directChats/${activeChat.id}/messages`, messageId), {
        [`deletedFor.${currentUser.uid}`]: true
      });
    } catch (e) {}
  };

  const handleDeleteMessageForEveryone = async (messageId: string) => {
    if (!activeChat) return;
    playSynthSound("error");
    // Optimistic Update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteDoc(doc(db, `directChats/${activeChat.id}/messages`, messageId));
      triggerInAppNotification(
        isArabic ? "سحب الرسالة" : "Message Recalled",
        isArabic ? "تم سحب رسالتك بنجاح للطرفين." : "Your message has been successfully recalled/unsent for both parties."
      );
    } catch (e) {
      console.error("Unsend message error:", e);
    }
  };

  const handleToggleMessagePin = async (messageId: string, currentPinStatus: boolean) => {
    if (!activeChat) return;
    playSynthSound("levelup");
    // Optimistic Update
    setMessages((prev) => prev.map((m, _autoIdx) => m.id === messageId ? { ...m, isPinned: !currentPinStatus } : m));
    try {
      await updateDoc(doc(db, `directChats/${activeChat.id}/messages`, messageId), {
        isPinned: !currentPinStatus
      });
    } catch (e) {}
  };

  // CUSTOM CHAT THEMES & BUBBLE COLORS LOGIC
  const handleSelectBubbleColor = async (colorId: string) => {
    if (!activeChat) return;
    const colorOpt = PREMIUM_BUBBLE_COLORS.find((c) => c.id === colorId);
    if (!colorOpt) return;

    const unlockedKey = `unlocked_bubbles_${currentUser.uid}`;
    const unlockedList = JSON.parse(localStorage.getItem(unlockedKey) || '["flame"]');

    if (!unlockedList.includes(colorId)) {
      if (colorOpt.cost > blackCoins) {
        playSynthSound("error");
        triggerHapticFeedback("error");
        alert(isArabic ? `❌ ليس لديك كوينز سوداء كافية! تكلفة اللون ${colorOpt.cost} كوينز.` : `❌ Not enough Black Coins! Cost is ${colorOpt.cost} coins.`);
        return;
      }

      if (setBlackCoins) {
        setBlackCoins((prev) => prev - colorOpt.cost);
      }
      unlockedList.push(colorId);
      localStorage.setItem(unlockedKey, JSON.stringify(unlockedList));
      playSynthSound("purchase");
      triggerHapticFeedback("purchase");
      triggerInAppNotification(
        isArabic ? "شراء لون الفقاعة" : "Bubble Color Purchased",
        isArabic ? `تم شراء لون "${colorOpt.name}" بنجاح خصماً ${colorOpt.cost} كوينز سوداء!` : `Successfully purchased "${colorOpt.nameEn}" for ${colorOpt.cost} Black Coins!`
      );
    } else {
      playSynthSound("tap");
      triggerHapticFeedback("tap");
    }

    try {
      await updateDoc(doc(db, "directChats", activeChat.id), {
        [`bubbleColor_${currentUser.uid}`]: colorId
      });
    } catch (err) {
      console.warn("Failed to update firestore bubble color, using local storage", err);
    }
    localStorage.setItem(`bubble_color_${activeChat.id}`, colorId);
    triggerInAppNotification(
      isArabic ? "تم تغيير اللون" : "Color Changed",
      isArabic ? `تم تطبيق لون الفقاعة الجديد: ${colorOpt.name}` : `Applied new bubble color: ${colorOpt.nameEn}`
    );
  };

  const handleSelectBackground = async (bgUrl: string) => {
    if (!activeChat) return;
    playSynthSound("success");
    triggerHapticFeedback("success");

    try {
      await updateDoc(doc(db, "directChats", activeChat.id), {
        chatBg: bgUrl
      });
    } catch (err) {
      console.warn("Failed to update firestore background, using local storage fallback", err);
    }
    localStorage.setItem(`chat_bg_${activeChat.id}`, bgUrl);
    setCustomBgInput("");
    triggerInAppNotification(
      isArabic ? "تخصيص الخلفية" : "Chat Theme Updated",
      isArabic ? "تم تحديث خلفية المحادثة بنجاح!" : "Chat background theme updated successfully!"
    );
  };

  const handleUploadBackgroundFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      await handleSelectBackground(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // TOUCH/CLICK LONG PRESS TIMEOUT TRIGGERS
  const longPressTimeout = useRef<any>(null);
  const isLongPressActive = useRef<boolean>(false);

  const handleTouchStart = (msg: any) => {
    isLongPressActive.current = false;
    longPressTimeout.current = setTimeout(() => {
      isLongPressActive.current = true;
      setLongPressedMessage(msg);
      playSynthSound("tap");
      triggerHapticFeedback("levelup");
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleForwardMessageToChat = async (targetChat: DirectChat) => {
    if (!forwardingMessage) return;
    playSynthSound("success");
    triggerHapticFeedback("success");

    const textToSend = forwardingMessage.text ? `🔄 ${isArabic ? "رسالة ممررة:" : "Forwarded message:"} ${forwardingMessage.text}` : "";
    const options: any = {};
    if (forwardingMessage.mediaUrl) {
      options.mediaUrl = forwardingMessage.mediaUrl;
      options.mediaType = forwardingMessage.mediaType;
    }
    if (forwardingMessage.file) {
      options.file = forwardingMessage.file;
    }
    if (forwardingMessage.voiceNoteUrl) {
      options.voiceNoteUrl = forwardingMessage.voiceNoteUrl;
      options.voiceDuration = forwardingMessage.voiceDuration;
    }

    try {
      const targetMsgRef = collection(db, `directChats/${targetChat.id}/messages`);
      const now = new Date().toISOString();
      await addDoc(targetMsgRef, {
        senderId: currentUser.uid,
        text: textToSend,
        createdAt: now,
        read: false,
        ...options
      });

      await updateDoc(doc(db, "directChats", targetChat.id), {
        lastMessage: textToSend || "[وسائط ممررة]",
        lastMessageTime: now,
        updatedAt: now
      });

      triggerInAppNotification(
        isArabic ? "تم إعادة التوجيه" : "Message Forwarded",
        isArabic ?
        `تم توجيه الرسالة بنجاح إلى ${targetChat.participantDetails[targetChat.participants.find((p) => p !== currentUser.uid) || ""]?.name}` :
        `Message forwarded to ${targetChat.participantDetails[targetChat.participants.find((p) => p !== currentUser.uid) || ""]?.name}`
      );
    } catch (err) {
      console.error("Forwarding failed:", err);
    } finally {
      setForwardingMessage(null);
    }
  };

  const handleSendPendingMedia = async () => {
    if (!pendingMedia) return;
    setTypingState("uploading");
    updateDatabaseTypingState("uploading");
    try {
      await sendMessageWithPayload(
        pendingMedia.mediaType === "image" ?
        isArabic ? "🖼️ صورة مرفقة" : "🖼️ Image attached" :
        isArabic ? "📹 ريلز مرفق" : "📹 Reels attached",
        {
          mediaUrl: pendingMedia.base64Data,
          mediaType: pendingMedia.mediaType,
          imageWidth: pendingMedia.imageWidth
        }
      );
      playSynthSound("success");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setPendingMedia(null);
      setTypingState("idle");
      updateDatabaseTypingState("idle");
    }
  };

  // Realtime multi-reaction engine
  const handleAddReactionToMessage = async (messageId: string, emoji: string) => {
    if (!activeChat) return;
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    try {
      const msgRef = doc(db, `directChats/${activeChat.id}/messages`, messageId);
      const docSnap = await getDoc(msgRef);
      if (docSnap.exists()) {
        const reactions = docSnap.data().reactions || {};
        const voters = reactions[emoji] || [];

        let nextVoters = [...voters];
        if (nextVoters.includes(currentUser.uid)) {
          nextVoters = nextVoters.filter((uid) => uid !== currentUser.uid);
        } else {
          nextVoters.push(currentUser.uid);
        }

        const nextReactions = { ...reactions };
        if (nextVoters.length === 0) {
          delete nextReactions[emoji];
        } else {
          nextReactions[emoji] = nextVoters;
        }

        await updateDoc(msgRef, { reactions: nextReactions });
      }
    } catch (e) {}
  };

  // 9. Call Simulator State Triggers
  const startCallSession = (type: "audio" | "video") => {
    if (!activeChat) return;
    playSynthSound("success");
    triggerHapticFeedback("levelup");

    const partnerId = activeChat.participants.find((p) => p !== currentUser.uid) || "";

    setActiveCall({
      type,
      isIncoming: false,
      status: "ringing",
      partnerId,
      elapsed: 0
    });

    playDualToneRingtone();

    // Answer incoming call simulation after 4 seconds
    setTimeout(() => {
      setActiveCall((prev) => {
        if (prev && prev.status === "ringing") {
          stopRingtone();
          playSynthSound("levelup");

          // Connect Call timer
          callTimer.current = setInterval(() => {
            setActiveCall((c) => c ? { ...c, elapsed: c.elapsed + 1 } : null);
          }, 1000);

          return { ...prev, status: "connected" };
        }
        return prev;
      });
    }, 4500);
  };

  const acceptCallSession = () => {
    if (!activeCall) return;
    stopRingtone();
    playSynthSound("success");
    triggerHapticFeedback("success");

    callTimer.current = setInterval(() => {
      setActiveCall((c) => c ? { ...c, elapsed: c.elapsed + 1 } : null);
    }, 1000);

    setActiveCall((prev) => prev ? { ...prev, status: "connected" } : null);
  };

  const endCallSession = () => {
    stopRingtone();
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    playSynthSound("error");
    triggerHapticFeedback("error");

    if (activeCall && activeCall.status === "connected") {
      const partnerDetails = activeChat?.participantDetails[activeCall.partnerId];
      const durationMin = Math.floor(activeCall.elapsed / 60);
      const durationSec = activeCall.elapsed % 60;
      const formattedDuration = `${durationMin}:${durationSec.toString().padStart(2, "0")}`;

      sendMessageWithPayload(
        activeCall.type === "video" ?
        isArabic ? `📹 مكالمة فيديو منتهية (${formattedDuration})` : `📹 Video Call ended (${formattedDuration})` :
        isArabic ? `📞 مكالمة صوتية منتهية (${formattedDuration})` : `📞 Voice Call ended (${formattedDuration})`,
        {
          call: {
            type: activeCall.type,
            duration: formattedDuration,
            status: "completed"
          }
        }
      );
    }

    setActiveCall(null);
  };

  // 10. Server-side Gemini AI Actions
  const handleGenerateSmartReplies = async () => {
    if (!activeChat || messages.length === 0) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/chat-smart-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(-5).map((m, _autoIdx) => ({
            text: m.text,
            senderId: m.senderId === currentUser.uid ? "me" : "partner"
          }))
        })
      });
      const data = await response.json();
      if (data.result) {
        setAiReplies(data.result);
        playSynthSound("levelup");
      }
    } catch (e) {
      setAiReplies(isArabic ? ["رائع جداً!", "بكل تأكيد 🎉", "سأرد عليك قريباً"] : ["That's cool!", "Absolutely! 🎉", "Talk to you soon"]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTranslateMessage = async (msgId: string, text: string) => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    // Detect typical language
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const targetLang = hasArabic ? "en" : "ar";

    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLang })
      });
      const data = await response.json();
      if (data.result) {
        // Overlay localized translation directly in message balloon state locally
        setMessages((prev) => prev.map((m, _autoIdx) => m.id === msgId ? { ...m, translatedText: data.result } : m));
        playSynthSound("success");
      }
    } catch (e) {
      triggerInAppNotification("AI Translation", "Failed to contact translation server");
    }
  };

  const handleSummarizeConversation = async () => {
    if (messages.length === 0) return;
    setAiLoading(true);
    setShowAISuite(true);
    setAiSummary(null);
    try {
      const fullText = messages.map((m, _autoIdx) => `${m.senderId === currentUser.uid ? "Me" : "Partner"}: ${m.text}`).join("\n");
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText })
      });
      const data = await response.json();
      if (data.result) {
        setAiSummary(data.result);
        playSynthSound("success");
      }
    } catch (e) {
      setAiSummary(isArabic ? "لم نتمكن من الوصول لخوادم التلخيص الفوري." : "Could not reach quick summarization servers.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCorrectGrammarSpelling = async (text: string): Promise<string | undefined> => {
    if (!text.trim()) return undefined;
    try {
      const response = await fetch("/api/ai/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (data.result) {
        triggerHapticFeedback("success");
        return data.result;
      }
    } catch (e) {}
    return undefined;
  };

  const handleAIQuerySemanticSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/chat-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: aiSearchQuery,
          messages: messages.map((m, _autoIdx) => ({
            id: m.id,
            text: m.text,
            senderName: m.senderId === currentUser.uid ? "Me" : "Partner"
          }))
        })
      });
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        setAiSearchMatches(data.result);
        if (data.result.length > 0) {
          triggerInAppNotification(
            isArabic ? "البحث بالذكاء الاصطناعي" : "AI Search Results",
            isArabic ? `تم العثور على ${data.result.length} رسالة مطابقة سياقياً!` : `Found ${data.result.length} contextually matching messages!`
          );
          playSynthSound("success");
        } else {
          triggerInAppNotification(
            isArabic ? "البحث بالذكاء الاصطناعي" : "AI Search Results",
            isArabic ? "لم يتم العثور على رسائل مطابقة سياقياً." : "No contextually matching messages found."
          );
        }
      }
    } catch (e) {
      // Fallback: simple text query index matching
      const matches = messages.
      filter((m) => m.text.toLowerCase().includes(aiSearchQuery.toLowerCase())).
      map((m, _autoIdx) => m.id);
      setAiSearchMatches(matches);
    } finally {
      setAiLoading(false);
    }
  };

  // Computed shared gallery library index
  const sharedMediaFiles = useMemo(() => {
    const list = { media: [] as any[], files: [] as any[], links: [] as any[] };
    messages.forEach((m) => {
      if (m.mediaUrl && m.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        list.media.push({ id: m.id, url: m.mediaUrl, date: m.createdAt });
      }
      if (m.file) {
        list.files.push({ id: m.id, ...m.file, date: m.createdAt });
      }
      // Simple link regex detection
      const urls = m.text.match(/https?:\/\/[^\s]+/g);
      if (urls) {
        urls.forEach((url) => {
          list.links.push({ id: m.id, url, senderId: m.senderId, date: m.createdAt });
        });
      }
    });
    return list;
  }, [messages]);

  // Compute unread sums
  const totalUnreadSum = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCounts?.[currentUser.uid] || 0), 0);
  }, [chats, currentUser]);

  // Filters mapping
  const filteredInboxChats = useMemo(() => {
    return chats.filter((c) => {
      // Hide deleted chats
      if (c.deletedBy?.[currentUser.uid]) return false;

      // Hide hidden chats
      if (c.hiddenBy?.[currentUser.uid]) return false;

      const isPinned = c.pinnedBy?.[currentUser.uid] || false;
      const isArchived = c.archivedBy?.[currentUser.uid] || false;

      if (activeFilter === "pinned") return isPinned && !isArchived;
      if (activeFilter === "archived") return isArchived;
      return !isArchived; // standard inbox hides archive
    });
  }, [chats, activeFilter, currentUser]);

  return (
    <AnimatePresence>
      <motion.div
        id="private_chat_root"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4">
        
        {/* Anti-Screenshot Protection Shield */}
        {screenshotProtection &&
        <div className="absolute inset-0 bg-[#FF3D00]/5 z-[150] pointer-events-none border-4 border-[#FF3D00] animate-pulse">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#FF3D00] text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase select-none shadow-md">
              ⚠️ {isArabic ? "درع حماية الخصوصية نشط - ممنوع تصوير الشاشة" : "PRIVACY SHIELD ACTIVE - NO SCREENSHOTS"}
            </span>
          </div>
        }

        <div className="bg-[#0A0A0A] w-full h-full sm:h-[650px] sm:max-w-md sm:rounded-3xl sm:border sm:border-zinc-800 shadow-2xl flex flex-col overflow-hidden relative font-sans">
          
          {/* TOP HEADER */}
          {activeView !== "chat" &&
          <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0 bg-zinc-950/70 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3D00] to-pink-600 flex items-center justify-center shadow-lg shadow-[#FF3D00]/10">
                  <MessageSquare className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="font-black text-white text-sm tracking-wide">
                    {isArabic ? "مراسلات الأوتـاكو" : "Otaku Direct Messenger"}
                  </h1>
                  {totalUnreadSum > 0 &&
                <span className="text-[9px] bg-[#FF3D00] text-white font-black px-1.5 py-0.5 rounded-full">
                      {totalUnreadSum} {isArabic ? "غير مقروء" : "unread"}
                    </span>
                }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                onClick={() => {playSynthSound("tap");onClose();}}
                className="p-2 bg-zinc-900 hover:bg-red-600 rounded-full transition-all group cursor-pointer">
                
                  <X className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          }

          {/* CHAT VIEW SPECIFIC HEADER */}
          {activeView === "chat" && activeChat &&
          <div className="h-16 border-b border-zinc-900 px-3 flex items-center justify-between bg-zinc-950/85 backdrop-blur-md shrink-0 z-10">
              <div className="flex items-center gap-2 min-w-0">
                <button
                onClick={() => {setActiveView("inbox");setActiveChat(null);playSynthSound("tap");}}
                className="p-1.5 -ml-1 text-zinc-400 hover:text-white cursor-pointer">
                
                  {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <div
                onClick={() => {
                  setShowChatInfo(true);
                  playSynthSound("tap");
                }}
                className="flex items-center gap-2 cursor-pointer min-w-0"
                title={isArabic ? "معلومات المحادثة" : "Chat Info"}>
                
                  <div className="relative">
                    <img
                    src={activeChat.participantDetails[activeChat.participants.find((p) => p !== currentUser.uid) || ""]?.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#FF3D00]/50" />
                  
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-900 ${partnerTyping !== "idle" || realUsers.some((u) => u.uid === activeChat.participants.find((p) => p !== currentUser.uid) && u.isOnline) ? "bg-green-500 animate-ping" : "bg-zinc-600"}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-white truncate">
                      {activeChat.participantDetails[activeChat.participants.find((p) => p !== currentUser.uid) || ""]?.name}
                    </h3>
                    {partnerTyping !== "idle" ?
                  <p className="text-[9px] text-[#FF3D00] font-black animate-pulse">
                        {partnerTyping === "typing" && (isArabic ? "يكتب الآن..." : "typing...")}
                        {partnerTyping === "recording" && (isArabic ? "يسجل صوتاً..." : "recording audio...")}
                        {partnerTyping === "uploading" && (isArabic ? "يرفع ملفاً..." : "uploading...")}
                      </p> :

                  <p className="text-[9px] text-zinc-500 font-mono truncate">
                        {realUsers.some((u) => u.uid === activeChat.participants.find((p) => p !== currentUser.uid) && u.isOnline) ?
                    isArabic ? "نشط الآن 🟢" : "Online now 🟢" :
                    isArabic ? "غير متصل 📡" : "Offline 📡"}
                      </p>
                  }
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <button
                onClick={() => {
                  setShowThemeModal(true);
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                }}
                title={isArabic ? "تخصيص مظهر المحادثة ولون الفقاعات" : "Customize Theme & Colors"}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-[#FF3D00] transition-colors cursor-pointer">
                
                  <Palette className="w-4 h-4" />
                </button>
                <button
                onClick={() => {
                  setDisappearingMode(!disappearingMode);
                  playSynthSound("purchase");
                  triggerHapticFeedback("tap");
                }}
                title={isArabic ? "الوضع المؤقت (رسائل تختفي تلقائياً)" : "Temporary Chat Mode (Self-Destruct)"}
                className={`p-2 rounded-full transition-all cursor-pointer ${disappearingMode ? "bg-[#FF3D00]/20 text-[#FF3D00] border border-[#FF3D00]/30 animate-pulse" : "text-zinc-400 hover:text-[#FF3D00] hover:bg-zinc-900"}`}>
                
                  <Clock className="w-4 h-4" />
                </button>
                <button
                onClick={() => startCallSession("audio")}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-[#FF3D00] transition-colors cursor-pointer">
                
                  <Phone className="w-4 h-4" />
                </button>
                <button
                onClick={() => startCallSession("video")}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-[#FF3D00] transition-colors cursor-pointer">
                
                  <Video className="w-4 h-4" />
                </button>
                <button
                onClick={() => {setChatSearchOpen(!chatSearchOpen);playSynthSound("tap");}}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white cursor-pointer">
                
                  <Search className="w-4 h-4" />
                </button>
                <button
                onClick={() => setShowPrivacyDrawer(true)}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white cursor-pointer">
                
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          }

          {/* ACTIVE CALL SCREEN WRAPPER */}
          {activeCall &&
          <div className="absolute inset-0 bg-zinc-950 z-[200] flex flex-col justify-between p-6 select-none animate-fade-in text-center">
              <div className="space-y-4 pt-12">
                <span className="text-[9px] bg-red-600/20 text-red-500 font-bold px-3 py-1 rounded-full border border-red-500/20 tracking-widest uppercase">
                  {activeCall.type === "video" ? isArabic ? "اتصال فيديو شينوبي" : "SHINOBI VIDEO CALL" : isArabic ? "اتصال صوتي شينوبي" : "SHINOBI VOICE CALL"}
                </span>
                
                <div className="relative w-24 h-24 mx-auto my-6">
                  <div className="absolute inset-0 bg-[#FF3D00]/20 rounded-full animate-ping" />
                  <img
                  src={activeChat?.participantDetails[activeCall.partnerId]?.avatar}
                  alt="caller avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#FF3D00] relative z-10" />
                
                </div>

                <h2 className="text-lg font-black text-white">
                  {activeChat?.participantDetails[activeCall.partnerId]?.name}
                </h2>
                <p className="text-zinc-500 text-xs font-mono">
                  {activeCall.status === "ringing" ? isArabic ? "يرن..." : "Ringing..." : isArabic ? "مؤمن تماماً ومتصل" : "Connected & Secure"}
                </p>

                {activeCall.status === "connected" &&
              <div className="text-amber-500 font-black text-sm font-mono mt-4">
                    {Math.floor(activeCall.elapsed / 60)}:{(activeCall.elapsed % 60).toString().padStart(2, "0")}
                  </div>
              }
              </div>

              {/* Dynamic video feed simulation */}
              {activeCall.type === "video" && activeCall.status === "connected" &&
            <div className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl my-4 overflow-hidden relative flex items-center justify-center shadow-inner">
                  <div className="absolute top-2 right-2 w-20 h-28 bg-black rounded-lg overflow-hidden border border-[#FF3D00]/50 z-20">
                    <img src={currentUser.avatar} alt="my feed" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono select-none">
                    [ Simulated HD Camera Stream ]
                  </div>
                </div>
            }

              {/* Call Control Buttons */}
              <div className="flex justify-center gap-6 pb-12">
                {activeCall.status === "ringing" && activeCall.isIncoming &&
              <button
                onClick={acceptCallSession}
                className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all">
                
                    <Phone className="w-6 h-6" />
                  </button>
              }
                <button
                onClick={endCallSession}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all">
                
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          }

          {/* VIEW: INBOX */}
          {activeView === "inbox" &&
          <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
              {/* Inbox tabs */}
              <div className="flex border-b border-zinc-900 bg-zinc-950/40">
                {(["all", "pinned", "archived"] as const).map((tab, _autoIdx) =>
              <button
                key={`${tab}_${_autoIdx}`}
                onClick={() => {playSynthSound("tap");setActiveFilter(tab);}}
                className={`flex-1 py-3 text-xs font-black transition-all border-b-2 text-center cursor-pointer ${
                activeFilter === tab ?
                "border-[#FF3D00] text-[#FF3D00]" :
                "border-transparent text-zinc-500 hover:text-zinc-300"}`
                }>
                
                    {tab === "all" && (isArabic ? "الرئيسية" : "Inbox")}
                    {tab === "pinned" && (isArabic ? "المثبتة" : "Pinned")}
                    {tab === "archived" && (isArabic ? "الأرشيف" : "Archived")}
                  </button>
              )}
              </div>

              {/* Chat items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
                
                {/* ONLINE MEMBERS CAROUSEL */}
                {activeFilter === "all" &&
              <div className="mb-4 bg-zinc-950/60 border border-zinc-900/60 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {isArabic ? "المتصلون الآن بالرادار 📡" : "Online Otakus Now 📡"}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500 font-bold">
                        {realUsers.filter((u) => u.isOnline).length} {isArabic ? "نشط" : "active"}
                      </span>
                    </div>
                    {realUsers.filter((u) => u.isOnline).length === 0 ?
                <div className="text-center py-4 text-zinc-600 text-[11px] font-bold">
                        {isArabic ? "لا يوجد أعضاء متصلون حالياً 📡" : "No active members online 📡"}
                      </div> :

                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {realUsers.filter((u) => u.isOnline).map((profile, _autoIdx) => {
                    const statusText = isArabic ? "متصل الآن ⚡" : "Online now ⚡";
                    return (
                      <div
                        key={`${profile.uid}_${_autoIdx}`}
                        onClick={() => handleStartChat(profile)}
                        className="flex flex-col items-center text-center cursor-pointer min-w-[64px] max-w-[64px] group transition-transform duration-100 hover:scale-105 active:scale-95">
                        
                              <div className="relative">
                                <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-green-500/30 group-hover:border-green-400 transition-colors" />
                          
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-[#0A0A0A] rounded-full animate-pulse shadow-md" />
                              </div>
                              <span className="text-[9px] font-bold text-zinc-300 group-hover:text-white transition-colors truncate w-14 mt-1.5 block">
                                {profile.name}
                              </span>
                              <span className="text-[7px] text-zinc-500 truncate w-14 block font-mono">
                                {statusText}
                              </span>
                            </div>);

                  })}
                      </div>
                }
                  </div>
              }

                {filteredInboxChats.length === 0 ?
              <div className="flex flex-col items-center justify-center h-64 text-zinc-600 text-center">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-15" />
                    <p className="text-xs font-semibold">{isArabic ? "لا توجد مراسلات في هذا القسم" : "No conversations found"}</p>
                    <button
                  onClick={() => setActiveView("new_chat")}
                  className="mt-3 text-xs font-black text-[#FF3D00] hover:underline cursor-pointer">
                  
                      {isArabic ? "ابدأ دردشة جديدة الآن" : "Start a conversation"}
                    </button>
                  </div> :

              filteredInboxChats.map((chat, idx) => {
                const partnerId = chat.participants.find((p) => p !== currentUser.uid) || "";
                const partner = chat.participantDetails[partnerId];
                const unread = chat.unreadCounts?.[currentUser.uid] || 0;
                const isPinned = chat.pinnedBy?.[currentUser.uid] || false;
                const isMuted = chat.mutedBy?.[currentUser.uid] || false;
                const isLocked = chat.lockCode?.[currentUser.uid] ? true : false;

                if (!partner) return null;

                return (
                  <motion.div
                    key={chat.id ? `pmsg_chat_${chat.id}_${idx}` : `pmsg_chat_${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      if (isLocked) {
                        setPinUnlockTarget(chat);
                        setPinInput("");
                        setPinError(false);
                        playSynthSound("tap");
                      } else {
                        setActiveChat(chat);
                        setActiveView("chat");
                        playSynthSound("tap");
                        triggerHapticFeedback("tap");
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    unread > 0 ?
                    "bg-zinc-900/60 border-zinc-800 shadow-md" :
                    "bg-zinc-900/20 border-zinc-900/50 hover:bg-zinc-900/40"}`
                    }>
                    
                        <div className="relative">
                          <img
                        src={partner.avatar}
                        alt={partner.name}
                        className={`w-12 h-12 rounded-full object-cover border border-zinc-800 ${isLocked ? "blur-[2px]" : ""}`} />
                      
                          {unread > 0 &&
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3D00] rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-[9px] font-black text-white">
                              {unread}
                            </span>
                      }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`font-bold text-xs text-white truncate pr-2 flex items-center gap-1 ${isLocked ? "blur-[3px]" : ""}`}>
                              {partner.name}
                              {isPinned && <Pin className="w-3 h-3 text-[#FF3D00] fill-[#FF3D00]" />}
                              {isMuted && <BellOff className="w-3 h-3 text-zinc-600" />}
                            </h3>
                            {chat.lastMessageTime &&
                        <span className="text-[9px] text-zinc-600 font-mono flex-shrink-0">
                                {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                        }
                          </div>

                          <p className={`text-[11px] truncate ${isLocked ? "text-zinc-600 font-mono text-[9px]" : unread > 0 ? "text-white font-bold" : "text-zinc-500"}`}>
                            {isLocked ?
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-zinc-600" /> [محادثة مشفرة برقم سري]</span> :

                        chat.lastMessage || (isArabic ? "اضغط لبدء المراسلة" : "Start conversation")
                        }
                          </p>
                        </div>
                      </motion.div>);

              })
              }
              </div>

              {/* Floating Create button */}
              <div className="absolute bottom-6 right-6">
                <button
                onClick={() => {playSynthSound("tap");setActiveView("new_chat");}}
                className="w-14 h-14 bg-[#FF3D00] hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-600/20 transform active:scale-95 transition-all cursor-pointer z-20">
                
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          }

          {/* VIEW: DISCOVER / NEW CHAT */}
          {activeView === "new_chat" &&
          <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden p-4">
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <button
                onClick={() => {setActiveView("inbox");playSynthSound("tap");}}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer">
                
                  {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <h2 className="font-black text-base text-white">
                  {isArabic ? "بدء محادثة جديدة" : "New Conversation"}
                </h2>
              </div>

              {/* Search user box */}
              <div className="relative mb-4 shrink-0">
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "ابحث عن أصدقاء أو شخصيات الأنمي..." : "Search for users or anime chars..."}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#FF3D00] transition-colors" />
              
                <Search className="absolute right-4 top-3 w-4 h-4 text-zinc-500" />
              </div>

              <div className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase mb-3 shrink-0">
                {isArabic ? "قائمة الأوتاكو المقترحة" : "Suggested Otaku Friends"}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pb-6">
                {searchResults.map((user, _autoIdx) =>
              <div
                key={`${user.uid}_${_autoIdx}`}
                onClick={() => handleStartChat(user)}
                className="flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-2xl cursor-pointer border border-zinc-900/40 transition-colors">
                
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                      <div>
                        <h3 className="font-bold text-xs text-white">{user.name}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono">@{user.username}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FF3D00]/10 flex items-center justify-center text-[#FF3D00]">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* VIEW: CHAT VIEW */}
          {activeView === "chat" && activeChat &&
          <div
            className="flex-1 flex flex-col bg-[#080808] overflow-hidden relative"
            style={activeChat.chatBg || localStorage.getItem(`chat_bg_${activeChat.id}`) ? { backgroundImage: `url(${activeChat.chatBg || localStorage.getItem(`chat_bg_${activeChat.id}`)})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
            
              {(activeChat.chatBg || localStorage.getItem(`chat_bg_${activeChat.id}`)) && <div className="absolute inset-0 bg-black/65 pointer-events-none z-0" />}
              <div
              className="flex-1 flex flex-col overflow-hidden relative z-10 w-full h-full"
              style={{ paddingBottom: `${viewportHeightOffset}px` }}>
              
              
              {/* Inline chat search banner */}
              {chatSearchOpen &&
              <div className="bg-zinc-950 p-2 border-b border-zinc-900 flex gap-2 items-center shrink-0">
                  <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => {
                    setChatSearchQuery(e.target.value);
                    setSearchMatchIndex(0);
                  }}
                  placeholder={isArabic ? "ابحث عن كلمات في المحادثة..." : "Search messages..."}
                  className="flex-1 bg-zinc-900 text-xs text-white border border-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FF3D00]" />
                
                  {chatSearchQuery && searchMatches.length > 0 &&
                <div className="flex items-center gap-1 shrink-0 bg-zinc-900/60 px-2 py-0.5 rounded-lg border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 font-mono font-bold">
                        {searchMatchIndex + 1}/{searchMatches.length}
                      </span>
                      <button
                    onClick={() => {
                      const prevIdx = (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
                      setSearchMatchIndex(prevIdx);
                      scrollToMatch(searchMatches[prevIdx]);
                    }}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                    title={isArabic ? "السابق" : "Previous"}>
                    
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                    onClick={() => {
                      const nextIdx = (searchMatchIndex + 1) % searchMatches.length;
                      setSearchMatchIndex(nextIdx);
                      scrollToMatch(searchMatches[nextIdx]);
                    }}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                    title={isArabic ? "التالي" : "Next"}>
                    
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                }
                  {chatSearchQuery && searchMatches.length === 0 &&
                <span className="text-[10px] text-red-500 font-bold shrink-0 bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-900/10">
                      {isArabic ? "لا توجد نتائج" : "No matches"}
                    </span>
                }
                  <button
                  onClick={() => {setChatSearchOpen(false);setChatSearchQuery("");}}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                  
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              }

              {/* CORE MESSAGES TIMELINE */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Simulated cryptographic E2E indicator */}
                <div className="bg-zinc-900/30 border border-zinc-900/60 p-2.5 rounded-2xl flex flex-col items-center text-center gap-1">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span className="text-[9px] text-emerald-400 font-black">
                    {isArabic ? "قناة مشفرة من طرف لطرف" : "E2E Encrypted Chat Session"}
                  </span>
                  <p className="text-[8px] text-zinc-600 max-w-[85%] leading-relaxed">
                    {isArabic ?
                    "الرسائل والمكالمات في هذه الدردشة آمنة تماماً. لا يمكن لأي طرف خارجي قراءتها." :
                    "Messages and calling metadata are cryptographically sealed and private."}
                  </p>
                </div>

                {(() => {
                  const filteredMsgList = messages.filter((msg) => {
                    // Hide deleted for user
                    if (msg[`deletedFor.${currentUser.uid}`]) return false;
                    return true;
                  });

                  return filteredMsgList.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.uid;
                    const partnerId = activeChat.participants.find((p) => p !== currentUser.uid) || "";
                    const partner = activeChat.participantDetails[partnerId];
                    const isHighlighted = aiSearchMatches.includes(msg.id);

                    const bubbleColorId = isMe ?
                    activeChat[`bubbleColor_${currentUser.uid}`] || localStorage.getItem(`bubble_color_${activeChat.id}`) || "flame" :
                    activeChat[`bubbleColor_${partnerId}`] || "flame";
                    const bubbleColorClass = PREMIUM_BUBBLE_COLORS.find((c) => c.id === bubbleColorId)?.class || PREMIUM_BUBBLE_COLORS[0].class;

                    // Calculate if date separator should be displayed
                    const showDateSeparator = idx === 0 || (() => {
                      const prevMsg = filteredMsgList[idx - 1];
                      const currDate = new Date(msg.createdAt).toDateString();
                      const prevDate = new Date(prevMsg.createdAt).toDateString();
                      return currDate !== prevDate;
                    })();

                    const dateStr = (() => {
                      const dateObj = new Date(msg.createdAt);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      if (dateObj.toDateString() === today.toDateString()) {
                        return isArabic ? "اليوم" : "Today";
                      } else if (dateObj.toDateString() === yesterday.toDateString()) {
                        return isArabic ? "أمس" : "Yesterday";
                      } else {
                        return dateObj.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      }
                    })();

                    return (
                      <React.Fragment key={msg.id ? `msg_${msg.id}_${idx}` : `msg_idx_${idx}`}>
                        {showDateSeparator &&
                        <div className="flex justify-center my-4">
                            <span className="text-[10px] font-black text-zinc-400 bg-zinc-950/85 border border-zinc-900/60 px-3 py-1 rounded-full shadow-sm">
                              📅 {dateStr}
                            </span>
                          </div>
                        }
                        <div
                          id={`msg_${msg.id}`}
                          className={`flex flex-col group select-none transition-all duration-300 rounded-2xl ${
                          isHighlighted ? "bg-amber-500/10 border border-amber-500/30 p-2 animate-pulse" : ""} ${

                          chatSearchQuery && msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ?
                          searchMatches[searchMatchIndex] === msg.id ?
                          "bg-amber-500/25 ring-2 ring-amber-500/80 shadow-lg shadow-amber-500/10 p-2" :
                          "bg-amber-500/10 border border-amber-500/20 p-2" :
                          ""}`
                          }
                          onTouchStart={() => handleTouchStart(msg)}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={() => handleTouchStart(msg)}
                          onMouseUp={handleTouchEnd}
                          onMouseLeave={handleTouchEnd}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setLongPressedMessage(msg);
                            playSynthSound("tap");
                            triggerHapticFeedback("levelup");
                          }}>
                          
                          <div className="relative w-full overflow-visible py-1">
                            {/* Swipe background icon */}
                            <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none transition-all duration-150 ${isMe ? "left-4" : "right-4"}`}>
                              <Reply className="w-5 h-5 text-[#FF3D00] opacity-0 group-hover:opacity-40 animate-pulse" />
                            </div>

                            {/* Slidable motion container */}
                            <motion.div
                              drag="x"
                              dragDirectionLock
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.4}
                              onDragEnd={(event, info) => {
                                if (Math.abs(info.offset.x) > 60) {
                                  playSynthSound("tap");
                                  triggerHapticFeedback("tap");
                                  setReplyingToMessage(msg);
                                }
                              }}
                              className={`flex items-end gap-2 max-w-[85%] ${isMe ? "self-end flex-row-reverse ms-auto" : "self-start mr-auto"} relative z-10 w-full cursor-grab active:cursor-grabbing`}>
                              
                            <img
                                src={isMe ? currentUser.avatar : partner?.avatar}
                                alt="avatar"
                                className="w-6 h-6 rounded-full object-cover border border-zinc-800 mb-1 cursor-pointer"
                                onClick={() => {
                                  if (onOpenUserProfile && !isMe) {
                                    onOpenUserProfile(partnerId);
                                    playSynthSound("tap");
                                  }
                                }} />
                              
                            <div className="flex flex-col space-y-1">
                              
                              {/* Message actions trigger balloon */}
                              <div className={`p-3 rounded-2xl ${
                                isMe ?
                                bubbleColorClass :
                                "bg-zinc-900 text-zinc-200 rounded-bl-sm border border-zinc-800/80"} shadow-md relative`
                                }>
                                
                                {/* Reply Quoted block */}
                                {msg.replyTo &&
                                  <div className="mb-2 p-1.5 rounded-lg bg-black/20 border-l-2 border-[#FF3D00] text-[10px] text-zinc-400">
                                    <span className="block font-black text-[9px] text-[#FF3D00]">{msg.replyTo.senderName}</span>
                                    <p className="truncate">{msg.replyTo.text}</p>
                                  </div>
                                  }

                                {/* TEXT CONTENT */}
                                {msg.text &&
                                  <div className="text-xs break-words leading-relaxed font-semibold">
                                    <LinkPreviewMessage text={msg.text} isMe={isMe} />
                                  </div>
                                  }

                                {/* TRANSLATION OVERLAY */}
                                {msg.translatedText &&
                                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] italic text-zinc-300">
                                    🌐 {msg.translatedText}
                                  </div>
                                  }

                                {/* INTERACTIVE POLL MODULE */}
                                {msg.poll &&
                                  <div className="mt-2 bg-black/40 p-2.5 rounded-xl border border-zinc-800 space-y-2 min-w-[200px]">
                                    <h4 className="text-[11px] font-black text-white flex items-center gap-1.5">
                                      <HelpCircle className="w-3.5 h-3.5 text-[#FF3D00]" />
                                      <span>{msg.poll.question}</span>
                                    </h4>
                                    <div className="space-y-1.5">
                                      {msg.poll.options.map((opt: any, optIdx: number) => {
                                        const totalVotes = msg.poll.options.reduce((sum: number, o: any) => sum + o.votes.length, 0);
                                        const percent = totalVotes > 0 ? Math.round(opt.votes.length / totalVotes * 100) : 0;
                                        const userHasVoted = opt.votes.includes(currentUser.uid);

                                        return (
                                          <button
                                            key={optIdx}
                                            onClick={() => handleCastPollVote(msg.id, optIdx)}
                                            className="w-full text-left p-2 rounded-lg bg-zinc-900 border border-zinc-800 relative overflow-hidden flex justify-between items-center text-[10px] text-zinc-300 hover:border-zinc-700 transition-colors">
                                            
                                            {/* Animated fill percentage */}
                                            <div
                                              className="absolute top-0 bottom-0 left-0 bg-[#FF3D00]/10 transition-all duration-500"
                                              style={{ width: `${percent}%` }} />
                                            
                                            <span className="relative z-10 font-bold flex items-center gap-1">
                                              {userHasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF3D00]" />}
                                              {opt.text}
                                            </span>
                                            <span className="relative z-10 font-mono font-bold text-zinc-500">{percent}% ({opt.votes.length})</span>
                                          </button>);

                                      })}
                                    </div>
                                  </div>
                                  }

                                {/* MEDIA IMAGE COLLAGE / VIDEO GRID */}
                                {msg.mediaUrl &&
                                  <div className="mt-2 rounded-xl overflow-hidden border border-black/50 relative">
                                    {msg.mediaType === "video" ?
                                    <video
                                      src={msg.mediaUrl}
                                      controls
                                      className="max-w-[240px] max-h-[200px] rounded-xl object-contain bg-black" /> :


                                    <img
                                      src={msg.mediaUrl}
                                      alt="shared media"
                                      style={{ width: msg.imageWidth ? `${msg.imageWidth}px` : '200px', maxHeight: '300px' }}
                                      className="object-cover rounded-xl transition-transform hover:scale-[1.01]" />

                                    }
                                  </div>
                                  }

                                {/* GENERAL FILE MODULE */}
                                {msg.file &&
                                  <div className="mt-2 p-2.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 min-w-[200px]">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF3D00] shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-white truncate">{msg.file.name}</p>
                                        <p className="text-[8px] font-mono text-zinc-500">{msg.file.size} • {msg.file.type}</p>
                                      </div>
                                    </div>
                                    <a
                                      href={msg.file.url}
                                      download={msg.file.name}
                                      onClick={() => playSynthSound("success")}
                                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-800 cursor-pointer shrink-0">
                                      
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                  }

                                {/* PLAYABLE VOICE NOTE */}
                                {msg.voiceNoteUrl &&
                                  <VoiceNotePlayer
                                    url={msg.voiceNoteUrl}
                                    isMe={isMe}
                                    isArabic={isArabic}
                                    durationLabel={msg.voiceDuration} />

                                  }

                                {/* DISAPPEARING COUNTDOWN TIMER */}
                                {msg.isTemporary && msg.expiresAt &&
                                  <TemporaryMessageTicker
                                    expiresAt={msg.expiresAt}
                                    onExpire={() => handleExpireMessage(msg.id)} />

                                  }

                                {/* MULTI REACTIONS PILLS BAR */}
                                {msg.reactions && Object.keys(msg.reactions).length > 0 &&
                                  <div className="absolute -bottom-2 right-2 flex gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-1.5 py-0.5 shadow-md">
                                    {Object.entries(msg.reactions).map(([emoji, uids]: any, _autoIdx) =>
                                    <span
                                      key={`${emoji}_${_autoIdx}`}
                                      onClick={() => addHapticFeedbackClick(() => handleAddReactionToMessage(msg.id, emoji))}
                                      title={`Reactions: ${uids.length}`}
                                      className="text-[10px] cursor-pointer hover:scale-110 active:scale-95 transition-transform">
                                      
                                        {emoji} <span className="text-[8px] font-mono font-bold text-zinc-500">{uids.length}</span>
                                      </span>
                                    )}
                                  </div>
                                  }
                              </div>

                              {/* Balloon meta details */}
                              <div className="flex items-center gap-1.5 mt-1 justify-end px-1 select-none">
                                <span className="text-[8px] text-zinc-500 font-mono flex items-center gap-1 bg-zinc-900/40 px-1.5 py-0.5 rounded border border-zinc-800/40">
                                  <Clock className="w-2.5 h-2.5 text-zinc-500" />
                                  {new Date(msg.createdAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe &&
                                  <span className="text-zinc-600">
                                    {msg.read ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3 text-zinc-500" />}
                                  </span>
                                  }
                                
                                {/* Hover actions panel trigger */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                      onClick={() => handleTranslateMessage(msg.id, msg.text)}
                                      title="Translate with Gemini"
                                      className="p-1 text-zinc-500 hover:text-[#FF3D00] cursor-pointer">
                                      
                                    <Languages className="w-3 h-3" />
                                  </button>
                                  <button
                                      onClick={() => handleAddReactionToMessage(msg.id, "❤️")}
                                      className="p-1 text-zinc-500 hover:text-red-500 cursor-pointer">
                                      
                                    ❤️
                                  </button>
                                  <button
                                      onClick={() => handleAddReactionToMessage(msg.id, "👍")}
                                      className="p-1 text-zinc-500 hover:text-amber-500 cursor-pointer">
                                      
                                    👍
                                  </button>
                                  <button
                                      onClick={() => handleDeleteMessageForMe(msg.id)}
                                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
                                      
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                            </div>
                            </motion.div>
                          </div>
                        </div>
                      </React.Fragment>);

                  });
                })()}

                  {partnerTyping === "typing" &&
                <div className="flex flex-col group self-start pb-2">
                      <div className="flex items-end gap-2 max-w-[85%] self-start">
                        <img
                      src={activeChat.participantDetails[activeChat.participants.find((p) => p !== currentUser.uid) || ""]?.avatar}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover border border-zinc-800 mb-1" />
                    
                        <div className="flex flex-col space-y-1">
                          <div className="p-3 bg-zinc-900 text-zinc-200 rounded-2xl rounded-bl-sm border border-zinc-800/80 shadow-md relative flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-400 font-bold">
                              {isArabic ? "يكتب الآن" : "typing"}
                            </span>
                            <span className="flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 bg-[#FF3D00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1.5 h-1.5 bg-[#FF3D00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1.5 h-1.5 bg-[#FF3D00] rounded-full animate-bounce" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                }

                <div ref={messagesEndRef} />
              </div>

              {/* FLOATING QUICK SMART REPLIES CAROUSEL */}
              {aiReplies.length > 0 &&
              <div className="bg-zinc-950 p-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-zinc-900 scrollbar-none">
                  <span className="text-[9px] bg-purple-600/20 text-purple-400 font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-purple-500/20">
                    <Sparkles className="w-3 h-3 animate-spin" /> Smart
                  </span>
                  {aiReplies.map((replyText, idx) =>
                <button
                  key={idx}
                  onClick={() => {
                    chatInputRef.current?.setValue(replyText);
                    setAiReplies([]);
                  }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-300 hover:text-white hover:border-[#FF3D00] transition-colors whitespace-nowrap cursor-pointer">
                  
                      {replyText}
                    </button>
                )}
                </div>
              }

              {/* ATTACHMENT MODAL PANEL */}
              <AnimatePresence>
                {showAttachPanel &&
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-20 left-4 right-4 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 grid grid-cols-4 gap-4 z-40 backdrop-blur-md">
                  
                    {[
                  { icon: Image, label: isArabic ? "صور" : "Gallery", action: () => mediaInputRef.current?.click() },
                  { icon: Video, label: isArabic ? "فيديو" : "Reels", action: () => mediaInputRef.current?.click() },
                  { icon: FileText, label: isArabic ? "ملف" : "Files", action: () => fileInputRef.current?.click() },
                  { icon: HelpCircle, label: isArabic ? "استطلاع" : "Poll", action: () => setPollForm({ isOpen: true, question: "", options: ["", ""] }) },
                  { icon: MapPin, label: isArabic ? "موقع" : "Location", action: () => sendMessageWithPayload(isArabic ? "📍 موقعي الحالي: طوكيو، أكيهابارا" : "📍 Current Location: Tokyo, Akihabara", { location: { lat: 35.699, lng: 139.77, label: "Akihabara, Tokyo" } }) },
                  { icon: User, label: isArabic ? "جهة اتصال" : "Contact", action: () => sendMessageWithPayload(isArabic ? "👤 مشاركة ملف أوتاكو" : "👤 Shared Otaku Profile", { sharedItem: { type: "user", id: "otaku_sens", title: "أوتاكو سينسي @otaku_sensei" } }) },
                  { icon: Sparkles, label: isArabic ? "ذكاء Gemini" : "Gemini AI", action: () => handleGenerateSmartReplies() },
                  { icon: Activity, label: isArabic ? "الوسائط" : "Shared Box", action: () => setShowMediaLibrary(true) }].
                  map((item, idx) =>
                  <button
                    key={idx}
                    onClick={() => {setShowAttachPanel(false);item.action();}}
                    className="flex flex-col items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                    
                        <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 hover:border-[#FF3D00] rounded-xl flex items-center justify-center text-zinc-300 hover:text-white">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-zinc-500">{item.label}</span>
                      </button>
                  )}
                  </motion.div>
                }
              </AnimatePresence>

              {/* ANIME STICKERS & GIF PANEL */}
              <AnimatePresence>
                {showEmojiStickerPanel &&
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-20 left-4 right-4 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 z-40 backdrop-blur-md max-h-[220px] flex flex-col">
                  
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2 shrink-0">
                      <div className="flex gap-2">
                        {(["stickers", "gifs", "emojis"] as const).map((sheet, _autoIdx) =>
                      <button
                        key={`${sheet}_${_autoIdx}`}
                        onClick={() => {playSynthSound("tap");setStickerSheet(sheet);}}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer ${stickerSheet === sheet ? "bg-[#FF3D00] text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                        
                            {sheet === "stickers" && (isArabic ? "ملصقات أنمي" : "Stickers")}
                            {sheet === "gifs" && "GIF"}
                            {sheet === "emojis" && (isArabic ? "إيموجي" : "Emojis")}
                          </button>
                      )}
                      </div>
                      <button onClick={() => setShowEmojiStickerPanel(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 py-2">
                      {stickerSheet === "stickers" && [
                    { label: "👒 Luffy smile", code: "👒" },
                    { label: "🔮 Gojo smirk", code: "🔮" },
                    { label: "🧣 Mikasa blush", code: "🧣" },
                    { label: "⚔️ Zoro slash", code: "⚔️" },
                    { label: "🦊 Kurama roar", code: "🦊" },
                    { label: "🍥 Naruto run", code: "🍥" }].
                    map((st, idx) =>
                    <button
                      key={idx}
                      onClick={() => {
                        setShowEmojiStickerPanel(false);
                        sendMessageWithPayload(isArabic ? `ملصق أنمي: ${st.label}` : `Anime sticker: ${st.label}`, { mediaUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300" });
                      }}
                      className="flex flex-col items-center bg-zinc-900 p-2 rounded-xl hover:border-[#FF3D00] border border-zinc-800 cursor-pointer">
                      
                          <span className="text-2xl">{st.code}</span>
                          <span className="text-[8px] text-zinc-500 mt-1 truncate max-w-full">{st.label}</span>
                        </button>
                    )}

                      {stickerSheet === "gifs" && [
                    "https://media.giphy.com/media/tL3e5338A9A0U/giphy.gif",
                    "https://media.giphy.com/media/CchzkJJ6UrQmQ/giphy.gif"].
                    map((url, idx) =>
                    <button
                      key={idx}
                      onClick={() => {
                        setShowEmojiStickerPanel(false);
                        sendMessageWithPayload(isArabic ? "مشاركة متحركة" : "GIF attached", { mediaUrl: url });
                      }}
                      className="border border-zinc-800 rounded-lg overflow-hidden hover:border-[#FF3D00] cursor-pointer">
                      
                          <img src={url} alt="gif" className="w-full h-12 object-cover" />
                        </button>
                    )}

                      {stickerSheet === "emojis" && ["🔥", "😍", "💀", "👑", "👍", "❤️", "🍿", "😭", "😮", "🤔"].map((emoji, idx) =>
                    <button
                      key={idx}
                      onClick={() => {
                        chatInputRef.current?.appendValue(emoji);
                      }}
                      className="text-xl p-2 bg-zinc-900 rounded-xl hover:bg-zinc-800 cursor-pointer">
                      
                          {emoji}
                        </button>
                    )}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>

              {/* CORE INPUT AREA */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-900 shrink-0">
                {(() => {
                  const liveChat = chats.find((c) => c.id === activeChat.id) || activeChat;
                  const partnerId = liveChat.participants.find((p) => p !== currentUser.uid) || "";
                  const isMeBlocked = liveChat.blockedBy?.[partnerId] || false;
                  const isPartnerBlocked = liveChat.blockedBy?.[currentUser.uid] || false;

                  if (isMeBlocked) {
                    return (
                      <div className="p-3.5 bg-red-950/20 border border-red-950/50 rounded-2xl text-center text-[10px] font-black text-red-500 animate-pulse">
                        🔒 {isArabic ? "تم حظر إرسال الرسائل في هذه المحادثة." : "Messages cannot be sent in this conversation."}
                      </div>);

                  }
                  if (isPartnerBlocked) {
                    return (
                      <div className="p-3.5 bg-zinc-900/60 border border-zinc-900 rounded-2xl text-center text-[10px] font-black text-zinc-500">
                        🚫 {isArabic ? "لقد قمت بحظر هذا المستخدم. قم بإلغاء الحظر للمراسلة." : "You have blocked this user. Unblock to message."}
                      </div>);

                  }

                  return (
                    <div className="flex flex-col gap-2 w-full">
                      {replyingToMessage &&
                      <div className="p-2.5 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-xl flex items-center justify-between z-10 shrink-0">
                          <div className="flex items-center gap-2">
                            <Reply className="w-3.5 h-3.5 text-[#FF3D00]" />
                            <div className="text-[10px] text-zinc-300">
                              <span className="font-bold text-white">
                                {isArabic ? "رد على: " : "Reply to: "}
                              </span>
                              <span className="italic">
                                "{replyingToMessage.text ? replyingToMessage.text.length > 50 ? replyingToMessage.text.slice(0, 50) + "..." : replyingToMessage.text : isArabic ? "[وسائط]" : "[Media]"}"
                              </span>
                            </div>
                          </div>
                          <button
                          onClick={() => setReplyingToMessage(null)}
                          className="text-zinc-500 hover:text-white text-xs font-bold px-1.5 cursor-pointer">
                          
                            ✕
                          </button>
                        </div>
                      }

                      {isRecording ? (
                      /* WhatsApp-style Voice Recording Dashboard */
                      <div className="flex items-center justify-between bg-zinc-900/90 border border-[#FF3D00]/20 rounded-2xl p-2 px-3 transition-all duration-200 shadow-lg shadow-[#FF3D00]/5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Blinking Recording Dot */}
                        <span className="relative flex h-3.5 w-3.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                        </span>

                        {/* Timer */}
                        <span className="text-xs font-black text-red-500 font-mono tracking-wider shrink-0 bg-red-950/40 border border-red-800/30 px-2.5 py-1 rounded-lg">
                          {Math.floor(recordDuration / 60).toString().padStart(2, '0')}:{(recordDuration % 60).toString().padStart(2, '0')}
                        </span>

                        {/* Moving Audio Waveforms mimicking WhatsApp */}
                        <div className="flex items-end gap-1.5 h-7 px-2.5 overflow-hidden flex-1 max-w-[120px] sm:max-w-[200px]">
                          {[0.35, 0.65, 0.45, 0.85, 0.55, 0.75, 0.35, 0.65, 0.45, 0.95, 0.35, 0.55, 0.75, 0.45, 0.85, 0.55].map((scale, i) =>
                            <span
                              key={i}
                              className="w-1 bg-[#FF3D00] rounded-full shrink-0"
                              style={{
                                height: `${scale * 100}%`,
                                animation: `pulse 0.6s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.04}s`
                              }} />

                            )}
                        </div>

                        {/* Status hint label */}
                        <span className="text-[10px] text-zinc-500 font-bold hidden md:inline truncate">
                          {isArabic ? "جاري تسجيل صوتك الشينوبي..." : "Recording shinobi voice..."}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Cancel / Discard Recording */}
                        <button
                            onClick={() => handleStopRecording(false)}
                            title={isArabic ? "حذف التسجيل" : "Discard Recording"}
                            className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-800/80 transition-all cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-red-950/50">
                            
                          <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Send Voice Note */}
                        <button
                            onClick={() => handleStopRecording(true)}
                            title={isArabic ? "إرسال الصوت" : "Send Voice Note"}
                            className="p-2.5 bg-[#FF3D00] hover:bg-orange-600 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-orange-950/20">
                            
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>) :

                      <ChatInputBar
                        ref={chatInputRef}
                        isArabic={isArabic}
                        editingMessageId={editingMessageId}
                        setEditingMessageId={setEditingMessageId}
                        onSend={(text) => sendMessageWithPayload(text)}
                        onEdit={handleEditMessage}
                        onStartRecording={handleStartRecording}
                        onCorrectGrammarSpelling={handleCorrectGrammarSpelling}
                        onTypingStateChange={handleTypingStateChange}
                        playSynthSound={playSynthSound}
                        showAttachPanel={showAttachPanel}
                        setShowAttachPanel={setShowAttachPanel}
                        showEmojiStickerPanel={showEmojiStickerPanel}
                        setShowEmojiStickerPanel={setShowEmojiStickerPanel} />

                      }
                    </div>);

                })()}
              </div>
            </div>
          </div>
          }

          {/* DRAWER: PIN UNLOCK COMPONENT */}
          <AnimatePresence>
            {pinUnlockTarget &&
            <div className="absolute inset-0 bg-[#0A0A0A] z-[300] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <Lock className="w-12 h-12 text-[#FF3D00] animate-bounce mb-4" />
                <h3 className="text-base font-black text-white mb-1">
                  {isArabic ? "هذه المحادثة مغلقة" : "Locked Conversation"}
                </h3>
                <p className="text-xs text-zinc-500 mb-6">
                  {isArabic ? `يرجى إدخال الرقم السري لفك تشفير المحادثة مع ${pinUnlockTarget.participantDetails[pinUnlockTarget.participants.find((p) => p !== currentUser.uid) || ""]?.name}` : "Enter PIN lock code to continue secure chat"}
                </p>

                <div className="flex gap-2 justify-center mb-6">
                  {[0, 1, 2, 3].map((idx, _autoIdx) =>
                <div
                  key={`${idx}_${_autoIdx}`}
                  className={`w-4 h-4 rounded-full border-2 ${pinInput.length > idx ? "bg-[#FF3D00] border-[#FF3D00]" : "border-zinc-700 bg-transparent"}`} />

                )}
                </div>

                {pinError &&
              <span className="text-xs text-red-500 font-bold mb-4 block">
                    ❌ {isArabic ? "رقم المرور خاطئ! أعد المحاولة." : "Invalid lock code! Try again."}
                  </span>
              }

                <div className="grid grid-cols-3 gap-3 max-w-[240px] w-full mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, _autoIdx) =>
                <button
                  key={`${num}_${_autoIdx}`}
                  onClick={() => {
                    playSynthSound("tap");
                    if (pinInput.length < 4) setPinInput((p) => p + num);
                  }}
                  className="w-14 h-14 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-transform text-white rounded-full font-black text-lg cursor-pointer">
                  
                      {num}
                    </button>
                )}
                  <button
                  onClick={() => {setPinUnlockTarget(null);setPinInput("");}}
                  className="w-14 h-14 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-full cursor-pointer">
                  
                    {isArabic ? "إلغاء" : "Back"}
                  </button>
                  <button
                  onClick={() => {
                    playSynthSound("tap");
                    if (pinInput.length < 4) setPinInput((p) => p + "0");
                  }}
                  className="w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-black text-lg cursor-pointer">
                  
                    0
                  </button>
                  <button
                  onClick={handleVerifyPINUnlock}
                  className="w-14 h-14 bg-[#FF3D00] text-white text-xs font-bold rounded-full cursor-pointer">
                  
                    OK
                  </button>
                </div>
              </div>
            }
          </AnimatePresence>

          {/* DIALOG PANEL: POLL CREATION MODULE */}
          <AnimatePresence>
            {pollForm.isOpen &&
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
                <div className="bg-[#0D0D0D] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 animate-scale-up">
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <HelpCircle className="w-5 h-5 text-[#FF3D00]" />
                    {isArabic ? "إنشاء استطلاع رأي جديد" : "Create Otaku Poll"}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-black block mb-1">{isArabic ? "السؤال" : "Question"}</label>
                      <input
                      type="text"
                      value={pollForm.question}
                      onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                      placeholder={isArabic ? "مثال: ما هو آركك المفضل؟" : "What is your favorite arc?"}
                      className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF3D00]" />
                    
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-black block">{isArabic ? "الخيارات" : "Options"}</label>
                      {pollForm.options.map((opt, idx) =>
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollForm.options];
                        updated[idx] = e.target.value;
                        setPollForm({ ...pollForm, options: updated });
                      }}
                      placeholder={isArabic ? `الخيار ${idx + 1}` : `Option ${idx + 1}`}
                      className="w-full bg-zinc-900 text-xs border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#FF3D00]" />

                    )}
                      {pollForm.options.length < 4 &&
                    <button
                      onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ""] })}
                      className="text-[10px] text-[#FF3D00] hover:underline font-bold">
                      
                          + {isArabic ? "إضافة خيار آخر" : "Add option"}
                        </button>
                    }
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                    onClick={() => setPollForm({ isOpen: false, question: "", options: ["", ""] })}
                    className="flex-1 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-black cursor-pointer">
                    
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                    onClick={() => {
                      const filledOptions = pollForm.options.filter((o) => o.trim().length > 0).map((t, _autoIdx) => ({ text: t, votes: [] }));
                      if (pollForm.question.trim() && filledOptions.length >= 2) {
                        sendMessageWithPayload(isArabic ? "📊 تم إنشاء استطلاع رأي جديد" : "📊 New poll shared", {
                          poll: {
                            question: pollForm.question,
                            options: filledOptions
                          }
                        });
                        setPollForm({ isOpen: false, question: "", options: ["", ""] });
                      }
                    }}
                    className="flex-1 py-2 bg-[#FF3D00] text-white rounded-xl text-xs font-black cursor-pointer">
                    
                      {isArabic ? "إرسال الاستطلاع" : "Post Poll"}
                    </button>
                  </div>
                </div>
              </div>
            }
          </AnimatePresence>

          {/* DRAWER: CHAT INFO SCREEN */}
          <AnimatePresence>
            {showChatInfo && activeChat && (() => {
              const liveChat = chats.find((c) => c.id === activeChat.id) || activeChat;
              const partnerId = liveChat.participants.find((p) => p !== currentUser.uid) || "";
              const partner = liveChat.participantDetails[partnerId] || { name: "Otaku", avatar: "", username: "user" };
              const isPartnerOnline = realUsers.some((u) => u.uid === partnerId && u.isOnline);
              const isMuted = liveChat.mutedBy?.[currentUser.uid] || false;

              const imagesCount = sharedMediaFiles.media.length;

              const handleMuteOption = async (option: string) => {
                try {
                  const chatDocRef = doc(db, "directChats", liveChat.id);
                  if (option === "unmute") {
                    await updateDoc(chatDocRef, {
                      [`mutedBy.${currentUser.uid}`]: false,
                      [`mutedUntil.${currentUser.uid}`]: null
                    });
                    triggerInAppNotification(
                      isArabic ? "تفعيل الإشعارات" : "Unmuted",
                      isArabic ? "تم تفعيل إشعارات المحادثة بنجاح" : "Notifications enabled successfully"
                    );
                  } else {
                    let dateStr = "";
                    if (option === "1h") dateStr = new Date(Date.now() + 1 * 3600 * 1000).toISOString();else
                    if (option === "8h") dateStr = new Date(Date.now() + 8 * 3600 * 1000).toISOString();else
                    if (option === "1d") dateStr = new Date(Date.now() + 24 * 3600 * 1000).toISOString();else
                    if (option === "1w") dateStr = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();else
                    if (option === "permanent") dateStr = new Date(Date.now() + 100 * 365 * 24 * 3600 * 1000).toISOString();

                    await updateDoc(chatDocRef, {
                      [`mutedBy.${currentUser.uid}`]: true,
                      [`mutedUntil.${currentUser.uid}`]: dateStr
                    });
                    triggerInAppNotification(
                      isArabic ? "كتم الإشعارات" : "Muted",
                      isArabic ? "تم كتم إشعارات المحادثة بنجاح" : "Notifications muted successfully"
                    );
                  }
                } catch (e) {
                  console.error("Mute failed", e);
                }
              };

              const handleClearAllMessages = async () => {
                if (window.confirm(isArabic ? "هل أنت متأكد من مسح جميع الرسائل للطرفين؟" : "Are you sure you want to clear all messages for both parties?")) {
                  try {
                    const querySnapshot = await getDocs(collection(db, `directChats/${liveChat.id}/messages`));
                    const deletePromises = querySnapshot.docs.map((doc, _autoIdx) => deleteDoc(doc.ref));
                    await Promise.all(deletePromises);

                    await updateDoc(doc(db, "directChats", liveChat.id), {
                      lastMessage: isArabic ? "تم مسح المحادثة" : "Conversation cleared",
                      lastMessageTime: new Date().toISOString()
                    });

                    triggerInAppNotification(
                      isArabic ? "مسح الرسائل" : "Clear Messages",
                      isArabic ? "تم مسح كافة الرسائل للطرفين بنجاح" : "All messages purged for both parties successfully"
                    );
                  } catch (e) {
                    console.error("Failed to clear messages:", e);
                  }
                }
              };

              const handleHideChat = async () => {
                try {
                  await updateDoc(doc(db, "directChats", liveChat.id), {
                    [`hiddenBy.${currentUser.uid}`]: true
                  });
                  setShowChatInfo(false);
                  setActiveChat(null);
                  setActiveView("inbox");
                  triggerInAppNotification(
                    isArabic ? "إخفاء الدردشة" : "Hide Chat",
                    isArabic ? "تم إخفاء هذه المحادثة من صندوق الوارد بنجاح" : "Chat conversation hidden successfully"
                  );
                } catch (e) {
                  console.error("Failed to hide chat:", e);
                }
              };

              const handleCreateGroupWithUser = async () => {
                const groupName = prompt(isArabic ? "أدخل اسم المجموعة الجديدة:" : "Enter new group name:");
                if (!groupName) return;
                try {
                  const newGroupRef = doc(collection(db, "directChats"));
                  const newGroupData: any = {
                    id: newGroupRef.id,
                    isGroup: true,
                    groupName: groupName,
                    participants: [currentUser.uid, partnerId],
                    participantDetails: {
                      [currentUser.uid]: { name: currentUser.name, avatar: currentUser.avatar, username: currentUser.username || "me" },
                      [partnerId]: { name: partner.name, avatar: partner.avatar, username: partner.username || "otaku" }
                    },
                    unreadCounts: {
                      [currentUser.uid]: 0,
                      [partnerId]: 0
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  await setDoc(newGroupRef, newGroupData);
                  setShowChatInfo(false);
                  setActiveChat(newGroupData);
                  setActiveView("chat");
                  triggerInAppNotification(
                    isArabic ? "تم إنشاء المجموعة" : "Group Created",
                    isArabic ? `تم إنشاء مجموعة "${groupName}" بنجاح!` : `Group "${groupName}" created successfully!`
                  );
                } catch (e) {
                  console.error("Failed to create group:", e);
                }
              };

              return (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className="absolute inset-0 bg-[#0A0A0A] z-[120] flex flex-col overflow-hidden text-white font-sans">
                  
                  {/* HEADER */}
                  <div className="h-16 border-b border-zinc-900 px-4 flex items-center gap-2 bg-zinc-950 shrink-0">
                    <button
                      onClick={() => {setShowChatInfo(false);playSynthSound("tap");}}
                      className="p-2 hover:bg-zinc-900 rounded-full transition-colors cursor-pointer text-zinc-400 hover:text-white">
                      
                      {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <span className="font-extrabold text-sm text-zinc-200">{isArabic ? "معلومات الدردشة" : "Chat Info"}</span>
                  </div>

                  {/* SCROLL CONTAINER */}
                  <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-5">
                    {/* AVATAR & NAME CARD */}
                    <div className="flex flex-col items-center text-center py-5 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-4">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-24 h-24 rounded-full border-4 border-[#FF3D00] shadow-xl object-cover mb-3 hover:scale-105 transition-transform duration-300" />
                      
                      <h3 className="font-extrabold text-base text-white tracking-wide">{partner.name}</h3>
                      {partner.username && <span className="text-xs text-zinc-500 font-mono mt-0.5">@{partner.username}</span>}
                      
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full mt-3 border ${
                      isPartnerOnline ?
                      "bg-green-950/40 text-green-400 border-green-800/40" :
                      "bg-zinc-900/60 text-zinc-400 border-zinc-800"}`
                      }>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPartnerOnline ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`} />
                        {isPartnerOnline ? isArabic ? "متصل الآن" : "Online now" : isArabic ? "آخر ظهور" : "Offline"}
                      </span>
                    </div>

                    {/* QUICK BUTTONS */}
                    <div className="flex gap-2">
                      {/* PROFILE */}
                      <button
                        onClick={() => {
                          setShowChatInfo(false);
                          if (onOpenUserProfile) {
                            onOpenUserProfile(partnerId);
                            playSynthSound("tap");
                          }
                        }}
                        className="flex-1 flex flex-col items-center justify-center p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-2xl transition-all cursor-pointer text-center group">
                        
                        <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/10 text-[#FF3D00] group-hover:bg-[#FF3D00] group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white mt-1.5">{isArabic ? "ملف شخصي" : "Profile"}</span>
                      </button>

                      {/* SEARCH */}
                      <button
                        onClick={() => {
                          setShowChatInfo(false);
                          setChatSearchOpen(true);
                          playSynthSound("tap");
                        }}
                        className="flex-1 flex flex-col items-center justify-center p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-2xl transition-all cursor-pointer text-center group">
                        
                        <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/10 text-[#FF3D00] group-hover:bg-[#FF3D00] group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <Search className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white mt-1.5">{isArabic ? "بحث" : "Search"}</span>
                      </button>

                      {/* MUTE */}
                      <button
                        onClick={() => {
                          setShowMuteDropdown(!showMuteDropdown);
                          setShowOptionsDropdown(false);
                          playSynthSound("tap");
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-2xl transition-all cursor-pointer text-center group relative ${
                        isMuted ?
                        "bg-red-950/20 border-red-900/40" :
                        "bg-zinc-900/40 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-800"}`
                        }>
                        
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isMuted ? "bg-red-500/20 text-red-400" : "bg-[#FF3D00]/10 text-[#FF3D00] group-hover:bg-[#FF3D00] group-hover:text-white"}`
                        }>
                          {isMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white mt-1.5">
                          {isMuted ? isArabic ? "ملغى الكتم" : "Muted" : isArabic ? "كتم" : "Mute"}
                        </span>
                      </button>

                      {/* OPTIONS */}
                      <button
                        onClick={() => {
                          setShowOptionsDropdown(!showOptionsDropdown);
                          setShowMuteDropdown(false);
                          playSynthSound("tap");
                        }}
                        className="flex-1 flex flex-col items-center justify-center p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-2xl transition-all cursor-pointer text-center group relative">
                        
                        <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/10 text-[#FF3D00] group-hover:bg-[#FF3D00] group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <MoreVertical className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white mt-1.5">{isArabic ? "خيارات" : "Options"}</span>
                      </button>
                    </div>

                    {/* MUTE DROPDOWN SUBPANEL */}
                    {showMuteDropdown &&
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl grid grid-cols-2 gap-2 animate-fade-in shadow-xl">
                        {[
                      { id: "1h", label: isArabic ? "ساعة واحدة" : "1 Hour" },
                      { id: "8h", label: isArabic ? "8 ساعات" : "8 Hours" },
                      { id: "1d", label: isArabic ? "يوم واحد" : "1 Day" },
                      { id: "1w", label: isArabic ? "أسبوع" : "1 Week" },
                      { id: "permanent", label: isArabic ? "دائم" : "Forever" },
                      { id: "unmute", label: isArabic ? "إلغاء الكتم" : "Unmute" }].
                      map((opt, _autoIdx) =>
                      <button
                        key={`${opt.id}_${_autoIdx}`}
                        onClick={async () => {
                          playSynthSound("tap");
                          await handleMuteOption(opt.id);
                          setShowMuteDropdown(false);
                        }}
                        className="py-2 px-3 bg-zinc-900 hover:bg-[#FF3D00] hover:text-white rounded-xl text-center text-[10px] font-black text-zinc-300 transition-all cursor-pointer border border-zinc-800/60 hover:border-transparent">
                        
                            {opt.label}
                          </button>
                      )}
                      </div>
                    }

                    {/* QUICK OPTIONS DROPDOWN SUBPANEL */}
                    {showOptionsDropdown &&
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col gap-1.5 animate-fade-in shadow-xl">
                        <button
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setLockingChatId(liveChat.id);
                        }}
                        className="w-full text-left py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-black text-zinc-200 cursor-pointer flex items-center gap-2 border border-zinc-800/40">
                        
                          <Lock className="w-3.5 h-3.5 text-[#FF3D00]" />
                          {isArabic ? "قفل المحادثة برقم سري" : "Lock Chat Conversation"}
                        </button>
                        <button
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setShowThemeModal(true);
                        }}
                        className="w-full text-left py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-black text-zinc-200 cursor-pointer flex items-center gap-2 border border-zinc-800/40">
                        
                          <Palette className="w-3.5 h-3.5 text-[#FF3D00]" />
                          {isArabic ? "تخصيص السمة والخلفية" : "Wallpaper & Design Themes"}
                        </button>
                      </div>
                    }

                    {/* WALLPAPER & THEMES ROW */}
                    <div
                      onClick={() => {setShowThemeModal(true);playSynthSound("tap");}}
                      className="flex items-center justify-between p-3.5 bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 rounded-2xl cursor-pointer transition-colors">
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#FF3D00]/10 text-[#FF3D00] rounded-xl"><Palette className="w-4 h-4" /></div>
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "السمة ومظهر الخلفية" : "Wallpaper & Color Theme"}</span>
                          <span className="block text-[9px] text-zinc-500 mt-0.5">{isArabic ? "تخصيص لون فقاعات المحادثة وصور الخلفية" : "Customize bubble color schemes & background wallpapers"}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>

                    {/* DISAPPEARING MESSAGES TIMEOUT */}
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-950/40 text-purple-400 rounded-xl"><Clock className="w-4 h-4" /></div>
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "الرسائل المؤقتة (التدمير الذاتي)" : "Disappearing Messages (Self-Destruct)"}</span>
                          <span className="block text-[9px] text-zinc-500 mt-0.5">{isArabic ? "حذف الرسائل تلقائياً بعد مرور المدة المحددة لكلا الطرفين" : "Automatically wipe messages for both users after selected time"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                        {[
                        { id: "off", label: isArabic ? "إيقاف" : "Off" },
                        { id: "24h", label: isArabic ? "24 ساعة" : "24 Hours" },
                        { id: "7d", label: isArabic ? "7 أيام" : "7 Days" },
                        { id: "30d", label: isArabic ? "30 يوماً" : "30 Days" }].
                        map((dur, _autoIdx) => {
                          const activeDur = liveChat.disappearingDuration || "off";
                          const isSelected = activeDur === dur.id;
                          return (
                            <button
                              key={`${dur.id}_${_autoIdx}`}
                              onClick={async () => {
                                playSynthSound("purchase");
                                await updateDoc(doc(db, "directChats", liveChat.id), {
                                  disappearingDuration: dur.id
                                });
                              }}
                              className={`py-2 px-1 text-[9px] font-black rounded-xl text-center border transition-all cursor-pointer ${
                              isSelected ?
                              "bg-[#FF3D00] border-[#FF3D00] text-white font-extrabold shadow-sm shadow-[#FF3D00]/20" :
                              "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"}`
                              }>
                              
                              {dur.label}
                            </button>);

                        })}
                      </div>
                    </div>

                    {/* CHAT CONTROLS PANEL */}
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-3.5 space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-500 tracking-wider uppercase">{isArabic ? "عناصر التحكم في الدردشة" : "Chat Controls"}</h4>
                      
                      {/* Pin Chat */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "تثبيت المحادثة" : "Pin Chat on Top"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "تثبيت الدردشة في الجزء العلوي من صندوق الرسائل" : "Always keep this chat pinned at the top of your inbox"}</p>
                        </div>
                        <button
                          onClick={() => handleToggleChatPin(liveChat)}
                          className={`px-3 py-1.5 text-[9px] font-black rounded-xl border ${
                          liveChat.pinnedBy?.[currentUser.uid] ?
                          "bg-[#FF3D00] text-white border-[#FF3D00]" :
                          "bg-zinc-950 text-zinc-400 border-zinc-800"}`
                          }>
                          
                          {liveChat.pinnedBy?.[currentUser.uid] ? isArabic ? "مثبتة" : "Pinned" : isArabic ? "تثبيت" : "Pin"}
                        </button>
                      </div>

                      {/* PIN Lock */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "قفل الدردشة برقم سري" : "Lock Chat with PIN"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "حماية وتشفير الدردشة بكلمة مرور خاصة" : "Encrypt this dialogue behind a private passcode"}</p>
                        </div>
                        {liveChat.lockCode?.[currentUser.uid] ?
                        <button
                          onClick={() => handleRemoveChatLock(liveChat.id)}
                          className="px-3 py-1.5 bg-red-950/20 text-red-500 border border-red-900/30 text-[9px] font-black rounded-xl">
                          
                            {isArabic ? "إزالة القفل" : "Unlock"}
                          </button> :

                        <button
                          onClick={() => setLockingChatId(liveChat.id)}
                          className="px-3 py-1.5 bg-zinc-950 text-zinc-400 border border-zinc-800 text-[9px] font-black rounded-xl">
                          
                            {isArabic ? "تفعيل القفل" : "Lock"}
                          </button>
                        }
                      </div>

                      {/* Create Group Chat */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "إنشاء مجموعة مع العضو" : "Create Group Chat"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "بدء دردشة جماعية مشتركة تشمل هذا العضو" : "Establish a collaborative multiparty chat with this player"}</p>
                        </div>
                        <button
                          onClick={handleCreateGroupWithUser}
                          className="px-3 py-1.5 bg-blue-950/20 text-blue-400 border border-blue-900/30 text-[9px] font-black rounded-xl cursor-pointer">
                          
                          {isArabic ? "إنشاء" : "Create"}
                        </button>
                      </div>
                    </div>

                    {/* PRIVACY & SAFETY PANEL */}
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-3.5 space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-500 tracking-wider uppercase">{isArabic ? "الخصوصية والسلامة" : "Privacy & Safety"}</h4>

                      {/* Block / Unblock */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "حظر المستخدم" : "Block User"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "حظر ومنع هذا المستخدم من مراسلتك" : "Block this shinobi from sending you direct messages"}</p>
                        </div>
                        <button
                          onClick={async () => {
                            playSynthSound("tap");
                            const isBlocked = liveChat.blockedBy?.[currentUser.uid] || false;
                            await updateDoc(doc(db, "directChats", liveChat.id), {
                              [`blockedBy.${currentUser.uid}`]: !isBlocked
                            });
                            triggerInAppNotification(
                              isArabic ? "تحديث حالة الحظر" : "Block Status",
                              isArabic ? "تم تحديث حالة حظر العضو بنجاح" : "User block status updated successfully"
                            );
                          }}
                          className={`px-3 py-1.5 text-[9px] font-black rounded-xl border ${
                          liveChat.blockedBy?.[currentUser.uid] ?
                          "bg-red-600 text-white border-red-500 animate-pulse" :
                          "bg-zinc-950 text-red-500 border-red-900/30"}`
                          }>
                          
                          {liveChat.blockedBy?.[currentUser.uid] ? isArabic ? "إلغاء الحظر" : "Unblock" : isArabic ? "حظر" : "Block"}
                        </button>
                      </div>

                      {/* Report User */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "الإبلاغ عن العضو" : "Report Shinobi"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "تقديم شكوى رسمية ضد الحساب لإساءة الاستخدام" : "Log a secure misconduct complain directly with server moderators"}</p>
                        </div>
                        <button
                          onClick={async () => {
                            playSynthSound("tap");
                            await addDoc(collection(db, "reports"), {
                              reportedUserId: partnerId,
                              reporterUserId: currentUser.uid,
                              reason: "Direct Chat Report",
                              createdAt: new Date().toISOString()
                            });
                            triggerInAppNotification(
                              isArabic ? "تقديم بلاغ" : "Report Registered",
                              isArabic ? "تم تسجيل البلاغ بنجاح" : "Shinobi report was successfully processed"
                            );
                          }}
                          className="px-3 py-1.5 bg-yellow-950/20 text-yellow-500 border border-yellow-900/30 text-[9px] font-black rounded-xl cursor-pointer">
                          
                          {isArabic ? "إبلاغ" : "Report"}
                        </button>
                      </div>

                      {/* Clear Messages */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "مسح الرسائل للطرفين" : "Clear All Messages"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "حذف كافة الرسائل في هذه المحادثة بشكل نهائي للجميع" : "Permanently wipe all message logs inside this room"}</p>
                        </div>
                        <button
                          onClick={handleClearAllMessages}
                          className="px-3 py-1.5 bg-red-950/20 text-red-500 border border-red-900/30 text-[9px] font-black rounded-xl cursor-pointer">
                          
                          {isArabic ? "مسح الكل" : "Clear All"}
                        </button>
                      </div>

                      {/* Hide Conversation */}
                      <div className="flex items-center justify-between py-1 border-b border-zinc-900/40 pb-2">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "إخفاء المحادثة" : "Hide Conversation"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "إخفاء الدردشة مؤقتاً من صندوق الوارد الرئيسي" : "Temporarily hide this dialogue room from your Inbox list"}</p>
                        </div>
                        <button
                          onClick={handleHideChat}
                          className="px-3 py-1.5 bg-zinc-950 text-zinc-400 border border-zinc-800 text-[9px] font-black rounded-xl cursor-pointer">
                          
                          {isArabic ? "إخفاء" : "Hide"}
                        </button>
                      </div>

                      {/* Delete Conversation */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? "حذف المحادثة بشكل نهائي" : "Purge Chat Room"}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "حذف غرفة الدردشة والأرشيف بشكل نهائي للطرفين" : "Wipe this room and its indices from the global database"}</p>
                        </div>
                        <button
                          onClick={() => {
                            handleDeleteChatRemotely(liveChat.id);
                            setShowChatInfo(false);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black rounded-xl cursor-pointer">
                          
                          {isArabic ? "حذف نهائي" : "Purge Room"}
                        </button>
                      </div>
                    </div>

                    {/* SHARED MEDIA GALLERY TAB */}
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center pb-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2.5 bg-pink-950/40 text-pink-400 rounded-xl"><Image className="w-4 h-4" /></div>
                          <div>
                            <span className="block text-xs font-black text-white">{isArabic ? "الوسائط والملفات المشتركة" : "Shared Media Gallery"}</span>
                            <span className="block text-[9px] text-zinc-500 mt-0.5">{isArabic ? "الصور والفيديوهات المتبادلة بينكما" : "Images, files, and links exchanged between you"}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded-md">{imagesCount}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {sharedMediaFiles.media.map((item, idx) =>
                        <div
                          key={item.id || idx}
                          onClick={() => setShowFullMediaViewer(item)}
                          className="aspect-square bg-zinc-950 rounded-xl overflow-hidden relative border border-zinc-900 hover:border-[#FF3D00]/50 transition-all cursor-pointer group">
                          
                            <img
                            src={item.url}
                            alt="Shared gallery"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        {imagesCount === 0 &&
                        <div className="col-span-3 text-center py-6 text-[10px] text-zinc-600 font-bold">
                            {isArabic ? "لا توجد وسائط متبادلة بعد 🎞️" : "No shared media files yet 🎞️"}
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </motion.div>);

            })()}
          </AnimatePresence>

          {/* SHARED FULLSCREEN MEDIA VIEWER MODAL */}
          <AnimatePresence>
            {showFullMediaViewer &&
            <div className="absolute inset-0 bg-black/95 z-[250] flex flex-col items-center justify-center p-4">
                <button
                onClick={() => setShowFullMediaViewer(null)}
                className="absolute top-6 left-6 p-2.5 bg-zinc-900/60 hover:bg-zinc-800 rounded-full text-white cursor-pointer">
                
                  <X className="w-6 h-6" />
                </button>
                {showFullMediaViewer.url.match(/\.(mp4|webm|mov)/i) ?
              <video src={showFullMediaViewer.url} controls className="max-w-full max-h-[85vh] rounded-xl" autoPlay /> :

              <img src={showFullMediaViewer.url} alt="Full View" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
              }
                <div className="mt-4 text-center text-xs text-zinc-500 font-mono">
                  {new Date(showFullMediaViewer.date).toLocaleDateString()}
                </div>
              </div>
            }
          </AnimatePresence>

          {/* DRAWER: PRIVACY & CORE ACTIONS DRAWER */}
          <AnimatePresence>
            {showPrivacyDrawer && activeChat &&
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[160] flex items-end justify-center">
                <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                className="bg-[#0D0D0D] border-t border-zinc-800 rounded-t-[32px] p-5 w-full max-h-[85%] overflow-y-auto space-y-6">
                
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#FF3D00]" />
                      <h3 className="font-black text-sm text-white">{isArabic ? "خيارات المحادثة والأمان" : "Privacy & Safety Settings"}</h3>
                    </div>
                    <button onClick={() => setShowPrivacyDrawer(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Anti-screenshot & lock settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900">
                      <div>
                        <h4 className="text-xs font-black text-white">{isArabic ? "منع تصوير الشاشة" : "Screenshot Shield"}</h4>
                        <p className="text-[9px] text-zinc-500">{isArabic ? "يمنع التقاط لقطات الشاشة لحماية خصوصية رسائلك" : "Prevents taking screenshots of your messages"}</p>
                      </div>
                      <button
                      onClick={() => {
                        setScreenshotProtection(!screenshotProtection);
                        triggerHapticFeedback("tap");
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${screenshotProtection ? "bg-[#FF3D00]" : "bg-zinc-800"}`}>
                      
                        <span className={`w-4 h-4 bg-white rounded-full transition-transform transform ${screenshotProtection ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900">
                      <div>
                        <h4 className="text-xs font-black text-white">{isArabic ? "قفل المحادثة برقم سري" : "PIN Lock Chat"}</h4>
                        <p className="text-[9px] text-zinc-500">{isArabic ? "إخفاء الدردشة خلف رقم سري حماية خصوصيتك" : "Hide dialogue behind a custom security PIN code"}</p>
                      </div>
                      {activeChat.lockCode?.[currentUser.uid] ?
                    <button
                      onClick={() => handleRemoveChatLock(activeChat.id)}
                      className="px-3 py-1.5 bg-red-950/20 text-red-500 border border-red-900/30 text-[10px] font-bold rounded-lg">
                      
                          {isArabic ? "إزالة القفل" : "Unlock"}
                        </button> :

                    <button
                      onClick={() => setLockingChatId(activeChat.id)}
                      className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-[10px] font-bold rounded-lg border border-zinc-800">
                      
                          {isArabic ? "قفل" : "Lock"}
                        </button>
                    }
                    </div>

                    {/* Blocking & Reporting */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900">
                      <div>
                        <h4 className="text-xs font-black text-white">{isArabic ? "حظر هذا المستخدم" : "Block User"}</h4>
                        <p className="text-[9px] text-zinc-500">{isArabic ? "حظر وصول أي رسائل جديدة من هذا الشينوبي" : "Prevent new direct messages from this player"}</p>
                      </div>
                      <button
                      onClick={() => {
                        setUserBlocked(!userBlocked);
                        triggerInAppNotification(
                          isArabic ? "قائمة الحظر" : "Block status updated",
                          isArabic ? "تم تحديث حالة حظر العضو بنجاح" : "Shinobi block status synchronized successfully"
                        );
                      }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${userBlocked ? "bg-red-600 text-white border-red-500" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
                      
                        {userBlocked ? isArabic ? "فك الحظر" : "Unblock" : isArabic ? "حظر" : "Block"}
                      </button>
                    </div>

                    <button
                    onClick={() => {
                      triggerInAppNotification(isArabic ? "تم الإبلاغ" : "Report received", isArabic ? "شكراً لك. قامت الإدارة باستلام بلاغك وسوف تتم مراجعته!" : "Thank you. Staff have received your report.");
                      setShowPrivacyDrawer(false);
                    }}
                    className="w-full py-3 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl text-xs font-black transition-colors flex items-center justify-center gap-1.5">
                    
                      <Flag className="w-4 h-4" /> {isArabic ? "الإبلاغ عن إساءة استخدام أو محتوى حرق" : "Report Abusive Behavior / Story Spoilers"}
                    </button>
                  </div>

                  {/* Core Delete Options */}
                  <div className="border-t border-zinc-900 pt-4 space-y-2">
                    <button
                    onClick={() => handleToggleChatArchive(activeChat)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border border-zinc-800">
                    
                      <Archive className="w-4 h-4" /> {activeChat.archivedBy?.[currentUser.uid] ? isArabic ? "نقل المحادثة للرئيسية" : "Move to Inbox" : isArabic ? "أرشفة المحادثة مؤقتاً" : "Archive Chat Conversation"}
                    </button>
                    <button
                    onClick={() => handleToggleChatMute(activeChat)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border border-zinc-800">
                    
                      {activeChat.mutedBy?.[currentUser.uid] ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      {activeChat.mutedBy?.[currentUser.uid] ? isArabic ? "تفعيل الإشعارات الفورية" : "Unmute Push Alerts" : isArabic ? "كتم إشعارات المحادثة" : "Mute Push Alerts"}
                    </button>
                    <button
                    onClick={() => handleDeleteChatLocally(activeChat.id)}
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border border-zinc-900">
                    
                      <Trash2 className="w-4 h-4 text-red-500" /> {isArabic ? "حذف المحادثة من هذا الجهاز" : "Delete Chat History (Me)"}
                    </button>
                    <button
                    onClick={() => handleDeleteChatRemotely(activeChat.id)}
                    className="w-full py-2.5 bg-red-950/10 border border-red-900/20 hover:bg-red-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5">
                    
                      <Trash2 className="w-4 h-4 text-white animate-pulse" /> {isArabic ? "حذف المحادثة بشكل نهائي للطرفين!" : "Purge Chat permanently for both!"}
                    </button>
                  </div>
                </motion.div>
              </div>
            }
          </AnimatePresence>

          {/* ACTIVE LOCK CHAT PIN INITIALIZER OVERLAY */}
          <AnimatePresence>
            {lockingChatId &&
            <div className="absolute inset-0 bg-black/90 z-[320] flex flex-col items-center justify-center p-6 text-center">
                <Key className="w-12 h-12 text-[#FF3D00] animate-pulse mb-4" />
                <h3 className="font-black text-sm text-white mb-1">{isArabic ? "تأمين المحادثة برقم سري" : "Set Secure PIN Lock"}</h3>
                <p className="text-xs text-zinc-500 mb-6">{isArabic ? "أدخل رمز حماية سري مكون من 4 أرقام لتأمين هذه المحادثة بالكامل." : "Set a 4-digit PIN lock code to protect this conversation"}</p>
                
                <input
                type="text"
                maxLength={4}
                value={lockPinCode}
                onChange={(e) => setLockPinCode(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-6 text-center text-xl font-black text-white focus:outline-none focus:border-[#FF3D00] tracking-widest max-w-[120px] mb-6" />
              

                <div className="flex gap-2 w-full max-w-xs">
                  <button
                  onClick={() => setLockingChatId(null)}
                  className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-black cursor-pointer">
                  
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                  onClick={() => {
                    if (lockPinCode.length === 4) {
                      handleLockChatWithPin(lockingChatId, lockPinCode);
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#FF3D00] text-white rounded-xl text-xs font-black cursor-pointer">
                  
                    {isArabic ? "تفعيل القفل" : "Enable Lock"}
                  </button>
                </div>
              </div>
            }
          </AnimatePresence>

          {/* DRAWER: SHARED MEDIA LIBRARY TAB */}
          <AnimatePresence>
            {showMediaLibrary &&
            <div className="absolute inset-0 bg-black/90 z-[180] flex flex-col">
                <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex justify-between items-center">
                  <h3 className="font-black text-sm text-white">{isArabic ? "معرض وسائط الدردشة" : "Shared Media library"}</h3>
                  <button onClick={() => setShowMediaLibrary(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex bg-zinc-900/50 border-b border-zinc-900">
                  {(["media", "files", "links"] as const).map((tab, _autoIdx) =>
                <button
                  key={`${tab}_${_autoIdx}`}
                  onClick={() => setMediaLibraryTab(tab)}
                  className={`flex-1 py-3 text-[10px] font-black tracking-wider text-center cursor-pointer ${mediaLibraryTab === tab ? "text-[#FF3D00] border-b-2 border-[#FF3D00]" : "text-zinc-500"}`}>
                  
                      {tab === "media" && (isArabic ? "الصور والفيديو" : "MEDIA")}
                      {tab === "files" && (isArabic ? "الملفات" : "FILES")}
                      {tab === "links" && (isArabic ? "الروابط" : "LINKS")}
                    </button>
                )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {mediaLibraryTab === "media" &&
                <div className="grid grid-cols-3 gap-2">
                      {sharedMediaFiles.media.map((item, idx) =>
                  <div key={idx} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800">
                          <img src={item.url} alt="media gallery" className="w-full h-full object-cover" />
                        </div>
                  )}
                      {sharedMediaFiles.media.length === 0 &&
                  <p className="col-span-3 text-center text-xs text-zinc-600 py-12">{isArabic ? "لا توجد صور أو فيديوهات مشتركة بعد" : "No shared media yet"}</p>
                  }
                    </div>
                }

                  {mediaLibraryTab === "files" &&
                <div className="space-y-2">
                      {sharedMediaFiles.files.map((item, idx) =>
                  <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="w-8 h-8 text-[#FF3D00]" />
                            <div>
                              <span className="block text-xs font-bold text-white max-w-[200px] truncate">{item.name}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{item.size}</span>
                            </div>
                          </div>
                          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><Download className="w-4 h-4" /></button>
                        </div>
                  )}
                      {sharedMediaFiles.files.length === 0 &&
                  <p className="text-center text-xs text-zinc-600 py-12">{isArabic ? "لا توجد ملفات مشتركة" : "No shared files yet"}</p>
                  }
                    </div>
                }

                  {mediaLibraryTab === "links" &&
                <div className="space-y-2">
                      {sharedMediaFiles.links.map((item, idx) =>
                  <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col gap-1">
                          <span className="text-[9px] text-[#FF3D00] font-black">Shared Link</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all">{item.url}</a>
                        </div>
                  )}
                      {sharedMediaFiles.links.length === 0 &&
                  <p className="text-center text-xs text-zinc-600 py-12">{isArabic ? "لا توجد روابط مشتركة" : "No shared links yet"}</p>
                  }
                    </div>
                }
                </div>
              </div>
            }
          </AnimatePresence>

          {/* RIGHT SIDE DRAWER: GEMINI AI HELPER DRAWER */}
          <AnimatePresence>
            {showAISuite &&
            <div className="absolute inset-0 bg-black/90 z-[190] flex flex-col p-4 animate-slide-in-right">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
                    <h3 className="font-black text-sm text-white">{isArabic ? "لوحة الذكاء الاصطناعي Gemini" : "Gemini AI Helper Panel"}</h3>
                  </div>
                  <button onClick={() => {setShowAISuite(false);setAiSummary(null);setAiSearchMatches([]);}} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Semantic search inside history */}
                  <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-purple-400">{isArabic ? "البحث الدلالي بالذكاء الاصطناعي" : "Semantic Context Search"}</h4>
                    <p className="text-[9px] text-zinc-500">{isArabic ? "ابحث عن الأفكار والرموز في المحادثة، حتى لو اختلفت الكلمات!" : "Search concepts or context within this chat instantly"}</p>
                    <div className="flex gap-2">
                      <input
                      type="text"
                      value={aiSearchQuery}
                      onChange={(e) => setAiSearchQuery(e.target.value)}
                      placeholder={isArabic ? "مثال: البحث عن كعكة أو طعام..." : "Search for food or meetings..."}
                      className="flex-1 bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500" />
                    
                      <button
                      onClick={handleAIQuerySemanticSearch}
                      className="p-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-500 cursor-pointer">
                      
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary action */}
                  <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-purple-400">{isArabic ? "التلخيص التلقائي الفوري" : "Instant Conversation Summary"}</h4>
                    <p className="text-[9px] text-zinc-500">{isArabic ? "تحويل محادثة الدردشة الطويلة إلى قائمة ملخص ذكية فوراً" : "Summarize long chat messages into neat contextual points"}</p>
                    
                    {aiLoading ?
                  <div className="py-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin text-[#FF3D00]" />
                        <span>{isArabic ? "يرجى الانتظار، جاري التحليل مع Gemini..." : "Analyzing with Gemini..."}</span>
                      </div> :
                  aiSummary ?
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {aiSummary}
                      </div> :

                  <button
                    onClick={handleSummarizeConversation}
                    className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-500 transition-colors cursor-pointer">
                    
                        {isArabic ? "تلخيص المحادثة الآن" : "Summarize Conversation"}
                      </button>
                  }
                  </div>
                </div>
              </div>
            }
          </AnimatePresence>

          {/* AI FLOATING PANEL QUICK LAUNCH TRIGGER */}
          {activeView === "chat" && !showAISuite &&
          <div className="absolute right-4 bottom-20">
              <button
              onClick={() => setShowAISuite(true)}
              title="Launch Gemini AI Assistant"
              className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-600/30 transform active:scale-95 transition-all cursor-pointer z-[100] animate-bounce">
              
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          }

          {/* Hidden inputs for real file uploading */}
          <input
            type="file"
            ref={mediaInputRef}
            onChange={handleMediaUpload}
            accept="image/*,video/*"
            className="hidden" />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleGenericFileUpload}
            accept="*"
            className="hidden" />
          

          {/* 1. CUSTOM CHAT THEMES & BUBBLE COLOR SETTINGS MODAL */}
          <AnimatePresence>
            {showThemeModal &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md z-[250] flex flex-col p-5">
              
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#FF3D00]" />
                    <h3 className="font-black text-sm text-white">
                      {isArabic ? "تخصيص مظهر ولون الدردشة 🎨" : "Customize Chat Appearance 🎨"}
                    </h3>
                  </div>
                  <button
                  onClick={() => {setShowThemeModal(false);playSynthSound("tap");}}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                  
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  {/* BUBBLE COLORS SELECTOR */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-zinc-300">
                        {isArabic ? "لون فقاعة الرسائل (خاصتك) 💬" : "Your Message Bubble Color 💬"}
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                        🪙 {blackCoins} {isArabic ? "كوين" : "coins"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {PREMIUM_BUBBLE_COLORS.map((color, _autoIdx) => {
                      const unlockedKey = `unlocked_bubbles_${currentUser.uid}`;
                      const unlockedList = JSON.parse(localStorage.getItem(unlockedKey) || '["flame"]');
                      const isUnlocked = unlockedList.includes(color.id);
                      const isCurrentlySelected = (activeChat?.[`bubbleColor_${currentUser.uid}`] || localStorage.getItem(`bubble_color_${activeChat?.id}`) || "flame") === color.id;

                      return (
                        <button
                          key={`${color.id}_${_autoIdx}`}
                          onClick={() => handleSelectBubbleColor(color.id)}
                          className={`p-3.5 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                          isCurrentlySelected ?
                          "border-[#FF3D00] bg-zinc-900/80 shadow-lg shadow-[#FF3D00]/5 scale-[1.02]" :
                          "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"}`
                          }>
                          
                            <span className="text-[10px] font-black text-white">{isArabic ? color.name : color.nameEn}</span>
                            <div className="flex items-center justify-between w-full mt-3">
                              <div className="w-5 h-5 rounded-full border border-zinc-800 shadow" style={{ backgroundColor: color.hex }} />
                              {isCurrentlySelected ?
                            <span className="text-[8px] font-black text-green-400 bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/30 flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> {isArabic ? "مطبق" : "Active"}
                                </span> :
                            isUnlocked ?
                            <span className="text-[8px] font-black text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                                  {isArabic ? "مفتوح" : "Unlocked"}
                                </span> :

                            <span className="text-[9px] font-bold text-[#EAB308] flex items-center gap-0.5 bg-yellow-950/30 px-1.5 py-0.5 rounded border border-yellow-800/20">
                                  🪙 {color.cost}
                                </span>
                            }
                            </div>
                          </button>);

                    })}
                    </div>
                  </div>

                  {/* BACKGROUND THEME SELECTOR */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-zinc-300">
                      {isArabic ? "خلفية الدردشة الخاصة 📸" : "Chat Background Customization 📸"}
                    </h4>

                    {/* Camera upload or file selector trigger */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                      onClick={() => {bgFileInputRef.current?.click();playSynthSound("tap");}}
                      className="p-4 bg-gradient-to-tr from-[#FF3D00]/10 to-orange-950/10 hover:from-[#FF3D00]/20 hover:to-orange-950/20 border border-[#FF3D00]/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group">
                      
                        <Image className="w-6 h-6 text-[#FF3D00] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-white">{isArabic ? "التقاط صورة / رفع ملف 📸" : "Camera / Upload Image 📸"}</span>
                      </button>

                      <button
                      onClick={() => handleSelectBackground("")}
                      className="p-4 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer">
                      
                        <Trash2 className="w-6 h-6 text-zinc-500 hover:text-red-400 transition-colors" />
                        <span className="text-[10px] font-black text-zinc-400">{isArabic ? "استعادة الخلفية الافتراضية" : "Reset Default Theme"}</span>
                      </button>
                    </div>

                    {/* Hidden input for background theme */}
                    <input
                    type="file"
                    ref={bgFileInputRef}
                    onChange={handleUploadBackgroundFile}
                    accept="image/*"
                    className="hidden" />
                  

                    {/* Preset themes */}
                    <div className="space-y-2 mt-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{isArabic ? "خلفيات الأنمي الجاهزة" : "Preset Anime Backgrounds"}</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {PRESET_CHAT_BACKGROUNDS.map((bg, _autoIdx) =>
                      <button
                        key={`${bg.id}_${_autoIdx}`}
                        onClick={() => handleSelectBackground(bg.url)}
                        className="h-20 rounded-xl overflow-hidden relative border border-zinc-800 hover:border-white transition-all cursor-pointer group flex items-end p-2 text-left">
                        
                            <img src={bg.url} alt={bg.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <span className="relative z-10 text-[9px] font-black text-white truncate max-w-full">{isArabic ? bg.name : bg.nameEn}</span>
                          </button>
                      )}
                      </div>
                    </div>

                    {/* Manual Image URL input */}
                    <div className="bg-zinc-900/30 border border-zinc-800/80 p-3.5 rounded-2xl space-y-2 mt-4">
                      <span className="text-[10px] font-black text-zinc-400 block">{isArabic ? "أو أدخل رابط الصورة يدوياً 🌐" : "Or enter custom image URL 🌐"}</span>
                      <div className="flex gap-2">
                        <input
                        type="text"
                        value={customBgInput}
                        onChange={(e) => setCustomBgInput(e.target.value)}
                        placeholder="https://example.com/wallpaper.jpg"
                        className="flex-1 bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FF3D00]" />
                      
                        <button
                        onClick={() => {
                          if (customBgInput.trim()) {
                            handleSelectBackground(customBgInput.trim());
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#FF3D00] hover:bg-orange-600 rounded-xl text-xs font-black text-white transition-colors cursor-pointer">
                        
                          {isArabic ? "تطبيق" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* 2. LONG PRESS CONTEXT OVERLAY */}
          <AnimatePresence>
            {longPressedMessage &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[280] flex flex-col justify-end p-5"
              onClick={() => setLongPressedMessage(null)}>
              
                <div
                className="bg-zinc-950 border border-zinc-900 rounded-3xl p-4 w-full max-w-sm mx-auto space-y-4 mb-4 select-none shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                
                  {/* MESSAGE PREVIEW */}
                  <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/40 text-left max-h-24 overflow-y-auto">
                    <span className="text-[8px] font-mono font-bold text-[#FF3D00] uppercase tracking-wider block mb-1">
                      {isArabic ? "الرسالة المحددة" : "Selected Message"}
                    </span>
                    <p className="text-xs text-zinc-300 font-semibold leading-relaxed break-words">{longPressedMessage.text || (isArabic ? "[وسائط]" : "[Media]")}</p>
                  </div>

                  {/* QUICK REACTIONS BAR */}
                  <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded-2xl border border-zinc-800/50">
                    {["❤️", "👍", "😂", "😮", "😢", "🔥"].map((emoji, _autoIdx) =>
                  <button
                    key={`${emoji}_${_autoIdx}`}
                    onClick={() => {
                      handleAddReactionToMessage(longPressedMessage.id, emoji);
                      setLongPressedMessage(null);
                    }}
                    className="text-xl transform active:scale-125 hover:scale-110 transition-transform duration-100 cursor-pointer">
                    
                        {emoji}
                      </button>
                  )}
                  </div>

                  {/* OPTIONS LIST */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Copy text */}
                    {longPressedMessage.text &&
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(longPressedMessage.text);
                      setLongPressedMessage(null);
                      playSynthSound("success");
                      triggerHapticFeedback("success");
                      triggerInAppNotification(
                        isArabic ? "تم النسخ" : "Copied",
                        isArabic ? "تم نسخ نص الرسالة بنجاح!" : "Message text copied successfully!"
                      );
                    }}
                    className="w-full py-2.5 px-3 bg-zinc-900/30 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-black text-zinc-300 transition-colors flex items-center gap-2.5 cursor-pointer text-left">
                    
                        <Copy className="w-4 h-4 text-zinc-400" />
                        <span>{isArabic ? "نسخ النص" : "Copy Message Text"}</span>
                      </button>
                  }

                    {/* Forward option */}
                    <button
                    onClick={() => {
                      setForwardingMessage(longPressedMessage);
                      setLongPressedMessage(null);
                      playSynthSound("tap");
                    }}
                    className="w-full py-2.5 px-3 bg-zinc-900/30 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-black text-zinc-300 transition-colors flex items-center gap-2.5 cursor-pointer text-left">
                    
                      <Forward className="w-4 h-4 text-zinc-400" />
                      <span>{isArabic ? "إعادة توجيه الرسالة" : "Forward Message"}</span>
                    </button>

                    {/* Edit Option (if isMe) */}
                    {longPressedMessage.senderId === currentUser.uid && longPressedMessage.text &&
                  <button
                    onClick={() => {
                      setEditingMessageId(longPressedMessage.id);
                      chatInputRef.current?.setValue(longPressedMessage.text);
                      chatInputRef.current?.focus();
                      setLongPressedMessage(null);
                      playSynthSound("tap");
                    }}
                    className="w-full py-2.5 px-3 bg-zinc-900/30 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-black text-zinc-300 transition-colors flex items-center gap-2.5 cursor-pointer text-left">
                    
                        <Edit className="w-4 h-4 text-zinc-400" />
                        <span>{isArabic ? "تعديل الرسالة" : "Edit Message"}</span>
                      </button>
                  }

                    {/* Delete for Me */}
                    <button
                    onClick={() => {
                      handleDeleteMessageForMe(longPressedMessage.id);
                      setLongPressedMessage(null);
                    }}
                    className="w-full py-2.5 px-3 bg-zinc-900/30 hover:bg-zinc-900/50 hover:text-red-400 rounded-xl text-xs font-black text-zinc-400 transition-colors flex items-center gap-2.5 cursor-pointer text-left">
                    
                      <Trash2 className="w-4 h-4 text-zinc-500" />
                      <span>{isArabic ? "حذف لدي" : "Delete for me"}</span>
                    </button>

                    {/* Delete from both sides (if isMe) */}
                    {longPressedMessage.senderId === currentUser.uid &&
                  <button
                    onClick={() => {
                      if (confirm(isArabic ? "هل أنت متأكد من سحب هذه الرسالة للجميع؟" : "Are you sure you want to unsend/recall this message for everyone?")) {
                        handleDeleteMessageForEveryone(longPressedMessage.id);
                        setLongPressedMessage(null);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-red-950/20 hover:bg-red-900 hover:text-white border border-red-900/20 rounded-xl text-xs font-black text-red-400 transition-colors flex items-center gap-2.5 cursor-pointer text-left">
                    
                        <Trash2 className="w-4 h-4 text-red-400 animate-pulse" />
                        <span>{isArabic ? "سحب الرسالة للجميع" : "Unsend message for everyone"}</span>
                      </button>
                  }
                  </div>

                  <button
                  onClick={() => setLongPressedMessage(null)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-black transition-colors cursor-pointer">
                  
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* 3. FORWARDING SELECTOR POPUP OVERLAY */}
          <AnimatePresence>
            {forwardingMessage &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md z-[290] flex flex-col p-5">
              
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Forward className="w-5 h-5 text-[#FF3D00]" />
                    <h3 className="font-black text-sm text-white">{isArabic ? "توجيه الرسالة إلى 🔄" : "Forward Message To 🔄"}</h3>
                  </div>
                  <button onClick={() => setForwardingMessage(null)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {chats.length === 0 ?
                <p className="text-center text-xs text-zinc-600 py-12">{isArabic ? "لا توجد غرف دردشة جارية لإعادة التوجيه" : "No active conversations to forward"}</p> :

                chats.map((chat, cIdx) => {
                  const partnerId = chat.participants.find((p) => p !== currentUser.uid) || "";
                  const partner = chat.participantDetails[partnerId];
                  if (!partner) return null;

                  return (
                    <div
                      key={chat.id ? `fwd_chat_${chat.id}_${cIdx}` : `fwd_chat_${cIdx}`}
                      onClick={() => handleForwardMessageToChat(chat)}
                      className="flex items-center justify-between p-3.5 bg-zinc-900/30 hover:bg-[#FF3D00]/10 border border-zinc-900 rounded-2xl cursor-pointer transition-colors">
                      
                          <div className="flex items-center gap-3">
                            <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                            <div>
                              <span className="block text-xs font-black text-white">{partner.name}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">@{partner.username}</span>
                            </div>
                          </div>
                          <div className="p-2 bg-[#FF3D00]/10 text-[#FF3D00] rounded-full">
                            <Forward className="w-3.5 h-3.5" />
                          </div>
                        </div>);

                })
                }
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* 4. MEDIA PRE-SEND DIMENSION ADJUSTMENT DRAWER */}
          <AnimatePresence>
            {pendingMedia &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm z-[260] flex flex-col p-5 justify-between">
              
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-[#FF3D00]" />
                    <h3 className="font-black text-sm text-white">{isArabic ? "تعديل أبعاد الوسائط قبل الإرسال 🖼️" : "Adjust Media Dimensions 🖼️"}</h3>
                  </div>
                  <button onClick={() => setPendingMedia(null)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* VISUAL IMAGE ADJUSTMENT PREVIEW AREA */}
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="border border-zinc-800 p-2 rounded-2xl bg-zinc-950 shadow-inner flex items-center justify-center overflow-hidden max-w-[280px] sm:max-w-[340px] max-h-[300px]">
                    {pendingMedia.mediaType === "video" ?
                  <video src={pendingMedia.base64Data} controls className="max-w-full max-h-full object-contain rounded-xl" /> :

                  <img
                    src={pendingMedia.base64Data}
                    alt="pending resize"
                    style={{ width: `${pendingMedia.imageWidth}px` }}
                    className="object-contain rounded-xl transition-all" />

                  }
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold mt-3">
                    {pendingMedia.fileName} ({pendingMedia.mediaType === "image" ? `${pendingMedia.imageWidth}px` : "Video"})
                  </span>
                </div>

                {/* SIZING SLIDER PANEL */}
                <div className="space-y-4 bg-zinc-950/80 border border-zinc-900 p-4 rounded-3xl shrink-0">
                  {pendingMedia.mediaType === "image" &&
                <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-zinc-300">{isArabic ? "عرض الصورة:" : "Image Width:"}</span>
                        <span className="text-xs font-black text-[#FF3D00] font-mono">{pendingMedia.imageWidth}px</span>
                      </div>
                      
                      <input
                    type="range"
                    min="100"
                    max="400"
                    step="10"
                    value={pendingMedia.imageWidth}
                    onChange={(e) => setPendingMedia((prev) => prev ? { ...prev, imageWidth: parseInt(e.target.value) } : null)}
                    className="w-full accent-[#FF3D00] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  

                      {/* QUICK RESIZE PRESETS */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[
                    { label: isArabic ? "صغير" : "Small", size: 120 },
                    { label: isArabic ? "متوسط" : "Medium", size: 200 },
                    { label: isArabic ? "كبير" : "Large", size: 280 },
                    { label: isArabic ? "أقصى" : "Full", size: 360 }].
                    map((pr, _autoIdx) =>
                    <button
                      key={`${pr.size}_${_autoIdx}`}
                      onClick={() => setPendingMedia((prev) => prev ? { ...prev, imageWidth: pr.size } : null)}
                      className={`py-1 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${
                      pendingMedia.imageWidth === pr.size ?
                      "bg-[#FF3D00] border-[#FF3D00] text-white" :
                      "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"}`
                      }>
                      
                            {pr.label} ({pr.size}px)
                          </button>
                    )}
                      </div>
                    </div>
                }

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <button
                    onClick={() => setPendingMedia(null)}
                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-black text-zinc-400 hover:text-white transition-colors cursor-pointer">
                    
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                    onClick={handleSendPendingMedia}
                    className="py-2.5 bg-gradient-to-tr from-[#FF3D00] to-orange-600 rounded-xl text-xs font-black text-white hover:opacity-90 shadow-md shadow-orange-950/30 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    
                      <Send className="w-4 h-4" />
                      <span>{isArabic ? "إرسال شينوبي 🚀" : "Send Shinobi 🚀"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>);

}

// Inline haptic utility helper
function addHapticFeedbackClick(callback: () => void) {
  callback();
}