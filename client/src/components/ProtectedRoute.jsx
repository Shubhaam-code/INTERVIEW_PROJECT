import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

/**
 * ProtectedRoute
 * Blocks unauthenticated access to a route.
 *
 * - Logged in  → renders children normally.
 * - Loading    → shows a spinner (suppresses flash-of-modal on page refresh).
 * - Not logged in → shows AuthModal overlay over a blurred placeholder.
 *                   Closing the modal navigates the user back to "/" so they
 *                   are never left on a blank, inaccessible page.
 */
function ProtectedRoute({ children, featureName = "Practice Mode" }) {
  const { userData, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  // ── 1. Still fetching auth state → spinner ────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  // ── 2. Authenticated → render the page ───────────────────────────────────
  if (userData) {
    return <>{children}</>;
  }

  // ── 3. Not authenticated → auth modal + blurred backdrop ─────────────────
  const handleClose = () => {
    setModalOpen(false);
    // Navigate back to home so the user isn't stuck on a blank page
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Blurred ghost placeholder behind the modal */}
      <div
        className="pointer-events-none select-none blur-sm opacity-40 min-h-screen bg-[#F5F9FF]"
        aria-hidden="true"
      />

      {modalOpen && (
        <AuthModal onClose={handleClose} featureName={featureName} />
      )}
    </>
  );
}

export default ProtectedRoute;
