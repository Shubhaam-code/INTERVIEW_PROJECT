import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Auth from "../pages/Auth.jsx";

/**
 * AuthModal
 * A polished, animated login modal with a contextual message explaining
 * *why* login is required (e.g. "Please login to continue Practice Mode").
 *
 * Props:
 *   onClose      – called when the user explicitly closes the modal
 *   featureName  – display name of the protected feature (default "Practice Mode")
 */
function AuthModal({ onClose, featureName = "Practice Mode" }) {
  const { userData } = useSelector((state) => state.user);

  // Auto-close when the user successfully logs in
  useEffect(() => {
    if (userData) {
      onClose?.();
    }
  }, [userData, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[900] flex items-center justify-center bg-[#0F172A]/40 px-4 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Modal card — stop propagation so clicks inside don't close */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-50 rounded-lg p-2 text-[#64748B] transition hover:bg-gray-100 hover:text-[#0F172A]"
              aria-label="Close login modal"
            >
              <X size={20} />
            </button>
          )}

          {/* Contextual banner */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white shadow-lg shadow-blue-500/20">
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
    </AnimatePresence>
  );
}

export default AuthModal;
