import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Wallet, User, Settings, Coins, LogOut } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth } from "../../redux/userSlice";
import axiosClient from "../utils/axiosClient";
import AuthModel from "./AuthModel";
import { topNavLinks } from "../utils/navigation";

function Navbar({ onMenuClick, showMenuButton = false }) {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      // axiosClient sends Bearer token so logout works on mobile too
      await axiosClient.get("/api/auth/logout");
    } catch (error) {
      // Logout server-side failure is non-critical — clear client state anyway
      console.warn("[Logout] Server logout failed (non-critical):", error?.response?.status);
    } finally {
      // Always clear local auth state regardless of server response
      dispatch(clearAuth());
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    }
  };

  const requireAuth = (action) => {
    if (!userData) {
      setShowAuth(true);
      return;
    }
    action();
  };

  const closeUserPopup = () => setShowUserPopup(false);

  const goToProfile = () => {
    closeUserPopup();
    navigate("/");
  };

  const goToSettings = () => {
    closeUserPopup();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector("#settings")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.querySelector("#settings")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToCredits = () => {
    closeUserPopup();
    navigate("/pricing");
  };

  const profileMenuItems = [
    { label: "Profile", icon: User, onClick: goToProfile },
    { label: "Settings", icon: Settings, onClick: goToSettings },
    { label: "Credits", icon: Coins, onClick: goToCredits },
    { label: "Logout", icon: LogOut, onClick: handleLogout, danger: true },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 mx-4 mb-4 mt-4 flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:px-6"
      >
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} />
            </button>
          )}
          <nav className="hidden items-center gap-1 md:flex">
            {topNavLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path.startsWith("/#") ? "/" : link.path}
                onClick={(e) => {
                  if (link.path.startsWith("/#")) {
                    e.preventDefault();
                    if (location.pathname !== "/") navigate("/");
                    setTimeout(() => {
                      document
                        .querySelector(link.path.replace("/", ""))
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === link.path
                    ? "text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                requireAuth(() => {
                  setShowCreditPopup(!showCreditPopup);
                  setShowUserPopup(false);
                })
              }
              className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
            >
              <Wallet size={16} />
              <span>{userData?.credits ?? 0}</span>
            </button>
            {showCreditPopup && (
              <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
                <p className="mb-4 text-sm text-[#64748B]">
                  Need more credits to continue interviews?
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/pricing")}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                requireAuth(() => {
                  setShowUserPopup(!showUserPopup);
                  setShowCreditPopup(false);
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg hover:shadow-blue-500/40"
            >
              {userData?.name
                ? userData.name.slice(0, 1).toUpperCase()
                : "?"}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-xl border border-white/60 bg-white/90 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.1)] backdrop-blur-xl"
                >
                  <div className="border-b border-gray-100/80 px-3 py-3">
                    <p className="truncate font-semibold text-[#0F172A]">
                      {userData?.name}
                    </p>
                    {userData?.email && (
                      <p className="truncate text-xs text-[#64748B]">
                        {userData.email}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
                            item.danger
                              ? "text-red-500 hover:bg-red-50"
                              : "text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB]"
                          }`}
                        >
                          <Icon size={16} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;
