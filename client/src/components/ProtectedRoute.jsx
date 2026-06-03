import React, { useState } from "react";
import { useSelector } from "react-redux";
import AuthModal from "./AuthModal";

/**
 * ProtectedRoute
 * Wraps any route that requires authentication.
 * - If the user IS logged in  → renders children normally.
 * - If the user is NOT logged in → shows the login modal and a blurred
 *   placeholder behind it instead of navigating to the page.
 *
 * Usage in App.jsx:
 *   <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
 */
function ProtectedRoute({ children, featureName = "Practice Mode" }) {
  const { userData, loading } = useSelector((state) => state.user);
  const [modalOpen, setModalOpen] = useState(true);

  // While we're still fetching the current user from the server, show nothing
  // to avoid a flash of the login modal for already-logged-in users.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  // Authenticated → render the protected page as-is.
  if (userData) {
    return <>{children}</>;
  }

  // Not authenticated → show the auth modal overlaid on a blurred backdrop.
  return (
    <>
      {/* Blurred ghost of the page behind the modal */}
      <div className="pointer-events-none select-none blur-sm opacity-40 min-h-screen bg-[#F5F9FF]" aria-hidden="true" />
      {modalOpen && (
        <AuthModal
          onClose={() => setModalOpen(true)} // keep modal open; user must log in or navigate away
          featureName={featureName}
        />
      )}
    </>
  );
}

export default ProtectedRoute;
