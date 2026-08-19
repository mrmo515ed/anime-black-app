import React, { useState, useEffect } from "react";
import {
  Coins,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Heart,
  Package,
  Layers,
  Palette,
  Sliders,
  Play,
  Send,
  User,
  Search,
  Shield,
  HelpCircle,
  Clock,
  RotateCw,
  Gift,
  Plus,
  ArrowRightLeft,
  X,
  Check,
  Percent,
  Star,
  Flame,
  Crown,
  Lock,
  Volume2,
  Calendar,
  AlertTriangle,
  FileText,
  BarChart2,
  Info,
  MoreVertical,
  CheckCircle,
  UserCheck } from
"lucide-react";

// Types matching the digital economy guidelines (13.9)
export type ItemRarity =
"Common" |
"Uncommon" |
"Rare" |
"Epic" |
"Legendary" |
"Mythic" |
"Limited" |
"Event Exclusive" |
"Developer Exclusive";

export interface DigitalItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  category:
  "frame" |
  "theme" |
  "card" |
  "effect" |
  "chest" |
  "medal" |
  "bg" |
  "sound" |
  "widget" |
  "pack";
  rarity: ItemRarity;
  image: string; // custom visual or emoji
  price?: number;
  currency?: "coins" | "stars";
  acquiredAt?: string;
  sourceAr?: string;
  sourceEn?: string;
  equipped?: boolean;
  sellable?: boolean;
  giftable?: boolean;
  exchangeable?: boolean;
  assetId?: string; // Digital Asset ID (13.20 / Extra)
  priceHistory?: {date: string;value: number;}[];
}

// Subscriptions Config (13.15)
export interface SubPlan {
  id: "free" | "plus" | "premium" | "ultimate";
  nameAr: string;
  nameEn: string;
  priceAr: string;
  priceEn: string;
  featuresAr: string[];
  featuresEn: string[];
  color: string;
  badge: string;
}

const SUBSCRIPTION_PLANS: SubPlan[] = [
{
  id: "free",
  nameAr: "أنمي بلاك المجاني",
  nameEn: "Anime Black Free",
  priceAr: "مجاناً",
  priceEn: "Free",
  featuresAr: ["مساحة تخزين محدودة للمخزن", "الوصول الأساسي للمنتدى", "بث بجودة عادية"],
  featuresEn: ["Limited Inventory storage", "Basic forum access", "Standard streaming quality"],
  color: "from-zinc-800 to-zinc-900 border-zinc-700",
  badge: "Free"
},
{
  id: "plus",
  nameAr: "أنمي بلاك بلس",
  nameEn: "Anime Black Plus",
  priceAr: "19 ريال / شهر",
  priceEn: "$4.99 / mo",
  featuresAr: [
  "إطارات حصرية نادرة",
  "زيادة مساحة المخزن (+50 عنصر)",
  "شارة بلس البرونزية الراقية",
  "رسوم أقل بنسبة 50% في سوق اللاعبين"],

  featuresEn: [
  "Exclusive Rare Frames",
  "Increased Inventory (+50 slots)",
  "Elegant Bronze Plus Badge",
  "50% lower market transaction fees"],

  color: "from-amber-900/60 to-orange-950 border-amber-500/30",
  badge: "Plus"
},
{
  id: "premium",
  nameAr: "أنمي بلاك المتميز",
  nameEn: "Anime Black Premium",
  priceAr: "39 ريال / شهر",
  priceEn: "$9.99 / mo",
  featuresAr: [
  "تحميل ثيمات مخصصة مجانية",
  "صندوق عشوائي ملحمي شهرياً",
  "زيادة مساحة المخزن (+200 عنصر)",
  "شارة بريميوم الفضية المتوهجة",
  "القدرة على بيع الثيمات المصممة ذاتياً"],

  featuresEn: [
  "Free Custom Theme Downloads",
  "Monthly Gacha Epic Chest",
  "Increased Inventory (+200 slots)",
  "Glow Silver Premium Badge",
  "Ability to sell self-created themes"],

  color: "from-indigo-950/80 to-purple-950/80 border-indigo-500/40",
  badge: "Premium"
},
{
  id: "ultimate",
  nameAr: "الاشتراك النهائي المطلق",
  nameEn: "Anime Black Ultimate",
  priceAr: "79 ريال / شهر",
  priceEn: "$19.99 / mo",
  featuresAr: [
  "إطارات أسطورية حية ثلاثية الأبعاد",
  "الوصول الكامل لمحرر الثيمات المتقدم والمبيعات",
  "إلغاء رسوم السوق تماماً (0% عمولة)",
  "شارة التاج الملكي الأسطوري بجانب اسمك",
  "صندوق خرافي أسبوعي وعملات هدايا مجانية"],

  featuresEn: [
  "Ultimate Live 3D Frames",
  "Full Theme Creator publishing rights",
  "No marketplace transaction fees (0% fee)",
  "Royal Crown Legendary Badge by name",
  "Weekly Gacha Mythic Chest & bonus gifts"],

  color: "from-rose-950 to-red-950 border-red-500/50 shadow-red-500/10",
  badge: "Ultimate"
}];


// Theme Creator state and interfaces (13.13)
export interface CustomTheme {
  name: string;
  primaryColor: string;
  bgColor: string;
  cardShape: "rounded-sm" | "rounded-xl" | "rounded-3xl" | "rounded-none";
  fontFamily: "Inter" | "Space Grotesk" | "Outfit" | "JetBrains Mono" | "Playfair Display";
  bubbleStyle: "classic" | "cyber" | "rounded" | "cloud";
  navStyle: "minimal" | "dock" | "glass" | "bordered";
  soundPack: string;
  transitionSpeed: "normal" | "fast" | "slow";
  price: number;
}

interface EconomySystemProps {
  isArabic: boolean;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  blackCoins: number;
  setBlackCoins: React.Dispatch<React.SetStateAction<number>>;
  stars: number;
  setStars: React.Dispatch<React.SetStateAction<number>>;
  playSynthSound?: (type: any) => void;
  triggerHapticFeedback?: (type: any) => void;
  triggerInAppNotification?: (title: string, body: string, type?: "success" | "info" | "warning" | "error") => void;
  triggerCelebration?: (type: string, titleAr: string, titleEn: string, descAr: string, descEn: string, reward?: string) => void;
  onClose: () => void;
  activeFrame?: string | null;
  setActiveFrame?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function EconomySystem({
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
  activeFrame,
  setActiveFrame
}: EconomySystemProps) {
  // Navigation tabs matching Chapter 13 sections
  const [activeTab, setActiveTab] = useState<"store" | "marketplace" | "inventory" | "theme" | "subs" | "stats">("store");

  // Official Black Store categories
  const [storeCategory, setStoreCategory] = useState<"all" | "frame" | "card" | "chest" | "effect" | "other">("all");

  // User's Inventory list
  const [inventory, setInventory] = useState<DigitalItem[]>([
  {
    id: "inv_1",
    nameAr: "إطار هالة التنين الملتهب",
    nameEn: "Blazing Dragon Aura Frame",
    descAr: "إطار متحرك محاط بنيران زرقاء أسطورية تلتف حول صورتك.",
    descEn: "An animated frame featuring mythical blue flames wrapping around your profile.",
    category: "frame",
    rarity: "Legendary",
    image: "🔥",
    acquiredAt: "2026-07-01",
    sourceAr: "صندوق أسطوري يومي",
    sourceEn: "Daily Legendary Chest",
    equipped: true,
    sellable: true,
    giftable: true,
    exchangeable: true,
    assetId: "AB-FR-882910"
  },
  {
    id: "inv_2",
    nameAr: "بطاقة زورو: مهارة السيوف الثلاثة",
    nameEn: "Zoro: Three-Sword Style Card",
    descAr: "بطاقة إصدار محدود للفرقة الأولى، رقم الإصدار #40.",
    descEn: "First division limited edition collectible card, serial #40.",
    category: "card",
    rarity: "Epic",
    image: "⚔️",
    acquiredAt: "2026-07-03",
    sourceAr: "تحدي نقابة القبعة القشية",
    sourceEn: "Strawhat Guild Challenge",
    equipped: false,
    sellable: true,
    giftable: true,
    exchangeable: true,
    assetId: "AB-CD-110482"
  },
  {
    id: "inv_3",
    nameAr: "شارة النجم الذهبي",
    nameEn: "Golden Star Medal",
    descAr: "شارة تجميلية تظهر بجوار اسمك تعبيراً عن التفوق.",
    descEn: "A cosmetic medal shining next to your name indicating absolute prestige.",
    category: "medal",
    rarity: "Rare",
    image: "🏅",
    acquiredAt: "2026-06-28",
    sourceAr: "شراء من المتجر الرسمي",
    sourceEn: "Official Store Purchase",
    equipped: false,
    sellable: false,
    giftable: true,
    exchangeable: false,
    assetId: "AB-MD-40291"
  }]
  );

  // Wishlist state (13.20/Extra)
  const [wishlist, setWishlist] = useState<string[]>(["store_frame_shadow", "store_card_luffy_gear5"]);

  // Escrow / marketplace listings (13.3, 13.4, 13.5)
  const [marketplaceListings, setMarketplaceListings] = useState([
  {
    id: "list_1",
    seller: { name: "Luffy_99", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    item: {
      id: "m_item_1",
      nameAr: "بطاقة لوفي المحرك الخامس (المستيقظ)",
      nameEn: "Luffy Gear 5 (Awakened) Card",
      descAr: "أندر بطاقات الموسم الثالث، قابلة لجمع السلسلة بالكامل.",
      descEn: "Third season rarest card, highly sought after for completeness.",
      category: "card" as const,
      rarity: "Mythic" as ItemRarity,
      image: "⚡",
      assetId: "AB-CD-990011"
    },
    type: "auction", // "direct" | "auction" | "swap"
    price: 1500,
    bidExpiry: Date.now() + 1800000, // 30 mins
    highestBid: 1100,
    highestBidder: "Zoro_Solo",
    originalPrice: 1800,
    digitalId: "AB-TX-00921"
  },
  {
    id: "list_2",
    seller: { name: "Nami_Gold", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    item: {
      id: "m_item_2",
      nameAr: "خلفية غابة الساكورا ثلاثية الأبعاد",
      nameEn: "3D Sakura Forest Background",
      descAr: "خلفية ملف شخصي متحركة مذهلة مع تساقط البتلات.",
      descEn: "Stunning animated profile background with falling blossoms.",
      category: "bg" as const,
      rarity: "Legendary" as ItemRarity,
      image: "🌸",
      assetId: "AB-BG-554401"
    },
    type: "direct",
    price: 850,
    digitalId: "AB-TX-10492"
  },
  {
    id: "list_3",
    seller: { name: "Sanji_Cook", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    item: {
      id: "m_item_3",
      nameAr: "صندوق ليلة رأس السنة الحصري",
      nameEn: "New Year Exclusive Chest",
      descAr: "يحتوي على عناصر نادرة للغاية بنسبة حظ 100%.",
      descEn: "Contains guaranteed rare elements, 100% chance.",
      category: "chest" as const,
      rarity: "Limited" as ItemRarity,
      image: "🎁",
      assetId: "AB-CH-829103"
    },
    type: "swap",
    swapForNameAr: "بطاقة رورونوا زورو أو إطار ذهبي",
    swapForNameEn: "Roronoa Zoro Card or Gold Frame",
    digitalId: "AB-TX-44011"
  }]
  );

  // Price history chart data for a rare item (13.20/Extra)
  const priceHistoryData = [
  { date: "06/20", value: 450 },
  { date: "06/23", value: 600 },
  { date: "06/26", value: 550 },
  { date: "06/29", value: 800 },
  { date: "07/02", value: 1200 },
  { date: "07/05", value: 1500 }];


  // Official Black Store items list (13.2)
  const officialStoreItems: DigitalItem[] = [
  {
    id: "store_frame_shadow",
    nameAr: "إطار ظلال النينجا المتوهج",
    nameEn: "Ninja Shadows Glow Frame",
    descAr: "إطار داكن كالحبر يتخلله بريق نيون بنفسجي جذاب.",
    descEn: "A dark ink frame interlaced with stunning violet neon sparkles.",
    category: "frame",
    rarity: "Epic",
    image: "🌌",
    price: 250,
    currency: "coins",
    sellable: true,
    giftable: true,
    exchangeable: true
  },
  {
    id: "store_frame_cyber",
    nameAr: "إطار السايبربانك ثلاثي الأبعاد",
    nameEn: "3D Cyberpunk Tech Frame",
    descAr: "إطار تفاعلي مع لوحة دوائر كهربائية مضيئة مذهلة.",
    descEn: "Interactive 3D frame decorated with shining technological circuits.",
    category: "frame",
    rarity: "Legendary",
    image: "⚡",
    price: 25,
    currency: "stars",
    sellable: true,
    giftable: true,
    exchangeable: true
  },
  {
    id: "store_card_luffy_gear5",
    nameAr: "بطاقة مونكي دي لوفي (القصوى)",
    nameEn: "Monkey D. Luffy Ultimate Card",
    descAr: "البطاقة التذكارية المستيقظة لزعيم قراصنة القبعة القشية.",
    descEn: "Memorial awakened card for the king of Strawhat pirates.",
    category: "card",
    rarity: "Mythic",
    image: "👑",
    price: 800,
    currency: "coins",
    sellable: true,
    giftable: true,
    exchangeable: true
  },
  {
    id: "store_chest_legend",
    nameAr: "صندوق الأساطير الذهبي",
    nameEn: "Golden Legends Lootbox",
    descAr: "افتح للحصول على إطارات أسطورية أو بطاقات نادرة عشوائية.",
    descEn: "Unbox for a chance of legendary aura frames or rare cards.",
    category: "chest",
    rarity: "Legendary",
    image: "📦",
    price: 150,
    currency: "coins",
    sellable: true,
    giftable: true,
    exchangeable: true
  },
  {
    id: "store_effect_blossom",
    nameAr: "تأثير هطول أزهار الساكورا",
    nameEn: "Falling Sakura Profile Particle",
    descAr: "تأثير جزيئي يتساقط بنعومة في خلفية صفحتك الشخصية.",
    descEn: "Soft sakura petals drift across your visual page background.",
    category: "effect",
    rarity: "Rare",
    image: "🌸",
    price: 120,
    currency: "coins",
    sellable: false,
    giftable: true,
    exchangeable: true
  },
  {
    id: "store_sound_sword",
    nameAr: "صوت سحب السيف الأسطوري",
    nameEn: "Sword Draw Interface Sound",
    descAr: "صوت ملحمي عند الضغط على أزرار واجهة المستخدم والملاحة.",
    descEn: "A swift steel sound trigger whenever navigating the application.",
    category: "sound",
    rarity: "Uncommon",
    image: "🔊",
    price: 50,
    currency: "coins",
    sellable: false,
    giftable: true,
    exchangeable: false
  }];


  // Theme Creator state (13.13)
  const [themeForm, setThemeForm] = useState<CustomTheme>({
    name: "مظهري الفاخر",
    primaryColor: "#FF3D00",
    bgColor: "#0A0A0C",
    cardShape: "rounded-xl",
    fontFamily: "Space Grotesk",
    bubbleStyle: "cyber",
    navStyle: "glass",
    soundPack: "samurai_steel",
    transitionSpeed: "normal",
    price: 100
  });

  // Gacha Chest Simulator states (13.18)
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestOpenedReward, setChestOpenedReward] = useState<DigitalItem | null>(null);
  const [selectedChestToOpen, setSelectedChestToOpen] = useState<DigitalItem | null>(null);

  // Financial Logs (13.19)
  const [transactionLogs, setTransactionLogs] = useState([
  { id: "tx_1", actionAr: "شراء إطار هالة التنين", actionEn: "Bought Dragon Aura Frame", cost: "-250 Coins", date: "2026-07-04" },
  { id: "tx_2", actionAr: "بيع بطاقة سانجي مكررة في السوق", actionEn: "Sold duplicate Sanji Card", cost: "+400 Coins", date: "2026-07-03" },
  { id: "tx_3", actionAr: "تحويل 50 نجمة عبر بوابة شحن", actionEn: "Charged 50 Stars", cost: "+50 Stars", date: "2026-07-01" },
  { id: "tx_4", actionAr: "مكافأة يومية لتسجيل الحضور", actionEn: "Daily Check-in Reward", cost: "+15 Coins", date: "2026-06-30" }]
  );

  // Store Quests (13.20/Extra)
  const storeQuests = [
  { id: "q_1", nameAr: "تبادل عنصر واحد بنجاح", nameEn: "Complete 1 Safe Item Swap", reward: "100 Coins", progress: 1, target: 1, done: true },
  { id: "q_2", nameAr: "امتلاك بطاقة من الفئة الأسطورية", nameEn: "Own a Mythic/Legendary Card", reward: "150 Coins", progress: 1, target: 1, done: true },
  { id: "q_3", nameAr: "فتح 3 صناديق حظ عشوائية", nameEn: "Unbox 3 Gacha Chests", reward: "200 Coins", progress: 1, target: 3, done: false }];


  // Selected Inventory Item details modal / context menu (13.8)
  const [selectedInvItem, setSelectedInvItem] = useState<DigitalItem | null>(null);
  const [showItemActionMenu, setShowItemActionMenu] = useState(false);

  // Gifting flow state (13.17)
  const [giftRecipient, setGiftRecipient] = useState("");
  const [isAnonymousGift, setIsAnonymousGift] = useState(false);
  const [giftingStep, setGiftingStep] = useState<"select" | "success" | null>(null);

  // Direct Marketplace list creator state
  const [showMarketplaceListForm, setShowMarketplaceListForm] = useState(false);
  const [listFormPrice, setListFormPrice] = useState(100);
  const [listFormType, setListFormType] = useState<"direct" | "auction" | "swap">("direct");
  const [selectedInvItemToSell, setSelectedInvItemToSell] = useState<DigitalItem | null>(null);

  // Escrow alert & details state
  const [activeEscrowTx, setActiveEscrowTx] = useState<string | null>(null);

  // Safe Multi-party swap state (13.20/Extra)
  const [showMultiPartySwap, setShowMultiPartySwap] = useState(false);
  const [multiSwapPartners, setMultiSwapPartners] = useState<string[]>(["Zoro_Solo", "Nami_Gold"]);
  const [multiSwapOffer, setMultiSwapOffer] = useState("");

  // Coins checkout flow states (13.16)
  const [showCoinPurchasePortal, setShowCoinPurchasePortal] = useState(false);
  const [selectedCoinsPackage, setSelectedCoinsPackage] = useState<{id: string;name: string;price: string;value: number;stars?: boolean;} | null>(null);
  const [isPayingSimulated, setIsPayingSimulated] = useState(false);

  // Handle wishlist clicks
  const toggleWishlist = (itemId: string) => {
    if (wishlist.includes(itemId)) {
      setWishlist((prev) => prev.filter((id) => id !== itemId));
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تم إزالة المادة" : "Wishlist Update",
          isArabic ? "تمت إزالة العنصر من قائمة أمنياتك بنجاح." : "Removed from your custom wishlist.",
          "info"
        );
      }
    } else {
      setWishlist((prev) => [...prev, itemId]);
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "أضيف لقائمة الأمنيات" : "Wishlist Update",
          isArabic ? "سيتم إشعارك فور انخفاض سعر هذا الموديل!" : "You will receive notifications if this item drops in price!",
          "success"
        );
      }
    }
    if (playSynthSound) playSynthSound("levelup");
  };

  // Official Store Purchase handler
  const handleBuyOfficialItem = (item: DigitalItem) => {
    if (!item.price) return;
    const itemCurrency = item.currency || "coins";

    if (itemCurrency === "coins") {
      if (blackCoins < item.price) {
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "عذراً، رصيدك غير كافٍ" : "Insufficient Balance",
            isArabic ? "تحتاج للمزيد من عملات Black Coins لإتمام هذا الشراء." : "Earn more Black Coins or top up your account.",
            "error"
          );
        }
        if (playSynthSound) playSynthSound("error");
        return;
      }
      setBlackCoins((prev) => prev - item.price!);
    } else {
      if (stars < item.price) {
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "النجوم غير كافية" : "Insufficient Stars",
            isArabic ? "تحتاج إلى نجوم إضافية من متجر الشحن." : "You need to purchase additional Stars first.",
            "error"
          );
        }
        if (playSynthSound) playSynthSound("error");
        return;
      }
      setStars((prev) => prev - item.price!);
    }

    // Add to personal inventory
    const newAssetId = `AB-${item.category.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInvItem: DigitalItem = {
      ...item,
      id: `inv_bought_${Date.now()}`,
      acquiredAt: new Date().toISOString().split("T")[0],
      sourceAr: "المتجر الرسمي",
      sourceEn: "Official Store Purchase",
      equipped: false,
      assetId: newAssetId
    };

    setInventory((prev) => [newInvItem, ...prev]);

    // Financial logs
    setTransactionLogs((prev) => [
    {
      id: `tx_${Date.now()}`,
      actionAr: `شراء عنصر: ${item.nameAr}`,
      actionEn: `Bought item: ${item.nameEn}`,
      cost: `-${item.price} ${itemCurrency === "coins" ? "Coins" : "Stars"}`,
      date: new Date().toISOString().split("T")[0]
    },
    ...prev]
    );

    if (triggerCelebration) {
      triggerCelebration(
        "economy",
        "تم الشراء بنجاح! 🎉",
        "Purchase Complete! 🎉",
        `حصلت على المظاهر المذهلة [${item.nameAr}] المضافة لخزنتك.`,
        `Successfully added [${item.nameEn}] to your inventory.`,
        `+15 XP`
      );
    }

    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("success");
  };

  // Subscribe plan handler (13.15)
  const handleSubscribe = (plan: SubPlan) => {
    if (plan.id === "free") return;

    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "بوابة الاشتراكات الآمنة" : "Secure Premium Access",
        isArabic ?
        `لقد تم توجيهك لشراء ${plan.nameAr} بنجاح. تفعيل الميزات المتقدمة!` :
        `Subscription activated for ${plan.nameEn}! Your tier has been updated.`,
        "success"
      );
    }

    // Update current user role
    setCurrentUser((prev: any) => ({
      ...prev,
      role: plan.id === "plus" ? "PremiumBlack" : "Creator"
    }));

    if (triggerCelebration) {
      triggerCelebration(
        "vip",
        "مرحباً بك في النخبة! 👑",
        "Welcome to the Elite! 👑",
        `تمت ترقية حسابك إلى [${plan.nameAr}] وحصلت على هالة الحماية والتألق الحصري.`,
        `Your membership is now upgraded to [${plan.nameEn}] with maximum perks unlocked.`,
        `Ultimate Crown`
      );
    }

    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("levelup");
  };

  // Coins Purchase Simulation Portal (13.16)
  const handleInitiateCoinPurchase = (pkg: any) => {
    setSelectedCoinsPackage(pkg);
    setIsPayingSimulated(true);

    setTimeout(() => {
      setIsPayingSimulated(false);
      setShowCoinPurchasePortal(false);

      if (pkg.stars) {
        setStars((prev) => prev + pkg.value);
      } else {
        setBlackCoins((prev) => prev + pkg.value);
      }

      setTransactionLogs((prev) => [
      {
        id: `tx_buy_${Date.now()}`,
        actionAr: `شحن رصيد: ${pkg.name}`,
        actionEn: `Purchased package: ${pkg.name}`,
        cost: `+${pkg.value} ${pkg.stars ? "Stars" : "Coins"}`,
        date: new Date().toISOString().split("T")[0]
      },
      ...prev]
      );

      if (triggerCelebration) {
        triggerCelebration(
          "economy",
          "تم شحن المحفظة! 💳",
          "Wallet Topped Up! 💳",
          `لقد أضفت بنجاح رصيداً جديداً قدره ${pkg.value} إلى حسابك.`,
          `Successfully loaded ${pkg.value} into your account balance.`,
          "Safe Gate Key"
        );
      }

      if (playSynthSound) playSynthSound("levelup");
      if (triggerHapticFeedback) triggerHapticFeedback("success");
    }, 1800);
  };

  // Inventory equips / actions (13.8)
  const handleEquipItem = (item: DigitalItem) => {
    if (item.category === "frame") {
      if (activeFrame === item.id) {
        if (setActiveFrame) setActiveFrame(null);
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "تم نزع الإطار" : "Frame Unequipped",
            isArabic ? "تم إلغاء تفعيل إطار الأفاتار الحالي." : "Removed active avatar frame.",
            "info"
          );
        }
      } else {
        if (setActiveFrame) setActiveFrame(item.id);
        if (triggerInAppNotification) {
          triggerInAppNotification(
            isArabic ? "تم تجهيز الإطار بنجاح" : "Frame Equipped",
            isArabic ? `لقد تم تزيين أفاتارك بـ [${item.nameAr}]!` : `Profile is now decorated with [${item.nameEn}]!`,
            "success"
          );
        }
      }
    } else if (item.category === "theme") {
      setCurrentUser((prev: any) => ({
        ...prev,
        theme: prev.theme === item.id ? "slate" : item.id
      }));
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تم تطبيق المظهر" : "Theme Equipped",
          isArabic ? "تم تحديث واجهة التطبيق كاملة بمظهرك المختار." : "Application layout styles updated to chosen theme.",
          "success"
        );
      }
    } else {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "تفعيل العنصر" : "Item Activated",
          isArabic ? "تم تجهيز المادة أو عرضها في لوحة هويتك الرقمية." : "The item has been successfully bound to your active display.",
          "info"
        );
      }
    }

    // Toggle local inventory status visual
    setInventory((prev) =>
    prev.map((i, _autoIdx) => i.id === item.id ? { ...i, equipped: !i.equipped } : i)
    );

    setShowItemActionMenu(false);
    setSelectedInvItem(null);
    if (playSynthSound) playSynthSound("levelup");
  };

  // Unbox Loot Chest Gacha experience (13.18)
  const handleOpenGachaChest = (chestItem: DigitalItem) => {
    setSelectedChestToOpen(chestItem);
    setIsOpeningChest(true);
    setChestOpenedReward(null);

    if (playSynthSound) playSynthSound("tap");

    // Remove chest from inventory
    setInventory((prev) => prev.filter((i) => i.id !== chestItem.id));

    setTimeout(() => {
      // Pick random prize from store or cards
      const possiblePrizes: DigitalItem[] = [
      {
        id: "prize_card_gear5",
        nameAr: "بطاقة نادرة: لوفي السوبر سايا",
        nameEn: "Super Rare: Luffy Celestial Card",
        descAr: "بطاقة فنية نادرة للغاية تم إنتاجها خصيصاً لفعاليات الفجر.",
        descEn: "A magnificent collector item celebrating the awakening.",
        category: "card",
        rarity: "Legendary",
        image: "💫",
        sellable: true,
        giftable: true,
        exchangeable: true
      },
      {
        id: "prize_frame_neon",
        nameAr: "إطار هال النيون الكوني",
        nameEn: "Cosmic Neon Aura Frame",
        descAr: "هالة ساحرة ومتحركة تعطي ملفك الشخصي رونقاً جذاباً.",
        descEn: "Interactive cosmic aura to elevate your digital profile presence.",
        category: "frame",
        rarity: "Epic",
        image: "⭐",
        sellable: true,
        giftable: true,
        exchangeable: true
      },
      {
        id: "prize_effect_fire",
        nameAr: "تأثير لهب كونوها",
        nameEn: "Konoha Fireflies Effect",
        descAr: "جزيئات ذهبية طائرة لملفك الشخصي.",
        descEn: "Floating particles for your anime identity background.",
        category: "effect",
        rarity: "Rare",
        image: "🍂",
        sellable: false,
        giftable: true,
        exchangeable: true
      }];


      const prize = possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];
      const randomizedAssetId = `AB-GCH-${Math.floor(100000 + Math.random() * 900000)}`;

      const newPrizeWithDetails: DigitalItem = {
        ...prize,
        id: `gacha_reward_${Date.now()}`,
        acquiredAt: new Date().toISOString().split("T")[0],
        sourceAr: "صندوق حظ رسمي",
        sourceEn: "Official Gacha Box",
        assetId: randomizedAssetId
      };

      setChestOpenedReward(newPrizeWithDetails);
      setIsOpeningChest(false);

      // Save prize to inventory
      setInventory((prev) => [newPrizeWithDetails, ...prev]);

      if (triggerCelebration) {
        triggerCelebration(
          "levelup",
          "يا للروعة! جائزة نادرة! 🎁",
          "Incredible Gacha Roll! 🎁",
          `لقد فزت بـ [${newPrizeWithDetails.nameAr}] ذو الندرة الأسطورية!`,
          `Unboxed: [${newPrizeWithDetails.nameEn}] added instantly to your collection.`,
          "Legendary Aura"
        );
      }

      if (playSynthSound) playSynthSound("levelup");
    }, 3200);
  };

  // Submit User Listing to Marketplace (13.3)
  const handlePublishMarketplaceListing = () => {
    if (!selectedInvItemToSell) return;

    const newListing = {
      id: `list_user_${Date.now()}`,
      seller: { name: currentUser.name || "My_Profile", avatar: currentUser.avatar },
      item: {
        id: selectedInvItemToSell.id,
        nameAr: selectedInvItemToSell.nameAr,
        nameEn: selectedInvItemToSell.nameEn,
        descAr: selectedInvItemToSell.descAr,
        descEn: selectedInvItemToSell.descEn,
        category: selectedInvItemToSell.category,
        rarity: selectedInvItemToSell.rarity,
        image: selectedInvItemToSell.image,
        assetId: selectedInvItemToSell.assetId || "AB-CD-GENERATED"
      },
      type: listFormType,
      price: listFormPrice,
      bidExpiry: listFormType === "auction" ? Date.now() + 3600000 : undefined,
      highestBid: listFormType === "auction" ? Math.floor(listFormPrice * 0.8) : undefined,
      highestBidder: listFormType === "auction" ? "Luffy_99" : undefined,
      digitalId: `AB-ESC-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setMarketplaceListings((prev) => [newListing, ...prev]);

    // Remove the listed item from visible personal inventory because it is in Escrow (13.5)
    setInventory((prev) => prev.filter((i) => i.id !== selectedInvItemToSell.id));

    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم الإيداع في السوق الآمن" : "Secure Escrow Enforced",
        isArabic ?
        "تم حجز المادة ونشرها في السوق بنجاح. رصيدك والعنصر آمنان تماماً." :
        "Item placed in market. Funds and item held in secure third-party escrow.",
        "success"
      );
    }

    setShowMarketplaceListForm(false);
    setSelectedInvItemToSell(null);

    if (playSynthSound) playSynthSound("levelup");
  };

  // Gifting Element Action (13.17)
  const handleGiftItemAction = () => {
    if (!selectedInvItem || !giftRecipient) return;

    // Remove from inventory
    setInventory((prev) => prev.filter((i) => i.id !== selectedInvItem.id));

    setTransactionLogs((prev) => [
    {
      id: `tx_gift_${Date.now()}`,
      actionAr: `إرسال هدية إلى ${giftRecipient} ${isAnonymousGift ? "(مجهول)" : ""}`,
      actionEn: `Sent gift to ${giftRecipient} ${isAnonymousGift ? "(Anonymous)" : ""}`,
      cost: `Gift: ${selectedInvItem.nameEn}`,
      date: new Date().toISOString().split("T")[0]
    },
    ...prev]
    );

    setGiftingStep("success");

    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم إرسال الهدية بنجاح 🎁" : "Gift Sent Successfully 🎁",
        isArabic ?
        `سيتلقى ${giftRecipient} هذه الهدية المذهلة مع رسالة تشجيعية!` :
        `${giftRecipient} will receive your beautiful gift inside their inventory immediately!`,
        "success"
      );
    }

    if (playSynthSound) playSynthSound("levelup");
  };

  // Direct Marketplace Buy Handler with Escrow
  const handleBuyMarketplaceListing = (listing: any) => {
    if (blackCoins < listing.price) {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "عملات غير كافية" : "Insufficient Balance",
          isArabic ? "تحتاج للمزيد من العملات السوداء لإتمام صفقة السوق هذه." : "Earn more Black Coins before purchasing.",
          "error"
        );
      }
      return;
    }

    setBlackCoins((prev) => prev - listing.price);

    // Add to personal inventory
    const boughtItem: DigitalItem = {
      ...listing.item,
      acquiredAt: new Date().toISOString().split("T")[0],
      sourceAr: `سوق اللاعبين من ${listing.seller.name}`,
      sourceEn: `Player Marketplace from ${listing.seller.name}`,
      equipped: false
    };

    setInventory((prev) => [boughtItem, ...prev]);

    // Remove from marketplace
    setMarketplaceListings((prev) => prev.filter((l) => l.id !== listing.id));

    // Transaction logs
    setTransactionLogs((prev) => [
    {
      id: `tx_m_${Date.now()}`,
      actionAr: `شراء من السوق: ${listing.item.nameAr}`,
      actionEn: `Bought from Marketplace: ${listing.item.nameEn}`,
      cost: `-${listing.price} Coins`,
      date: new Date().toISOString().split("T")[0]
    },
    ...prev]
    );

    if (triggerCelebration) {
      triggerCelebration(
        "economy",
        "اكتملت صفقة السوق! 🤝",
        "Marketplace Deal Confirmed! 🤝",
        `تم تحرير المادة [${listing.item.nameAr}] من وسيط الضمان الآمن بنجاح.`,
        `The item [${listing.item.nameEn}] has been successfully released from escrow to your vault.`,
        `Asset Verified`
      );
    }

    if (playSynthSound) playSynthSound("levelup");
    if (triggerHapticFeedback) triggerHapticFeedback("success");
  };

  // Bid on Auction Handler (13.4)
  const handleBidOnAuction = (listing: any, amount: number) => {
    if (amount <= (listing.highestBid || listing.price)) {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "خطأ في المزايدة" : "Bid Error",
          isArabic ? "يجب أن تكون المزايدة أعلى من السعر الحالي الحالي!" : "Bid must be strictly higher than current standing bid!",
          "warning"
        );
      }
      return;
    }

    if (blackCoins < amount) {
      if (triggerInAppNotification) {
        triggerInAppNotification(
          isArabic ? "رصيد غير كافي" : "Insufficient Coins",
          isArabic ? "رصيدك غير كاف لوضع هذا العرض العالي." : "You do not have enough Black Coins to match this bid.",
          "error"
        );
      }
      return;
    }

    // Update listings
    setMarketplaceListings((prev) =>
    prev.map((l, _autoIdx) =>
    l.id === listing.id ?
    {
      ...l,
      highestBid: amount,
      highestBidder: currentUser.name || "My_Profile"
    } :
    l
    )
    );

    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم وضع المزايدة الآمنة" : "Bid Locked in Escrow",
        isArabic ?
        `رائع! أنت المزايد الأعلى الآن بمبلغ ${amount} عملة سوداء.` :
        `Success! You are now the highest bidder at ${amount} Coins. Locked in secure escrow.`,
        "success"
      );
    }

    if (playSynthSound) playSynthSound("levelup");
  };

  // Submit custom built theme (13.14)
  const handlePublishCustomTheme = () => {
    if (triggerInAppNotification) {
      triggerInAppNotification(
        isArabic ? "تم إرسال السيم للمراجعة" : "Theme Submitted for Review",
        isArabic ?
        `تم إرسال [${themeForm.name}] لمراجعة المشرفين. ستحصل على عمولة 10% عند بيعه.` :
        `Theme [${themeForm.name}] is sent to moderation. You will receive 10% creator royalties on every store purchase!`,
        "success"
      );
    }

    // Add to personal inventory as proof
    const newThemeItem: DigitalItem = {
      id: `theme_custom_${Date.now()}`,
      nameAr: themeForm.name,
      nameEn: themeForm.name,
      descAr: `ثيم مصمم خصيصاً بواسطة ${currentUser.name || "مبدعنا المميز"}.`,
      descEn: `A unique theme handcrafted custom-designed by ${currentUser.name || "Anime Creator"}.`,
      category: "theme",
      rarity: "Developer Exclusive",
      image: "🎨",
      price: themeForm.price,
      currency: "coins",
      sellable: true,
      giftable: true,
      equipped: false,
      assetId: `AB-THM-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setInventory((prev) => [newThemeItem, ...prev]);

    if (triggerCelebration) {
      triggerCelebration(
        "vip",
        "تمت صناعة الإبداع بنجاح! 🎨",
        "Masterpiece Published! 🎨",
        `ثيمك [${themeForm.name}] يدخل قائمة الانتظار للمتجر الرسمي.`,
        `Your design is currently in the verification queue to join the Theme Store!`,
        "Royalty Key"
      );
    }

    if (playSynthSound) playSynthSound("levelup");
  };

  // Rarity styling dictionary matching Guidelines 13.9
  const rarityColors: Record<ItemRarity, {text: string;bg: string;border: string;glow: string;}> = {
    Common: { text: "text-zinc-400", bg: "bg-zinc-900/60", border: "border-zinc-800", glow: "" },
    Uncommon: { text: "text-emerald-400", bg: "bg-emerald-950/20", border: "border-emerald-800/40", glow: "" },
    Rare: { text: "text-sky-400", bg: "bg-sky-950/20", border: "border-sky-800/40", glow: "" },
    Epic: { text: "text-purple-400", bg: "bg-purple-950/30", border: "border-purple-800/40", glow: "shadow-[0_0_12px_rgba(168,85,247,0.2)]" },
    Legendary: { text: "text-amber-400", bg: "bg-amber-950/30", border: "border-amber-600/40", glow: "shadow-[0_0_15px_rgba(245,158,11,0.35)] animate-pulse" },
    Mythic: { text: "text-rose-400 font-extrabold", bg: "bg-rose-950/40", border: "border-rose-500/50", glow: "shadow-[0_0_20px_rgba(244,63,94,0.45)] animate-pulse" },
    Limited: { text: "text-red-400 font-black", bg: "bg-red-950/40", border: "border-red-500/50", glow: "shadow-[0_0_25px_rgba(239,68,68,0.5)] border-dashed animate-pulse" },
    "Event Exclusive": { text: "text-orange-400 font-bold", bg: "bg-orange-950/30", border: "border-orange-500/40", glow: "" },
    "Developer Exclusive": { text: "text-indigo-400 font-mono", bg: "bg-indigo-950/40", border: "border-indigo-500/40", glow: "border-double" }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-zinc-100 font-sans" id="economy_system_container">
      {/* Outer Card Frame */}
      <div className="w-full max-w-5xl bg-[#09090B] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-[850px]" id="economy_system_modal">
        
        {/* HEADER */}
        <div className="border-b border-zinc-800 bg-[#0F0F13] px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-500">
              <Coins className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider flex items-center gap-2 text-white">
                {isArabic ? "نظام الاقتصاد والجروبات الرقمي" : "Marketplace & Digital Economy Hub"}
                <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                  V2.12
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400">
                {isArabic ? "سوق المتداولين، متجر الأفاتار، محرر الثيمات الحصري، وصناديق الحظ" : "Trading suite, custom themes publisher, gacha vaults and safe escrow"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Quickview */}
            <div className="hidden sm:flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-850">
              <button
                onClick={() => setShowCoinPurchasePortal(true)}
                className="flex items-center gap-1 hover:text-white transition-all text-amber-400">
                
                <Coins className="w-3.5 h-3.5" />
                <span className="text-xs font-black font-mono">{blackCoins}</span>
                <span className="text-[9px] text-zinc-500">{isArabic ? "عملة" : "Coins"}</span>
                <Plus className="w-3 h-3 ml-1 bg-amber-500 text-black rounded-full" />
              </button>

              <div className="w-px h-4 bg-zinc-800" />

              <button
                onClick={() => setShowCoinPurchasePortal(true)}
                className="flex items-center gap-1 hover:text-white transition-all text-sky-400">
                
                <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
                <span className="text-xs font-black font-mono">{stars}</span>
                <span className="text-[9px] text-zinc-500">{isArabic ? "نجمة" : "Stars"}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-xl transition-all border border-zinc-800 cursor-pointer">
              
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INNER TABS BAR */}
        <div className="flex overflow-x-auto border-b border-zinc-900 bg-[#0A0A0E] px-2 py-1 shrink-0 scrollbar-none gap-1">
          {[
          { id: "store", labelAr: "🏪 متجر الإدارة", labelEn: "Official Store", icon: ShoppingBag },
          { id: "marketplace", labelAr: "🤝 سوق اللاعبين", labelEn: "Player Market", icon: ArrowRightLeft },
          { id: "inventory", labelAr: "📦 مخزني الخاص", labelEn: "My Inventory", icon: Package },
          { id: "theme", labelAr: "🎨 محرر المظاهر", labelEn: "Theme Store", icon: Palette },
          { id: "subs", labelAr: "💎 العضويات المميزة", labelEn: "Subscriptions", icon: Crown },
          { id: "stats", labelAr: "📊 ماليات السوق", labelEn: "Economics & Quests", icon: TrendingUp }].
          map((tab, _autoIdx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`econ_tab_${tab.id}_${_autoIdx}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (playSynthSound) playSynthSound("tap");
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive ?
                "bg-gradient-to-r from-red-950 to-zinc-900 border border-red-500/30 text-white" :
                "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"}`
                }>
                
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-500" : ""}`} />
                <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              </button>);

          })}
        </div>

        {/* MOBILE WALLET DISPLAY */}
        <div className="sm:hidden flex items-center justify-around bg-[#0C0C0F] py-2 px-4 border-b border-zinc-900 text-xs font-bold shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span>{blackCoins} {isArabic ? "عملة سوداء" : "Black Coins"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <Star className="w-3.5 h-3.5 fill-sky-400" />
            <span>{stars} {isArabic ? "نجمة" : "Stars"}</span>
          </div>
          <button
            onClick={() => setShowCoinPurchasePortal(true)}
            className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-black px-2 py-1 rounded-lg">
            
            ➕ {isArabic ? "شحن" : "Buy"}
          </button>
        </div>

        {/* MAIN BODY SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#08080A]">
          
          {/* 1. BLACK STORE TAB */}
          {activeTab === "store" &&
          <div className="space-y-6">
              
              {/* Promo Banner / Featured Loot Chest */}
              <div className="bg-gradient-to-r from-[#1E0800] via-[#0C0C10] to-[#0D0518] border border-orange-900/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center md:text-left">
                  <span className="text-[8px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                    {isArabic ? "الحدث الموسمي المحدود" : "Limited Season Event"}
                  </span>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 justify-center md:justify-start">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    {isArabic ? "صندوق الفجر الذهبي الأسطوري" : "Legendary Solar Horizon Chest"}
                  </h3>
                  <p className="text-[10px] text-zinc-400 max-w-md">
                    {isArabic ?
                  "افتح الصندوق الآن واحصل على فرصة للفوز بإطار هالة السايبربانك المتحرك الحصري لعام 2026!" :
                  "Open for a chance of legendary custom frames, avatar titles, and mythic collector anime cards."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="block text-[8px] text-zinc-500 line-through">400 Coins</span>
                    <span className="block text-xs font-black text-amber-500 font-mono">150 Coins</span>
                  </div>
                  <button
                  onClick={() => {
                    const demoChest = officialStoreItems.find((i) => i.id === "store_chest_legend");
                    if (demoChest) handleBuyOfficialItem(demoChest);
                  }}
                  className="bg-[#FF3D00] hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/60 transition-all cursor-pointer">
                  
                    📦 {isArabic ? "شراء الصندوق" : "Unbox Now"}
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                { id: "all", labelAr: "الكل", labelEn: "All Items" },
                { id: "frame", labelAr: "🖼️ الإطارات", labelEn: "Frames" },
                { id: "card", labelAr: "🃏 بطاقات الأنمي", labelEn: "Cards" },
                { id: "chest", labelAr: "🎁 صناديق الحظ", labelEn: "Lootboxes" },
                { id: "effect", labelAr: "✨ مؤثرات وتصاميم", labelEn: "Effects" }].
                map((cat, _autoIdx) =>
                <button
                  key={`${cat.id}_${_autoIdx}`}
                  onClick={() => setStoreCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                  storeCategory === cat.id ?
                  "bg-zinc-800 text-white border-zinc-700" :
                  "text-zinc-400 border-transparent hover:text-zinc-200"}`
                  }>
                  
                      {isArabic ? cat.labelAr : cat.labelEn}
                    </button>
                )}
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  {isArabic ? "جميع المشتريات تضاف للمخزن فوراً" : "All purchases land directly in your Inventory"}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {officialStoreItems.
              filter((item) => storeCategory === "all" || item.category === storeCategory).
              map((item, _autoIdx) => {
                const rStyle = rarityColors[item.rarity];
                const isFav = wishlist.includes(item.id);
                return (
                  <div
                    key={`${item.id}_${_autoIdx}`}
                    className={`bg-[#0C0C0F] border ${rStyle.border} rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.01] hover:bg-[#111115] relative ${rStyle.glow}`}>
                    
                        {/* Rarity Tag */}
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${rStyle.bg} ${rStyle.text}`}>
                            {item.rarity}
                          </span>
                          <button
                        onClick={() => toggleWishlist(item.id)}
                        className="text-zinc-500 hover:text-red-500 p-1 bg-black/40 rounded-lg">
                        
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                        </div>

                        {/* Visual & Details */}
                        <div className="space-y-3 pt-2">
                          <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-zinc-800">
                            {item.image}
                          </div>
                          <div>
                            <span className="block text-xs font-black text-white">
                              {isArabic ? item.nameAr : item.nameEn}
                            </span>
                            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 min-h-[30px]">
                              {isArabic ? item.descAr : item.descEn}
                            </p>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-900 mt-4">
                          <div className="flex items-center gap-1">
                            {item.currency === "stars" ?
                        <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" /> :

                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        }
                            <span className="text-xs font-black font-mono text-white">{item.price}</span>
                          </div>

                          <button
                        onClick={() => handleBuyOfficialItem(item)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-black text-white hover:border-zinc-700 transition-all cursor-pointer">
                        
                            🛒 {isArabic ? "شراء فوري" : "Instant Buy"}
                          </button>
                        </div>
                      </div>);

              })}
              </div>
            </div>
          }

          {/* 2. MARKETPLACE & AUCTIONS TAB */}
          {activeTab === "marketplace" &&
          <div className="space-y-6">
              
              {/* Marketplace header intro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Visual Stats Chart Holder (13.20/Extra) */}
                <div className="bg-[#0C0C10] border border-zinc-850 rounded-2xl p-4 col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                      {isArabic ? "سجل أسعار بطاقات اللعبة النادرة" : "Rarity Market Price Index (Escrow)"}
                    </h4>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      {isArabic ? "ارتفاع +42% هذا الأسبوع" : "+42% Peak This Week"}
                    </span>
                  </div>

                  {/* Simulated Line Chart representing Price history of rare anime cards (13.20) */}
                  <div className="h-28 flex items-end justify-between gap-1 pt-3 border-b border-zinc-900/60 pb-1">
                    {priceHistoryData.map((data, idx) => {
                    const maxVal = Math.max(...priceHistoryData.map((d, _autoIdx) => d.value));
                    const heightPct = data.value / maxVal * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip tooltip */}
                          <span className="absolute -top-6 bg-red-600 text-white text-[8px] font-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {data.value}c
                          </span>
                          <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-gradient-to-t from-red-950 to-red-500 rounded-t-sm min-h-[10%]" />
                        
                          <span className="text-[8px] text-zinc-500 font-mono mt-1">{data.date}</span>
                        </div>);

                  })}
                  </div>
                  <p className="text-[8px] text-zinc-500 mt-2 text-center">
                    {isArabic ?
                  "مؤشر أسعار المبادلات مصادق عليه بواسطة الأصول الرقمية الفريدة (Digital Asset ID)" :
                  "Price trend verified by secure platform blockchain-like cryptographic unique asset IDs."}
                  </p>
                </div>

                {/* Sell / Swap CTA Action (13.4) */}
                <div className="bg-gradient-to-br from-[#121216] to-[#0A0512] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">{isArabic ? "بيع أو مقايضة عناصرك" : "Trade or Auction"}</h4>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ?
                    "قم بنشر بطاقاتك أو إطاراتك النادرة في السوق الآمن واحصد الأرباح المباشرة." :
                    "Turn your rare frames, custom anime cards, or unopened chests into liquid Black Coins."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                    onClick={() => {
                      setShowMarketplaceListForm(true);
                      if (playSynthSound) playSynthSound("levelup");
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black py-2 rounded-xl border border-zinc-800 transition-all cursor-pointer text-center block">
                    
                      ➕ {isArabic ? "إنشاء عرض بيع جديد" : "List Item For Sale"}
                    </button>

                    <button
                    onClick={() => setShowMultiPartySwap(true)}
                    className="w-full bg-[#FF3D00]/10 hover:bg-[#FF3D00]/20 text-[#FF3D00] border border-[#FF3D00]/30 text-xs font-black py-2 rounded-xl transition-all cursor-pointer text-center block">
                    
                      🔄 {isArabic ? "تبادل متعدد الأطراف" : "Multi-Party Swap"}
                    </button>
                  </div>
                </div>

              </div>

              {/* Secure Escrow Enforcer Banner (13.5) */}
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-emerald-400">
                    {isArabic ? "🛡️ نظام حماية الوساطة (Escrow) مفعل تلقائياً" : "🛡️ Escrow Protection Protocol Active"}
                  </span>
                  <p className="text-[9px] text-zinc-400">
                    {isArabic ?
                  "جميع عمليات الشراء، المزايدات، والمقايضات آمنة 100%. يحتفظ الوسيط بالعملات والأصل حتى تأكيد التسليم لمنع أي عملية احتيال." :
                  "We hold items and currency in a tamper-proof locker until both sides fulfill their terms. No fraud is possible."}
                  </p>
                </div>
              </div>

              {/* Active Market Listings Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  {isArabic ? "العروض والصفقات النشطة حالياً" : "Current Live Listings & Auctions"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketplaceListings.map((listing, _autoIdx) => {
                  const isUserSeller = listing.seller.name === "My_Profile";
                  return (
                    <div key={`${listing.id}_${_autoIdx}`} className="bg-[#0C0C0F] border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all">
                        
                        {/* Seller profile top */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <img src={listing.seller.avatar} className="w-6 h-6 rounded-full border border-zinc-800 object-cover" />
                            <div>
                              <span className="block text-[10px] font-black text-white">{listing.seller.name}</span>
                              <span className="block text-[8px] text-zinc-500 font-mono">ID: {listing.digitalId}</span>
                            </div>
                          </div>

                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                        listing.type === "auction" ? "bg-amber-950 text-amber-400" :
                        listing.type === "swap" ? "bg-purple-950 text-purple-400" : "bg-zinc-900 text-zinc-400"}`
                        }>
                            {listing.type === "auction" ? isArabic ? "🔨 مزاد" : "🔨 Auction" :
                          listing.type === "swap" ? isArabic ? "🔄 مقايضة" : "🔄 Swap" : isArabic ? "💰 شراء مباشر" : "💰 Direct Sale"}
                          </span>
                        </div>

                        {/* Item representation */}
                        <div className="flex gap-3 bg-black/30 p-2.5 rounded-xl border border-zinc-900">
                          <span className="text-3xl p-1 shrink-0">{listing.item.image}</span>
                          <div>
                            <span className="block text-xs font-black text-white">{isArabic ? listing.item.nameAr : listing.item.nameEn}</span>
                            <span className="block text-[9px] text-zinc-500 mt-0.5 leading-tight">{isArabic ? listing.item.descAr : listing.item.descEn}</span>
                            <span className="block text-[8px] text-zinc-600 font-mono mt-1">Asset ID: {listing.item.assetId}</span>
                          </div>
                        </div>

                        {/* Bid controls or buy controls */}
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
                          
                          {/* Left: display price */}
                          <div>
                            {listing.type === "swap" ?
                          <div>
                                <span className="block text-[8px] text-zinc-500 uppercase">{isArabic ? "المطلوب للمقايضة" : "LOOKING FOR"}</span>
                                <span className="block text-[10px] font-black text-amber-500 truncate max-w-[150px]">
                                  {isArabic ? listing.swapForNameAr : listing.swapForNameEn}
                                </span>
                              </div> :
                          listing.type === "auction" ?
                          <div>
                                <span className="block text-[8px] text-zinc-500 uppercase">{isArabic ? "أعلى مزايدة حالية" : "HIGHEST STANDING BID"}</span>
                                <span className="block text-xs font-black text-amber-500 font-mono">{listing.highestBid} Coins</span>
                                <span className="block text-[8px] text-zinc-500 font-mono">{listing.highestBidder}</span>
                              </div> :

                          <div>
                                <span className="block text-[8px] text-zinc-500 uppercase">{isArabic ? "السعر الفوري" : "INSTANT BUY PRICE"}</span>
                                <span className="block text-xs font-black text-white font-mono">{listing.price} Coins</span>
                              </div>
                          }
                          </div>

                          {/* Right Actions */}
                          <div className="flex items-center gap-1.5">
                            {listing.type === "auction" ?
                          <button
                            onClick={() => handleBidOnAuction(listing, (listing.highestBid || listing.price) + 50)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                            
                                🔨 {isArabic ? "مزايدة (+50)" : "Bid (+50)"}
                              </button> :
                          listing.type === "swap" ?
                          <button
                            onClick={() => {
                              if (triggerInAppNotification) {
                                triggerInAppNotification(
                                  isArabic ? "تقديم طلب المقايضة" : "Swap Request Submitted",
                                  isArabic ? "سيتم التحقق من وجود العنصر المطلوب في مخزنك ومقايضته آلياً." : "Escrow checking your inventory for matching items to exchange automatically.",
                                  "info"
                                );
                              }
                              if (playSynthSound) playSynthSound("tap");
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                            
                                🔄 {isArabic ? "مقايضة الآن" : "Propose Swap"}
                              </button> :

                          <button
                            onClick={() => handleBuyMarketplaceListing(listing)}
                            className="bg-[#FF3D00] hover:bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                            
                                {isArabic ? "شراء فوري" : "Instant Buy"}
                              </button>
                          }
                          </div>

                        </div>

                      </div>);

                })}
                </div>
              </div>

            </div>
          }

          {/* 3. MY INVENTORY & CARDS TAB (13.6) */}
          {activeTab === "inventory" &&
          <div className="space-y-6">
              
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0C0C0F] border border-zinc-850 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "مساحة المخزن" : "Vault Storage"}</span>
                  <span className="text-sm font-black text-white block mt-1">{inventory.length} / 150</span>
                </div>
                <div className="bg-[#0C0C0F] border border-zinc-850 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "الإطارات المملوكة" : "Aura Frames"}</span>
                  <span className="text-sm font-black text-amber-400 block mt-1">
                    {inventory.filter((i) => i.category === "frame").length}
                  </span>
                </div>
                <div className="bg-[#0C0C0F] border border-zinc-850 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "بطاقات الأنمي" : "Anime Cards"}</span>
                  <span className="text-sm font-black text-purple-400 block mt-1">
                    {inventory.filter((i) => i.category === "card").length}
                  </span>
                </div>
                <div className="bg-[#0C0C0F] border border-zinc-850 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">{isArabic ? "صناديق غير مفتوحة" : "Loot Chests"}</span>
                  <span className="text-sm font-black text-emerald-400 block mt-1">
                    {inventory.filter((i) => i.category === "chest").length}
                  </span>
                </div>
              </div>

              {/* Grid of inventory items */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  {isArabic ? "العناصر والبطاقات المحفوظة في مخزنك" : "My Personal Collectibles Vault"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {inventory.map((item, _autoIdx) => {
                  const rStyle = rarityColors[item.rarity];
                  return (
                    <div
                      key={`${item.id}_${_autoIdx}`}
                      onClick={() => {
                        setSelectedInvItem(item);
                        setShowItemActionMenu(true);
                        if (playSynthSound) playSynthSound("tap");
                      }}
                      className={`bg-[#0C0C0F] border ${rStyle.border} rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.01] cursor-pointer relative ${rStyle.glow} ${
                      item.equipped ? "ring-2 ring-red-500/80 bg-zinc-950" : ""}`
                      }>
                      
                        {/* Tags top */}
                        <div className="flex justify-between items-start">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${rStyle.bg} ${rStyle.text}`}>
                            {item.rarity}
                          </span>
                          {item.equipped &&
                        <span className="bg-red-600 text-white font-black text-[7px] px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                              {isArabic ? "مجهز" : "ACTIVE"}
                            </span>
                        }
                        </div>

                        {/* Visual details */}
                        <div className="space-y-3 pt-3">
                          <div className="w-11 h-11 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-zinc-800">
                            {item.image}
                          </div>
                          <div>
                            <span className="block text-xs font-black text-white">
                              {isArabic ? item.nameAr : item.nameEn}
                            </span>
                            <p className="text-[9px] text-zinc-400 mt-1 leading-normal line-clamp-2">
                              {isArabic ? item.descAr : item.descEn}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Metadata */}
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-900 mt-4 text-[9px] text-zinc-500 font-mono">
                          <span>Source: {isArabic ? item.sourceAr : item.sourceEn}</span>
                          <span className="text-zinc-600">ID: {item.assetId}</span>
                        </div>
                      </div>);

                })}
                </div>
              </div>

            </div>
          }

          {/* 4. THEME STORE & CREATOR TAB (13.12, 13.13) */}
          {activeTab === "theme" &&
          <div className="space-y-6">
              
              {/* Premium Theme Creator Card Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Settings Panel */}
                <div className="bg-[#0C0C0F] border border-zinc-850 rounded-2xl p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-red-500" />
                      {isArabic ? "محرر ومصمم الثيمات الاحترافي" : "Professional Anime Theme Creator"}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ? "صمم مظهرك المفضل وانشره في متجر المجتمع لتحقيق مكاسب مالية" : "Design custom styles, select custom interface sounds and export to the community store"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Theme name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "اسم المظهر" : "Theme Title"}</label>
                      <input
                      type="text"
                      value={themeForm.name}
                      onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white" />
                    
                    </div>

                    {/* Font and Shape select */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "نوع الخط" : "Font Family"}</label>
                        <select
                        value={themeForm.fontFamily}
                        onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value as any })}
                        className="w-full bg-black/60 border border-zinc-850 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-red-500 text-white">
                        
                          <option value="Space Grotesk">Space Grotesk</option>
                          <option value="Inter">Inter Sans</option>
                          <option value="JetBrains Mono">JetBrains Mono</option>
                          <option value="Playfair Display">Playfair Display</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "شكل الزوايا" : "Corner Rounded"}</label>
                        <select
                        value={themeForm.cardShape}
                        onChange={(e) => setThemeForm({ ...themeForm, cardShape: e.target.value as any })}
                        className="w-full bg-black/60 border border-zinc-850 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-red-500 text-white">
                        
                          <option value="rounded-sm">Sharp (sm)</option>
                          <option value="rounded-xl">Dynamic (xl)</option>
                          <option value="rounded-3xl">Pill (3xl)</option>
                          <option value="rounded-none">Flat (None)</option>
                        </select>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "اللون الأساسي" : "Accent Color"}</label>
                        <div className="flex gap-2 items-center">
                          <input
                          type="color"
                          value={themeForm.primaryColor}
                          onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                          className="bg-transparent w-8 h-8 rounded cursor-pointer border border-zinc-800" />
                        
                          <span className="text-[10px] font-mono text-zinc-300">{themeForm.primaryColor}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "الخلفية العميقة" : "Background Tint"}</label>
                        <div className="flex gap-2 items-center">
                          <input
                          type="color"
                          value={themeForm.bgColor}
                          onChange={(e) => setThemeForm({ ...themeForm, bgColor: e.target.value })}
                          className="bg-transparent w-8 h-8 rounded cursor-pointer border border-zinc-800" />
                        
                          <span className="text-[10px] font-mono text-zinc-300">{themeForm.bgColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat bubble & Sounds */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "أصوات الواجهة" : "Sound Pack"}</label>
                        <select
                        value={themeForm.soundPack}
                        onChange={(e) => setThemeForm({ ...themeForm, soundPack: e.target.value })}
                        className="w-full bg-black/60 border border-zinc-850 rounded-xl px-2 py-2 text-xs text-white">
                        
                          <option value="samurai_steel">⚔️ Samurai Steel</option>
                          <option value="mech_future">🤖 Mech Laser</option>
                          <option value="soft_pixel">👾 Soft Gacha Retro</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "فقاعات الدردشة" : "Chat Bubbles"}</label>
                        <select
                        value={themeForm.bubbleStyle}
                        onChange={(e) => setThemeForm({ ...themeForm, bubbleStyle: e.target.value as any })}
                        className="w-full bg-black/60 border border-zinc-850 rounded-xl px-2 py-2 text-xs text-white">
                        
                          <option value="cyber">Cyber futuristic</option>
                          <option value="cloud">Manga Cloud</option>
                          <option value="rounded">Organic rounded</option>
                        </select>
                      </div>
                    </div>

                    {/* Published price royalties */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">
                        {isArabic ? "تحديد سعر البيع (عند النشر)" : "Theme Store Listing Price (Coins)"}
                      </label>
                      <input
                      type="number"
                      value={themeForm.price}
                      onChange={(e) => setThemeForm({ ...themeForm, price: parseInt(e.target.value) || 50 })}
                      className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white" />
                    
                    </div>

                    <button
                    onClick={handlePublishCustomTheme}
                    className="w-full bg-[#FF3D00] hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-md shadow-orange-950/40 cursor-pointer">
                    
                      🚀 {isArabic ? "تقديم الثيم للمراجعة والنشر" : "Publish Theme to Community Store"}
                    </button>
                  </div>
                </div>

                {/* Live Real-time Preview Area (13.20/Extra) */}
                <div className="bg-[#050507] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: themeForm.bgColor }}>
                  <div className="absolute top-2 left-2 bg-zinc-950/80 text-[8px] font-black text-[#FF3D00] px-2 py-1 rounded-lg border border-red-500/20">
                    {isArabic ? "معاينة حية وتفاعلية" : "Interactive Live Preview"}
                  </div>

                  <div className="space-y-4 mt-8">
                    {/* Simulated Nav Bar Preview */}
                    <div className="bg-zinc-950/75 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                      <span className="text-[8px] text-zinc-500 block uppercase font-bold">{isArabic ? "شريط التنقل المطور" : "Theme Navigation Bar"}</span>
                      <div className="flex justify-between items-center px-2 py-1 bg-black/40 rounded-lg">
                        <span className="text-[10px] font-black" style={{ color: themeForm.primaryColor }}>🔥 Home</span>
                        <span className="text-[10px] text-zinc-500">💬 Chats</span>
                        <span className="text-[10px] text-zinc-500">🏆 Guilds</span>
                      </div>
                    </div>

                    {/* Chat Bubble Preview */}
                    <div className="space-y-2">
                      <span className="text-[8px] text-zinc-500 block uppercase font-bold">{isArabic ? "فقاعة المحادثة" : "Dynamic Chat Bubble"}</span>
                      <div className="flex flex-col gap-2">
                        <div className={`p-2.5 self-start bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] ${
                      themeForm.cardShape} max-w-[80%]`
                      }>
                          {isArabic ? "مرحباً! هل قمت بتجربة محرر المظهر الجديد؟" : "Hello! Have you built your first anime style preset?"}
                        </div>
                        <div
                        className={`p-2.5 self-end text-white text-[10px] ${themeForm.cardShape} max-w-[80%]`}
                        style={{ backgroundColor: themeForm.primaryColor }}>
                        
                          {isArabic ? "نعم! إنه يدعم الألوان المخصصة والتأثيرات المتحركة الحية!" : "Yes! Fully custom corners and accent paint colors live."}
                        </div>
                      </div>
                    </div>

                    {/* Styled Card UI elements */}
                    <div className={`bg-zinc-950/50 p-4 border border-zinc-850 ${themeForm.cardShape} space-y-1`}>
                      <h4 className="text-xs font-black text-white" style={{ fontFamily: themeForm.fontFamily }}>
                        {isArabic ? "معاينة الخطوط المتناغمة" : "Typography & Shape Pairings"}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {isArabic ? "التصميم المذهل يعتمد على اتساق التفاصيل الصغيرة." : "Craft is complete consistency across every small border."}
                      </p>
                    </div>
                  </div>

                  <p className="text-[9px] text-zinc-500 text-center mt-6">
                    {isArabic ? "اضغط على أي خيار في لوحة الإعدادات لتحديث المعاينة فورياً" : "Modify accent tints or geometry parameters to witness immediate reaction"}
                  </p>
                </div>

              </div>

            </div>
          }

          {/* 5. SUBSCRIPTIONS & OFFERS TAB (13.15, 13.16) */}
          {activeTab === "subs" &&
          <div className="space-y-6">
              
              {/* Premium tier options comparison */}
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{isArabic ? "ترقية الهوية: باقات Anime Black المميزة" : "Anime Black Premium Memberships"}</h3>
                <p className="text-[10px] text-zinc-400">
                  {isArabic ?
                "اختر الباقة المناسبة لتجربتك وأطلق العنان لإطارات الأفاتار المذهلة، ومساحات المخزن، وأيقونات الملف الفاخرة." :
                "Upgrade to gain instant prestige badges, exclusive profile aura animations, and premium market benefits."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                {SUBSCRIPTION_PLANS.map((plan, _autoIdx) => {
                const isCurrent = currentUser.role === "PremiumBlack" && plan.id === "plus";
                return (
                  <div key={`${plan.id}_${_autoIdx}`} className={`bg-gradient-to-b ${plan.color} border rounded-2xl p-4 flex flex-col justify-between space-y-5 shadow-lg`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-black/40 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {plan.badge}
                          </span>
                          {isCurrent &&
                        <span className="bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <Check className="w-2.5 h-2.5" />
                              {isArabic ? "نشط" : "ACTIVE"}
                            </span>
                        }
                        </div>

                        <div>
                          <span className="block text-xs font-black text-white">{isArabic ? plan.nameAr : plan.nameEn}</span>
                          <span className="block text-sm font-black mt-1 font-mono text-white">{isArabic ? plan.priceAr : plan.priceEn}</span>
                        </div>

                        <div className="w-full h-px bg-zinc-800/60" />

                        <ul className="space-y-1.5">
                          {(isArabic ? plan.featuresAr : plan.featuresEn).map((feat, idx) =>
                        <li key={idx} className="text-[10px] text-zinc-300 flex items-start gap-1.5 leading-snug">
                              <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                              <span>{feat}</span>
                            </li>
                        )}
                        </ul>
                      </div>

                      <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={plan.id === "free" || isCurrent}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      plan.id === "free" ?
                      "bg-zinc-900 text-zinc-500 cursor-default" :
                      isCurrent ?
                      "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20" :
                      "bg-white hover:bg-zinc-200 text-black shadow-lg"}`
                      }>
                      
                        {plan.id === "free" ?
                      isArabic ? "الباقة الأساسية مفعلة" : "Default Tier" :
                      isCurrent ?
                      isArabic ? "تم التفعيل بنجاح" : "Your Active Tier" :
                      isArabic ? "ترقية الآن" : "Subscribe Now"}
                      </button>
                    </div>);

              })}
              </div>

              {/* Secure payment cards gateway */}
              <div className="bg-[#0C0C0F] border border-zinc-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-black text-white">{isArabic ? "شحن رصيد المحفظة المباشر" : "Direct Coin & Stars Purchasing Gateway"}</h4>
                    <p className="text-[10px] text-zinc-400">
                      {isArabic ? "اشحن رصيد حسابك فورا من خلال بوابات الدفع الآمنة المتكاملة" : "Top up your secure digital wallet with Black Coins or Stars instantly"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                { id: "pkg_1", name: "Bronze Pouch", value: 300, price: "$2.99", stars: false, bonus: "+20 Coins" },
                { id: "pkg_2", name: "Silver Chest", value: 1000, price: "$8.99", stars: false, bonus: "+100 Coins" },
                { id: "pkg_3", name: "Star Dust Pack", value: 50, price: "$4.99", stars: true, bonus: "VIP Aura" }].
                map((pkg, _autoIdx) =>
                <button
                  key={`${pkg.id}_${_autoIdx}`}
                  onClick={() => {
                    setSelectedCoinsPackage(pkg);
                    setShowCoinPurchasePortal(true);
                    if (playSynthSound) playSynthSound("levelup");
                  }}
                  className="bg-black/40 hover:bg-black/80 border border-zinc-850 hover:border-zinc-700 p-4 rounded-xl text-center space-y-2 transition-all cursor-pointer block">
                  
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-black font-mono">
                        {pkg.bonus}
                      </span>
                      <span className="block text-xs font-black text-white">{pkg.name}</span>
                      <span className="block text-sm font-black text-amber-500 font-mono">
                        +{pkg.value} {pkg.stars ? "Stars" : "Coins"}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-semibold">{pkg.price}</span>
                    </button>
                )}
                </div>
              </div>

            </div>
          }

          {/* 6. FINANCIAL LOGS & QUESTS (13.19) */}
          {activeTab === "stats" &&
          <div className="space-y-6">
              
              {/* Store active quests */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  {isArabic ? "مهام متجر الأوتامكو الفعالة" : "Active Store Quests & Bounty Board"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {storeQuests.map((q, _autoIdx) =>
                <div key={`${q.id}_${_autoIdx}`} className="bg-[#0C0C0F] border border-zinc-850 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] bg-red-950 text-[#FF3D00] font-black px-1.5 py-0.5 rounded uppercase">
                          {isArabic ? "مكافأة مادية" : "Bounty"}
                        </span>
                        <span className="text-xs font-black text-amber-500 font-mono">{q.reward}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-white">{isArabic ? q.nameAr : q.nameEn}</span>
                        {/* Progress bar */}
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                            <span>Progress</span>
                            <span>{q.progress} / {q.target}</span>
                          </div>
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                            <div
                          style={{ width: `${q.progress / q.target * 100}%` }}
                          className="bg-red-500 h-full rounded-full" />
                        
                          </div>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>

              {/* Transactions log table */}
              <div className="bg-[#0C0C0F] border border-zinc-850 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  {isArabic ? "سجل المعاملات والعمليات المحمي" : "Transaction Audit Log & Statement"}
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium text-zinc-400 border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">{isArabic ? "العملية" : "Transaction Action"}</th>
                        <th className="py-2.5 px-3">{isArabic ? "التاريخ" : "Timestamp"}</th>
                        <th className="py-2.5 px-3 text-right">{isArabic ? "الأثر المالي" : "Amount Change"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 font-mono">
                      {transactionLogs.map((log, _autoIdx) =>
                    <tr key={`${log.id}_${_autoIdx}`} className="hover:bg-black/30">
                          <td className="py-2.5 px-3 text-white font-bold">
                            {isArabic ? log.actionAr : log.actionEn}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-500 text-[10px]">
                            {log.date}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-black ${
                      log.cost.startsWith("-") ? "text-red-500" : "text-emerald-500"}`
                      }>
                            {log.cost}
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          }

        </div>

      </div>

      {/* 🌟 LOOTBOX GACHA SPINNER OPENER OVERLAY MODAL (13.18) */}
      {selectedChestToOpen &&
      <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F13] border border-zinc-800 rounded-2xl p-6 text-center space-y-6 shadow-2xl relative">
            
            <div className="space-y-1">
              <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                GACHA UNBOXING PROTOCOL
              </span>
              <h3 className="text-sm font-black text-white">
                {isArabic ? "فتح صندوق الأساطير الحصري" : "Unboxing Legendary Vault Container"}
              </h3>
            </div>

            {/* Spinner Wheel / Box shake animation */}
            <div className="relative py-10 flex items-center justify-center">
              {isOpeningChest ?
            <div className="space-y-4">
                  {/* Rotating visual light ray circle */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                  
                  <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-2 border-amber-300 animate-bounce">
                    📦
                  </div>
                  <span className="block text-xs font-black text-amber-500 animate-pulse uppercase tracking-widest font-mono">
                    {isArabic ? "جاري فك تشفير الضمان الرقمي..." : "Decrypting Digital Assets..."}
                  </span>
                </div> :

            chestOpenedReward &&
            <div className="space-y-4 animate-scale-up">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/30 to-amber-500/30 rounded-full blur-3xl" />
                    
                    <div className="relative w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-5xl shadow-2xl mx-auto ring-4 ring-amber-500/40">
                      {chestOpenedReward.image}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-amber-400 font-mono tracking-widest block uppercase">
                        {chestOpenedReward.rarity} REWARD RECEIVED
                      </span>
                      <h4 className="text-xs font-black text-white">
                        {isArabic ? chestOpenedReward.nameAr : chestOpenedReward.nameEn}
                      </h4>
                      <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                        {isArabic ? chestOpenedReward.descAr : chestOpenedReward.descEn}
                      </p>
                    </div>
                  </div>

            }
            </div>

            {/* Actions button */}
            {!isOpeningChest && chestOpenedReward &&
          <button
            onClick={() => {
              setSelectedChestToOpen(null);
              setChestOpenedReward(null);
              if (playSynthSound) playSynthSound("levelup");
            }}
            className="w-full bg-[#FF3D00] hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl transition-all">
            
                🎉 {isArabic ? "تأكيد واستلام العنصر" : "Equip / Add to My Inventory"}
              </button>
          }

          </div>
        </div>
      }

      {/* 🌟 ITEM INTERACTIVE OPTIONS BOTTOMSHEET / MENU (13.8) */}
      {showItemActionMenu && selectedInvItem &&
      <div className="fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-sm bg-[#0E0E12] border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-start pb-2 border-b border-zinc-900">
              <div className="flex gap-2.5 items-center">
                <span className="text-2xl p-1 bg-black/40 rounded-lg">{selectedInvItem.image}</span>
                <div>
                  <h3 className="text-xs font-black text-white">
                    {isArabic ? selectedInvItem.nameAr : selectedInvItem.nameEn}
                  </h3>
                  <span className="text-[8px] text-zinc-500 block font-mono">
                    UID: {selectedInvItem.assetId || "AB-ESC-82910"}
                  </span>
                </div>
              </div>

              <button
              onClick={() => {
                setShowItemActionMenu(false);
                setSelectedInvItem(null);
              }}
              className="text-zinc-500 hover:text-white p-1">
              
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal">
              {isArabic ? selectedInvItem.descAr : selectedInvItem.descEn}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {selectedInvItem.category === "chest" ?
            <button
              onClick={() => handleOpenGachaChest(selectedInvItem)}
              className="col-span-2 bg-[#FF3D00] hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl text-center cursor-pointer block">
              
                  📦 {isArabic ? "فتح الصندوق العشوائي" : "Unbox Vault Gacha"}
                </button> :

            <button
              onClick={() => handleEquipItem(selectedInvItem)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black py-2 rounded-xl transition-all">
              
                  ✨ {selectedInvItem.equipped ? isArabic ? "إلغاء التجهيز" : "Unequip Style" : isArabic ? "تجهيز المظهر" : "Equip Style"}
                </button>
            }

              <button
              onClick={() => {
                setGiftingStep("select");
                setGiftRecipient("");
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black py-2 rounded-xl">
              
                🎁 {isArabic ? "إهداء لصديق" : "Gift to Friend"}
              </button>

              {selectedInvItem.sellable &&
            <button
              onClick={() => {
                setSelectedInvItemToSell(selectedInvItem);
                setShowMarketplaceListForm(true);
                setShowItemActionMenu(false);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black py-2 rounded-xl">
              
                  💰 {isArabic ? "عرض للبيع بالسوق" : "List on Market"}
                </button>
            }

              <button
              onClick={() => {
                if (triggerInAppNotification) {
                  triggerInAppNotification(
                    isArabic ? "معاينة الملف الشخصي" : "Dynamic Profile Preview",
                    isArabic ? "تم محاكاة تطبيق العنصر على صورتك الشخصية لمعاينتها." : "Simulated active display preview of asset on identity page.",
                    "info"
                  );
                }
                setShowItemActionMenu(false);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black py-2 rounded-xl">
              
                👁️ {isArabic ? "معاينة الملف" : "Preview Aura"}
              </button>
            </div>

            {/* Gifting drawer panel inside bottom sheet */}
            {giftingStep === "select" &&
          <div className="pt-3 border-t border-zinc-900 space-y-3">
                <span className="block text-[9px] text-zinc-400 font-bold uppercase">{isArabic ? "إرسال هدية رقمية مضمونة" : "Enter Gift Recipient"}</span>
                <input
              type="text"
              placeholder={isArabic ? "اسم المستخدم (مثال: Zoro_99)" : "Username (e.g., Zoro_99)"}
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500" />
            

                {/* Anonymous gifting checkbox (13.17 / Extra) */}
                <div className="flex items-center gap-2">
                  <input
                type="checkbox"
                id="anon_gift"
                checked={isAnonymousGift}
                onChange={(e) => setIsAnonymousGift(e.target.checked)}
                className="rounded border-zinc-800 bg-black text-red-500 focus:ring-red-500" />
              
                  <label htmlFor="anon_gift" className="text-[10px] text-zinc-400 select-none cursor-pointer">
                    🎁 {isArabic ? "إرسال كهدية مجهولة الهوية" : "Send anonymously as a secret gift"}
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                onClick={handleGiftItemAction}
                disabled={!giftRecipient}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-2 rounded-xl disabled:opacity-50">
                
                    🚀 {isArabic ? "تأكيد وإرسال" : "Confirm & Send Gift"}
                  </button>
                  <button
                onClick={() => setGiftingStep(null)}
                className="bg-zinc-900 text-zinc-400 px-3 py-2 rounded-xl text-[10px]">
                
                    Cancel
                  </button>
                </div>
              </div>
          }

            {giftingStep === "success" &&
          <div className="pt-3 border-t border-zinc-900 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  ✓
                </div>
                <span className="block text-xs font-black text-white">{isArabic ? "تم الإرسال بأمان" : "Gift Delivered!"}</span>
                <button
              onClick={() => {
                setShowItemActionMenu(false);
                setSelectedInvItem(null);
                setGiftingStep(null);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black px-4 py-1.5 rounded-lg">
              
                  OK
                </button>
              </div>
          }

          </div>
        </div>
      }

      {/* 🌟 USER MARKETPLACE NEW LISTING FORM MODAL */}
      {showMarketplaceListForm &&
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F13] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#FF3D00]" />
                {isArabic ? "إنشاء عرض بيع أو مزاد جديد" : "Create Marketplace Escrow Listing"}
              </h3>
              <button onClick={() => setShowMarketplaceListForm(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Select element from inventory */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "اختر مادة من مخزنك الشخصي" : "Select Item From Your Inventory"}</label>
                <select
                value={selectedInvItemToSell?.id || ""}
                onChange={(e) => {
                  const found = inventory.find((i) => i.id === e.target.value);
                  setSelectedInvItemToSell(found || null);
                }}
                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white">
                
                  <option value="">-- {isArabic ? "اختر العنصر" : "Select Item"} --</option>
                  {inventory.
                filter((item) => item.sellable).
                map((item, _autoIdx) =>
                <option key={`${item.id}_${_autoIdx}`} value={item.id}>
                        {item.image} {isArabic ? item.nameAr : item.nameEn} ({item.rarity})
                      </option>
                )}
                </select>
              </div>

              {/* Listing type */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "طريقة التبادل أو البيع" : "Exchange / Trade Mode"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                { id: "direct", labelAr: "بيع مباشر", labelEn: "Direct Buy" },
                { id: "auction", labelAr: "مزاد علني", labelEn: "Auction" },
                { id: "swap", labelAr: "مقايضة فقط", labelEn: "Swap Only" }].
                map((mode, _autoIdx) =>
                <button
                  key={`${mode.id}_${_autoIdx}`}
                  type="button"
                  onClick={() => setListFormType(mode.id as any)}
                  className={`py-2 px-1.5 rounded-xl text-[9px] font-black border transition-all ${
                  listFormType === mode.id ?
                  "bg-[#FF3D00]/10 border-[#FF3D00] text-white" :
                  "bg-black border-zinc-850 text-zinc-400"}`
                  }>
                  
                      {isArabic ? mode.labelAr : mode.labelEn}
                    </button>
                )}
                </div>
              </div>

              {/* Price / Swap requirement input */}
              {listFormType === "swap" ?
            <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "العنصر المطلوب مبادلته" : "Required Target Swap Item"}</label>
                  <input
                type="text"
                placeholder="e.g. Zoro Sword Card / Gold Aura Frame"
                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500" />
              
                </div> :

            <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-400">{isArabic ? "سعر البيع (عملات سوداء)" : "Listing Price (Black Coins)"}</label>
                  <input
                type="number"
                value={listFormPrice}
                onChange={(e) => setListFormPrice(parseInt(e.target.value) || 50)}
                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono" />
              
                </div>
            }

              {/* Escrow Disclaimer */}
              <div className="bg-emerald-950/10 border border-emerald-500/10 p-3 rounded-xl flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-zinc-400 leading-normal">
                  {isArabic ?
                "عند النشر، سيتم سحب العنصر من مخزنك الخاص ووضعه في ضمان الوساطة (Escrow) المفتوح لضمان العدالة والأمان الكاملين." :
                "Enforcing Escrow: This item will be transferred to platform storage custody. You will receive coins directly upon instant checkout completion."}
                </p>
              </div>

              <button
              onClick={handlePublishMarketplaceListing}
              disabled={!selectedInvItemToSell}
              className="w-full bg-[#FF3D00] hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl disabled:opacity-50 cursor-pointer">
              
                🚀 {isArabic ? "نشر العرض وتفعيل الضمان" : "Publish Listing & Enable Escrow"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* 🌟 COINS TOP UP PAYMENT GATEWAY MODAL (13.16) */}
      {showCoinPurchasePortal &&
      <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0F0F13] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl text-center">
            
            <div className="space-y-1">
              <span className="text-[9px] bg-sky-600 text-white font-black px-2 py-0.5 rounded tracking-widest uppercase">
                SECURE 3D PAYMENT SYSTEM
              </span>
              <h3 className="text-xs font-black text-white">
                {isArabic ? "بوابة الشراء والفوترة الرقمية" : "In-App Billing Portal (Google Play/Apple/Card)"}
              </h3>
            </div>

            {isPayingSimulated ?
          <div className="py-12 space-y-4">
                <RotateCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                <span className="block text-xs font-black text-amber-500 animate-pulse">
                  {isArabic ? "جاري التحقق من أمان بوابة الدفع..." : "Authorizing secure credentials with visa server..."}
                </span>
              </div> :

          <div className="space-y-4 pt-3">
                {/* Billing packages list */}
                <div className="space-y-2">
                  {[
              { id: "coin_1", name: "300 Black Coins", price: "$2.99", value: 300, stars: false },
              { id: "coin_2", name: "1000 Black Coins", price: "$8.99", value: 1000, stars: false },
              { id: "star_1", name: "50 Stars Pack", price: "$4.99", value: 50, stars: true }].
              map((pkg, _autoIdx) =>
              <button
                key={`${pkg.id}_${_autoIdx}`}
                onClick={() => handleInitiateCoinPurchase(pkg)}
                className="w-full bg-black hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 p-3 rounded-xl flex justify-between items-center transition-all text-left">
                
                      <div className="flex items-center gap-2">
                        {pkg.stars ? <Star className="w-4 h-4 text-sky-400 fill-sky-400" /> : <Coins className="w-4 h-4 text-amber-500" />}
                        <span className="text-xs font-black text-white">{pkg.name}</span>
                      </div>
                      <span className="text-xs font-black text-amber-500 font-mono">{pkg.price}</span>
                    </button>
              )}
                </div>

                <p className="text-[9px] text-zinc-500 leading-normal">
                  {isArabic ?
              "بوابة الدفع مؤمنة بتشفير 256-bit بالكامل لمنع الاحتيال والمخاطر السيبرانية." :
              "Payment processed in sandbox simulation mode. Fully compliant with direct micro-transactions policy."}
                </p>

                <button
              onClick={() => setShowCoinPurchasePortal(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-black py-2 rounded-xl border border-zinc-850">
              
                  {isArabic ? "إلغاء العملية" : "Cancel Checkout"}
                </button>
              </div>
          }

          </div>
        </div>
      }

      {/* 🌟 EXTRA: SAFE MULTI-PARTY SWAP PRESET (13.20/Extra) */}
      {showMultiPartySwap &&
      <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F13] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                {isArabic ? "تبادل مقايضة آمن متعدد الأطراف" : "Secure Multi-Party Collaborative Swap"}
              </h3>
              <button onClick={() => setShowMultiPartySwap(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <span className="block text-[9px] text-zinc-400 font-bold uppercase">{isArabic ? "شركاء المبادلة في المجموعات" : "Active Swap Group Partners"}</span>
              
              <div className="flex gap-2">
                {multiSwapPartners.map((partner, pIdx) =>
              <div key={pIdx} className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 flex items-center gap-2">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-mono text-zinc-300">{partner}</span>
                  </div>
              )}
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[9px] font-black text-zinc-400 uppercase">{isArabic ? "عرضك المقترح للتبادل" : "Your Proposal (Item + Coins)"}</label>
                <input
                type="text"
                placeholder="e.g. My Zoro Card + 200 Coins"
                value={multiSwapOffer}
                onChange={(e) => setMultiSwapOffer(e.target.value)}
                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              
              </div>

              <div className="bg-[#121215] border border-zinc-900 p-3 rounded-xl space-y-1 text-[9px] text-zinc-400">
                <span className="block font-bold text-white mb-1">Collaborative Escrow Rules:</span>
                <p>1. The swap will execute simultaneously only if all parties agree.</p>
                <p>2. Failure of any party to accept in 15 minutes triggers automatic refund.</p>
              </div>

              <button
              onClick={() => {
                if (triggerInAppNotification) {
                  triggerInAppNotification(
                    isArabic ? "تم إرسال المقايضة الجماعية" : "Multi-party Proposal Broadcasted",
                    isArabic ? "تم إرسال مقترحك لجميع الأطراف تحت مظلة الوساطة الآمنة." : "Proposal submitted into collaborative escrow waiting for confirmations.",
                    "success"
                  );
                }
                setShowMultiPartySwap(false);
                if (playSynthSound) playSynthSound("levelup");
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2 rounded-xl">
              
                🚀 {isArabic ? "تأثير وإرسال طلب المقايضة" : "Broadcast Collaborative Swap"}
              </button>
            </div>
          </div>
        </div>
      }

    </div>);

}