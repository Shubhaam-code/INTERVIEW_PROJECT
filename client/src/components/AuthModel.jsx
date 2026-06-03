import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import Auth from "../pages/Auth.jsx";

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-[#0F172A]/20 px-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-lg p-2 text-[#64748B] transition hover:bg-gray-100 hover:text-[#0F172A]"
        >
          <X size={20} />
        </button>
        <Auth isModel={true} />
      </motion.div>
    </div>
  );
}

export default AuthModel;
