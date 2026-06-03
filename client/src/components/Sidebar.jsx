import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { sidebarNavItems } from "../utils/navigation";

function Sidebar({ activeNav, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (item) => {
    setMobileOpen?.(false);
    if (item.path.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/" + item.path.slice(1));
      } else {
        const el = document.querySelector(item.path.replace("/", ""));
        el?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.id === activeNav) return true;
    if (item.path === "/" && location.pathname === "/") return activeNav === "home";
    if (!item.path.startsWith("/#") && location.pathname === item.path) return true;
    return false;
  };

  const sidebarContent = (
    <aside className="flex h-full flex-col border-r border-gray-100 bg-white/90 px-4 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-lg font-bold text-white shadow-md shadow-blue-500/30">
          N
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0F172A]">NextHire AI</h1>
          <p className="text-xs text-[#64748B]">Interview Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              whileHover={{ x: 2 }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "bg-blue-50 text-[#2563EB] shadow-sm"
                  : "text-[#64748B] hover:bg-gray-50 hover:text-[#0F172A]"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-[#2563EB]" : "text-[#94A3B8]"}
              />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-500/25"
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={18} />
          <span className="font-semibold">Upgrade to Pro</span>
        </div>
        <p className="mb-4 text-xs text-blue-100">
          Unlock advanced analytics, priority AI, and more credits.
        </p>
        <button
          type="button"
          onClick={() => {
            setMobileOpen?.(false);
            navigate("/pricing");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/30"
        >
          Upgrade Now →
        </button>
      </motion.div>
    </aside>
  );

  return (
    <>
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-[272px] lg:block">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-[272px] lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
