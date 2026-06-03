import Razorpay from "razorpay";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPayment = async(req,res) =>{
    try {
        const {planId,amount,credits} = req.body;
        const userId = req.userId;

        if(!planId || !amount || !credits) {
            return res.status(400).json({success:false,message:"All details are required"})
        }
        // create order
        
        const options = {
            amount: amount * 100, // amount in paise 1 rupya in 100 paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        await Payment.create({
            planId,
            amount,
            credits,
            userId,
            razorpayOrderId: order.id,
            status: "created"
        });
        
        
        return res.json(order);

    } catch (error) {
        console.log("Error in createPayment controller",error);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }

}
export const verifyPayment = async(req,res) => {
    try {
        const {razorpayOrderId,razorpayPaymentId,signature} = req.body;
        
        const body =razorpayOrderId + "|" + razorpayPaymentId;
        
        const expectedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
        if(expectedSignature !== signature){
            return res.status(400).json({success:false,message:"Invalid payment"});       
        }

        const payment = await Payment.findOne({ razorpayOrderId });
        if(!payment){
             return res.status(404).json({success:false,message:"Payment record not found"});
        }

        if (payment.status === "paid") {
             const currentUser = await User.findById(payment.userId);
             console.log(`[CORS/Payment] Payment already verified for order ${razorpayOrderId}. User ID: ${payment.userId}`);
             return res.json({success:true,message:"Payment already verified",user:currentUser});
        }

        payment.status ="paid";
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.signature = signature;
        await payment.save();

        const updatedUser = await User.findByIdAndUpdate(payment.userId,{$inc:{credits:payment.credits}},{new:true});
        console.log(`[CORS/Payment] Payment verified successfully. User ID: ${payment.userId}. Added ${payment.credits} credits. New Total: ${updatedUser.credits}`);

        return res.json({success:true,message:"Payment verified successfully",user:updatedUser});

        
    } catch (error) {
        console.log("Error in verifyPayment controller",error);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
