import React, { useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { X, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Auth from "../pages/Auth.jsx";

/**
 * AuthModal
 * Polished login modal with contextual "Please login to continue <feature>" banner.
 *
 * Props:
 *   onClose      – called when user closes the modal (X button, backdrop click, ESC)
 *   featureName  – name of the protected feature shown in the banner
 */
function AuthModal({ onClose, featureName = "Practice Mode" }) {
  const { userData } = useSelector((state) => state.user);

  // Auto-close when the user successfully logs in
  useEffect(() => {
    if (userData && onClose) {
      onClose();
    }
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while modal is open; restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC key closes the modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Backdrop click handler — only fires when onClose is provided
  const handleBackdropClick = () => {
    if (onClose) onClose();
  };

  // Stop clicks inside the card from bubbling to the backdrop
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A]/40 px-4 backdrop-blur-md"
      onClick={handleBackdropClick}
      // Ensure the backdrop itself is always clickable
      style={{ pointerEvents: "auto" }}
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="relative w-full max-w-md"
        onClick={handleCardClick}
        style={{ pointerEvents: "auto" }}
      >
        {/* ── Close (X) button ──────────────────────────────────────── */}
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-3 top-3 z-[10000] flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#64748B] shadow-md transition hover:bg-gray-100 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close login modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* Blue gradient banner */}
        <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 pr-14 text-white shadow-lg shadow-blue-500/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Lock size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Authentication Required
            </p>
            <p className="mt-0.5 text-sm font-bold leading-snug">
              Please login to continue{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                <Sparkles size={12} />
                {featureName}
              </span>
            </p>
          </div>
        </div>

        {/* Auth form */}
        <div className="-mt-px rounded-b-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <Auth isModel={true} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AuthModal;
