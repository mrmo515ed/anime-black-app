/**
 * localServer.ts — "The server, inside the APK"
 * -----------------------------------------------
 * A faithful, client-side port of the Anime Black backend (server.ts).
 * When the app runs inside the Android APK (loaded from file://) there is no
 * Node.js server, so this module transparently intercepts the app's `/api/*`
 * fetch() calls and serves them locally:
 *
 *   • In-memory social DB (posts, stories, reels, chats, notifications)
 *     seeded with the same data as server.ts and persisted to localStorage.
 *   • All CRUD endpoints (posts, likes, comments, polls, stories, reels,
 *     chats, notifications, admin stats, link preview, apk status).
 *   • Gemini AI endpoints (write-post, summarize, translate, proofread,
 *     moderate, smart-replies, character-chat, chat-search,
 *     search-suggestions, analyze-image, generate-image) via the Gemini REST
 *     API using a user-provided key from localStorage.
 *
 * Nothing here is deleted from the app — it only adds the backend so the app
 * is fully functional standalone/offline.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const STORAGE_KEY = "animeblack_local_db_v1";

/* ------------------------------------------------------------------ *
 *  Seed database (mirrors server.ts DB)
 * ------------------------------------------------------------------ */

interface DBShape {
  posts: any[];
  stories: any[];
  reels: any[];
  chats: any[];
  notifications: any[];
  reports: any[];
}

function seedDB(): DBShape {
  const now = Date.now();
  return {
    posts: [
      {
        id: "1",
        author: {
          name: "كين أوتشيها",
          username: "ken_uchiha",
          avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150",
          isVerified: true,
        },
        content:
          "أخيراً! أعلن استوديو MAPPA رسمياً عن تكملة أنمي Chainsaw Man بفيلم سينمائي ضخم يغطي آرك Reze (فتحة القنبلة). الرسم المبدئي يبدو مذهلاً والتحريك واعد جداً! ما هي توقعاتكم للفيلم؟ 🔥🎬 #chainsawman #anime_news #mappa",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
        video: null,
        likes: 1240,
        hasLiked: false,
        comments: [
          { id: "c1", author: "Yuki", text: "أنا متحمس جداً! آرك ريزي هو المفضل لدي في المانجا 🍿" },
          { id: "c2", author: "Zoro_3", text: "أتمنى ألا يكون هناك اختصار للأحداث." },
        ],
        poll: null,
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "2",
        author: {
          name: "أوتاكو سينسي",
          username: "otaku_sensei",
          avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150",
          isVerified: true,
        },
        content:
          "تصويت سريع لعشاق أنمي Shingeki no Kyojin (هجوم العمالقة): من هي الشخصية الأكثر تأثيراً في مسار القصة برأيكم؟ هل هو إيرين بطموحه المطلق، أم ليفاي بقوته وولائه، أم إروين بذكائه وقيادته الفذة؟ شاركوا برأيكم في الاستطلاع بالأسفل! 👇",
        image: null,
        video: null,
        likes: 852,
        hasLiked: false,
        comments: [],
        poll: {
          question: "الشخصية الأكثر تأثيراً في هجوم العمالقة؟",
          options: [
            { text: "إيرين ييغر (Eren)", votes: 450 },
            { text: "ليفاي أكرمان (Levi)", votes: 320 },
            { text: "إروين سميث (Erwin)", votes: 512 },
          ],
          totalVotes: 1282,
          userVotedIndex: null,
        },
        createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      },
      {
        id: "3",
        author: {
          name: "رينكا تشان",
          username: "rinka_chan",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
          isVerified: false,
        },
        content:
          "رسمة رقمية جديدة لشخصية ميكاسا من رسمي المتواضع! استغرقت مني حوالي 8 ساعات عمل على Procreate. أتمنى أن تنال إعجابكم! 🎨✨💖",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
        video: null,
        likes: 310,
        hasLiked: false,
        comments: [{ id: "c3", author: "Kira", text: "رائعة جداً! التلوين والظلال خرافية 😍" }],
        poll: null,
        createdAt: new Date(now - 1000 * 60 * 360).toISOString(),
      },
    ],
    stories: [
      {
        id: "s_admin",
        author: { name: "إمبراطور أنمي بلاك (الإدارة)", avatar: "https://images.unsplash.com/photo-1578574515313-241881a377b4?w=150", username: "system_emperor" },
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
        views: 1242,
        question: "ما رأيكم بالتحديث الإمبراطوري الشامل اليوم؟",
        poll: null,
        storyType: "qa",
        entityType: "admin",
        entityName: "الإدارة العامة",
        themeFrame: "red-dragon",
        animeEffect: "sharingan",
        stickers: ["👑", "🔥", "🛡️"],
        allowReplies: true,
        allowShare: true,
        xpReward: 15,
        coinReward: 5,
      },
      {
        id: "s_guild",
        author: { name: "القائد لولوش", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", username: "lelouch_zero" },
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
        views: 840,
        question: null,
        poll: { question: "هل نعلن التحالف مع نقابة السيوف المشتعلة اليوم؟", options: ["نعم، تحالف قوي", "لا، نواصل بمفردنا", "التصويت لاحقاً"], votes: [120, 45, 10] },
        storyType: "poll",
        entityType: "guild",
        entityName: "نقابة الفرسان السود / Black Knights",
        themeFrame: "purple-susanoo",
        animeEffect: "ki-aura",
        stickers: ["⚔️", "🔥"],
        allowReplies: true,
        allowShare: false,
        xpReward: 10,
        coinReward: 3,
      },
      {
        id: "s_space",
        author: { name: "كاكاشي سينسي", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", username: "kakashi_copy_ninja" },
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
        views: 654,
        question: null,
        poll: null,
        storyType: "character_card",
        entityType: "space",
        entityName: "عالم ناروتو شيبودن",
        themeFrame: "cherry-blossom",
        animeEffect: "sakura-leaves",
        characterCardId: "c_naruto",
        characterCardName: "Uzumaki Naruto (Sage Mode)",
        characterCardImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
        stickers: ["🍥", "🦊"],
        allowReplies: true,
        allowShare: true,
        xpReward: 8,
        coinReward: 2,
      },
      {
        id: "s_friend",
        author: { name: "أوتاكو سينسي", avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150", username: "otaku_sensei" },
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
        views: 312,
        question: null,
        poll: null,
        storyType: "music",
        entityType: "friend",
        entityName: "أصدقاء مقربون",
        themeFrame: "neon-cyberspace",
        animeEffect: "glitch",
        musicTitle: "Gurenge (Demon Slayer OP)",
        musicArtist: "LiSA",
        stickers: ["🎵", "🎧"],
        allowReplies: true,
        allowShare: true,
      },
      {
        id: "s_group",
        author: { name: "رورونوا زورو", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150", username: "zoro_swordsman" },
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        views: 450,
        question: "من يمتلك أفضل قتال بالسيوف في الأنمي؟",
        poll: null,
        storyType: "qa",
        entityType: "group",
        entityName: "قراصنة قبعة القش",
        themeFrame: "none",
        animeEffect: "lightning",
        stickers: ["⚔️", "💥"],
        allowReplies: true,
        allowShare: true,
        xpReward: 5,
      },
    ],
    reels: [
      {
        id: "r1",
        title: "أقوى قتال في أنمي Demon Slayer - تلوين رائع وسرعة خيالية ⚔️✨",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-glowing-neon-light-tube-40507-large.mp4",
        author: { name: "فيلق الاستطلاع", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", username: "survey_corps" },
        likes: 4520,
        commentsCount: 184,
        shares: 320,
        hasLiked: false,
      },
      {
        id: "r2",
        title: "أجواء طوكيو في الليل بأسلوب السايبربانك والأنمي 🌌🗼",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-futuristic-neon-lit-city-at-night-44331-large.mp4",
        author: { name: "رينكا تشان", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", username: "rinka_chan" },
        likes: 2190,
        commentsCount: 95,
        shares: 110,
        hasLiked: false,
      },
    ],
    chats: [
      {
        id: "ai_bot",
        name: "مساعد الذكاء الاصطناعي (Anime AI)",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
        type: "ai",
        lastSeen: "نشط الآن",
        isOnline: true,
        messages: [
          {
            id: "m1",
            sender: "ai",
            text: "مرحباً بك في أنمي بلاك! أنا مساعدك الشخصي المدعوم بالذكاء الاصطناعي من Google Gemini. يمكنني مساعدتك في تلخيص الحلقات، اقتراح أنميات جديدة، كتابة منشورات إبداعية، أو حتى ترجمة النصوص فورياً. كيف يمكنني مساعدتك اليوم؟ 🤖✨",
            timestamp: new Date().toISOString(),
          },
        ],
      },
      {
        id: "g1",
        name: "مجموعه نقاشات ون بيس الكبرى 🏴‍☠️👑",
        avatar: "https://images.unsplash.com/photo-1559863040-5471c130327f?w=150",
        type: "group",
        isOnline: true,
        lastSeen: "12 عضو نشط",
        messages: [
          { id: "gm1", sender: "ken_uchiha", senderName: "كين أوتشيها", text: "هل تعتقدون أن آرك اللحاف الأحمر سينتهي في هذا الفصل؟", timestamp: new Date(now - 1000 * 60 * 15).toISOString() },
          { id: "gm2", sender: "otaku_sensei", senderName: "أوتاكو سينسي", text: "أتوقع أن يمتد لـ 5 فصول أخرى، الأحداث ما زالت في ذروتها!", timestamp: new Date(now - 1000 * 60 * 10).toISOString() },
        ],
      },
      {
        id: "ch1",
        name: "قناة أخبار الأنمي الرسمية 📢🍿",
        avatar: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=150",
        type: "channel",
        isOnline: false,
        lastSeen: "8,450 مشترك",
        messages: [
          { id: "cm1", sender: "admin", senderName: "الإدارة", text: "تنبيه: سيتم إطلاق العرض الترويجي الأول للعبة الأنمي المنتظرة الأسبوع المقبل!", timestamp: new Date(now - 1000 * 60 * 120).toISOString() },
        ],
      },
    ],
    notifications: [
      { id: "n1", type: "like", text: "أعجب كين أوتشيها بمنشورك الأخير.", time: "منذ ٥ دقائق", read: false },
      { id: "n2", type: "comment", text: "علق أوتاكو سينسي على منشورك: 'عمل رائع جداً ومبدع!'", time: "منذ ١٥ دقيقة", read: false },
      { id: "n3", type: "follow", text: "بدأ رينكا تشان في متابعتك.", time: "منذ ساعة", read: true },
      { id: "n4", type: "mention", text: "ذكرك كين أوتشيها في تعليق داخل مجموعة نقاشات ون بيس.", time: "منذ ساعتين", read: true },
    ],
    reports: [{ id: "r_1", reporter: "Yuki", targetType: "post", targetId: "3", reason: "محتوى غير لائق", status: "معلق" }],
  };
}

/* ------------------------------------------------------------------ *
 *  Persistence
 * ------------------------------------------------------------------ */

let DB: DBShape = seedDB();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
  } catch {
    /* ignore quota / unavailable storage */
  }
}

function loadDB(): DBShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.posts) && Array.isArray(parsed.stories)) {
        return parsed as DBShape;
      }
    }
  } catch {
    /* fall through to seed */
  }
  const seeded = seedDB();
  DB = seeded;
  persist();
  return seeded;
}

/* ------------------------------------------------------------------ *
 *  Gemini AI helper (REST API, uses a key from localStorage)
 * ------------------------------------------------------------------ */

function geminiKey(): string | null {
  const w = window as any;
  return (
    localStorage.getItem("gemini_api_key") ||
    localStorage.getItem("GEMINI_API_KEY") ||
    w.GEMINI_API_KEY ||
    null
  );
}

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

async function geminiGenerateContent(
  contents: any,
  opts: { systemInstruction?: string; temperature?: number; responseMimeType?: string; model?: string } = {},
): Promise<string> {
  const key = geminiKey();
  if (!key) {
    throw new Error(
      "لا يوجد مفتاح Gemini API. أضف مفتاحك عبر localStorage (gemini_api_key) لتفعيل ميزات الذكاء الاصطناعي.",
    );
  }
  const models = opts.model ? [opts.model] : GEMINI_MODELS;
  let lastErr: any = null;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const payload: any = {
        contents: [
          {
            role: "user",
            parts: typeof contents === "string" ? [{ text: contents }] : contents,
          },
        ],
        generationConfig: { temperature: opts.temperature ?? 0.7 },
      };
      if (opts.systemInstruction) payload.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
      if (opts.responseMimeType) payload.generationConfig.responseMimeType = opts.responseMimeType;
      const res = await nativeFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const text: string =
        (data?.candidates?.[0]?.content?.parts || [])
          .map((p: any) => p.text || "")
          .join("")
          .trim() || "";
      if (text) return text;
      lastErr = new Error(data?.error?.message || "Gemini returned an empty response");
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to call Gemini");
}

async function aiText(systemInstruction: string, prompt: string, opts: any = {}): Promise<{ result: string }> {
  const text = await geminiGenerateContent(prompt, { systemInstruction, ...opts });
  return { result: text };
}

async function aiJson(systemInstruction: string, prompt: string, fallback: any): Promise<any> {
  const text = await geminiGenerateContent(prompt, {
    systemInstruction,
    responseMimeType: "application/json",
    temperature: 0.3,
  });
  try {
    const cleaned = text.replace(/```(json)?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ *
 *  AI route handlers
 * ------------------------------------------------------------------ */

const AI_SYSTEM_PROMPTS: Record<string, string> = {
  "write-post": `You are a high-quality creative writer for an Otaku social media network called "Anime Black". Generate a captivating social media post in Arabic based on the user's prompt. Add relevant anime hashtags, emojis, and space the text beautifully for reading. Make it feel authentic to real anime communities. Do not output anything else than the post content itself.`,
  summarize: "تلخيص النص المدخل بأسلوب نقاط ذكية وواضحة جداً باللغة العربية. ركز على التفاصيل الأساسية والأنميات المذكورة.",
  translate: "Translate the provided text into natural, colloquial target language. Keep the tone friendly and preserve emojis or slang. Return only the translated text.",
  proofread: "Check the user text for spelling, typos, and grammar errors. Output ONLY the corrected text. If the input is perfect, return the input verbatim. Preserve emojis.",
  moderate: `You are an AI-powered content moderation system for the "Anime Black" social media app. Detect hate_speech, nudity, or spam. Reply with a valid JSON object matching: {"flagged": boolean, "category": "hate_speech"|"nudity"|"spam"|"safe", "confidence": number, "reasonEn": string, "reasonAr": string}. Be fair and objective. Output only the raw JSON.`,
  "chat-smart-replies": `You are a helper inside an anime direct chat app. Review the conversation and output EXACTLY three distinct short, natural, contextual quick response options in Arabic or English depending on the input language. Format the output as a valid JSON array of strings. Output only the raw JSON.`,
  "chat-search": `You are a search assistant for a chat history. Determine which of the messages are contextually related to the user's query. Format the output as a valid JSON array of message IDs. Output only the raw JSON.`,
  "search-suggestions": `You are an Otaku search helper. Analyze the user query. Provide: "corrected" (typo-corrected string or ""), "suggestions" (3 popular related anime/manga phrases), "related" (3 related keywords/characters). Output ONLY a JSON object in this exact format: {"corrected": "...", "suggestions": [...], "related": [...]}`,
  "character-chat-gemini_bot": `You are "مساعد الأوتـاكو الذكي 🤖" (Smart Otaku AI), a highly premium, wise, and helpful AI assistant inside the "Anime Black" social media network. Respond completely in fluent, engaging Arabic. Use anime references, quotes, and emojis naturally. Provide expert recommendations for anime and manga, explain character lore, help write posts, or just chat with the user. Keep formatting clean with markdown.`,
  "character-chat-luffy_gear5": `You are Monkey D. Luffy (Gear 5 mode) from One Piece. You are fun, extremely energetic, cartoonishly joyful, and completely obsessed with eating meat (لحم). Respond completely in Arabic in the character of Luffy! Use expressions like 'هاهاها!' and 'شيشيشي!' and talk about being the King of Pirates (ملك القراصنة) and your nakama. Keep replies lively!`,
  "character-chat-gojo_sixeyes": `You are Gojo Satoru from Jujutsu Kaisen. You are ultra-confident, playfully arrogant, charismatic, and the absolute strongest. Respond completely in Arabic in the character of Gojo! Use expressions like 'لا تقلق، أنا الأقوى!' and joke about how easy everything is. Mention sweets or mochi occasionally.`,
  "character-chat-mikasa_ack": `You are Mikasa Ackerman from Attack on Titan. You are calm, protective, exceptionally loyal, quiet, but deeply caring about Eren and your comrades. Respond completely in Arabic in the character of Mikasa. Keep replies cool, dedicated, and sincere.`,
  "character-chat-zoro_swords": `You are Roronoa Zoro from One Piece. You are cool, serious, silent, easily get lost (ضيعت طريقي), and love swords and training. Respond completely in Arabic as Zoro. Keep sentences short, tough, but friendly.`,
  "character-chat-sukuna_curse": `You are Ryomen Sukuna from Jujutsu Kaisen. You are the arrogant, menacing, majestic King of Curses. Respond completely in Arabic in the character of Sukuna. You look down on humans but enjoy interesting conversation. Keep your tone regal and terrifying.`,
};

async function handleAI(path: string, body: any): Promise<Response> {
  try {
    switch (path) {
      case "/api/ai/write-post": {
        const { prompt, tone } = body;
        if (!prompt) return json({ error: "Prompt is required" }, 400);
        const sys = AI_SYSTEM_PROMPTS["write-post"].replace("based on the user's prompt", `based on the user's prompt. The tone should be ${tone || "exciting and enthusiastic"}.`);
        const res = await aiText(sys, prompt, { temperature: 0.85 });
        return json(res);
      }
      case "/api/ai/summarize": {
        const { text } = body;
        if (!text) return json({ error: "Text to summarize is required" }, 400);
        return json(await aiText(AI_SYSTEM_PROMPTS.summarize, text, { temperature: 0.4 }));
      }
      case "/api/ai/translate": {
        const { text, targetLanguage } = body;
        if (!text) return json({ error: "Text to translate is required" }, 400);
        const target = targetLanguage === "en" ? "English" : "Arabic";
        const sys = AI_SYSTEM_PROMPTS.translate.replace("target language", target);
        return json(await aiText(sys, text, { temperature: 0.3 }));
      }
      case "/api/ai/proofread": {
        const { text } = body;
        if (!text) return json({ error: "Text is required" }, 400);
        return json(await aiText(AI_SYSTEM_PROMPTS.proofread, text, { temperature: 0.2 }));
      }
      case "/api/ai/moderate": {
        const { text, contentType } = body;
        if (!text || typeof text !== "string") return json({ error: "Text string is required" }, 400);
        const prompt = `Analyze the following ${contentType || "content"} text: "${text}"`;
        const fallback = { flagged: false, category: "safe", confidence: 1.0, reasonEn: "Safe content", reasonAr: "محتوى آمن" };
        const parsed = await aiJson(AI_SYSTEM_PROMPTS.moderate, prompt, fallback);
        return json({
          flagged: Boolean(parsed?.flagged),
          category: parsed?.category || "safe",
          confidence: typeof parsed?.confidence === "number" ? parsed.confidence : 1.0,
          reasonEn: parsed?.reasonEn || "No issues found.",
          reasonAr: parsed?.reasonAr || "لم يتم العثور على مشكلات.",
        });
      }
      case "/api/ai/chat-smart-replies": {
        const { messages } = body;
        if (!messages || !Array.isArray(messages)) return json({ error: "Messages array is required" }, 400);
        const recent = messages.slice(-5).map((m: any) => `${m.senderId === "me" ? "Me" : "Partner"}: ${m.text}`).join("\n");
        const prompt = `Review the conversation:\n${recent}\n\nProvide the 3 response options.`;
        const parsed = await aiJson(AI_SYSTEM_PROMPTS["chat-smart-replies"], prompt, ["فكرة رائعة!", "لم أشاهده بعد، هل هو حماسي؟", "بالتأكيد!"]);
        return json({ result: Array.isArray(parsed) ? parsed : ["مرحباً!", "كيف حالك؟", "أهلاً بك"] });
      }
      case "/api/ai/chat-search": {
        const { query, messages } = body;
        if (!query) return json({ error: "Query is required" }, 400);
        if (!messages || !Array.isArray(messages)) return json({ error: "Messages array is required" }, 400);
        const contents = `User Query: "${query}"\n\nChat Messages:\n${messages.map((m: any) => `ID: ${m.id} | ${m.senderName}: ${m.text}`).join("\n")}`;
        const parsed = await aiJson(AI_SYSTEM_PROMPTS["chat-search"], contents, []);
        return json({ result: Array.isArray(parsed) ? parsed : [] });
      }
      case "/api/ai/search-suggestions": {
        const { query, isArabic } = body;
        if (!query || query.trim().length < 2) return json({ corrected: "", suggestions: [], related: [] });
        const prompt = `Analyze query: "${query}" (Language preference: ${isArabic ? "Arabic" : "English"})`;
        const parsed = await aiJson(AI_SYSTEM_PROMPTS["search-suggestions"], prompt, { corrected: "", suggestions: [], related: [] });
        return json(parsed);
      }
      case "/api/ai/character-chat": {
        const { characterId, messages } = body;
        if (!characterId) return json({ error: "characterId is required" }, 400);
        const sys = AI_SYSTEM_PROMPTS[`character-chat-${characterId}`] || "You are an expert anime companion inside the Anime Black social media platform. Respond completely in Arabic.";
        const history = (messages || []).map((m: any) => `${m.senderId === characterId ? "Assistant" : "User"}: ${m.text}`).join("\n");
        return json(await aiText(sys, `${history}\nAssistant:`, { temperature: 0.85 }));
      }
      case "/api/ai/analyze-image": {
        const { image } = body;
        if (!image) return json({ error: "Image is required" }, 400);
        let base64Data = image;
        let mimeType = "image/jpeg";
        if (typeof image === "string" && image.startsWith("data:")) {
          const parts = image.split(",");
          base64Data = parts[1] || "";
          const mimePart = parts[0].match(/data:(.*?);/);
          if (mimePart) mimeType = mimePart[1];
        }
        const text = await geminiGenerateContent(
          [
            { text: "Analyze this anime/manga related image. Identify the anime/manga series, characters, styles, or objects shown. Provide 3 to 5 single-word keywords or short phrases. Return a JSON object with a single key 'keywords' containing an array of strings in both Arabic and English." },
            { inlineData: { data: base64Data, mimeType } },
          ],
          { responseMimeType: "application/json", temperature: 0.3 },
        );
        try {
          return json(JSON.parse(text.replace(/```(json)?/g, "").trim()));
        } catch {
          return json({ keywords: [] });
        }
      }
      case "/api/ai/generate-image": {
        const { prompt, aspectRatio } = body;
        if (!prompt) return json({ error: "Prompt is required" }, 400);
        const key = geminiKey();
        if (!key) return json({ error: "لا يوجد مفتاح Gemini API لتفعيل توليد الصور." }, 500);
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(key)}`;
          const res = await nativeFetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `Anime masterwork illustration, detailed design, ${prompt}` }] }],
              generationConfig: { responseModalities: ["Text", "Image"] },
            }),
          });
          const data = await res.json();
          const part = (data?.candidates?.[0]?.content?.parts || []).find((p: any) => p.inlineData);
          if (part?.inlineData?.data) {
            return json({ imageUrl: `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}` });
          }
          throw new Error(data?.error?.message || "No image data in response");
        } catch (e: any) {
          return json({ error: e?.message || "Failed to generate image" }, 500);
        }
      }
      default:
        return json({ error: "AI endpoint not found" }, 404);
    }
  } catch (e: any) {
    return json({ error: e?.message || "AI request failed" }, 500);
  }
}

/* ------------------------------------------------------------------ *
 *  Core data routes
 * ------------------------------------------------------------------ */

function handleData(method: string, path: string, body: any): Response {
  // /api/posts
  if (path === "/api/posts" && method === "GET") return json(DB.posts);
  if (path === "/api/posts" && method === "POST") {
    const { author, content, image, poll } = body || {};
    const newPost = {
      id: String(DB.posts.length + 1) + "_" + Date.now(),
      author: author || { name: "أنا (المستخدم المجهول)", username: "guest_otaku", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", isVerified: false },
      content,
      image: image || null,
      video: null,
      likes: 0,
      hasLiked: false,
      comments: [],
      poll: poll || null,
      createdAt: new Date().toISOString(),
    };
    DB.posts.unshift(newPost);
    persist();
    return json(newPost, 201);
  }
  // /api/posts/:id/like
  let m = path.match(/^\/api\/posts\/([^/]+)\/like$/);
  if (m && method === "POST") {
    const post = DB.posts.find((p) => p.id === m![1]);
    if (!post) return json({ error: "Post not found" }, 404);
    if (post.hasLiked) { post.likes -= 1; post.hasLiked = false; }
    else { post.likes += 1; post.hasLiked = true; }
    persist();
    return json(post);
  }
  // /api/posts/:id/comments
  m = path.match(/^\/api\/posts\/([^/]+)\/comments$/);
  if (m && method === "POST") {
    const post = DB.posts.find((p) => p.id === m![1]);
    if (!post) return json({ error: "Post not found" }, 404);
    const { authorName, text } = body || {};
    const newComment = { id: "c" + (post.comments.length + 1) + Date.now(), author: authorName || "زائر الأنمي", text };
    post.comments.push(newComment);
    persist();
    return json(post, 201);
  }
  // /api/posts/:id/poll/vote
  m = path.match(/^\/api\/posts\/([^/]+)\/poll\/vote$/);
  if (m && method === "POST") {
    const post = DB.posts.find((p) => p.id === m![1]);
    if (!post || !post.poll) return json({ error: "Poll not found" }, 404);
    const { optionIndex } = body || {};
    if (optionIndex === undefined || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return json({ error: "Invalid option index" }, 400);
    }
    post.poll.options[optionIndex].votes = (post.poll.options[optionIndex].votes || 0) + 1;
    post.poll.totalVotes = (post.poll.totalVotes || 0) + 1;
    post.poll.userVotedIndex = optionIndex;
    persist();
    return json(post);
  }
  // /api/stories
  if (path === "/api/stories" && method === "GET") return json(DB.stories);
  if (path === "/api/stories" && method === "POST") {
    const b = body || {};
    const newStory = {
      id: "s" + Date.now().toString(),
      author: b.author || { name: "أنا", username: "guest_otaku", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
      mediaType: b.mediaType || "image",
      url: b.url || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
      views: 0,
      question: b.question || null,
      poll: b.poll || null,
      storyType: b.storyType || "image",
      entityType: b.entityType || "user",
      entityName: b.entityName || null,
      musicTitle: b.musicTitle || null,
      musicArtist: b.musicArtist || null,
      linkUrl: b.linkUrl || null,
      linkTitle: b.linkTitle || null,
      animeCardId: b.animeCardId || null,
      animeCardTitle: b.animeCardTitle || null,
      animeCardImage: b.animeCardImage || null,
      characterCardId: b.characterCardId || null,
      characterCardName: b.characterCardName || null,
      characterCardImage: b.characterCardImage || null,
      shareItemId: b.shareItemId || null,
      shareItemTitle: b.shareItemTitle || null,
      themeFrame: b.themeFrame || "none",
      animeEffect: b.animeEffect || "none",
      stickers: b.stickers || [],
      filters: b.filters || "",
      allowReplies: b.allowReplies !== undefined ? b.allowReplies : true,
      allowShare: b.allowShare !== undefined ? b.allowShare : true,
      preventDownload: b.preventDownload !== undefined ? b.preventDownload : false,
      audience: b.audience || "public",
      hiddenUsers: b.hiddenUsers || [],
      isPinned: b.isPinned || false,
      highlightId: b.highlightId || null,
      highlightName: b.highlightName || null,
      xpReward: b.xpReward || 0,
      coinReward: b.coinReward || 0,
      createdAt: new Date().toISOString(),
    };
    DB.stories.unshift(newStory);
    persist();
    return json(newStory, 201);
  }
  // /api/reels
  if (path === "/api/reels" && method === "GET") return json(DB.reels);
  m = path.match(/^\/api\/reels\/([^/]+)\/like$/);
  if (m && method === "POST") {
    const reel = DB.reels.find((r) => r.id === m![1]);
    if (!reel) return json({ error: "Reel not found" }, 404);
    if (reel.hasLiked) { reel.likes -= 1; reel.hasLiked = false; }
    else { reel.likes += 1; reel.hasLiked = true; }
    persist();
    return json(reel);
  }
  // /api/chats
  if (path === "/api/chats" && method === "GET") return json(DB.chats);
  m = path.match(/^\/api\/chats\/([^/]+)\/messages$/);
  if (m && method === "POST") {
    const chatId = m[1];
    const chat = DB.chats.find((c) => c.id === chatId);
    if (!chat) return json({ error: "Chat not found" }, 404);
    const { sender, text, senderName } = body || {};
    const newUserMessage = {
      id: "m_user_" + Date.now(),
      sender: sender || "user",
      senderName: senderName || "أنت",
      text,
      timestamp: new Date().toISOString(),
    };
    chat.messages.push(newUserMessage);
    persist();
    // AI bot reply (async handled by caller — return now, append reply via promise)
    return json({ chat });
  }
  // /api/notifications
  if (path === "/api/notifications" && method === "GET") return json(DB.notifications);
  if (path === "/api/notifications/clear" && method === "POST") {
    DB.notifications.forEach((n) => (n.read = true));
    persist();
    return json(DB.notifications);
  }
  // /api/admin/stats
  if (path === "/api/admin/stats" && method === "GET") {
    const postCount = DB.posts.length;
    const commentCount = DB.posts.reduce((acc, p) => acc + p.comments.length, 0);
    const likeCount = DB.posts.reduce((acc, p) => acc + p.likes, 0);
    const reportCount = DB.reports.length;
    return json({
      postCount,
      commentCount,
      likeCount,
      reportCount,
      activeUsers: 342,
      dailyVisits: [
        { name: "السبت", visits: 120, posts: 15 },
        { name: "الأحد", visits: 190, posts: 32 },
        { name: "الإثنين", visits: 240, posts: 45 },
        { name: "الثلاثاء", visits: 310, posts: 58 },
        { name: "الأربعاء", visits: 280, posts: 40 },
        { name: "الخميس", visits: 450, posts: 72 },
        { name: "الجمعة", visits: 520, posts: 95 },
      ],
    });
  }
  // /api/apk/status + build + download (in-APK answers)
  if (path === "/api/apk/status" && method === "GET") {
    return json({
      exists: true,
      valid: true,
      size: 4163180,
      version: "2.5.0",
      versionCode: 250,
      buildNumber: 2050,
      packageName: "com.animeblack.app",
      label: "Anime Black | أنمي بلاك",
      path: "bundled",
      updatedAt: new Date().toISOString(),
    });
  }
  if (path === "/api/apk/build" && method === "POST") {
    return json({ success: true, size: 4163180, path: "bundled", version: "2.5.0", message: "التطبيق مثبّت بالفعل على جهازك" });
  }
  if (path === "/api/download/apk" && method === "GET") {
    return json({ error: "أنت تستخدم تطبيق أنمي بلاك المثبّت على جهازك بالفعل" }, 404);
  }
  // /api/link-preview
  if (path === "/api/link-preview" && method === "GET") {
    return json({ title: "", description: "", image: "", url: "" });
  }
  return json({ error: "Not found" }, 404);
}

/* ------------------------------------------------------------------ *
 *  Response helpers + fetch interceptor
 * ------------------------------------------------------------------ */

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let nativeFetch: typeof fetch;

async function handleRequest(method: string, path: string, search: string, body: any): Promise<Response> {
  // AI routes are async
  if (path.startsWith("/api/ai/")) {
    return handleAI(path, body);
  }
  // chat AI bot reply (append after user message)
  const m = path.match(/^\/api\/chats\/([^/]+)\/messages$/);
  if (m && method === "POST" && m[1] === "ai_bot") {
    const resp = handleData(method, path, body);
    const chat = DB.chats.find((c) => c.id === "ai_bot");
    const userText = body?.text || "";
    // fire-and-forget AI reply appended to the DB
    try {
      const key = geminiKey();
      if (key && chat) {
        const recent = chat.messages.slice(-15).map((msg: any) => `${msg.sender === "ai" ? "Assistant (Anime AI)" : "User"}: ${msg.text}`).join("\n");
        geminiGenerateContent(`${recent}\nAssistant (Anime AI):`, {
          systemInstruction:
            "You are Anime AI, a friendly, extremely knowledgeable, and fun anime companion inside the \"Anime Black\" social media network. Respond completely in Arabic unless English is requested. Use cool Otaku lingo, anime quotes, and emojis naturally. Keep answers medium length, engaging, and stylized with markdown.",
          temperature: 0.8,
        })
          .then((aiText) => {
            chat.messages.push({ id: "m_ai_" + Date.now(), sender: "ai", senderName: "مساعد الأنمي", text: aiText, timestamp: new Date().toISOString() });
            persist();
          })
          .catch(() => {});
      }
    } catch {
      /* ignore */
    }
    return resp;
  }
  return handleData(method, path, body);
}

export function installLocalServer() {
  const w = window as any;
  if (w.__animeblackLocalServerInstalled) return;
  w.__animeblackLocalServerInstalled = true;

  // Only take over in APK mode (file://) — on the hosted server the real backend serves /api/*
  const isApk = window.location.protocol === "file:";
  const forced = localStorage.getItem("animeblack_local_server") === "1";
  if (!isApk && !forced) return;

  nativeFetch = window.fetch.bind(window);

  window.fetch = function (input: any, init?: any): Promise<Response> {
    let urlStr = "";
    if (typeof input === "string") urlStr = input;
    else if (input && typeof input.url === "string") urlStr = input.url;
    else if (input instanceof Request) urlStr = input.url;

    let path = urlStr;
    let search = "";
    try {
      const u = new URL(urlStr, window.location.href);
      path = u.pathname;
      search = u.search;
    } catch {
      /* keep raw */
    }

    if (path.startsWith("/api/")) {
      const method = ((init?.method || (input instanceof Request ? input.method : "GET")) || "GET").toUpperCase();
      let body: any;
      if (init && init.body) {
        try { body = JSON.parse(String(init.body)); } catch { body = undefined; }
      }
      return handleRequest(method, path, search, body);
    }
    return nativeFetch(input, init);
  } as typeof fetch;

  // load persisted DB
  DB = loadDB();
}

export default installLocalServer;
