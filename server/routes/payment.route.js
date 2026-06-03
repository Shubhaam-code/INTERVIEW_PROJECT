import express from "express";
import { createPayment,verifyPayment } from "../controllers/payment.controller.js";
import isAuth from "../middlewares/isAuth.js";

const paymentRouter = express.Router();

paymentRouter.post("/order",isAuth,createPayment);
paymentRouter.post("/verify",isAuth,verifyPayment);

export default paymentRouter;