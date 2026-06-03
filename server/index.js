import "dotenv/config"
import express from "express"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"

const app = express()



app.use(express.json())

const allowedOrigins = [
  
  "https://nexthire-ai-zeta.vercel.app/"
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    // Allow any localhost origin dynamically to handle Vite port assignment variations
    if (/^http:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}))
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/payment",paymentRouter);

const PORT = process.env.PORT || 6000

app.listen(PORT,()=>{
    console.log(`server is stared ${PORT}`)
    connectDB()
})
