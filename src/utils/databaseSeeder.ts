import { collection, getDocs, doc, setDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const INITIAL_COMMUNITIES = [
  {
    id: "c1",
    name: "رابطة الأوتاكو العرب",
    username: "arab_otaku",
    avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop",
    description: "المجتمع الرسمي الأول للأوتاكو في الوطن العربي لمناقشة آخر فصول المانجا وحلقات الأنمي الأسبوعية.",
    type: "group",
    category: "مجتمع أنمي",
    membersCount: 14205,
    level: 12,
    xp: 450,
    tags: ["Otaku", "Anime", "Manga", "Discussion"],
    privacy: "public",
    joiningFee: 0,
    creator: "mora_admin",
    isJoined: true,
    themeColor: "#FF3D00",
    verified: true
  },
  {
    id: "c2",
    name: "بث أخبار المانجا والأنمي",
    username: "otaku_news_hub",
    avatar: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    description: "قناة رسمية لنشر الأخبار الحصرية، ومواعيد صدور فصول مانجا هجوم العمالقة، ون بيس، وجوجوتسو كايسن.",
    type: "channel",
    category: "مجتمع أخبار",
    membersCount: 8900,
    level: 8,
    xp: 210,
    tags: ["News", "Leaks", "Exclusive"],
    privacy: "public",
    joiningFee: 0,
    creator: "editor_black",
    isJoined: false,
    themeColor: "#3B82F6",
    verified: true
  }
];

const ANIME_PROFILES = [
  { uid: "gemini_bot", name: "مساعد الذكاء الاصطناعي الذكي 🤖", username: "gemini_bot", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150", role: "AI" },
  { uid: "luffy_gear5", name: "مونكي دي لوفي 👒", username: "luffy_gear5", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150", role: "Member" },
  { uid: "gojo_sixeyes", name: "غوجو ساتورو 🔮", username: "gojo_sixeyes", avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150", role: "Member" },
  { uid: "mikasa_ack", name: "ميكاسا أكرمان 🧣", username: "mikasa_ack", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", role: "Member" },
  { uid: "zoro_swords", name: "رورونوا زورو ⚔️", username: "zoro_swords", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", role: "Member" },
  { uid: "sukuna_curse", name: "ريومن سوكونا 🔥", username: "sukuna_curse", avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150", role: "Member" }
];

const INITIAL_POSTS = [
  {
    content: "يا جماعة، فصل ون بيس الأخير حماااااس! لوفي استعمل الجير الخامس بطريقة مجنونة 🤯🔥",
    authorId: "luffy_gear5",
    authorName: "مونكي دي لوفي 👒",
    authorAvatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150",
    likes: 1254,
    commentsCount: 320,
    shares: 45,
    createdAt: new Date().toISOString(),
    tags: ["ون_بيس", "لوفي"],
    isSpoiler: true
  },
  {
    content: "لا تقلقوا، أنا الأقوى. 🤞",
    authorId: "gojo_sixeyes",
    authorName: "غوجو ساتورو 🔮",
    authorAvatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150",
    likes: 9999,
    commentsCount: 1020,
    shares: 500,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ["JujutsuKaisen", "Gojo"],
    isSpoiler: false
  }
];

export const seedDatabase = async () => {
  try {
    const communitiesSnap = await getDocs(collection(db, "communities"));
    if (communitiesSnap.empty) {
      console.log("Seeding communities...");
      for (const comm of INITIAL_COMMUNITIES) {
        await setDoc(doc(db, "communities", comm.id), comm);
      }
    }

    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty || usersSnap.size < 5) {
      console.log("Seeding bots to users...");
      for (const bot of ANIME_PROFILES) {
        await setDoc(doc(db, "users", bot.uid), bot, { merge: true });
      }
    }

    const postsSnap = await getDocs(collection(db, "posts"));
    if (postsSnap.empty) {
      console.log("Seeding posts...");
      for (const post of INITIAL_POSTS) {
        await addDoc(collection(db, "posts"), post);
      }
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};
