import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Search, UserPlus, UserMinus, UserCheck, MessageSquare,
  Shield, Award, Lock, Unlock, Settings, Eye, EyeOff, UserX,
  Check, Trash, MapPin, Languages, Heart, Activity, Globe, Sparkles, Users } from
"lucide-react";
import { db } from "../firebase";
import {
  collection, doc, onSnapshot, query, where, getDocs, limit } from
"firebase/firestore";
import {
  followUser, unfollowUser, cancelFollowRequest, acceptFollowRequest,
  rejectFollowRequest, blockUser, unblockUser, removeFollower, updatePrivacySettings } from
"../followersUtils";

interface FollowersModalProps {
  userId: string;
  type: "followers" | "following";
  isArabic: boolean;
  onClose: () => void;
  onOpenProfile: (userId: string) => void;
  playSynthSound: (type: "tap" | "success" | "error") => void;
  onOpenMessage?: (user: any) => void;
}

export default function FollowersModal({
  userId,
  type,
  isArabic,
  onClose,
  onOpenProfile,
  playSynthSound,
  onOpenMessage
}: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following" | "incoming" | "outgoing" | "suggestions" | "privacy">(type);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Users databases
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [targetUserData, setTargetUserData] = useState<any>(null);

  // Follow relations collections
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);

  // Real-time snapshot bindings
  useEffect(() => {
    setLoading(true);

    // 1. Listen to all users
    const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const uList = snapshot.docs.map((doc, _autoIdx) => ({ id: doc.id, ...doc.data() }));
      setAllUsers(uList);

      const current = uList.find((u) => u.id === userId);
      if (current) setCurrentUserData(current);

      setLoading(false);
    });

    // 2. Listen to incoming requests for this user
    const incomingQ = query(collection(db, "followRequests"), where("receiverId", "==", userId), where("status", "==", "pending"));
    const incomingUnsub = onSnapshot(incomingQ, (snapshot) => {
      setIncomingRequests(snapshot.docs.map((doc, _autoIdx) => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Listen to outgoing requests from this user
    const outgoingQ = query(collection(db, "followRequests"), where("senderId", "==", userId), where("status", "==", "pending"));
    const outgoingUnsub = onSnapshot(outgoingQ, (snapshot) => {
      setOutgoingRequests(snapshot.docs.map((doc, _autoIdx) => ({ id: doc.id, ...doc.data() })));
    });

    // 4. Listen to blocked list for this user
    const blockedQ = query(collection(db, "blockedUsers"), where("blockerId", "==", userId));
    const blockedUnsub = onSnapshot(blockedQ, (snapshot) => {
      setBlockedList(snapshot.docs.map((doc, _autoIdx) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      usersUnsub();
      incomingUnsub();
      outgoingUnsub();
      blockedUnsub();
    };
  }, [userId]);

  // Handle operations with sound & haptics
  const handleAction = async (actionFn: () => Promise<any>) => {
    try {
      playSynthSound("tap");
      const res = await actionFn();
      if (res && res.success) {
        playSynthSound("success");
      } else if (res && res.message) {
        playSynthSound("error");
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      playSynthSound("error");
    }
  };

  // Get direct user profiles
  const currentUserObj = allUsers.find((u) => u.id === userId) || currentUserData || {};

  // Followers list filtered
  const followersList = allUsers.filter((u) =>
  currentUserObj.followers?.includes(u.id) &&
  !blockedList.some((b) => b.blockedId === u.id)
  );

  // Following list filtered
  const followingList = allUsers.filter((u) =>
  currentUserObj.following?.includes(u.id) &&
  !blockedList.some((b) => b.blockedId === u.id)
  );

  // Smart suggestions generation
  const computeSuggestions = () => {
    if (!currentUserObj) return [];

    const myFollowing = currentUserObj.following || [];
    const myBlocked = currentUserObj.blockedUsers || [];
    const myInterests = currentUserObj.tasteProfile ? Object.keys(currentUserObj.tasteProfile) : [];
    const myCountry = currentUserObj.country || "";
    const myLanguage = currentUserObj.language || "";

    return allUsers.
    filter((u) =>
    u.id !== userId && // Not me
    !myFollowing.includes(u.id) && // Not already following
    !currentUserObj.followers?.includes(u.id) && // Not follower to avoid re-suggesting friends
    !myBlocked.includes(u.id) && // Not blocked
    !outgoingRequests.some((r) => r.receiverId === u.id) // No pending request
    ).
    map((u, _autoIdx) => {
      let score = 0;

      // 1. Mutual following score
      const userFollowers = u.followers || [];
      const mutuals = myFollowing.filter((id: string) => userFollowers.includes(id));
      score += mutuals.length * 10;

      // 2. Interest matching score
      const uInterests = u.tasteProfile ? Object.keys(u.tasteProfile) : [];
      const commonInterests = myInterests.filter((tag) => uInterests.includes(tag));
      score += commonInterests.length * 5;

      // 3. Country matching score
      if (myCountry && u.country === myCountry) score += 4;

      // 4. Language matching score
      if (myLanguage && u.language === myLanguage) score += 3;

      // 5. Verification prestige
      if (u.isVerified) score += 5;

      // 6. Content creator bonus
      if (u.role === "Creator" || u.role === "Owner") score += 6;

      return {
        user: u,
        score,
        mutualCount: mutuals.length,
        commonInterests
      };
    }).
    filter((item) => item.score > 0 || allUsers.length < 15) // Fallback for small databases
    .sort((a, b) => b.score - a.score).
    slice(0, 15);
  };

  const suggestionsList = computeSuggestions();

  // Search filter
  const getFilteredList = (list: any[]) => {
    return list.filter((u) => {
      const matchText = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(matchText) ||
        u.username?.toLowerCase().includes(matchText) ||
        u.id?.toLowerCase().includes(matchText));

    });
  };

  // Render users according to active tab
  const getActiveList = () => {
    switch (activeTab) {
      case "followers":
        return getFilteredList(followersList);
      case "following":
        return getFilteredList(followingList);
      case "incoming":
        return incomingRequests.map((req, _autoIdx) => {
          const u = allUsers.find((user) => user.id === req.senderId);
          return u ? { ...u, requestId: req.id } : null;
        }).filter(Boolean);
      case "outgoing":
        return outgoingRequests.map((req, _autoIdx) => {
          const u = allUsers.find((user) => user.id === req.receiverId);
          return u ? { ...u, requestId: req.id } : null;
        }).filter(Boolean);
      case "suggestions":
        return getFilteredList(suggestionsList.map((item, _autoIdx) => item.user));
      default:
        return [];
    }
  };

  const filteredItems = getActiveList();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex justify-center items-end sm:items-center sm:p-4"
        dir={isArabic ? "rtl" : "ltr"}>
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full h-[85vh] sm:h-[680px] sm:max-w-2xl bg-[#09090B] sm:rounded-3xl rounded-t-3xl border border-zinc-800/80 flex flex-col overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-950/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3D00] to-[#FF6E40] flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(255,61,0,0.3)]">
                ★
              </div>
              <div>
                <h2 className="text-white font-black text-base flex items-center gap-1.5">
                  {isArabic ? "مركز المتابعين الاجتماعي" : "Social Followers Hub"}
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-normal">
                    {currentUserObj.username ? `@${currentUserObj.username}` : ""}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-500">
                  {isArabic ? "إدارة علاقاتك، طلبات الخصوصية، واقتراحات الذكاء الاصطناعي" : "Manage relations, privacy, and smart recommendations"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction(async () => {setActiveTab("privacy");return { success: true };})}
                className={`p-2 rounded-full transition-colors ${activeTab === "privacy" ? "bg-[#FF3D00] text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}
                title={isArabic ? "الإعدادات والخصوصية" : "Settings & Privacy"}>
                
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-transform hover:scale-105">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-1 p-2 bg-zinc-950 border-b border-zinc-900 overflow-x-auto shrink-0 scrollbar-none">
            {[
            { id: "followers", labelAr: "المتابعين", labelEn: "Followers", badge: followersList.length },
            { id: "following", labelAr: "المتابَعين", labelEn: "Following", badge: followingList.length },
            { id: "incoming", labelAr: "الواردة", labelEn: "Requests In", badge: incomingRequests.length },
            { id: "outgoing", labelAr: "الصادرة", labelEn: "Requests Out", badge: outgoingRequests.length },
            { id: "suggestions", labelAr: "مقترحة", labelEn: "Suggested", badge: suggestionsList.length, icon: Sparkles }].
            map((tab, _autoIdx) => {
              const Icon = tab.icon;
              return (
                <button
                  key={`foll_tab_${tab.id}_${_autoIdx}`}
                  onClick={() => {
                    playSynthSound("tap");
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id ?
                  "bg-[#FF3D00] text-white shadow-[0_0_10px_rgba(255,61,0,0.25)]" :
                  "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`
                  }>
                  
                  {Icon && <Icon className="w-3.5 h-3.5 animate-pulse text-amber-400" />}
                  {isArabic ? tab.labelAr : tab.labelEn}
                  {tab.badge > 0 &&
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${activeTab === tab.id ? "bg-white text-red-600" : "bg-[#FF3D00] text-white"}`}>
                      {tab.badge}
                    </span>
                  }
                </button>);

            })}
          </div>

          {/* Central Body */}
          {activeTab === "privacy" ? (
          /* Privacy Settings Screen */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0E0E10]">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white border-b border-zinc-800 pb-2 uppercase tracking-wider text-[#FF3D00]">
                  {isArabic ? "خصوصية وأمان الحساب" : "Account Privacy & Security"}
                </h3>

                {/* Private Mode */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-zinc-900 rounded-xl text-amber-500">
                      {currentUserObj.isPrivate ? <Lock className="w-5 h-5 animate-pulse" /> : <Unlock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{isArabic ? "حساب خاص (طلب موافقة)" : "Private Account (Approval Req)"}</div>
                      <div className="text-xs text-zinc-500 max-w-sm">
                        {isArabic ? "عند تفعيله، لن يتمكن أحد من متابعتك مباشرة بل سيرسل طلب متابعة للموافقة أو الرفض" : "When private, users must send follow requests for your approval before they can see your posts"}
                      </div>
                    </div>
                  </div>
                  <button
                  onClick={() => handleAction(() => updatePrivacySettings(userId, { isPrivate: !currentUserObj.isPrivate }))}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors ${currentUserObj.isPrivate ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                  
                    {currentUserObj.isPrivate ? isArabic ? "حساب خاص" : "Private" : isArabic ? "عام" : "Public"}
                  </button>
                </div>

                {/* Show/Hide Followers list */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-zinc-900 rounded-xl text-blue-400">
                      {currentUserObj.showFollowersList !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{isArabic ? "إظهار قائمة المتابعين للعامة" : "Publicly Show Followers List"}</div>
                      <div className="text-xs text-zinc-500 max-w-sm">
                        {isArabic ? "السماح للآخرين برؤية من يتابعك عند تصفح ملفك الشخصي" : "Allow everyone to browse your followers when opening your profile"}
                      </div>
                    </div>
                  </div>
                  <button
                  onClick={() => handleAction(() => updatePrivacySettings(userId, { showFollowersList: currentUserObj.showFollowersList === false }))}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors ${currentUserObj.showFollowersList !== false ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                  
                    {currentUserObj.showFollowersList !== false ? isArabic ? "مفعل" : "Enabled" : isArabic ? "مخفي" : "Hidden"}
                  </button>
                </div>

                {/* Show/Hide Following list */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-zinc-900 rounded-xl text-indigo-400">
                      {currentUserObj.showFollowingList !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{isArabic ? "إظهار قائمة المتابَعين للعامة" : "Publicly Show Following List"}</div>
                      <div className="text-xs text-zinc-500 max-w-sm">
                        {isArabic ? "السماح للآخرين برؤية من تتابع عند زيارة ملفك الشخصي" : "Allow everyone to browse who you follow when opening your profile"}
                      </div>
                    </div>
                  </div>
                  <button
                  onClick={() => handleAction(() => updatePrivacySettings(userId, { showFollowingList: currentUserObj.showFollowingList === false }))}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors ${currentUserObj.showFollowingList !== false ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                  
                    {currentUserObj.showFollowingList !== false ? isArabic ? "مفعل" : "Enabled" : isArabic ? "مخفي" : "Hidden"}
                  </button>
                </div>

                {/* Allow account suggestions */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-zinc-900 rounded-xl text-yellow-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{isArabic ? "تفعيل اقتراح حسابي للآخرين" : "Allow Profile Recommendations"}</div>
                      <div className="text-xs text-zinc-500 max-w-sm">
                        {isArabic ? "السماح لخوارزمية الاقتراحات الذكية بعرض حسابك للأصدقاء المشتركين والأعضاء المشابهين" : "Include your profile in the recommendation engine to gain mutual connections faster"}
                      </div>
                    </div>
                  </div>
                  <button
                  onClick={() => handleAction(() => updatePrivacySettings(userId, { allowSuggestions: currentUserObj.allowSuggestions !== false }))}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors ${currentUserObj.allowSuggestions !== false ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                  
                    {currentUserObj.allowSuggestions !== false ? isArabic ? "مفعل" : "Enabled" : isArabic ? "معطل" : "Disabled"}
                  </button>
                </div>
              </div>

              {/* Blocked Users Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-900">
                <h3 className="text-sm font-black text-white flex items-center gap-2 text-red-500">
                  <UserX className="w-4 h-4" />
                  {isArabic ? "إدارة المستخدمين المحظورين" : "Blocked Users Management"}
                </h3>
                {allUsers.filter((u) => currentUserObj.blockedUsers?.includes(u.id)).length === 0 ?
              <p className="text-xs text-zinc-500 italic p-3 text-center bg-zinc-900/10 rounded-xl border border-zinc-900">
                    {isArabic ? "لا يوجد أي مستخدم محظور حالياً" : "You have not blocked any users yet"}
                  </p> :

              <div className="space-y-2">
                    {allUsers.filter((u) => currentUserObj.blockedUsers?.includes(u.id)).map((blockedUser, _autoIdx) =>
                <div key={`${blockedUser.id}_${_autoIdx}`} className="flex items-center justify-between p-3 bg-zinc-950/80 rounded-2xl border border-zinc-900">
                        <div className="flex items-center gap-3">
                          <img src={blockedUser.avatar} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-white text-xs">{blockedUser.name}</div>
                            <div className="text-zinc-500 text-[10px]">@{blockedUser.username}</div>
                          </div>
                        </div>
                        <button
                    onClick={() => handleAction(() => unblockUser(userId, blockedUser.id))}
                    className="px-3 py-1 bg-red-950/40 border border-red-900/60 text-red-400 rounded-xl text-[10px] font-bold hover:bg-red-900 hover:text-white transition-colors">
                    
                          {isArabic ? "إلغاء الحظر" : "Unblock"}
                        </button>
                      </div>
                )}
                  </div>
              }
              </div>
            </div>) : (

          /* Lists Display System */
          <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search Inside Active Tab */}
              <div className="p-3 bg-zinc-950/60 border-b border-zinc-900/80 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                  isArabic ?
                  `البحث بالاسم أو اسم المستخدم داخل القائمة...` :
                  "Search by name, username or ID..."
                  }
                  className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF3D00] placeholder-zinc-500 transition-colors" />
                
                </div>
              </div>

              {/* Infinite/Lazy Items Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#08080A]">
                {loading ?
              <div className="flex items-center justify-center py-20">
                    <div className="w-7 h-7 border-2 border-[#FF3D00] border-t-transparent rounded-full animate-spin" />
                  </div> :
              filteredItems.length === 0 ?
              <div className="text-center py-24 text-zinc-500">
                    <div className="w-12 h-12 rounded-full bg-zinc-900/60 flex items-center justify-center mx-auto mb-3 border border-zinc-800/50">
                      <Search className="w-5 h-5 text-zinc-600" />
                    </div>
                    <p className="text-xs font-bold text-zinc-400">
                      {search ? isArabic ? "لا توجد نتائج مطابقة" : "No matching results found" : isArabic ? "القائمة فارغة حالياً" : "List is empty at this moment"}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {isArabic ? "تأكد من كتابة الأحرف بشكل صحيح" : "Try typing keywords to find members"}
                    </p>
                  </div> :

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredItems.map((user, _autoIdx) => {
                  const isMeFollowing = currentUserObj.following?.includes(user.id);
                  const isMeRequested = outgoingRequests.some((r) => r.receiverId === user.id);
                  const userFollowersLength = user.followers?.length || 0;
                  const hasMutuals = suggestionsList.find((s) => s.user.id === user.id)?.mutualCount || 0;
                  const commonInterests = suggestionsList.find((s) => s.user.id === user.id)?.commonInterests || [];

                  return (
                    <div
                      key={`${user.id}_${_autoIdx}`}
                      className="group relative bg-[#0E0E10] hover:bg-[#121214] border border-zinc-800/60 hover:border-zinc-700/60 rounded-2xl overflow-hidden transition-all duration-300 p-3.5 flex flex-col justify-between">
                      
                          {/* Mini Cover Photo Overlay */}
                          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-[#FF3D00]/10 to-transparent group-hover:from-[#FF3D00]/15 transition-all duration-300" />

                          {/* Profile Data Header */}
                          <div className="flex gap-3 items-start relative z-10">
                            {/* Avatar with live status dot */}
                            <div className="relative">
                              <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} className="w-12 h-12 rounded-2xl object-cover border border-zinc-800" />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090B] ${user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
                            </div>

                            {/* Name and Metadata */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-xs truncate group-hover:text-[#FF3D00] transition-colors">{user.name}</span>
                                {user.isVerified &&
                            <span className="p-0.5 bg-cyan-950/80 rounded-md border border-cyan-800/40 text-[9px] text-cyan-400 font-extrabold flex items-center">
                                    ✓
                                  </span>
                            }
                                {user.role === "Owner" &&
                            <span className="px-1.5 py-0.2 bg-red-950/80 text-red-400 border border-red-900/40 text-[8px] font-black rounded-md">
                                    STAFF
                                  </span>
                            }
                              </div>
                              <div className="text-[10px] text-zinc-500">@{user.username}</div>
                              
                              {/* Followers & posts dynamic counts */}
                              <div className="flex gap-2.5 mt-1 font-mono text-[9px] text-zinc-400">
                                <span>{userFollowersLength} {isArabic ? "متابع" : "followers"}</span>
                                <span className="text-zinc-700">•</span>
                                <span>{user.postsCount || 0} {isArabic ? "منشور" : "posts"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Biography or dynamic Mutual indicators */}
                          <div className="mt-2.5 min-h-[30px] relative z-10">
                            {activeTab === "suggestions" && hasMutuals > 0 ?
                        <div className="flex items-center gap-1.5 text-[#FF3D00] text-[10px] bg-[#FF3D00]/5 px-2.5 py-1 rounded-xl w-fit">
                                <Users className="w-3.5 h-3.5" />
                                <span>{hasMutuals} {isArabic ? "صديق مشترك" : "mutual connection(s)"}</span>
                              </div> :
                        activeTab === "suggestions" && commonInterests.length > 0 ?
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] bg-amber-500/5 px-2.5 py-1 rounded-xl w-fit">
                                <Heart className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[150px]">{isArabic ? "اهتمام مشترك:" : "Interests:"} {commonInterests.join(', ')}</span>
                              </div> :

                        <p className="text-zinc-400 text-[11px] line-clamp-2 italic leading-relaxed">
                                {user.bio || (isArabic ? "لا توجد نبذة تعريفية" : "No biography added")}
                              </p>
                        }
                          </div>

                          {/* Quick Interactive Actions Area */}
                          <div className="mt-3.5 pt-2.5 border-t border-zinc-900/80 flex items-center justify-between gap-1.5 relative z-10">
                            {/* Primary Navigation button */}
                            <button
                          onClick={() => {
                            playSynthSound("tap");
                            onOpenProfile(user.id);
                          }}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1">
                          
                              <span>{isArabic ? "الملف الشخصي" : "Profile"}</span>
                            </button>

                            {/* Relationship Trigger Buttons */}
                            <div className="flex gap-1.5">
                              {/* Message Button if allowed */}
                              {onOpenMessage && user.id !== userId &&
                          <button
                            onClick={() => {
                              playSynthSound("tap");
                              onOpenMessage(user);
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-[#FF3D00]/10 text-zinc-400 hover:text-[#FF3D00] rounded-xl transition-colors"
                            title={isArabic ? "مراسلة فورية" : "Direct Message"}>
                            
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                          }

                              {activeTab === "incoming" ?
                          <>
                                  <button
                              onClick={() => handleAction(() => acceptFollowRequest(user.requestId, userId, user.id))}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 transition-colors shadow-lg">
                              
                                    <Check className="w-3 h-3" />
                                    <span>{isArabic ? "قبول" : "Accept"}</span>
                                  </button>
                                  <button
                              onClick={() => handleAction(() => rejectFollowRequest(user.requestId))}
                              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-[10px] flex items-center gap-1 transition-colors">
                              
                                    <Trash className="w-3 h-3" />
                                    <span>{isArabic ? "رفض" : "Reject"}</span>
                                  </button>
                                </> :
                          activeTab === "outgoing" ?
                          <button
                            onClick={() => handleAction(() => cancelFollowRequest(userId, user.id))}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-[10px] transition-colors">
                            
                                  <span>{isArabic ? "إلغاء الطلب" : "Cancel"}</span>
                                </button> :
                          activeTab === "followers" ?
                          <div className="flex gap-1">
                                  {isMeFollowing ?
                            <button
                              onClick={() => handleAction(() => unfollowUser(userId, user.id))}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 text-zinc-300 font-bold rounded-xl text-[10px] transition-all">
                              
                                      {isArabic ? "يتابع" : "Following"}
                                    </button> :

                            <button
                              onClick={() => handleAction(() => followUser(userId, user.id, user.isPrivate))}
                              className="px-2.5 py-1 bg-[#FF3D00] hover:bg-[#FF3D00]/80 text-white font-bold rounded-xl text-[10px] transition-all">
                              
                                      {isArabic ? "رد المتابعة" : "Follow Back"}
                                    </button>
                            }
                                  <button
                              onClick={() => handleAction(() => removeFollower(userId, user.id))}
                              className="p-1.5 bg-zinc-900 hover:bg-red-950 hover:text-red-400 rounded-xl transition-colors"
                              title={isArabic ? "إزالة المتابع" : "Remove Follower"}>
                              
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                </div> :
                          user.id !== userId ?
                          isMeFollowing ?
                          <button
                            onClick={() => handleAction(() => unfollowUser(userId, user.id))}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 text-zinc-300 font-bold rounded-xl text-[10px] transition-all flex items-center gap-1">
                            
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "يتابع" : "Following"}</span>
                                  </button> :
                          isMeRequested ?
                          <button
                            onClick={() => handleAction(() => cancelFollowRequest(userId, user.id))}
                            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-[10px] transition-all">
                            
                                    <span>{isArabic ? "معلق" : "Requested"}</span>
                                  </button> :

                          <button
                            onClick={() => handleAction(() => followUser(userId, user.id, user.isPrivate))}
                            className="px-3 py-1.5 bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-black rounded-xl text-[10px] transition-all flex items-center gap-1 shadow-lg">
                            
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "متابعة" : "Follow"}</span>
                                  </button> :

                          null}

                              {/* Block button inside cards for safety */}
                              {user.id !== userId &&
                          <button
                            onClick={() => handleAction(() => blockUser(userId, user.id))}
                            className="p-1.5 bg-zinc-900 hover:bg-red-950 hover:text-red-400 rounded-xl transition-colors"
                            title={isArabic ? "حظر" : "Block User"}>
                            
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                          }
                            </div>
                          </div>
                        </div>);

                })}
                  </div>
              }
              </div>
            </div>)
          }
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}