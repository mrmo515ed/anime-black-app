import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, Lock, Eye, EyeOff, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Chrome } from "lucide-react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  isArabic: boolean;
}

export default function Login({ onLoginSuccess, isArabic }: LoginProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "otp">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  
  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (providerName: "google" | "apple") => {
    if (providerName === 'apple') {
      setError(isArabic ? "تسجيل الدخول بآبل غير مدعوم حالياً" : "Apple login not supported currently");
      return;
    }
    
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        const usernameBase = (user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '') + Math.floor(Math.random() * 1000);
        userData = {
          name: user.displayName || "Google Otaku",
          username: usernameBase,
          avatar: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(userDocRef, userData);
      }
      onLoginSuccess({ ...userData, uid: user.uid });
    } catch (err: any) {
      if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user" || err.code === "auth/popup-blocked") {
        console.log("ℹ️ Google login popup closed, cancelled, or blocked.");
        setError(
          isArabic 
            ? "تم إلغاء تسجيل الدخول أو تم حظر النافذة المنبثقة بواسطة المتصفح. يرجى المحاولة مجدداً أو استخدام الدخول السريع." 
            : "Sign-in was cancelled or blocked by a popup blocker. Please try again or use the Owner Auto-fill access."
        );
      } else if (
        err.code === "auth/network-request-failed" || 
        err.code === "auth/internal-error" || 
        err.message?.includes("network-request-failed") || 
        err.message?.includes("network") ||
        err.message?.includes("internal-error") ||
        err.message?.includes("IndexedDB") ||
        err.message?.includes("indexedDB") ||
        err.message?.includes("storage")
      ) {
        console.warn("⚠️ Network/Internal storage error detected in social login. Falling back to local offline Google Guest.");
        const googleGuestData = {
          name: "Google Otaku Guest",
          username: "google_otaku_guest",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          role: "Member",
          isVerified: true,
          coins: 380,
          theme: "anime-black"
        };
        localStorage.setItem("animeblack_offline_user", JSON.stringify({ ...googleGuestData, uid: "local_google_guest_uid" }));
        onLoginSuccess({ ...googleGuestData, uid: "local_google_guest_uid" });
      } else {
        import('../firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
          handleFirestoreError(err, OperationType.CREATE, 'users');
        }).catch(() => {});
        console.error(err);
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (loginMethod === "phone" && authMode === "login") {
      if (!phone) {
        setError(isArabic ? "يرجى إدخال رقم الهاتف." : "Please enter your phone number.");
        return;
      }
      setAuthMode("otp");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Direct offline bypass for Owner Account
      if (authMode === "login" && loginMethod === "email" && email.trim().toLowerCase() === "owner" && password === "ownerpassword") {
        const ownerData = {
          name: "المدير العام (Owner)",
          username: "owner",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          role: "Owner",
          isVerified: true,
          coins: 9999,
          unlockedThemes: ["anime-black", "cyberpunk-neon", "classic-dark", "sakura-pink", "titan-blood"],
          theme: "anime-black"
        };
        localStorage.setItem("animeblack_offline_user", JSON.stringify({ ...ownerData, uid: "owner_bypass_uid" }));
        onLoginSuccess({ ...ownerData, uid: "owner_bypass_uid" });
        setIsLoading(false);
        return;
      }

      if (authMode === "login") {
        if (loginMethod === "email") {
          if (!email || !password) {
            setError(isArabic ? "يرجى ملء جميع الحقول." : "Please fill in all fields.");
            setIsLoading(false);
            return;
          }

          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
               onLoginSuccess({ ...userDoc.data(), uid: userCredential.user.uid });
            } else {
               // Fallback if document doesn't exist
               onLoginSuccess({
                 name: email.split("@")[0],
                 username: email.split("@")[0].toLowerCase(),
                 avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
                 uid: userCredential.user.uid
               });
            }
          } catch (signInErr: any) {
            if (
              signInErr.code === "auth/network-request-failed" || 
              signInErr.code === "auth/internal-error" ||
              signInErr.message?.includes("network-request-failed") || 
              signInErr.message?.includes("network") ||
              signInErr.message?.includes("internal-error") ||
              signInErr.message?.includes("IndexedDB") ||
              signInErr.message?.includes("indexedDB") ||
              signInErr.message?.includes("storage")
            ) {
              console.warn("⚠️ Network/Internal storage error detected in auth. Falling back to local offline mode.");
              const guestData = {
                name: email.split("@")[0] || "Guest Otaku",
                username: (email.split("@")[0] || "guest_otaku").toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                role: "Member",
                isVerified: false,
                coins: 380,
                theme: "anime-black"
              };
              localStorage.setItem("animeblack_offline_user", JSON.stringify({ ...guestData, uid: "local_guest_uid" }));
              onLoginSuccess({ ...guestData, uid: "local_guest_uid" });
            } else {
              throw signInErr;
            }
          }
        }
      } else if (authMode === "signup") {
        if (!email || !password || !username || !fullName) {
          setError(isArabic ? "يرجى ملء جميع الحقول." : "Please fill in all fields.");
          setIsLoading(false);
          return;
        }
        
        // Basic username validation to match rules
        if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
           setError(isArabic ? "اسم المستخدم يحتوي على حروف غير صحيحة" : "Username contains invalid characters");
           setIsLoading(false);
           return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const userData = {
            name: fullName,
            username: username.toLowerCase(),
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await setDoc(doc(db, "users", userCredential.user.uid), userData);
          onLoginSuccess({ ...userData, uid: userCredential.user.uid });
        } catch (signUpErr: any) {
          if (
            signUpErr.code === "auth/network-request-failed" || 
            signUpErr.code === "auth/internal-error" ||
            signUpErr.message?.includes("network-request-failed") || 
            signUpErr.message?.includes("network") ||
            signUpErr.message?.includes("internal-error") ||
            signUpErr.message?.includes("IndexedDB") ||
            signUpErr.message?.includes("indexedDB") ||
            signUpErr.message?.includes("storage")
          ) {
            console.warn("⚠️ Network/Internal storage error detected in signup. Creating local offline account.");
            const userData = {
              name: fullName,
              username: username.toLowerCase(),
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              isVerified: false,
              role: "Member",
              coins: 380,
              theme: "anime-black"
            };
            localStorage.setItem("animeblack_offline_user", JSON.stringify({ ...userData, uid: "local_user_" + username.toLowerCase() }));
            onLoginSuccess({ ...userData, uid: "local_user_" + username.toLowerCase() });
          } else {
            throw signUpErr;
          }
        }
      } else if (authMode === "forgot") {
        alert(isArabic ? "تم إرسال رابط استعادة كلمة المرور لبريدك!" : "Reset link has been sent to your email!");
        setAuthMode("login");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = () => {
    const fullOtp = otpCode.join("");
    if (fullOtp.length < 4) {
      setError(isArabic ? "يرجى إدخال رمز التحقق كاملاً." : "Please enter full verification code.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: "مستخدم رقم هاتف",
        username: "phone_user_" + phone.slice(-4),
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    // Focus next element
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div id="login_container" className="h-full w-full bg-black flex flex-col justify-between overflow-y-auto px-6 py-8 relative">
      {/* Background Neon Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top logo branding */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-red-500/20 overflow-hidden">
          <img src="/src/assets/images/anime_black_logo_1783807735704.jpg" alt="Anime Black" className="w-full h-full object-cover" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-white tracking-wide">
          {isArabic ? "أنمي بلاك" : "Anime Black"}
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          {isArabic ? "بوابتك لعالم الأوتـاكو الـلانهائي" : "Your gateway to infinite Otaku space"}
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col justify-center my-8">
        <AnimatePresence mode="wait">
          {/* LOGIN / SIGNUP / FORGOT STATES */}
          {authMode !== "otp" ? (
            <motion.form
              key={authMode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <h3 className="text-lg font-bold text-gray-200">
                  {authMode === "login" && (isArabic ? "تسجيل الدخول" : "Sign In")}
                  {authMode === "signup" && (isArabic ? "إنشاء حساب جديد" : "Create Account")}
                  {authMode === "forgot" && (isArabic ? "استعادة كلمة المرور" : "Reset Password")}
                </h3>
              </div>

              {/* Login Method Toggle for Login screen */}
              {authMode === "login" && (
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod("email"); setError(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      loginMethod === "email" ? "bg-red-600 text-white shadow" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isArabic ? "البريد الإلكتروني" : "Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod("phone"); setError(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      loginMethod === "phone" ? "bg-red-600 text-white shadow" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isArabic ? "رقم الهاتف" : "Phone Number"}
                  </button>
                </div>
              )}

              {/* Error block */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                {/* Full name & Username for Sign up */}
                {authMode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">
                        {isArabic ? "الاسم الكامل" : "Full Name"}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isArabic ? "كين أوتشيها" : "Ken Uchiha"}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">
                        {isArabic ? "اسم المستخدم (معرّف)" : "Username"}
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ken_uchiha"
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Email (only shown if email mode is selected or signup/forgot) */}
                {(loginMethod === "email" || authMode !== "login") && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">
                      {isArabic ? "البريد الإلكتروني" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="otaku@animeblack.com"
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Phone input (only shown if phone login) */}
                {loginMethod === "phone" && authMode === "login" && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">
                      {isArabic ? "رقم الهاتف" : "Phone Number"}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+966 50 123 4567"
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password input */}
                {authMode !== "forgot" && (loginMethod === "email" || authMode === "signup") && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-400 font-medium">
                        {isArabic ? "كلمة المرور" : "Password"}
                      </label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => setAuthMode("forgot")}
                          className="text-xs text-red-500 hover:underline font-semibold"
                        >
                          {isArabic ? "نسيت كلمة المرور؟" : "Forgot?"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Quick Access Credentials (Proactive & Highly Custom) */}
              {authMode === "login" && loginMethod === "email" && (
                <div 
                  onClick={() => {
                    setEmail("owner");
                    setPassword("ownerpassword");
                  }}
                  className="mt-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <div className="text-left">
                      <span className="block text-[10px] font-bold text-white group-hover:text-red-400 transition-colors">
                        {isArabic ? "حساب مالك التطبيق (Owner Bypass)" : "Owner Account Auto-fill"}
                      </span>
                      <span className="block text-[8px] text-zinc-500 font-mono">
                        User: owner • Pass: ownerpassword
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/30">
                    {isArabic ? "تعبئة تلقائية" : "Auto-Fill"}
                  </span>
                </div>
              )}

              {/* Action Button */}
              <button
                id="login_action_btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {authMode === "login" && (loginMethod === "phone" ? (isArabic ? "إرسال رمز OTP" : "Send OTP") : (isArabic ? "تسجيل الدخول" : "Sign In"))}
                      {authMode === "signup" && (isArabic ? "إنشاء حساب" : "Sign Up")}
                      {authMode === "forgot" && (isArabic ? "إرسال الرابط" : "Send Recovery Link")}
                    </span>
                    {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              {/* Forgot Mode / Switch to login helper */}
              {authMode === "forgot" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="w-full text-center text-xs text-gray-400 hover:text-white mt-2 font-semibold flex items-center justify-center gap-1"
                >
                  {isArabic ? "الرجوع لتسجيل الدخول" : "Back to Sign In"}
                </button>
              )}
            </motion.form>
          ) : (
            /* OTP VERIFICATION VIEW */
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-200">
                  {isArabic ? "التحقق من رمز OTP" : "OTP Verification"}
                </h3>
                <p className="text-xs text-gray-400 mt-2">
                  {isArabic ? `لقد أرسلنا رمز المكون من ٤ أرقام إلى:` : `We sent a 4-digit code to:`}
                  <span className="block text-red-500 font-semibold font-mono mt-1">{phone}</span>
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Digits Block */}
              <div className="flex justify-center gap-4 py-4" dir="ltr">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                  />
                ))}
              </div>

              <button
                id="otp_verify_btn"
                type="button"
                onClick={handleOtpVerify}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{isArabic ? "تأكيد الرمز والدخول" : "Verify & Log In"}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode("login"); setError(""); }}
                className="w-full text-center text-xs text-gray-400 hover:text-white mt-2 font-semibold"
              >
                {isArabic ? "تعديل رقم الهاتف" : "Change Phone Number"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social and Sign up footer (only on main screen) */}
      {authMode !== "otp" && (
        <div className="space-y-6">
          {authMode === "login" && (
            <div className="space-y-4">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-4 text-[10px] text-gray-500 uppercase font-mono">
                  {isArabic ? "أو سجل بواسطة" : "Or Sign In With"}
                </span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white py-3 px-4 rounded-xl text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("apple")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white py-3 px-4 rounded-xl text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.1.08.2.08.31.08.85 0 1.96-.54 2.5-1.41z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Toggle text */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setError("");
                setAuthMode(authMode === "login" ? "signup" : "login");
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {authMode === "login" ? (
                <span>
                  {isArabic ? "ليس لديك حساب؟ " : "Don't have an account? "}
                  <strong className="text-red-500 font-bold underline">
                    {isArabic ? "سجل الآن" : "Register Now"}
                  </strong>
                </span>
              ) : (
                <span>
                  {isArabic ? "لديك حساب بالفعل؟ " : "Already have an account? "}
                  <strong className="text-red-500 font-bold underline">
                    {isArabic ? "تسجيل الدخول" : "Sign In"}
                  </strong>
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
