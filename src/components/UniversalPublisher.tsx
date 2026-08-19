import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clapperboard,
  FileText,
  Calendar,
  Tv,
  MessageSquare,
  Compass,
  Shield,
  Clock,
  Eye,
  Lock,
  Globe,
  Settings,
  Share2,
  Trash2,
  Edit3,
  HelpCircle,
  Plus,
  X,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserPlus,
  RefreshCw,
  Copy,
  Info,
  Layers,
  Check,
  Zap,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  FolderOpen,
  MapPin,
  Smile,
  CheckSquare,
  ChevronDown,
  ArrowRight,
  Sliders
} from "lucide-react";
import PublishingManagementSystem from "./PublishingManagementSystem";

interface User {
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  role?: string;
  verificationType?: string;
}

interface UniversalPublisherProps {
  isArabic: boolean;
  currentUser: User | null;
  onPostCreated: (postData: any) => void;
  onAddCoins: (amount: number) => void;
  onAddXp: (amount: number) => void;
  playSynthSound?: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  isOffline: boolean;
  triggerInAppNotification: (title: string, body: string, badge?: string) => void;
  posts?: any[];
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
}

// Simulated data
const MOCK_FRIENDS = [
{ name: "مونكي دي لوفي", username: "luffy_gear5", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
{ name: "رورونوا زورو", username: "zoro_three_swords", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
{ name: "رينكا تشان", username: "rinka_chan", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
{ name: "نارتو شيبودن", username: "naruto_hokage", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }];


const ANIME_TAGS_POOL = ["One Piece", "Naruto", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen", "Bleach", "Dragon Ball"];
const MANGA_TAGS_POOL = ["Berserk", "Vagabond", "Solo Leveling", "Chainsaw Man", "Oshi no Ko", "Kingdom"];
const CHARACTER_TAGS_POOL = ["Luffy", "Zoro", "Goku", "Naruto", "Levi", "Gojo Satoru", "Eren Yeager"];

const POPULAR_HASHTAGS = ["#أوتامو_بلاك", "#AnimeBlack", "#ون_بيس", "#مراجعة_أنمي", "#أخبار_الأنمي", "#الجيل_الذهبي"];

export default function UniversalPublisher({
  isArabic,
  currentUser,
  onPostCreated,
  onAddCoins,
  onAddXp,
  playSynthSound,
  triggerHapticFeedback,
  isOffline,
  triggerInAppNotification,
  posts = [],
  setPosts
}: UniversalPublisherProps) {
  // Publishing settings modal toggle
  const [showPublishingSettingsModal, setShowPublishingSettingsModal] = useState(false);
  // 7.1 Category Selector
  const [activeCategory, setActiveCategory] = useState<
    "post" | "reel" | "story" | "news" | "event" | "channel" | "group" | "space" | "announcement" | "universe">(
    "post");

  // Content state
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [attachments, setAttachments] = useState<{id: string;type: "image" | "video" | "audio" | "file";url: string;name?: string;}[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [links, setLinks] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  // Custom Tags
  const [selectedAnimeTags, setSelectedAnimeTags] = useState<string[]>([]);
  const [selectedMangaTags, setSelectedMangaTags] = useState<string[]>([]);
  const [selectedCharacterTags, setSelectedCharacterTags] = useState<string[]>([]);

  // Settings Panel (7.6)
  const [audience, setAudience] = useState<"public" | "followers" | "friends" | "group" | "channel" | "space" | "guild" | "private">("public");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [likesEnabled, setLikesEnabled] = useState(true);
  const [viewsEnabled, setViewsEnabled] = useState(true);
  const [sharingAllowed, setSharingAllowed] = useState(true);
  const [repostingAllowed, setRepostingAllowed] = useState(true);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [copyLinkAllowed, setCopyLinkAllowed] = useState(true);
  const [mentionsAllowed, setMentionsAllowed] = useState<"everyone" | "followers" | "none">("everyone");
  const [quotingAllowed, setQuotingAllowed] = useState(true);
  const [starsEnabled, setStarsEnabled] = useState(true);
  const [giftCoinsEnabled, setGiftCoinsEnabled] = useState(false);

  // 7.7 Publish Scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledTimezone, setScheduledTimezone] = useState("UTC+3");
  const [isPeriodic, setIsPeriodic] = useState(false);
  const [periodicFrequency, setPeriodicFrequency] = useState<"daily" | "weekly" | "monthly">("daily");

  // 7.9 Collaborative Post
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [collaborators, setCollaborators] = useState<typeof MOCK_FRIENDS>([]);
  const [showCollaboratorSelector, setShowCollaboratorSelector] = useState(false);

  // 7.10 Event Settings
  const [eventName, setEventName] = useState("مهرجان أوتاكو الصيف الكبير 2026");
  const [eventRemainingTime, setEventRemainingTime] = useState("3 أيام و 5 ساعات");
  const [eventHashtag, setEventHashtag] = useState("#فعاليات_أنمي_بلاك");

  // Phone permissions simulation (7.5)
  const [permissionsState, setPermissionsState] = useState<Record<string, "granted" | "denied" | "not_asked">>({
    photos: "not_asked",
    camera: "not_asked",
    mic: "not_asked",
    files: "not_asked"
  });
  const [activePermissionDialog, setActivePermissionDialog] = useState<string | null>(null);
  const [showSettingsBypassModal, setShowSettingsBypassModal] = useState(false);

  // Drafts management (7.8)
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);

  // Trash Bin (7.19)
  const [trashPosts, setTrashPosts] = useState<any[]>([]);
  const [showTrashDrawer, setShowTrashDrawer] = useState(false);

  // Upload/Publish state progress (7.16 & 7.21)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadPhase, setUploadPhase] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState<any | null>(null);

  // AI Assistant (7.14)
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiOutput, setAiOutput] = useState("");

  // Auto review warnings (7.15)
  const [reviewWarning, setReviewWarning] = useState<{title: string;desc: string;triggerConfirm: () => void;} | null>(null);

  // Simulated recording (7.4)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // Smart URL creation (7.13)
  const [smartLinkCopied, setSmartLinkCopied] = useState(false);

  // List of scheduled posts (7.7)
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  // Unsubmitted drafts state & tracking (saving draft when user leaves creation screen)
  const [unsubmittedDraft, setUnsubmittedDraft] = useState<any | null>(null);
  const hasSubmittedRef = useRef(false);
  const latestStateRef = useRef({
    content,
    title,
    activeCategory,
    attachments,
    pollQuestion,
    pollOptions,
    selectedAnimeTags,
    selectedMangaTags,
    selectedCharacterTags
  });

  // Keep latest state updated in a ref
  useEffect(() => {
    latestStateRef.current = {
      content,
      title,
      activeCategory,
      attachments,
      pollQuestion,
      pollOptions,
      selectedAnimeTags,
      selectedMangaTags,
      selectedCharacterTags
    };
    if (content.trim() || title.trim() || pollQuestion.trim() || attachments.length > 0) {
      hasSubmittedRef.current = false;
    }
  }, [
  content,
  title,
  activeCategory,
  attachments,
  pollQuestion,
  pollOptions,
  selectedAnimeTags,
  selectedMangaTags,
  selectedCharacterTags]
  );

  // Unmount cleanup to save unsaved draft
  useEffect(() => {
    return () => {
      if (hasSubmittedRef.current) {
        localStorage.removeItem("anime_black_unsubmitted_draft");
        return;
      }

      const state = latestStateRef.current;
      const hasContent =
      state.content.trim() ||
      state.title.trim() ||
      state.pollQuestion.trim() ||
      state.attachments.length > 0 ||
      state.pollOptions.some((o) => o.trim() !== "");

      if (hasContent) {
        const draftObj = {
          content: state.content,
          title: state.title,
          activeCategory: state.activeCategory,
          attachments: state.attachments,
          pollQuestion: state.pollQuestion,
          pollOptions: state.pollOptions,
          selectedAnimeTags: state.selectedAnimeTags,
          selectedMangaTags: state.selectedMangaTags,
          selectedCharacterTags: state.selectedCharacterTags,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        localStorage.setItem("anime_black_unsubmitted_draft", JSON.stringify(draftObj));
      } else {
        localStorage.removeItem("anime_black_unsubmitted_draft");
      }
    };
  }, []);

  const restoreUnsubmittedDraft = () => {
    if (!unsubmittedDraft) return;
    handleTap();
    setContent(unsubmittedDraft.content || "");
    setTitle(unsubmittedDraft.title || "");
    setActiveCategory(unsubmittedDraft.activeCategory || "post");
    setAttachments(unsubmittedDraft.attachments || []);
    setPollQuestion(unsubmittedDraft.pollQuestion || "");
    setPollOptions(unsubmittedDraft.pollOptions || ["", ""]);
    setSelectedAnimeTags(unsubmittedDraft.selectedAnimeTags || []);
    setSelectedMangaTags(unsubmittedDraft.selectedMangaTags || []);
    setSelectedCharacterTags(unsubmittedDraft.selectedCharacterTags || []);

    setUnsubmittedDraft(null);
    localStorage.removeItem("anime_black_unsubmitted_draft");

    triggerInAppNotification(
      isArabic ? "تم استرداد المسودة بنجاح" : "Draft Restored Successfully",
      isArabic ? "تم استعادة المحتوى والبيانات المعلقة في المحرر" : "Your pending content and data have been restored in the editor",
      "📥"
    );
  };

  const discardUnsubmittedDraft = () => {
    handleTap();
    setUnsubmittedDraft(null);
    localStorage.removeItem("anime_black_unsubmitted_draft");

    triggerInAppNotification(
      isArabic ? "تم تجاهل المسودة" : "Draft Discarded",
      isArabic ? "تم حذف المسودة المعلقة السابقة نهائياً" : "Previous pending draft has been permanently deleted",
      "🗑️"
    );
  };

  // Load drafts on mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem("anime_black_drafts");
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }

    const savedTrash = localStorage.getItem("anime_black_trash_bin");
    if (savedTrash) {
      setTrashPosts(JSON.parse(savedTrash));
    }

    const savedScheduled = localStorage.getItem("anime_black_scheduled");
    if (savedScheduled) {
      setScheduledPosts(JSON.parse(savedScheduled));
    }

    const savedUnsubmitted = localStorage.getItem("anime_black_unsubmitted_draft");
    if (savedUnsubmitted) {
      setUnsubmittedDraft(JSON.parse(savedUnsubmitted));
    }
  }, []);

  // Auto-save draft logic (7.8)
  useEffect(() => {
    if (content.trim() || title.trim() || attachments.length > 0) {
      const timer = setTimeout(() => {
        saveDraft(true); // Silent auto-save
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, title, attachments, activeCategory]);

  // Audio Recording simulator
  useEffect(() => {
    if (isRecordingAudio) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingAudio]);

  // Handle tap helper
  const handleTap = () => {
    if (playSynthSound) playSynthSound("tap");
    if (triggerHapticFeedback) triggerHapticFeedback("tap");
  };

  // Check phone permissions (7.5)
  const requestPermission = (permission: "photos" | "camera" | "mic" | "files", callback?: () => void) => {
    if (permissionsState[permission] === "granted") {
      if (callback) callback();
      return;
    }

    if (permissionsState[permission] === "denied") {
      setShowSettingsBypassModal(true);
      return;
    }

    setActivePermissionDialog(permission);
  };

  const handlePermissionResponse = (permission: string, allowed: boolean) => {
    handleTap();
    const newState = allowed ? "granted" : "denied";
    setPermissionsState((prev) => ({ ...prev, [permission]: newState }));
    setActivePermissionDialog(null);

    if (allowed) {
      triggerInAppNotification(
        isArabic ? "تم منح الإذن بنجاح" : "Permission Granted",
        isArabic ? `يمكن للتطبيق الآن الوصول إلى ${permission}` : `App now has access to ${permission}`,
        "🔒"
      );
    } else {
      setShowSettingsBypassModal(true);
    }
  };

  // Draft Save / Load
  const saveDraft = (silent = false) => {
    if (!content.trim() && !title.trim() && attachments.length === 0) return;

    const newDraft = {
      id: Math.random().toString(36).substring(7),
      title: title || (isArabic ? `مسودة ${activeCategory}` : `Draft ${activeCategory}`),
      content,
      category: activeCategory,
      attachments,
      pollQuestion,
      pollOptions,
      selectedAnimeTags,
      selectedMangaTags,
      selectedCharacterTags,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedDrafts = [newDraft, ...drafts.filter((d) => d.content !== content)];
    setDrafts(updatedDrafts);
    localStorage.setItem("anime_black_drafts", JSON.stringify(updatedDrafts));

    if (!silent) {
      if (playSynthSound) playSynthSound("success");
      triggerInAppNotification(
        isArabic ? "تم حفظ المسودة" : "Draft Saved",
        isArabic ? "تم حفظ منشورك وتزامن المسودات بنجاح!" : "Post saved as draft and synchronized!",
        "💾"
      );
    }
  };

  const loadDraft = (draft: any) => {
    handleTap();
    setTitle(draft.title);
    setContent(draft.content);
    setActiveCategory(draft.category);
    setAttachments(draft.attachments || []);
    setPollQuestion(draft.pollQuestion || "");
    setPollOptions(draft.pollOptions || ["", ""]);
    setSelectedAnimeTags(draft.selectedAnimeTags || []);
    setSelectedMangaTags(draft.selectedMangaTags || []);
    setSelectedCharacterTags(draft.selectedCharacterTags || []);
    setShowDraftsDrawer(false);

    triggerInAppNotification(
      isArabic ? "تم تحميل المسودة" : "Draft Loaded",
      isArabic ? "تم استعادة بيانات المنشور للمحرر" : "Post draft content has been loaded",
      "📥"
    );
  };

  const deleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleTap();
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("anime_black_drafts", JSON.stringify(updated));
  };

  // Mock upload action (7.4 & 7.21)
  const handleMediaUpload = (type: "image" | "video" | "file") => {
    requestPermission(type === "file" ? "files" : "photos", () => {
      handleTap();

      if (type === "image") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            setUploadProgress(10);
            setUploadPhase(isArabic ? "جارٍ ضغط وتجهيز الملف..." : "Compressing media files...");
            try {
              const { compressImage } = await import('../utils/imageUtils');
              const base64 = await compressImage(file, 800);
              const newAttachment = {
                id: Math.random().toString(),
                type,
                url: base64
              };
              setAttachments((prev) => [...prev, newAttachment]);
              if (playSynthSound) playSynthSound("success");
            } catch (err) {
              console.error(err);
            } finally {
              setUploadProgress(null);
            }
          }
        };
        input.click();
        return;
      }

      // Simulate selection & progressive compressing
      setUploadProgress(10);
      setUploadPhase(isArabic ? "جارٍ ضغط وتجهيز الملف..." : "Compressing media files...");

      let prog = 10;
      const interval = setInterval(() => {
        prog += 25;
        if (prog >= 100) {
          clearInterval(interval);
          setUploadProgress(null);

          const mockUrls: Record<string, string> = {
            image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
            video: "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-walking-under-cherry-blossoms-40292-large.mp4",
            file: "https://animeblack.com/docs/manga_review_guideline.pdf"
          };

          const newAttachment = {
            id: Math.random().toString(),
            type,
            url: mockUrls[type],
            name: type === "file" ? "manga_review_guideline.pdf" : undefined
          };

          setAttachments((prev) => [...prev, newAttachment]);
          if (playSynthSound) playSynthSound("success");
        } else {
          setUploadProgress(prog);
        }
      }, 400);
    });
  };

  // Mock audio recording toggle
  const toggleAudioRecording = () => {
    requestPermission("mic", () => {
      handleTap();
      if (isRecordingAudio) {
        setIsRecordingAudio(false);
        // Save audio clip
        const newAttachment = {
          id: Math.random().toString(),
          type: "audio" as const,
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        };
        setAttachments((prev) => [...prev, newAttachment]);
        triggerInAppNotification(
          isArabic ? "تم تسجيل الصوت بنجاح" : "Audio Recorded Successfully",
          isArabic ? "تم إلحاق المقطع الصوتي بالمنشور" : "The audio clip was attached to post",
          "🎙️"
        );
      } else {
        setIsRecordingAudio(true);
      }
    });
  };

  // AI Assistant using server-side proxy (7.14)
  const askAiAssistant = async (actionType: "improve" | "hashtags" | "title" | "time") => {
    handleTap();
    setIsAiProcessing(true);
    setAiOutput("");

    try {
      // Create intelligent prompt based on current post and action
      let promptText = "";
      if (actionType === "improve") {
        promptText = `Improve the following anime/otaku post to make it more engaging, exciting and well-structured. Keep some emojis and hashtags, correct any typos: "${content || "اكتب منشور رائع عن أفضل انمي في التاريخ"}"`;
      } else if (actionType === "hashtags") {
        promptText = `Suggest top 5 highly relevant Arabic anime hashtags for this content: "${content}"`;
      } else if (actionType === "title") {
        promptText = `Suggest 3 catchy and sensational titles (Arabic) for an otaku blog post based on this content: "${content}"`;
      } else if (actionType === "time") {
        promptText = `Analyze the optimal posting time for a target Otaku community interested in this content: "${content}". Suggest time and timezone.`;
      }

      const res = await fetch("/api/ai/write-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, tone: isArabic ? "حماسي ومثير" : "Exciting Tone" })
      });

      const data = await res.json();
      if (data.result) {
        setAiOutput(data.result);
      } else {
        // Fallback local rules if server call fails
        if (actionType === "improve") {
          setAiOutput(content + " ✨🔥 (تم تحسينه بواسطة مساعد أنمي بلاك الذكي! ترقبوا مراجعة كاملة!)");
        } else if (actionType === "hashtags") {
          setAiOutput("#أنمي_بلاك #أوتاكو_العرب #مراجعات_خورافية #AnimeBlack 🔥👑");
        } else if (actionType === "title") {
          setAiOutput("1. الصدام الأعظم في تاريخ الشونين! 💥\n2. لماذا تفوق هذا الأنمي على الجميع؟ 🔥\n3. مراجعة القرن للأسطورة الجديدة! 🏆");
        } else {
          setAiOutput(isArabic ? "الوقت المقترح: 08:30 مساءً بتوقيت مكة المكرمة (حيث يبلغ تفاعل الأوتاكو ذروته اليوم)" : "Suggested Time: 08:30 PM (UTC+3) peak active otaku hours");
        }
      }
    } catch (error) {
      console.error(error);
      setAiOutput(isArabic ? "عذرًا، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي." : "Error connecting to AI Assistant.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Pre-publish auto review scanner (7.15)
  const handlePrePublishCheck = () => {
    handleTap();
    if (!content.trim() && attachments.length === 0) {
      if (playSynthSound) playSynthSound("error");
      alert(isArabic ? "يرجى كتابة محتوى أو إضافة وسائط أولاً!" : "Please write some content or add media first!");
      return;
    }

    // Auto review filters (7.15)
    const lowerContent = content.toLowerCase();
    let hasWarning = false;
    let warningTitle = "";
    let warningDesc = "";

    if (lowerContent.includes("سبام") || lowerContent.includes("ربح سريع") || lowerContent.match(/(.)\1{9,}/)) {
      hasWarning = true;
      warningTitle = isArabic ? "اشتباه في محتوى سبام أو مكرر" : "Potential Spam or Repetitive Content";
      warningDesc = isArabic ?
      "لقد كشف محرك المراجعة التلقائية تكراراً كبيراً للحروف أو كلمات شبيهة بالرسائل العشوائية. يرجى تعديله لتحسين جودة التفاعل." :
      "Automated filters detected repeated symbols or spam-like phrasing. Consider revising to maintain feed quality.";
    } else if (lowerContent.includes("http://") || lowerContent.includes("www.viagra") || lowerContent.includes("free-coins")) {
      hasWarning = true;
      warningTitle = isArabic ? "رابط مشبوه أو غير آمن" : "Potentially Harmful Link Alert";
      warningDesc = isArabic ?
      "تنبيه! يحتوي المنشور على روابط تصفية غير مشفرة أو نطاقات مشبوهة. يرجى الحذر قبل النشر." :
      "Warning: Unencrypted link or domain detected. Keep links official and HTTPS secure.";
    } else if (lowerContent.includes("حرق") && !lowerContent.includes("تحذير حرق")) {
      hasWarning = true;
      warningTitle = isArabic ? "احتمالية حرق أحداث بدون تحذير" : "Unwarned Anime Spoilers";
      warningDesc = isArabic ?
      "يبدو أنك تتحدث عن أحداث مهمة (حرق) دون تضمين وسم تحذير حرق الأحداث. ننصح بإضافة #تحذير_حرق لتجنب غضب الأوتاكو!" :
      "Your text mentions spoilers. We recommend adding '#Warning_Spoilers' to prevent reports from other Otakus.";
    }

    if (hasWarning) {
      if (playSynthSound) playSynthSound("error");
      if (triggerHapticFeedback) triggerHapticFeedback("error");
      setReviewWarning({
        title: warningTitle,
        desc: warningDesc,
        triggerConfirm: () => {
          setReviewWarning(null);
          executePublishProcess();
        }
      });
    } else {
      executePublishProcess();
    }
  };

  // Unified publishing execution (7.16 & 7.17 & 7.21)
  const executePublishProcess = () => {
    // 7.17 Offline handling
    if (isOffline) {
      const pendingPost = {
        id: Math.random().toString(),
        title: title || isArabic ? "منشور معلق" : "Pending offline post",
        content,
        category: activeCategory,
        attachments,
        isOfflinePending: true
      };

      // Save to local offline queue
      const savedOffline = JSON.parse(localStorage.getItem("anime_black_offline_queue") || "[]");
      localStorage.setItem("anime_black_offline_queue", JSON.stringify([...savedOffline, pendingPost]));

      if (playSynthSound) playSynthSound("error");
      triggerInAppNotification(
        isArabic ? "جاري الحفظ المحلي (أوفلاين)" : "Saved Locally (Offline)",
        isArabic ? "لا يوجد إنترنت. سيتم النشر تلقائياً فور عودة الاتصال!" : "No internet. Post will automatically publish when back online!",
        "📡"
      );

      // Clear editor
      resetEditor();
      return;
    }

    // 7.7 Publish Scheduling
    if (isScheduled && scheduledDate) {
      const scheduledItem = {
        id: Math.random().toString(),
        title: title || isArabic ? `مجدول: ${content.substring(0, 20)}...` : `Scheduled Post`,
        content,
        category: activeCategory,
        scheduledAt: `${scheduledDate} ${scheduledTime || "12:00"} (${scheduledTimezone})`,
        isPeriodic,
        periodicFrequency,
        attachments
      };

      const updated = [scheduledItem, ...scheduledPosts];
      setScheduledPosts(updated);
      localStorage.setItem("anime_black_scheduled", JSON.stringify(updated));

      if (playSynthSound) playSynthSound("success");
      triggerInAppNotification(
        isArabic ? "تمت جدولة المنشور بنجاح" : "Post Scheduled",
        isArabic ? `سيتم النشر في ${scheduledItem.scheduledAt}` : `Will publish at ${scheduledItem.scheduledAt}`,
        "📅"
      );
      resetEditor();
      return;
    }

    // Standard online chunk-upload and publish progress (7.21 & 7.16)
    setUploadProgress(0);
    setUploadPhase(isArabic ? "تجهيز البنية الموحدة (Universal Engine)..." : "Initializing Universal Content Engine...");

    let step = 0;
    const phases = [
    isArabic ? "ضغط الوسائط المتعددة بدقة فائقة..." : "Super resolution media compression...",
    isArabic ? "جارٍ رفع الوسائط عبر خوادم السحابة..." : "Uploading chunks to cloud buckets...",
    isArabic ? "التحقق النهائي والمطابقة الأمنية..." : "Final security auditing...",
    isArabic ? "تحديث مستكشف الأنمي والهاشتاقات..." : "Updating anime database & tags...",
    isArabic ? "بث الإشعارات وتحديث نقاط XP والعملات..." : "Broadcasting feed notifications & rewards..."];


    const timer = setInterval(() => {
      step++;
      if (step < phases.length) {
        setUploadProgress(step * 20);
        setUploadPhase(phases[step]);
      } else {
        clearInterval(timer);
        setUploadProgress(null);

        // Success rewards (XP & Coins) (7.16)
        const earnedXp = 45;
        const earnedCoins = 15;
        onAddXp(earnedXp);
        onAddCoins(earnedCoins);

        if (playSynthSound) playSynthSound("levelup");
        if (triggerHapticFeedback) triggerHapticFeedback("levelup");

        // Format post object to match standard system
        const newPost = {
          id: "post_pub_" + Math.random().toString(36).substring(7),
          author: {
            name: currentUser?.name || (isArabic ? "عضو أوتوكو" : "Otaku"),
            username: currentUser?.username || "otaku_user",
            avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            isVerified: currentUser?.isVerified || false,
            role: currentUser?.role || "Member"
          },
          title: title.trim() || undefined,
          content,
          image: attachments.find((a) => a.type === "image")?.url || null,
          video: attachments.find((a) => a.type === "video")?.url || null,
          attachments,
          likes: 0,
          hasLiked: false,
          comments: [],
          poll: pollQuestion.trim() ? {
            question: pollQuestion,
            options: pollOptions.filter((o) => o.trim() !== "").map((o, _autoIdx) => ({ text: o, votes: 0 })),
            totalVotes: 0,
            userVotedIndex: null
          } : null,
          createdAt: isArabic ? "الآن" : "Just now",
          category: activeCategory,
          animeTags: selectedAnimeTags,
          mangaTags: selectedMangaTags,
          characterTags: selectedCharacterTags,
          isCollaborative,
          collaborators,
          isEventParticipating: activeCategory === "event",
          settings: {
            audience,
            commentsEnabled,
            likesEnabled,
            viewsEnabled,
            sharingAllowed,
            repostingAllowed,
            downloadAllowed,
            copyLinkAllowed,
            mentionsAllowed,
            quotingAllowed,
            starsEnabled,
            giftCoinsEnabled,
            location: location.trim() || undefined,
            links
          }
        };

        onPostCreated(newPost);
        setShowSuccessModal({
          xp: earnedXp,
          coins: earnedCoins,
          post: newPost
        });

        resetEditor();
      }
    }, 800);
  };

  const resetEditor = () => {
    hasSubmittedRef.current = true;
    localStorage.removeItem("anime_black_unsubmitted_draft");
    setContent("");
    setTitle("");
    setAttachments([]);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setSelectedAnimeTags([]);
    setSelectedMangaTags([]);
    setSelectedCharacterTags([]);
    setIsScheduled(false);
    setIsCollaborative(false);
    setCollaborators([]);
  };

  // Permanent Smart Link Generator (7.13)
  const generateAndCopySmartLink = () => {
    handleTap();
    const mockId = Math.random().toString(36).substring(7);
    const mockUrl = `https://animeblack.com/${activeCategory}/${mockId}`;
    navigator.clipboard.writeText(mockUrl);
    setSmartLinkCopied(true);
    setTimeout(() => setSmartLinkCopied(false), 2000);
    triggerInAppNotification(
      isArabic ? "تم نسخ الرابط الذكي" : "Smart Link Copied",
      isArabic ? "يمكنك نشره مباشرة للتكامل عبر الأنظمة" : "Permanent integration link copied to clipboard",
      "📋"
    );
  };

  // Simulated Trash interaction (7.19)
  const sendPostToTrash = (draft: any) => {
    handleTap();
    const trashedItem = {
      ...draft,
      trashedAt: new Date().toLocaleDateString(),
      expiresInDays: 30
    };

    const updatedTrash = [trashedItem, ...trashPosts];
    setTrashPosts(updatedTrash);
    localStorage.setItem("anime_black_trash_bin", JSON.stringify(updatedTrash));

    const updatedDrafts = drafts.filter((d) => d.id !== draft.id);
    setDrafts(updatedDrafts);
    localStorage.setItem("anime_black_drafts", JSON.stringify(updatedDrafts));

    triggerInAppNotification(
      isArabic ? "نُقل إلى سلة المحذوفات" : "Moved to Trash",
      isArabic ? "سيبقى المنشور في السلة لمدة ٣٠ يومًا" : "Deleted items stay in trash for 30 days",
      "🗑️"
    );
  };

  const restoreFromTrash = (item: any) => {
    handleTap();
    const updatedTrash = trashPosts.filter((t) => t.id !== item.id);
    setTrashPosts(updatedTrash);
    localStorage.setItem("anime_black_trash_bin", JSON.stringify(updatedTrash));

    const restoredDraft = {
      ...item,
      updatedAt: "Restored"
    };
    const updatedDrafts = [restoredDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("anime_black_drafts", JSON.stringify(updatedDrafts));

    triggerInAppNotification(
      isArabic ? "تم استعادة المنشور" : "Restored Draft",
      isArabic ? "تمت إعادة المنشور بنجاح إلى المسودات" : "Restored draft successfully",
      "♻️"
    );
  };

  // 7.1 Publishers types configuration
  const CATEGORIES = [
  { id: "post" as const, labelAr: "منشور", labelEn: "Post", icon: FileText, color: "text-red-500 bg-red-950/20 border-red-900/30" },
  { id: "reel" as const, labelAr: "ريلز", labelEn: "Reel", icon: Clapperboard, color: "text-amber-500 bg-amber-950/20 border-amber-900/30" },
  { id: "story" as const, labelAr: "قصة", labelEn: "Story", icon: Sparkles, color: "text-pink-500 bg-pink-950/20 border-pink-900/30" },
  { id: "news" as const, labelAr: "أخبار", labelEn: "News", icon: Tv, color: "text-blue-500 bg-blue-950/20 border-blue-900/30" },
  { id: "event" as const, labelAr: "فعالية", labelEn: "Event", icon: Calendar, color: "text-emerald-500 bg-emerald-950/20 border-emerald-900/30" },
  { id: "channel" as const, labelAr: "قناة", labelEn: "Channel", icon: Compass, color: "text-violet-500 bg-violet-950/20 border-violet-900/30" },
  { id: "group" as const, labelAr: "مجموعة", labelEn: "Group", icon: MessageSquare, color: "text-cyan-500 bg-cyan-950/20 border-cyan-900/30" },
  { id: "space" as const, labelAr: "عالم", labelEn: "Space", icon: Layers, color: "text-orange-500 bg-orange-950/20 border-orange-900/30" },
  { id: "announcement" as const, labelAr: "إعلان", labelEn: "Official", icon: Shield, color: "text-purple-500 bg-purple-950/20 border-purple-900/30" },
  { id: "universe" as const, labelAr: "أنمي يونيفرس", labelEn: "Universe", icon: Zap, color: "text-yellow-500 bg-yellow-950/20 border-yellow-900/30" }];


  return (
    <div className="w-full bg-black min-h-screen text-white pb-32" dir={isArabic ? "rtl" : "ltr"}>
      {/* HEADER CONTROLS */}
      <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40 sticky top-0 z-40 backdrop-blur-md">
        <div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-red-500 animate-pulse" />
            {isArabic ? "محرك النشر الموحد" : "Universal Content Engine"}
          </h1>
          <p className="text-[10px] text-zinc-500">
            {isArabic ? "أنظمة النشر والوسائط المتكاملة لمنصة Anime Black" : "Unified media & content publishing system"}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Advanced Publishing Settings button */}
          <button
            onClick={() => {
              handleTap();
              setShowPublishingSettingsModal(true);
            }}
            className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-red-300 shadow-md cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">{isArabic ? "إعدادات النشر" : "Publishing Hub"}</span>
          </button>

          {/* Drafts access button */}
          <button
            onClick={() => {handleTap();setShowDraftsDrawer(true);}}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 relative">
            
            <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{isArabic ? "المسودات" : "Drafts"}</span>
            {drafts.length > 0 &&
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {drafts.length}
              </span>
            }
          </button>

          {/* Schedule Manager access button */}
          <button
            onClick={() => {handleTap();setShowScheduleManager(true);}}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300">
            
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isArabic ? "المجدولة" : "Scheduled"}</span>
            {scheduledPosts.length > 0 &&
            <span className="bg-amber-600 text-white text-[8px] font-black px-1 py-0.5 rounded ml-1">
                {scheduledPosts.length}
              </span>
            }
          </button>

          {/* Trash access button */}
          <button
            onClick={() => {handleTap();setShowTrashDrawer(true);}}
            className="p-2 bg-zinc-900 hover:bg-[#1f1111] border border-red-950/40 rounded-xl text-xs font-semibold flex items-center gap-1 text-red-400 transition-all">
            
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7.1 CATEGORY HORIZONTAL SELECTOR RAIL */}
      <div className="overflow-x-auto py-3 px-4 flex gap-2 border-b border-zinc-900 bg-zinc-950/20 no-scrollbar">
        {CATEGORIES.map((cat, _autoIdx) => {
          const IconComponent = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={`pub_cat_${cat.id}_${_autoIdx}`}
              onClick={() => {handleTap();setActiveCategory(cat.id);}}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              isActive ?
              "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/10 scale-105" :
              `bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800`}`
              }>
              
              <IconComponent className="w-3.5 h-3.5" />
              <span>{isArabic ? cat.labelAr : cat.labelEn}</span>
            </button>);

        })}
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* 7.10 SPECIAL EVENT BOARD CONTAINER (Conditionally rendered frame) */}
        {activeCategory === "event" &&
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden shadow-lg shadow-emerald-950/10 animate-fade-in">
            <div className="absolute top-[-30%] right-[-20%] w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/30">
                  🏆 {isArabic ? "مشارك في فعالية" : "Event Participant"}
                </span>
                <h3 className="text-xs font-black text-white mt-1.5">{eventName}</h3>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isArabic ? "الوقت المتبقي:" : "Time left:"}</span>
                  <span className="font-mono text-emerald-300 font-bold">{eventRemainingTime}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-500 font-black">{eventHashtag}</span>
                <button
                type="button"
                onClick={() => triggerInAppNotification(isArabic ? "تكامل الفعالية" : "Event Integration", isArabic ? "أنت مسجل حاليًا بالفعالية وتساهم بنقاط!" : "You are currently competing in the active event leaderboard!")}
                className="block mt-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[9px] px-2.5 py-1 rounded-lg transition-all">
                
                  {isArabic ? "دخول الفعالية" : "Enter Event"}
                </button>
              </div>
            </div>
          </div>
        }

        {/* COMPOSER FORM CARD */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 relative">
          
          {/* UNSUBMITTED PENDING DRAFT RECOVERY BANNER */}
          {unsubmittedDraft &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative overflow-hidden">
            
              <div className="space-y-1 z-10">
                <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">
                  ⚠️ {isArabic ? "مسودة معلقة غير محفوظة" : "Unsaved Pending Draft"}
                </span>
                <p className="text-[11px] text-zinc-300 font-medium">
                  {isArabic ?
                `لديك مسودة غير محفوظة لـ (${unsubmittedDraft.activeCategory}) من جلستك السابقة` :
                `You have an unsaved draft (${unsubmittedDraft.activeCategory}) from your previous session`}
                </p>
                {unsubmittedDraft.content &&
              <p className="text-[10px] text-zinc-500 line-clamp-1 italic">
                    "{unsubmittedDraft.content}"
                  </p>
              }
              </div>
              <div className="flex gap-2 w-full md:w-auto z-10">
                <button
                type="button"
                onClick={restoreUnsubmittedDraft}
                className="flex-1 md:flex-initial bg-amber-600 hover:bg-amber-700 text-black text-[10px] font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer">
                
                  📥 {isArabic ? "استعادة العمل" : "Restore Work"}
                </button>
                <button
                type="button"
                onClick={discardUnsubmittedDraft}
                className="flex-1 md:flex-initial bg-zinc-800 hover:bg-zinc-750 text-zinc-400 text-[10px] font-black px-3 py-2 rounded-xl transition-all cursor-pointer">
                
                  🗑️ {isArabic ? "تجاهل" : "Discard"}
                </button>
              </div>
            </motion.div>
          }

          {/* Title bar (for News, Events, announcements, Universe types) */}
          {["news", "event", "announcement", "universe"].includes(activeCategory) &&
          <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                {isArabic ? "عنوان المنشور الرسمي" : "Official Post Title"}
              </label>
              <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArabic ? "اكتب عنوانًا مثيرًا وجذابًا..." : "Enter a compelling title..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-bold" />
            
            </div>
          }

          {/* MAIN RICH TEXT EDITOR */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                {isArabic ? "محتوى المنشور والنص الإبداعي" : "Post Creative Content"}
              </label>
              <span className="text-[9px] text-zinc-600 font-mono">
                {content.length} {isArabic ? "حرف" : "chars"}
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
              isArabic ?
              "اكتب مراجعتك أو تفاصيل منشورك... استخدم الهاشتاق # والمنشن @" :
              "Write your review or share details... Type hashtags # and mentions @"
              }
              rows={6}
              className="w-full bg-[#080808]/90 border border-zinc-900 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none leading-relaxed" />
            
          </div>

          {/* 7.12 HORIZONTAL HASHTAGS SHORTCUTS */}
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-600 block">{isArabic ? "هاشتاقات شائعة بنقرة واحدة:" : "Trending click tags:"}</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_HASHTAGS.map((hash, _autoIdx) =>
              <button
                key={`${hash}_${_autoIdx}`}
                type="button"
                onClick={() => {
                  handleTap();
                  if (!content.includes(hash)) {
                    setContent((prev) => prev.trim() + " " + hash);
                  }
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded-lg text-[10px] font-semibold transition-all">
                
                  {hash}
                </button>
              )}
            </div>
          </div>

          {/* 7.11 ANIME & MANGA TAGS COMPONENT */}
          <div className="bg-[#0b0b0c] border border-zinc-900 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                {isArabic ? "علامات الأنمي والمانجا (Anime Tags)" : "Anime & Manga Universe Tags"}
              </span>
              <p className="text-[8px] text-zinc-500">
                {isArabic ? "تربط المنشور بـ Anime Universe للتصفح التلقائي" : "Links post to the Anime Universe database"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] text-zinc-500 block mb-1">{isArabic ? "أنمي / مانجا:" : "Anime / Manga:"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ANIME_TAGS_POOL.map((tag, _autoIdx) => {
                    const isSelected = selectedAnimeTags.includes(tag);
                    return (
                      <button
                        key={`${tag}_${_autoIdx}`}
                        type="button"
                        onClick={() => {
                          handleTap();
                          setSelectedAnimeTags((prev) => isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]);
                        }}
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-all ${
                        isSelected ?
                        "bg-red-600/20 border-red-500 text-red-400" :
                        "bg-zinc-900 border-zinc-800 text-zinc-500"}`
                        }>
                        
                        {tag}
                      </button>);

                  })}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 block mb-1">{isArabic ? "شخصيات:" : "Characters:"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {CHARACTER_TAGS_POOL.map((char, _autoIdx) => {
                    const isSelected = selectedCharacterTags.includes(char);
                    return (
                      <button
                        key={`${char}_${_autoIdx}`}
                        type="button"
                        onClick={() => {
                          handleTap();
                          setSelectedCharacterTags((prev) => isSelected ? prev.filter((t) => t !== char) : [...prev, char]);
                        }}
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-all ${
                        isSelected ?
                        "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                        "bg-zinc-900 border-zinc-800 text-zinc-500"}`
                        }>
                        
                        {char}
                      </button>);

                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 7.3 INTERACTIVE POLL ATTACHMENT */}
          <div className="bg-[#0b0b0c] border border-zinc-900 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10px] font-bold text-zinc-400 block">📊 {isArabic ? "استطلاع رأي تفاعلي (اختياري)" : "Interactive Poll (Optional)"}</span>
            <div className="space-y-2">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder={isArabic ? "سؤال الاستطلاع: من هو صاحب اللقطة الأقوى؟" : "Poll question: Who has the strongest clip?"}
                className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600" />
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={pollOptions[0]}
                  onChange={(e) => {
                    const copy = [...pollOptions];
                    copy[0] = e.target.value;
                    setPollOptions(copy);
                  }}
                  placeholder={isArabic ? "الخيار الأول" : "Option 1"}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none" />
                
                <input
                  type="text"
                  value={pollOptions[1]}
                  onChange={(e) => {
                    const copy = [...pollOptions];
                    copy[1] = e.target.value;
                    setPollOptions(copy);
                  }}
                  placeholder={isArabic ? "الخيار الثاني" : "Option 2"}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none" />
                
              </div>
            </div>
          </div>

          {/* 7.9 COLLABORATIVE PUBLISHING CONFIG */}
          <div className="bg-[#0b0b0c] border border-zinc-900 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                {isArabic ? "منشور تعاوني (Co-Authoring)" : "Collaborative Post"}
              </span>
              <button
                type="button"
                onClick={() => {handleTap();setIsCollaborative(!isCollaborative);}}
                className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all ${
                isCollaborative ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400"}`
                }>
                
                {isCollaborative ? isArabic ? "مفعل" : "Enabled" : isArabic ? "تفعيل" : "Enable"}
              </button>
            </div>

            {isCollaborative &&
            <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-400">{isArabic ? "المؤلفون المساعدون المدعوون:" : "Invited Co-authors:"}</span>
                  <button
                  onClick={() => {handleTap();setShowCollaboratorSelector(!showCollaboratorSelector);}}
                  className="text-[9px] font-bold text-blue-400 hover:underline">
                  
                    + {isArabic ? "إضافة متعاون" : "Add Collaborator"}
                  </button>
                </div>

                {showCollaboratorSelector &&
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#060606] rounded-xl border border-zinc-900">
                    {MOCK_FRIENDS.map((f, _autoIdx) => {
                  const isAdded = collaborators.some((c) => c.username === f.username);
                  return (
                    <div
                      key={`${f.username}_${_autoIdx}`}
                      onClick={() => {
                        handleTap();
                        setCollaborators((prev) => isAdded ? prev.filter((c) => c.username !== f.username) : [...prev, f]);
                      }}
                      className={`p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all border ${
                      isAdded ? "bg-blue-950/20 border-blue-900/40" : "bg-zinc-900/20 border-zinc-900"}`
                      }>
                      
                          <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="text-left">
                            <p className="text-[9px] font-black text-gray-200">{f.name}</p>
                            <p className="text-[7px] text-zinc-500">@{f.username}</p>
                          </div>
                        </div>);

                })}
                  </div>
              }

                {collaborators.length > 0 &&
              <div className="flex flex-wrap gap-2">
                    {collaborators.map((c, _autoIdx) =>
                <div key={`${c.username}_${_autoIdx}`} className="flex items-center gap-1.5 bg-blue-950/30 border border-blue-900/30 px-2 py-1 rounded-xl text-[9px] font-bold text-blue-400">
                        <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                        <span>{c.name}</span>
                        <X className="w-3 h-3 text-red-500 cursor-pointer ml-1" onClick={() => setCollaborators((prev) => prev.filter((p) => p.username !== c.username))} />
                      </div>
                )}
                  </div>
              }
              </div>
            }
          </div>

          {/* 7.4 ATTACHMENTS PREVIEW & MULTI-MEDIA RAIL */}
          {attachments.length > 0 &&
          <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "المرفقات الحالية:" : "Current attachments:"}</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {attachments.map((attach, _autoIdx) =>
              <div key={`${attach.id}_${_autoIdx}`} className="relative rounded-xl overflow-hidden aspect-video bg-black border border-zinc-900">
                    {attach.type === "image" && <img src={attach.url} alt="Post attachment" className="w-full h-full object-cover" />}
                    {attach.type === "video" &&
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Clapperboard className="w-6 h-6 text-red-500" />
                        <span className="text-[8px] text-zinc-400 absolute bottom-1">{isArabic ? "مقطع فيديو" : "Video clip"}</span>
                      </div>
                }
                    {attach.type === "audio" &&
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 gap-1 px-1">
                        <Mic className="w-4 h-4 text-emerald-500" />
                        <span className="text-[8px] text-zinc-400 truncate">{isArabic ? "تسجيل صوتي" : "Voice clip"}</span>
                      </div>
                }
                    {attach.type === "file" &&
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-1">
                        <FileText className="w-5 h-5 text-zinc-400" />
                        <span className="text-[8px] text-zinc-300 truncate max-w-full">{attach.name}</span>
                      </div>
                }
                    <button
                  type="button"
                  onClick={() => {handleTap();setAttachments((prev) => prev.filter((a) => a.id !== attach.id));}}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors">
                  
                      <X className="w-3 h-3" />
                    </button>
                  </div>
              )}
              </div>
            </div>
          }

          {/* SIMULATED AUDIO RECORDING SCREEN */}
          {isRecordingAudio &&
          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-mono font-black text-red-400">
                  {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] text-zinc-400">{isArabic ? "جارٍ تسجيل الصوت..." : "Recording live audio..."}</span>
              </div>
              <button
              type="button"
              onClick={toggleAudioRecording}
              className="bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl">
              
                {isArabic ? "إيقاف وحفظ" : "Stop & Save"}
              </button>
            </div>
          }

          {/* 7.3 & 7.4 ATTACHMENT ACTION BUTTONS TOOLBAR */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-2xl border border-zinc-900">
            <button
              type="button"
              onClick={() => handleMediaUpload("image")}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all">
              
              <ImageIcon className="w-4 h-4 text-red-500" />
              <span>{isArabic ? "صورة" : "Image"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleMediaUpload("video")}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all">
              
              <VideoIcon className="w-4 h-4 text-amber-500" />
              <span>{isArabic ? "فيديو" : "Video"}</span>
            </button>

            <button
              type="button"
              onClick={toggleAudioRecording}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all">
              
              <Mic className="w-4 h-4 text-emerald-500" />
              <span>{isArabic ? "تسجيل صوتي" : "Record Audio"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleMediaUpload("file")}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all">
              
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <span>{isArabic ? "مستند" : "Doc/File"}</span>
            </button>

            {/* Smart link trigger shortcut */}
            <button
              type="button"
              onClick={generateAndCopySmartLink}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all ml-auto font-mono">
              
              <Copy className="w-4 h-4 text-purple-500" />
              <span>{smartLinkCopied ? isArabic ? "تم النسخ" : "Copied!" : isArabic ? "رابط ذكي" : "Smart Link"}</span>
            </button>
          </div>

          {/* 7.14 INTEGRATED AI ASSISTANT PANEL */}
          <div className="border border-purple-900/30 bg-purple-950/5 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-xs font-black text-purple-300">{isArabic ? "مساعد النشر بالذكاء الاصطناعي (AI)" : "AI Publishing Assistant"}</span>
              </div>
              <button
                type="button"
                onClick={() => {handleTap();setShowAiAssistant(!showAiAssistant);}}
                className="text-[10px] text-purple-400 font-bold hover:underline">
                
                {showAiAssistant ? isArabic ? "إخفاء" : "Hide" : isArabic ? "توسيع الأدوات" : "Expand Tools"}
              </button>
            </div>

            {showAiAssistant &&
            <div className="space-y-3 animate-fade-in">
                <p className="text-[10px] text-zinc-400">
                  {isArabic ?
                "يقوم الذكاء الاصطناعي بتحسين النص، العثور على توقيت النشر، توليد الهاشتاقات أو تصفية العبارات المكررة." :
                "The AI helper allows you to refine your content, suggest hashtags, suggest peak hours or fix grammatical errors."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                  type="button"
                  onClick={() => askAiAssistant("improve")}
                  disabled={isAiProcessing}
                  className="p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 text-purple-300 text-[10px] font-bold rounded-xl transition-all">
                  
                    ✨ {isArabic ? "تحسين النص" : "Optimize Text"}
                  </button>

                  <button
                  type="button"
                  onClick={() => askAiAssistant("hashtags")}
                  disabled={isAiProcessing}
                  className="p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 text-purple-300 text-[10px] font-bold rounded-xl transition-all">
                  
                    🏷️ {isArabic ? "اقتراح وسم" : "Suggest Tags"}
                  </button>

                  <button
                  type="button"
                  onClick={() => askAiAssistant("title")}
                  disabled={isAiProcessing}
                  className="p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 text-purple-300 text-[10px] font-bold rounded-xl transition-all">
                  
                    📰 {isArabic ? "تحسين العنوان" : "Improve Title"}
                  </button>

                  <button
                  type="button"
                  onClick={() => askAiAssistant("time")}
                  disabled={isAiProcessing}
                  className="p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 text-purple-300 text-[10px] font-bold rounded-xl transition-all">
                  
                    ⏰ {isArabic ? "توقيت النشر" : "Posting Time"}
                  </button>
                </div>

                {isAiProcessing &&
              <div className="flex items-center gap-2 p-2 justify-center text-zinc-500 text-[10px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                    <span>{isArabic ? "جاري التفكير والتوليد عبر خوادم Gemini..." : "Thinking with Gemini intelligence..."}</span>
                  </div>
              }

                {aiOutput &&
              <div className="p-3 bg-zinc-900 border border-purple-900/40 rounded-xl space-y-2">
                    <span className="text-[9px] text-purple-400 font-bold block">{isArabic ? "اقتراح المساعد الذكي:" : "AI Assistant Suggestion:"}</span>
                    <p className="text-[11px] text-gray-200 leading-relaxed whitespace-pre-line">{aiOutput}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                    type="button"
                    onClick={() => {handleTap();setContent(aiOutput);}}
                    className="bg-purple-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg">
                    
                        {isArabic ? "اعتماد النص ونشره" : "Adopt & Use"}
                      </button>
                      <button
                    type="button"
                    onClick={() => setAiOutput("")}
                    className="text-zinc-500 text-[9px] font-bold px-2.5 py-1">
                    
                        {isArabic ? "تجاهل" : "Ignore"}
                      </button>
                    </div>
                  </div>
              }
              </div>
            }
          </div>

          {/* 7.6 PREPUBLISH SETTINGS PANEL (Audience, Comments, Sharing, atc) */}
          <div className="border border-zinc-900 bg-zinc-950 p-4.5 rounded-3xl space-y-3.5">
            <span className="text-[11px] font-black text-gray-400 block uppercase tracking-wider">🛠️ {isArabic ? "تخصيص إعدادات المنشور" : "Publishing Configuration settings"}</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Audience selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "🌍 الجمهور والمستهدف:" : "🌍 Targeted Audience:"}</span>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full bg-[#111] border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600">
                  
                  <option value="public">{isArabic ? "عام للجميع" : "Public (All users)"}</option>
                  <option value="followers">{isArabic ? "المتابعون فقط" : "Followers only"}</option>
                  <option value="friends">{isArabic ? "الأصدقاء المقربين" : "Friends only"}</option>
                  <option value="group">{isArabic ? "منشور لمجموعة" : "Group channel"}</option>
                  <option value="space">{isArabic ? "مجتمع مخصص (Space)" : "Specific Space"}</option>
                  <option value="private">{isArabic ? "خاص بي فقط" : "Private (Only me)"}</option>
                </select>
              </div>

              {/* Mentions selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "🏷️ منشن الإشارة:" : "🏷️ Mentions allowances:"}</span>
                <select
                  value={mentionsAllowed}
                  onChange={(e) => setMentionsAllowed(e.target.value as any)}
                  className="w-full bg-[#111] border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600">
                  
                  <option value="everyone">{isArabic ? "الجميع مسموح" : "Everyone"}</option>
                  <option value="followers">{isArabic ? "المتابعون فقط" : "Followers only"}</option>
                  <option value="none">{isArabic ? "لا أحد" : "Nobody"}</option>
                </select>
              </div>
            </div>

            {/* Quick toggles list (7.6) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-900 text-xs">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={commentsEnabled} onChange={() => setCommentsEnabled(!commentsEnabled)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "التعليقات مفعلة" : "Comments Enabled"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={likesEnabled} onChange={() => setLikesEnabled(!likesEnabled)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "الإعجابات مفعلة" : "Likes Enabled"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={sharingAllowed} onChange={() => setSharingAllowed(!sharingAllowed)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "السماح بالمشاركة" : "Allow Sharing"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={repostingAllowed} onChange={() => setRepostingAllowed(!repostingAllowed)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "السماح بإعادة النشر" : "Allow Re-posting"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={downloadAllowed} onChange={() => setDownloadAllowed(!downloadAllowed)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "السماح بالتحميل" : "Allow Download"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={starsEnabled} onChange={() => setStarsEnabled(!starsEnabled)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "التفاعل بالنجوم" : "Stars enabled"}</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={giftCoinsEnabled} onChange={() => setGiftCoinsEnabled(!giftCoinsEnabled)} className="rounded border-zinc-800 accent-red-600" />
                <span>{isArabic ? "إهداء Black Coin" : "Gift Black Coin"}</span>
              </label>
            </div>
          </div>

          {/* 7.7 PUBLISH SCHEDULER DRAWER TOGGLE */}
          <div className="bg-[#0b0b0c] border border-zinc-900 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                {isArabic ? "جدولة النشر التلقائي" : "Publish Scheduling Manager"}
              </span>
              <button
                type="button"
                onClick={() => {handleTap();setIsScheduled(!isScheduled);}}
                className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all ${
                isScheduled ? "bg-amber-600 text-white" : "bg-zinc-900 text-zinc-400"}`
                }>
                
                {isScheduled ? isArabic ? "مجدول" : "Scheduled" : isArabic ? "تفعيل الجدولة" : "Activate"}
              </button>
            </div>

            {isScheduled &&
            <div className="space-y-3.5 pt-1 border-t border-zinc-900 animate-fade-in text-xs text-zinc-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span>{isArabic ? "التاريخ المحدد:" : "Date:"}</span>
                    <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-white text-xs focus:outline-none" />
                  
                  </div>

                  <div className="space-y-1">
                    <span>{isArabic ? "الساعة بالتحديد:" : "Time:"}</span>
                    <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-white text-xs focus:outline-none" />
                  
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                    type="checkbox"
                    checked={isPeriodic}
                    onChange={() => setIsPeriodic(!isPeriodic)}
                    className="accent-amber-500 rounded border-zinc-800" />
                  
                    <span>{isArabic ? "إعادة النشر الدوري" : "Periodic Reposting"}</span>
                  </label>

                  {isPeriodic &&
                <select
                  value={periodicFrequency}
                  onChange={(e) => setPeriodicFrequency(e.target.value as any)}
                  className="bg-zinc-900 text-white text-xs p-1.5 rounded-xl focus:outline-none">
                  
                      <option value="daily">{isArabic ? "يوميًا" : "Daily"}</option>
                      <option value="weekly">{isArabic ? "أسبوعيًا" : "Weekly"}</option>
                      <option value="monthly">{isArabic ? "شهريًا" : "Monthly"}</option>
                    </select>
                }
                </div>
              </div>
            }
          </div>

          {/* DRAFTS SAVE CONTROL BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => saveDraft(false)}
              disabled={!content.trim() && !title.trim() && attachments.length === 0}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-gray-300 py-3 rounded-2xl text-xs font-bold transition-all border border-zinc-800">
              
              💾 {isArabic ? "حفظ كمسودة" : "Save Draft"}
            </button>

            {/* MAIN PUBLISH ACTIONS BUTTON */}
            <button
              type="button"
              onClick={handlePrePublishCheck}
              disabled={!content.trim() && attachments.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-red-600/10 flex items-center justify-center gap-2">
              
              <Send className="w-4 h-4" />
              <span>
                {isScheduled ?
                isArabic ? "جدولة المنشور التلقائي" : "Publish Scheduled" :
                isArabic ? "نشر بمجتمع أنمي بلاك" : "Publish to Anime Black"}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* PHONE PERMISSION SIMULATOR MODALS */}
      <AnimatePresence>
        {activePermissionDialog &&
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            
              <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-200">
                {isArabic ? "طلب إذن النظام للجهاز" : "System Permission Request"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activePermissionDialog === "photos" && (isArabic ? "نحتاج للوصول لمكتبة الصور لاختيار لقطات الانمي المناسبة لمنشورك." : "We need photos access so you can pick anime highlight clips and screenshots.")}
                {activePermissionDialog === "camera" && (isArabic ? "نحتاج لاستخدام الكاميرا لتسجيل قصص وتفاعل مباشر وحصري." : "Camera access required to record high-impact otaku stories directly.")}
                {activePermissionDialog === "mic" && (isArabic ? "نحتاج للوصول للميكروفون لتسجيل تعليقك الصوتي ومراجعته فورًا." : "Microphone access is required to record voiceovers and reactions.")}
                {activePermissionDialog === "files" && (isArabic ? "نحتاج للوصول لمدير الملفات لرفع مراجعات المانجا وملفات pdf الكبيرة." : "Files manager access is needed for uploading large PDF manga logs.")}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                type="button"
                onClick={() => handlePermissionResponse(activePermissionDialog, false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl text-xs font-bold transition-all">
                
                  {isArabic ? "رفض" : "Don't Allow"}
                </button>
                <button
                type="button"
                onClick={() => handlePermissionResponse(activePermissionDialog, true)}
                className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all">
                
                  {isArabic ? "سماح" : "Allow"}
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* SHOWN IF DENIED (HOW TO ENABLE FROM SETTINGS GUIDE) */}
      <AnimatePresence>
        {showSettingsBypassModal &&
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-200 text-center">
                {isArabic ? "كيفية التفعيل من إعدادات الهاتف" : "How to Enable via Phone Settings"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed text-right">
                {isArabic ? "لقد تم رفض هذا الإذن سابقًا. يرجى اتباع الآتي لتفعيله:" : "This permission has been restricted. Follow these steps to grant access:"}
              </p>
              <div className="p-3 bg-zinc-900 rounded-xl space-y-2 text-[11px] text-zinc-300">
                <p>1. {isArabic ? "افتح إعدادات الهاتف (Settings)" : "Open phone Settings app."}</p>
                <p>2. {isArabic ? "ابحث عن تطبيق أنمي بلاك (Anime Black)" : "Find 'Anime Black' in the apps list."}</p>
                <p>3. {isArabic ? "اضغط على الأذونات (Permissions) وقم بتفعيل الوصول." : "Tap Permissions and toggle requested features to Allowed."}</p>
              </div>
              <button
              type="button"
              onClick={() => {handleTap();setShowSettingsBypassModal(false);}}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all">
              
                {isArabic ? "فهمت" : "Got it"}
              </button>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* AUTO REVIEW WARNINGS MODAL (7.15) */}
      <AnimatePresence>
        {reviewWarning &&
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-200 text-center">
                {reviewWarning.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed text-center">
                {reviewWarning.desc}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                type="button"
                onClick={() => setReviewWarning(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl text-xs font-bold transition-all">
                
                  {isArabic ? "تعديل المنشور" : "Edit Post"}
                </button>
                <button
                type="button"
                onClick={reviewWarning.triggerConfirm}
                className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all">
                
                  {isArabic ? "النشر على أي حال" : "Publish Anyway"}
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* CHUNK UPLOAD PROGRESS OVERLAY (7.16 & 7.21) */}
      <AnimatePresence>
        {uploadProgress !== null &&
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-6">
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xs w-full text-center space-y-4">
            
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                <div
                className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: "1s" }} />
              
                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-black">
                  {uploadProgress}%
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-200">{uploadPhase}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {isArabic ? "محرك النشر الموحد يقوم بالرفع على أجزاء..." : "Uploading chunks via multi-part upload protocols..."}
                </p>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* SUCCESS & XP REWARD MODAL (7.16) */}
      <AnimatePresence>
        {showSuccessModal &&
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            
              <div className="absolute top-[-40%] right-[-30%] w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
              
              <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-600/20 text-white animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  {isArabic ? "تم النشر والتكامل بنجاح!" : "Published & Integrated Successfully!"}
                </h3>
                <p className="text-[10px] text-zinc-500">
                  {isArabic ? "تم تحديث مستكشف الأنمي والصفحة الرئيسية ونقاط النشاط فورياً." : "The main feed, search engine, and activity indexes have been updated."}
                </p>
              </div>

              {/* Reward Block */}
              <div className="p-3.5 bg-zinc-900 border border-zinc-850 rounded-2xl grid grid-cols-2 gap-3">
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 font-bold">{isArabic ? "نقاط الخبرة XP" : "XP Gained"}</span>
                  <span className="text-xs font-mono font-black text-red-500">+{showSuccessModal.xp} XP</span>
                </div>
                <div className="text-center border-r border-zinc-800">
                  <span className="block text-[10px] text-zinc-500 font-bold">{isArabic ? "عملات بلاك" : "Black Coins"}</span>
                  <span className="text-xs font-mono font-black text-amber-500">+{showSuccessModal.coins} BC</span>
                </div>
              </div>

              <button
              type="button"
              onClick={() => setShowSuccessModal(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-black transition-all">
              
                {isArabic ? "استلام المكافآت والعودة" : "Claim Rewards & Done"}
              </button>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* DRAFTS DRAWER (7.8) */}
      <AnimatePresence>
        {showDraftsDrawer &&
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowDraftsDrawer(false)} />
            <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-zinc-950 border-l border-zinc-800 w-full max-w-sm h-full flex flex-col relative z-10 shadow-2xl">
            
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">{isArabic ? "مدير المسودات المتزامنة" : "Synced Drafts Manager"}</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "المسودات تحفظ تلقائيًا وتتزامن عبر أجهزة الأوتوكو" : "Drafts are auto-saved and synced in real-time"}</p>
                </div>
                <button onClick={() => setShowDraftsDrawer(false)} className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {drafts.length === 0 ?
              <div className="text-center py-12 text-zinc-600 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-zinc-800" />
                    <p className="text-xs">{isArabic ? "لا توجد مسودات حالية." : "No saved drafts yet."}</p>
                  </div> :

              drafts.map((d, _autoIdx) =>
              <div
                key={`${d.id}_${_autoIdx}`}
                onClick={() => loadDraft(d)}
                className="p-3 bg-[#0d0d0e] hover:bg-zinc-900 border border-zinc-900 rounded-xl cursor-pointer transition-colors space-y-1.5">
                
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-gray-200 truncate max-w-[180px]">{d.title}</span>
                        <div className="flex gap-1">
                          <button
                      type="button"
                      onClick={(e) => sendPostToTrash(d)}
                      className="p-1 text-zinc-600 hover:text-red-500">
                      
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-400 line-clamp-2 leading-relaxed">{d.content}</p>
                      <div className="flex justify-between items-center pt-1 text-[8px] text-zinc-600">
                        <span className="font-mono">{d.updatedAt}</span>
                        <span className="bg-red-950/40 text-red-400 border border-red-900/30 px-1 py-0.5 rounded font-bold capitalize">{d.category}</span>
                      </div>
                    </div>
              )
              }
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* TRASH BIN DRAWER (7.19) */}
      <AnimatePresence>
        {showTrashDrawer &&
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowTrashDrawer(false)} />
            <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-zinc-950 border-l border-zinc-800 w-full max-w-sm h-full flex flex-col relative z-10 shadow-2xl">
            
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">🗑️ {isArabic ? "سلة المحذوفات" : "Trash Recovery Bin"}</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "المحذوفات تحفظ لمدة ٣٠ يومًا قبل الحذف النهائي" : "Deleted items stay in trash for 30 days before purge"}</p>
                </div>
                <button onClick={() => setShowTrashDrawer(false)} className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {trashPosts.length === 0 ?
              <div className="text-center py-12 text-zinc-600 space-y-2">
                    <Trash2 className="w-8 h-8 mx-auto text-zinc-800" />
                    <p className="text-xs">{isArabic ? "سلة المحذوفات فارغة." : "Trash is completely empty."}</p>
                  </div> :

              trashPosts.map((t, _autoIdx) =>
              <div
                key={`${t.id}_${_autoIdx}`}
                className="p-3 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-2">
                
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-gray-200 truncate max-w-[180px]">{t.title}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">
                          {isArabic ? `متبقي: ${t.expiresInDays} يوم` : `${t.expiresInDays}d left`}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-400 line-clamp-2 leading-relaxed">{t.content}</p>
                      
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-900 text-[9px]">
                        <button
                    type="button"
                    onClick={() => restoreFromTrash(t)}
                    className="text-emerald-500 hover:underline font-bold">
                    
                          ♻️ {isArabic ? "استعادة للغرفة" : "Restore Draft"}
                        </button>
                        <button
                    type="button"
                    onClick={() => {
                      handleTap();
                      const updated = trashPosts.filter((p) => p.id !== t.id);
                      setTrashPosts(updated);
                      localStorage.setItem("anime_black_trash_bin", JSON.stringify(updated));
                    }}
                    className="text-red-500 hover:underline font-bold">
                    
                          {isArabic ? "حذف نهائي" : "Purge Now"}
                        </button>
                      </div>
                    </div>
              )
              }
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* SCHEDULED POSTS MANAGER MODAL (7.7) */}
      <AnimatePresence>
        {showScheduleManager &&
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowScheduleManager(false)} />
            <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-zinc-950 border-l border-zinc-800 w-full max-w-sm h-full flex flex-col relative z-10 shadow-2xl">
            
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">📅 {isArabic ? "المنشورات المجدولة" : "Scheduled Content Queue"}</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{isArabic ? "قائمة المنشورات المجهزة للنشر التلقائي لاحقًا" : "Queue of posts fully automated for target delivery times"}</p>
                </div>
                <button onClick={() => setShowScheduleManager(false)} className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {scheduledPosts.length === 0 ?
              <div className="text-center py-12 text-zinc-600 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-zinc-800" />
                    <p className="text-xs">{isArabic ? "لا توجد منشورات مجدولة حاليًا." : "No scheduled posts currently."}</p>
                  </div> :

              scheduledPosts.map((s, _autoIdx) =>
              <div
                key={`${s.id}_${_autoIdx}`}
                className="p-3 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-1.5">
                
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-gray-200 truncate max-w-[180px]">{s.title}</span>
                        <button
                    type="button"
                    onClick={() => {
                      handleTap();
                      const updated = scheduledPosts.filter((p) => p.id !== s.id);
                      setScheduledPosts(updated);
                      localStorage.setItem("anime_black_scheduled", JSON.stringify(updated));
                    }}
                    className="text-[9px] text-red-500 hover:underline">
                    
                          {isArabic ? "إلغاء الجدولة" : "Cancel"}
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-400 line-clamp-2 leading-relaxed">{s.content}</p>
                      
                      <div className="flex items-center gap-1 text-[8px] text-amber-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{s.scheduledAt}</span>
                        {s.isPeriodic &&
                  <span className="bg-amber-950/40 border border-amber-900/30 px-1 py-0.5 rounded font-bold capitalize">
                            {s.periodicFrequency}
                          </span>
                  }
                      </div>
                    </div>
              )
              }
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* 7.18 PUBLISHING MANAGEMENT SYSTEM OVERLAY */}
      <AnimatePresence>
        {showPublishingSettingsModal && (
          <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
            <PublishingManagementSystem
              isArabic={isArabic}
              currentUser={currentUser}
              posts={posts}
              setPosts={setPosts}
              playSynthSound={playSynthSound}
              triggerHapticFeedback={triggerHapticFeedback}
              triggerInAppNotification={triggerInAppNotification}
              onClose={() => setShowPublishingSettingsModal(false)}
              onOpenPublisher={() => setShowPublishingSettingsModal(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>);
}