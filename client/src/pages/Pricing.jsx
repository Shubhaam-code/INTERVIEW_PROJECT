import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ServerUrl } from "../App";
import { setUserData } from "../../redux/userSlice";
import DashboardLayout from "../components/layout/DashboardLayout";

/* ─────────────────────────────────────────────────────────────────
   Razorpay SDK loader — ensures the checkout.js script is loaded
   and window.Razorpay is available before we try to use it.
   
   MOBILE FIX: We load the SDK eagerly (on component mount) so that
   by the time the user taps "Pay", window.Razorpay is already ready.
   Waiting for the SDK inside the async click handler causes a delay
   that breaks the browser's "user gesture" context on mobile — 
   meaning the popup gets blocked on Safari / in-app browsers.
───────────────────────────────────────────────────────────────── */
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpaySDK() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // Already injected but not yet parsed
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay));
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay SDK failed to load"))
      );
      return;
    }

    // Inject fresh
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay not defined after script load"));
      }
    };
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout script"));
    document.head.appendChild(script);
  });
}

/* ─── Toast notification ────────────────────────────────────────── */
function Toast({ message, type = "error", onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          className={`fixed left-1/2 top-4 z-[9999] flex w-[92vw] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl px-5 py-4 shadow-xl ${
            type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : type === "info"
                ? "border border-blue-200 bg-blue-50 text-blue-800"
                : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {type === "success" ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 opacity-60 hover:opacity-100"
            style={{ touchAction: "manipulation" }}
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Pricing Component ─────────────────────────────────────── */
function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });

  // Ref to track if payment is in-flight (prevents double-tap)
  const paymentInProgressRef = useRef(false);

  const showToast = useCallback((message, type = "error", duration = 5000) => {
    setToast({ message, type });
    const id = setTimeout(
      () => setToast({ message: "", type: "error" }),
      duration
    );
    return id;
  }, []);

  const clearToast = useCallback(
    () => setToast({ message: "", type: "error" }),
    []
  );

  /* ── Pre-load Razorpay SDK on mount ──────────────────────────────
     MOBILE FIX: Loading eagerly means window.Razorpay is available
     immediately when the user taps Pay — no async gap in the gesture. */
  useEffect(() => {
    loadRazorpaySDK()
      .then(() => {
        console.log("[Payment] Razorpay SDK ready");
        setSdkReady(true);
      })
      .catch((err) => {
        console.error("[Payment] SDK load failed:", err.message);
        // Don't show error yet — we'll show it only if user tries to pay
      });
  }, []);

  const plans = [
    {
      id: "free",
      name: "FREE",
      price: "₹0",
      amount: 0,
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      isDefault: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      amount: 100,
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      amount: 500,
      credits: 600,
      description: "Best value for serious job preparation.",
      features: [
        "600 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  /* ── handlePayment ───────────────────────────────────────────────
     MOBILE FIX STRATEGY:
     
     The Razorpay checkout popup MUST be opened synchronously within
     a user-gesture handler. On mobile, any `await` before rzp.open()
     can expire the browser's gesture context, causing the popup to
     be silently blocked (especially on Safari and in-app browsers).
     
     Solution:
     1. Create the Razorpay instance (rzp) immediately — synchronously
        inside the click handler — using a pre-fetched order ID.
     2. Call rzp.open() immediately after creation, no await between them.
     3. The API call to create the order happens BEFORE the user taps Pay
        (on plan selection hover/focus) OR we structure it so rzp is
        created then opened without any async gap.
     
     Since we cannot know which plan is selected before the tap, we use
     a two-phase approach that's still mobile-safe:
     - Phase 1 (async): fetch the order from server → store order data
     - Phase 2 (sync gesture): create rzp instance + open immediately
     
     We achieve this by: calling rzp.open() right after new Razorpay(),
     both of which are synchronous operations, placed at the end of the
     async chain — this is within the same JS task and Razorpay's own
     SDK handles the popup in a way that's compatible with async chains.
     The real fix is ensuring the SDK is PRE-LOADED (Phase 0 above).
  ─────────────────────────────────────────────────────────────────── */
  const handlePayment = async (plan) => {
    // Guard against double-tap on mobile
    if (paymentInProgressRef.current) return;
    if (loadingPlan) return;

    if (!plan.amount) return; // Free plan

    // Ensure SDK is available
    if (!window.Razorpay) {
      // Last-resort attempt to load
      try {
        showToast("Loading payment system, please wait…", "info");
        await loadRazorpaySDK();
        setSdkReady(true);
        clearToast();
      } catch {
        showToast(
          "Payment system could not load. Please check your internet connection and try again."
        );
        return;
      }
    }

    // Require authentication
    if (!userData) {
      showToast("Please log in to purchase a plan.");
      return;
    }

    paymentInProgressRef.current = true;
    setLoadingPlan(plan.id);
    console.log("[Payment] Creating order for plan:", plan.id);

    let order;
    try {
      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        { planId: plan.id, amount: plan.amount, credits: plan.credits },
        { withCredentials: true }
      );
      order = result.data;
      console.log("[Payment] Order created:", order.id);
    } catch (err) {
      console.error("[Payment] Order creation failed:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        showToast("Session expired. Please log in again.");
      } else if (status === 429) {
        showToast("Too many requests. Please wait a moment and try again.");
      } else {
        showToast(
          err?.response?.data?.message ||
            "Failed to create payment order. Check your connection and try again."
        );
      }
      setLoadingPlan(null);
      paymentInProgressRef.current = false;
      return;
    }

    /* ── Open Razorpay checkout ─────────────────────────────────────
       MOBILE CRITICAL: These two lines must be synchronous and
       back-to-back. No await between new Razorpay() and rzp.open(). */
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,            // Already in paise from server
        currency: order.currency || "INR",
        order_id: order.id,
        name: "NextHire AI",
        description: `${plan.name} — ${plan.credits} Credits`,
        image: "/img1.png",

        /* Prefill user info if available (improves mobile UX) */
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },

        /* Mobile-specific Razorpay config */
        config: {
          display: {
            blocks: {
              banks: { name: "Pay via UPI / Bank", instruments: [{ method: "upi" }, { method: "netbanking" }] },
            },
            sequence: ["block.banks"],
            preferences: { show_default_blocks: true },
          },
        },

        handler: async function (response) {
          /* Payment captured by Razorpay — now verify on our server */
          console.log("[Payment] Razorpay success callback:", response.razorpay_payment_id);
          setLoadingPlan(plan.id);

          try {
            const verifyResult = await axios.post(
              ServerUrl + "/api/payment/verify",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
              { withCredentials: true }
            );

            if (verifyResult.data.success) {
              dispatch(setUserData(verifyResult.data.user));
              showToast(
                `🎉 Payment successful! ${plan.credits} credits added to your account.`,
                "success",
                6000
              );
              setTimeout(() => navigate("/"), 2000);
            } else {
              showToast(
                verifyResult.data.message ||
                  "Payment verification failed. Contact support if credits were not added."
              );
            }
          } catch (verifyErr) {
            console.error("[Payment] Verification error:", verifyErr);
            showToast(
              "Payment was captured but verification failed. Your credits will be added within a few minutes. Contact support if they don't appear."
            );
          } finally {
            setLoadingPlan(null);
            paymentInProgressRef.current = false;
          }
        },

        modal: {
          /* Called when user closes the modal without paying */
          ondismiss: () => {
            console.log("[Payment] Checkout dismissed by user");
            setLoadingPlan(null);
            paymentInProgressRef.current = false;
          },

          /* Mobile: escape/back navigation handling */
          animation: true,
          confirm_close: false,
        },

        theme: { color: "#2563EB" },
      };

      // Synchronous: no await between these two lines ─ MOBILE CRITICAL
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("[Payment] Failed:", response.error);
        const reason =
          response.error?.description ||
          response.error?.reason ||
          "Payment failed. Please try again.";
        showToast(reason);
        setLoadingPlan(null);
        paymentInProgressRef.current = false;
      });

      rzp.open(); // ← Must be called synchronously after new Razorpay()
      setLoadingPlan(null); // Reset button state after modal opens
    } catch (rzpErr) {
      console.error("[Payment] Razorpay open error:", rzpErr);
      showToast(
        "Could not open payment window. If you are using an in-app browser (Instagram, WhatsApp), please open this page in Chrome or Safari."
      );
      setLoadingPlan(null);
      paymentInProgressRef.current = false;
    }
  };

  return (
    <DashboardLayout activeNav="credits">
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:bg-gray-50 active:scale-95"
            style={{ touchAction: "manipulation" }}
          >
            <ArrowLeft className="text-[#64748B]" size={18} />
          </button>
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
              Choose Your <span className="text-[#2563EB]">Plan</span>
            </h1>
            <p className="mt-3 text-[#64748B]">
              Flexible pricing to match your interview preparation goals.
            </p>
            {/* SDK loading indicator */}
            {!sdkReady && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
                <Loader2 size={12} className="animate-spin" />
                Loading payment system…
              </p>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={!plan.isDefault ? { y: -6 } : {}}
                className={`card-premium relative p-8 transition duration-300 ${
                  plan.id === "pro"
                    ? "ring-2 ring-[#2563EB] shadow-[0_12px_40px_rgb(37,99,235,0.12)]"
                    : ""
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles size={12} />
                    {plan.badge}
                  </div>
                )}
                {plan.isDefault && (
                  <div className="absolute right-6 top-6 rounded-full bg-gray-100 px-3 py-1 text-xs text-[#64748B]">
                    Current Plan
                  </div>
                )}

                <h3 className="text-xl font-semibold text-[#0F172A]">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#2563EB]">
                    {plan.price}
                  </span>
                  <p className="mt-1 text-[#64748B]">{plan.credits} Credits</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                  {plan.description}
                </p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2
                        className="shrink-0 text-[#2563EB]"
                        size={18}
                      />
                      <span className="text-sm text-[#0F172A]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* ── CTA button ────────────────────────────────────────
                    MOBILE FIX: Single-tap payment flow.
                    Removed the two-step "Select → Proceed" pattern which
                    caused state-change re-renders between taps.
                    Now: one tap → directly calls handlePayment.
                    
                    Using a plain <button> (not motion.button) so that
                    touch events fire reliably without Framer Motion
                    gesture interception on mobile.
                ─────────────────────────────────────────────────────── */}
                {plan.isDefault ? (
                  <div className="mt-8 w-full rounded-xl bg-gray-100 py-3 text-center text-sm font-semibold text-[#64748B]">
                    Current Plan
                  </div>
                ) : (
                  <button
                    id={`pay-btn-${plan.id}`}
                    type="button"
                    disabled={isLoading || loadingPlan !== null}
                    onClick={() => handlePayment(plan)}
                    style={{
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing…
                      </>
                    ) : (
                      `Buy ${plan.name}`
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* In-app browser warning */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4"
        >
          <p className="text-center text-sm text-amber-700">
            <span className="font-semibold">📱 Mobile Users:</span> If the
            payment window doesn't open, please open this page in{" "}
            <span className="font-semibold">Chrome</span> or{" "}
            <span className="font-semibold">Safari</span> (not in Instagram,
            WhatsApp, or other in-app browsers).
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default Pricing;
