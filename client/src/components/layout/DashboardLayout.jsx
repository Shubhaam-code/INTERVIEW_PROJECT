import React, { useState } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import AuthModal from "../AuthModal";

function DashboardLayout({ children, activeNav = "home", showSidebar = true }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, feature: "Practice Mode" });

  const handleAuthRequired = (featureName) => {
    setMobileOpen(false);
    setAuthModal({ open: true, feature: featureName });
  };

  if (!showSidebar) {
    return <div className="min-h-screen bg-[#F5F9FF]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <Sidebar
        activeNav={activeNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onAuthRequired={handleAuthRequired}
      />
      <div className="lg:pl-[272px]">
        <Navbar onMenuClick={() => setMobileOpen(true)} showMenuButton />
        <main className="px-4 pb-10 pt-2 sm:px-6 lg:px-8">{children}</main>
      </div>

      {authModal.open && (
        <AuthModal
          featureName={authModal.feature}
          onClose={() => setAuthModal({ open: false, feature: "Practice Mode" })}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
