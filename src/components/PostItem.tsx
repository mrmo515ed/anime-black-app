import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, MessageSquare, Share2, Bookmark, Eye, Repeat, Star, Coins, 
  MoreVertical, Flag, UserMinus, VolumeX, EyeOff, ShieldAlert, Pin, 
  Lock, Unlock, Download, RotateCcw, AlertTriangle, UserX, FileText, Check, Edit2, Trash2, Copy, FolderPlus, Send,
  Clock, Calendar, Globe, Users, ShieldCheck, Sparkles
} from "lucide-react";
import { Post, User } from "../types";
import { UniversalReactions } from "./UniversalReactions";
import LevelBadge from "./LevelBadge";
import { formatFriendlyDate } from "../utils/dateFormatter";

interface PostItemProps {
  post: Post;
  currentUser: User;
  isArabic: boolean;
  playSynthSound: (sound: string) => void;
  triggerHapticFeedback: (type: string) => void;
  triggerInAppNotification: (title: string, msg: string, icon: string) => void;
  onUpdatePost: (updatedPost: Post) => void;
  onDeletePost?: (postId: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  currentUser,
  isArabic,
  playSynthSound,
  triggerHapticFeedback,
  triggerInAppNotification,
  onUpdatePost,
  onDeletePost
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [revealFlagged, setRevealFlagged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post?.content || "");
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsList, setCommentsList] = useState<any[]>(post?.comments || []);
  const commentTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isOwner = currentUser?.username === post?.author?.username;
  const isMod = currentUser?.role === "Owner" || currentUser?.role === "Moderator" || currentUser?.role === "Admin";

  // Format post publication timestamp
  const postTimeInfo = formatFriendlyDate(post?.createdAt, isArabic);

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    playSynthSound("success");
    triggerHapticFeedback("tap");

    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      author: {
        name: currentUser?.name || currentUser?.username || "Anonymous",
        username: currentUser?.username || "user",
        avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        level: currentUser?.rankLevel || currentUser?.level || 10
      }
    };

    const updatedComments = [...commentsList, newComment];
    setCommentsList(updatedComments);
    setNewCommentText("");
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = "auto";
    }

    onUpdatePost({
      ...post,
      comments: updatedComments
    });

    triggerInAppNotification(
      isArabic ? "تعليق جديد" : "Comment Added",
      isArabic ? "تم إضافة تعليقك بنجاح" : "Your comment has been posted",
      "💬"
    );
  };

  const handleSaveEdit = () => {
    if (!editedContent.trim()) return;
    playSynthSound("success");
    triggerHapticFeedback("success");
    setIsEditing(false);
    onUpdatePost({
      ...post,
      content: editedContent,
      isEdited: true
    });
    triggerInAppNotification(
      isArabic ? "تم التعديل" : "Post Edited",
      isArabic ? "تم حفظ تعديلات المنشور بنجاح" : "Post changes saved successfully",
      "📝"
    );
  };

  const handleLike = () => {
    playSynthSound("tap");
    triggerHapticFeedback("tap");
    onUpdatePost({ ...post, likes: Math.max(0, (post?.likes || 0) + (post?.hasLiked ? -1 : 1)), hasLiked: !post?.hasLiked });
  };

  const handleShare = () => {
    playSynthSound("success");
    triggerInAppNotification(
      isArabic ? "تم النسخ" : "Copied",
      isArabic ? "تم نسخ رابط المنشور" : "Post link copied to clipboard!",
      "🔗"
    );
    setShowOptions(false);
  };

  const handleSave = () => {
    playSynthSound("tap");
    triggerInAppNotification(
      isArabic ? "تم الحفظ" : "Saved",
      isArabic ? "تم حفظ المنشور بنجاح" : "Post saved successfully",
      "🔖"
    );
    onUpdatePost({ ...post, saves: (post?.saves || 0) + 1 });
    setShowOptions(false);
  };

  const handleRepost = () => {
    playSynthSound("tap");
    triggerInAppNotification(
      isArabic ? "تمت إعادة النشر" : "Reposted",
      isArabic ? "تمت إعادة نشر المنشور" : "Post has been reposted",
      "🔁"
    );
    onUpdatePost({ ...post, reposts: (post?.reposts || 0) + 1 });
  };
  
  const handleStar = () => {
    playSynthSound("tap");
    triggerInAppNotification(
      isArabic ? "تم التقييم بنجمة" : "Starred",
      isArabic ? "منحت هذا المنشور نجمة" : "You starred this post",
      "⭐"
    );
    onUpdatePost({ ...post, stars: (post?.stars || 0) + 1 });
  };

  const handleCoin = () => {
    playSynthSound("tap");
    triggerInAppNotification(
      isArabic ? "تم دعم المنشور" : "Supported",
      isArabic ? "أرسلت عملات سوداء لهذا المنشور" : "You sent Black Coins to this post",
      "🪙"
    );
    onUpdatePost({ ...post, coins: (post?.coins || 0) + 5 });
  };

  const OptionItem = ({ icon: Icon, label, onClick, danger = false }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
        danger 
          ? "text-red-500 hover:bg-red-500/10" 
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.012, y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-[#121212] rounded-2xl p-4 border border-[#2A2A2A] shadow-md space-y-3.5 relative group transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl"
    >
      {/* Post Header */}
      <div className="flex justify-between items-start gap-2">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            playSynthSound("tap");
            window.dispatchEvent(new CustomEvent('openProfile', { detail: (post as any).authorId || (post?.author as any).uid || post?.author?.username }));
          }}
        >
          <div className="relative shrink-0">
            <img 
              src={post?.author?.avatar} 
              alt="Post Author" 
              className="w-10 h-10 rounded-full object-cover border border-zinc-700 shadow-sm" 
            />
            {postTimeInfo.isRecent && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#121212] rounded-full animate-pulse" title={isArabic ? "منشور حديث" : "Recent post"} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-white truncate max-w-[150px] sm:max-w-[220px]">{post?.author?.name}</span>
              <LevelBadge level={(post?.author as any)?.level || (post?.author as any)?.rankLevel || 12} size="xs" />
            </div>

            {/* Author Handle & Prominent Publication Time Row */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-zinc-400">
              <span className="text-[11px] text-zinc-500 font-mono">@{post?.author?.username}</span>
              
              <span className="text-[8px] text-zinc-600">•</span>
              
              {/* Publication Time Badge */}
              <div 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/40 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-colors cursor-help"
                title={`${isArabic ? "وقت وتاريخ النشر الدقيق:" : "Exact publication date & time:"} ${postTimeInfo.fullDateTime}`}
              >
                <Clock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                <span className="font-medium">{postTimeInfo.displayDate}</span>
              </div>

              {/* Audience Badge */}
              {post?.audience && (
                <>
                  <span className="text-[8px] text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 font-mono capitalize">
                    {post?.audience === "public" ? (
                      <Globe className="w-2.5 h-2.5 text-blue-400" />
                    ) : (
                      <Users className="w-2.5 h-2.5 text-purple-400" />
                    )}
                    <span>{post?.audience}</span>
                  </span>
                </>
              )}

              {/* Edited Badge */}
              {post?.isEdited && (
                <>
                  <span className="text-[8px] text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400/90 font-mono italic">
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>{isArabic ? "معدل" : "Edited"}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Options Menu Button */}
        <div className="relative shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title={isArabic ? "خيارات المنشور" : "Post options"}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-8 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden max-h-80 overflow-y-auto"
                >
                  <div className="space-y-1">
                    <OptionItem icon={Bookmark} label={isArabic ? "حفظ" : "Save"} onClick={handleSave} />
                    <OptionItem icon={FolderPlus} label={isArabic ? "إضافة إلى مجلد" : "Add to Folder"} onClick={handleSave} />
                    <OptionItem icon={Share2} label={isArabic ? "مشاركة" : "Share"} onClick={handleShare} />
                    <OptionItem icon={Copy} label={isArabic ? "نسخ الرابط" : "Copy Link"} onClick={handleShare} />
                    
                    <div className="h-px bg-zinc-800 my-1"></div>
                    
                    <OptionItem icon={EyeOff} label={isArabic ? "إخفاء المنشور" : "Hide Post"} onClick={() => setShowOptions(false)} />
                    <OptionItem icon={VolumeX} label={isArabic ? "كتم المستخدم" : "Mute User"} onClick={() => setShowOptions(false)} />
                    <OptionItem icon={UserMinus} label={isArabic ? "إلغاء متابعة" : "Unfollow"} onClick={() => setShowOptions(false)} />
                    <OptionItem icon={Flag} label={isArabic ? "الإبلاغ" : "Report"} danger onClick={() => setShowOptions(false)} />

                    {isOwner && (
                      <>
                        <div className="h-px bg-zinc-800 my-1"></div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1">{isArabic ? "خيارات المنشئ" : "Creator Options"}</p>
                        <OptionItem icon={Edit2} label={isArabic ? "تعديل" : "Edit"} onClick={() => { setIsEditing(true); setEditedContent(post?.content || ""); setShowOptions(false); }} />
                        <OptionItem icon={Pin} label={isArabic ? "تثبيت في الملف الشخصي" : "Pin to Profile"} onClick={() => setShowOptions(false)} />
                        <OptionItem icon={Trash2} label={isArabic ? "حذف" : "Delete"} danger onClick={() => { if (onDeletePost) { onDeletePost(post.id); } setShowOptions(false); }} />
                      </>
                    )}

                    {isMod && (
                      <>
                        <div className="h-px bg-red-900/50 my-1"></div>
                        <p className="text-[10px] uppercase font-bold text-red-500 px-3 py-1">{isArabic ? "إدارة إشرافية" : "Moderation"}</p>
                        <OptionItem icon={ShieldAlert} label={isArabic ? "مراجعة المنشور" : "Review Post"} onClick={() => setShowOptions(false)} />
                        <OptionItem icon={Lock} label={isArabic ? "قفل التعليقات" : "Lock Comments"} onClick={() => setShowOptions(false)} />
                        <OptionItem icon={AlertTriangle} label={isArabic ? "إنذار المستخدم" : "Warn User"} danger onClick={() => setShowOptions(false)} />
                        <OptionItem icon={UserX} label={isArabic ? "حظر المستخدم" : "Ban User"} danger onClick={() => setShowOptions(false)} />
                        <OptionItem icon={Trash2} label={isArabic ? "حذف إداري" : "Mod Delete"} danger onClick={() => { if (onDeletePost) { onDeletePost(post.id); } setShowOptions(false); }} />
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post content body */}
      {isEditing ? (
        <div className="space-y-2.5 mt-2 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[90px] p-2.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 font-sans resize-y leading-relaxed"
            placeholder={isArabic ? "تعديل محتوى المنشور..." : "Edit post content..."}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md flex items-center gap-1 transition-all"
            >
              <Check className="w-3 h-3" />
              <span>{isArabic ? "حفظ التعديلات" : "Save Changes"}</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-850 hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-all"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      ) : post?.flagged && !revealFlagged ? (
        <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-3.5 space-y-2.5 my-2">
          <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              {isArabic 
                ? "تم حظر هذا المحتوى للمراجعة" 
                : "Content Flagged for Moderation Review"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            {isArabic 
              ? "يحتوي هذا المنشور على محتوى قد يكون غير لائق (مثل خطاب الكراهية، السبام، أو العنف) وفقاً لمعايير الذكاء الاصطناعي."
              : "This post was flagged by our real-time AI safety filters and is pending human administrator review."}
          </p>
          <button
            onClick={() => {
              playSynthSound("tap");
              setRevealFlagged(true);
            }}
            className="text-[10px] font-black uppercase tracking-wider text-red-200 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            {isArabic ? "عرض المنشور على أي حال" : "Reveal Content Anyway"}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line break-words">{post?.content}</p>
          {post?.flagged && (
            <div className="inline-flex items-center gap-1.5 mt-1.5 text-[9px] font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span>⚠️ {isArabic ? "محتوى حساس مكشوف" : "Sensitive Content Revealed"}</span>
            </div>
          )}
        </>
      )}
      
      {/* Post Tags if any */}
      {post?.tags && post?.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {post?.tags.map((tag, idx) => (
            <span key={`post_tag_${tag}_${idx}`} className="text-[10px] font-mono text-blue-400 hover:text-blue-300 cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post attachment cover */}
      {post?.image && (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black mt-3 relative group/img cursor-pointer">
          <img src={post?.image} alt="Attachment" className="w-full max-h-96 object-contain" />
        </div>
      )}

      {/* Rich Interaction Bar - Cleanly Organized & Responsive */}
      <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
        {/* Left Group: Primary Social Engagement */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="bg-[#18181e] p-0.5 rounded-xl border border-zinc-800/80 shadow-sm flex items-center">
            <UniversalReactions
              targetId={post.id}
              targetType="post"
              currentUser={currentUser}
              isArabic={isArabic}
              authorId={post.authorId || post.author?.id || post.author?.username}
              triggerInAppNotification={triggerInAppNotification}
            />
          </div>
          
          <button 
            onClick={() => {
              playSynthSound?.("tap");
              setShowComments(!showComments);
            }} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              showComments 
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]" 
                : "bg-[#18181e] text-zinc-400 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 hover:bg-blue-500/10"
            }`}
            title={isArabic ? "التعليقات" : "Comments"}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono">{commentsList.length}</span>
          </button>

          <button 
            onClick={handleRepost} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#18181e] text-zinc-400 hover:text-emerald-400 border border-zinc-800/80 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all cursor-pointer active:scale-95"
            title={isArabic ? "إعادة نشر" : "Repost"}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="font-mono">{post?.reposts || 0}</span>
          </button>
        </div>

        {/* Right Group: Support & Value Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            onClick={handleStar} 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#18181e] text-zinc-400 hover:text-yellow-400 border border-zinc-800/80 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all cursor-pointer active:scale-95" 
            title={isArabic ? "منح نجمة" : "Give a Star"}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400/80 fill-yellow-400/10" />
            <span className="font-mono text-[11px]">{post?.stars || 0}</span>
          </button>

          <button 
            onClick={handleCoin} 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#18181e] text-zinc-400 hover:text-purple-400 border border-zinc-800/80 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all cursor-pointer active:scale-95" 
            title={isArabic ? "دعم بالكوينز" : "Send Black Coins"}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">{post?.coins || 0}</span>
          </button>

          <button 
            onClick={handleSave} 
            className="flex items-center justify-center p-1.5 rounded-xl bg-[#18181e] text-zinc-400 hover:text-amber-400 border border-zinc-800/80 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all cursor-pointer active:scale-95" 
            title={isArabic ? "حفظ المنشور" : "Save Post"}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={handleShare} 
            className="flex items-center justify-center p-1.5 rounded-xl bg-[#18181e] text-zinc-400 hover:text-cyan-400 border border-zinc-800/80 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer active:scale-95" 
            title={isArabic ? "مشاركة" : "Share Post"}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Views and Timestamp Footer Summary */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1 pt-1 border-t border-zinc-900/60">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-zinc-600" />
          <span>{post?.views || Math.floor(Math.random() * 5000) + 100} {isArabic ? "مشاهدة" : "views"}</span>
        </div>
        
        <div 
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help"
          title={postTimeInfo.fullDateTime}
        >
          <Calendar className="w-3 h-3 text-zinc-600" />
          <span>{postTimeInfo.relative}</span>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-800/80 pt-3 space-y-3 overflow-hidden"
          >
            {/* Comment Input Box */}
            <div className="flex items-start gap-2.5 bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-2xl">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                alt="Your Avatar"
                className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
              />
              <div className="flex-1 flex gap-2 items-end">
                <textarea
                  ref={commentTextareaRef}
                  rows={1}
                  dir="auto"
                  value={newCommentText}
                  onChange={(e) => {
                    setNewCommentText(e.target.value);
                    if (commentTextareaRef.current) {
                      commentTextareaRef.current.style.height = "auto";
                      commentTextareaRef.current.style.height = `${Math.min(commentTextareaRef.current.scrollHeight, 100)}px`;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder={isArabic ? "اكتب تعليقاً على المنشور..." : "Write a comment on this post..."}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none resize-none max-h-24 min-h-[36px] py-1.5 scrollbar-hide font-medium leading-relaxed"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                  className="p-2 bg-[#FF3D00] hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {commentsList.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-zinc-500 italic">
                  {isArabic ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet. Be the first to comment!"}
                </div>
              ) : (
                commentsList.map((comment: any, idx: number) => {
                  const commentTimeInfo = formatFriendlyDate(comment.createdAt, isArabic);
                  return (
                    <div
                      key={comment.id || idx}
                      className="bg-zinc-900/60 border border-zinc-800/60 p-2.5 rounded-xl space-y-1 transition-colors hover:border-zinc-700/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={comment.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                            alt="Commenter"
                            className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                          />
                          <span className="text-xs font-bold text-white">{comment.author?.name || "User"}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">@{comment.author?.username || "user"}</span>
                        </div>
                        
                        <div 
                          className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono cursor-help"
                          title={commentTimeInfo.fullDateTime}
                        >
                          <Clock className="w-2.5 h-2.5 text-zinc-600" />
                          <span>{commentTimeInfo.relative}</span>
                        </div>
                      </div>
                      <p dir="auto" className="text-xs text-zinc-200 leading-relaxed px-1">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

