import React, { useState } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

function DashboardLayout({ children, activeNav = "home", showSidebar = true }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!showSidebar) {
    return <div className="min-h-screen bg-[#F5F9FF]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <Sidebar
        activeNav={activeNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="lg:pl-[272px]">
        <Navbar onMenuClick={() => setMobileOpen(true)} showMenuButton />
        <main className="px-4 pb-10 pt-2 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
