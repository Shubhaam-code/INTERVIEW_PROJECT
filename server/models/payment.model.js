import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    currency: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, default: "created",enum:["created","paid","failed"] },
    planId: String,
    credits: Number
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);