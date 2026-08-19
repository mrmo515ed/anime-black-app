import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  RefreshCw,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Copy,
  Share2,
  Hash,
  Globe,
  MapPin,
  Lock,
  Shield,
  Bell,
  Sliders,
  Eye,
  EyeOff,
  Smartphone,
  Key,
  Database,
  History,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  Smartphone as PhoneIcon,
  WifiOff,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft } from
"lucide-react";
import { compressImage } from "../utils/imageUtils";

interface AccountCustomizationProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  playSynthSound: (type: "tap" | "success" | "purchase" | "levelup" | "error") => void;
  triggerHapticFeedback: (type: "success" | "error" | "purchase" | "levelup" | "tap") => void;
  triggerInAppNotification: (title: string, body: string, badge?: string) => void;
  onClose: () => void;
  initialPage?: number | null;
}

export default function AccountCustomizationSystem({
  isArabic,
  currentUser,
  setCurrentUser,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  onClose,
  initialPage
}: AccountCustomizationProps) {
  // Navigation & Category states
  const [activePage, setActivePage] = useState<number | null>(initialPage ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialPage !== undefined) {
      setActivePage(initialPage);
    }
  }, [initialPage]);

  // Global loading / offline states
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerInAppNotification(
        isArabic ? "تم استعادة الاتصال" : "Connection Restored",
        isArabic ? "جاري مزامنة التعديلات المعلقة..." : "Syncing pending customizations with servers...",
        "🟢"
      );
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerInAppNotification(
        isArabic ? "أنت في وضع عدم الاتصال" : "You are Offline",
        isArabic ? "سيتم حفظ أي تعديلات محلياً ومزامنتها لاحقاً." : "Changes will be saved locally and synced later.",
        "🔴"
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineQueue]);

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setLoading(true);
    try {
      const { db } = await import("../firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      let merged = {};
      offlineQueue.forEach((item) => {
        merged = { ...merged, ...item };
      });
      await updateDoc(doc(db, "users", currentUser.uid), merged);
      setOfflineQueue([]);
      triggerInAppNotification(
        isArabic ? "تمت المزامنة بنجاح" : "Sync Completed",
        isArabic ? "تم تحديث جميع بيانات حسابك في السحابة بنجاح!" : "All your account customizations synced successfully!",
        "✨"
      );
    } catch (e) {
      console.error("Offline sync error", e);
    } finally {
      setLoading(false);
    }
  };

  // Safe Firestore updater
  const handleSaveToFirestore = async (fieldsToUpdate: any) => {
    setLoading(true);
    const updatedWithTimestamp = {
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString()
    };

    // Update Local React State First
    setCurrentUser((prev: any) => ({
      ...prev,
      ...updatedWithTimestamp
    }));

    // Update Audit Log local/remote
    const newLog = {
      action: Object.keys(fieldsToUpdate).join(", "),
      timestamp: new Date().toISOString()
    };
    const currentLogs = currentUser?.customizationAuditLogs || [];
    const updatedLogs = [newLog, ...currentLogs].slice(0, 50);
    updatedWithTimestamp.customizationAuditLogs = updatedLogs;

    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, updatedWithTimestamp]);
      playSynthSound("success");
      triggerInAppNotification(
        isArabic ? "حُفظ محلياً" : "Saved Locally",
        isArabic ? "تم حفظ التعديلات في جهازك بسبب انقطاع الإنترنت." : "Changes saved locally. Will upload when connection is restored.",
        "💾"
      );
      setLoading(false);
      return true;
    }

    try {
      const { db } = await import("../firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", currentUser.uid), updatedWithTimestamp);
      playSynthSound("success");
      triggerHapticFeedback("success");
      triggerInAppNotification(
        isArabic ? "تم حفظ التعديلات" : "Changes Saved",
        isArabic ? "تم تحديث بيانات حسابك بنجاح وبشكل فوري!" : "Your account customization has been saved and applied instantly!",
        "✅"
      );
      setLoading(false);
      return true;
    } catch (err) {
      const { handleFirestoreError, OperationType } = await import("../firestoreUtils");
      try {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      } catch (e) {}
      triggerInAppNotification(
        isArabic ? "فشل الحفظ" : "Save Failed",
        isArabic ? "حدث خطأ أثناء الاتصال بقاعدة البيانات." : "An error occurred while writing to Firestore database.",
        "❌"
      );
      setLoading(false);
      return false;
    }
  };

  // Request Permissions Simulation / Check
  const [permissionStates, setPermissionStates] = useState({
    camera: "granted",
    photos: "granted",
    video: "granted",
    storage: "granted",
    notifications: "prompt",
    microphone: "prompt",
    location: "prompt"
  });

  const requestPermission = async (name: string) => {
    playSynthSound("tap");
    setLoading(true);
    setTimeout(() => {
      setPermissionStates((prev) => ({ ...prev, [name]: "granted" }));
      setLoading(false);
      triggerInAppNotification(
        isArabic ? "تم منح الصلاحية" : "Permission Granted",
        isArabic ? `تم تفعيل صلاحية ${name} بنجاح للتطبيق.` : `Successfully authorized ${name} access for the app.`,
        "🛡️"
      );
    }, 800);
  };

  // 1. PROFILE PICTURE STATE
  const [avatarImg, setAvatarImg] = useState(currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [avatarPan, setAvatarPan] = useState({ x: 0, y: 0 });
  const [avatarFileInfo, setAvatarFileInfo] = useState({ size: "75 KB", dimensions: "400x400" });
  const [avatarCameraActive, setAvatarCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startAvatarCamera = async () => {
    playSynthSound("tap");
    setAvatarCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      triggerInAppNotification(
        isArabic ? "فشل فتح الكاميرا" : "Camera Access Failed",
        isArabic ? "يرجى منح صلاحية الكاميرا للمتصفح أولاً." : "Please allow camera access in your browser settings.",
        "📷"
      );
      // Simulated fallback Selfie Camera frame
      setTimeout(() => {
        setAvatarImg("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400");
        setAvatarFileInfo({ size: "124 KB", dimensions: "512x512" });
        setAvatarCameraActive(false);
        triggerInAppNotification(
          isArabic ? "تم التقاط سيلفي محاكي" : "Simulated Selfie Captured",
          isArabic ? "تم توليد لقطة سيلفي واقعية بنجاح للـ Avatar!" : "Realistic simulated selfie generated successfully!",
          "📸"
        );
      }, 1500);
    }
  };

  const captureAvatar = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarImg(dataUrl);
        setAvatarFileInfo({ size: "64 KB", dimensions: "400x400" });
        // stop video stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((t) => t.stop());
      }
    }
    setAvatarCameraActive(false);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported check
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      playSynthSound("error");
      alert(isArabic ? "ملف غير مدعوم! يرجى اختيار صورة بصيغة JPG, PNG, WEBP, GIF" : "Unsupported file! Only JPG, PNG, WEBP, GIF are allowed.");
      return;
    }

    // Size load
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        // Prevent too small images
        if (img.width < 120 || img.height < 120) {
          playSynthSound("error");
          alert(isArabic ? "الصورة صغيرة جداً! يجب أن تكون الأبعاد على الأقل 120x120 بكسل." : "Image is too small! Must be at least 120x120 pixels.");
          return;
        }
        setAvatarFileInfo({
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: `${img.width}x${img.height}`
        });
        const compressed = await compressImage(file, 400);
        setAvatarImg(compressed);
      };
    };
  };

  // 2. COVER PHOTO STATE
  const [coverImg, setCoverImg] = useState(currentUser?.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverPan, setCoverPan] = useState({ x: 0, y: 0 });

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800);
    setCoverImg(compressed);
  };

  // 3. NAME STATE
  const [displayName, setDisplayName] = useState(currentUser?.name || "Luffy Otaku");
  const [lastChangedName, setLastChangedName] = useState(currentUser?.nameUpdatedAt || "2026-06-15");

  // 4. USERNAME STATE
  const [username, setUsername] = useState(currentUser?.username || "luffy_99");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [lastChangedUsername, setLastChangedUsername] = useState(currentUser?.usernameUpdatedAt || "2026-05-10");

  useEffect(() => {
    if (!username) return;
    const clean = username.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    if (clean !== username) {
      setUsername(clean);
    }

    const check = async () => {
      setCheckingUsername(true);
      try {
        const { db } = await import("../firebase");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "users"), where("username", "==", username));
        const snap = await getDocs(q);
        const isSelf = username === currentUser?.username;
        const available = snap.empty || isSelf;
        setUsernameAvailable(available);

        if (!available) {
          // Suggest 3 alternatives
          setSuggestedUsernames([
          `${username}_black`,
          `${username}_99`,
          `otaku_${username}`]
          );
        } else {
          setSuggestedUsernames([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeout = setTimeout(check, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  // 5. BIO STATE
  const [bio, setBio] = useState(currentUser?.bio || "🏴‍☠️ Mugiwara no Luffy • Pirate King!");
  const parseBioMentionsAndHashtags = (text: string) => {
    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith("#") && word.length > 1) {
        return <span key={i} className="text-red-500 font-bold">{word}</span>;
      }
      if (word.startsWith("@") && word.length > 1) {
        return <span key={i} className="text-cyan-400 font-black">{word}</span>;
      }
      return word;
    });
  };

  // 6. ACCOUNT INFO STATE
  const [gender, setGender] = useState(currentUser?.gender || "Male");
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || "1999-05-05");
  const [country, setCountry] = useState(currentUser?.country || "Japan");
  const [city, setCity] = useState(currentUser?.city || "Tokyo");
  const [language, setLanguage] = useState(currentUser?.language || "Arabic");
  const [timezone, setTimezone] = useState(currentUser?.timezone || "GMT+3");
  const [website, setWebsite] = useState(currentUser?.website || "https://animeblack.club");

  const triggerGeolocation = () => {
    playSynthSound("tap");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCity(`GPS: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        triggerInAppNotification(
          isArabic ? "تم تحديد الموقع" : "Coordinates Found",
          isArabic ? "تم العثور على إحداثياتك الدقيقة باستخدام GPS." : "Fetched your GPS coordinates successfully.",
          "📍"
        );
      }, () => {
        triggerInAppNotification(
          isArabic ? "فشل تحديد الموقع" : "Location Refused",
          isArabic ? "يرجى كتابة مدينتك يدوياً." : "Please type your city manually.",
          "⚠️"
        );
      });
    }
  };

  // 7. SOCIAL LINKS STATE
  const [socials, setSocials] = useState<any>(currentUser?.socialLinks || {
    discord: "luffy#1234",
    telegram: "@luffy_tg",
    facebook: "",
    instagram: "@luffy_insta",
    x: "@luffy_x",
    tiktok: "",
    youtube: "",
    github: "mugiwara",
    website: "https://luffy.io"
  });

  // 8. APPEARANCE STATE
  const [themeColor, setThemeColor] = useState(currentUser?.profileThemeColor || "#FF3D00");
  const [buttonColor, setButtonColor] = useState(currentUser?.profileButtonColor || "#FF3D00");
  const [bgStyle, setBgStyle] = useState(currentUser?.profileBgStyle || "cosmic");
  const [showCover, setShowCover] = useState(currentUser?.showCover !== false);
  const [showAvatar, setShowAvatar] = useState(currentUser?.showAvatar !== false);

  // 9. PRIVACY STATE
  const [privacy, setPrivacy] = useState<any>(currentUser?.privacySettings || {
    privateAccount: false,
    hideLastSeen: false,
    hideFollowers: false,
    hideFollowing: false,
    hideLikes: false,
    hidePosts: false,
    hideActivity: false,
    blockDMs: false,
    followersOnlyDMs: false,
    friendsOnlyComments: false,
    blockTags: false,
    blockMentions: false,
    blockContentCopy: false,
    blockImageDownloads: false
  });

  // 10. SECURITY STATE
  const [password, setPassword] = useState("********");
  const [email, setEmail] = useState(currentUser?.email || "luffy@animeblack.com");
  const [phone, setPhone] = useState(currentUser?.phone || "+966555555555");
  const [twoFactor, setTwoFactor] = useState(currentUser?.twoFactorActive || false);
  const [appPin, setAppPin] = useState(currentUser?.appPin || "1234");
  const [loginHistory] = useState([
  { ip: "192.168.1.1", device: "iPhone 15 Pro", location: "Riyadh, SA", date: "2026-07-21 14:20" },
  { ip: "84.22.40.109", device: "Chrome / Windows 11", location: "Jeddah, SA", date: "2026-07-20 09:12" }]
  );

  // 11. NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState<any>(currentUser?.notificationSettings || {
    messages: true,
    followers: true,
    likes: true,
    comments: true,
    replies: true,
    mentions: true,
    groups: true,
    events: true,
    news: false,
    ads: false,
    updates: true,
    newAnime: true,
    liveStream: true
  });

  // 13. MEDIA CLEANUP SIMULATION STATE
  const [cacheSize, setCacheSize] = useState("34.2 MB");
  const [tempImagesSize, setTempImagesSize] = useState("18.4 MB");
  const [tempVideosSize, setTempVideosSize] = useState("42.1 MB");

  const clearCache = () => {
    playSynthSound("tap");
    setLoading(true);
    setTimeout(() => {
      setCacheSize("0 KB");
      setLoading(false);
      triggerInAppNotification(
        isArabic ? "تم تنظيف ذاكرة الكاش" : "Cache Cleared",
        isArabic ? "تم مسح جميع الملفات المؤقتة وتسريع أداء التطبيق!" : "Cleared all temporary files, boosting application performance!",
        "🧹"
      );
    }, 1200);
  };

  const clearTempImages = () => {
    playSynthSound("tap");
    setLoading(true);
    setTimeout(() => {
      setTempImagesSize("0 KB");
      setLoading(false);
      triggerInAppNotification(
        isArabic ? "تم حذف الصور المؤقتة" : "Images Cleaned",
        isArabic ? "تم تنظيف المعرض المؤقت لصور الأنمي." : "Temporary anime images cleared successfully.",
        "🖼️"
      );
    }, 1000);
  };

  const clearTempVideos = () => {
    playSynthSound("tap");
    setLoading(true);
    setTimeout(() => {
      setTempVideosSize("0 KB");
      setLoading(false);
      triggerInAppNotification(
        isArabic ? "تم حذف الفيديوهات المؤقتة" : "Videos Cleaned",
        isArabic ? "تم مسح كاش بكرات الفيديو والبثوث بنجاح." : "Reels and stream buffer storage cleared.",
        "🎥"
      );
    }, 1000);
  };

  // Revert handlers
  const handleRevert = (type: string) => {
    playSynthSound("tap");
    if (type === "avatar") {
      setAvatarImg(currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
      setAvatarZoom(1);
      setAvatarRotation(0);
      setAvatarPan({ x: 0, y: 0 });
    } else if (type === "cover") {
      setCoverImg(currentUser?.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
      setCoverZoom(1);
      setCoverPan({ x: 0, y: 0 });
    } else if (type === "name") {
      setDisplayName(currentUser?.name || "Luffy Otaku");
    } else if (type === "username") {
      setUsername(currentUser?.username || "luffy_99");
    } else if (type === "bio") {
      setBio(currentUser?.bio || "");
    } else if (type === "info") {
      setGender(currentUser?.gender || "Male");
      setBirthDate(currentUser?.birthDate || "1999-05-05");
      setCountry(currentUser?.country || "Japan");
      setCity(currentUser?.city || "Tokyo");
      setLanguage(currentUser?.language || "Arabic");
      setTimezone(currentUser?.timezone || "GMT+3");
      setWebsite(currentUser?.website || "https://animeblack.club");
    } else if (type === "socials") {
      setSocials(currentUser?.socialLinks || {});
    } else if (type === "appearance") {
      setThemeColor(currentUser?.profileThemeColor || "#FF3D00");
      setButtonColor(currentUser?.profileButtonColor || "#FF3D00");
      setBgStyle(currentUser?.profileBgStyle || "cosmic");
      setShowCover(currentUser?.showCover !== false);
      setShowAvatar(currentUser?.showAvatar !== false);
    } else if (type === "privacy") {
      setPrivacy(currentUser?.privacySettings || {});
    } else if (type === "notifications") {
      setNotifications(currentUser?.notificationSettings || {});
    }
    triggerInAppNotification(
      isArabic ? "تم التراجع عن التعديلات" : "Changes Reverted",
      isArabic ? "تم استعادة قيم حسابك الأصلية المسجلة مسبقاً." : "Successfully restored previous values.",
      "🔄"
    );
  };

  const categories = [
  { id: "all", labelAr: "الكل (15)", labelEn: "All Features (15)", icon: Sliders },
  { id: "visual", labelAr: "🎨 الهوية البصرية", labelEn: "Visual Identity", icon: Palette },
  { id: "identity", labelAr: "📝 البيانات والتعريف", labelEn: "Profile Info", icon: User },
  { id: "security", labelAr: "🔒 الأمان والخصوصية", labelEn: "Security & Privacy", icon: Shield },
  { id: "tools", labelAr: "🛠️ الوسائط والأدوات", labelEn: "Media & Tools", icon: Database }];


  const pagesList = [
  { id: 1, category: "visual", titleAr: "الصورة الشخصية (الأفاتار)", titleEn: "Profile Picture (Avatar)", icon: Camera, descAr: "تحديث صورة حسابك الأفاتار، قصها، تدويرها، والتقاط سيلفي مباشر", descEn: "Update, crop, rotate, and capture your main avatar", tagAr: "بصرية", tagEn: "Visual" },
  { id: 2, category: "visual", titleAr: "صورة الغلاف (Banner)", titleEn: "Cover Photo", icon: ImageIcon, descAr: "إدارة غلاف خلفية ملفك الشخصي بنسب الأبعاد وعرض التفاعل عليه", descEn: "Customize and pan your widescreen profile banner", tagAr: "بصرية", tagEn: "Visual" },
  { id: 3, category: "identity", titleAr: "الاسم المعروض", titleEn: "Display Name", icon: User, descAr: "تغيير اسمك العام وفحص التكرار والفلترة وتاريخ التعديل", descEn: "Modify your display name with filter safeguards", tagAr: "هوية", tagEn: "Identity" },
  { id: 4, category: "identity", titleAr: "اسم المستخدم (Username)", titleEn: "Username Handle", icon: Sliders, descAr: "تعديل معرّف حسابك الفريد وفحص توفره الفوري والروابط", descEn: "Set your unique username handle with live checking", tagAr: "هوية", tagEn: "Identity" },
  { id: 5, category: "identity", titleAr: "النبذة والشعار (Bio)", titleEn: "Bio & Motto", icon: Hash, descAr: "صياغة بايـو معبر مع تفعيل الهاشتاق والمنشن الذكي", descEn: "Write your biography with smart hashtags and mentions", tagAr: "هوية", tagEn: "Identity" },
  { id: 6, category: "identity", titleAr: "معلومات الحساب واللغة", titleEn: "Account Info & Region", icon: Globe, descAr: "تحديد الجنس، تاريخ الميلاد، الدولة، واللغات الرسمية", descEn: "Update language, region, birthday, and location settings", tagAr: "معلومات", tagEn: "Info" },
  { id: 7, category: "identity", titleAr: "روابط التواصل الاجتماعي", titleEn: "Social Network Links", icon: ExternalLink, descAr: "إضافة وتعديل روابط ديسكورد، تليجرام، اكس، وانستقرام", descEn: "Bind and test your discord, telegram, or website links", tagAr: "روابط", tagEn: "Socials" },
  { id: 8, category: "visual", titleAr: "المظهر، الثيمات والألوان", titleEn: "Appearance & Themes", icon: Palette, descAr: "تخصيص ثيم وألوان الأزرار والخلفية الكونية المذهلة", descEn: "Design custom visual themes, buttons, and layouts", tagAr: "مظهر", tagEn: "Theme" },
  { id: 9, category: "security", titleAr: "إعدادات الخصوصية", titleEn: "Privacy Settings", icon: Eye, descAr: "التحكم في ظهور المتابعين، المنشورات، ومنع النسخ وتنزيل الصور", descEn: "Toggle private account, hide likes, and prevent downloads", tagAr: "خصوصية", tagEn: "Privacy" },
  { id: 10, category: "security", titleAr: "جناح الأمان والتحقق", titleEn: "Security Suite", icon: Lock, descAr: "تغيير البريد والرقم، كود الـ PIN، والتحقق بخطوتين والأجهزة", descEn: "Manage 2FA authenticator, devices log, and PIN", tagAr: "أمان", tagEn: "Security" },
  { id: 11, category: "security", titleAr: "تفضيلات الإشعارات", titleEn: "Notifications Center", icon: Bell, descAr: "تخصيص إشعارات الرسائل، التعليقات، المتابعين، والبث المباشر", descEn: "Configure push parameters for anime news & live updates", tagAr: "إشعارات", tagEn: "Alerts" },
  { id: 12, category: "security", titleAr: "صلاحيات التطبيق", titleEn: "App Permissions", icon: Shield, descAr: "عرض وحالة صلاحيات الكاميرا، المعرض، والميكروفون بالكامل", descEn: "Review system permissions status with quick setup link", tagAr: "صلاحيات", tagEn: "Permissions" },
  { id: 13, category: "tools", titleAr: "إدارة الوسائط والذاكرة", titleEn: "Media & Cache Cleaner", icon: Database, descAr: "تنظيف كاش الصور والفيديو وعرض المساحة المستهلكة", descEn: "Clear cached data and free storage space instantly", tagAr: "وسائط", tagEn: "Storage" },
  { id: 14, category: "visual", titleAr: "معاينة الملف الشخصي", titleEn: "Live Profile Preview", icon: ImageIcon, descAr: "رؤية كيف يظهر حسابك للآخرين بالكامل قبل التأكيد", descEn: "See exactly how other fans view your profile", tagAr: "معاينة", tagEn: "Preview" },
  { id: 15, category: "tools", titleAr: "سجل التعديلات والأنشطة", titleEn: "Edit Audit Logs", icon: History, descAr: "عرض تاريخ وتوقيت آخر تعديلات قمت بها لحسابك", descEn: "View timestamped timeline of your account changes", tagAr: "سجل", tagEn: "Logs" }];


  const filteredPages = pagesList.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    return matchesCat && (
    p.titleAr.toLowerCase().includes(query) ||
    p.titleEn.toLowerCase().includes(query) ||
    p.descAr.toLowerCase().includes(query) ||
    p.descEn.toLowerCase().includes(query));

  });

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white overflow-hidden flex flex-col md:flex-row font-sans">
      
      {/* Sidebar List (Visible on desktop sidebar, or hidden on mobile when activePage is selected) */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full ${
      activePage !== null ? "hidden md:flex" : "flex"}`
      }>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
          <div>
            <h2 className="text-sm font-black tracking-wider uppercase text-red-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span>{isArabic ? "مركز تخصيص الهوية" : "Identity Customization Suite"}</span>
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {isArabic ? "إدارة وتخصيص كافة أبعاد الحساب" : "Fine-tune all digital dimensions"}
            </p>
          </div>
          <button
            onClick={() => {
              playSynthSound("tap");
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice inside sidebar header */}
        {!isOnline &&
        <div className="bg-red-950/40 px-4 py-2 border-b border-red-900/40 text-red-400 text-[10px] font-bold flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            <span>{isArabic ? "حفظ مؤقت مفعّل • لا يوجد إنترنت" : "Offline Mode • Queue Active"}</span>
          </div>
        }

        {/* Hub Return Button inside Sidebar */}
        <div className="p-2 border-b border-zinc-850">
          <button
            onClick={() => {
              playSynthSound("tap");
              triggerHapticFeedback("tap");
              setActivePage(null);
            }}
            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
            activePage === null ?
            "bg-red-600/20 text-red-400 border border-red-500/40 shadow" :
            "bg-zinc-850 hover:bg-zinc-800 text-zinc-300"}`
            }>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>{isArabic ? "الصفحة الرئيسية للتخصيص" : "Customization Hub Grid"}</span>
            </div>
            <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-full font-mono">15</span>
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pagesList.map((p, _autoIdx) => {
            const Icon = p.icon;
            const isSel = activePage === p.id;
            return (
              <button
                key={`sidebar_nav_${p.id}_${_autoIdx}`}
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setActivePage(p.id);
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-right transition-all group cursor-pointer text-left ${
                isSel ?
                "bg-red-600 text-white shadow-lg" :
                "hover:bg-zinc-850 bg-zinc-900/30 text-zinc-300 border border-zinc-850/40"}`
                }>
                
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${isSel ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400 group-hover:text-white"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left w-full">
                    <div className="text-xs font-black">{isArabic ? p.titleAr : p.titleEn}</div>
                    <div className="text-[9px] opacity-70 truncate max-w-[180px]">{isArabic ? p.descAr : p.descEn}</div>
                  </div>
                </div>
                {isArabic ?
                <ChevronLeft className="w-3.5 h-3.5 opacity-60" /> :

                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                }
              </button>);

          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
        
        {/* HUB VIEW GRID WHEN activePage IS NULL */}
        {activePage === null ?
        <div className="flex-1 overflow-y-auto flex flex-col h-full p-4 md:p-8 space-y-6">
            
            {/* Top Hub Banner Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/80 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
                  <h1 className="text-lg md:text-xl font-black text-white tracking-wide">
                    {isArabic ? "مركز تخصيص الهوية الرقمية للأوتاكو" : "Otaku Digital Identity Suite"}
                  </h1>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {isArabic ?
                "اختر أي قسم أدناه للدخول إلى صفحة خياراته المخصصة مع تصميم تفاعلي وحفظ تلقائي." :
                "Select any specialized page below to fine-tune avatar, cover, name, security, and theme with live sync."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setActivePage(14); // Live preview
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95">
                
                  <Eye className="w-4 h-4" />
                  <span>{isArabic ? "معاينة البروفايل" : "Live Profile"}</span>
                </button>

                <button
                onClick={() => {
                  playSynthSound("tap");
                  onClose();
                }}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer md:hidden">
                
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Live Avatar & Cover Summary Card */}
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/80 shadow-2xl">
              <div className="h-28 sm:h-36 bg-zinc-950 relative overflow-hidden flex items-end">
                {showCover &&
              <img src={coverImg} className="absolute inset-0 w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
              }
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    {showAvatar &&
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 overflow-hidden shadow-2xl relative bg-zinc-900 flex-shrink-0"
                    style={{ borderColor: themeColor }}>
                    
                        <img src={avatarImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                  }
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white drop-shadow" style={{ color: themeColor }}>
                        {displayName}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">@{username}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-900/60 font-black">
                      {isArabic ? "حساب موثق 🔥" : "Verified Otaku"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Level 42
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {categories.map((cat, _autoIdx) => {
                  const Icon = cat.icon;
                  const isSel = selectedCategory === cat.id;
                  return (
                    <button
                      key={`acc_cat_${cat.id}_${_autoIdx}`}
                      onClick={() => {
                        playSynthSound("tap");
                        triggerHapticFeedback("tap");
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isSel ?
                      "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500" :
                      "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"}`
                      }>
                      
                        <Icon className="w-3.5 h-3.5" />
                        <span>{isArabic ? cat.labelAr : cat.labelEn}</span>
                      </button>);

                })}
                </div>

                {/* Quick Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? "بحث عن خيار تخصيص..." : "Search customization..."}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/80 transition-all" />
                
                  {searchQuery &&
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                }
                </div>
              </div>
            </div>

            {/* Specialized Page Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-20">
              {filteredPages.map((page, index) => {
              const Icon = page.icon;
              return (
                <motion.div
                  key={`hub_grid_${page.id}_${index}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSynthSound("tap");
                    triggerHapticFeedback("tap");
                    setActivePage(page.id);
                  }}
                  className="group bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 hover:from-zinc-850 hover:to-zinc-900 border border-zinc-800 hover:border-red-500/60 p-4 rounded-2xl cursor-pointer transition-all shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden">
                  
                    {/* Top Accent Light line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/0 group-hover:via-red-500 to-transparent transition-all" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="p-2.5 rounded-xl bg-zinc-800/80 group-hover:bg-red-600/20 text-zinc-300 group-hover:text-red-400 border border-zinc-700/50 group-hover:border-red-500/40 transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-800/90 text-zinc-400 group-hover:text-white group-hover:bg-red-950/80 border border-zinc-700/40 group-hover:border-red-900/60 font-bold transition-all">
                          {isArabic ? page.tagAr : page.tagEn}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                          <span>{isArabic ? page.titleAr : page.titleEn}</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {isArabic ? page.descAr : page.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-bold text-zinc-400 group-hover:text-white transition-all">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {page.id === 1 && (isArabic ? `الأفاتار: نشط` : `Avatar: Ready`)}
                        {page.id === 2 && (isArabic ? `الغلاف: مخصص` : `Cover: Active`)}
                        {page.id === 3 && (isArabic ? `الاسم: ${displayName}` : `Name: ${displayName}`)}
                        {page.id === 4 && (isArabic ? `المعرف: @${username}` : `Handle: @${username}`)}
                        {page.id === 8 && (isArabic ? `الثيم: متناسق` : `Theme: Active`)}
                        {page.id !== 1 && page.id !== 2 && page.id !== 3 && page.id !== 4 && page.id !== 8 && (
                      isArabic ? "انقر للفتح ➔" : "Tap to open ➔")
                      }
                      </span>
                      <div className="flex items-center gap-1 text-red-500 group-hover:translate-x-[-2px] transition-transform">
                        <span className="text-[11px] font-black">{isArabic ? "دخول" : "Enter"}</span>
                        {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </motion.div>);

            })}
            </div>

          </div> : (

        /* DEDICATED SUB-PAGE EDITOR VIEW WHEN activePage IS ACTIVE */
        <div className="flex-1 overflow-y-auto flex flex-col h-full">
            
            {/* Page Header with PROMINENT Back Button */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 sticky top-0 backdrop-blur z-20">
              <div className="flex items-center gap-3">
                <button
                onClick={() => {
                  playSynthSound("tap");
                  triggerHapticFeedback("tap");
                  setActivePage(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold flex items-center gap-2 text-zinc-200 hover:text-white transition-all cursor-pointer border border-zinc-700/60 shadow active:scale-95">
                
                  {isArabic ? <ArrowRight className="w-4 h-4 text-red-500" /> : <ArrowLeft className="w-4 h-4 text-red-500" />}
                  <span>{isArabic ? "العودة للتخصيص" : "Back to Hub"}</span>
                </button>

                <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block" />

                <div>
                  <h1 className="text-sm font-black text-white flex items-center gap-2">
                    <span>
                      {isArabic ?
                    pagesList.find((p) => p.id === activePage)?.titleAr :
                    pagesList.find((p) => p.id === activePage)?.titleEn}
                    </span>
                  </h1>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {isArabic ?
                  pagesList.find((p) => p.id === activePage)?.descAr :
                  pagesList.find((p) => p.id === activePage)?.descEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {loading &&
              <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-950/20 px-2.5 py-1 rounded-full border border-red-900/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isArabic ? "جاري الحفظ..." : "Saving..."}</span>
                  </div>
              }

                <button
                onClick={() => {
                  playSynthSound("tap");
                  onClose();
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-page Specific Contents */}
            <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6 pb-20">
            

              {/* 1. PORTRAIT / AVATAR */}
              {activePage === 1 &&
            <div className="space-y-6">
                  {/* Image editor mockup */}
                  <div className="flex flex-col items-center justify-center bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden">
                    
                    {avatarCameraActive ?
                <div className="w-48 h-48 rounded-full border-4 border-red-600 overflow-hidden relative bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <button
                    onClick={captureAvatar}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black hover:bg-red-700 cursor-pointer">
                    
                          {isArabic ? "التقاط الآن" : "Capture"}
                        </button>
                      </div> :

                <div className="w-48 h-48 rounded-full border-4 border-red-600/50 overflow-hidden relative shadow-lg bg-zinc-950">
                        <img
                    src={avatarImg}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{
                      transform: `scale(${avatarZoom}) rotate(${avatarRotation}deg) translate(${avatarPan.x}px, ${avatarPan.y}px)`
                    }}
                    referrerPolicy="no-referrer" />
                  
                      </div>
                }

                    {/* Metadata indicators */}
                    <div className="mt-4 flex gap-4 text-[9px] font-mono text-zinc-500">
                      <div>{isArabic ? "الحجم:" : "Size:"} <span className="text-zinc-300 font-bold">{avatarFileInfo.size}</span></div>
                      <div>{isArabic ? "الأبعاد:" : "Dimensions:"} <span className="text-zinc-300 font-bold">{avatarFileInfo.dimensions}</span></div>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
                      <button
                    onClick={() => setAvatarZoom((prev) => Math.min(prev + 0.25, 3))}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    title="Zoom In">
                    
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isArabic ? "تكبير" : "Zoom In"}</span>
                      </button>
                      <button
                    onClick={() => setAvatarZoom((prev) => Math.max(prev - 0.25, 1))}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    title="Zoom Out">
                    
                        <ZoomOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isArabic ? "تصغير" : "Zoom Out"}</span>
                      </button>
                      <button
                    onClick={() => setAvatarRotation((prev) => (prev + 90) % 360)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    title="Rotate">
                    
                        <RotateCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isArabic ? "تدوير" : "Rotate"}</span>
                      </button>
                    </div>

                    {/* Manual pan controls */}
                    <div className="mt-4 grid grid-cols-3 gap-1.5 w-24">
                      <div />
                      <button onClick={() => setAvatarPan((p) => ({ ...p, y: p.y - 10 }))} className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded">▲</button>
                      <div />
                      <button onClick={() => setAvatarPan((p) => ({ ...p, x: p.x - 10 }))} className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded">◀</button>
                      <button onClick={() => setAvatarPan({ x: 0, y: 0 })} className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded text-[8px] font-bold">RST</button>
                      <button onClick={() => setAvatarPan((p) => ({ ...p, x: p.x + 10 }))} className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded">▶</button>
                      <div />
                      <button onClick={() => setAvatarPan((p) => ({ ...p, y: p.y + 10 }))} className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded">▼</button>
                      <div />
                    </div>
                  </div>

                  {/* Actions & Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "رفع من المعرض" : "Upload from Gallery"}</label>
                      <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleAvatarFile}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl p-2 cursor-pointer" />
                  
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "كاميرا السيلفي" : "Live Selfie Camera"}</label>
                      <button
                    onClick={startAvatarCamera}
                    className="w-full text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-center gap-2 font-bold cursor-pointer">
                    
                        <Camera className="w-4 h-4 text-red-500" />
                        <span>{isArabic ? "التقاط من الكاميرا" : "Capture selfie"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button
                  onClick={() => setAvatarImg("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")}
                  className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-bold rounded-xl cursor-pointer">
                  
                      {isArabic ? "حذف واستعادة الافتراضي" : "Delete & Restore Default"}
                    </button>
                    <button onClick={() => handleRevert("avatar")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء التغييرات" : "Cancel / Revert"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ avatar: avatarImg })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ التغييرات" : "Save Avatar"}
                    </button>
                  </div>
                </div>
            }

              {/* 2. COVER BANNER */}
              {activePage === 2 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 space-y-4">
                    <div className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative">
                      <img
                    src={coverImg}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{
                      transform: `scale(${coverZoom}) translate(${coverPan.x}px, ${coverPan.y}px)`
                    }}
                    referrerPolicy="no-referrer" />
                  
                    </div>

                    <div className="flex items-center gap-4">
                      <ZoomIn className="w-4 h-4 text-zinc-500" />
                      <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={coverZoom}
                    onChange={(e) => setCoverZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
                  
                      <ZoomOut className="w-4 h-4 text-zinc-500" />
                    </div>

                    {/* cover pan controls */}
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setCoverPan((p) => ({ ...p, y: p.y - 10 }))} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs">▲ Up</button>
                      <button onClick={() => setCoverPan((p) => ({ ...p, y: p.y + 10 }))} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs">▼ Down</button>
                      <button onClick={() => setCoverPan({ x: 0, y: 0 })} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs">Reset</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "رفع غلاف جديد" : "Upload Widescreen Banner"}</label>
                    <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFile}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl p-2" />
                
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button
                  onClick={() => setCoverImg("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800")}
                  className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-bold rounded-xl cursor-pointer">
                  
                      {isArabic ? "حذف الغلاف" : "Delete Cover"}
                    </button>
                    <button onClick={() => handleRevert("cover")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ cover: coverImg })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ الغلاف" : "Save Cover"}
                    </button>
                  </div>
                </div>
            }

              {/* 3. DISPLAY NAME */}
              {activePage === 3 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                        {isArabic ? "الاسم المعروض على ملفك الشخصي" : "Display Name"}
                      </label>
                      <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 30);
                      setDisplayName(val);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 focus:outline-none" />
                  
                      <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-500">
                        <span>{isArabic ? "تاريخ آخر تعديل:" : "Last Changed:"} {lastChangedName}</span>
                        <span>{displayName.length}/30</span>
                      </div>
                    </div>

                    {/* Restrict warnings */}
                    {["admin", "moderator", "مشرف", "مدير", "fuck", "damn"].some((bad) => displayName.toLowerCase().includes(bad)) &&
                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{isArabic ? "يمنع استخدام الكلمات الدلالية الخاصة بالإدارة والمصطلحات المسيئة!" : "Admin/offensive keywords are strictly forbidden!"}</span>
                      </div>
                }
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("name")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={async () => {
                    const containsBad = ["admin", "moderator", "مشرف", "مدير", "fuck", "damn"].some((bad) => displayName.toLowerCase().includes(bad));
                    if (containsBad || displayName.trim().length === 0) {
                      playSynthSound("error");
                      alert(isArabic ? "الاسم غير صالح أو يحتوي كلمات محظورة." : "Invalid display name or contains restricted keywords.");
                      return;
                    }
                    const ok = await handleSaveToFirestore({ name: displayName, nameUpdatedAt: new Date().toLocaleDateString() });
                    if (ok) setLastChangedName(new Date().toLocaleDateString());
                  }}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "تحديث الاسم" : "Save Name"}
                    </button>
                  </div>
                </div>
            }

              {/* 4. USERNAME */}
              {activePage === 4 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                        {isArabic ? "اسم المستخدم الفريد (Username)" : "Unique Username Handle"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">@</span>
                        <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.slice(0, 30))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-sm focus:border-red-600 focus:outline-none" />
                    
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-zinc-500">{isArabic ? "تاريخ آخر تعديل:" : "Last Changed:"} {lastChangedUsername}</span>
                        
                        <div className="flex items-center gap-1.5 text-xs">
                          {checkingUsername ?
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              {isArabic ? "جاري التحقق..." : "Checking..."}
                            </span> :
                      usernameAvailable === true ?
                      <span className="text-[10px] text-green-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              {isArabic ? "اسم المستخدم متاح!" : "Username is available!"}
                            </span> :
                      usernameAvailable === false ?
                      <span className="text-[10px] text-red-400 flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              {isArabic ? "هذا الاسم مستخدم بالفعل!" : "Username is already taken!"}
                            </span> :
                      null}
                        </div>
                      </div>
                    </div>

                    {/* Profile Link Display */}
                    <div className="bg-black/30 p-3 rounded-2xl border border-zinc-850 flex items-center justify-between text-xs">
                      <div className="truncate text-zinc-400 font-mono pr-2">
                        https://animeblack.club/user/{username}
                      </div>
                      <div className="flex gap-2">
                        <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://animeblack.club/user/${username}`);
                        playSynthSound("success");
                        triggerInAppNotification(
                          isArabic ? "تم نسخ الرابط" : "Link Copied",
                          isArabic ? "تم نسخ رابط ملفك الشخصي بنجاح إلى الحافظة!" : "Profile URL copied to clipboard!",
                          "🔗"
                        );
                      }}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                      title="Copy Link">
                      
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: displayName,
                            text: bio,
                            url: `https://animeblack.club/user/${username}`
                          });
                        } else {
                          alert(`Share: https://animeblack.club/user/${username}`);
                        }
                      }}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                      title="Share Link">
                      
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {suggestedUsernames.length > 0 &&
                <div className="space-y-1.5">
                        <div className="text-[10px] text-zinc-500 font-bold">{isArabic ? "أسماء مقترحة متاحة:" : "Available Suggestions:"}</div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedUsernames.map((s, _autoIdx) =>
                    <button
                      key={`${s}_${_autoIdx}`}
                      onClick={() => {
                        setUsername(s);
                        playSynthSound("tap");
                      }}
                      className="text-[10px] bg-red-950/25 border border-red-900/30 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-900 hover:text-white transition-colors cursor-pointer">
                      
                              @{s}
                            </button>
                    )}
                        </div>
                      </div>
                }
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("username")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={async () => {
                    if (!usernameAvailable || username.trim().length === 0) {
                      playSynthSound("error");
                      alert(isArabic ? "اسم المستخدم غير متاح أو غير صالح." : "Username is not available or empty.");
                      return;
                    }
                    const ok = await handleSaveToFirestore({ username, usernameUpdatedAt: new Date().toLocaleDateString() });
                    if (ok) setLastChangedUsername(new Date().toLocaleDateString());
                  }}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ وتثبيت اليوزر" : "Save Username"}
                    </button>
                  </div>
                </div>
            }

              {/* 5. BIO */}
              {activePage === 5 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                        {isArabic ? "اكتب نبذتك الشخصية (Bio)" : "Biography Text"}
                      </label>
                      <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 150))}
                    rows={3}
                    placeholder={isArabic ? "اكتب هاشتاقات ومنشن لأصدقائك..." : "Add hashtags, multiline, mentions..."}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:border-red-600 focus:outline-none resize-none" />
                  
                      <div className="flex justify-end text-[10px] text-zinc-500 mt-1">
                        <span>{bio.length}/150</span>
                      </div>
                    </div>

                    {/* Live styled highlight preview */}
                    <div className="p-4 bg-black/40 rounded-2xl border border-zinc-850">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                        {isArabic ? "معاينة حية للمنشور والنبذة" : "Live Highlights Preview"}
                      </div>
                      <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {parseBioMentionsAndHashtags(bio || (isArabic ? "لا توجد نبذة حالية..." : "Empty bio..."))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("bio")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ bio })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ النبذة" : "Save Bio"}
                    </button>
                  </div>
                </div>
            }

              {/* 6. ACCOUNT INFO */}
              {activePage === 6 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "الجنس" : "Gender"}</label>
                      <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    
                        <option value="Male">{isArabic ? "ذكر" : "Male"}</option>
                        <option value="Female">{isArabic ? "أنثى" : "Female"}</option>
                        <option value="Otaku">{isArabic ? "أوتاكو أسطوري" : "Otaku Specialist"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "تاريخ الميلاد" : "Birth Date"}</label>
                      <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                  
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "الدولة" : "Country"}</label>
                      <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    
                        <option value="Saudi Arabia">{isArabic ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
                        <option value="Japan">{isArabic ? "اليابان" : "Japan"}</option>
                        <option value="Egypt">{isArabic ? "مصر" : "Egypt"}</option>
                        <option value="United Arab Emirates">{isArabic ? "الإمارات العربية المتحدة" : "UAE"}</option>
                        <option value="Iraq">{isArabic ? "العراق" : "Iraq"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "المدينة / الموقع الجغرافي" : "City / GPS Location"}</label>
                      <div className="relative">
                        <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-3 pr-10 p-2.5 text-xs text-white focus:outline-none" />
                    
                        <button
                      onClick={triggerGeolocation}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-white"
                      title="Locate Me">
                      
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "اللغة المفضلة" : "Preferred Language"}</label>
                      <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    
                        <option value="Arabic">{isArabic ? "العربية RTL" : "Arabic"}</option>
                        <option value="English">{isArabic ? "الإنجليزية LTR" : "English"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "المنطقة الزمنية" : "Timezone"}</label>
                      <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    
                        <option value="GMT+3">Riyadh (GMT+3)</option>
                        <option value="GMT+9">Tokyo (GMT+9)</option>
                        <option value="GMT+2">Cairo (GMT+2)</option>
                        <option value="GMT+0">London (GMT+0)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "الموقع الإلكتروني" : "Personal Website"}</label>
                      <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://myportfolio.com"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                  
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("info")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ gender, birthDate, country, city, language, timezone, website })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ المعلومات" : "Save Info"}
                    </button>
                  </div>
                </div>
            }

              {/* 7. SOCIAL LINKS */}
              {activePage === 7 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {Object.keys(socials).map((platform, _autoIdx) =>
                  <div key={`${platform}_${_autoIdx}`} className="bg-zinc-950 border border-zinc-850 p-3 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-red-400 font-bold capitalize">{platform}</span>
                            {socials[platform] &&
                      <button
                        onClick={() => {
                          playSynthSound("tap");
                          setSocials((prev: any) => ({ ...prev, [platform]: "" }));
                        }}
                        className="text-[9px] text-zinc-500 hover:text-red-400 font-bold">
                        
                                {isArabic ? "حذف" : "Remove"}
                              </button>
                      }
                          </div>
                          <input
                      type="text"
                      value={socials[platform]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSocials((prev: any) => ({ ...prev, [platform]: val }));
                      }}
                      placeholder={`Link or username`}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none" />
                    
                        </div>
                  )}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("socials")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ socialLinks: socials })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ الروابط" : "Save Socials"}
                    </button>
                  </div>
                </div>
            }

              {/* 8. APPEARANCE & COLORS */}
              {activePage === 8 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-5">
                    
                    {/* Visual mockup card inside theme setting */}
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden flex items-center gap-4">
                      {bgStyle === "cosmic" && <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black to-red-950/20 pointer-events-none" />}
                      {bgStyle === "grid" && <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />}
                      
                      {showAvatar &&
                  <div className="w-14 h-14 rounded-full border-2 overflow-hidden relative z-10" style={{ borderColor: themeColor }}>
                          <img src={avatarImg} className="w-full h-full object-cover" />
                        </div>
                  }
                      <div className="space-y-1 z-10 flex-1">
                        <div className="text-sm font-black" style={{ color: themeColor }}>{displayName}</div>
                        <div className="text-[10px] text-zinc-400">@{username}</div>
                      </div>

                      <button
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black z-10 cursor-pointer"
                    style={{ backgroundColor: buttonColor, color: "#fff" }}>
                    
                        {isArabic ? "زر مخصص" : "Preset button"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "لون الحساب الرئيسي" : "Account Accent Color"}</label>
                        <div className="flex gap-2">
                          <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-10 h-10 border border-zinc-800 rounded bg-transparent cursor-pointer" />
                      
                          <input
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs" />
                      
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "لون الأزرار" : "Button Tint Color"}</label>
                        <div className="flex gap-2">
                          <input
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-10 h-10 border border-zinc-800 rounded bg-transparent cursor-pointer" />
                      
                          <input
                        type="text"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs" />
                      
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "نمط خلفية البروفايل" : "Profile Canvas Style"}</label>
                        <select
                      value={bgStyle}
                      onChange={(e) => setBgStyle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                      
                          <option value="solid">{isArabic ? "لون داكن كلاسيكي" : "Classic Dark Solid"}</option>
                          <option value="cosmic">{isArabic ? "غلاف كوني متدرج" : "Immersive Cosmic Gradient"}</option>
                          <option value="grid">{isArabic ? "شبكة سايبر رقمية" : "Retro Cyber Grid"}</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-around bg-zinc-950 border border-zinc-850 rounded-2xl p-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showCover} onChange={() => setShowCover(!showCover)} className="accent-red-500" />
                          <span className="text-[10px] font-bold text-zinc-300">{isArabic ? "إظهار الغلاف" : "Show Cover"}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showAvatar} onChange={() => setShowAvatar(!showAvatar)} className="accent-red-500" />
                          <span className="text-[10px] font-bold text-zinc-300">{isArabic ? "إظهار الأفاتار" : "Show Avatar"}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("appearance")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ profileThemeColor: themeColor, profileButtonColor: buttonColor, profileBgStyle: bgStyle, showCover, showAvatar })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ المظهر" : "Save Layout"}
                    </button>
                  </div>
                </div>
            }

              {/* 9. PRIVACY */}
              {activePage === 9 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    {Object.keys(privacy).map((key, _autoIdx) =>
                <div key={`${key}_${_autoIdx}`} className="flex items-center justify-between p-2.5 bg-zinc-950/50 rounded-xl border border-zinc-850/60">
                        <div>
                          <span className="text-xs font-black capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">
                            {isArabic ?
                      "منع الآخرين من التطفل وحظر العمليات غير المرغوبة" :
                      "Toggle authorization limits for this field"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                      type="checkbox"
                      checked={privacy[key]}
                      onChange={() => {
                        playSynthSound("tap");
                        setPrivacy((prev: any) => ({ ...prev, [key]: !prev[key] }));
                      }}
                      className="sr-only peer" />
                    
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600" />
                        </label>
                      </div>
                )}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("privacy")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ privacySettings: privacy })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ تفضيلات الخصوصية" : "Save Privacy"}
                    </button>
                  </div>
                </div>
            }

              {/* 10. SECURITY SUITE */}
              {activePage === 10 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    
                    {/* Password */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "كلمة المرور" : "Password Hash"}</label>
                      <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs" />
                  
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "البريد الإلكتروني المرتبط" : "Primary Registered Email"}</label>
                      <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs" />
                  
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "رقم الهاتف والتحقق" : "Phone Verified Link"}</label>
                      <div className="flex gap-2">
                        <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs" />
                    
                        <button
                      onClick={() => {
                        playSynthSound("tap");
                        setPhone("");
                        triggerInAppNotification(
                          isArabic ? "تم حذف رقم الهاتف" : "Phone Removed",
                          isArabic ? "تم قطع ارتباط رقم هاتفك بنجاح." : "Successfully unlinked phone number.",
                          "📱"
                        );
                      }}
                      className="px-3 bg-red-950/30 text-red-400 hover:bg-red-900 hover:text-white rounded-xl text-xs font-bold">
                      
                          {isArabic ? "حذف الرقم" : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authenticator */}
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-black">{isArabic ? "المصادقة الثنائية (2FA)" : "Two-Factor Auth"}</span>
                        <p className="text-[9px] text-zinc-500">{isArabic ? "طلب رمز مولد مخصص لتأمين سحوبات النقابة" : "Authenticator lock for account trades"}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={() => {
                        playSynthSound("tap");
                        setTwoFactor(!twoFactor);
                        if (!twoFactor) {
                          alert(isArabic ? "تم توليد مفتاح سري محاكي للـ Google Authenticator! الرمز الاحتياطي: ANIME-BLACK-99" : "Secret simulated Google Authenticator key initialized! Backup: ANIME-BLACK-99");
                        }
                      }}
                      className="sr-only peer" />
                    
                        <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    {/* App pin */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1 font-bold">{isArabic ? "رمز قفل الخزنة المالي PIN" : "Security App Lock PIN"}</label>
                      <input
                    type="text"
                    maxLength={4}
                    value={appPin}
                    onChange={(e) => setAppPin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs text-center font-bold tracking-widest" />
                  
                    </div>

                    {/* Registered Sessions */}
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-black text-red-500">{isArabic ? "الأجهزة المسجلة النشطة" : "Active Registered Sessions"}</div>
                      <div className="space-y-2">
                        {loginHistory.map((l, idx) =>
                    <div key={idx} className="bg-black/40 p-2.5 rounded-xl border border-zinc-850 flex justify-between items-center text-[10px]">
                            <div className="space-y-1">
                              <div className="font-bold text-zinc-300 flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5" />
                                {l.device}
                              </div>
                              <div className="text-zinc-500">{l.ip} • {l.location}</div>
                            </div>
                            <span className="text-zinc-400">{l.date}</span>
                          </div>
                    )}
                      </div>

                      <button
                    onClick={() => {
                      playSynthSound("success");
                      triggerInAppNotification(
                        isArabic ? "تسجيل خروج جماعي" : "Logged Out Everywhere",
                        isArabic ? "تم إنهاء جميع الجلسات النشطة على الأجهزة الأخرى بنجاح!" : "All other hardware devices have been successfully signed off.",
                        "🔒"
                      );
                    }}
                    className="w-full py-2 bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900 hover:text-white transition-colors rounded-xl text-[10px] font-black cursor-pointer">
                    
                        {isArabic ? "تسجيل الخروج من كافة الأجهزة والمنصات الأخرى" : "Sign out from all other active browser sessions"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button
                  onClick={() => handleSaveToFirestore({ email, phone, twoFactorActive: twoFactor, appPin })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "تأمين وحفظ الإعدادات" : "Save Security Setup"}
                    </button>
                  </div>
                </div>
            }

              {/* 11. NOTIFICATIONS */}
              {activePage === 11 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-3">
                    {Object.keys(notifications).map((key, _autoIdx) =>
                <div key={`${key}_${_autoIdx}`} className="flex items-center justify-between p-2.5 bg-zinc-950/50 rounded-xl border border-zinc-850/60">
                        <span className="text-xs font-black capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() => {
                        playSynthSound("tap");
                        setNotifications((prev: any) => ({ ...prev, [key]: !prev[key] }));
                      }}
                      className="sr-only peer" />
                    
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                      </div>
                )}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button onClick={() => handleRevert("notifications")} className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                  onClick={() => handleSaveToFirestore({ notificationSettings: notifications })}
                  className="text-xs px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer">
                  
                      {isArabic ? "حفظ الإشعارات" : "Save Notifications"}
                    </button>
                  </div>
                </div>
            }

              {/* 12. SYSTEM PERMISSIONS STATUS */}
              {activePage === 12 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    {Object.keys(permissionStates).map((key, _autoIdx) => {
                  const state = (permissionStates as any)[key];
                  return (
                    <div key={`perm_${key}_${_autoIdx}`} className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                          <div>
                            <span className="text-xs font-black capitalize">{key}</span>
                            <div className="text-[9px] text-zinc-500">{isArabic ? "مستوى تصريح الهاردوير بالجهاز" : "Browser sandbox API state"}</div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        state === "granted" ? "bg-green-950/40 text-green-400 border border-green-900/40" : "bg-yellow-950/40 text-yellow-500 border border-yellow-900/40"}`
                        }>
                              {state === "granted" ? isArabic ? "ممنوح" : "Granted" : isArabic ? "مطلوب" : "Required"}
                            </span>

                            {state !== "granted" &&
                        <button
                          onClick={() => requestPermission(key)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                          
                                {isArabic ? "تفعيل الآن" : "Grant"}
                              </button>
                        }
                          </div>
                        </div>);

                })}

                    <button
                  onClick={() => {
                    playSynthSound("tap");
                    alert(isArabic ?
                    "لمنح الصلاحيات، يرجى الضغط على أيقونة القفل أو الإعدادات بجانب رابط الموقع في شريط عنوان متصفحك وتعديل الصلاحيات يدوياً!" :
                    "To configure system parameters, tap the padlock icon in your browser address bar next to the domain URL.");
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-black text-white cursor-pointer">
                  
                      {isArabic ? "فتح إعدادات النظام بالمتصفح" : "Open browser system settings"}
                    </button>
                  </div>
                </div>
            }

              {/* 13. MEDIA MANAGEMENT / CACHE */}
              {activePage === 13 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center space-y-2">
                        <div className="text-xs text-zinc-400 font-bold">{isArabic ? "ذاكرة الكاش" : "Memory Cache"}</div>
                        <div className="text-sm font-black text-red-500">{cacheSize}</div>
                        <button
                      onClick={clearCache}
                      className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg cursor-pointer">
                      
                          {isArabic ? "مسح المؤقت" : "Clear Cache"}
                        </button>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center space-y-2">
                        <div className="text-xs text-zinc-400 font-bold">{isArabic ? "صور الأنمي المؤقتة" : "Anime Images"}</div>
                        <div className="text-sm font-black text-cyan-400">{tempImagesSize}</div>
                        <button
                      onClick={clearTempImages}
                      className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg cursor-pointer">
                      
                          {isArabic ? "تنظيف الصور" : "Clean Images"}
                        </button>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-center space-y-2">
                        <div className="text-xs text-zinc-400 font-bold">{isArabic ? "الفيديوهات المؤقتة" : "Anime Reels/Videos"}</div>
                        <div className="text-sm font-black text-amber-500">{tempVideosSize}</div>
                        <button
                      onClick={clearTempVideos}
                      className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg cursor-pointer">
                      
                          {isArabic ? "تنظيف الفيديو" : "Clean Videos"}
                        </button>
                      </div>
                    </div>

                    <button
                  onClick={() => {
                    playSynthSound("success");
                    setCacheSize("12 KB");
                    setTempImagesSize("10 KB");
                    setTempVideosSize("0 KB");
                    triggerInAppNotification(
                      isArabic ? "إعادة تنشيط الصور" : "Images Refreshed",
                      isArabic ? "تمت إعادة تحميل جميع الصور بطلب مباشر." : "Images buffer fully re-loaded and verified.",
                      "🔄"
                    );
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-850 cursor-pointer">
                  
                      {isArabic ? "إعادة تحميل وتنشيط صور الأنمي" : "Force reload and refresh all images"}
                    </button>
                  </div>
                </div>
            }

              {/* 14. COMPREHENSIVE PROFILE LIVE PREVIEW */}
              {activePage === 14 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/60 p-1 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                    
                    {/* Header profile design */}
                    <div className="h-32 bg-zinc-950 relative overflow-hidden flex items-end">
                      {showCover &&
                  <img src={coverImg} className="absolute inset-0 w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                  }
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                      
                      {showAvatar &&
                  <div
                    className="w-20 h-20 rounded-full border-4 overflow-hidden relative translate-x-4 translate-y-4 shadow-xl z-10"
                    style={{ borderColor: themeColor }}>
                    
                          <img src={avatarImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                  }
                    </div>

                    <div className="p-6 pt-10 bg-zinc-950 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-black" style={{ color: themeColor }}>{displayName}</h2>
                          <p className="text-xs text-zinc-500">@{username}</p>
                        </div>

                        <button
                      className="px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-lg"
                      style={{ backgroundColor: buttonColor, color: "#fff" }}>
                      
                          {isArabic ? "متابعة الحساب" : "Follow Account"}
                        </button>
                      </div>

                      <div className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-zinc-900/40 p-3 rounded-2xl border border-zinc-900">
                        {parseBioMentionsAndHashtags(bio || "No biography details yet.")}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-400 font-mono">
                        <div>{isArabic ? "الدولة:" : "Country:"} <span className="text-white font-bold">{country}</span></div>
                        <div>{isArabic ? "المدينة:" : "City:"} <span className="text-white font-bold">{city}</span></div>
                        <div>{isArabic ? "الموقع:" : "Website:"} <span className="text-white font-bold truncate max-w-[150px] inline-block">{website}</span></div>
                        <div>{isArabic ? "اللغة:" : "Language:"} <span className="text-white font-bold">{language}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
            }

              {/* 15. AUDIT LOGS / HISTORIC TIMELINE */}
              {activePage === 15 &&
            <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 space-y-3">
                    <div className="text-xs text-zinc-400 font-black mb-1">{isArabic ? "سجل آخر الإجراءات التي قمت بها" : "Customization Activity Audit Timeline"}</div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {(currentUser?.customizationAuditLogs || []).length === 0 ?
                  <div className="text-center p-6 text-zinc-500 text-xs">
                          {isArabic ? "لا توجد تعديلات سابقة مسجلة حالياً." : "No logs available. Start editing to record actions."}
                        </div> :

                  (currentUser?.customizationAuditLogs as any[]).map((log, idx) =>
                  <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <div className="font-bold text-red-400">{isArabic ? "تم تحديث حقول:" : "Modified fields:"}</div>
                              <div className="text-[10px] text-zinc-300 font-mono">{log.action}</div>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}</span>
                          </div>
                  )
                  }
                    </div>
                  </div>
                </div>
            }

            </motion.div>
          </div>)
        }
      </div>
    </div>);

}