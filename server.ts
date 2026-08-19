import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Lazy initialization of GoogleGenAI SDK to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust helper to perform Gemini content generation with automatic model fallback
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const primaryModel = params.model || "gemini-3.5-flash";
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    console.warn(`Primary model ${primaryModel} failed: ${err.message || err}. Attempting fallback...`);
    
    let fallbackModel = "";
    if (primaryModel === "gemini-3.5-flash") {
      fallbackModel = "gemini-2.5-flash";
    } else if (primaryModel === "gemini-3.1-flash-lite-image") {
      fallbackModel = "gemini-3.1-flash-image";
    }

    if (fallbackModel) {
      try {
        const fallbackParams = { ...params, model: fallbackModel };
        return await ai.models.generateContent(fallbackParams);
      } catch (fallbackErr: any) {
        console.error(`Fallback model ${fallbackModel} also failed:`, fallbackErr.message || fallbackErr);
        throw err;
      }
    }
    throw err;
  }
}

// In-Memory Database for Anime Black
const DB = {
  posts: [
    {
      id: "1",
      author: {
        name: "كين أوتشيها",
        username: "ken_uchiha",
        avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150",
        isVerified: true,
      },
      content: "أخيراً! أعلن استوديو MAPPA رسمياً عن تكملة أنمي Chainsaw Man بفيلم سينمائي ضخم يغطي آرك Reze (فتحة القنبلة). الرسم المبدئي يبدو مذهلاً والتحريك واعد جداً! ما هي توقعاتكم للفيلم؟ 🔥🎬 #chainsawman #anime_news #mappa",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
      video: null,
      likes: 1240,
      hasLiked: false,
      comments: [
        { id: "c1", author: "Yuki", text: "أنا متحمس جداً! آرك ريزي هو المفضل لدي في المانجا 🍿" },
        { id: "c2", author: "Zoro_3", text: "أتمنى ألا يكون هناك اختصار للأحداث." }
      ],
      poll: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
      id: "2",
      author: {
        name: "أوتاكو سينسي",
        username: "otaku_sensei",
        avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150",
        isVerified: true,
      },
      content: "تصويت سريع لعشاق أنمي Shingeki no Kyojin (هجوم العمالقة): من هي الشخصية الأكثر تأثيراً في مسار القصة برأيكم؟ هل هو إيرين بطموحه المطلق، أم ليفاي بقوته وولائه، أم إروين بذكائه وقيادته الفذة؟ شاركوا برأيكم في الاستطلاع بالأسفل! 👇",
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
          { text: "إروين سميث (Erwin)", votes: 512 }
        ],
        totalVotes: 1282,
        userVotedIndex: null,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "3",
      author: {
        name: "رينكا تشان",
        username: "rinka_chan",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
        isVerified: false,
      },
      content: "رسمة رقمية جديدة لشخصية ميكاسا من رسمي المتواضع! استغرقت مني حوالي 8 ساعات عمل على Procreate. أتمنى أن تنال إعجابكم! 🎨✨💖",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
      video: null,
      likes: 310,
      hasLiked: false,
      comments: [
        { id: "c3", author: "Kira", text: "رائعة جداً! التلوين والظلال خرافية 😍" }
      ],
      poll: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    }
  ],
  stories: [
    {
      id: "s_admin",
      author: {
        name: "إمبراطور أنمي بلاك (الإدارة)",
        avatar: "https://images.unsplash.com/photo-1578574515313-241881a377b4?w=150",
        username: "system_emperor"
      },
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
      coinReward: 5
    },
    {
      id: "s_guild",
      author: {
        name: "القائد لولوش",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        username: "lelouch_zero"
      },
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
      views: 840,
      question: null,
      poll: {
        question: "هل نعلن التحالف مع نقابة السيوف المشتعلة اليوم؟",
        options: ["نعم، تحالف قوي", "لا، نواصل بمفردنا", "التصويت لاحقاً"],
        votes: [120, 45, 10]
      },
      storyType: "poll",
      entityType: "guild",
      entityName: "نقابة الفرسان السود / Black Knights",
      themeFrame: "purple-susanoo",
      animeEffect: "ki-aura",
      stickers: ["⚔️", "🔥"],
      allowReplies: true,
      allowShare: false,
      xpReward: 10,
      coinReward: 3
    },
    {
      id: "s_space",
      author: {
        name: "كاكاشي سينسي",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        username: "kakashi_copy_ninja"
      },
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
      coinReward: 2
    },
    {
      id: "s_friend",
      author: {
        name: "أوتاكو سينسي",
        avatar: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150",
        username: "otaku_sensei"
      },
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
      allowShare: true
    },
    {
      id: "s_group",
      author: {
        name: "رورونوا زورو",
        avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150",
        username: "zoro_swordsman"
      },
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
      xpReward: 5
    }
  ],
  reels: [
    {
      id: "r1",
      title: "أقوى قتال في أنمي Demon Slayer - تلوين رائع وسرعة خيالية ⚔️✨",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-glowing-neon-light-tube-40507-large.mp4", // Aesthetic visual placeholder
      author: {
        name: "فيلق الاستطلاع",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        username: "survey_corps",
      },
      likes: 4520,
      commentsCount: 184,
      shares: 320,
      hasLiked: false,
    },
    {
      id: "r2",
      title: "أجواء طوكيو في الليل بأسلوب السايبربانك والأنمي 🌌🗼",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-futuristic-neon-lit-city-at-night-44331-large.mp4",
      author: {
        name: "رينكا تشان",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
        username: "rinka_chan",
      },
      likes: 2190,
      commentsCount: 95,
      shares: 110,
      hasLiked: false,
    }
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
        }
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
        { id: "gm1", sender: "ken_uchiha", senderName: "كين أوتشيها", text: "هل تعتقدون أن آرك اللحاف الأحمر سينتهي في هذا الفصل؟", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: "gm2", sender: "otaku_sensei", senderName: "أوتاكو سينسي", text: "أتوقع أن يمتد لـ 5 فصول أخرى، الأحداث ما زالت في ذروتها!", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
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
        { id: "cm1", sender: "admin", senderName: "الإدارة", text: "تنبيه: سيتم إطلاق العرض الترويجي الأول للعبة الأنمي المنتظرة الأسبوع المقبل!", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
      ]
    }
  ],
  notifications: [
    { id: "n1", type: "like", text: "أعجب كين أوتشيها بمنشورك الأخير.", time: "منذ ٥ دقائق", read: false },
    { id: "n2", type: "comment", text: "علق أوتاكو سينسي على منشورك: 'عمل رائع جداً ومبدع!'", time: "منذ ١٥ دقيقة", read: false },
    { id: "n3", type: "follow", text: "بدأ رينكا تشان في متابعتك.", time: "منذ ساعة", read: true },
    { id: "n4", type: "mention", text: "ذكرك كين أوتشيها في تعليق داخل مجموعة نقاشات ون بيس.", time: "منذ ساعتين", read: true }
  ],
  reports: [
    { id: "r_1", reporter: "Yuki", targetType: "post", targetId: "3", reason: "محتوى غير لائق", status: "معلق" }
  ]
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API ENDPOINTS ---

  // Get current state of all database collections
  app.get("/api/posts", (req, res) => {
    res.json(DB.posts);
  });

  app.post("/api/posts", (req, res) => {
    const { author, content, image, poll } = req.body;
    const newPost = {
      id: String(DB.posts.length + 1),
      author: author || {
        name: "أنا (المستخدم المجهول)",
        username: "guest_otaku",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        isVerified: false,
      },
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
    res.status(201).json(newPost);
  });

  app.post("/api/posts/:id/like", (req, res) => {
    const post = DB.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    if (post.hasLiked) {
      post.likes -= 1;
      post.hasLiked = false;
    } else {
      post.likes += 1;
      post.hasLiked = true;
    }
    res.json(post);
  });

  app.post("/api/posts/:id/comments", (req, res) => {
    const post = DB.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const { authorName, text } = req.body;
    const newComment = {
      id: "c" + (post.comments.length + 1) + Date.now(),
      author: authorName || "زائر الأنمي",
      text,
    };
    post.comments.push(newComment);
    res.status(201).json(post);
  });

  // Vote on polls
  app.post("/api/posts/:id/poll/vote", (req, res) => {
    const post = DB.posts.find(p => p.id === req.params.id);
    if (!post || !post.poll) return res.status(404).json({ error: "Poll not found" });

    const { optionIndex } = req.body;
    if (optionIndex === undefined || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ error: "Invalid option index" });
    }

    // Increase vote count
    post.poll.options[optionIndex].votes += 1;
    post.poll.totalVotes += 1;
    post.poll.userVotedIndex = optionIndex;

    res.json(post);
  });

  // Stories
  app.get("/api/stories", (req, res) => {
    res.json(DB.stories);
  });

  app.post("/api/stories", (req, res) => {
    const {
      author,
      mediaType,
      url,
      question,
      poll,
      storyType,
      entityType,
      entityName,
      musicTitle,
      musicArtist,
      linkUrl,
      linkTitle,
      animeCardId,
      animeCardTitle,
      animeCardImage,
      characterCardId,
      characterCardName,
      characterCardImage,
      shareItemId,
      shareItemTitle,
      themeFrame,
      animeEffect,
      stickers,
      filters,
      allowReplies,
      allowShare,
      preventDownload,
      audience,
      hiddenUsers,
      isPinned,
      highlightId,
      highlightName,
      xpReward,
      coinReward
    } = req.body;

    const newStory = {
      id: "s" + Date.now().toString(),
      author: author || {
        name: "أنا",
        username: "guest_otaku",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      },
      mediaType: mediaType || "image",
      url: url || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
      views: 0,
      question: question || null,
      poll: poll || null,
      storyType: storyType || "image",
      entityType: entityType || "user",
      entityName: entityName || null,
      musicTitle: musicTitle || null,
      musicArtist: musicArtist || null,
      linkUrl: linkUrl || null,
      linkTitle: linkTitle || null,
      animeCardId: animeCardId || null,
      animeCardTitle: animeCardTitle || null,
      animeCardImage: animeCardImage || null,
      characterCardId: characterCardId || null,
      characterCardName: characterCardName || null,
      characterCardImage: characterCardImage || null,
      shareItemId: shareItemId || null,
      shareItemTitle: shareItemTitle || null,
      themeFrame: themeFrame || "none",
      animeEffect: animeEffect || "none",
      stickers: stickers || [],
      filters: filters || "",
      allowReplies: allowReplies !== undefined ? allowReplies : true,
      allowShare: allowShare !== undefined ? allowShare : true,
      preventDownload: preventDownload !== undefined ? preventDownload : false,
      audience: audience || "public",
      hiddenUsers: hiddenUsers || [],
      isPinned: isPinned || false,
      highlightId: highlightId || null,
      highlightName: highlightName || null,
      xpReward: xpReward || 0,
      coinReward: coinReward || 0,
      createdAt: new Date().toISOString()
    };
    DB.stories.unshift(newStory);
    res.status(201).json(newStory);
  });

  // Reels
  app.get("/api/reels", (req, res) => {
    res.json(DB.reels);
  });

  app.post("/api/reels/:id/like", (req, res) => {
    const reel = DB.reels.find(r => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: "Reel not found" });

    if (reel.hasLiked) {
      reel.likes -= 1;
      reel.hasLiked = false;
    } else {
      reel.likes += 1;
      reel.hasLiked = true;
    }
    res.json(reel);
  });

  // Chats & Chat Messages
  app.get("/api/chats", (req, res) => {
    res.json(DB.chats);
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    const chatId = req.params.id;
    const { sender, text, senderName } = req.body;
    
    const chat = DB.chats.find(c => c.id === chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const newUserMessage = {
      id: "m_user_" + Date.now(),
      sender: sender || "user",
      senderName: senderName || "أنت",
      text,
      timestamp: new Date().toISOString()
    };
    
    chat.messages.push(newUserMessage);

    // If chat is with the AI Bot, call Gemini
    if (chatId === "ai_bot") {
      try {
        const ai = getAIClient();
        
        // Construct the conversation history for Gemini
        // Limit to last 15 messages to prevent token bloat
        const recentMessages = chat.messages.slice(-15);
        const promptContents = recentMessages.map(msg => {
          return `${msg.sender === "ai" ? "Assistant (Anime AI)" : "User"}: ${msg.text}`;
        }).join("\n");

        const systemInstruction = `You are Anime AI, a friendly, extremely knowledgeable, and fun anime companion inside the "Anime Black" social media network.
Respond completely in Arabic unless English is requested or necessary.
Use cool Otaku lingo, anime quotes, and emojis naturally.
Provide helpful, detailed summaries, recommend anime series matching the user's taste, or converse about popular anime (One Piece, Naruto, Jujutsu Kaisen, Attack on Titan, etc.) and manga. Always stay in character as a professional anime expert assistant. Keep answers medium length, highly engaging, and stylized with markdown.`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: `${promptContents}\nAssistant (Anime AI):`,
          config: {
            systemInstruction,
            temperature: 0.8,
          }
        });

        const aiText = response.text || "عذراً يا صديقي الأوتاكو، يبدو أن هناك تشوشاً في الاتصال! أعد المحاولة مجدداً. 🌀";
        
        const newAIMessage = {
          id: "m_ai_" + Date.now(),
          sender: "ai",
          senderName: "مساعد الأنمي",
          text: aiText,
          timestamp: new Date().toISOString()
        };

        chat.messages.push(newAIMessage);
        return res.json({ chat, reply: newAIMessage });
      } catch (err: any) {
        console.error("Gemini AI API Error:", err);
        const errorMsg = `عذراً! واجهت مشكلة في استدعاء الذكاء الاصطناعي: ${err.message || err}`;
        const newAIMessage = {
          id: "m_ai_error_" + Date.now(),
          sender: "ai",
          senderName: "مساعد الأنمي",
          text: errorMsg,
          timestamp: new Date().toISOString()
        };
        chat.messages.push(newAIMessage);
        return res.json({ chat, reply: newAIMessage, error: true });
      }
    }

    res.json({ chat });
  });

  // --- GEMINI SPECIFIC UTILITIES ---

  // Post text generator
  app.post("/api/ai/write-post", async (req, res) => {
    const { prompt, tone } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      const ai = getAIClient();
      const systemInstruction = `You are a high-quality creative writer for an Otaku social media network called "Anime Black".
Generate a captivating social media post in Arabic based on the user's prompt.
The tone should be ${tone || "exciting and enthusiastic"}.
Add relevant anime hashtags, emojis, and space the text beautifully for reading. Make it feel authentic to real anime communities. Do not output anything else than the post content itself.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.85,
        }
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("AI Post Writer Error:", err);
      res.status(500).json({ error: err.message || "Failed to write post" });
    }
  });

  // Text / Chat summarizer
  app.post("/api/ai/summarize", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text to summarize is required" });

    try {
      const ai = getAIClient();
      const systemInstruction = "تلخيص النص المدخل بأسلوب نقاط ذكية وواضحة جداً باللغة العربية. ركز على التفاصيل الأساسية والأنميات المذكورة.";
      
      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction,
          temperature: 0.4,
        }
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("AI Summarizer Error:", err);
      res.status(500).json({ error: err.message || "Failed to summarize" });
    }
  });

  // Smart replies generator for chat
  app.post("/api/ai/chat-smart-replies", async (req, res) => {
    const { messages } = req.body; // array of { text, senderId }
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messages array is required" });

    try {
      const ai = getAIClient();
      const recentText = messages.slice(-5).map(m => `${m.senderId === "me" ? "Me" : "Partner"}: ${m.text}`).join("\n");
      const systemInstruction = `You are a helper inside an anime direct chat app. Review the conversation and output EXACTLY three distinct short, natural, contextual quick response options in Arabic or English depending on the input language.
Format the output as a valid JSON array of strings, e.g., ["فكرة رائعة!", "لم أشاهده بعد، هل هو حماسي؟", "بالتأكيد!"]. Output only the raw JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `Review the conversation:\n${recentText}\n\nProvide the 3 response options.`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      let results = [];
      try {
        results = JSON.parse(response.text?.trim() || "[]");
      } catch (e) {
        // Fallback parser in case response isn't formatted properly
        console.error("Failed to parse JSON reply, raw response:", response.text);
        const matches = response.text?.match(/"([^"\\]|\\.)*"/g);
        if (matches) {
          results = matches.map(m => m.replace(/^"|"$/g, ""));
        } else {
          results = ["مرحباً!", "كيف حالك؟", "أهلاً بك"];
        }
      }
      res.json({ result: results });
    } catch (err: any) {
      console.error("Smart Replies Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate smart replies" });
    }
  });

  // Translation endpoint
  app.post("/api/ai/translate", async (req, res) => {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ error: "Text to translate is required" });

    try {
      const ai = getAIClient();
      const target = targetLanguage === "en" ? "English" : "Arabic";
      const systemInstruction = `Translate the provided text into natural, colloquial ${target}. Keep the tone friendly and preserve emojis or slang. Return only the translated text.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      res.json({ result: response.text?.trim() });
    } catch (err: any) {
      console.error("AI Translation Error:", err);
      res.status(500).json({ error: err.message || "Failed to translate" });
    }
  });

  // Grammar & Spelling Correction
  app.post("/api/ai/proofread", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
      const ai = getAIClient();
      const systemInstruction = "Check the user text for spelling, typos, and grammar errors. Output ONLY the corrected text. If the input is perfect, return the input verbatim. Preserve emojis.";

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      res.json({ result: response.text?.trim() });
    } catch (err: any) {
      console.error("AI Proofreader Error:", err);
      res.status(500).json({ error: err.message || "Failed to proofread" });
    }
  });

  // Content Moderation AI
  app.post("/api/ai/moderate", async (req, res) => {
    const { text, contentType } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text string is required" });
    }

    try {
      const ai = getAIClient();
      const systemInstruction = `You are an AI-powered content moderation system for the "Anime Black" social media app.
Your task is to analyze the user's text and detect any inappropriate content.
We specifically search for:
1. "hate_speech": any hate speech, slurs, severe cyberbullying, or discrimination based on race, religion, gender, sexual orientation, or disability. Note: friendly banter or critical discussion about anime characters is NOT hate speech.
2. "nudity": explicit sexual content, adult language of a sexual nature, pornography, or extreme graphic violence.
3. "spam": advertisement spam, scam links, repetitive nonsense, bot-like flooding, or phishing attempts.

You must reply with a valid JSON object matching the following TypeScript schema:
{
  "flagged": boolean,
  "category": "hate_speech" | "nudity" | "spam" | "safe",
  "confidence": number, // value between 0.0 and 1.0
  "reasonEn": string, // short English explanation of why it was flagged or why it is safe
  "reasonAr": string // short Arabic explanation of why it was flagged or why it is safe
}

Be fair, objective, and accurate. Do not flag normal anime discussions, opinions, or typical memes unless they are clearly hateful, explicit, or spam. Output only the raw JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `Analyze the following ${contentType || "content"} text: "${text}"`,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      let moderationResult = {
        flagged: false,
        category: "safe",
        confidence: 1.0,
        reasonEn: "Safe content",
        reasonAr: "محتوى آمن",
      };

      try {
        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed && typeof parsed === "object") {
          moderationResult = {
            flagged: Boolean(parsed.flagged),
            category: parsed.category || "safe",
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 1.0,
            reasonEn: parsed.reasonEn || "No issues found.",
            reasonAr: parsed.reasonAr || "لم يتم العثور على مشكلات.",
          };
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini moderation response:", parseError, response.text);
      }

      res.json(moderationResult);
    } catch (err: any) {
      console.error("AI Moderation Error:", err);
      res.status(500).json({ error: err.message || "Failed to perform moderation" });
    }
  });

  // Character Chat (Roleplay with AI Anime Characters or Gemini Bot)
  app.post("/api/ai/character-chat", async (req, res) => {
    const { characterId, messages } = req.body;
    if (!characterId) return res.status(400).json({ error: "characterId is required" });

    try {
      const ai = getAIClient();

      let systemInstruction = "";
      if (characterId === "gemini_bot") {
        systemInstruction = `You are "مساعد الأوتـاكو الذكي 🤖" (Smart Otaku AI), a highly premium, wise, and helpful AI assistant inside the "Anime Black" social media network.
Respond completely in fluent, engaging Arabic. Use anime references, quotes, and emojis naturally.
Provide expert recommendations for anime and manga, explain character lore, help write posts, or just chat with the user. Keep formatting clean with markdown.`;
      } else if (characterId === "luffy_gear5") {
        systemInstruction = `You are Monkey D. Luffy (Gear 5 mode) from One Piece. You are fun, extremely energetic, cartoonishly joyful, and completely obsessed with eating meat (لحم).
Respond completely in Arabic in the character of Luffy! Use expressions like 'هاهاها!' and 'شيشيشي!' and talk about being the King of Pirates (ملك القراصنة) and your nakama. Keep replies lively!`;
      } else if (characterId === "gojo_sixeyes") {
        systemInstruction = `You are Gojo Satoru from Jujutsu Kaisen. You are ultra-confident, playfully arrogant, charismatic, and the absolute strongest.
Respond completely in Arabic in the character of Gojo! Use expressions like 'لا تقلق، أنا الأقوى!' and joke about how easy everything is. Mention sweets or mochi occasionally.`;
      } else if (characterId === "mikasa_ack") {
        systemInstruction = `You are Mikasa Ackerman from Attack on Titan. You are calm, protective, exceptionally loyal, quiet, but deeply caring about Eren and your comrades.
Respond completely in Arabic in the character of Mikasa. Keep replies cool, dedicated, and sincere.`;
      } else if (characterId === "zoro_swords") {
        systemInstruction = `You are Roronoa Zoro from One Piece. You are cool, serious, silent, easily get lost (ضيعت طريقي), and love swords and training.
Respond completely in Arabic as Zoro. Keep sentences short, tough, but friendly.`;
      } else if (characterId === "sukuna_curse") {
        systemInstruction = `You are Ryomen Sukuna from Jujutsu Kaisen. You are the arrogant, menacing, majestic King of Curses.
Respond completely in Arabic in the character of Sukuna. You look down on humans but enjoy interesting conversation. Keep your tone regal and terrifying.`;
      } else {
        systemInstruction = `You are an expert anime companion inside the Anime Black social media platform. Respond completely in Arabic.`;
      }

      // Format messages history
      const formattedHistory = (messages || []).map((m: any) => {
        const role = m.senderId === characterId ? "Assistant" : "User";
        return `${role}: ${m.text}`;
      }).join("\n");

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `${formattedHistory}\nAssistant:`,
        config: {
          systemInstruction,
          temperature: 0.85,
        }
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Character Chat AI Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate character reply" });
    }
  });

  // Semantic search inside chat history
  app.post("/api/ai/chat-search", async (req, res) => {
    const { query, messages } = req.body; // query string, and messages array of { id, text, senderName }
    if (!query) return res.status(400).json({ error: "Query is required" });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messages array is required" });

    try {
      const ai = getAIClient();
      const systemInstruction = `You are a search assistant for a chat history. Determine which of the messages are contextually or semantically related to the user's query.
Format the output as a valid JSON array of message IDs, e.g., ["msg_1", "msg_5"]. Output only the raw JSON.`;

      const contents = `User Query: "${query}"\n\nChat Messages:\n${messages.map(m => `ID: ${m.id} | ${m.senderName}: ${m.text}`).join("\n")}`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      let results = [];
      try {
        results = JSON.parse(response.text?.trim() || "[]");
      } catch (e) {
        console.error("Failed to parse search JSON, raw response:", response.text);
      }
      res.json({ result: results });
    } catch (err: any) {
      console.error("AI Chat Search Error:", err);
      res.status(500).json({ error: err.message || "Failed to search chat" });
    }
  });

  // Intelligent search suggestions, typo corrections, and semantic expander
  app.post("/api/ai/search-suggestions", async (req, res) => {
    const { query, isArabic } = req.body;
    if (!query || query.trim().length < 2) {
      return res.json({ corrected: "", suggestions: [], related: [] });
    }

    try {
      const ai = getAIClient();
      const systemInstruction = `You are an Otaku search helper. Analyze the user query.
Provide:
1. "corrected": Typo-corrected string if there are spelling errors (e.g., "shingiki" -> "Shingeki no Kyojin", "نارطو" -> "ناروتو"). If no spelling errors, return empty string "".
2. "suggestions": A list of 3 popular related anime/manga search phrases.
3. "related": A list of 3 related keywords or characters.

Output ONLY a JSON object in this exact format:
{
  "corrected": "corrected query here or empty string",
  "suggestions": ["suggested phrase 1", "suggested phrase 2", "suggested phrase 3"],
  "related": ["keyword 1", "keyword 2", "keyword 3"]
}`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `Analyze query: "${query}" (Language preference: ${isArabic ? "Arabic" : "English"})`,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      let results = { corrected: "", suggestions: [], related: [] };
      try {
        results = JSON.parse(response.text?.trim() || "{}");
      } catch (e) {
        console.error("Failed to parse search suggestions JSON:", response.text);
      }
      res.json(results);
    } catch (err: any) {
      console.error("AI Search Suggestions Error:", err);
      res.json({ corrected: "", suggestions: [], related: [] });
    }
  });

  // AI-powered visual image tagging for Image Search
  app.post("/api/ai/analyze-image", async (req, res) => {
    const { image } = req.body; // base64 string
    if (!image) return res.status(400).json({ error: "Image is required" });

    try {
      const ai = getAIClient();
      
      // Extract raw base64 and mimetype
      let base64Data = image;
      let mimeType = "image/jpeg";
      if (image.startsWith("data:")) {
        const parts = image.split(",");
        base64Data = parts[1];
        const mimePart = parts[0].match(/data:(.*?);/);
        if (mimePart) {
          mimeType = mimePart[1];
        }
      }

      const response = await generateContentWithFallback(ai, {
        model: "gemini-2.5-flash",
        contents: [
          {
            text: "Analyze this anime/manga related image. Identify the anime/manga series, characters, styles, or objects shown. Provide 3 to 5 single-word keywords or short phrases that are highly relevant to search for this in a social network search bar. Return a JSON object with a single key 'keywords' containing an array of strings in both Arabic and English (e.g. ['Naruto', 'ناروتو', 'Rinnegan', 'رينينغان'])."
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      let result = { keywords: [] };
      try {
        result = JSON.parse(response.text?.trim() || "{}");
      } catch (e) {
        console.error("Failed to parse image search JSON:", response.text);
      }
      res.json(result);
    } catch (err: any) {
      console.error("AI Image Analyze Error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze image" });
    }
  });

  // Image generator using gemini-3.1-flash-lite-image
  app.post("/api/ai/generate-image", async (req, res) => {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      const ai = getAIClient();
      
      // We append "anime style" or similar descriptors to guarantee the results align with "Anime Black" theme
      const animePrompt = `Anime masterwork illustration, detailed design, ${prompt}`;
      
      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: animePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
          }
        }
      });

      let generatedBase64 = "";
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (!generatedBase64) {
        throw new Error("No image data found in the response candidates.");
      }

      const imageUrl = `data:image/png;base64,${generatedBase64}`;
      res.json({ imageUrl });
    } catch (err: any) {
      console.error("AI Image Generation Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate image" });
    }
  });

  // Notifications API
  app.get("/api/notifications", (req, res) => {
    res.json(DB.notifications);
  });

  // Link Preview API to get metadata of links inside messages securely
  app.get("/api/link-preview", async (req, res) => {
    const urlString = req.query.url as string;
    if (!urlString) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      let targetUrl = urlString.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }

      // Fetch the page with a user agent and a timeout to avoid hangs
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL, status: ${response.status}`);
      }

      const html = await response.text();

      // Extract title
      let title = "";
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1];
      } else {
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }

      // Extract description
      let description = "";
      const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
      if (ogDescMatch) {
        description = ogDescMatch[1];
      }

      // Extract image
      let image = "";
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
                         html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        image = ogImageMatch[1];
      }

      // Format relative image URL if applicable
      if (image && !/^https?:\/\//i.test(image)) {
        try {
          const parsedUrl = new URL(targetUrl);
          if (image.startsWith("/")) {
            image = parsedUrl.origin + image;
          } else {
            image = parsedUrl.origin + "/" + image;
          }
        } catch (_) {}
      }

      const decodeHtml = (str: string) => {
        return str
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
      };

      res.json({
        title: title ? decodeHtml(title) : new URL(targetUrl).hostname,
        description: description ? decodeHtml(description) : "",
        image: image || "",
        url: targetUrl
      });
    } catch (error: any) {
      console.error("Link Preview Fetch Error:", error.message || error);
      try {
        const hostname = new URL(urlString).hostname;
        res.json({
          title: hostname,
          description: "",
          image: "",
          url: urlString
        });
      } catch (_) {
        res.json({
          title: urlString,
          description: "",
          image: "",
          url: urlString
        });
      }
    }
  });

  app.post("/api/notifications/clear", (req, res) => {
    DB.notifications.forEach(n => n.read = true);
    res.json(DB.notifications);
  });

  // Admin stats
  app.get("/api/admin/stats", (req, res) => {
    const postCount = DB.posts.length;
    const commentCount = DB.posts.reduce((acc, p) => acc + p.comments.length, 0);
    const likeCount = DB.posts.reduce((acc, p) => acc + p.likes, 0);
    const reportCount = DB.reports.length;
    
    // Send statistics
    res.json({
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
        { name: "الجمعة", visits: 520, posts: 95 }
      ]
    });
  });

  // --- APK DOWNLOAD & PWA WEBAPK ENDPOINTS ---
  const getApkPath = () => path.join(process.cwd(), "public", "AnimeBlack-v2.5.0-Release.apk");
  const getLogPath = () => path.join(process.cwd(), "public", "apk_build.log");

  // Helper to verify APK binary integrity
  const isApkValid = (): boolean => {
    const apk = getApkPath();
    if (!fs.existsSync(apk)) return false;
    try {
      const stat = fs.statSync(apk);
      if (stat.size < 500000) return false; // Minimum 500KB for full APK package
      const fd = fs.openSync(apk, "r");
      const buf = Buffer.alloc(4);
      fs.readSync(fd, buf, 0, 4, 0);
      fs.closeSync(fd);
      // Check for PK\x03\x04 (ZIP signature)
      return buf.readUInt32LE(0) === 0x04034b50;
    } catch {
      // Fallback if read fails
      return fs.statSync(apk).size >= 500000;
    }
  };

  // Check APK Status Endpoint
  app.get("/api/apk/status", (req, res) => {
    const apkPath = getApkPath();
    const exists = fs.existsSync(apkPath);
    const valid = exists && isApkValid();
    const logPath = getLogPath();
    const buildLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf-8") : "";
    const size = exists ? fs.statSync(apkPath).size : 0;
    const sizeFormatted = size >= 1024 * 1024 
      ? `${(size / (1024 * 1024)).toFixed(2)} MB`
      : `${(size / 1024).toFixed(1)} KB`;

    res.json({
      exists,
      valid,
      size,
      sizeFormatted,
      version: "2.5.0",
      packageName: "com.animeblack.app",
      buildLog,
      lastModified: exists ? fs.statSync(apkPath).mtime.toISOString() : null,
    });
  });

  // Build APK Endpoint
  app.post("/api/apk/build", (req, res) => {
    try {
      // Real, working pipeline: aapt2 + hand-written dex + v1/v2/v3 signing
      const scriptPath = path.join(process.cwd(), "scripts", "build_apk.cjs");
      const stdout = execSync(`node "${scriptPath}"`, {
        encoding: "utf-8",
        timeout: 300000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      const valid = isApkValid();

      if (valid) {
        return res.json({
          success: true,
          message: "APK compiled and verified successfully",
          log: stdout,
          apkUrl: "/api/download/apk",
          size: fs.statSync(getApkPath()).size,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: "APK build completed but verification failed",
          log: stdout,
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Failed to compile APK package",
        log: err?.stdout || err?.message || String(err),
      });
    }
  });

  // Secure Binary APK Download Endpoint
  app.get(["/api/download/apk", "/AnimeBlack.apk", "/AnimeBlack-v2.5.0.apk", "/AnimeBlack-v2.5.0-Release.apk"], (req, res) => {
    const apkPath = getApkPath();

    // If APK doesn't exist or is invalid, trigger build on demand
    if (!fs.existsSync(apkPath) || !isApkValid()) {
      console.log("APK missing or invalid, triggering real Android build...");
      try {
        const scriptPath = path.join(process.cwd(), "scripts", "build_full_apk.cjs");
        execSync(`node "${scriptPath}"`, { stdio: "inherit" });
      } catch (err) {
        console.error("Auto-build APK failed:", err);
      }
    }

    if (fs.existsSync(apkPath) && isApkValid()) {
      const stat = fs.statSync(apkPath);
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", 'attachment; filename="AnimeBlack-v2.5.0-Release.apk"');
      res.setHeader("Content-Length", stat.size.toString());
      res.setHeader("X-Android-APK-Version", "2.5.0");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.sendFile(apkPath);
    } else {
      const logPath = getLogPath();
      const errorLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf-8") : "Build output unavailable.";
      return res.status(500).json({
        error: "APK build failed or output file is corrupt.",
        details: "An official APK package could not be produced. Please check build logs.",
        buildLog: errorLog,
      });
    }
  });

  // Serve AssetLinks for Android WebAPK verification
  app.get(["/.well-known/assetlinks.json", "/assetlinks.json"], (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json([{
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.animeblack.app",
        sha256_cert_fingerprints: [
          "95:DF:42:4C:16:54:A9:BB:EC:08:52:4B:E1:0D:9F:74:4B:AB:31:6B:A3:D3:FE:2D:37:DC:4D:F7:D6:05:C3:01"
        ]
      }
    }]);
  });

  // Serve static public assets in dev mode
  app.use(express.static(path.join(process.cwd(), "public")));

  // --- VITE DEV AND STATIC FILE SERVING ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
