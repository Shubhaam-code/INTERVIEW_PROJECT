import { scale } from 'motion/react'
import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import axios from 'axios'
import { useSelector } from 'react-redux'
import { ServerUrl } from '../App'

function Pricing() {
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState("free")
    const [loadingPlan, setLoadingPlan] = useState(null)
   

    const plans = [
        {
            id: "free",
            name: "FREE",
            price: "₹0",
            credits: 100,
            descriptions: "perfect for beginner starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performace Report",
                "Voice Interview Access",
                "Limited History Tracking"
            ],
            default: true
        },
        {
            id: "basic",
            name: "Starter Pack",
            price: "₹100",
            credits: 150,
            descriptions: "Great for focused practice and skill improvement.",
            features: [
                "150 AI Interview Credits",
                "Detailed Feddback",
                "Performace Anlytics",
                "Full Interview History "
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
                "Skill Trend analysis",
                "Priority AI Processing"
            ],
            badge: "Best Value"
        }

    ]
    const handlePayment = async (plan) => {
        try {
            setLoadingPlan(plan.id)
            const amount =
                plan.id === "basic" ? 100 :
                    plan.id === "pro" ? 500 : 0;

            if (!amount) {
                setLoadingPlan(null)
                return;
            }
            const result = await axios.post(ServerUrl + "/api/payment/order", { planId: plan.id, amount, credits: plan.credits }, { withCredentials: true })

            console.log("Order Result :", result.data)

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: result.data.amount,
                currency: "INR",
                order_id: result.data.id,
                name: "Interview IQ",
                description: `${plan.name}-${plan.credits} credits`,

                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        }
                        const verifyResult = await axios.post(ServerUrl + "/api/payment/verify", verifyData, { withCredentials: true })
                        if (verifyResult.data.success) {
                            alert("Payment successful!")
                            
                            navigate("/")
                        } else {
                            alert(verifyResult.data.message || "Payment verification failed")
                        }
                    } catch (err) {
                        console.error("Verification error", err)
                        alert("Error verifying payment")
                    }
                },
                theme:{
                    color:"#10b981"
                },
                
            }
            const rzp = new window.Razorpay(options)
            rzp.open()
            setLoadingPlan(null)
        } catch (error) {
            setLoadingPlan(null)
            console.error("Payment Error",error)
        }
    }
    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50
    py-10 px-6'>
            <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>

                <button onClick={() => { navigate("/") }} className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                    <FaArrowLeft className='text-gray-600' />
                </button>
                <div className='text-center w-full'>
                    <h1 className='text-4xl font-bold text-gray-800'>
                        Choose Your Plan
                    </h1>
                    <p className='text-gray-500 mt-3 text-lg'>
                        Flexiable pricing to match your interview preparation goals.
                    </p>
                </div>

            </div>
            <div className='grid md:grid-cols lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
                {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id

                    return (
                        <motion.div key={plan.id}
                            whileHover={!plan.default && { scale: 1.05 }}
                            onClick={() => !plan.default && setSelectedPlan(plan.id)}
                            className={`relative rounded-3xl p-8 transition-all duration-300
                        border
                        ${isSelected ? " border-green-600 shadow-2xl bg-white" :
                                    "border-gray-200 bg-white shadow-md"
                                }
                        ${plan.default ? "cursor-default" : "cursor-pointer"
                                }
                        
                        
                        `}
                        >

                            {/* Badge */}
                            {plan.badge && (
                                <div className='absolute top-6 right-6 bg-emerald-600
                            text-white text-xs px-4 py-1 rounded-full shadow'>
                                    {plan.badge}
                                </div>
                            )}

                            {/* Default tag */}
                            {plan.default && (
                                <div className='absolute top-6 right-6 bg-gray-200
                            text-gray-700 text-xs px-3 py-1 rounded-full'>
                                    Default
                                </div>
                            )}

                            {/* Plan Name */}
                            <h3 className='text-xl font-semibold text-gray-800'>
                                {plan.name}
                            </h3>

                            {/* Price */}
                            <div className='mt-4'>
                                <span className='text-3xl font-bold text-emerald-600'>
                                    {plan.price} Credits

                                </span>
                                <p className='text-gray-500 mt-1'>
                                    {plan.credits} Credits
                                </p>

                            </div>
                            {/* Description */}

                            <p className='text-gray-500 mt-4 text-sm leading-relaxed'>
                                {plan.descriptions}
                            </p>
                            {/* Feature */}
                            <div className='mt-6 space-y-3 text-left'>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className='flex items-center gap-3'>
                                        <FaCheckCircle className='text-emerald-500 text-s,' />
                                        <span className='text-gray-700 text-sm'>
                                            {feature}
                                        </span>

                                    </div>
                                ))}
                            </div>
                            <button
                                disabled={loadingPlan === plan.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isSelected) {
                                        setSelectedPlan(plan.id)
                                    } else {
                                        //Proceed to payment
                                        handlePayment(plan)
                                    }
                                }}
                                className={`w-full mt-8 py-3 rounded-xl font-semibold transition 
                            ${isSelected
                                        ? "bg-green-600 text-white hover:opacity-90"
                                        : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                                    }`}>
                                {plan.default
                                    ? "Current Plan"
                                    : (loadingPlan === plan.id ? "Processing... "
                                        : isSelected ? "Proceed to Pay"
                                            : "Select Plan"
                                    )}
                            </button>

                        </motion.div>
                    )

                })}

            </div>

        </div>

    )
}

export default Pricing
