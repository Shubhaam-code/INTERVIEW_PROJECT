import React, { useState } from "react";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Loader2, AlertCircle } from "lucide-react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axiosClient from "../utils/axiosClient";
import { setUserData, setToken } from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import heroImg from "../assets/images/MM.png";

/**
 * Detect if we're running inside an in-app browser (Instagram, WhatsApp,
 * Facebook, Telegram, Line, etc.) where signInWithPopup is always blocked.
 * In these browsers we use signInWithRedirect instead.
 */
function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  return (
    /Instagram|FBAN|FBAV|FB_IAB|Twitter|Line\/|WhatsApp|Telegram|Pinterest/.test(ua) ||
    (ua.includes("wv") && ua.includes("Android"))  // Android WebView
  );
}

function Auth({ isModel = false }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Handle redirect result on page load ─────────────────────────
     When signInWithRedirect is used (in-app browsers), Firebase
     redirects back to this page. We pick up the result here.      */
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return; // No redirect pending

        setLoading(true);
        const { displayName: name, email } = result.user;
        await sendToServer({ name, email });
      } catch (err) {
        console.error("[Auth] Redirect result error:", err);
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Common: send Firebase user data to our backend ─────────────*/
  const sendToServer = async ({ name, email }) => {
    try {
      const result = await axiosClient.post("/api/auth/google", { name, email });
      const data = result.data;

      // Save token to localStorage for mobile Bearer auth
      if (data._token) {
        dispatch(setToken(data._token));
      }

      // Strip _token from userData before storing in Redux
      const { _token, ...userData } = data;
      dispatch(setUserData(userData));
      console.log("[Auth] Login successful:", userData.email);
    } catch (err) {
      console.error("[Auth] Server error:", err);
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your connection and try again.";
      setError(msg);
      dispatch(setUserData(null));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    setError("");
    setLoading(true);

    /* ── In-app browser: use redirect flow ──────────────────────── */
    if (isInAppBrowser()) {
      try {
        await signInWithRedirect(auth, provider);
        // Page will redirect — nothing more to do here
      } catch (err) {
        console.error("[Auth] Redirect error:", err);
        setError(
          "Could not open Google sign-in. Please open this page in Chrome or Safari."
        );
        setLoading(false);
      }
      return;
    }

    /* ── Normal browser: use popup flow ─────────────────────────── */
    try {
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;
      await sendToServer({ name, email });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User dismissed — not an error
        setLoading(false);
        return;
      }
      if (err.code === "auth/popup-blocked") {
        // Popup was blocked — fall back to redirect
        console.warn("[Auth] Popup blocked, falling back to redirect");
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          setError("Sign-in popup was blocked. Please allow popups or use Chrome/Safari.");
          setLoading(false);
        }
        return;
      }
      console.error("[Auth] Popup error:", err);
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full ${
        isModel
          ? "py-4"
          : "flex min-h-screen items-center justify-center bg-[#F5F9FF] px-6 py-20"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full overflow-hidden border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${
          isModel
            ? "max-w-md rounded-2xl p-8"
            : "grid max-w-4xl rounded-2xl md:grid-cols-2"
        }`}
      >
        {!isModel && (
          <div className="relative hidden items-center justify-center bg-gradient-to-br from-blue-50 to-white p-10 md:flex">
            <motion.img
              src={heroImg}
              alt="NextHire AI"
              className="max-h-64 object-contain"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        )}

        <div className={isModel ? "" : "p-10 lg:p-12"}>
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-lg font-bold text-white">
              N
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">NextHire AI</h2>
          </div>

          <h1 className="mb-4 text-center text-2xl font-bold leading-snug text-[#0F172A] md:text-3xl">
            Continue with{" "}
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[#2563EB]">
              <IoSparkles />
              AI Interview
            </span>
          </h1>
          <p className="mb-8 text-center text-sm leading-relaxed text-[#64748B] md:text-base">
            Sign in to start AI-powered mock interviews, track progress, and
            unlock detailed performance insights.
          </p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <FcGoogle size={20} />
                Continue with Google
              </>
            )}
          </button>

          {isInAppBrowser() && (
            <p className="mt-3 text-center text-xs text-amber-600">
              ⚠️ For best experience, open in Chrome or Safari
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;
