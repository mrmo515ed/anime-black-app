import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  AlertOctagon,
  Ticket,
  FileText,
  MessageSquare,
  Video,
  BookOpen,
  Calendar,
  Hash,
  Radio,
  Tv,
  Award,
  Compass,
  Store,
  Package,
  Palette,
  CreditCard,
  Coins,
  Star,
  BarChart3,
  History,
  Sliders,
  UserCheck,
  Lock,
  Unlock,
  Send,
  Check,
  X,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Smartphone,
  Cpu,
  Flame,
  MapPin,
  Clock,
  Settings,
  Plus,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  HelpCircle,
  ThumbsUp,
  UserX,
  Activity,
  Layers,
  Zap,
  Fingerprint } from
"lucide-react";
import { User, UserRole, VerificationType } from "../types";
import {
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_ADMIN_USERS,
  INITIAL_REPORTS,
  INITIAL_TICKETS,
  INITIAL_CONTENT,
  INITIAL_ECONOMY,
  INITIAL_AUDIT_LOGS,
  INTERNAL_KNOWLEDGE_BASE,
  AdminUser,
  AdminReport,
  AdminTicket,
  AdminContentItem,
  AdminEconomyItem,
  AdminAuditLog } from
"./AdminMockData";

interface AdministrationSystemProps {
  isArabic: boolean;
  currentUser: User;
  setCurrentUser: (u: User) => void;
  playSynthSound?: (sound: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback?: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification?: (title: string, desc: string, type: string) => void;
  triggerCelebration?: (
  type: "levelup" | "prestige" | "rarebox" | "legendarycard" | "blackcoin" | "achievement" | "verification",
  titleAr: string,
  titleEn: string,
  descAr: string,
  descEn: string,
  reward?: string)
  => void;
  onClose: () => void;
}

export default function AdministrationSystem({
  isArabic,
  currentUser,
  setCurrentUser,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  triggerCelebration,
  onClose
}: AdministrationSystemProps) {
  // --- CORE STATE ---
  const [activeTabGroup, setActiveTabGroup] = useState<"moderation" | "economy" | "analytics" | "tools">("moderation");
  const [activeSection, setActiveSection] = useState<string>("users");

  // Custom Role Simulation
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(currentUser.role as UserRole || "SuperAdministrator");
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(INITIAL_ROLE_PERMISSIONS);
  const [showConfirm2FA, setShowConfirm2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [requireSecurityConfirm, setRequireSecurityConfirm] = useState(true);

  // Lists
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [reports, setReports] = useState<AdminReport[]>(INITIAL_REPORTS);
  const [tickets, setTickets] = useState<AdminTicket[]>(INITIAL_TICKETS);
  const [contentItems, setContentItems] = useState<AdminContentItem[]>(INITIAL_CONTENT);
  const [economyItems, setEconomyItems] = useState<AdminEconomyItem[]>(INITIAL_ECONOMY);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Selected Detail Views
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Create Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "user",
    targetName: "",
    reason: "",
    description: "",
    screenshot: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    evidenceLink: "",
    notes: ""
  });

  // Punishment Modals & forms
  const [punishingUser, setPunishingUser] = useState<AdminUser | null>(null);
  const [punishmentForm, setPunishmentForm] = useState({
    type: "mute" as "warn" | "mute" | "comment_block" | "post_block" | "message_block" | "group_block" | "event_block" | "timeout" | "ban",
    reason: "",
    duration: "24 hours",
    caseNumber: ""
  });

  // Appeal System state
  const [showBannedScreen, setShowBannedScreen] = useState(false);
  const [bannedUserSim, setBannedUserSim] = useState<{
    reasonAr: string;
    reasonEn: string;
    durationAr: string;
    durationEn: string;
    caseNumber: string;
    executor: string;
    history: {date: string;violation: string;action: string;}[];
    appealStatus: "none" | "submitted" | "approved" | "rejected";
    appealEvidence: string;
  }>({
    reasonAr: "مخالفة الآداب العامة وإرسال رسائل حرق أحداث مسيئة بشكل متكرر",
    reasonEn: "Spamming offensive spoilers and violating community etiquette repeatedly",
    durationAr: "دائم (أو حتى قبول الاعتراض)",
    durationEn: "Permanent (or until appeal approval)",
    caseNumber: "CASE-908122",
    executor: "LeviAckerman (Senior Moderator)",
    history: [
    { date: "2026-07-02", violation: "حرق أحداث جوجوتسو", action: "تنبيه" },
    { date: "2026-07-04", violation: "كلام بذيء في التعليقات", action: "كتم 24 ساعة" }],

    appealStatus: "none",
    appealEvidence: ""
  });

  // --- AI MODERATION COMMAND CENTER STATE ---
  const [moderationPolicy, setModerationPolicy] = useState<"review_by_human" | "automated_removal">("review_by_human");
  const [strictness, setStrictness] = useState<"standard" | "strict">("standard");
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [hateSpeechEnabled, setHateSpeechEnabled] = useState<boolean>(true);
  const [nudityEnabled, setNudityEnabled] = useState<boolean>(true);
  const [spamEnabled, setSpamEnabled] = useState<boolean>(true);

  // AI Moderation Queue (real-time from Firestore, fallback to mock data)
  const [aiQueue, setAiQueue] = useState<any[]>([]);

  // Sandbox State
  const [sandboxText, setSandboxText] = useState("");
  const [isSandboxAnalyzing, setIsSandboxAnalyzing] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);

  // --- APK MANAGEMENT & STORAGE VALIDATION STATE ---
  const [apkStatus, setApkStatus] = useState<{
    exists: boolean;
    valid: boolean;
    size: number;
    sizeFormatted: string;
    version: string;
    packageName: string;
    buildLog: string;
    lastModified?: string;
  } | null>(null);
  const [apkValidationError, setApkValidationError] = useState<string | null>(null);
  const [isBuildingApk, setIsBuildingApk] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Validation Logic: Checks if APK file exists in storage server and size > 500KB
  const validateApkInStorage = (status: typeof apkStatus): { isValid: boolean; errorMsg: string | null } => {
    if (!status) {
      return {
        isValid: false,
        errorMsg: isArabic ? "جاري التحقق من وجود وحجم ملف الـ APK في خادم التخزين..." : "Checking APK presence and size on storage server..."
      };
    }
    if (!status.exists) {
      return {
        isValid: false,
        errorMsg: isArabic
          ? "🚨 خطأ: ملف الـ APK غير متوفر في مسار التخزين (Storage). يرجى الضغط على 'إعادة بناء حزمة الـ APK'."
          : "🚨 Error: APK file is missing in storage path. Please click 'Rebuild APK Package'."
      };
    }
    const MIN_REQUIRED_SIZE = 500 * 1024; // 500 KB
    if (status.size < MIN_REQUIRED_SIZE) {
      return {
        isValid: false,
        errorMsg: isArabic
          ? `🚨 خطأ: ملف الـ APK تالف أو غير مكتمل (الحجم الحالي ${status.sizeFormatted} أصغر من 500KB المطلوبة). يرجى الضغط على 'إعادة البناء'.`
          : `🚨 Error: APK file is corrupted or incomplete (Current size ${status.sizeFormatted} is less than 500KB required). Please rebuild.`
      };
    }
    return { isValid: true, errorMsg: null };
  };

  const fetchAdminApkStatus = async () => {
    try {
      const res = await fetch("/api/apk/status");
      if (res.ok) {
        const data = await res.json();
        setApkStatus(data);
        const val = validateApkInStorage(data);
        setApkValidationError(val.isValid ? null : val.errorMsg);
      }
    } catch (e) {
      console.error("Failed to check APK status in Admin", e);
      setApkValidationError(
        isArabic
          ? "فشل الاتصال بخادم التخزين للتحقق من ملف الـ APK"
          : "Failed to connect to storage server to verify APK file"
      );
    }
  };

  useEffect(() => {
    if (activeSection === "apk_management") {
      fetchAdminApkStatus();
    }
  }, [activeSection]);

  // Admin Download Trigger with Pre-Validation Logic
  const handleAdminApkDownload = async () => {
    setApkValidationError(null);
    setDownloadProgress(10);

    // 1. Fetch fresh status from storage server
    let currentStatus = apkStatus;
    try {
      const res = await fetch("/api/apk/status");
      if (res.ok) {
        currentStatus = await res.json();
        setApkStatus(currentStatus);
      }
    } catch {}

    // 2. Validate existence and size > 500KB
    const val = validateApkInStorage(currentStatus);
    if (!val.isValid) {
      setApkValidationError(val.errorMsg);
      setDownloadProgress(null);
      playSound("error");
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "⚠️ خطأ في تنزيل APK" : "⚠️ APK Download Error",
          val.errorMsg || "",
          "error"
        );
      }
      return;
    }

    // 3. Initiate direct download with headers validation & streaming progress
    setDownloadProgress(10);
    try {
      const response = await fetch("/api/download/apk");
      if (!response.ok) {
        let errDesc = isArabic ? "تعذر تنزيل الملف من السيرفر" : "Failed to fetch file from server";
        try {
          const jsonErr = await response.json();
          errDesc = jsonErr.error || jsonErr.details || errDesc;
        } catch {}
        setApkValidationError(errDesc);
        setDownloadProgress(null);
        playSound("error");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const htmlErrMsg = isArabic
          ? "خطأ: تلقى السيرفر استجابة غير صحيحة بدلاً من حزمة APK."
          : "Received invalid HTML response instead of APK package.";
        setApkValidationError(htmlErrMsg);
        setDownloadProgress(null);
        playSound("error");
        return;
      }

      setDownloadProgress(20);
      const contentLength = parseInt(response.headers.get("content-length") || "0", 10) || currentStatus?.size || 0;
      let blob: Blob;

      if (response.body && contentLength > 0) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loadedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loadedBytes += value.length;
            const pct = Math.min(99, Math.max(25, Math.round((loadedBytes / contentLength) * 100)));
            setDownloadProgress(pct);
          }
        }
        blob = new Blob(chunks, { type: "application/vnd.android.package-archive" });
      } else {
        setDownloadProgress(75);
        blob = await response.blob();
      }

      if (blob.size < 500 * 1024) {
        const sizeErrMsg = isArabic
          ? `الملف المحمل بحجم (${(blob.size / (1024 * 1024)).toFixed(2)} MB) أقل من الحد الأدنى 500KB.`
          : `Downloaded file size is under the 500KB minimum required threshold.`;
        setApkValidationError(sizeErrMsg);
        setDownloadProgress(null);
        playSound("error");
        return;
      }

      setDownloadProgress(100);
      playSound("success");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = "AnimeBlack-v2.5.0-Release.apk";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setDownloadProgress(null);
      }, 1500);
    } catch (err) {
      setApkValidationError(isArabic ? "حدث خطأ في الشبكة أثناء تنزيل الملف" : "Network error downloading APK file");
      setDownloadProgress(null);
      playSound("error");
    }
  };

  const handleAdminRebuildApk = async () => {
    setIsBuildingApk(true);
    setApkValidationError(null);
    playSound("tap");

    try {
      const res = await fetch("/api/apk/build", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "✅ إتمام بناء الـ APK" : "✅ APK Built Successfully",
            isArabic ? `الحجم النهائي: ${data.sizeFormatted}` : `Final Size: ${data.sizeFormatted}`,
            "success"
          );
        }
        playSound("levelup");
      } else {
        const err = data.error || data.details || "Failed to build APK";
        setApkValidationError(err);
        playSound("error");
      }
    } catch (e) {
      setApkValidationError(isArabic ? "فشل الاتصال بالخادم لبناء الـ APK" : "Network error while building APK");
      playSound("error");
    } finally {
      setIsBuildingApk(false);
      fetchAdminApkStatus();
    }
  };

  // Firestore synchronization and default seed data
  useEffect(() => {
    let unsubQueue = () => {};
    let unsubSettings = () => {};

    const initFirebaseMod = async () => {
      try {
        const { db } = await import("../firebase");
        const { doc, collection, onSnapshot, setDoc } = await import("firebase/firestore");

        // 1. Listen to settings document
        const settingsRef = doc(db, "settings", "moderation");
        unsubSettings = onSnapshot(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.policy) setModerationPolicy(data.policy);
            if (data.strictness) setStrictness(data.strictness);
            if (data.confidenceThreshold !== undefined) setConfidenceThreshold(data.confidenceThreshold);
            if (data.hateSpeechEnabled !== undefined) setHateSpeechEnabled(data.hateSpeechEnabled);
            if (data.nudityEnabled !== undefined) setNudityEnabled(data.nudityEnabled);
            if (data.spamEnabled !== undefined) setSpamEnabled(data.spamEnabled);
          } else {
            // Seed default settings if they do not exist
            setDoc(settingsRef, {
              policy: "review_by_human",
              strictness: "standard",
              confidenceThreshold: 75,
              hateSpeechEnabled: true,
              nudityEnabled: true,
              spamEnabled: true
            }).catch(console.error);
          }
        });

        // 2. Listen to moderation reports collection
        const reportsRef = collection(db, "moderation_reports");
        unsubQueue = onSnapshot(reportsRef, (snapshot) => {
          const items: any[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });

          // Sort items by createdAt descending
          items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          // If Firestore collection is empty, seed it with initial mockup data
          if (items.length === 0) {
            const seedData = [
            {
              id: "rep_seed_1",
              contentType: "post",
              contentId: "post_mod_1",
              content: "هذا العضو غبي جداً ولا يستحق البقاء في المنصة، والأنمي الذي يفضله هو أسوأ أنمي رأيته في حياتي وجميع عشاقه حثالة ولا يفهمون شيئاً!",
              authorId: "user_seed_1",
              authorName: "GamerSpammer",
              flaggedCategory: "hate_speech",
              confidence: 0.94,
              reasonEn: "AI detected severe toxic hostility and derogatory slurs directed at specific community members.",
              reasonAr: "اكتشف الذكاء الاصطناعي عداءً ساماً شديداً وإهانات موجهة لأعضاء محددين في المجتمع.",
              status: "pending",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              actionTaken: "flagged_for_review"
            },
            {
              id: "rep_seed_2",
              contentType: "comment",
              contentId: "comment_mod_2",
              content: "شاهدوا تسريبات آرك هيد الرائعة بدون حجب على موقعنا المثير والمجاني ومكافآت مجانية لكل من يسجل الآن: http://scam-fake-anime-leaks.cc/freecoins",
              authorId: "user_seed_2",
              authorName: "ScamBotOtaku",
              flaggedCategory: "spam",
              confidence: 0.97,
              reasonEn: "AI detected cryptocurrency/phishing suspicious scam link patterns and repeated promotional format.",
              reasonAr: "اكتشف الذكاء الاصطناعي نمط روابط مشبوهة احتيالية وترويج مكرر.",
              status: "pending",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              actionTaken: "flagged_for_review"
            },
            {
              id: "rep_seed_3",
              contentType: "message",
              contentId: "msg_mod_3",
              content: "تباً لكم يا كارهي ون بيس يا حثالة، يا ليتكم تموتون وتتخلص البشرية من غبائكم اللامتناهي. سوف أبحث عنكم وسأقضي عليكم فرداً فرداً.",
              authorId: "user_seed_3",
              authorName: "ZoroFanToxic",
              flaggedCategory: "hate_speech",
              confidence: 0.91,
              reasonEn: "AI detected extreme cyberbullying and physical violence threats.",
              reasonAr: "اكتشف الذكاء الاصطناعي تنمراً إلكترونياً شديداً وتهديدات بالعنف الجسدي.",
              status: "pending",
              createdAt: new Date(Date.now() - 10800000).toISOString(),
              actionTaken: "flagged_for_review"
            }];


            // Add to firestore so it's initialized and persistent
            seedData.forEach(async (docData) => {
              try {
                await setDoc(doc(db, "moderation_reports", docData.id), docData);
              } catch (e) {
                console.error("Error seeding report:", e);
              }
            });
            setAiQueue(seedData);
          } else {
            setAiQueue(items);
          }
        });

      } catch (err) {
        console.warn("Firestore offline/missing during admin AI setup. Using mock states.");
        setAiQueue([
        {
          id: "rep_seed_1",
          contentType: "post",
          contentId: "post_mod_1",
          content: "هذا العضو غبي جداً ولا يستحق البقاء في المنصة، والأنمي الذي يفضله هو أسوأ أنمي رأيته في حياتي وجميع عشاقه حثالة ولا يفهمون شيئاً!",
          authorId: "user_seed_1",
          authorName: "GamerSpammer",
          flaggedCategory: "hate_speech",
          confidence: 0.94,
          reasonEn: "AI detected severe toxic hostility and derogatory slurs directed at specific community members.",
          reasonAr: "اكتشف الذكاء الاصطناعي عداءً ساماً شديداً وإهانات موجهة لأعضاء محددين في المجتمع.",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actionTaken: "flagged_for_review"
        },
        {
          id: "rep_seed_2",
          contentType: "comment",
          contentId: "comment_mod_2",
          content: "شاهدوا تسريبات آرك هيد الرائعة بدون حجب على موقعنا المثير والمجاني ومكافآت مجانية لكل من يسجل الآن: http://scam-fake-anime-leaks.cc/freecoins",
          authorId: "user_seed_2",
          authorName: "ScamBotOtaku",
          flaggedCategory: "spam",
          confidence: 0.97,
          reasonEn: "AI detected cryptocurrency/phishing suspicious scam link patterns and repeated promotional format.",
          reasonAr: "اكتشف الذكاء الاصطناعي نمط روابط مشبوهة احتيالية وترويج مكرر.",
          status: "pending",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          actionTaken: "flagged_for_review"
        }]
        );
      }
    };

    initFirebaseMod();

    return () => {
      unsubQueue();
      unsubSettings();
    };
  }, []);

  const handleSaveModSettings = async () => {
    try {
      const { db } = await import("../firebase");
      const { doc, setDoc } = await import("firebase/firestore");

      await setDoc(doc(db, "settings", "moderation"), {
        policy: moderationPolicy,
        strictness: strictness,
        confidenceThreshold: confidenceThreshold,
        hateSpeechEnabled: hateSpeechEnabled,
        nudityEnabled: nudityEnabled,
        spamEnabled: spamEnabled,
        updatedAt: new Date().toISOString()
      });

      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "🛡️ تم حفظ الإعدادات" : "🛡️ Settings Saved",
          isArabic ? "تم تحديث قواعد إشراف الذكاء الاصطناعي بنجاح." : "AI moderation rules updated successfully.",
          "success"
        );
      }
      if (playSynthSound) playSynthSound("success");
    } catch (e) {
      console.error(e);
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "🛡️ تم الحفظ محلياً" : "🛡️ Saved Locally",
          isArabic ? "تم تحديث قواعد الإشراف في الجلسة الحالية." : "AI moderation updated for current session.",
          "success"
        );
      }
    }
  };

  const handleResolveReport = async (reportId: string, action: "approve" | "delete") => {
    try {
      const { db } = await import("../firebase");
      const { doc, deleteDoc, updateDoc, getDoc } = await import("firebase/firestore");

      const reportRef = doc(db, "moderation_reports", reportId);
      const reportSnap = await getDoc(reportRef);

      if (reportSnap.exists()) {
        const reportData = reportSnap.data();

        if (action === "approve") {
          await updateDoc(reportRef, { status: "approved", actionTaken: "approved_by_human" });

          if (reportData.contentType === "post" && reportData.contentId) {
            try {
              const itemRef = doc(db, "posts", reportData.contentId);
              await updateDoc(itemRef, { flagged: false, moderationStatus: "approved" });
            } catch (postErr) {
              console.warn("Could not unflag original post:", postErr);
            }
          }

          if (triggerInAppNotification) {
            triggerInAppNotification(
              isArabic ? "✅ تم الموافقة على المحتوى" : "✅ Content Approved",
              isArabic ? "تمت إزالة العلامة عن المحتوى واعتباره آمناً." : "Content cleared and marked as safe.",
              "success"
            );
          }
        } else {
          await updateDoc(reportRef, { status: "removed", actionTaken: "removed_by_human" });

          if (reportData.contentType === "post" && reportData.contentId) {
            try {
              const itemRef = doc(db, "posts", reportData.contentId);
              await deleteDoc(itemRef);
            } catch (postErr) {
              console.warn("Could not delete original post:", postErr);
            }
          }

          if (triggerInAppNotification) {
            triggerInAppNotification(
              isArabic ? "🗑️ تم حذف المحتوى" : "🗑️ Content Deleted",
              isArabic ? "تم حذف المحتوى المخالف بنجاح من جميع الخوادم." : "Offending content deleted from servers.",
              "error"
            );
          }
        }

        if (playSynthSound) playSynthSound("success");
      }
    } catch (e) {
      console.error(e);
      setAiQueue((prev) => prev.filter((item) => item.id !== reportId));
    }
  };

  const handleAnalyzeSandbox = async () => {
    if (!sandboxText.trim()) return;
    setIsSandboxAnalyzing(true);
    setSandboxResult(null);
    if (playSynthSound) playSynthSound("tap");

    try {
      const res = await fetch("/api/ai/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sandboxText, contentType: "post" })
      });
      const data = await res.json();
      setSandboxResult(data);
      if (playSynthSound) playSynthSound(data.flagged ? "error" : "success");
    } catch (e) {
      console.error(e);
      setSandboxResult({
        flagged: false,
        category: "safe",
        confidence: 0.5,
        reasonEn: "Error analyzing text. Server returned fallback.",
        reasonAr: "خطأ أثناء تحليل النص. عاد الملقم بالقيمة الافتراضية."
      });
      if (playSynthSound) playSynthSound("error");
    } finally {
      setIsSandboxAnalyzing(false);
    }
  };

  // Verification Requests state
  const [verificationRequests, setVerificationRequests] = useState([
  {
    id: "VER-101",
    targetName: "ZoroFan",
    type: "creator",
    fullName: "رورونوا زورو",
    reason: "محرر فيديوهات أنمي ولديه قناة يوتيوب بها 15 ألف مشترك.",
    status: "pending" as "pending" | "approved" | "rejected",
    createdAt: "2026-07-05T04:20:00Z"
  },
  {
    id: "VER-102",
    targetName: "مجموعة أوتاكو العرب",
    type: "official",
    fullName: "مجتمع أوتاكو العرب الرسمي",
    reason: "أكبر نقابة نشطة حالياً في قسم المساحات تتجاوز 10,000 عضو.",
    status: "pending" as "pending" | "approved" | "rejected",
    createdAt: "2026-07-05T05:00:00Z"
  }]
  );

  // SLA Timers ticking down simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setReports((prevReports) =>
      prevReports.map((rep, _autoIdx) => ({
        ...rep,
        remainingMinutes: rep.remainingMinutes > 1 ? rep.remainingMinutes - 1 : 1
      }))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPER FUNCTION FOR HIERARCHY RULES ---
  const getRoleLevel = (role: UserRole) => {
    if (role === "Owner") return 11;
    if (role === "SuperAdministrator") return 10;
    if (role === "Administrator") return 9;
    if (role === "SectionManager") return 8;
    if (role === "SeniorModerator") return 7;
    if (role === "Moderator") return 6;
    if (role === "TraineeModerator") return 5;
    if (role === "NewsCreator" || role === "EventCreator" || role === "Creator") return 3;
    if (role === "PremiumBlack" || role === "BetaTester") return 2;
    return 1; // Member
  };

  const hasPermission = (permission: string) => {
    const myPerms = rolePermissions[simulatedRole] || [];
    if (simulatedRole === "Owner" || simulatedRole === "SuperAdministrator") return true;
    return myPerms.includes(permission);
  };

  // Log action
  const logAdminAction = (action: string, reason: string, result: string, target: string) => {
    const newLog: AdminAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      executor: "You (Simulated)",
      role: simulatedRole,
      action: `${action} [Target: ${target}]`,
      device: "macOS • Chrome",
      ip: "192.168.1.104",
      reason: reason || "الإجراء الإداري القياسي",
      result: result
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Trigger synth helper
  const playSound = (sound: string) => {
    let mappedSound: "tap" | "success" | "purchase" | "levelup" | "error" = "tap";
    if (sound === "success") mappedSound = "success";else
    if (sound === "error") mappedSound = "error";else
    if (sound === "purchase") mappedSound = "purchase";else
    if (sound === "levelup" || sound === "rarebox") mappedSound = "levelup";else
    if (sound === "click" || sound === "tap") mappedSound = "tap";

    if (playSynthSound) playSynthSound(mappedSound);
    if (triggerHapticFeedback) triggerHapticFeedback(mappedSound);
  };

  // --- 14.10 ACTION: EXECUTE PUNISHMENT ---
  const handleExecutePunishment = () => {
    if (!punishingUser) return;

    // Check Hierarchy: Can a moderator ban a moderator of a higher rank? (14.4)
    const myLevel = getRoleLevel(simulatedRole);
    const targetLevel = getRoleLevel(punishingUser.role);

    if (myLevel <= targetLevel) {
      playSound("error");
      alert(
        isArabic ?
        `🚨 فشل التحقق من تدرج الرتب! لا يمكنك تطبيق عقوبة على عضو يحمل رتبة مساوية أو أعلى منك!\nرتبتك: ${simulatedRole} (مستوى ${myLevel})\nرتبة الهدف: ${punishingUser.role} (مستوى ${targetLevel})` :
        `🚨 Hierarchy Safeguard Blocked Action! You cannot punish an equal or higher rank.\nYour Rank: ${simulatedRole} (Lv ${myLevel})\nTarget: ${punishingUser.role} (Lv ${targetLevel})`
      );
      return;
    }

    // Check specific permission
    const isBan = punishmentForm.type === "ban";
    const requiredPerm = isBan ? "ban_user" : "mute_user";
    if (!hasPermission(requiredPerm)) {
      playSound("error");
      alert(
        isArabic ?
        "🚨 لا تملك صلاحية تنفيذ هذا النوع من العقوبات برتبتك الحالية!" :
        "🚨 You do not have permission to execute this punishment with your current rank!"
      );
      return;
    }

    // Ask confirmation if enabled (14.17 Security)
    if (requireSecurityConfirm) {
      const confirmText = isArabic ?
      `هل أنت متأكد من تنفيذ عقوبة (${punishmentForm.type}) ضد المستخدم @${punishingUser.username}؟` :
      `Are you sure you want to execute (${punishmentForm.type}) on @${punishingUser.username}?`;
      if (!window.confirm(confirmText)) return;
    }

    // Apply state change
    setUsers((prevUsers) =>
    prevUsers.map((u, _autoIdx) => {
      if (u.id === punishingUser.id) {
        return {
          ...u,
          status: isBan ? "Banned" : "Muted"
        };
      }
      return u;
    })
    );

    // Add notification
    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم تطبيق عقوبة" : "Punishment Executed",
        isArabic ?
        `تم تنفيذ (${punishmentForm.type}) بنجاح ضد @${punishingUser.username}` :
        `Applied (${punishmentForm.type}) successfully on @${punishingUser.username}`,
        "warning"
      );
    }

    logAdminAction(
      `تطبيق عقوبة (${punishmentForm.type})`,
      punishmentForm.reason,
      `الحالة: تم التطبيق لمدة ${punishmentForm.duration}`,
      punishingUser.username
    );

    playSound("success");
    setPunishingUser(null);
  };

  // --- CREATE NEW REPORT SIMULATOR ---
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: AdminReport = {
      id: `REP-${Math.floor(4000 + Math.random() * 999)}`,
      type: reportForm.type,
      targetId: "simulated-id",
      targetName: reportForm.targetName || "AnonymousUser",
      reporter: "SystemSensor_AI",
      reason: reportForm.reason || "انتهاك غير محدد",
      description: reportForm.description || "لا يوجد وصف تفصيلي",
      screenshot: reportForm.screenshot,
      evidenceLinks: reportForm.evidenceLink ? [reportForm.evidenceLink] : [],
      status: "pending",
      slaMinutes: 15,
      remainingMinutes: 15,
      language: isArabic ? "Arabic" : "English",
      region: isArabic ? "Middle East" : "Global",
      aiRecommendation: {
        action: reportForm.type === "user" ? "ban_user" : "delete_content_warn",
        confidence: 88,
        reasonAr: `التقرير التلقائي يشير إلى وجود نمط مكرر ومشبوه في القسم المذكور يتوافق بنسبة 88% مع سياسة التبليغ.`,
        reasonEn: `AI recommends swift moderation: high lexical matching with reported guidelines.`
      }
    };

    setReports((prev) => [newReport, ...prev]);
    setShowReportForm(false);
    playSound("rarebox");

    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "بلاغ جديد" : "New Report",
        isArabic ? "تلقى النظام بلاغاً جديداً وتم توجيهه لقسم الإشراف." : "System received a new user report.",
        "info"
      );
    }
  };

  // --- SUBMIT APPEAL SIMULATOR ---
  const handleSubmitAppeal = () => {
    if (!bannedUserSim.appealEvidence.trim()) {
      alert(isArabic ? "يرجى كتابة سبب الاعتراض أو إرفاق أدلة!" : "Please provide appeal details or evidence!");
      return;
    }
    setBannedUserSim((prev) => ({
      ...prev,
      appealStatus: "submitted"
    }));
    playSound("success");

    // Add a new ticket under appeal category automatically
    const newTicket: AdminTicket = {
      id: `TCK-${Math.floor(810 + Math.random() * 90)}`,
      title: "اعتراض على حظر الحساب الأخير",
      category: "appeal",
      creator: "BannedUserSim",
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
      {
        sender: "BannedUserSim",
        role: "user",
        text: `[اعتراض تلقائي]: ${bannedUserSim.appealEvidence}`,
        timestamp: new Date().toISOString()
      }]

    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  // --- RESOLVE TICKET ---
  const handleReplyTicket = (text: string) => {
    if (!selectedTicketId) return;
    setTickets((prev) =>
    prev.map((t, _autoIdx) => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          status: "waiting_user",
          updatedAt: new Date().toISOString(),
          messages: [
          ...t.messages,
          {
            sender: "You (Admin)",
            role: "admin",
            text: text,
            timestamp: new Date().toISOString()
          }]

        };
      }
      return t;
    })
    );
    playSound("success");
    logAdminAction("إرسال رد على تذكرة دعم", "تواصل مع مستخدم للتذكرة", "تغيير حالة التذكرة لانتظار الرد", selectedTicketId);
  };

  // --- RESOLVE REPORT ---
  const handleResolveTraditionalReport = (reportId: string, action: "resolve" | "dismiss") => {
    setReports((prev) =>
    prev.map((r, _autoIdx) => {
      if (r.id === reportId) {
        return { ...r, status: action === "resolve" ? "resolved" : "dismissed" };
      }
      return r;
    })
    );
    playSound("success");
    logAdminAction(
      action === "resolve" ? "قبول البلاغ وحذفه" : "رفض وتجاهل البلاغ",
      "مراجعة البلاغ وحسم القرار",
      `تم الحل بنجاح (${action})`,
      reportId
    );
  };

  // --- SECTIONS ARABIC / ENGLISH MAP ---
  const ALL_SECTIONS = [
  // Moderation group
  { id: "users", labelAr: "المستخدمون", labelEn: "Users", icon: Users, group: "moderation" },
  { id: "reports", labelAr: "البلاغات", labelEn: "Reports", icon: AlertOctagon, group: "moderation" },
  { id: "tickets", labelAr: "التذاكر", labelEn: "Tickets", icon: Ticket, group: "moderation" },
  { id: "posts", labelAr: "المنشورات", labelEn: "Posts", icon: FileText, group: "moderation" },
  { id: "comments", labelAr: "التعليقات", labelEn: "Comments", icon: MessageSquare, group: "moderation" },
  { id: "reels", labelAr: "الريلز", labelEn: "Reels", icon: Video, group: "moderation" },
  { id: "stories", labelAr: "القصص", labelEn: "Stories", icon: BookOpen, group: "moderation" },
  { id: "news", labelAr: "الأخبار", labelEn: "News", icon: Tv, group: "moderation" },
  { id: "events", labelAr: "الفعاليات", labelEn: "Events", icon: Calendar, group: "moderation" },
  { id: "groups", labelAr: "المجموعات", labelEn: "Groups", icon: Hash, group: "moderation" },
  { id: "channels", labelAr: "القنوات", labelEn: "Channels", icon: Radio, group: "moderation" },
  { id: "guilds", labelAr: "النقابات (Guilds)", labelEn: "Guilds", icon: Award, group: "moderation" },
  { id: "spaces", labelAr: "المساحات (Spaces)", labelEn: "Spaces", icon: Compass, group: "moderation" },

  // Economy group
  { id: "marketplace", labelAr: "المتجر والنزاعات", labelEn: "Marketplace", icon: Store, group: "economy" },
  { id: "inventory", labelAr: "المخازن التجميلية", labelEn: "Inventory", icon: Package, group: "economy" },
  { id: "theme_store", labelAr: "متجر المظاهر", labelEn: "Theme Store", icon: Palette, group: "economy" },
  { id: "cards", labelAr: "البطاقات المخصصة", labelEn: "Cards", icon: CreditCard, group: "economy" },
  { id: "frames", labelAr: "الإطارات الشخصية", labelEn: "Frames", icon: Sparkles, group: "economy" },
  { id: "subscriptions", labelAr: "اشتراكات الإمبراطورية", labelEn: "Subscriptions", icon: Sliders, group: "economy" },
  { id: "black_coin", labelAr: "عملات بلاك", labelEn: "Black Coin Manager", icon: Coins, group: "economy" },
  { id: "stars", labelAr: "النجوم المتألقة", labelEn: "Stars Minting", icon: Star, group: "economy" },

  // Analytics group
  { id: "analytics", labelAr: "التحليلات والمؤشرات", labelEn: "Analytics Dashboard", icon: BarChart3, group: "analytics" },
  { id: "logs", labelAr: "سجلات الخادم (Audit Logs)", labelEn: "Security Audit Logs", icon: History, group: "analytics" },

  // Tools group
  { id: "apk_management", labelAr: "إدارة وبناء APK", labelEn: "APK & Android Storage", icon: Smartphone, group: "tools" },
  { id: "ai_moderator", labelAr: "مساعد الذكاء الاصطناعي", labelEn: "AI Moderation", icon: Cpu, group: "tools" },
  { id: "security_center", labelAr: "مركز الأمان ورتب RBAC", labelEn: "RBAC & Security Settings", icon: Lock, group: "tools" },
  { id: "knowledge_base", labelAr: "مركز المعرفة الداخلي", labelEn: "Moderator Rules KB", icon: HelpCircle, group: "tools" },
  { id: "ban_simulator", labelAr: "محاكي حظر حسابي", labelEn: "Ban Screen Simulator", icon: UserX, group: "tools" }];


  const activeGroupSections = ALL_SECTIONS.filter((s) => s.group === activeTabGroup);

  // --- MOCK ACTION DISPATCHERS ---
  const handleContentDelete = (id: string, author: string, type: string) => {
    if (!hasPermission("delete_post")) {
      playSound("error");
      alert(isArabic ? "❌ رتبتك لا تملك صلاحية حذف المحتوى!" : "❌ Current rank lacks content deletion permissions!");
      return;
    }
    playSound("success");
    setContentItems((prev) => prev.filter((item) => item.id !== id));
    logAdminAction(`حذف ${type}`, "انتهاك المحتوى وسلوكه", `تم تدمير العنصر ${id}`, author);
    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم حذف المحتوى" : "Content Deleted",
        isArabic ? `تم ترحيل وحذف ${type} بنجاح للكاتب @${author}` : `Successfully removed ${type} by @${author}`,
        "error"
      );
    }
  };

  const handleApproveMarketItem = (id: string, action: "approved" | "rejected") => {
    playSound("success");
    setEconomyItems((prev) =>
    prev.map((item, _autoIdx) => {
      if (item.id === id) return { ...item, status: action };
      return item;
    })
    );
    const item = economyItems.find((i) => i.id === id);
    logAdminAction(`مراجعة عنصر المتجر (${action})`, "مراجعة جودة الأصول التجميلية", `النتيجة: ${action}`, item?.owner || "");
  };

  const handleVerificationStatus = (id: string, action: "approved" | "rejected") => {
    playSound("success");
    setVerificationRequests((prev) =>
    prev.map((req, _autoIdx) => req.id === id ? { ...req, status: action } : req)
    );
    const req = verificationRequests.find((r) => r.id === id);
    if (action === "approved" && triggerCelebration) {
      triggerCelebration(
        "verification",
        "تهانينا! تم توثيق حسابك بنجاح",
        "Congratulations! Your account has been verified",
        "تمت الموافقة على طلب التوثيق الخاص بك من قبل الإدارة.",
        "Your verification request has been approved by the administration.",
        "Golden Badge / الشارة الذهبية"
      );
    }
    logAdminAction(`طلب توثيق (${action})`, "مراجعة مستندات وأهلية الحساب", `النتيجة: ${action}`, req?.targetName || "");
  };

  // CSV Export simulator
  const exportLogsToCSV = () => {
    playSound("success");
    const headers = "ID,Timestamp,Executor,Role,Action,Device,IP,Reason,Result\n";
    const rows = auditLogs.
    map((l, _autoIdx) => `${l.id},${l.timestamp},${l.executor},${l.role},"${l.action}",${l.device},${l.ip},"${l.reason}","${l.result}"`).
    join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anime_black_audit_log_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col font-sans overflow-hidden text-zinc-300">
      
      {/* 👑 TOP STATUS & SIMULATOR CONTROLS BAR */}
      <div className="bg-[#0b0c10] border-b border-zinc-900 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 relative z-10">
        
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 text-red-400">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              <span>{isArabic ? "لوحة الإدارة الإمبراطورية للأمن والرقابة" : "Anime Black Empire Guard & Command"}</span>
              <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/60 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                v14.18 Real-Time
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 leading-none mt-0.5">
              {isArabic ? "نظام الإشراف الشامل، البلاغات، الدعم، والتحكم بالرتب" : "Comprehensive Administration, Tickets, Logs & RBAC Safeguards"}
            </p>
          </div>
        </div>

        {/* Dynamic RBAC Hierarchy Changer */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-xl">
            <label className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">
              {isArabic ? "الرتبة النشطة للتجربة:" : "Test Role (RBAC):"}
            </label>
            <select
              value={simulatedRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setSimulatedRole(newRole);
                playSound("click");
                if (triggerInAppNotification) {
                  triggerInAppNotification(
                    isArabic ? "تغيرت الصلاحيات" : "Permissions Switched",
                    isArabic ? `أنت تعمل الآن برتبة ${newRole}` : `Now acting with powers of ${newRole}`,
                    "info"
                  );
                }
              }}
              className="bg-zinc-950 text-xs text-white border-0 font-bold focus:ring-0 cursor-pointer">
              
              <option value="SuperAdministrator">👑 Super Admin</option>
              <option value="Administrator">🛡️ System Admin</option>
              <option value="SeniorModerator">⭐ Senior Moderator</option>
              <option value="Moderator">⚔️ Moderator</option>
              <option value="TraineeModerator">🧪 Trainee Moderator</option>
              <option value="NewsCreator">📰 News Moderator</option>
              <option value="EventCreator">🎉 Events Moderator</option>
              <option value="Member">👤 Standard Member</option>
            </select>
          </div>

          {/* SLA Timer Indicator */}
          <div className="bg-purple-950/40 border border-purple-900/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-purple-400 font-mono text-[10px]">
            <Clock className="w-3.5 h-3.5" />
            <span>SLA ACTIVE</span>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-xl border border-zinc-800/80 transition-colors">
            
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ⚠️ SPECIAL BAN SCREEN OVERLAY SIMULATOR */}
      {showBannedScreen &&
      <div className="absolute inset-0 bg-[#07080c] z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-950 border-2 border-red-950 rounded-2xl p-6 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 animate-pulse" />
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-900/20 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-black">
                ⚠️
              </div>
              <h2 className="text-base font-black text-white">
                {isArabic ? "تم إيقاف وحظر حسابك في إمبراطورية الأنمي" : "Your Account Has Been Terminated"}
              </h2>
              <p className="text-[10px] text-zinc-500">
                {isArabic ?
              "يتعارض سلوك هذا الحساب مع بنود الاستخدام المعتمدة لمنصتنا." :
              "Your behavior flag was permanently registered in violation of Empire policies."}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase font-bold">{isArabic ? "سبب الحظر الكلي:" : "Reason for Ban:"}</span>
                  <span className="text-white font-bold block mt-0.5">{isArabic ? bannedUserSim.reasonAr : bannedUserSim.reasonEn}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase font-bold">{isArabic ? "مدة العقوبة والمتبقي:" : "Duration & Status:"}</span>
                  <span className="text-amber-500 font-mono font-bold block mt-0.5">{isArabic ? bannedUserSim.durationAr : bannedUserSim.durationEn}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase font-bold">{isArabic ? "المشرف المسؤول:" : "Executing Officer:"}</span>
                  <span className="text-zinc-300 font-mono block mt-0.5">{bannedUserSim.executor}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase font-bold">{isArabic ? "رقم قضية الحظر للمتابعة:" : "Case Tracking Number:"}</span>
                  <span className="text-red-400 font-mono font-bold block mt-0.5">{bannedUserSim.caseNumber}</span>
                </div>
              </div>

              {/* Banned User's violation history (14.11) */}
              <div className="border-t border-zinc-800 pt-3">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1.5">{isArabic ? "سجل مخالفاتك السابقة في المنصة:" : "Your Prior Violations History:"}</span>
                <div className="space-y-1">
                  {bannedUserSim.history.map((h, idx) =>
                <div key={idx} className="flex justify-between text-[10px] bg-black/40 px-2 py-1.5 rounded border border-zinc-900 font-mono text-zinc-400">
                      <span>📅 {h.date} - {h.violation}</span>
                      <span className="text-amber-600 font-bold">{h.action}</span>
                    </div>
                )}
                </div>
              </div>
            </div>

            {/* Appeal System Form (14.12) */}
            <div className="bg-black/60 border border-zinc-900 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                {isArabic ? "نظام الطعون والاعتراضات الإدارية" : "Official Appeal & Restitution Submission"}
              </h3>
              
              {bannedUserSim.appealStatus === "none" ?
            <div className="space-y-2">
                  <textarea
                value={bannedUserSim.appealEvidence}
                onChange={(e) => setBannedUserSim({ ...bannedUserSim, appealEvidence: e.target.value })}
                placeholder={
                isArabic ?
                "اكتب هنا مبرراتك للاعتراض وأرفق أي أدلة تثبت عدم صحة البلاغ..." :
                "State your defense or evidence clearly for a secondary moderator panel review..."
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-[11px] text-white focus:outline-none focus:border-purple-600"
                rows={3} />
              
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] text-zinc-500">
                      {isArabic ? "✓ لن يقوم بمراجعة هذا الاعتراض نفس المشرف الذي أصدر العقوبة." : "✓ Appeal is auto-assigned to an unbiased peer-moderator."}
                    </span>
                    <button
                  onClick={handleSubmitAppeal}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer transition-all">
                  
                      {isArabic ? "إرسال ملف الاعتراض" : "Submit Appeal File"}
                    </button>
                  </div>
                </div> :

            <div className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 bg-purple-950/60 border border-purple-800/40 text-purple-400 rounded-full flex items-center justify-center mx-auto animate-bounce text-sm">
                    ⏳
                  </div>
                  <h4 className="text-xs font-black text-purple-300">{isArabic ? "تم تقديم طلب الاعتراض بنجاح" : "Appeal File In Review"}</h4>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">
                    {isArabic ?
                "تجري مراجعة اعتراضك من قِبل مشرف مغاير. سيتم تحديث حالة تذكرتك تلقائياً." :
                "A different global administrator is reviewing your files. Your ticket is pending response."}
                  </p>
                  <button
                onClick={() => setBannedUserSim({ ...bannedUserSim, appealStatus: "none", appealEvidence: "" })}
                className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold underline">
                
                    {isArabic ? "محاكاة إعادة الإرسال" : "Simulate re-submitting"}
                  </button>
                </div>
            }
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
              onClick={() => setShowBannedScreen(false)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer">
              
                {isArabic ? "خروج من شاشة المحاكاة" : "Exit Banned Simulation"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* 📊 CORE SPLIT PANELS LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* 🗂️ SIDEBAR SECTION PICKER */}
        <div className="w-full md:w-64 bg-[#0a0b0d] border-b md:border-b-0 md:border-r border-zinc-900 flex flex-row md:flex-col overflow-y-auto overflow-x-auto shrink-0 md:p-3 select-none">
          
          {/* Main tabs categorizer */}
          <div className="hidden md:flex flex-col gap-1.5 border-b border-zinc-900 pb-3 mb-3">
            {[
            { id: "moderation", labelAr: "🛡️ الإشراف والرقابة", labelEn: "🛡️ Core Moderation" },
            { id: "economy", labelAr: "🛒 الاقتصاد والتحكم", labelEn: "🛒 Economy & Shop" },
            { id: "analytics", labelAr: "📊 التحليلات والسجلات", labelEn: "📊 Analytics & Audit" },
            { id: "tools", labelAr: "⚙️ أدوات خاصة وبدائل", labelEn: "⚙️ Admin Tools" }].
            map((grp, _autoIdx) =>
            <button
              key={`${grp.id}_${_autoIdx}`}
              onClick={() => {
                setActiveTabGroup(grp.id as any);
                // Auto pick first section in that group
                const firstSec = ALL_SECTIONS.find((s) => s.group === grp.id);
                if (firstSec) setActiveSection(firstSec.id);
                playSound("click");
              }}
              className={`text-left px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
              activeTabGroup === grp.id ?
              "bg-gradient-to-r from-red-600/10 to-transparent border border-red-500/20 text-white" :
              "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"}`
              }>
              
                {isArabic ? grp.labelAr : grp.labelEn}
              </button>
            )}
          </div>

          {/* Quick Category switcher for small screen slider */}
          <div className="flex md:hidden px-3 py-2 gap-2">
            {["moderation", "economy", "analytics", "tools"].map((grpId, _autoIdx) =>
            <button
              key={`${grpId}_${_autoIdx}`}
              onClick={() => {
                setActiveTabGroup(grpId as any);
                const firstSec = ALL_SECTIONS.find((s) => s.group === grpId);
                if (firstSec) setActiveSection(firstSec.id);
                playSound("click");
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap ${
              activeTabGroup === grpId ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-500"}`
              }>
              
                {grpId.toUpperCase()}
              </button>
            )}
          </div>

          {/* Actual 23 Subsections List filtered by Active Tab Group */}
          <div className="flex md:flex-col gap-1 px-3 py-2 md:p-0">
            {activeGroupSections.map((sec, _autoIdx) => {
              const IconComp = sec.icon;
              return (
                <button
                  key={`admin_sec_${sec.id}_${_autoIdx}`}
                  onClick={() => {
                    setActiveSection(sec.id);
                    playSound("click");
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all text-left ${
                  activeSection === sec.id ?
                  "bg-zinc-900 text-white border border-zinc-800" :
                  "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/40"}`
                  }>
                  
                  <IconComp className={`w-3.5 h-3.5 ${activeSection === sec.id ? "text-red-500" : ""}`} />
                  <span>{isArabic ? sec.labelAr : sec.labelEn}</span>
                </button>);

            })}
          </div>

        </div>

        {/* 💻 MAIN WORKSPACE PANEL */}
        <div className="flex-1 bg-[#050608] overflow-y-auto p-4 md:p-6 space-y-6">

          {/* 1. USERS SECTION */}
          {activeSection === "users" &&
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    {isArabic ? "سجل مستخدمي إمبراطورية الأنمي" : "Empire User Accounts Registry"}
                  </h2>
                  <p className="text-[10px] text-zinc-500">{isArabic ? "عرض الأعضاء المسجلين والتحكم بصلاحياتهم وعقوباتهم" : "Review registration metrics and apply administrative actions"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {users.map((u, _autoIdx) =>
              <div key={`${u.id}_${_autoIdx}`} className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{u.name}</span>
                          <span className="text-[9px] text-zinc-500">@{u.username}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      u.status === "Active" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" :
                      u.status === "Muted" ? "bg-amber-950/60 text-amber-400 border border-amber-900/40" :
                      "bg-red-950/60 text-red-400 border border-red-900/40"}`
                      }>
                            {u.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">
                          {isArabic ? `رتبة النظام: ${u.role} (مستوى ${getRoleLevel(u.role)})` : `System Role: ${u.role} (Lv ${getRoleLevel(u.role)})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                    onClick={() => {
                      setPunishingUser(u);
                      setPunishmentForm((prev) => ({ ...prev, caseNumber: `CASE-${Math.floor(100000 + Math.random() * 900000)}` }));
                      playSound("rarebox");
                    }}
                    className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-red-400 hover:text-red-300 text-[10px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer">
                    
                        ⚖️ {isArabic ? "تنفيذ عقوبة" : "Punish Member"}
                      </button>
                    </div>
                  </div>
              )}
              </div>

              {/* Punishment Dialog (14.10) */}
              {punishingUser &&
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-md p-5 space-y-4">
                    <h3 className="text-xs font-black text-white">
                      ⚠️ {isArabic ? `فرض عقوبة ضد @${punishingUser.username}` : `Apply Punishment on @${punishingUser.username}`}
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "نوع العقوبة الإدارية:" : "Punishment Type:"}</label>
                        <select
                      value={punishmentForm.type}
                      onChange={(e) => setPunishmentForm({ ...punishmentForm, type: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                      
                          <option value="warn">⚠️ {isArabic ? "تنبيه رسمي" : "Official Warning"}</option>
                          <option value="mute">🔇 {isArabic ? "كتم الدردشة العام" : "Mute General Chat"}</option>
                          <option value="comment_block">🚫 {isArabic ? "منع من التعليقات" : "Block Commenting"}</option>
                          <option value="post_block">✍️ {isArabic ? "منع من النشر" : "Block Posting"}</option>
                          <option value="message_block">💬 {isArabic ? "منع من الرسائل الخاصة" : "Block Messaging"}</option>
                          <option value="group_block">👥 {isArabic ? "منع من إنشاء مجموعات" : "Block Groups"}</option>
                          <option value="event_block">🎉 {isArabic ? "منع من إنشاء فعاليات" : "Block Events"}</option>
                          <option value="timeout">⏱️ {isArabic ? "إيقاف مؤقت (Timeout)" : "Temporary Timeout"}</option>
                          <option value="ban">🔥 {isArabic ? "حظر حساب دائم" : "Permanent Ban"}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "السبب الموثق للعقوبة:" : "Documented Reason:"}</label>
                        <input
                      type="text"
                      value={punishmentForm.reason}
                      onChange={(e) => setPunishmentForm({ ...punishmentForm, reason: e.target.value })}
                      placeholder={isArabic ? "مثال: سلوك غير رياضي، حرق أحداث مكرر..." : "e.g., repeating spoilers in general chats..."}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                    
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "المدة المقررة للعقوبة:" : "Duration Specified:"}</label>
                        <input
                      type="text"
                      value={punishmentForm.duration}
                      onChange={(e) => setPunishmentForm({ ...punishmentForm, duration: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                    
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                    onClick={() => setPunishingUser(null)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-xs font-black cursor-pointer">
                    
                        {isArabic ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                    onClick={handleExecutePunishment}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer">
                    
                        ⚖️ {isArabic ? "تنفيذ العقوبة" : "Enforce Action"}
                      </button>
                    </div>
                  </div>
                </div>
            }

            </div>
          }

          {/* 2. REPORTS SECTION */}
          {activeSection === "reports" &&
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                    {isArabic ? "مركز البلاغات وتوزيع المهام المتقدم" : "Task-Distributed Reports Dispatcher"}
                  </h2>
                  <p className="text-[10px] text-zinc-500">{isArabic ? "مراجعة بلاغات الأعضاء الموزعة تلقائياً حسب الفئة" : "Auto-distributed reports based on language, region, and type"}</p>
                </div>
                <button
                onClick={() => {
                  setShowReportForm(true);
                  playSound("rarebox");
                }}
                className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-4 py-2 rounded-xl cursor-pointer">
                
                  📝 {isArabic ? "محاكاة تقديم بلاغ" : "Simulate New Report"}
                </button>
              </div>

              {/* Simulated Report Form Dialog (14.7) */}
              {showReportForm &&
            <div className="bg-[#0b0c10] border border-red-900/30 p-4 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-red-500" />
                    {isArabic ? "تقديم بلاغ فوري لقسم الرقابة" : "Register a Digital Violation Audit"}
                  </h3>

                  <form onSubmit={handleCreateReport} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "نوع المخالفة:" : "Violation Category:"}</label>
                      <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white">
                    
                        <option value="user">👤 {isArabic ? "بلاغ ضد مستخدم" : "User Account Report"}</option>
                        <option value="post">✍️ {isArabic ? "بلاغ ضد منشور" : "Inappropriate Post"}</option>
                        <option value="comment">💬 {isArabic ? "بلاغ ضد تعليق" : "Inappropriate Comment"}</option>
                        <option value="guild">🏰 {isArabic ? "بلاغ ضد نقابة أو مساحة" : "Guild / Space Violation"}</option>
                        <option value="marketplace">🛒 {isArabic ? "نزاع متجر (Marketplace)" : "Marketplace Dispute"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "اسم الحساب المستهدف:" : "Target Username:"}</label>
                      <input
                    type="text"
                    required
                    value={reportForm.targetName}
                    onChange={(e) => setReportForm({ ...reportForm, targetName: e.target.value })}
                    placeholder="@username"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "السبب المباشر:" : "Primary Reason:"}</label>
                      <input
                    type="text"
                    required
                    value={reportForm.reason}
                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                    placeholder={isArabic ? "مثال: نشر تسريبات مانجا قبل موعدها الرسمي" : "e.g., posting manga leaks prematurely"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "وصف المخالفة بالتفصيل:" : "Detailed Description:"}</label>
                      <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder={isArabic ? "أدخل هنا تفاصيل وسياق حدوث المخالفة..." : "Add surrounding context or conversation snippets..."}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    rows={2} />
                  
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl font-bold cursor-pointer">
                    
                        {isArabic ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer">
                    
                        📤 {isArabic ? "إرسال البلاغ للتوزيع التلقائي" : "Submit to Mod Dispatcher"}
                      </button>
                    </div>
                  </form>
                </div>
            }

              {/* Reports Table/Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Reports Queue */}
                <div className="lg:col-span-2 space-y-3">
                  {reports.map((rep, _autoIdx) =>
                <div
                  key={`${rep.id}_${_autoIdx}`}
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    playSound("click");
                  }}
                  className={`bg-zinc-900/40 border p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  selectedReportId === rep.id ? "border-red-500 bg-red-950/5" : "border-zinc-850 hover:border-zinc-700"}`
                  }>
                  
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{rep.id}</span>
                            <span className="text-[8px] bg-red-950/80 text-red-400 border border-red-900/50 px-1.5 py-0.5 rounded uppercase font-bold">
                              {rep.type}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-300">{rep.reason}</h4>
                        </div>

                        {/* SLA Timer Clock */}
                        <div className="bg-amber-950/40 text-amber-500 text-[10px] px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-900/30">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>SLA: {rep.remainingMinutes}m</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-zinc-900 pt-2">
                        <span>🌍 {rep.region} • {rep.language}</span>
                        <span>👤 Reporter: @{rep.reporter}</span>
                      </div>
                    </div>
                )}
                </div>

                {/* Report Detail & AI Assistant Recommendation Panel (14.6) */}
                <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  {selectedReportId ?
                (() => {
                  const rep = reports.find((r) => r.id === selectedReportId);
                  if (!rep) return null;
                  return (
                    <div className="space-y-4 text-xs">
                          <div className="border-b border-zinc-900 pb-3">
                            <h3 className="font-black text-white text-xs">{isArabic ? "تفاصيل طلب الفحص" : "Violation Audit details"}</h3>
                            <span className="text-[10px] text-zinc-500">ID: {rep.id}</span>
                          </div>

                          <div className="space-y-2">
                            <div className="bg-black/60 p-3 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 block">{isArabic ? "المتهم / المستهدف:" : "Accused Account:"}</span>
                              <span className="text-white font-bold block mt-0.5">@{rep.targetName}</span>
                            </div>

                            <div className="bg-black/60 p-3 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 block">{isArabic ? "تفاصيل المخالفة:" : "Violation Details:"}</span>
                              <p className="text-zinc-300 text-[10px] leading-relaxed mt-1">{rep.description}</p>
                            </div>

                            {/* Screenshot evidence */}
                            {rep.screenshot &&
                        <div className="bg-black/60 p-2 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 block mb-1">{isArabic ? "لقطة الشاشة (الدليل):" : "Evidence Screenshot:"}</span>
                                <img src={rep.screenshot} className="w-full h-24 object-cover rounded-lg border border-zinc-800" />
                              </div>
                        }

                            {/* AI MODERATION ASSISTANT RECOMMENDER (Special 1) */}
                            <div className="bg-purple-950/20 border border-purple-900/40 p-3 rounded-xl space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider">AI Guard Assistant</span>
                                <span className="text-[8px] bg-purple-900 text-purple-200 px-1 rounded ml-auto font-bold">{rep.aiRecommendation.confidence}% match</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 italic">
                                "{isArabic ? rep.aiRecommendation.reasonAr : rep.aiRecommendation.reasonEn}"
                              </p>
                              <div className="bg-black/30 px-2 py-1.5 rounded border border-purple-900/30 text-[9px] text-purple-200 font-mono">
                                🤖 Action Suggestion: <span className="font-bold">{rep.aiRecommendation.action.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Moderator actions */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                          onClick={() => handleResolveTraditionalReport(rep.id, "dismiss")}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 rounded-xl font-bold text-[10px] cursor-pointer">
                          
                              ❌ {isArabic ? "تجاهل التبليغ" : "Dismiss Report"}
                            </button>
                            <button
                          onClick={() => handleResolveTraditionalReport(rep.id, "resolve")}
                          className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl font-bold text-[10px] cursor-pointer">
                          
                              ✓ {isArabic ? "تأكيد المخالفة" : "Confirm & Resolve"}
                            </button>
                          </div>
                        </div>);

                })() :

                <div className="text-center py-10 text-zinc-500 space-y-2 text-xs">
                      <span>🎯</span>
                      <p>{isArabic ? "يرجى تحديد بلاغ من القائمة الجانبية لبدء الفحص والتدقيق" : "Select a report from the queue list to audit details"}</p>
                    </div>
                }
                </div>

              </div>
            </div>
          }

          {/* 3. SUPPORT TICKETS (14.8) */}
          {activeSection === "tickets" &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  {isArabic ? "قسم الدعم الفني وتذاكر المستخدمين" : "Support Tickets Command Center"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "معالجة التذاكر وتحديث حالة حل المشاكل" : "Manage account requests, issues, and customer satisfaction"}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Tickets list */}
                <div className="lg:col-span-1 space-y-2">
                  {tickets.map((t, _autoIdx) =>
                <div
                  key={`${t.id}_${_autoIdx}`}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    playSound("click");
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  selectedTicketId === t.id ? "bg-emerald-950/5 border-emerald-500" : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-700"}`
                  }>
                  
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">{t.id}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                    t.status === "new" ? "bg-blue-950 text-blue-400 border border-blue-900" :
                    t.status === "review" ? "bg-purple-950 text-purple-400 border border-purple-900" :
                    t.status === "waiting_user" ? "bg-yellow-950 text-yellow-400 border border-yellow-900" :
                    "bg-zinc-950 text-zinc-400 border border-zinc-900"}`
                    }>
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                      <p className="text-[9px] text-zinc-500">By: @{t.creator}</p>
                    </div>
                )}
                </div>

                {/* Ticket Chat / Response Area */}
                <div className="lg:col-span-2 bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl flex flex-col h-[350px]">
                  {selectedTicketId ?
                (() => {
                  const t = tickets.find((tick) => tick.id === selectedTicketId);
                  if (!t) return null;
                  return (
                    <div className="flex-1 flex flex-col justify-between h-full">
                          
                          {/* Ticket Header */}
                          <div className="border-b border-zinc-900 pb-2 flex justify-between items-center shrink-0">
                            <div>
                              <h3 className="text-xs font-black text-white">{t.title}</h3>
                              <span className="text-[9px] text-zinc-500">Category: {t.category.toUpperCase()}</span>
                            </div>

                            {/* Status transitions */}
                            <select
                          value={t.status}
                          onChange={(e) => {
                            setTickets((prev) =>
                            prev.map((tick, _autoIdx) => tick.id === t.id ? { ...tick, status: e.target.value as any } : tick)
                            );
                            playSound("success");
                          }}
                          className="bg-zinc-950 border border-zinc-850 rounded text-[10px] px-2 py-1 text-white">
                          
                              <option value="new">New</option>
                              <option value="review">In Review</option>
                              <option value="waiting_user">Awaiting User</option>
                              <option value="waiting_admin">Awaiting Admin</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>

                          {/* Chat history */}
                          <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1 text-xs">
                            {t.messages.map((m, idx) =>
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl max-w-[85%] ${
                          m.role === "admin" ?
                          "bg-purple-950/20 border border-purple-900/30 ml-auto" :
                          "bg-zinc-900/60 border border-zinc-850"}`
                          }>
                          
                                <span className="block text-[8px] text-zinc-500 font-bold mb-1">
                                  {m.sender} ({m.role.toUpperCase()})
                                </span>
                                <p className="text-[10px] text-zinc-300 leading-relaxed">{m.text}</p>
                              </div>
                        )}
                          </div>

                          {/* Response Input */}
                          <div className="border-t border-zinc-900 pt-2 shrink-0 flex gap-2">
                            <input
                          type="text"
                          id="ticket-reply-field"
                          placeholder={isArabic ? "اكتب ردك ومساعدتك للمستخدم هنا..." : "Type your administrative response here..."}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = e.currentTarget.value;
                              if (val.trim()) {
                                handleReplyTicket(val);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                        
                            <button
                          onClick={() => {
                            const input = document.getElementById("ticket-reply-field") as HTMLInputElement;
                            if (input && input.value.trim()) {
                              handleReplyTicket(input.value);
                              input.value = "";
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl">
                          
                              <Send className="w-4 h-4" />
                            </button>
                          </div>

                        </div>);

                })() :

                <div className="m-auto text-center text-zinc-500 text-xs space-y-2">
                      <span>📩</span>
                      <p>{isArabic ? "الرجاء تحديد تذكرة دعم فني لبدء الرد والتوجيه" : "Select an active ticket from the registry list to reply"}</p>
                    </div>
                }
                </div>

              </div>
            </div>
          }

          {/* 4. CONTENT MODERATION (Posts, Comments, Reels, Stories, News, Events, Groups, Channels, Guilds, Spaces) */}
          {["posts", "comments", "reels", "stories", "news", "events", "groups", "channels", "guilds", "spaces"].includes(activeSection) &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  {isArabic ? `إدارة ومراقبة ${activeSection.toUpperCase()}` : `Manage Content: ${activeSection.toUpperCase()}`}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "حذف أو تعديل المحتويات المخالفة لتقارير المستخدمين" : "Audit, flag, or remove elements violating community standards"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contentItems.
              filter((item) => item.contentType === (activeSection === "posts" ? "post" : activeSection === "comments" ? "comment" : activeSection === "guilds" ? "guild" : "post")).
              map((item, _autoIdx) =>
              <div key={`${item.id}_${_autoIdx}`} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between gap-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white">@{item.author}</span>
                          <span className="text-[9px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded font-mono font-bold">
                            ⚠️ {item.reportsCount} Reports
                          </span>
                        </div>
                        {item.title && <h4 className="font-bold text-zinc-200">{item.title}</h4>}
                        <p className="text-[10px] text-zinc-400 leading-relaxed">"{item.content}"</p>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-zinc-900 pt-2.5">
                        <button
                    onClick={() => handleContentDelete(item.id, item.author, activeSection)}
                    className="bg-red-950/50 hover:bg-red-900/40 text-red-400 border border-red-900/30 text-[9px] font-black px-3.5 py-1.5 rounded-xl cursor-pointer">
                    
                          🗑️ {isArabic ? "حذف المحتوى فوراً" : "Purge Content"}
                        </button>
                      </div>
                    </div>
              )}
                {contentItems.filter((item) => item.contentType === (activeSection === "posts" ? "post" : activeSection === "comments" ? "comment" : activeSection === "guilds" ? "guild" : "post")).length === 0 &&
              <div className="col-span-2 text-center py-10 bg-zinc-900/10 rounded-2xl text-zinc-500 text-xs">
                    {isArabic ? "لا توجد أصول معلقة للمراجعة في هذا القسم" : "No flagged items in this content pipeline right now"}
                  </div>
              }
              </div>
            </div>
          }

          {/* 5. MARKETPLACE, INVENTORY, THEME STORE, CARDS, FRAMES */}
          {["marketplace", "inventory", "theme_store", "cards", "frames"].includes(activeSection) &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-500" />
                  {isArabic ? `متجر وإدارة أصول ${activeSection.toUpperCase()}` : `Cosmetics Pipeline: ${activeSection.toUpperCase()}`}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "مراجعة العناصر المصممة قبل إدراجها للمجتمع" : "Audit, verify or decline customized vanity badges, frames, or trading cards"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {economyItems.
              filter((item) => {
                if (activeSection === "marketplace") return item.category === "marketplace";
                if (activeSection === "theme_store") return item.category === "theme";
                if (activeSection === "cards") return item.category === "card";
                if (activeSection === "frames") return item.category === "frame";
                return true;
              }).
              map((item, _autoIdx) =>
              <div key={`${item.id}_${_autoIdx}`} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <h4 className="font-bold text-white">{item.name}</h4>
                          <span className="text-[9px] text-zinc-500">Owner: @{item.owner}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                  item.status === "approved" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" :
                  item.status === "rejected" ? "bg-red-950/60 text-red-400 border border-red-900/40" :
                  "bg-amber-950/60 text-amber-400 border border-amber-900/40"}`
                  }>
                          {item.status}
                        </span>
                      </div>

                      {item.price &&
                <div className="text-[10px] text-zinc-300 font-mono">
                          Price: {item.price} {item.currency === "coins" ? "Black Coins" : "Stars"}
                        </div>
                }

                      <div className="flex justify-end gap-2 border-t border-zinc-900 pt-2 text-[10px]">
                        {item.status === "pending" &&
                  <>
                            <button
                      onClick={() => handleApproveMarketItem(item.id, "rejected")}
                      className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-red-400 px-3 py-1.5 rounded-lg cursor-pointer">
                      
                              Reject
                            </button>
                            <button
                      onClick={() => handleApproveMarketItem(item.id, "approved")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold">
                      
                              Approve
                            </button>
                          </>
                  }
                      </div>
                    </div>
              )}
              </div>
            </div>
          }

          {/* 6. SUBSCRIPTIONS SECTION */}
          {activeSection === "subscriptions" &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  {isArabic ? "إدارة خطط اشتراك بريميوم بلاك" : "Empire Premium Subscriptions Plan Console"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "تعديل الميزات والأسعار المخصصة للمشتركين" : "Configure pricing, perks and monitor financial metrics"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
              { name: "Premium Black Classic", priceCoins: 250, perksAr: "شارات متحركة، ثيمات كاملة", perksEn: "Motion badges, exclusive layout theme store access" },
              { name: "Empire Creator Elite", priceCoins: 500, perksAr: "إنشاء نقابات غير محدودة، حماية السمعة", perksEn: "Infinite guilds creation, reputation insurance buffers" }].
              map((plan, idx) =>
              <div key={idx} className="bg-gradient-to-br from-[#12081c] to-[#0c0d12] border border-purple-950 p-4 rounded-2xl space-y-3">
                    <h4 className="font-black text-white text-xs">{plan.name}</h4>
                    <p className="text-zinc-400 text-[10px]">{isArabic ? plan.perksAr : plan.perksEn}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-amber-500 font-bold">{plan.priceCoins} Coins/Mo</span>
                      <button
                    onClick={() => {
                      playSound("rarebox");
                      alert(isArabic ? "تم تعديل تسعيرة الخطة وحفظ الإجراء!" : "Plan adjusted successfully!");
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1.5 rounded-lg cursor-pointer">
                    
                        {isArabic ? "تعديل الخطة" : "Configure Perks"}
                      </button>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* 7. BLACK COIN & STARS (Minting) */}
          {["black_coin", "stars"].includes(activeSection) &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {isArabic ? "طباعة وسك العملات والنجوم للأعضاء" : "Empire Central Reserve & Coin Minting Panel"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "إصدار وتوزيع عملات بلاك ونقود النجوم بحسابات الإدارة" : "Issue coins, award stars to developers, or balance general supply pools"}</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl max-w-md space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "المستلم (اسم الحساب):" : "Receiver Username:"}</label>
                  <input type="text" placeholder="@username" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">{isArabic ? "الكمية المراد إصدارها:" : "Amount to Mint:"}</label>
                  <input type="number" placeholder="500" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                </div>

                <button
                onClick={() => {
                  playSound("success");
                  alert(isArabic ? "✓ تم سك وتحويل العملات بنجاح وتوثيق العملية!" : "✓ Currency minted and deposited successfully!");
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black py-2.5 rounded-xl cursor-pointer">
                
                  🪙 {isArabic ? "سك وتحويل الأرصدة الآن" : "Mint & Transfer Funds"}
                </button>
              </div>
            </div>
          }

          {/* 8. ANALYTICS (Analytics & Heatmap & Point System) */}
          {activeSection === "analytics" &&
          <div className="space-y-5">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  {isArabic ? "التحليلات الأمنية ولوحة الكفاءة والحرارة" : "Secured Traffic Analytics & Violation Heatmap"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "مؤشرات وقت الاستجابة، جودة القرارات، وتوزيع المخالفات" : "Assess SLA speed, decision verification rates, and section friction levels"}</p>
              </div>

              {/* 📊 SLA & SPEED CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
              { labelAr: "معدل سرعة الرد", labelEn: "SLA Response Speed", val: "4.8 min", color: "text-emerald-400" },
              { labelAr: "جودة القرارات الإدارية", labelEn: "Decision Quality", val: "98.2%", color: "text-blue-400" },
              { labelAr: "البلاغات المنجزة اليوم", labelEn: "Daily Resolved Reports", val: "142", color: "text-purple-400" },
              { labelAr: "معدل قبول التوثيق", labelEn: "Verification Accept Rate", val: "68%", color: "text-amber-400" }].
              map((card, idx) =>
              <div key={idx} className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">
                      {isArabic ? card.labelAr : card.labelEn}
                    </span>
                    <span className={`text-sm font-black block font-mono ${card.color}`}>{card.val}</span>
                  </div>
              )}
              </div>

              {/* 🔥 VIOLATION HEATMAP (Special 3) */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    {isArabic ? "خارطة حرارة المخالفات (Heatmap)" : "Violation Density Heatmap"}
                  </h3>
                  <span className="text-[8px] text-zinc-500">{isArabic ? "أقسام المنصة الأكثر عرضة للاحتكاك والمخالفة" : "Visualizing high-risk community zones"}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                { section: "Chat Channels", rate: "High Friction", color: "bg-red-950 text-red-400 border border-red-900/40" },
                { section: "Comments Hub", rate: "Moderate", color: "bg-orange-950/60 text-orange-400 border border-orange-900/30" },
                { section: "Marketplace Trades", rate: "Low", color: "bg-amber-950/40 text-amber-500 border border-amber-900/20" },
                { section: "Guild Rooms", rate: "Very Low", color: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" }].
                map((heat, idx) =>
                <div key={idx} className={`p-3 rounded-xl text-center space-y-1 ${heat.color}`}>
                      <span className="font-bold block text-[10px]">{heat.section}</span>
                      <span className="text-[8px] font-mono block uppercase tracking-wider">{heat.rate}</span>
                    </div>
                )}
                </div>
              </div>

              {/* 🛡️ MODERATOR POINT SYSTEM LEADERBOARD (Special 6) */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  {isArabic ? "لوحة تقييم ونقاط المشرفين النشطة" : "Active Moderator Points & Quality Leaderboard"}
                </h3>
                <div className="space-y-2">
                  {users.
                filter((u) => getRoleLevel(u.role) >= 4).
                map((mod, _autoIdx) =>
                <div key={`${mod.id}_${_autoIdx}`} className="flex justify-between items-center text-xs bg-black/40 p-2.5 rounded-xl border border-zinc-900 font-mono">
                        <div className="flex items-center gap-2">
                          <img src={mod.avatar} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-zinc-300">{mod.name} ({mod.role})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold block">{mod.points} pts</span>
                          <span className="text-[8px] text-zinc-500 block">SLA Avg: {mod.responseTimeMin}m</span>
                        </div>
                      </div>
                )}
                </div>
              </div>

            </div>
          }

          {/* 9. SECURED SYSTEM AUDIT LOGS (14.14) */}
          {activeSection === "logs" &&
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-500" />
                    {isArabic ? "سجل التدقيق الأمني الشامل (Audit Logs)" : "Immutable System Audit Logs"}
                  </h2>
                  <p className="text-[10px] text-zinc-500">{isArabic ? "سجلات كاملة غير قابلة للتعديل لكل الإجراءات في خوادمنا" : "Chronological logging of administrative, auth, and store events"}</p>
                </div>

                <button
                onClick={exportLogsToCSV}
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
                
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  {isArabic ? "تصدير السجل كملف CSV" : "Export Audit Logs CSV"}
                </button>
              </div>

              {/* Logs display */}
              <div className="space-y-2 text-xs">
                {auditLogs.map((log, _autoIdx) =>
              <div key={`${log.id}_${_autoIdx}`} className="bg-[#0b0c10] border border-zinc-850 p-3.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-purple-400 font-bold">{log.executor}</span>
                        <span className="text-[9px] bg-zinc-950 px-1 py-0.5 rounded text-zinc-400 border border-zinc-900">{log.role}</span>
                      </div>
                      <p className="text-white text-[10px] font-sans font-bold">{log.action}</p>
                      <p className="text-[9px] text-zinc-500 font-sans">{isArabic ? `السبب: ${log.reason}` : `Reason: ${log.reason}`}</p>
                    </div>

                    <div className="text-right space-y-1 text-[9px] text-zinc-500">
                      <div>IP: {log.ip} • {log.device}</div>
                      <div className="text-emerald-400 font-bold">{log.result}</div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* 10. AI MODERATION ASSISTANT */}
          {activeSection === "ai_moderator" &&
          <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                    {isArabic ? "نظام الإشراف التلقائي بالذكاء الاصطناعي" : "Autonomous AI Moderation System"}
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {isArabic ?
                  "رصد وتحليل المحتوى الضار وتطبيق عقوبات فورية لحماية مجتمع الأوتاكو." :
                  "Real-time moderation and content screening to protect our anime community."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {isArabic ? "النظام متصل ونشط" : "Core Moderator Online"}
                  </span>
                </div>
              </div>

              {/* Main Grid: Settings & Sandbox */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Policy Settings (Col Span 5) */}
                <div className="lg:col-span-5 bg-[#0b0c10] border border-zinc-850 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    {isArabic ? "إعدادات سياسة الإشراف" : "AI Moderation Policy"}
                  </h3>

                  {/* Mode Policy Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                      {isArabic ? "وضع الإجراء التلقائي" : "Enforcement Action Mode"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                      type="button"
                      onClick={() => {setModerationPolicy("review_by_human");if (playSynthSound) playSynthSound("tap");}}
                      className={`p-3 rounded-xl border text-left transition-all ${
                      moderationPolicy === "review_by_human" ?
                      "border-purple-500 bg-purple-500/10 text-white" :
                      "border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:border-zinc-800"}`
                      }>
                      
                        <span className="text-xs font-black block">
                          {isArabic ? "المراجعة البشرية" : "Flag for Review"}
                        </span>
                        <span className="text-[9px] text-zinc-500 block leading-tight mt-1">
                          {isArabic ? "يُنشر مع إخفاء المحتوى خلف تحذير" : "Content published but hidden behind a warning mask."}
                        </span>
                      </button>

                      <button
                      type="button"
                      onClick={() => {setModerationPolicy("automated_removal");if (playSynthSound) playSynthSound("tap");}}
                      className={`p-3 rounded-xl border text-left transition-all ${
                      moderationPolicy === "automated_removal" ?
                      "border-red-500 bg-red-500/10 text-white" :
                      "border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:border-zinc-800"}`
                      }>
                      
                        <span className="text-xs font-black block text-red-400">
                          {isArabic ? "الحذف التلقائي" : "Automated Block"}
                        </span>
                        <span className="text-[9px] text-zinc-500 block leading-tight mt-1">
                          {isArabic ? "يُمنع النشر فوراً ويُعرض تحذير للمستخدم" : "Instantly block and delete content on submission."}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Enabled Categories */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                      {isArabic ? "وحدات الكشف النشطة" : "Active Detection Modules"}
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-red-500/10 text-red-400 text-xs">🤬</span>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "خطاب الكراهية والتنمر" : "Hate Speech & Bullying"}
                            </span>
                            <span className="text-[9px] text-zinc-500 block">
                              {isArabic ? "رصد الشتائم والتمييز والتعصب الأعمى" : "Flag toxic abuse, slurs and extreme hostility"}
                            </span>
                          </div>
                        </div>
                        <input
                        type="checkbox"
                        checked={hateSpeechEnabled}
                        onChange={(e) => setHateSpeechEnabled(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                      
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-pink-500/10 text-pink-400 text-xs">🔞</span>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "المحتوى الإباحي والعنف" : "Explicit Content & Nudity"}
                            </span>
                            <span className="text-[9px] text-zinc-500 block">
                              {isArabic ? "منع الألفاظ البذيئة أو العنف المفرط" : "Flag pornography, gore or unsafe material"}
                            </span>
                          </div>
                        </div>
                        <input
                        type="checkbox"
                        checked={nudityEnabled}
                        onChange={(e) => setNudityEnabled(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                      
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs">⚠️</span>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {isArabic ? "الاحتيال والسبام" : "Spam & Phishing Scams"}
                            </span>
                            <span className="text-[9px] text-zinc-500 block">
                              {isArabic ? "رصد الإعلانات المتكررة والروابط الوهمية" : "Detect bot flooding, scams and crypto spam"}
                            </span>
                          </div>
                        </div>
                        <input
                        type="checkbox"
                        checked={spamEnabled}
                        onChange={(e) => setSpamEnabled(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                      
                      </div>
                    </div>
                  </div>

                  {/* Confidence Slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400">
                      <span>{isArabic ? "حد الثقة الأدنى لتطبيق العقوبة" : "Confidence Trigger Threshold"}</span>
                      <span className="text-purple-400 font-mono text-xs">{confidenceThreshold}%</span>
                    </div>
                    <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>50% (Strict)</span>
                      <span>{isArabic ? "توازن مثالي" : "Optimized (75%)"}</span>
                      <span>95% (Lenient)</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                  type="button"
                  onClick={handleSaveModSettings}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md shadow-purple-500/10 active:scale-[0.98]">
                  
                    {isArabic ? "💾 حفظ وتطبيق السياسة" : "💾 Save & Deploy Policy"}
                  </button>
                </div>

                {/* 2. Content Sandbox (Col Span 7) */}
                <div className="lg:col-span-7 bg-[#0b0c10] border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    {isArabic ? "مختبر محاكاة الذكاء الاصطناعي التفاعلي" : "AI Content Sandbox Simulator"}
                  </h3>
                  
                  <p className="text-[10px] text-zinc-400">
                    {isArabic ?
                  "جرب إدخال نصوص مختلفة (مثل منشورات، تعليقات، رسائل) لاختبار مدى كفاءة رصد الذكاء الاصطناعي والتحقق من النتيجة فوراً." :
                  "Type any text content to run a real-time simulation against the backend Gemini model."}
                  </p>

                  <div className="relative flex-1">
                    <textarea
                    value={sandboxText}
                    onChange={(e) => setSandboxText(e.target.value)}
                    placeholder={isArabic ? "اكتب هنا نصاً للتجربة... (مثال: 'تباً لكم يا كارهي ون بيس...')" : "Type test content here... (e.g. 'This Otaku is so stupid...')"}
                    className="w-full h-24 p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-none font-sans" />
                  
                    <button
                    type="button"
                    disabled={isSandboxAnalyzing || !sandboxText.trim()}
                    onClick={handleAnalyzeSandbox}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-all disabled:opacity-50">
                    
                      {isSandboxAnalyzing ?
                    <>
                          <span className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          {isArabic ? "جاري التحليل..." : "Analyzing..."}
                        </> :

                    <>
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          {isArabic ? "تحليل النص" : "Analyze Text"}
                        </>
                    }
                    </button>
                  </div>

                  {/* Sandbox Analysis Result Display */}
                  {sandboxResult &&
                <div className={`p-4 rounded-xl border transition-all animate-fadeIn ${
                sandboxResult.flagged ?
                "bg-red-950/10 border-red-500/30" :
                "bg-emerald-950/10 border-emerald-500/30"}`
                }>
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{sandboxResult.flagged ? "🚨" : "✅"}</span>
                          <span className="text-xs font-black text-white">
                            {sandboxResult.flagged ?
                        isArabic ? "تم اكتشاف محتوى مخالف!" : "Inappropriate Content Detected!" :
                        isArabic ? "محتوى آمن ونظيف" : "Content is Safe & Approved"}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    sandboxResult.flagged ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`
                    }>
                          {sandboxResult.category}
                        </span>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        {/* Risk Confidence Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-500 font-mono text-[9px]">
                            <span>{isArabic ? "معدل الثقة واليقين" : "AI Confidence Level"}</span>
                            <span className={sandboxResult.flagged ? "text-red-400" : "text-emerald-400"}>
                              {(sandboxResult.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div
                          className={`h-full rounded-full transition-all duration-500 ${
                          sandboxResult.flagged ? "bg-red-500" : "bg-emerald-500"}`
                          }
                          style={{ width: `${sandboxResult.confidence * 100}%` }} />
                        
                          </div>
                        </div>

                        {/* Semantic Reason Description */}
                        <div className="bg-zinc-950/30 p-2 rounded-lg border border-zinc-900 space-y-1">
                          <p className="text-white leading-relaxed font-sans">{isArabic ? sandboxResult.reasonAr : sandboxResult.reasonEn}</p>
                          <p className="text-zinc-500 text-[9px] leading-relaxed font-mono">{isArabic ? sandboxResult.reasonEn : sandboxResult.reasonAr}</p>
                        </div>
                      </div>
                    </div>
                }
                </div>
              </div>

              {/* 3. Live Moderation Review Queue (Human-in-the-loop) */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    {isArabic ? "قائمة مراجعة المحتوى المعلق (مراجعة بشرية)" : "Pending Content Moderation Queue (Human Review)"}
                  </h3>
                  <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded-full">
                    {aiQueue.filter((x) => x.status === "pending").length} {isArabic ? "معلق" : "Pending Item(s)"}
                  </span>
                </div>

                <p className="text-[10px] text-zinc-400">
                  {isArabic ?
                "المنشورات والتعليقات والرسائل التي يكتشفها الذكاء الاصطناعي يتم تحويلها إلى هذه القائمة لتأكيد المراجعة أو استرجاعها وإزالة المخالفات." :
                "Review flagged posts, comments, or private messages. Authorize automatic decisions or override false positives."}
                </p>

                {aiQueue.filter((x) => x.status === "pending").length === 0 ?
              <div className="text-center py-8 bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl space-y-2">
                    <span className="text-2xl block">🎉</span>
                    <span className="text-xs font-bold text-zinc-400 block">
                      {isArabic ? "قائمة الإشراف نظيفة تماماً!" : "Moderation Queue is completely clean!"}
                    </span>
                    <span className="text-[10px] text-zinc-600 block">
                      {isArabic ? "لا توجد بلاغات معلقة متبقية." : "No pending items require human intervention."}
                    </span>
                  </div> :

              <div className="space-y-3">
                    {aiQueue.filter((x) => x.status === "pending").map((item, _autoIdx) =>
                <div
                  key={`${item.id}_${_autoIdx}`}
                  className="bg-[#07080c] border border-zinc-900 hover:border-zinc-800 p-4 rounded-xl transition-all space-y-3 flex flex-col md:flex-row justify-between md:items-start gap-4">
                  
                        {/* Left Content Column */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            {/* Content Type Badge */}
                            <span className="font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider font-bold">
                              {item.contentType}
                            </span>
                            
                            {/* Flag Category Badge */}
                            <span className="font-mono bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-950 font-bold uppercase">
                              🚨 {item.flaggedCategory} - {(item.confidence * 100).toFixed(0)}%
                            </span>

                            <span className="text-zinc-600 font-mono">•</span>

                            {/* Author */}
                            <span className="text-zinc-400 font-bold">
                              @{item.authorName || "User"}
                            </span>

                            <span className="text-zinc-600 font-mono">•</span>

                            {/* Timestamp */}
                            <span className="text-zinc-500 text-[9px] font-mono">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Original Text Block */}
                          <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-900/60 font-sans text-xs text-white leading-relaxed break-words">
                            "{item.content}"
                          </div>

                          {/* AI Explanation reasoning */}
                          <div className="flex gap-2 text-[10px] text-zinc-400 bg-purple-950/5 p-2 rounded border border-purple-950/20 leading-relaxed font-sans">
                            <span className="text-base text-purple-400 select-none">🤖</span>
                            <div>
                              <p className="font-bold text-purple-300">{isArabic ? "سبب الفلترة:" : "AI Reasoning:"}</p>
                              <p>{isArabic ? item.reasonAr : item.reasonEn}</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{isArabic ? item.reasonEn : item.reasonAr}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Actions Column */}
                        <div className="flex md:flex-col items-stretch gap-2 shrink-0 md:w-32 justify-end">
                          <button
                      type="button"
                      onClick={() => handleResolveReport(item.id, "approve")}
                      className="flex-1 py-2 px-3 bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-500 rounded-lg text-[10px] font-black text-emerald-400 flex items-center justify-center gap-1.5 transition-all">
                      
                            <Check className="w-3.5 h-3.5" />
                            {isArabic ? "موافقة (خاطئ)" : "Approve (Safe)"}
                          </button>
                          
                          <button
                      type="button"
                      onClick={() => handleResolveReport(item.id, "delete")}
                      className="flex-1 py-2 px-3 bg-red-950/20 border border-red-500/30 hover:border-red-500 rounded-lg text-[10px] font-black text-red-400 flex items-center justify-center gap-1.5 transition-all">
                      
                            <X className="w-3.5 h-3.5" />
                            {isArabic ? "حذف وحظر" : "Delete Content"}
                          </button>
                        </div>
                      </div>
                )}
                  </div>
              }
              </div>

              {/* Keep the Fingerprint & SLA statistics as sub-elements below for maximum dashboard depth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Suspicious account detection */}
                <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3 text-xs">
                  <h3 className="font-black text-white flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-amber-500" />
                    {isArabic ? "كشف السلوك المشبوه والحسابات الوهمية" : "Fingerprint Engine: Suspicious Entities"}
                  </h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    {isArabic ?
                  "يقوم الذكاء الاصطناعي برصد الحسابات التي تستخدم نفس البصمة الرقمية للجهاز (Hardware GUID) ولديها نمط لغوي مكرر في السب والشتم." :
                  "Analyzes device fingerprints, typing patterns and rapid session switches to flag potential sockpuppets."}
                  </p>
                  <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-amber-500 font-bold">@SpamKing44</span>
                      <span className="text-red-500">98% sockpuppet probability</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Matches banned user @RudeGamer GUID block</span>
                  </div>
                </div>

                {/* SLAs summary / expected times */}
                <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3 text-xs">
                  <h3 className="font-black text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {isArabic ? "اتفاقيات مستوى الخدمة (SLA)" : "SLA Target Matrix"}
                  </h3>
                  <div className="space-y-1.5 text-[10px] font-mono font-bold">
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span>Inappropriate Comment</span>
                      <span className="text-emerald-400">10 mins Target</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span>Manga Spoilers Leaks</span>
                      <span className="text-emerald-400">15 mins Target</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span>Account Appeal Restitution</span>
                      <span className="text-purple-400">24 hours Target</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          {/* 11. SECURITY & RBAC PERMISSIONS */}
          {activeSection === "security_center" &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {isArabic ? "إدارة الصلاحيات ورتب النظام (RBAC Config)" : "Access Guard: RBAC Permissions System"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "منح أو سحب الصلاحيات التفصيلية لكل رتبة إدارية" : "Fine-tune or revoke specific capability flags across the 9 administrative tiers"}</p>
              </div>

              {/* RBAC custom switch mock */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3 text-xs">
                <h3 className="font-black text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  {isArabic ? `تعديل صلاحيات رتبة: ${simulatedRole}` : `Toggle Permissions for: ${simulatedRole}`}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                { id: "delete_post", label: isArabic ? "حذف المنشورات العامة" : "Delete General Posts" },
                { id: "ban_user", label: isArabic ? "حظر مستخدم دائم" : "Permanently Terminate Accounts" },
                { id: "mute_user", label: isArabic ? "كتم المستخدمين مؤقتاً" : "Mute General Chatters" },
                { id: "manage_system", label: isArabic ? "تعديل خيارات النظام العام" : "Configure Backend Integrations" }].
                map((perm, _autoIdx) => {
                  const isEnabled = (rolePermissions[simulatedRole] || []).includes(perm.id);
                  return (
                    <div key={`admin_perm_${perm.id}_${_autoIdx}`} className="flex justify-between items-center bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850">
                        <span>{perm.label}</span>
                        <button
                        onClick={() => {
                          playSound("click");
                          setRolePermissions((prev) => {
                            const current = prev[simulatedRole] || [];
                            const updated = current.includes(perm.id) ?
                            current.filter((p) => p !== perm.id) :
                            [...current, perm.id];
                            return { ...prev, [simulatedRole]: updated };
                          });
                        }}
                        className={`text-[9px] font-black px-3 py-1 rounded-lg transition-all ${
                        isEnabled ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500"}`
                        }>
                        
                          {isEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>);

                })}
                </div>
              </div>

              {/* 2FA & Confirm sensitive actions simulator (14.17 Security) */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3 text-xs">
                <h3 className="font-black text-white">{isArabic ? "خيارات الحماية الإضافية للمشرفين" : "Shield Protocol Integrations"}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold block">{isArabic ? "طلب تأكيد العمليات الحساسة" : "Confirm Sensitive Actions"}</span>
                      <span className="text-[10px] text-zinc-500">{isArabic ? "يطلب نافذة تأكيد قبل تنفيذ عقوبات الحظر أو الحذف" : "Triggers an extra confirm layer before deletions or bans"}</span>
                    </div>
                    <button
                    onClick={() => setRequireSecurityConfirm(!requireSecurityConfirm)}
                    className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl ${
                    requireSecurityConfirm ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-500"}`
                    }>
                    
                      {requireSecurityConfirm ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold block">{isArabic ? "فرض المصادقة الثنائية (2FA)" : "Enforce Multi-Factor Auths"}</span>
                      <span className="text-[10px] text-zinc-500">{isArabic ? "حماية حسابات المشرفين من الاختراق" : "Shield admin dashboards with physical or software keys"}</span>
                    </div>
                    <button
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl ${
                    is2FAEnabled ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500"}`
                    }>
                    
                      {is2FAEnabled ? "PROTECTED" : "DISABLED"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          }

          {/* 12. INTERNAL KNOWLEDGE BASE (Special 7) */}
          {activeSection === "knowledge_base" &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  {isArabic ? "مركز المعرفة وإرشادات المشرفين" : "Empire Moderator Knowledge Base & Protocol guidelines"}
                </h2>
                <p className="text-[10px] text-zinc-500">{isArabic ? "اللوائح الرسمية لآداب الإشراف وحساب العقوبات الموحدة" : "A reference library of policies, terms and logging templates"}</p>
              </div>

              <div className="space-y-3">
                {INTERNAL_KNOWLEDGE_BASE.map((kb, _autoIdx) =>
              <div key={`${kb.id}_${_autoIdx}`} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl space-y-2">
                    <h3 className="text-xs font-black text-white">{isArabic ? kb.titleAr : kb.titleEn}</h3>
                    <span className="inline-block text-[8px] bg-blue-950/50 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded font-mono">
                      {isArabic ? kb.categoryAr : kb.categoryEn}
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{isArabic ? kb.contentAr : kb.contentEn}</p>
                  </div>
              )}
              </div>
            </div>
          }

          {/* 13. BANNED SCREEN SIMULATOR TRIGGER */}
          {activeSection === "ban_simulator" &&
          <div className="space-y-4">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-red-500" />
                  {isArabic ? "تجربة واختبار شاشة الحظر للمخالفين" : "Violator Banned Screen Sandbox"}
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {isArabic ?
                "اختبر ما يظهر للمخالف عند حظر حسابه، ونظام الطعون المرتبط به" :
                "Experience how the platform looks when a permanent user ban triggers"}
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl max-w-sm text-center space-y-4 text-xs">
                <span>☠️</span>
                <p className="text-[10px] text-zinc-400">
                  {isArabic ?
                "عند النقر على الزر بالأسفل، سيتم محاكاة تسجيل خروجك وعرض شاشة الحظر الكاملة مع كود القضية، سجل المخالفات، وحقل إرسال الاعتراض." :
                "Simulate a forced logout with the official Ban Appeal Screen where you can state reasons, upload evidence, and monitor logs."}
                </p>
                <button
                onClick={() => {
                  setShowBannedScreen(true);
                  playSound("error");
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-[11px] py-2.5 rounded-xl cursor-pointer">
                
                  ☠️ {isArabic ? "تفعيل شاشة الحظر والطعون" : "Launch Ban Screen Simulator"}
                </button>
              </div>
            </div>
          }

          {/* 14. APK MANAGEMENT & STORAGE VALIDATION SYSTEM */}
          {activeSection === "apk_management" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  {isArabic ? "إدارة حزم الـ APK والتحقق من التخزين" : "APK Storage & Package Release System"}
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {isArabic
                    ? "التحقق التلقائي من وجود الملف في التخزين، التأكد من أن الحجم أكثر من 500KB، وإدارة التحميل المباشر."
                    : "Automated verification of stored APK presence, enforcing >500KB minimum threshold before release."}
                </p>
              </div>

              {/* Status Summary Card */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-4 sm:p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">
                          AnimeBlack-v2.5.0-Release.apk
                        </h3>
                        {apkStatus?.exists && apkStatus?.size >= 500 * 1024 ? (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                            جاهز ولائم للتنزيل (سليم)
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                            غير متوفر أو تالف (&lt; 500KB)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Package: com.animeblack.app • Target: Android Release
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchAdminApkStatus}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer self-start sm:self-center"
                  >
                    🔄 {isArabic ? "تحديث حالة الملف" : "Refresh Status"}
                  </button>
                </div>

                {/* Storage Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-900/50 border border-zinc-850 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold block">
                      {isArabic ? "حالة الملف في الخادم:" : "Server Storage Status:"}
                    </span>
                    <span className={`text-xs font-black ${apkStatus?.exists ? "text-emerald-400" : "text-red-400"}`}>
                      {apkStatus?.exists ? (isArabic ? "موجود في التخزين ✅" : "Present in Storage ✅") : (isArabic ? "مفقود ❌" : "Missing ❌")}
                    </span>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-850 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold block">
                      {isArabic ? "حجم الملف الحالي:" : "Current File Size:"}
                    </span>
                    <span className={`text-xs font-black font-mono ${apkStatus && apkStatus.size >= 500 * 1024 ? "text-emerald-400" : "text-amber-400"}`}>
                      {apkStatus?.sizeFormatted || (isArabic ? "غير معروف" : "Unknown")}
                    </span>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-850 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold block">
                      {isArabic ? "الحد الأدنى المطلوب:" : "Minimum Requirement:"}
                    </span>
                    <span className="text-xs font-black text-blue-400 font-mono">
                      &gt; 5.00 MB (5,242,880 B)
                    </span>
                  </div>
                </div>

                {/* Validation Error / Warning Banner */}
                {apkValidationError && (
                  <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-xs">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-200">
                        {isArabic ? "🚨 تحذير دالة التحكم بملف الـ APK (Validation Failed):" : "🚨 Validation Safeguard Triggered:"}
                      </p>
                      <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
                        {apkValidationError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAdminApkDownload}
                    disabled={isBuildingApk || (downloadProgress !== null && downloadProgress < 100)}
                    className={`flex-1 flex items-center justify-center gap-2 font-black text-xs py-3 rounded-xl transition-all ${
                      apkStatus?.exists && apkStatus?.size >= 500 * 1024
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-80"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadProgress !== null
                        ? isArabic ? `جاري التنزيل (${downloadProgress}%)...` : `Downloading (${downloadProgress}%)...`
                        : isArabic ? "تحميل ملف الـ APK المباشر" : "Download Verified APK Package"}
                    </span>
                  </button>

                  <button
                    onClick={handleAdminRebuildApk}
                    disabled={isBuildingApk}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isBuildingApk ? "⏳" : "⚙️"}</span>
                    <span>
                      {isBuildingApk
                        ? isArabic ? "جاري بناء الـ APK..." : "Compiling APK..."
                        : isArabic ? "إعادة بناء وتجميع الـ APK" : "Rebuild APK Package"}
                    </span>
                  </button>
                </div>

                {/* Visual Download ProgressBar */}
                {downloadProgress !== null && (
                  <div className="bg-zinc-950/90 border border-emerald-500/40 p-4 rounded-2xl space-y-2.5 animate-fade-in shadow-xl shadow-emerald-950/20">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <span>
                          {downloadProgress < 20
                            ? isArabic ? "جاري التحقق من التخزين والترويسات..." : "Verifying storage headers..."
                            : downloadProgress < 100
                            ? isArabic ? "جاري دفق وسحب بيانات الـ APK من السيرفر..." : "Streaming APK bytes from storage server..."
                            : isArabic ? "اكتمل التنزيل بنجاح! 🚀" : "Download Completed Successfully! 🚀"}
                        </span>
                      </span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {downloadProgress}%
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden border border-zinc-800 p-0.5 relative">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-200 relative"
                        style={{ width: `${downloadProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                      <span>
                        {isArabic ? "الحجم المطلوب: > 5.00 MB" : "Required Size: > 5.00 MB"}
                      </span>
                      <span>
                        {apkStatus?.size
                          ? `${((downloadProgress / 100) * (apkStatus.size / (1024 * 1024))).toFixed(2)} MB / ${(apkStatus.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${downloadProgress}%`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Response Headers & Technical Verification Box */}
                <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-2 text-[10px] font-mono text-zinc-400">
                  <span className="text-zinc-300 font-bold text-[11px] block">
                    {isArabic ? "🛠️ ترويسات الاستجابة المسجلة (HTTP Download Headers):" : "🛠️ Active Download HTTP Response Headers:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Content-Type: </span>
                      <span className="text-emerald-400 font-bold">application/vnd.android.package-archive</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Content-Disposition: </span>
                      <span className="text-emerald-400 font-bold">attachment; filename="AnimeBlack-v2.5.0-Release.apk"</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Cache-Control: </span>
                      <span className="text-amber-400 font-bold">no-cache, no-store, must-revalidate</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Validation Filter: </span>
                      <span className="text-blue-400 font-bold">Size &gt; 500KB &amp; Zip Manifest Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>);

}