import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { ServerUrl } from "../App";
import { setUserData } from "../../redux/userSlice";
import DashboardLayout from "../components/layout/DashboardLayout";

function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "FREE",
      price: "₹0",
      credits: 100,
      descriptions:
        "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      descriptions: "Great for focused practice and skill improvement.",
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
      credits: 600,
      descriptions: "Best value for serious job preparation.",
      features: [
        "600 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);
      const amount =
        plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      if (!amount) {
        setLoadingPlan(null);
        return;
      }
      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        { planId: plan.id, amount, credits: plan.credits },
        { withCredentials: true }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        order_id: result.data.id,
        name: "NextHire AI",
        description: `${plan.name} - ${plan.credits} credits`,
        handler: async function (response) {
          try {
            setLoadingPlan(plan.id);
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            };
            const verifyResult = await axios.post(
              ServerUrl + "/api/payment/verify",
              verifyData,
              { withCredentials: true }
            );
            if (verifyResult.data.success) {
              dispatch(setUserData(verifyResult.data.user));
              alert("Payment successful!");
              navigate("/");
            } else {
              alert(
                verifyResult.data.message || "Payment verification failed"
              );
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("Error verifying payment");
          } finally {
            setLoadingPlan(null);
          }
        },
        theme: { color: "#2563EB" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoadingPlan(null);
    } catch (error) {
      setLoadingPlan(null);
      console.error("Payment Error", error);
    }
  };

  return (
    <DashboardLayout activeNav="credits">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
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
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                whileHover={!plan.default ? { y: -8 } : {}}
                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                className={`card-premium relative p-8 transition duration-300 ${
                  isSelected
                    ? "ring-2 ring-[#2563EB] shadow-[0_12px_40px_rgb(37,99,235,0.12)]"
                    : ""
                } ${plan.default ? "cursor-default" : "cursor-pointer"}`}
              >
                {plan.badge && (
                  <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles size={12} />
                    {plan.badge}
                  </div>
                )}
                {plan.default && (
                  <div className="absolute right-6 top-6 rounded-full bg-gray-100 px-3 py-1 text-xs text-[#64748B]">
                    Default
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
                  {plan.descriptions}
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
                <button
                  type="button"
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) setSelectedPlan(plan.id);
                    else handlePayment(plan);
                  }}
                  className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:opacity-95"
                      : "bg-gray-100 text-[#64748B] hover:bg-blue-50"
                  }`}
                >
                  {plan.default
                    ? "Current Plan"
                    : loadingPlan === plan.id
                      ? "Processing..."
                      : isSelected
                        ? "Proceed to Pay"
                        : "Select Plan"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Pricing;
