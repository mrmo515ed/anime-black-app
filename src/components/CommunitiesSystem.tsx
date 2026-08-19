import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Users,
  Volume2,
  Mic,
  MicOff,
  ScreenShare,
  Hand,
  TrendingUp,
  Shield,
  MessageSquare,
  Radio,
  Castle,
  Globe,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Settings,
  Coins,
  Star,
  UserCheck,
  Send,
  Trash2,
  Pin,
  Share2,
  Lock,
  Eye,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Crown,
  User,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Sliders,
  Award,
  DollarSign,
  Briefcase,
  Play,
  Video,
  Clock,
  Paperclip,
  Smile,
  Image,
  FileText,
  VolumeX,
  Flag,
  ChevronDown,
  Reply,
  CheckCheck,
  MapPin,
  Bookmark,
  Forward,
  Palette,
  Sparkles,
  Languages,
  Copy,
  Download,
  Edit,
  MoreVertical } from
"lucide-react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { VoiceNotePlayer } from "./VoiceNotePlayer";
import { LevelBadge } from "./LevelBadge";

interface CommunitiesSystemProps {
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
  onOpenLiveSuite?: (mode: "call" | "stream" | "watchparty" | null, target?: string | null) => void;
}

interface Community {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cover: string;
  description: string;
  type: "group" | "channel" | "guild" | "space";
  category: string;
  membersCount: number;
  level: number;
  xp: number;
  tags: string[];
  privacy: "public" | "private" | "secret";
  joiningFee: number;
  creator: string;
  isJoined: boolean;
  themeColor: string; // Hex color or tailwind class
  verified: boolean;
}

export default function CommunitiesSystem({
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
  onOpenLiveSuite
}: CommunitiesSystemProps) {
  // Navigation
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);

  // UPGRADED CHAT STATES & PRESET THEMES (PM PARITY)
  const [activeSubRoomId, setActiveSubRoomId] = useState<string>("sr1");
  const [disappearingTimer, setDisappearingTimer] = useState<number>(0); // 0 = disabled, seconds otherwise
  const [activeChatBg, setActiveChatBg] = useState<string>(() => localStorage.getItem("community_chat_bg_default") || "");
  const [currentUserBubbleColor, setCurrentUserBubbleColor] = useState<string>(() => localStorage.getItem("community_bubble_color_user") || "flame");
  const [longPressedMessage, setLongPressedMessage] = useState<any | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<any | null>(null);
  const [showForwardModal, setShowForwardModal] = useState<boolean>(false);
  const [aiSmartReplies, setAiSmartReplies] = useState<string[]>([]);
  const [aiSmartRepliesLoading, setAiSmartRepliesLoading] = useState<boolean>(false);
  const [showThemeSettings, setShowThemeSettings] = useState<boolean>(false);

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


  // Static Custom Media pools for immersive experience
  const ANIME_STICKERS = [
  { id: "s1", emoji: "🔥", name: "Goku Aura", label: "غوكو سوبر ساياجين" },
  { id: "s2", emoji: "👁️", name: "Sharingan", label: "شارينغان ساسكي" },
  { id: "s3", emoji: "🧣", name: "Mikasa Scarf", label: "وشاح ميكاسا" },
  { id: "s4", emoji: "👒", name: "Luffy Straw Hat", label: "قبعة لوفي" },
  { id: "s5", emoji: "⚔️", name: "Zoro Swords", label: "سيوف زورو" },
  { id: "s6", emoji: "👹", name: "Sukuna Finger", label: "إصبع سوكونا" },
  { id: "s7", emoji: "🔮", name: "Gojo Void", label: "فراغ غوجو اللانهائي" }];


  const ANIME_CHARACTERS = [
  { id: "char1", name: "غوكو الغريزة الفائقة", nameEn: "Goku Ultra Instinct", power: "999,999", class: "Godly Tier", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120" },
  { id: "char2", name: "لوفي محرك الجير الخامس", nameEn: "Luffy Gear 5", power: "850,000", class: "Legendary Pirate", avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120" },
  { id: "char3", name: "غوجو ساتورو 🔮", nameEn: "Gojo Satoru", power: "950,000", class: "Six Eyes User", avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120" },
  { id: "char4", name: "رورونوا زورو ⚔️", nameEn: "Roronua Zoro", power: "600,000", class: "King of Hell", avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120" }];


  // Advanced Messaging System States
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [messageScheduledDelay, setMessageScheduledDelay] = useState<number>(0);
  const [scheduledQueue, setScheduledQueue] = useState<any[]>([]);
  const [showRichPanel, setShowRichPanel] = useState<boolean>(false);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState<boolean>(false);
  const [voiceNoteTimer, setVoiceNoteTimer] = useState<number>(0);
  const [recordingInterval, setRecordingInterval] = useState<any | null>(null);
  const [characterCardStats, setCharacterCardStats] = useState<any | null>(null);

  // Group / Guilds Roles & Sub-Channels States
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [roleManagerUser, setRoleManagerUser] = useState<any | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showChannelModal, setShowChannelModal] = useState<boolean>(false);

  // Dynamic Event Creation State
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    reward: "50 Black Coins",
    entryFee: 0
  });

  // Sub-Channel Custom Room State
  const [channelForm, setChannelForm] = useState({
    name: "",
    type: "chat" as "chat" | "channel" | "voice"
  });

  // Dynamic Community Members List (Integrated with Roles System)
  const [communityMembers, setCommunityMembers] = useState<any[]>([
    { username: "taymour_owner", name: "أبو تـيم السـيد 👑", role: "Owner", level: 120, badge: "👑 المالك الأسطوري", color: "text-amber-400", isOnline: true, statusText: "نشط الآن 🟢", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
    { username: "mora_admin", name: "مـورا المـدير 🛡️", role: "Admin", level: 85, badge: "🛡️ المدير العام", color: "text-blue-400", isOnline: true, statusText: "يرتب الفعاليات ⚙️", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" },
    { username: "zoro_sama", name: "زورو السـياف ⭐", role: "Moderator", level: 48, badge: "⭐ مشرف القسم", color: "text-emerald-400", isOnline: false, statusText: "نائم (غير متصل) 😴", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { username: "sanji_intern", name: "سانجي المتدرب 🧪", role: "Intern", level: 22, badge: "🧪 متدرب إشراف", color: "text-purple-400", isOnline: true, statusText: "يطبخ في المطبخ 🍳", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    { username: "luffy_member", name: "لوفي قبعة القش 👤", role: "Member", level: 12, badge: "👤 عضو نشط", color: "text-zinc-300", isOnline: true, statusText: "يتصفح ريلز الأنمي 👒", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100" }
  ]);
  const [membersFilter, setMembersFilter] = useState<"all" | "online">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "group" | "channel" | "guild" | "space">("all");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [tabOrder, setTabOrder] = useState<string[]>([
    "chat", "posts", "announcements", "wiki", "events", "files", "voice", "marketplace", "members", "analytics", "moderation", "settings"
  ]);

  // AI & Moderation System States
  const [aiSummaryModal, setAiSummaryModal] = useState<{ open: boolean; loading: boolean; result: string }>({ open: false, loading: false, result: "" });
  const [loadingSmartReplies, setLoadingSmartReplies] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<any[]>([
    { id: "rep1", reportedUser: "spammer_otaku", reason: "إعلانات مزعجة وروابط خارجية غير موثوقة", timestamp: "منذ 10 دقائق" },
    { id: "rep2", reportedUser: "spoiler_king", reason: "حرق نهاية آرك جوجوتسو كايسن بدون تحذير", timestamp: "منذ 40 دقيقة" }
  ]);
  const [moderationTestText, setModerationTestText] = useState("");
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiModerationResult, setAiModerationResult] = useState<any>(null);

  // Communities List (Synced from Firestore)
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "communities"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
      if (list.length > 0) {
        setCommunities(list);
      }
    });
    return () => unsubscribe();
  }, []);

  // Messages State (Synced from Firestore)
  const [messages, setMessages] = useState<Record<string, any[]>>({});

  // Group Chat Message modification handlers
  const [editingGroupMessageId, setEditingGroupMessageId] = useState<string | null>(null);
  const [editingGroupMessageText, setEditingGroupMessageText] = useState("");

  const handleEditGroupMessage = async (messageId: string, newText: string) => {
    if (!activeCommunityId) return;
    playSynthSound("tap");
    // Optimistic Update
    setMessages((prev) => {
      const list = prev[activeCommunityId] || [];
      const updated = list.map((m, _autoIdx) => m.id === messageId ? { ...m, text: newText, isEdited: true } : m);
      return { ...prev, [activeCommunityId]: updated };
    });
    setEditingGroupMessageId(null);
    try {
      await updateDoc(doc(db, `communities/${activeCommunityId}/messages`, messageId), {
        text: newText,
        isEdited: true
      });
    } catch (e) {
      console.error("Failed to edit group message:", e);
    }
  };

  const handleDeleteGroupMessage = async (messageId: string) => {
    if (!activeCommunityId) return;
    playSynthSound("error");
    triggerHapticFeedback("error");
    // Optimistic Update
    setMessages((prev) => {
      const list = prev[activeCommunityId] || [];
      const updated = list.filter((m) => m.id !== messageId);
      return { ...prev, [activeCommunityId]: updated };
    });
    try {
      await deleteDoc(doc(db, `communities/${activeCommunityId}/messages`, messageId));
      triggerInAppNotification(
        isArabic ? "سحب الرسالة" : "Message Recalled",
        isArabic ? "تم سحب رسالتك بنجاح من المجموعة للجميع." : "Your message has been successfully recalled from the group for everyone."
      );
    } catch (e) {
      console.error("Failed to delete group message:", e);
    }
  };

  // Setup Real-time Server Sync for Community/Group Chat Room
  useEffect(() => {
    if (!activeCommunityId) return;

    const selectedComm = communities.find((c) => c.id === activeCommunityId);
    const subCollectionId = selectedComm?.type === "space" || selectedComm?.type === "guild" ?
    `${activeCommunityId}_${activeSubRoomId}` :
    activeCommunityId;

    const q = query(
      collection(db, `communities/${subCollectionId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map((doc, _autoIdx) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Seed welcoming message if Firestore subcollection is empty
      if (snapshot.empty) {
        const defaults = activeCommunityId === "c1" ? [
        { senderId: "zoro_sama", senderName: "رورونوا زورو ⚔️", role: "Moderator", roleBadge: "🛡️ مشرف", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", text: "يا شباب، هل رأيتم الإعلان الترويجي الجديد لأنمي المنشار؟ الرسم مذهل!", createdAt: new Date(Date.now() - 3600000).toISOString() },
        { senderId: "mikasa_ack", senderName: "ميكاسا أكرمان 🧣", role: "Member", roleBadge: "👤 عضو", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", text: "نعم! استوديو مابا يبدع دائماً في مشاهد الحركة الحماسية.", createdAt: new Date(Date.now() - 1800000).toISOString() }] :
        activeCommunityId === "c3" ? [
        { senderId: "zoro_sama", senderName: "قائد الشينوبي ⚔️", role: "Owner", roleBadge: "👑 القائد", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", text: "أهلاً بأعضاء النقابة! غداً ستبدأ مهمة هزيمة التنين الأسود الأسبوعية.", createdAt: new Date(Date.now() - 3600000).toISOString() }] :
        [];

        defaults.forEach(async (d) => {
          await addDoc(collection(db, `communities/${subCollectionId}/messages`), d);
        });
        return;
      }

      setMessages((prev) => {
        const currentList = prev[subCollectionId] || [];
        const tempMsgs = currentList.filter((m: any) => m.id.startsWith("temp_") && !msgList.some((sm: any) => sm.text === m.text && sm.senderId === m.senderId));
        return {
          ...prev,
          [subCollectionId]: [...msgList, ...tempMsgs]
        };
      });
    });

    return () => unsubscribe();
  }, [activeCommunityId, activeSubRoomId]);

  // Channel Broadcasts
  const [channelPosts, setChannelPosts] = useState<any[]>([
  {
    id: "cp1",
    title: "رسمياً: تأجيل الحلقة القادمة من بطل الدرع لتاريخ 15 يوليو",
    content: "أعلن الاستوديو المنتج بشكل رسمي اليوم عن تأجيل بث الحلقة رقم 12 لأسباب تتعلق بالإنتاج والجودة الفنية. نأسف لأي إزعاج وسنوافيكم بالتفاصيل فوراً.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop",
    votes: { question: "ما رأيك بقرارات التأجيل المستمرة؟", options: [{ text: "قرار صائب للجودة", count: 184 }, { text: "مزعج جداً", count: 320 }], userVoted: null },
    likes: 420,
    comments: [
    { author: "أنس الأوتاكو", text: "أفضل التأجيل على إنتاج جودة ضعيفة مثل الموسم الماضي." }],

    timestamp: "منذ ساعتين",
    reactions: { "🔥": 140, "😢": 65, "👍": 98 }
  }]
  );

  // Guild Specific States (11.12)
  const [guildVault, setGuildVault] = useState({ coins: 350, itemsCount: 4 });
  const [guildQuests, setGuildQuests] = useState([
  { id: "q1", title: "كتابة 5 منشورات مميزة عن أنمي بليتش", reward: "50 Black Coins + 100 Guild XP", progress: 60, status: "active" },
  { id: "q2", title: "المشاركة في الغرفة الصوتية للنقابة لمدة ساعة", reward: "30 Guild XP", progress: 100, status: "completed" },
  { id: "q3", title: "دعوة 10 أعضاء جدد للانضمام للنقابة", reward: "15 Black Coins", progress: 20, status: "active" }]
  );
  const [guildStore, setGuildStore] = useState([
  { id: "gs1", name: "إطار شينوبي الأسطوري", price: 80, type: "frame", icon: "⚔️" },
  { id: "gs2", name: "شارة ملوك الأنمي", price: 120, type: "badge", icon: "👑" },
  { id: "gs3", name: "لقب 'ظل الشينوبي' المضيء", price: 150, type: "title", icon: "🔮" }]
  );

  // Spaces Nested Elements (11.13)
  const [spaceSubRooms, setSpaceSubRooms] = useState([
  { id: "sr1", name: "💬 نقاشات ون بيس الأسبوعية", type: "chat", activeUsers: 42 },
  { id: "sr2", name: "📢 تسريبات المانجا الحصرية", type: "channel", activeUsers: 15 },
  { id: "sr3", name: "🔊 مقهى قراصنة القبعة القشية", type: "voice", activeUsers: 8 }]
  );

  // Wiki Pages (11.16)
  const [wikiPages, setWikiPages] = useState<any[]>([
  { id: "w1", title: "قوانين المجتمع العامة", category: "rules", content: "1. احترام الأعضاء وتجنب الحرق الفج.\n2. يمنع السبام والإعلانات الخارجية.\n3. النشر يقتصر على مواضيع الأنمي والمانجا.", lastEditedBy: "mora_admin", date: "2026-06-25" },
  { id: "w2", title: "دليل المبتدئين لعالم ون بيس", category: "guide", content: "يتكون عالم ون بيس من خط الاستواء (Red Line) والخط العظيم (Grand Line)، مع الفئات الثلاثة الأقوى في البحار: اليونكو، البحرية، والجيش الثوري...", lastEditedBy: "zoro_sama", date: "2026-07-01" }]
  );
  const [showWikiEditModal, setShowWikiEditModal] = useState(false);
  const [wikiForm, setWikiForm] = useState({ title: "", content: "", category: "guide" });

  // Creation Panel States (11.2)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationForm, setCreationForm] = useState({
    name: "",
    username: "",
    description: "",
    type: "group" as "group" | "channel" | "guild" | "space",
    category: "مجتمع أنمي",
    tags: "",
    privacy: "public" as "public" | "private" | "secret",
    joiningFee: 0,
    joinQuestion: ""
  });

  // Settings Panel (11.19)
  const [blacklistInput, setBlacklistInput] = useState("");
  const [blacklistedKeywords, setBlacklistedKeywords] = useState<string[]>(["سبام", "مخالف", "هكر"]);
  const [antiSpamEnabled, setAntiSpamEnabled] = useState(true);
  const [postPreApproval, setPostPreApproval] = useState(false);
  const [communityTheme, setCommunityTheme] = useState("flame"); // flame, void, shadow, emerald, emperor

  // Audio chamber (11.17)
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState([
  { name: "لوفي الأسطوري", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100", isSpeaking: true, handUp: false },
  { name: "نامي الملاحة", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isSpeaking: false, handUp: false },
  { name: "سانجي الطباخ", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", isSpeaking: false, handUp: true }]
  );

  // Active Chats Input
  const [messageInput, setMessageInput] = useState("");
  const [isSpeakingMsgId, setIsSpeakingMsgId] = useState<string | null>(null);

  // Community Feed Posts (11.5)
  const [communityPosts, setCommunityPosts] = useState<any[]>([
  { id: "p1", author: { name: "أوتـاكو دافـور", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" }, content: "برأيكم، هل سينجح لوفي في هزيمة سابو إذا حدث قتال حقيقي بينهما؟ الإجابة بدون تحيز ياشباب!", upvotes: 42, commentsCount: 18 },
  { id: "p2", author: { name: "كـونان الصـغير", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100" }, content: "لقد جمعت دليلاً كاملاً من المانجا يثبت هوية الزعيم الفعلي للمنظمة السوداء قبل الإفصاح عنه!", upvotes: 110, commentsCount: 54 }]
  );
  const [newPostContent, setNewPostContent] = useState("");

  // Events (11.5)
  const [communityEvents, setCommunityEvents] = useState<any[]>([
  { id: "ev1", title: "مسابقة المعلومات الأسبوعية للأوتاكو 🏆", date: "اليوم الساعة 9:00 مساءً", rsvpCount: 84, joined: false, reward: "30 Black Coins" },
  { id: "ev2", title: "مراجعة شاملة لفيلم قاتل الشياطين الجديد", date: "الجمعة المقبل الساعة 7:00 مساءً", rsvpCount: 142, joined: false, reward: "10 Guild XP" }]
  );

  // Files Shared (11.5)
  const [sharedFiles, setSharedFiles] = useState<any[]>([
  { name: "أيقونات ون بيس الفاخرة.zip", size: "45.2 MB", downloads: 340, uploader: "nami_gold" },
  { name: "تقرير مبيعات المانجا 2025.pdf", size: "3.1 MB", downloads: 92, uploader: "conan_news" }]
  );

  // Text to Speech
  const handleSpeak = (id: string, text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeakingMsgId === id) {
        window.speechSynthesis.cancel();
        setIsSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isArabic ? "ar-SA" : "en-US";
      utterance.onend = () => setIsSpeakingMsgId(null);
      setIsSpeakingMsgId(id);
      window.speechSynthesis.speak(utterance);
      triggerHapticFeedback("tap");
    } else {
      triggerInAppNotification("نظام الصوت", "جهازك لا يدعم توليف الصوت النصي", "error");
    }
  };

  // Create Community Function
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creationForm.name || !creationForm.username) {
      triggerHapticFeedback("error");
      playSynthSound("error");
      triggerInAppNotification("خطأ في البيانات", "يرجى تعبئة الحقول الإلزامية الاسم والمعرف", "error");
      return;
    }

    // Checking user level (Needs 10)
    const userLvl = currentUser?.level || 1;
    if (userLvl < 10) {
      triggerHapticFeedback("error");
      playSynthSound("error");
      triggerInAppNotification(
        "المستوى غير كافٍ",
        isArabic ? "يجب أن تكون في المستوى 10 أو أعلى لإنشاء مجتمع جديد." : "You must be at least Level 10 to establish a community.",
        "error"
      );
      return;
    }

    // Joining/Creation Fee checks (50 Black Coins)
    if (blackCoins < 50) {
      triggerHapticFeedback("error");
      playSynthSound("error");
      triggerInAppNotification(
        "العملات غير كافية",
        isArabic ? "رسوم إنشاء المجتمع تبلغ 50 Black Coin." : "Creation fee is 50 Black Coins.",
        "error"
      );
      return;
    }

    // Spend coins
    setBlackCoins((prev) => prev - 50);
    playSynthSound("purchase");

    const newComm: Community = {
      id: "c_" + Date.now(),
      name: creationForm.name,
      username: creationForm.username.replace("@", ""),
      avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop",
      cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",
      description: creationForm.description || "لا يوجد وصف متوفر بعد لهذا المجتمع الأسطوري.",
      type: creationForm.type,
      category: creationForm.category,
      membersCount: 1,
      level: 1,
      xp: 0,
      tags: creationForm.tags.split(",").map((t, _autoIdx) => t.trim()).filter(Boolean),
      privacy: creationForm.privacy,
      joiningFee: creationForm.joiningFee,
      creator: currentUser.username,
      isJoined: true,
      themeColor: "#FF3D00",
      verified: false
    };

    setCommunities((prev) => [newComm, ...prev]);
    setActiveCommunityId(newComm.id);
    setShowCreateModal(false);

    triggerCelebration(
      "levelup",
      "تأسس المجتمع الأسطوري! 🚀",
      "Legendary Community Established! 🚀",
      `تم إنشاء ${creationForm.name} بنجاح خصم 50 عملة سوداء.`,
      `Successfully created ${creationForm.name}. 50 Black Coins consumed.`
    );
  };

  // AI Handlers for Chat Summarization & Smart Replies
  const handleSummarizeCommunityChat = async () => {
    const subId = activeSubRoomId ? `${activeCommunityId}_${activeSubRoomId}` : activeCommunityId;
    const currentCommMsgs = messages[subId] || [];
    if (currentCommMsgs.length === 0) {
      triggerInAppNotification("الذكاء الاصطناعي", "لا توجد رسائل كافية لتلخيص المحادثة حالياً", "warning");
      return;
    }

    setAiSummaryModal({ open: true, loading: true, result: "" });
    playSynthSound("tap");

    const compiledText = currentCommMsgs.slice(-25).map((m: any) => `${m.senderName || m.senderId}: ${m.text}`).join("\n");

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: compiledText })
      });
      const data = await res.json();
      if (data.result) {
        setAiSummaryModal({ open: true, loading: false, result: data.result });
        playSynthSound("success");
      } else {
        setAiSummaryModal({ open: true, loading: false, result: "تعذر الحصول على ملخص المحادثة حالياً." });
      }
    } catch (err) {
      console.error("AI Summarize error:", err);
      setAiSummaryModal({ open: true, loading: false, result: "حدث خطأ أثناء التواصل مع سيرفر الذكاء الاصطناعي." });
    }
  };

  const handleGetSmartReplies = async () => {
    const subId = activeSubRoomId ? `${activeCommunityId}_${activeSubRoomId}` : activeCommunityId;
    const currentCommMsgs = messages[subId] || [];
    if (currentCommMsgs.length === 0) return;

    setLoadingSmartReplies(true);
    playSynthSound("tap");

    const recent = currentCommMsgs.slice(-5).map((m: any) => ({
      text: m.text,
      senderId: m.senderId === currentUser?.username ? "me" : m.senderId
    }));

    try {
      const res = await fetch("/api/ai/chat-smart-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: recent })
      });
      const data = await res.json();
      if (data.result && Array.isArray(data.result)) {
        setAiSmartReplies(data.result);
        playSynthSound("success");
      }
    } catch (err) {
      console.error("Smart replies error:", err);
    } finally {
      setLoadingSmartReplies(false);
    }
  };

  // Join Community
  const handleJoinLeaveCommunity = async (comm: Community) => {
    if (comm.isJoined) {
      // Leave
      setCommunities((prev) => prev.map((c, _autoIdx) => c.id === comm.id ? { ...c, isJoined: false, membersCount: Math.max(0, c.membersCount - 1) } : c));
      triggerInAppNotification("المجتمعات", `لقد غادرت مجتمع ${comm.name}`, "info");
      playSynthSound("error");
    } else {
      // Join checks
      if (comm.joiningFee > 0 && blackCoins < comm.joiningFee) {
        triggerInAppNotification("رسوم الانضمام", "لا تمتلك رصيد كافي للانضمام إلى هذا المجتمع الخاص", "error");
        return;
      }
      if (comm.joiningFee > 0) {
        setBlackCoins((p) => p - comm.joiningFee);
      }
      setCommunities((prev) => prev.map((c, _autoIdx) => c.id === comm.id ? { ...c, isJoined: true, membersCount: c.membersCount + 1 } : c));
      triggerInAppNotification("مرحباً بك", `لقد انضممت بنجاح إلى ${comm.name}!`, "success");
      playSynthSound("success");
    }
  };

  // Send Message inside a Group / Guild Chat (Upgraded System)
  const sendActualMessage = async (text: string, mediaPayload?: any) => {
    if (!activeCommunityId) return;

    const containsBlacklisted = blacklistedKeywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));
    if (containsBlacklisted && antiSpamEnabled) {
      triggerHapticFeedback("error");
      playSynthSound("error");
      triggerInAppNotification(
        "مكافحة المحتوى المخالف",
        isArabic ? "رسالتك تحتوي على كلمات محظورة مسبقاً من الإدارة!" : "Your message contains blacklisted keywords!",
        "error"
      );
      return;
    }

    const selectedComm = communities.find((c) => c.id === activeCommunityId);
    const subCollectionId = selectedComm?.type === "space" || selectedComm?.type === "guild" ?
    `${activeCommunityId}_${activeSubRoomId}` :
    activeCommunityId;

    const newMsg: any = {
      senderId: currentUser.uid,
      sender: "user",
      senderName: currentUser.name,
      role: "Owner",
      roleBadge: "👑 المالك الأسطوري",
      avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      text: text,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      replyTo: replyingToMessage ? { id: replyingToMessage.id, text: replyingToMessage.text, senderName: replyingToMessage.senderName } : null,
      media: mediaPayload || null,
      reactions: {},
      bubbleColor: currentUserBubbleColor,
      expiresAt: disappearingTimer > 0 ? new Date(Date.now() + disappearingTimer * 1000).toISOString() : null
    };

    // Appending Optimistic Message immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      ...newMsg
    };
    setMessages((prev) => ({
      ...prev,
      [subCollectionId]: [...(prev[subCollectionId] || []), optimisticMsg]
    }));

    // Reset temporary UI states
    setReplyingToMessage(null);

    try {
      await addDoc(collection(db, `communities/${subCollectionId}/messages`), newMsg);
    } catch (e) {
      console.error("Group Chat firestore error, fallback to memory", e);
      setMessages((prev) => {
        const list = (prev[subCollectionId] || []).filter((m) => m.id !== tempId);
        return {
          ...prev,
          [subCollectionId]: [...list, { ...newMsg, id: "local_" + Date.now() }]
        };
      });
    }

    // Reward XP to Community on activity
    setCommunities((prev) => prev.map((c, _autoIdx) => {
      if (c.id === activeCommunityId) {
        const nextXp = c.xp + 15;
        const levelUp = nextXp >= 1000;
        return {
          ...c,
          xp: levelUp ? nextXp - 1000 : nextXp,
          level: levelUp ? c.level + 1 : c.level
        };
      }
      return c;
    }));

    // Clear replying state
    setReplyingToMessage(null);
    playSynthSound("tap");
    triggerHapticFeedback("tap");

    // Random Bot reaction occasionally
    setTimeout(async () => {
      const responses = [
      "سوبااااار! ⚡",
      "مثير للاهتمام، أتفق معك تماماً!",
      "أظن أن المانجا وضحت هذا الأمر بشكل أعمق.",
      "تفاعلوا يا رفاق! الفعاليات ستبدأ قريباً."];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const botMsg = {
        senderId: "bot",
        sender: "bot",
        senderName: "مساعد الأوتـاكو 🤖",
        role: "Intern",
        roleBadge: "🧪 بوت مساعد",
        avatar: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=100",
        text: randomResponse,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reactions: {}
      };

      try {
        await addDoc(collection(db, `communities/${activeCommunityId}/messages`), botMsg);
      } catch (err) {}
    }, 2500);
  };

  const handleSendMessage = (textParam?: string) => {
    const textToSend = typeof textParam === "string" ? textParam : messageInput;
    if (!textToSend.trim() && !characterCardStats) return;

    const mediaToSend = characterCardStats ? { type: "card", cardData: characterCardStats } : null;

    if (messageScheduledDelay > 0) {
      const delayMs = messageScheduledDelay * 1000;
      const scheduledTime = new Date(Date.now() + delayMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const scheduledObj = {
        id: "sched_" + Date.now(),
        text: textToSend,
        media: mediaToSend,
        delay: messageScheduledDelay,
        timeString: scheduledTime,
        communityId: activeCommunityId
      };

      setScheduledQueue((prev) => [...prev, scheduledObj]);
      triggerInAppNotification(
        "رسالة مجدولة",
        isArabic ? `تمت جدولة رسالتك للإرسال بعد ${messageScheduledDelay} ثانية` : `Message scheduled in ${messageScheduledDelay} seconds`,
        "info"
      );
      playSynthSound("success");

      setTimeout(() => {
        sendActualMessage(textToSend, mediaToSend);
        setScheduledQueue((prev) => prev.filter((item) => item.id !== scheduledObj.id));
      }, delayMs);

    } else {
      sendActualMessage(textToSend, mediaToSend);
    }

    setMessageInput("");
    setCharacterCardStats(null);
    setMessageScheduledDelay(0);
  };

  const handleStartRecordingVoiceNote = () => {
    setIsRecordingVoiceNote(true);
    setVoiceNoteTimer(0);
    playSynthSound("tap");
    triggerHapticFeedback("tap");

    const interval = setInterval(() => {
      setVoiceNoteTimer((prev) => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
  };

  const handleStopRecordingVoiceNote = (shouldSend: boolean) => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setIsRecordingVoiceNote(false);

    if (shouldSend && voiceNoteTimer > 0) {
      const voiceDuration = `${Math.floor(voiceNoteTimer / 60)}:${(voiceNoteTimer % 60).toString().padStart(2, "0")}`;
      sendActualMessage(
        isArabic ? "🎤 رسالة صوتية مرسلة" : "🎤 Voice note sent",
        { type: "voicenote", name: `voice_recording_${Date.now()}.mp3`, url: "https://animeblack.com/audio/voice.mp3", duration: voiceDuration }
      );
      triggerInAppNotification(
        isArabic ? "تم إرسال الصوت" : "Voice Note Sent",
        isArabic ? "تم بث التسجيل الصوتي بنجاح!" : "Audio recording successfully broadcasted!",
        "success"
      );
    }
    setVoiceNoteTimer(0);
    playSynthSound("success");
  };

  const handleAddReaction = async (msgId: string, emoji: string) => {
    if (!activeCommunityId) return;
    try {
      const msgRef = doc(db, `communities/${activeCommunityId}/messages`, msgId);
      const docSnap = await getDoc(msgRef);
      if (docSnap.exists()) {
        const msgData = docSnap.data();
        const currentReactions = msgData.reactions || {};
        const currentUsers = currentReactions[emoji] || [];
        let nextUsers = [...currentUsers];

        if (nextUsers.includes(currentUser.username)) {
          nextUsers = nextUsers.filter((u) => u !== currentUser.username);
        } else {
          nextUsers.push(currentUser.username);
        }

        const nextReactions = { ...currentReactions };
        if (nextUsers.length === 0) {
          delete nextReactions[emoji];
        } else {
          nextReactions[emoji] = nextUsers;
        }

        await updateDoc(msgRef, { reactions: nextReactions });
      }
    } catch (err) {
      console.error("Firestore group reaction error:", err);
    }
    playSynthSound("tap");
    triggerHapticFeedback("tap");
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!activeCommunityId) return;
    try {
      await deleteDoc(doc(db, `communities/${activeCommunityId}/messages`, msgId));
    } catch (err) {
      console.error("Firestore group message delete error:", err);
    }
    triggerInAppNotification(
      isArabic ? "حذف رسالة" : "Delete Message",
      isArabic ? "تم حذف الرسالة بنجاح!" : "Message deleted successfully!",
      "info"
    );
    playSynthSound("error");
  };

  const handlePinMessage = (text: string) => {
    if (!activeCommunityId) return;
    setCommunities((prev) => prev.map((c, _autoIdx) => {
      if (c.id === activeCommunityId) {
        return {
          ...c,
          description: text
        };
      }
      return c;
    }));
    triggerInAppNotification(
      isArabic ? "تثبيت رسالة" : "Pin Message",
      isArabic ? "تم تحديث الرسالة المثبتة للمجتمع!" : "Community pinned message updated!",
      "success"
    );
    playSynthSound("levelup");
  };

  const handleCreateSubChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelForm.name.trim()) return;

    const newRoom = {
      id: "sr_" + Date.now(),
      name: (channelForm.type === "chat" ? "💬 " : channelForm.type === "channel" ? "📢 " : "🔊 ") + channelForm.name.trim(),
      type: channelForm.type,
      activeUsers: 0
    };

    setSpaceSubRooms((prev) => [...prev, newRoom]);
    setShowChannelModal(false);
    setChannelForm({ name: "", type: "chat" });
    triggerInAppNotification(
      isArabic ? "تم إنشاء القناة" : "Sub-Room Created",
      isArabic ? "تمت إضافة قناة جديدة للمجتمع!" : "Added new sub-channel successfully!",
      "success"
    );
    playSynthSound("levelup");
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date.trim()) return;

    if (eventForm.entryFee > 0 && blackCoins < eventForm.entryFee) {
      triggerInAppNotification(
        isArabic ? "عملات غير كافية" : "Insufficient Coins",
        isArabic ? "رصيدك غير كافٍ لتمويل رسوم هذه الفعالية" : "Your balance is insufficient to seed this event",
        "error"
      );
      return;
    }

    if (eventForm.entryFee > 0) {
      setBlackCoins((prev) => prev - eventForm.entryFee);
    }

    const newEvent = {
      id: "ev_" + Date.now(),
      title: eventForm.title.trim(),
      date: eventForm.date.trim(),
      rsvpCount: 0,
      joined: false,
      reward: eventForm.reward
    };

    setCommunityEvents((prev) => [newEvent, ...prev]);
    setShowEventModal(false);
    setEventForm({ title: "", date: "", reward: "50 Black Coins", entryFee: 0 });
    triggerInAppNotification(
      isArabic ? "تأسيس الفعالية" : "Event Established",
      isArabic ? "تم إنشاء وإدراج الفعالية الحماسية الجديدة!" : "The epic new event has been scheduled!",
      "success"
    );
    playSynthSound("levelup");
  };

  const handleUpdateUserRole = (username: string, nextRole: string) => {
    let nextBadge = "👤 عضو نشط";
    let nextColor = "text-zinc-300";

    switch (nextRole) {
      case "Owner":
        nextBadge = "👑 المالك الأسطوري";
        nextColor = "text-amber-400";
        break;
      case "Admin":
        nextBadge = "🛡️ المدير العام";
        nextColor = "text-blue-400";
        break;
      case "Moderator":
        nextBadge = "⭐ مشرف القسم";
        nextColor = "text-emerald-400";
        break;
      case "Elite":
        nextBadge = "⚔️ النخبة الشينوبي";
        nextColor = "text-red-500";
        break;
      case "Intern":
        nextBadge = "🧪 متدرب إشراف";
        nextColor = "text-purple-400";
        break;
    }

    setCommunityMembers((prev) => prev.map((m, _autoIdx) => {
      if (m.username === username) {
        return {
          ...m,
          role: nextRole,
          badge: nextBadge,
          color: nextColor
        };
      }
      return m;
    }));

    if (activeCommunityId) {
      setMessages((prev) => {
        const chatMsgs = prev[activeCommunityId] || [];
        const updated = chatMsgs.map((msg, _autoIdx) => {
          if (msg.sender === username || username === "taymour_owner" && msg.sender === "user") {
            return {
              ...msg,
              role: nextRole,
              roleBadge: nextBadge
            };
          }
          return msg;
        });
        return { ...prev, [activeCommunityId]: updated };
      });
    }

    setShowRoleModal(false);
    setRoleManagerUser(null);
    triggerInAppNotification(
      isArabic ? "تعديل رتبة" : "Role Management",
      isArabic ? `تمت ترقية العضو إلى رتبة ${nextBadge} بنجاح!` : "User role updated successfully!",
      "success"
    );
    playSynthSound("success");
  };

  const handlePostInCommunity = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: "p_" + Date.now(),
      author: { name: currentUser.name, avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
      content: newPostContent,
      upvotes: 1,
      commentsCount: 0
    };
    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostContent("");
    triggerInAppNotification("تم النشر", "تم نشر موضوعك في ساحة النقاش بنجاح!", "success");
    playSynthSound("levelup");
  };

  const handleCreateWikiPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wikiForm.title || !wikiForm.content) return;
    const newPage = {
      id: "w_" + Date.now(),
      title: wikiForm.title,
      category: wikiForm.category,
      content: wikiForm.content,
      lastEditedBy: currentUser.username,
      date: new Date().toISOString().split("T")[0]
    };
    setWikiPages([newPage, ...wikiPages]);
    setShowWikiEditModal(false);
    setWikiForm({ title: "", content: "", category: "guide" });
    triggerInAppNotification("تم إضافة الصفحة", "تم إغناء أرشيف الويكي للمجتمع بصفحتك الجديدة!", "success");
    playSynthSound("levelup");
  };

  // Guild Specific actions
  const handleVaultDeposit = () => {
    if (blackCoins < 20) {
      triggerInAppNotification("خطأ", "لا تملك رصيد كافي لإيداعه", "error");
      return;
    }
    setBlackCoins((p) => p - 20);
    setGuildVault((prev) => ({ coins: prev.coins + 20, itemsCount: prev.itemsCount }));
    playSynthSound("purchase");
    triggerHapticFeedback("success");
    triggerInAppNotification("الخزنة المشتركة", "تم إيداع 20 عملة سوداء بنجاح لدعم صندوق النقابة!", "success");
  };

  const handleBuyGuildStore = (item: any) => {
    if (blackCoins < item.price) {
      triggerInAppNotification("خطأ", "لا تملك رصيد كافي لشراء هذا العنصر النادر", "error");
      return;
    }
    setBlackCoins((p) => p - item.price);
    playSynthSound("purchase");
    triggerCelebration(
      "blackcoin",
      "تم الحصول على مقتنى النقابة! 🏆",
      "Guild Trophy Purchased! 🏆",
      `تم شراء ${item.name} من المتجر الداخلي بنجاح.`,
      `Successfully purchased ${item.name} from the guild marketplace.`
    );
  };

  // Toggle RSVP Event
  const handleToggleRSVP = (evId: string) => {
    setCommunityEvents((prev) => prev.map((ev, _autoIdx) => {
      if (ev.id === evId) {
        const nextJoined = !ev.joined;
        if (nextJoined) {
          playSynthSound("levelup");
          triggerInAppNotification("الفعاليات", `سجلت حضورك في: ${ev.title}`, "success");
        }
        return {
          ...ev,
          joined: nextJoined,
          rsvpCount: nextJoined ? ev.rsvpCount + 1 : ev.rsvpCount - 1
        };
      }
      return ev;
    }));
  };

  // UI Theme Palettes
  const getThemeClasses = () => {
    switch (communityTheme) {
      case "void":
        return { bg: "bg-[#0A0A0A]", border: "border-zinc-800", text: "text-zinc-100", accent: "text-zinc-400", button: "bg-zinc-800 hover:bg-zinc-700" };
      case "shadow":
        return { bg: "bg-[#0E0B16]", border: "border-[#4A2E80]", text: "text-purple-100", accent: "text-[#A239CA]", button: "bg-[#4A2E80] hover:bg-[#5C399E]" };
      case "emerald":
        return { bg: "bg-[#06140E]", border: "border-emerald-800/60", text: "text-emerald-100", accent: "text-emerald-400", button: "bg-emerald-800/80 hover:bg-emerald-700" };
      case "emperor":
        return { bg: "bg-[#161206]", border: "border-amber-700/60", text: "text-amber-100", accent: "text-amber-400", button: "bg-amber-700/80 hover:bg-amber-600" };
      case "flame":
      default:
        return { bg: "bg-[#0A0605]", border: "border-orange-900/60", text: "text-orange-50", accent: "text-[#FF3D00]", button: "bg-[#FF3D00] hover:bg-orange-700" };
    }
  };

  const themeStyle = getThemeClasses();
  const selectedCommunity = communities.find((c) => c.id === activeCommunityId);

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-gray-200">
      
      {/* HEADER SECTION (11.1) */}
      <div className="p-4 bg-[#090909] border-b border-[#222] flex justify-between items-center z-10">
        <div>
          <h1 className="text-base font-black text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3D00] animate-pulse" />
            {isArabic ? "منصة المجتمعات المتكاملة" : "Anime Black Communities"}
          </h1>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {isArabic ? "مجموعات • قنوات • نقابات • عوالم مترابطة" : "Groups • Channels • Guilds • Spaces"}
          </p>
        </div>

        {/* Create Community Trigger (11.2) */}
        <button
          onClick={() => {
            playSynthSound("tap");
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF3D00] hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-orange-600/20">
          
          <Plus className="w-4 h-4" />
          {isArabic ? "إنشاء مجتمع" : "Establish Space"}
        </button>
      </div>

      {/* SEARCH AND FILTERS (11.15) */}
      {!activeCommunityId &&
      <div className="p-3 bg-[#0A0A0A] border-b border-[#1A1A1A] space-y-3">
          {/* Search bar */}
          <div className="relative">
            <input
            type="text"
            placeholder={isArabic ? "البحث في كل عوالم ومجموعات أنمي بلاك..." : "Search spaces, guilds, and groups..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] text-xs px-4 py-2.5 pl-10 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF3D00] transition-colors" />
          
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          </div>

          {/* Filter Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
          { id: "all", label: isArabic ? "الكل" : "All", icon: Globe },
          { id: "group", label: isArabic ? "👥 مجموعات" : "Groups", icon: Users },
          { id: "channel", label: isArabic ? "📢 قنوات" : "Channels", icon: Radio },
          { id: "guild", label: isArabic ? "🏰 نقابات" : "Guilds", icon: Castle },
          { id: "space", label: isArabic ? "🌍 عوالم" : "Spaces", icon: Globe }].
          map((type, _autoIdx) =>
          <button
            key={`${type.id}_${_autoIdx}`}
            onClick={() => {
              playSynthSound("tap");
              setFilterType(type.id as any);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
            filterType === type.id ?
            "bg-[#FF3D00] text-white" :
            "bg-[#141414] border border-zinc-800 hover:bg-zinc-800 text-zinc-400"}`
            }>
            
                <type.icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
          )}
          </div>
        </div>
      }

      {/* COMMUNITIES LIST VIEW */}
      {!activeCommunityId ?
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase">
            {isArabic ? "العوالم والمجموعات المتاحة" : "Available Arenas & Hubs"}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {communities.
          filter((c) => filterType === "all" || c.type === filterType).
          filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())).
          map((comm, _autoIdx) =>
          <div
            key={`${comm.id}_${_autoIdx}`}
            className="bg-[#0C0C0C] border border-zinc-900 rounded-2xl overflow-hidden hover:border-[#FF3D00]/40 transition-all flex flex-col relative group">
            
                  {/* Cover Header */}
                  <div className="h-16 w-full relative">
                    <img src={comm.cover} alt="cover" className="w-full h-full object-cover brightness-50" />
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] text-zinc-300 border border-zinc-800 font-mono">
                      {comm.category}
                    </span>
                    {comm.type === "guild" &&
              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" /> Level {comm.level}
                      </span>
              }
                  </div>

                  {/* Info Row */}
                  <div className="p-3 pt-0 flex-1 flex flex-col relative">
                    {/* Avatar placement */}
                    <div className="flex items-end gap-3 -mt-6 mb-2">
                      <div className="relative">
                        <img src={comm.avatar} alt="avatar" className="w-12 h-12 rounded-xl object-cover border-2 border-[#0C0C0C] shadow-lg shadow-black/80" />
                        {comm.verified &&
                  <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-black" title="Verified Community">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                  }
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                          {comm.name}
                        </h3>
                        <p className="text-[9px] text-zinc-500">@{comm.username}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                      {comm.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 my-2">
                      {comm.tags.map((tag, _autoIdx) =>
                <span key={`${tag}_${_autoIdx}`} className="text-[8px] bg-[#141414] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 font-mono">
                          #{tag}
                        </span>
                )}
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-zinc-900/80 my-2" />

                    {/* Bottom stats & join buttons */}
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5" /> {comm.membersCount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-[#FF3D00] bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-900/40 font-bold uppercase tracking-wider">
                          {comm.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {comm.joiningFee > 0 && !comm.isJoined &&
                  <span className="text-[9px] text-amber-500 flex items-center gap-1 font-bold">
                            <Coins className="w-3.5 h-3.5" /> {comm.joiningFee}
                          </span>
                  }

                        <button
                    onClick={() => {
                      playSynthSound("tap");
                      handleJoinLeaveCommunity(comm);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    comm.isJoined ?
                    "bg-transparent border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-900" :
                    "bg-[#FF3D00]/20 border-[#FF3D00]/60 text-white hover:bg-[#FF3D00]"}`
                    }>
                    
                          {comm.isJoined ? isArabic ? "مغادرة" : "Leave" : isArabic ? "انضمام" : "Join"}
                        </button>

                        {comm.isJoined &&
                  <button
                    onClick={() => {
                      playSynthSound("success");
                      triggerHapticFeedback("levelup");
                      setActiveCommunityId(comm.id);
                      setActiveTab("chat");
                    }}
                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white p-1 rounded-lg transition-colors"
                    title="Open Hub">
                    
                            <ChevronRight className="w-4 h-4" />
                          </button>
                  }
                      </div>
                    </div>
                  </div>
                </div>
          )}
          </div>
        </div> : (


      /* DETAILED COMMUNITY VIEW */
      selectedCommunity &&
      <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
            {/* Header / Passport (11.4 & 11.9) */}
            <div className="p-3 bg-[#0E0E0E] border-b border-zinc-900 flex items-center gap-3 relative">
              <button
            onClick={() => {
              playSynthSound("tap");
              setActiveCommunityId(null);
            }}
            className="bg-[#141414] hover:bg-zinc-800 text-zinc-400 p-2 rounded-xl transition-colors">
            
                {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>

              <div className="relative">
                <img src={selectedCommunity.avatar} alt="logo" className="w-10 h-10 rounded-xl object-cover border border-zinc-800" />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${selectedCommunity.isJoined ? "bg-green-500" : "bg-zinc-500"}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-black text-white truncate">{selectedCommunity.name}</h2>
                  {selectedCommunity.verified && <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20" />}
                </div>
                <p className="text-[9px] text-zinc-500">@{selectedCommunity.username} • {selectedCommunity.category}</p>
              </div>

              {/* Progress Level bar inside detailed view (11.11) */}
              <div className="hidden sm:flex flex-col items-end gap-1 text-[9px]">
                <div className="flex items-center gap-1 font-bold text-orange-400">
                  <Award className="w-3.5 h-3.5" /> {isArabic ? "مستوى المجتمع:" : "Hub Lvl:"} {selectedCommunity.level}
                </div>
                <div className="w-24 bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div className="bg-orange-500 h-1" style={{ width: `${selectedCommunity.xp / 1000 * 100}%` }} />
                </div>
              </div>

              {/* Community Theme Palette & AI Summarize Triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSummarizeCommunityChat}
                  className="bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900 p-2 rounded-xl text-purple-300 flex items-center gap-1 text-[9px] font-bold"
                  title="تلخيص المحادثة بالذكاء الاصطناعي">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden md:inline">{isArabic ? "تلخيص AI" : "AI Summary"}</span>
                </button>
                <button
                  onClick={() => {
                    const themes = ["flame", "void", "shadow", "emerald", "emperor"];
                    const nextIndex = (themes.indexOf(communityTheme) + 1) % themes.length;
                    setCommunityTheme(themes[nextIndex]);
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                  }}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 p-2 rounded-xl text-zinc-400"
                  title="Weave Community Palette">
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                </button>
              </div>
            </div>

            {/* TAB REORDER / SELECTION NAVIGATION (11.5) */}
            <div className="bg-[#0C0C0C] border-b border-zinc-900 flex gap-1 overflow-x-auto p-1.5 scrollbar-none">
              {tabOrder.map((tabId, _autoIdx) => {
            // Determine label / icon
            let label = "";
            let showTab = true;

            // Restrict tabs if not guild/space
            if (tabId === "voice" && selectedCommunity.type !== "guild" && selectedCommunity.type !== "space") showTab = false;
            if (tabId === "marketplace" && selectedCommunity.type !== "guild" && selectedCommunity.type !== "space") showTab = false;

            switch (tabId) {
              case "chat":label = isArabic ? "💬 دردشة" : "Chat";break;
              case "posts":label = isArabic ? "📝 منشورات" : "Posts";break;
              case "announcements":label = isArabic ? "📢 إعلانات" : "News";break;
              case "wiki":label = isArabic ? "📚 ويكي" : "Wiki";break;
              case "events":label = isArabic ? "📅 فعاليات" : "Events";break;
              case "files":label = isArabic ? "📦 ملفات" : "Files";break;
              case "voice":label = isArabic ? "🔊 صوتية" : "Voice";break;
              case "marketplace":label = isArabic ? "🛍️ متجر" : "Shop";break;
              case "members":label = isArabic ? "👥 أعضاء" : "Members";break;
              case "analytics":label = isArabic ? "📊 إحصائيات" : "Analytics";break;
              case "moderation":label = isArabic ? "🛡️ بلاغات وعقوبات" : "Moderation";break;
              case "settings":label = isArabic ? "⚙️ إعدادات" : "Settings";break;
            }

            if (!showTab) return null;

            return (
              <button
                key={`comm_tab_${tabId}_${_autoIdx}`}
                onClick={() => {
                  playSynthSound("tap");
                  setActiveTab(tabId);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tabId ?
                "bg-[#FF3D00] text-white shadow-md" :
                "bg-transparent text-zinc-400 hover:text-white"}`
                }>
                
                    {label}
                  </button>);

          })}
            </div>

            {/* TAB INTERACTIVE WINDOW CONTENTS */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col">
              
              {/* TAB: CHAT (11.5 & 11.10) */}
              {activeTab === "chat" && (() => {
            const isChannelContext = selectedCommunity.type === "channel" ||
            (selectedCommunity.type === "space" || selectedCommunity.type === "guild") &&
            (selectedCommunity.type === "space" ? spaceSubRooms : [
            { id: "sr1", type: "chat" },
            { id: "sr2", type: "channel" },
            { id: "sr3", type: "voice" }]).
            find((r) => r.id === activeSubRoomId)?.type === "channel";

            const isUserAdminOrOwner = currentUser.role === "Owner" || currentUser.role === "Admin" || currentUser.username === selectedCommunity.creator || currentUser.username === "taymour_owner" || currentUser.username === "mora_admin";

            const canUserPost = !isChannelContext || isUserAdminOrOwner;

            return (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    
                    {/* Pinned Announcement bar */}
                    <div className="mb-2 p-2 bg-orange-950/20 border border-orange-900/40 rounded-xl flex items-center gap-2">
                      <Pin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 animate-pulse" />
                      <p className="text-[9px] text-zinc-300 truncate">
                        {isArabic ? "مثبّت: يرجى الالتزام بالقوانين العامة وعدم حرق الفصول!" : "Pinned: Follow rules and do not leak mangas!"}
                      </p>
                    </div>

                    {/* If selectedCommunity is Space or Guild, show sub-room pills */}
                    {(selectedCommunity.type === "space" || selectedCommunity.type === "guild") &&
                <div className="flex gap-1 overflow-x-auto pb-2 mb-2 border-b border-zinc-900 scrollbar-none shrink-0">
                        {(selectedCommunity.type === "space" ? spaceSubRooms : [
                  { id: "sr1", name: isArabic ? "💬 الديوان الرئيسي" : "💬 Main Chamber", type: "chat" },
                  { id: "sr2", name: isArabic ? "📢 إعلانات الفيلق" : "📢 Legion Bulletins", type: "channel" },
                  { id: "sr3", name: isArabic ? "🔊 مجلس الحرب" : "🔊 Council Chamber", type: "voice" }]).
                  map((room, _autoIdx) =>
                  <button
                    key={`${room.id}_${_autoIdx}`}
                    onClick={() => {
                      playSynthSound("tap");
                      setActiveSubRoomId(room.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black whitespace-nowrap transition-all border ${
                    activeSubRoomId === room.id ?
                    "bg-[#FF3D00]/10 border-[#FF3D00] text-orange-400" :
                    "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"}`
                    }>
                    
                            {room.name}
                          </button>
                  )}
                      </div>
                }

                  {/* Theme settings shortcut button inside chat */}
                  <div className="mb-2 flex justify-between items-center bg-[#090909] p-2 rounded-xl border border-zinc-900/60">
                    <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                      🎨 {isArabic ? "تخصيص نمط المحادثة" : "Customize Chat Wallpaper"}
                    </span>
                    <button
                    onClick={() => {
                      playSynthSound("levelup");
                      setShowThemeSettings(!showThemeSettings);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[8px] font-black px-2.5 py-1 rounded-lg text-orange-400">
                    
                      {isArabic ? "تغيير الخلفية والفقاعات" : "Change BG & Bubble"}
                    </button>
                  </div>

                  {/* Quick Theme Settings Drawer */}
                  <AnimatePresence>
                    {showThemeSettings &&
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3 mb-2 shrink-0 z-20">
                    
                        <div>
                          <p className="text-[9px] font-bold text-zinc-400 mb-1.5">🫧 {isArabic ? "اختر لون الفقاعة الفاخرة" : "Choose Custom Bubble Style"}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {PREMIUM_BUBBLE_COLORS.map((color, _autoIdx) =>
                        <button
                          key={`${color.id}_${_autoIdx}`}
                          onClick={() => {
                            playSynthSound("purchase");
                            setCurrentUserBubbleColor(color.id);
                            localStorage.setItem("community_bubble_color_user", color.id);
                            triggerInAppNotification(
                              isArabic ? "تم تجهيز الفقاعة" : "Bubble Equipped",
                              isArabic ? `تم تفعيل ستايل فقاعة "${color.name}"` : `Equipped "${color.nameEn}"`
                            );
                          }}
                          className={`px-2 py-1 text-[8px] font-bold rounded-lg transition-all border ${
                          currentUserBubbleColor === color.id ?
                          "border-orange-500 bg-orange-950/20 text-orange-400" :
                          "border-zinc-800 bg-zinc-900 text-zinc-400"}`
                          }>
                          
                                {isArabic ? color.name : color.nameEn}
                              </button>
                        )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] font-bold text-zinc-400 mb-1.5">🖼️ {isArabic ? "اختر ورق حائط أوتـاكو" : "Choose Chat Wallpaper Preset"}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                          onClick={() => {
                            playSynthSound("tap");
                            setActiveChatBg("");
                            localStorage.removeItem("community_chat_bg_default");
                          }}
                          className={`px-2 py-1 text-[8px] font-bold rounded-lg border ${
                          !activeChatBg ? "border-orange-500 bg-orange-950/20 text-orange-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"}`
                          }>
                          
                              {isArabic ? "افتراضي داكن" : "Default Dark"}
                            </button>
                            {PRESET_CHAT_BACKGROUNDS.map((bg, _autoIdx) =>
                        <button
                          key={`${bg.id}_${_autoIdx}`}
                          onClick={() => {
                            playSynthSound("levelup");
                            setActiveChatBg(bg.url);
                            localStorage.setItem("community_chat_bg_default", bg.url);
                            triggerInAppNotification(
                              isArabic ? "تم تغيير الخلفية" : "Wallpaper Set",
                              isArabic ? `تم تطبيق خلفية "${bg.name}"` : `Wallpaper "${bg.nameEn}" applied!`
                            );
                          }}
                          className={`px-2 py-1 text-[8px] font-bold rounded-lg border ${
                          activeChatBg === bg.url ? "border-orange-500 bg-orange-950/20 text-orange-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"}`
                          }>
                          
                                {isArabic ? bg.name : bg.nameEn}
                              </button>
                        )}
                          </div>
                        </div>
                      </motion.div>
                  }
                  </AnimatePresence>

                  {/* Message Log */}
                  <div
                  className="flex-1 overflow-y-auto space-y-3 p-3 mb-2 rounded-2xl border border-zinc-900 relative"
                  style={{
                    backgroundImage: activeChatBg ? `url(${activeChatBg})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}>
                  
                    {activeChatBg && <div className="absolute inset-0 bg-black/70 backdrop-blur-[0.5px] rounded-2xl pointer-events-none" />}
                    
                    <div className="relative z-10 space-y-3">
                      {(() => {
                      const activeChatRoomKey = selectedCommunity?.type === "space" || selectedCommunity?.type === "guild" ?
                      `${activeCommunityId}_${activeSubRoomId}` :
                      activeCommunityId;

                      return (messages[activeChatRoomKey] || []).map((msg, mIdx) => {
                        const isSystem = msg.sender === "system";
                        const isCurrentUser = msg.sender === "user" || msg.senderId === currentUser.uid;

                        if (isSystem) {
                          return (
                            <div key={msg.id ? `comm_sys_${msg.id}_${mIdx}` : `comm_sys_${mIdx}`} className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-900 flex items-center justify-center text-center">
                                <span className="text-[9px] text-zinc-500 font-bold">{msg.text}</span>
                              </div>);

                        }

                        const bubbleColorConfig = msg.bubbleColor ? PREMIUM_BUBBLE_COLORS.find((b) => b.id === msg.bubbleColor) : null;
                        const bubbleClass = isCurrentUser ?
                        bubbleColorConfig ? `${bubbleColorConfig.class} rounded-tr-none border-zinc-800/20` : "bg-[#FF3D00] text-white border-orange-700 rounded-tr-none" :
                        bubbleColorConfig ? `${bubbleColorConfig.class} rounded-tl-none border-zinc-800/20` : "bg-zinc-900 text-zinc-200 border-zinc-800 rounded-tl-none";

                        return (
                          <div key={msg.id ? `comm_msg_${msg.id}_${mIdx}` : `comm_msg_${mIdx}`} className="relative w-full overflow-visible group select-none py-1 px-1">
                              {/* Swipe indicator icons background */}
                              <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none transition-all duration-150 ${isCurrentUser ? "left-4" : "right-4"}`}>
                                <Reply className="w-5 h-5 text-[#FF3D00] opacity-0 group-hover:opacity-40" />
                              </div>

                              {/* Swipable row container */}
                              <motion.div
                              drag="x"
                              dragDirectionLock
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.4}
                              onDragEnd={(event, info) => {
                                // Trigger reply if swiped significantly left or right
                                if (Math.abs(info.offset.x) > 60) {
                                  playSynthSound("tap");
                                  if (triggerHapticFeedback) triggerHapticFeedback("tap");
                                  setReplyingToMessage({
                                    id: msg.id,
                                    text: msg.text,
                                    senderName: msg.senderName
                                  });
                                }
                              }}
                              className={`flex items-start gap-2.5 ${isCurrentUser ? "flex-row-reverse" : ""} relative z-10 w-full cursor-grab active:cursor-grabbing`}>
                              
                                <img
                                src={msg.avatar}
                                alt="sender avatar"
                                className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('openProfile', { detail: msg.senderId }));
                                }} />
                              
                              <div className={`max-w-[75%] space-y-0.5 flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold text-white">{msg.senderName}</span>
                                  <LevelBadge
                                    level={msg.userLevel || (msg.role === "Owner" ? 120 : msg.role === "Admin" ? 85 : msg.role === "Moderator" ? 48 : msg.role === "Intern" ? 22 : 12)}
                                    isArabic={isArabic}
                                    size="xs"
                                    showTitle={false}
                                  />
                                  {msg.roleBadge &&
                                  <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 rounded font-black">
                                      {msg.roleBadge}
                                    </span>
                                  }
                                </div>

                                {/* Reply Preview Box */}
                                {msg.replyTo &&
                                <div className="bg-zinc-950/90 border-l-2 border-[#FF3D00] rounded-lg p-1.5 mb-0.5 text-[9px] text-zinc-400 max-w-xs shrink-0 self-stretch">
                                    <div className="font-extrabold text-[#FF3D00]">{msg.replyTo.senderName}</div>
                                    <div className="truncate text-[8px]">{msg.replyTo.text}</div>
                                  </div>
                                }
                                
                                {editingGroupMessageId === msg.id ?
                                <div className="flex flex-col gap-1.5 mt-1 bg-zinc-950/40 p-2 rounded-xl border border-zinc-800 max-w-[280px]">
                                    <input
                                    type="text"
                                    value={editingGroupMessageText}
                                    onChange={(e) => setEditingGroupMessageText(e.target.value)}
                                    className="bg-zinc-900 text-white text-[11px] p-1.5 rounded border border-zinc-700 focus:outline-none focus:border-red-500" />
                                  
                                    <div className="flex gap-1">
                                      <button
                                      onClick={() => handleEditGroupMessage(msg.id, editingGroupMessageText)}
                                      className="bg-green-600 hover:bg-green-700 text-white text-[9px] px-2 py-1 rounded">
                                      
                                        {isArabic ? "حفظ" : "Save"}
                                      </button>
                                      <button
                                      onClick={() => setEditingGroupMessageId(null)}
                                      className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[9px] px-2 py-1 rounded">
                                      
                                        {isArabic ? "إلغاء" : "Cancel"}
                                      </button>
                                    </div>
                                  </div> :

                                <div className={`p-2.5 rounded-2xl text-xs leading-relaxed border ${bubbleClass}`}>
                                    <div>{msg.text}</div>
                                    {msg.isEdited &&
                                  <span className="text-[9px] opacity-60 italic font-mono mx-1">
                                        ({isArabic ? "معدل" : "edited"})
                                      </span>
                                  }

                                    {/* Translation Block */}
                                    {msg.translatedText &&
                                  <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[10px] italic text-amber-200">
                                        <p className="font-bold text-[8px] opacity-70">Shinobi Translate AI:</p>
                                        {msg.translatedText}
                                      </div>
                                  }

                                    {/* Attachment Types inside Bubble */}
                                    {msg.media &&
                                  <div className="mt-2 text-white">
                                        {msg.media.type === "voicenote" &&
                                    <VoiceNotePlayer
                                      url={msg.media.url || "https://animeblack.com/audio/voice.mp3"}
                                      isMe={isCurrentUser}
                                      isArabic={isArabic}
                                      durationLabel={msg.media.duration || "0:05"} />

                                    }

                                        {msg.media.type === "image" &&
                                    <div className="rounded-xl overflow-hidden border border-zinc-800 max-w-[180px]">
                                            <img src={msg.media.url} alt="Attached image" className="w-full h-auto object-cover max-h-[140px]" referrerPolicy="no-referrer" />
                                          </div>
                                    }

                                        {msg.media.type === "file" &&
                                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center gap-2 max-w-[180px]">
                                            <FileText className="w-5 h-5 text-[#FF3D00] flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[10px] font-black text-zinc-300 truncate">{msg.media.name}</p>
                                              <p className="text-[8px] text-zinc-500 font-mono">{msg.media.size}</p>
                                            </div>
                                          </div>
                                    }

                                        {msg.media.type === "location" &&
                                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center gap-2 max-w-[180px]">
                                            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[10px] font-black text-zinc-300 truncate">{msg.media.name}</p>
                                              <p className="text-[8px] text-zinc-500 font-mono">{msg.media.coords}</p>
                                            </div>
                                          </div>
                                    }

                                        {msg.media.type === "sticker" &&
                                    <div className="text-4xl p-1 animate-bounce">
                                            {msg.media.emoji}
                                          </div>
                                    }

                                        {msg.media.type === "card" && msg.media.cardData &&
                                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-850 text-left space-y-1">
                                            <div className="flex items-center gap-1.5">
                                              <img src={msg.media.cardData.avatar} alt="card avatar" className="w-6 h-6 rounded-full object-cover" />
                                              <div>
                                                <p className="text-[9px] font-bold text-white">{isArabic ? msg.media.cardData.name : msg.media.cardData.nameEn}</p>
                                                <p className="text-[7px] text-[#FF3D00]">{msg.media.cardData.class}</p>
                                              </div>
                                            </div>
                                            <div className="text-[7px] text-zinc-500 font-mono">
                                              COMBAT: {msg.media.cardData.power}
                                            </div>
                                          </div>
                                    }
                                      </div>
                                  }
                                  </div>
                                }

                                {/* Disappearing Timer Banner */}
                                {msg.expiresAt &&
                                <div className="text-[8px] text-red-400 font-mono mt-0.5 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 animate-spin" />
                                    <span>{isArabic ? "رسالة مؤقتة نشطة" : "Active Self-Destructing Message"}</span>
                                  </div>
                                }

                                {/* Reactions Rendering */}
                                {msg.reactions && Object.keys(msg.reactions).length > 0 &&
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(msg.reactions).map(([emoji, users]: [string, any], _autoIdx) => {
                                    const hasVoted = users.includes(currentUser.username);
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleAddReaction(msg.id, emoji)}
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border transition-all ${
                                        hasVoted ?
                                        "bg-orange-950/40 border-orange-700 text-orange-400" :
                                        "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white"}`
                                        }>
                                        
                                          <span>{emoji}</span>
                                          <span>{users.length}</span>
                                        </button>);

                                  })}
                                  </div>
                                }

                                {/* Bubble Footer Actions */}
                                <div className="flex items-center gap-2 text-[8px] text-zinc-600 font-mono mt-1 flex-wrap justify-end">
                                  <span>{msg.timestamp}</span>
                                  {isCurrentUser && (
                                    <span className="inline-flex items-center text-[#38BDF8]" title={isArabic ? "تم التسليم والقراءة" : "Read"}>
                                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </span>
                                  )}
                                  
                                  <button
                                    onClick={() => handleSpeak(msg.id, msg.text)}
                                    className="text-zinc-500 hover:text-white flex items-center gap-0.5"
                                    title="Speech Synthesizer">
                                    
                                    <Volume2 className="w-2.5 h-2.5" />
                                    {isSpeakingMsgId === msg.id ? "كتم" : "قراءة"}
                                  </button>

                                  <span className="text-zinc-800">•</span>
                                  <button
                                    onClick={async () => {
                                      playSynthSound("tap");
                                      const hasAr = /[\u0600-\u06FF]/.test(msg.text);
                                      const targetLang = hasAr ? "en" : "ar";
                                      try {
                                        const response = await fetch("/api/ai/translate", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ text: msg.text, targetLanguage: targetLang })
                                        });
                                        const data = await response.json();
                                        if (data.result) {
                                          setMessages((prev) => {
                                            const list = prev[activeChatRoomKey] || [];
                                            const updated = list.map((m, _autoIdx) => m.id === msg.id ? { ...m, translatedText: data.result } : m);
                                            return { ...prev, [activeChatRoomKey]: updated };
                                          });
                                          playSynthSound("success");
                                        }
                                      } catch (e) {
                                        triggerInAppNotification("AI Translation", "Translation failure");
                                      }
                                    }}
                                    className="text-zinc-500 hover:text-white flex items-center gap-0.5"
                                    title="Translate">
                                    
                                    <Languages className="w-2.5 h-2.5" />
                                    {isArabic ? "ترجمة" : "Translate"}
                                  </button>

                                  <span className="text-zinc-800">•</span>
                                  <button
                                    onClick={() => {
                                      playSynthSound("tap");
                                      setReplyingToMessage(msg);
                                    }}
                                    className="text-zinc-500 hover:text-white flex items-center gap-0.5"
                                    title="Reply">
                                    
                                    <Reply className="w-2.5 h-2.5" />
                                    {isArabic ? "رد" : "Reply"}
                                  </button>

                                  {/* Quick Reaction Selectors */}
                                  <span className="text-zinc-800">•</span>
                                  <div className="flex items-center gap-1 bg-zinc-950/40 px-1 rounded-full border border-zinc-900">
                                    {["👍", "🔥", "❤️", "⚔️"].map((emoji, _autoIdx) =>
                                    <button
                                      key={`${emoji}_${_autoIdx}`}
                                      onClick={() => handleAddReaction(msg.id, emoji)}
                                      className="hover:scale-125 transition-all text-[10px] filter saturate-75 hover:saturate-100">
                                      
                                        {emoji}
                                      </button>
                                    )}
                                  </div>

                                  {isCurrentUser && editingGroupMessageId !== msg.id &&
                                  <>
                                      <span className="text-zinc-800">•</span>
                                      <button
                                      onClick={() => {
                                        setEditingGroupMessageId(msg.id);
                                        setEditingGroupMessageText(msg.text);
                                      }}
                                      className="text-zinc-500 hover:text-white">
                                      
                                        {isArabic ? "تعديل" : "Edit"}
                                      </button>
                                      <span className="text-zinc-800">•</span>
                                      <button
                                      onClick={() => {
                                        if (confirm(isArabic ? "هل تريد سحب رسالتك من المجموعة للجميع؟" : "Are you sure you want to unsend your message for everyone?")) {
                                          handleDeleteGroupMessage(msg.id);
                                        }
                                      }}
                                      className="text-red-500/80 hover:text-red-400">
                                      
                                        {isArabic ? "سحب الرسالة" : "Unsend"}
                                      </button>
                                    </>
                                  }
                                </div>
                              </div>
                            </motion.div>
                          </div>);

                      });
                    })()}
                    </div>
                  </div>
                  {/* Replying Preview Box */}
                  {replyingToMessage &&
                <div className="mx-3 mb-2 p-2 bg-[#FF3D00]/10 border border-[#FF3D00]/40 rounded-xl flex items-center justify-between z-10 shrink-0">
                      <div className="flex items-center gap-2">
                        <Reply className="w-3.5 h-3.5 text-[#FF3D00]" />
                        <div className="text-[10px] text-zinc-300">
                          <span className="font-bold text-white">{isArabic ? "رد على رسالة: " : "Reply to: "}</span>
                          <span className="italic">"{replyingToMessage.text}"</span>
                        </div>
                      </div>
                      <button
                    onClick={() => setReplyingToMessage(null)}
                    className="text-zinc-500 hover:text-white text-xs font-bold px-1.5">
                    
                        ✕
                      </button>
                    </div>
                }

                  {/* Message Input with channel check */}
                  {canUserPost ?
                <CommunitiesChatInput
                  isArabic={isArabic}
                  onSendMessage={(text) => handleSendMessage(text)}
                  characterCardStats={characterCardStats}
                  setCharacterCardStats={setCharacterCardStats}
                  aiSmartReplies={aiSmartReplies}
                  setAiSmartReplies={setAiSmartReplies}
                  onGetSmartReplies={handleGetSmartReplies}
                  loadingSmartReplies={loadingSmartReplies} /> :


                <div className="p-3.5 mx-3 mb-2 bg-zinc-950/80 border border-zinc-900 text-center rounded-2xl text-[10px] text-zinc-500 font-extrabold flex items-center justify-center gap-1.5 shrink-0 select-none">
                      <span>🔒</span>
                      <span>{isArabic ? "قناة بث: فقط المالكون والمشرفون يمكنهم الكتابة هنا" : "Broadcast Channel: Only Owners and Admins can broadcast here"}</span>
                    </div>
                }
                </div>);
          })()}

              {/* TAB: POSTS (11.5) */}
              {activeTab === "posts" &&
          <div className="space-y-4">
                  {/* Submit mini-post */}
                  <div className="bg-[#0F0F0F] border border-zinc-900 p-3 rounded-2xl space-y-2">
                    <textarea
                      dir="auto"
                      placeholder={isArabic ? "شارك فكرة أو سؤال في ساحة المجتمع..." : "Share a thought or discussion point..."}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none h-16 leading-relaxed" />
              
                    <div className="flex justify-end">
                      <button
                  onClick={handlePostInCommunity}
                  className="bg-[#FF3D00] hover:bg-orange-600 text-[10px] font-black px-4 py-1.5 rounded-xl text-white transition-all transform active:scale-95">
                  
                        {isArabic ? "نشر الموضوع" : "Submit Topic"}
                      </button>
                    </div>
                  </div>

                  {/* List of discussions */}
                  <div className="space-y-3">
                    {communityPosts.map((post, _autoIdx) =>
              <div key={`${post.id}_${_autoIdx}`} className="bg-[#0C0C0C] border border-zinc-900 p-3.5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2.5">
                          <img src={post.author.avatar} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
                          <span className="text-xs font-bold text-white">{post.author.name}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold pt-1">
                          <button
                    onClick={() => {
                      playSynthSound("success");
                      triggerHapticFeedback("tap");
                      setCommunityPosts((prev) => prev.map((p, _autoIdx) => p.id === post.id ? { ...p, upvotes: p.upvotes + 1 } : p));
                    }}
                    className="flex items-center gap-1.5 text-orange-400 hover:text-white">
                    
                            ▲ {post.upvotes} {isArabic ? "تصويت" : "Upvotes"}
                          </button>
                          <span>💬 {post.commentsCount} {isArabic ? "تعليقات" : "Comments"}</span>
                        </div>
                      </div>
              )}
                  </div>
                </div>
          }

              {/* TAB: ANNOUNCEMENTS (11.5 & 11.14) */}
              {activeTab === "announcements" &&
          <div className="space-y-4">
                  {channelPosts.map((post, _autoIdx) =>
            <div key={`${post.id}_${_autoIdx}`} className="bg-[#0C0C0C] border border-zinc-900 rounded-2xl overflow-hidden">
                      <img src={post.image} alt="post" className="w-full h-40 object-cover" />
                      <div className="p-4 space-y-2">
                        <h3 className="text-xs font-black text-white">{post.title}</h3>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">{post.content}</p>

                        {/* Poll Widget inside Channel Post */}
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                          <div className="text-[10px] font-bold text-orange-400">{post.votes.question}</div>
                          {post.votes.options.map((opt: any, idx: number) =>
                  <button
                    key={idx}
                    onClick={() => {
                      playSynthSound("success");
                      triggerHapticFeedback("tap");
                      setChannelPosts((prev) => prev.map((p, _autoIdx) => {
                        if (p.id === post.id) {
                          const nextOpts = [...p.votes.options];
                          nextOpts[idx].count += 1;
                          return {
                            ...p,
                            votes: { ...p.votes, options: nextOpts }
                          };
                        }
                        return p;
                      }));
                    }}
                    className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-[10px] text-zinc-300 flex justify-between items-center transition-colors">
                    
                              <span>{opt.text}</span>
                              <span className="font-mono text-zinc-500">{opt.count} v</span>
                            </button>
                  )}
                        </div>

                        {/* Comments Drawer Indicator */}
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold pt-2">
                          <div className="flex gap-3">
                            <span>🔥 {post.reactions["🔥"]}</span>
                            <span>😢 {post.reactions["😢"]}</span>
                          </div>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
            )}
                </div>
          }

              {/* TAB: WIKI (11.16) */}
              {activeTab === "wiki" &&
          <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#0F0F0F] p-3 rounded-2xl border border-zinc-900">
                    <div>
                      <h3 className="text-xs font-black text-white">{isArabic ? "موسوعة الأوتـاكو الشاملة" : "Community Knowledge Wiki"}</h3>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "دليل القوانين والشروحات العامة للمجتمع" : "Rulebook, history pages, guides"}</p>
                    </div>
                    <button
                onClick={() => {
                  playSynthSound("tap");
                  setShowWikiEditModal(true);
                }}
                className="bg-[#FF3D00] hover:bg-orange-600 text-[9px] font-bold px-3 py-1.5 rounded-xl text-white flex items-center gap-1">
                
                      <Plus className="w-3.5 h-3.5" /> {isArabic ? "إضافة صفحة" : "New Page"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {wikiPages.map((page, _autoIdx) =>
              <div key={`${page.id}_${_autoIdx}`} className="bg-[#0C0C0C] border border-zinc-900 p-3.5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono uppercase">
                            {page.category}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-mono">Edited: {page.date}</span>
                        </div>
                        <h4 className="text-xs font-black text-white">{page.title}</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{page.content}</p>
                        <div className="text-[8px] text-zinc-500 font-bold">
                          {isArabic ? "المحرر الأخير:" : "Last editor:"} @{page.lastEditedBy}
                        </div>
                      </div>
              )}
                  </div>
                </div>
          }

              {/* TAB: EVENTS (11.5) */}
              {activeTab === "events" &&
          <div className="space-y-3">
                  {communityEvents.map((ev, _autoIdx) =>
            <div key={`${ev.id}_${_autoIdx}`} className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#FF3D00]" />
                          {ev.title}
                        </h3>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1">{ev.date}</p>
                        <div className="flex gap-2 text-[9px]">
                          <span className="text-orange-400 font-bold">💎 {ev.reward}</span>
                          <span className="text-zinc-500 font-mono">{ev.rsvpCount} {isArabic ? "حضور" : "Attending"}</span>
                        </div>
                      </div>

                      <button
                onClick={() => {
                  playSynthSound("tap");
                  handleToggleRSVP(ev.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                ev.joined ?
                "bg-transparent border border-[#FF3D00] text-[#FF3D00]" :
                "bg-[#FF3D00] hover:bg-orange-600 text-white"}`
                }>
                
                        {ev.joined ? isArabic ? "سألغي الانضمام" : "Cancel RSVP" : isArabic ? "سأنضم للفعالية" : "Attend Event"}
                      </button>
                    </div>
            )}
                </div>
          }

              {/* TAB: FILES (11.5) */}
              {activeTab === "files" &&
          <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#0F0F0F] p-3 rounded-2xl border border-zinc-900">
                    <span className="text-xs font-bold text-white">{isArabic ? "مستودع الملفات المشترك" : "Shared Documents Hub"}</span>
                    <button
                onClick={() => {
                  playSynthSound("levelup");
                  const newFile = { name: "خلفيات الأنمي الفخمة بدقة 4K.zip", size: "124 MB", downloads: 0, uploader: currentUser.username };
                  setSharedFiles([newFile, ...sharedFiles]);
                  triggerInAppNotification("رفع ملف", "تم رفع الملف بنجاح إلى مستودع المجتمع!", "success");
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold px-3 py-1.5 rounded-xl text-white">
                
                      {isArabic ? "رفع ملف جديد" : "Upload File"}
                    </button>
                  </div>

                  {sharedFiles.map((file, idx) =>
            <div key={idx} className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-2xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-white block truncate max-w-[200px]">{file.name}</span>
                        <p className="text-[9px] text-zinc-500">{file.size} • Uploaded by @{file.uploader}</p>
                      </div>
                      <button
                onClick={() => {
                  playSynthSound("success");
                  triggerHapticFeedback("tap");
                  setSharedFiles((prev) => prev.map((f, i) => i === idx ? { ...f, downloads: f.downloads + 1 } : f));
                  triggerInAppNotification("تحميل الملف", "بدء تحميل ملفك من خوادم أنمي بلاك السريعة!", "info");
                }}
                className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 hover:bg-[#FF3D00] hover:text-white text-orange-400 px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all">
                
                        📥 Download ({file.downloads})
                      </button>
                    </div>
            )}
                </div>
          }

              {/* TAB: VOICE CHAMBERS (11.17) */}
              {activeTab === "voice" &&
          <div className="space-y-4">
                  <div className="bg-[#0F0F0F] border border-zinc-900 p-4 rounded-2xl text-center space-y-3">
                    <Mic className="w-8 h-8 mx-auto text-orange-500 animate-pulse" />
                    <div>
                      <h3 className="text-xs font-black text-white">{isArabic ? "الغرفة الصوتية للنقابة" : "Guild Live Voice Chamber"}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1">{isArabic ? "تواصل صوتياً مباشرة مع رفاقك لمناقشة التكتيكات والأخبار" : "Simulate live interactive audio chat rooms"}</p>
                    </div>

                    {!isInVoice ?
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                  onClick={() => {
                    playSynthSound("levelup");
                    triggerHapticFeedback("levelup");
                    setIsInVoice(true);
                    triggerInAppNotification("الغرفة الصوتية", "لقد دخلت الغرفة الصوتية بنجاح!", "success");
                  }}
                  className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 px-5 py-2.5 rounded-xl text-xs font-black text-white inline-flex items-center justify-center gap-1.5">
                  
                          <Play className="w-3.5 h-3.5" />
                          {isArabic ? "دخول البث الصوتي" : "Connect Audio"}
                        </button>
                        {onOpenLiveSuite &&
                <button
                  onClick={() => {
                    playSynthSound("levelup");
                    triggerHapticFeedback("levelup");
                    onOpenLiveSuite("call", selectedCommunity?.name || null);
                  }}
                  className="bg-[#FF3D00] hover:bg-[#ff551a] px-5 py-2.5 rounded-xl text-xs font-black text-white inline-flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/45 animate-pulse">
                  
                            <Video className="w-3.5 h-3.5" />
                            {isArabic ? "بث مباشر ومكالمات فيديو متطورة" : "Advanced Video/Live"}
                          </button>
                }
                      </div> :

              <div className="pt-2 border-t border-zinc-900 space-y-4">
                        {/* Audio controls */}
                        <div className="flex justify-center gap-3">
                          <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                    isMuted ?
                    "bg-red-950/40 border-red-800 text-red-500" :
                    "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`
                    }
                    title="Mute Mic">
                    
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>

                          <button
                    onClick={() => {
                      setIsScreenSharing(!isScreenSharing);
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                      triggerInAppNotification("مشاركة الشاشة", isScreenSharing ? "تم إيقاف المشاركة" : "بدء مشاركة شاشتك لأعضاء النقابة", "info");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                    isScreenSharing ?
                    "bg-blue-950/40 border-blue-800 text-blue-500" :
                    "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`
                    }
                    title="Share Screen">
                    
                            <ScreenShare className="w-4 h-4" />
                          </button>

                          <button
                    onClick={() => {
                      setRaisedHand(!raisedHand);
                      playSynthSound("tap");
                      triggerHapticFeedback("tap");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                    raisedHand ?
                    "bg-amber-950/40 border-amber-800 text-amber-500" :
                    "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"}`
                    }
                    title="Raise Hand">
                    
                            <Hand className="w-4 h-4" />
                          </button>

                          <button
                    onClick={() => {
                      playSynthSound("error");
                      setIsInVoice(false);
                      triggerInAppNotification("الغرفة الصوتية", "تم مغادرة البث الصوتي", "info");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                    
                            {isArabic ? "مغادرة" : "Disconnect"}
                          </button>
                        </div>

                        {/* Speaking list */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          {voiceUsers.map((user, uidx) =>
                  <div key={uidx} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-center relative">
                              <div className="relative inline-block">
                                <img src={user.avatar} alt="avatar" className={`w-10 h-10 rounded-full mx-auto object-cover ${user.isSpeaking ? "ring-2 ring-green-500 animate-pulse" : ""}`} />
                                {user.handUp &&
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full" title="Raised Hand">
                                    ✋
                                  </span>
                      }
                              </div>
                              <span className="text-[9px] text-zinc-300 block truncate mt-1">{user.name}</span>
                              <span className="text-[7px] text-zinc-500 block">
                                {user.isSpeaking ? "يتحدث..." : "صامت"}
                              </span>
                            </div>
                  )}
                        </div>
                      </div>
              }
                  </div>
                </div>
          }

              {/* TAB: MARKETPLACE (11.18) */}
              {activeTab === "marketplace" &&
          <div className="space-y-4">
                  <div className="bg-[#0F0F0F] border border-zinc-900 p-3 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-white">{isArabic ? "سوق النقابة والمجتمع" : "Hub Exclusive Marketplace"}</span>
                      <p className="text-[8px] text-zinc-500 mt-0.5">{isArabic ? "شراء ألقاب وإطارات مضيئة بعملات النقابة" : "Spend Black Coins for custom items"}</p>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-500 flex items-center gap-1 font-mono">
                      🪙 {blackCoins} BC
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {guildStore.map((item, _autoIdx) =>
              <div key={`${item.id}_${_autoIdx}`} className="bg-[#0C0C0C] border border-zinc-900 p-3.5 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <span className="text-xs font-black text-white block">{item.name}</span>
                            <span className="text-[8px] text-zinc-500 uppercase">{item.type}</span>
                          </div>
                        </div>

                        <button
                  onClick={() => {
                    handleBuyGuildStore(item);
                  }}
                  className="bg-[#FF3D00] hover:bg-orange-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all transform active:scale-95">
                  
                          🪙 {item.price}
                        </button>
                      </div>
              )}
                  </div>
                </div>
          }

              {/* TAB: MEMBERS (11.5 & 11.6) */}
              {activeTab === "members" &&
          <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase">
                      {isArabic ? "أعضاء مجتمع الأوتاكو" : "Otaku Hub Members"}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                  onClick={() => {playSynthSound("tap");setMembersFilter("all");}}
                  className={`text-[9px] font-black px-2 py-1 rounded transition-colors ${membersFilter === "all" ? "bg-[#FF3D00] text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                  
                        {isArabic ? "الكل" : "All"}
                      </button>
                      <button
                  onClick={() => {playSynthSound("tap");setMembersFilter("online");}}
                  className={`text-[9px] font-black px-2 py-1 rounded transition-colors flex items-center gap-1 ${membersFilter === "online" ? "bg-green-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                  
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {isArabic ? "المتصلون" : "Online"}
                      </button>
                    </div>
                  </div>

                  {communityMembers.
            filter((user) => membersFilter === "all" || user.isOnline).
            map((user, idx) =>
            <div key={idx} className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-xl flex justify-between items-center transition-all hover:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                  
                            {user.isOnline ?
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#0C0C0C] rounded-full animate-pulse" /> :

                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-zinc-600 border border-[#0C0C0C] rounded-full" />
                  }
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white block">{user.name}</span>
                              <LevelBadge level={user.level || 10} isArabic={isArabic} size="xs" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] font-black ${user.color}`}>{user.badge}</span>
                              <span className="text-[8px] text-zinc-500 font-mono">• {user.statusText}</span>
                            </div>
                          </div>
                        </div>

                        {/* Moderator interaction button if user is high rank */}
                        <button
                onClick={() => {
                  playSynthSound("error");
                  triggerHapticFeedback("tap");
                  triggerInAppNotification("نظام الرتب", `تم تحديث صلاحيات العضو ${user.name} بنجاح`, "info");
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[8px] font-bold text-zinc-500 px-2 py-1 rounded">
                
                          {isArabic ? "تعديل رتبة" : "Manage"}
                        </button>
                      </div>
            )}
                </div>
          }

              {/* TAB: ANALYTICS */}
              {activeTab === "analytics" && (() => {
                const growthData = [
                  { day: isArabic ? "الإثنين" : "Mon", members: 1120, joins: 45 },
                  { day: isArabic ? "الثلاثاء" : "Tue", members: 1180, joins: 60 },
                  { day: isArabic ? "الأربعاء" : "Wed", members: 1240, joins: 60 },
                  { day: isArabic ? "الخميس" : "Thu", members: 1320, joins: 80 },
                  { day: isArabic ? "الجمعة" : "Fri", members: 1450, joins: 130 },
                  { day: isArabic ? "السبت" : "Sat", members: 1580, joins: 130 },
                  { day: isArabic ? "الأحد" : "Sun", members: 1720, joins: 140 },
                ];

                const weeklyEngagement = [
                  { day: isArabic ? "الإثنين" : "Mon", messages: 1200, voiceMins: 320 },
                  { day: isArabic ? "الثلاثاء" : "Tue", messages: 1450, voiceMins: 410 },
                  { day: isArabic ? "الأربعاء" : "Wed", messages: 1300, voiceMins: 290 },
                  { day: isArabic ? "الخميس" : "Thu", messages: 1900, voiceMins: 580 },
                  { day: isArabic ? "الجمعة" : "Fri", messages: 2400, voiceMins: 890 },
                  { day: isArabic ? "السبت" : "Sat", messages: 2800, voiceMins: 950 },
                  { day: isArabic ? "الأحد" : "Sun", messages: 2100, voiceMins: 720 },
                ];

                const activityDistribution = [
                  { name: isArabic ? "💬 محادثات نصية" : "Text Chat", value: 62, color: "#FF3D00" },
                  { name: isArabic ? "🔊 غرف صوتية وبث" : "Voice & Stream", value: 23, color: "#3B82F6" },
                  { name: isArabic ? "📦 وسائط وملفات" : "Media & Cards", value: 15, color: "#F59E0B" },
                ];

                const CustomTooltip = ({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-950/95 border border-zinc-800 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-[10px] space-y-1">
                        <p className="font-black text-white">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={`tooltip_${index}`} className="flex items-center gap-1.5 font-mono" style={{ color: entry.color || entry.fill }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            <span>{entry.name}:</span>
                            <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                };

                return (
                  <div className="space-y-4">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-1">{isArabic ? "إجمالي الرسائل" : "Total Messages"}</span>
                        <span className="text-base font-black text-white font-mono">14.8K</span>
                        <span className="text-[8px] text-emerald-400 block mt-0.5">↑ +18% {isArabic ? "هذا الأسبوع" : "this week"}</span>
                      </div>
                      <div className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-1">{isArabic ? "الأعضاء النشطون" : "Active Members"}</span>
                        <span className="text-base font-black text-[#FF3D00] font-mono">842</span>
                        <span className="text-[8px] text-zinc-400 block mt-0.5">{isArabic ? "متواجدون اليوم" : "Today"}</span>
                      </div>
                      <div className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-1">{isArabic ? "المستوى والخبرة" : "Level & XP"}</span>
                        <span className="text-base font-black text-amber-400 font-mono">Lvl {selectedCommunity.level}</span>
                        <span className="text-[8px] text-amber-500 block mt-0.5">{selectedCommunity.xp} XP</span>
                      </div>
                      <div className="bg-[#0C0C0C] border border-zinc-900 p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-1">{isArabic ? "خزينة النقابة" : "Guild Vault"}</span>
                        <span className="text-base font-black text-yellow-400 font-mono">{guildVault.coins} BC</span>
                        <span className="text-[8px] text-zinc-400 block mt-0.5">{isArabic ? "عملات سوداء" : "Black Coins"}</span>
                      </div>
                    </div>

                    {/* Member Growth Chart (Recharts AreaChart) */}
                    <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#FF3D00]" />
                          {isArabic ? "نمو الأعضاء والانضمامات الجديدة" : "Member Growth & New Joins"}
                        </h3>
                        <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-800/40">
                          +520 {isArabic ? "عضو جديد" : "new members"}
                        </span>
                      </div>

                      <div className="h-48 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#FF3D00" stopOpacity={0.0} />
                              </linearGradient>
                              <linearGradient id="joinsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                            <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} />
                            <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="members"
                              name={isArabic ? "إجمالي الأعضاء" : "Total Members"}
                              stroke="#FF3D00"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#growthGrad)"
                            />
                            <Area
                              type="monotone"
                              dataKey="joins"
                              name={isArabic ? "انضمام جديد" : "New Joins"}
                              stroke="#10B981"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#joinsGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Engagement & Weekly Activity (Recharts BarChart & Donut Chart Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Weekly Volume BarChart */}
                      <div className="lg:col-span-2 bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          {isArabic ? "نشاط المحادثات والغرف الصوتية اليومي" : "Daily Chat & Voice Engagement"}
                        </h3>
                        <div className="h-48 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                              <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} />
                              <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar
                                dataKey="messages"
                                name={isArabic ? "الرسائل" : "Messages"}
                                fill="#FF3D00"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="voiceMins"
                                name={isArabic ? "دقائق الصوت" : "Voice Mins"}
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Donut Chart Activity Pie */}
                      <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          {isArabic ? "توزيع أنواع النشاط" : "Activity Type Breakdown"}
                        </h3>

                        <div className="h-36 w-full my-auto flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={activityDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {activityDistribution.map((entry, index) => (
                                  <Cell key={`cell_${index}`} fill={entry.color} stroke="#0C0C0C" strokeWidth={2} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                          {activityDistribution.map((item, idx) => (
                            <div key={`act_item_${idx}`} className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-zinc-300 font-bold">{item.name}</span>
                              </div>
                              <span className="font-mono text-white font-black">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Contributors Leaderboard */}
                    <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                      <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        {isArabic ? "لوحة المتصدرين والأعضاء الأكثر تفاعلاً" : "Top Contributors Leaderboard"}
                      </h3>

                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-amber-950/30 to-zinc-900/40 border border-amber-900/40 p-2.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🥇</span>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80" alt="" className="w-8 h-8 rounded-full border border-amber-500 object-cover" />
                            <div>
                              <span className="text-xs font-black text-white block">أبو تـيم السـيد 👑</span>
                              <span className="text-[8px] text-amber-400 font-mono">12,450 XP • 820 منشور</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">{isArabic ? "الإمبراطور" : "Emperor"}</span>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🥈</span>
                            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80" alt="" className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                            <div>
                              <span className="text-xs font-black text-white block">مـورا المـدير 🛡️</span>
                              <span className="text-[8px] text-zinc-400 font-mono">8,920 XP • 510 منشور</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">{isArabic ? "الجنرال" : "General"}</span>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🥉</span>
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="" className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                            <div>
                              <span className="text-xs font-black text-white block">زورو السـياف ⭐</span>
                              <span className="text-[8px] text-zinc-400 font-mono">6,100 XP • 340 منشور</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{isArabic ? "الفارس" : "Knight"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB: MODERATION & REPORTS */}
              {activeTab === "moderation" &&
          <div className="space-y-4">
                  {/* Active Member Reports */}
                  <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Flag className="w-4 h-4 text-red-500" />
                        {isArabic ? "بلاغات المخالفات المعلقة" : "Pending Member Reports"}
                      </h3>
                      <span className="text-[9px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold border border-red-900/50">
                        {reportsList.length} {isArabic ? "بلاغات" : "Reports"}
                      </span>
                    </div>

                    {reportsList.length === 0 ?
              <div className="text-center py-6 text-zinc-500 text-xs">
                        ✅ {isArabic ? "لا توجد بلاغات معلقة حالياً، المجتمع نظيف!" : "No pending reports."}
                      </div> :

              <div className="space-y-2">
                        {reportsList.map((rep, repIdx) =>
                  <div key={`comm_rep_${rep.id || repIdx}_${repIdx}`} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-white block">مبلغ عنه: {rep.reportedUser}</span>
                                <p className="text-[9px] text-zinc-400 mt-0.5">سبب البلاغ: "{rep.reason}"</p>
                              </div>
                              <span className="text-[8px] text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900 font-mono">
                                {rep.timestamp}
                              </span>
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-zinc-900">
                              <button
                        onClick={() => {
                          setReportsList(reportsList.filter((r) => r.id !== rep.id));
                          playSynthSound("tap");
                          triggerInAppNotification("الإشراف", "تم تجاهل البلاغ", "info");
                        }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[8px] font-bold px-2.5 py-1 rounded-lg">
                        {isArabic ? "تجاهل" : "Dismiss"}
                              </button>
                              <button
                        onClick={() => {
                          setReportsList(reportsList.filter((r) => r.id !== rep.id));
                          playSynthSound("success");
                          triggerInAppNotification("الإشراف", `تم معاقبة المستخدم ${rep.reportedUser} وحظر الرسالة`, "success");
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold px-2.5 py-1 rounded-lg">
                        {isArabic ? "اتخاذ إجراء (كتم/حظر)" : "Punish"}
                              </button>
                            </div>
                          </div>
                )}
                      </div>
              }
                  </div>

                  {/* AI Content Moderation & Safety Tester */}
                  <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      {isArabic ? "فحص المحتوى المشبوه بالذكاء الاصطناعي" : "AI Content Safety Tester"}
                    </h3>
                    <p className="text-[9px] text-zinc-500">
                      {isArabic ? "قم بلصق أي رسالة أو منشور لفحص توافقه مع معايير السلامة وسياسة المجتمع فورياً." : "Check suspicious text for violations."}
                    </p>

                    <div className="flex gap-2">
                      <input
                  type="text"
                  placeholder={isArabic ? "لصق النص لفحصه بالذكاء الاصطناعي..." : "Paste text to scan..."}
                  value={moderationTestText}
                  onChange={(e) => setModerationTestText(e.target.value)}
                  className="flex-1 bg-zinc-950 text-xs p-2.5 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none" />
                
                      <button
                  onClick={async () => {
                    if (!moderationTestText.trim()) return;
                    setIsScanningAI(true);
                    try {
                      const res = await fetch("/api/ai/moderate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: moderationTestText, contentType: "community_post" })
                      });
                      const data = await res.json();
                      setAiModerationResult(data);
                      playSynthSound("success");
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsScanningAI(false);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 shrink-0">
                  
                        {isScanningAI ?
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                  <Shield className="w-3.5 h-3.5" />
                  }
                        {isArabic ? "فحص AI" : "Scan"}
                      </button>
                    </div>

                    {aiModerationResult &&
              <div className={`p-3 rounded-xl border text-xs ${aiModerationResult.flagged ? "bg-red-950/30 border-red-900/60 text-red-300" : "bg-emerald-950/30 border-emerald-900/60 text-emerald-300"}`}>
                        <div className="font-black mb-1 flex items-center gap-1.5">
                          {aiModerationResult.flagged ? "⚠️ محتوى مخالف لسياسات السلامة" : "✅ محتوى آمن ومقبول"}
                        </div>
                        <p className="text-[10px] text-zinc-300">{aiModerationResult.reason}</p>
                      </div>
              }
                  </div>

                  {/* Moderation Audit Log */}
                  <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      {isArabic ? "سجل إجراءات الإشراف والعقوبات" : "Moderation Audit Log"}
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="font-bold text-white block">كتم العضو @black_hacker لمدة 24 ساعة</span>
                          <span className="text-[8px] text-zinc-500">بواسطة: مـورا المـدير 🛡️ • السبب: سبام وتكرار</span>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-mono">منذ ساعتين</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="font-bold text-white block">حذف المنشور رقم #8421</span>
                          <span className="text-[8px] text-zinc-500">بواسطة: أبو تـيم السـيد 👑 • السبب: حرق أحداث المانجا</span>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-mono">منذ 5 ساعات</span>
                      </div>
                    </div>
                  </div>
                </div>
          }

              {/* TAB: SETTINGS (11.19) */}
              {activeTab === "settings" &&
          <div className="space-y-4">
                  {/* Blacklist Keywords Filter */}
                  <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#FF3D00]" />
                      {isArabic ? "فلترة الكلمات والسبام" : "Blacklisted Content Filter"}
                    </h3>

                    <div className="flex gap-2">
                      <input
                  type="text"
                  placeholder={isArabic ? "أضف كلمة محظورة جديدة..." : "Add blacklisted term..."}
                  value={blacklistInput}
                  onChange={(e) => setBlacklistInput(e.target.value)}
                  className="flex-1 bg-zinc-950 text-xs p-2 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none" />
                
                      <button
                  onClick={() => {
                    if (!blacklistInput.trim()) return;
                    setBlacklistedKeywords([...blacklistedKeywords, blacklistInput.trim()]);
                    setBlacklistInput("");
                    playSynthSound("success");
                  }}
                  className="bg-[#FF3D00] hover:bg-orange-600 text-[10px] font-bold px-3 rounded-xl text-white">
                  
                        {isArabic ? "إضافة" : "Add"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {blacklistedKeywords.map((keyword, _autoIdx) =>
                <span key={`${keyword}_${_autoIdx}`} className="text-[9px] bg-red-950/20 text-red-400 border border-red-900/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                          {keyword}
                          <button
                    onClick={() => {
                      setBlacklistedKeywords(blacklistedKeywords.filter((k) => k !== keyword));
                      playSynthSound("error");
                    }}
                    className="hover:text-white">
                    
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                )}
                    </div>
                  </div>

                  {/* Anti-spam guards & Post approval */}
                  <div className="bg-[#0C0C0C] border border-zinc-900 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black text-white">{isArabic ? "حماية الدردشة والخصوصية" : "Anti-Spam & Approvals"}</h3>

                    <div className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-xs font-bold text-white block">{isArabic ? "درع مكافحة السبام الذكي" : "Smart Anti-Spam Guard"}</span>
                        <p className="text-[8px] text-zinc-500">{isArabic ? "تحليل وحظر الرسائل المتكررة والعشوائية فورياً" : "Block recurring messages or bots instantly"}</p>
                      </div>
                      <input
                  type="checkbox"
                  checked={antiSpamEnabled}
                  onChange={() => {
                    setAntiSpamEnabled(!antiSpamEnabled);
                    playSynthSound("tap");
                  }}
                  className="accent-[#FF3D00]" />
                
                    </div>

                    <div className="flex justify-between items-center py-1 border-t border-zinc-900/60">
                      <div>
                        <span className="text-xs font-bold text-white block">{isArabic ? "موافقة مسبقة على المنشورات" : "Post Pre-Approval Switch"}</span>
                        <p className="text-[8px] text-zinc-500">{isArabic ? "مراجعة المنشورات من المشرفين قبل النشر للعامة" : "Verify topics before posting to public feed"}</p>
                      </div>
                      <input
                  type="checkbox"
                  checked={postPreApproval}
                  onChange={() => {
                    setPostPreApproval(!postPreApproval);
                    playSynthSound("tap");
                  }}
                  className="accent-[#FF3D00]" />
                
                    </div>
                  </div>
                </div>
          }

            </div>
          </div>)

      }

      {/* CREATE COMMUNITY MODAL (11.2) */}
      {showCreateModal &&
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0C0C0C] border border-zinc-800 rounded-2xl p-4 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto">
          
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h2 className="text-xs font-black text-white flex items-center gap-1.5">
                <Castle className="w-4 h-4 text-[#FF3D00]" />
                {isArabic ? "تأسيس مجتمع أوتـاكو جديد" : "Establish Community Hub"}
              </h2>
              <button
              onClick={() => {
                playSynthSound("error");
                setShowCreateModal(false);
              }}
              className="text-zinc-500 hover:text-white">
              
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "اسم المجتمع" : "Hub Name"} *</label>
                <input
                type="text"
                required
                placeholder={isArabic ? "مثال: ملوك المانجا العربي" : "e.g., Arabic Manga Kings"}
                value={creationForm.name}
                onChange={(e) => setCreationForm({ ...creationForm, name: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none focus:border-[#FF3D00]" />
              
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "المعرف الفريد (Username)" : "Username (@)"} *</label>
                <input
                type="text"
                required
                placeholder="manga_kings"
                value={creationForm.username}
                onChange={(e) => setCreationForm({ ...creationForm, username: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none focus:border-[#FF3D00]" />
              
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "نوع المجتمع" : "Community layer"}</label>
                <select
                value={creationForm.type}
                onChange={(e) => setCreationForm({ ...creationForm, type: e.target.value as any })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none focus:border-[#FF3D00]">
                
                  <option value="group">{isArabic ? "👥 Group (مجموعات نقاش)" : "Group"}</option>
                  <option value="channel">{isArabic ? "📢 Channel (قناة بث اتجاه واحد)" : "Channel"}</option>
                  <option value="guild">{isArabic ? "🏰 Guild (نقابة ألعاب ومشاهدة)" : "Guild"}</option>
                  <option value="space">{isArabic ? "🌍 Space (عالم متكامل شامل)" : "Space"}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "الوصف" : "Short Bio"}</label>
                <textarea
                placeholder={isArabic ? "عن ماذا يتحدث هذا المجتمع الأسطوري..." : "About this custom space..."}
                value={creationForm.description}
                onChange={(e) => setCreationForm({ ...creationForm, description: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none resize-none h-16 focus:border-[#FF3D00]" />
              
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "الخصوصية" : "Privacy"}</label>
                  <select
                  value={creationForm.privacy}
                  onChange={(e) => setCreationForm({ ...creationForm, privacy: e.target.value as any })}
                  className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none">
                  
                    <option value="public">{isArabic ? "عام" : "Public"}</option>
                    <option value="private">{isArabic ? "خاص" : "Private"}</option>
                    <option value="secret">{isArabic ? "سري" : "Secret"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "رسوم الانضمام (Black Coin)" : "Fee"}</label>
                  <input
                  type="number"
                  value={creationForm.joiningFee}
                  onChange={(e) => setCreationForm({ ...creationForm, joiningFee: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none" />
                
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl text-[9px] text-amber-500">
                ⚠️ {isArabic ? "يشترط مستوى 10 ورسوم 50 Black Coin لإنشاء مجتمع جديد." : "Level 10 & 50 Black Coins fee apply to launch new hub."}
              </div>

              <button
              type="submit"
              className="w-full bg-[#FF3D00] hover:bg-orange-600 p-3 rounded-xl text-xs font-black text-white transition-all transform active:scale-95">
              
                {isArabic ? "تأسيس المجتمع (خصم 50 🪙)" : "Establish Hub (Pay 50 🪙)"}
              </button>
            </form>
          </motion.div>
        </div>
      }

      {/* WIKI EDIT/CREATE MODAL */}
      {showWikiEditModal &&
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C0C0C] border border-zinc-800 rounded-2xl p-4 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h2 className="text-xs font-black text-white">{isArabic ? "إضافة صفحة ويكي جديدة" : "New Wiki Entry Page"}</h2>
              <button
              onClick={() => {
                playSynthSound("error");
                setShowWikiEditModal(false);
              }}
              className="text-zinc-500 hover:text-white">
              
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWikiPage} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "عنوان الصفحة" : "Page Title"}</label>
                <input
                type="text"
                required
                placeholder={isArabic ? "مثال: تاريخ رتب السايريان" : "e.g., History of Saiyan Ranks"}
                value={wikiForm.title}
                onChange={(e) => setWikiForm({ ...wikiForm, title: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none focus:border-[#FF3D00]" />
              
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "التصنيف" : "Category"}</label>
                <select
                value={wikiForm.category}
                onChange={(e) => setWikiForm({ ...wikiForm, category: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none">
                
                  <option value="rules">{isArabic ? "قوانين" : "Rules"}</option>
                  <option value="guide">{isArabic ? "شروحات ودليل" : "Guides"}</option>
                  <option value="lore">{isArabic ? "تاريخ وقصة" : "Lore"}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">{isArabic ? "المحتوى" : "Markdown Content"}</label>
                <textarea
                required
                placeholder={isArabic ? "اكتب محتوى الصفحة هنا بالتفصيل..." : "Write complete content..."}
                value={wikiForm.content}
                onChange={(e) => setWikiForm({ ...wikiForm, content: e.target.value })}
                className="w-full bg-[#141414] text-xs p-2.5 rounded-xl border border-zinc-800 text-white focus:outline-none resize-none h-32 focus:border-[#FF3D00]" />
              
              </div>

              <button
              type="submit"
              className="w-full bg-[#FF3D00] hover:bg-orange-600 p-3 rounded-xl text-xs font-black text-white transition-all transform active:scale-95">
              
                {isArabic ? "حفظ وإدراج في الموسوعة" : "Publish Wiki Page"}
              </button>
            </form>
          </div>
        </div>
      }

      {/* AI CHAT SUMMARY MODAL */}
      {aiSummaryModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0C0C0C] border border-purple-900/60 rounded-2xl p-4 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h2 className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {isArabic ? "ملخص المحادثة بالذكاء الاصطناعي" : "AI Conversation Summary"}
              </h2>
              <button
                onClick={() => setAiSummaryModal({ open: false, loading: false, result: "" })}
                className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {aiSummaryModal.loading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-purple-300 font-bold">
                  {isArabic ? "جاري تحليل آخر الرسائل بواسطة Gemini AI..." : "Analyzing conversation with Gemini AI..."}
                </p>
              </div>
            ) : (
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 text-xs text-zinc-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                {aiSummaryModal.result}
              </div>
            )}

            <button
              onClick={() => setAiSummaryModal({ open: false, loading: false, result: "" })}
              className="w-full bg-purple-600 hover:bg-purple-700 p-2.5 rounded-xl text-xs font-bold text-white transition-all">
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};

interface CommunitiesChatInputProps {
  isArabic: boolean;
  onSendMessage: (text: string) => void;
  characterCardStats?: any;
  setCharacterCardStats?: (val: any) => void;
  aiSmartReplies?: string[];
  setAiSmartReplies?: (val: string[]) => void;
  onGetSmartReplies?: () => void;
  loadingSmartReplies?: boolean;
}

const CommunitiesChatInput = ({
  isArabic,
  onSendMessage,
  characterCardStats,
  setCharacterCardStats,
  aiSmartReplies,
  setAiSmartReplies,
  onGetSmartReplies,
  loadingSmartReplies
}: CommunitiesChatInputProps) => {
  const [val, setVal] = useState("");
  const [isProofreading, setIsProofreading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (val.trim() || characterCardStats) {
      onSendMessage(val);
      setVal("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAIProofread = async () => {
    if (!val.trim()) return;
    setIsProofreading(true);
    try {
      const res = await fetch("/api/ai/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: val })
      });
      const data = await res.json();
      if (data.result) {
        setVal(data.result);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }
    } catch (err) {
      console.error("AI Proofread error:", err);
    } finally {
      setIsProofreading(false);
    }
  };

  return (
    <div className="space-y-1.5 shrink-0">
      {/* Smart reply chips if available */}
      {aiSmartReplies && aiSmartReplies.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
          {aiSmartReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSendMessage(reply);
                if (setAiSmartReplies) setAiSmartReplies([]);
              }}
              className="bg-purple-950/60 hover:bg-purple-900 border border-purple-800/80 text-purple-200 text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 transition-all">
              ✨ {reply}
            </button>
          ))}
          <button
            onClick={() => { if (setAiSmartReplies) setAiSmartReplies([]); }}
            className="text-zinc-500 hover:text-white text-xs px-1">
            ✕
          </button>
        </div>
      )}

      <div className="p-2 bg-[#0E0E0E] border border-zinc-900 rounded-2xl flex gap-1.5 items-end">
        {onGetSmartReplies && (
          <button
            onClick={onGetSmartReplies}
            className="p-2 text-purple-400 hover:bg-purple-950/40 rounded-xl transition-colors shrink-0 mb-0.5"
            title={isArabic ? "اقتراحات الذكاء الاصطناعي" : "AI Smart Replies"}>
            {loadingSmartReplies ? (
              <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin block" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          dir="auto"
          placeholder={isArabic ? "تحدث مع رفاقك من الأوتاكو..." : "Type custom message..."}
          value={val}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white focus:outline-none placeholder-zinc-500 px-2 py-1.5 resize-none max-h-28 min-h-[36px] scrollbar-hide font-medium leading-relaxed"
        />

        {characterCardStats && setCharacterCardStats && (
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg shrink-0 mb-1">
            <span className="text-[10px] text-zinc-400 font-bold">
              {isArabic ? "بطاقة:" : "Card:"} {characterCardStats.name}
            </span>
            <button onClick={() => setCharacterCardStats(null)} className="text-zinc-500 hover:text-white">×</button>
          </div>
        )}

        {val.trim().length > 3 && (
          <button
            onClick={handleAIProofread}
            disabled={isProofreading}
            className="p-2 text-amber-400 hover:bg-amber-950/40 rounded-xl transition-colors shrink-0 text-xs mb-0.5"
            title={isArabic ? "تصحيح الإملاء والقواعد بالذكاء الاصطناعي" : "AI Proofread"}>
            {isProofreading ? "..." : "🪄"}
          </button>
        )}

        <button
          onClick={handleSend}
          className="bg-[#FF3D00] hover:bg-orange-600 p-2.5 rounded-xl text-white transition-colors cursor-pointer shrink-0 mb-0.5">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};