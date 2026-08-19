import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Trash2, MessageSquare, Reply, ExternalLink, Heart, MessageCircle,
  UserPlus, Info, Send, Sparkles, Clock, Check, CheckCheck, User, ShieldAlert } from
"lucide-react";
import { Notification, Post } from "../types";

interface NotificationDetailsPageProps {
  notification: Notification;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onReply: (id: string, text: string) => Promise<void>;
  isArabic: boolean;
  posts: Post[];
  currentUser: any;
  playSynthSound?: (type: string) => void;
  triggerHapticFeedback?: (type: string) => void;
}

export const NotificationDetailsPage: React.FC<NotificationDetailsPageProps> = ({
  notification,
  onClose,
  onDelete,
  onReply,
  isArabic,
  posts,
  currentUser,
  playSynthSound,
  triggerHapticFeedback
}) => {
  const [replyText, setReplyText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Parse or determine the sender from the text if not present
  const getSenderDetails = () => {
    if (notification.senderName) {
      return {
        name: notification.senderName,
        username: notification.senderId || "user",
        avatar: notification.senderAvatar || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150"
      };
    }

    const text = notification.text;
    if (text.includes("كين أوتشيها") || text.includes("Kin Uchiha")) {
      return {
        name: isArabic ? "كين أوتشيها" : "Kin Uchiha",
        username: "kin_uchiha",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      };
    } else if (text.includes("أوتاكو سينسي") || text.includes("Otaku Sensei")) {
      return {
        name: isArabic ? "أوتاكو سينسي" : "Otaku Sensei",
        username: "otaku_sensei",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
      };
    } else if (text.includes("رينكا تشان") || text.includes("Rinka Chan")) {
      return {
        name: isArabic ? "رينكا تشان" : "Rinka Chan",
        username: "rinka_chan",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      };
    }

    // Default system notification or fallback
    return null;
  };

  const sender = getSenderDetails();

  // Find a related post from the notification text or targetId
  const getRelatedPost = (): Post | null => {
    if (notification.targetId && notification.targetType === "post") {
      return posts.find((p) => p.id === notification.targetId) || null;
    }

    // Keyword matching fallback for demo posts
    const text = notification.text.toLowerCase();
    for (const post of posts) {
      if (post.content && text.includes(post.content.slice(0, 15).toLowerCase())) {
        return post;
      }
    }
    // Return first post if it's like or comment to show interaction
    if ((notification.type === "like" || notification.type === "comment") && posts.length > 0) {
      return posts[0];
    }
    return null;
  };

  const relatedPost = getRelatedPost();

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="w-8 h-8 text-[#FF3D00] fill-[#FF3D00]" />;
      case "comment":
        return <MessageCircle className="w-8 h-8 text-indigo-400" />;
      case "follow":
        return <UserPlus className="w-8 h-8 text-green-400" />;
      case "mention":
        return <Sparkles className="w-8 h-8 text-amber-400" />;
      default:
        return <Info className="w-8 h-8 text-zinc-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case "like":
        return isArabic ? "إعجاب جديد" : "New Like";
      case "comment":
        return isArabic ? "تعليق جديد" : "New Comment";
      case "follow":
        return isArabic ? "متابعة جديدة" : "New Follower";
      case "mention":
        return isArabic ? "إشارة إليك" : "New Mention";
      default:
        return isArabic ? "تنبيه النظام" : "System Alert";
    }
  };

  const handleDelete = async () => {
    if (playSynthSound) playSynthSound("tap");
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا الإشعار نهائياً؟" : "Are you sure you want to delete this notification?")) {
      setIsDeleting(true);
      try {
        await onDelete(notification.id);
        if (playSynthSound) playSynthSound("success");
        if (triggerHapticFeedback) triggerHapticFeedback("success");
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isReplying) return;

    if (playSynthSound) playSynthSound("tap");
    setIsReplying(true);
    try {
      await onReply(notification.id, replyText.trim());
      setReplyText("");
      if (playSynthSound) playSynthSound("success");
      if (triggerHapticFeedback) triggerHapticFeedback("success");
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const quickReplies = isArabic ?
  ["شكراً لك! 🌸", "يسعدني جداً! ✨", "شرف كبير لي! 🎌", "أهلاً بك في مجتمعنا! 🦊"] :
  ["Thank you! 🌸", "So glad! ✨", "Much appreciated! 🎌", "Welcome to our clan! 🦊"];

  const handleNavigateToRelated = () => {
    if (playSynthSound) playSynthSound("tap");

    if (notification.type === "follow" && sender) {
      // Open profile modal
      window.dispatchEvent(new CustomEvent('openProfile', { detail: sender.username }));
      onClose();
    } else if (relatedPost) {
      // Focus the post/comments by dispatching custom event or using callbacks
      window.dispatchEvent(new CustomEvent('focusPostComments', { detail: relatedPost.id }));
      onClose();
    } else {
      alert(isArabic ? "لا يوجد رابط محدد لهذا الإشعار حالياً." : "No specific link is available for this notification.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 250 }}
      className="absolute inset-0 z-50 bg-[#070709] flex flex-col overflow-y-auto pb-10 scrollbar-none text-right"
      dir={isArabic ? "rtl" : "ltr"}>
      
      {/* 1. Glassy Navbar Header */}
      <div className="sticky top-0 z-10 h-16 bg-[#0B0B0E]/95 border-b border-zinc-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (playSynthSound) playSynthSound("tap");
              onClose();
            }}
            className="p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl text-zinc-300 transition-colors border border-zinc-800">
            
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-white uppercase tracking-widest font-mono">
            {isArabic ? "تفاصيل الإشعار المستقلة" : "Standalone Notification Page"}
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white rounded-xl border border-red-900/30 text-xs font-black transition-all">
          
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isArabic ? "حذف" : "Delete"}</span>
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* 2. Mega Notification Card */}
        <div className="bg-[#0D0D11] border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-right">
            {/* Big Glowing Icon */}
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center shadow-lg shadow-indigo-950/20 shrink-0">
              {getIcon()}
            </div>

            {/* Notification Text */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-900/40 uppercase font-mono">
                  {getTypeLabel()}
                </span>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1 bg-zinc-900/50 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" />
                  {notification.time}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                notification.read ?
                "bg-zinc-950/40 border-zinc-800 text-zinc-500" :
                "bg-emerald-950/40 border-emerald-900 text-emerald-400"}`
                }>
                  {notification.read ?
                  isArabic ? "مقروء" : "Read" :
                  isArabic ? "جديد غير مقروء" : "New Unread"}
                </span>
              </div>

              <h1 className="text-sm sm:text-base font-black text-zinc-100 leading-relaxed pt-1">
                {notification.text}
              </h1>
            </div>
          </div>
        </div>

        {/* 3. Interactive Target Actions Card */}
        <div className="bg-[#0D0D11] border border-zinc-800/80 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black text-white flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isArabic ? "روابط التفاعل السريع والتوجه" : "Quick Interaction & Redirection Links"}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleNavigateToRelated}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs transition-all active:scale-95 shadow-md shadow-indigo-950/40 border border-indigo-500">
              
              <ExternalLink className="w-4 h-4" />
              <span>
                {notification.type === "follow" ?
                isArabic ? "الانتقال إلى الملف الشخصي للمتابع" : "Go to Follower's Profile" :
                isArabic ? "التوجه للمنشور / المحتوى المتعلق" : "Navigate to Related Post / Content"}
              </span>
            </button>

            <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                // Open community chats or DMs directly
                window.dispatchEvent(new CustomEvent('openLiveSuite', { detail: 'call' }));
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-2xl font-black text-xs transition-all active:scale-95 border border-zinc-800">
              
              <MessageSquare className="w-4 h-4" />
              <span>{isArabic ? "الدردشة والاتصال المباشر" : "Direct Chat & Live Call"}</span>
            </button>
          </div>
        </div>

        {/* 4. Sender details if parsed */}
        {sender &&
        <div className="bg-[#0D0D11] border border-zinc-800/80 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black text-zinc-400">
              {isArabic ? "صاحب التفاعل" : "Triggered By"}
            </h3>
            
            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <img
                src={sender.avatar}
                alt={sender.name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                referrerPolicy="no-referrer" />
              
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">{sender.name}</span>
                  <span className="text-[10px] text-zinc-500 block font-mono">@{sender.username}</span>
                </div>
              </div>

              <button
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                window.dispatchEvent(new CustomEvent('openProfile', { detail: sender.username }));
              }}
              className="text-[10px] font-black px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all active:scale-95">
              
                {isArabic ? "مشاهدة الحساب" : "View Profile"}
              </button>
            </div>
          </div>
        }

        {/* 5. Related Post Preview Card */}
        {relatedPost &&
        <div className="bg-[#0D0D11] border border-zinc-800/80 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black text-zinc-400">
              {isArabic ? "معاينة المنشور الأصلي" : "Original Post Preview"}
            </h3>

            <div className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-900/60 space-y-3">
              <div className="flex items-center gap-2">
                <img
                src={relatedPost.author.avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover border border-zinc-800"
                referrerPolicy="no-referrer" />
              
                <span className="font-bold text-xs text-zinc-300">{relatedPost.author.name}</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {relatedPost.content}
              </p>
              {relatedPost.image &&
            <div className="relative h-28 w-full rounded-xl overflow-hidden border border-zinc-900">
                  <img src={relatedPost.image} alt="Post Attachment" className="w-full h-full object-cover filter brightness-[0.8]" referrerPolicy="no-referrer" />
                </div>
            }
            </div>
          </div>
        }

        {/* 6. Interactive Fast Reply Thread */}
        <div className="bg-[#0D0D11] border border-zinc-800/80 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black text-white flex items-center gap-2">
            <Reply className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isArabic ? "الرد السريع والمناقشة" : "Interactive Fast Reply"}</span>
          </h3>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((preset, _autoIdx) =>
            <button
              key={`${preset}_${_autoIdx}`}
              type="button"
              onClick={() => {
                if (playSynthSound) playSynthSound("tap");
                setReplyText(preset);
              }}
              className="text-[10px] font-semibold px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-850 transition-all active:scale-95">
              
                {preset}
              </button>
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 focus-within:border-indigo-500/80 transition-all">
            <input
              type="text"
              dir="auto"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isArabic ? "اكتب ردك التفاعلي هنا..." : "Type your interactive response..."}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-medium" />
            
            <button
              type="submit"
              disabled={!replyText.trim() || isReplying}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-white disabled:text-zinc-600 rounded-xl transition-all shrink-0 cursor-pointer">
              
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Local Thread Replies Timeline */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
              {isArabic ? "سجل الردود والقرارات" : "Response Thread Log"}
            </span>

            {!notification.replies || notification.replies.length === 0 ?
            <p className="text-center py-6 text-zinc-600 text-[10px]">
                {isArabic ? "لا توجد ردود مسجلة على هذا الإشعار بعد" : "No recorded responses on this notification yet."}
              </p> :

            <div className="space-y-2 border-r border-zinc-850 pr-4">
                {notification.replies.map((rep, _autoIdx) =>
              <div key={`${rep.id}_${_autoIdx}`} className="relative bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                    src={rep.senderAvatar}
                    alt={rep.senderName}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer" />
                  
                      <span className="text-[10px] font-bold text-zinc-300">{rep.senderName}</span>
                      <span className="text-[8px] text-zinc-600 font-mono mr-auto">{rep.createdAt}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{rep.text}</p>
                  </div>
              )}
              </div>
            }
          </div>
        </div>

      </div>
    </motion.div>);

};