import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
dotenv.config()

const app = express()



app.use(express.json())
app.use(cors({
     origin:"http://localhost:5173",
     credentials:true
}
))
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

const PORT = process.env.PORT || 6000

app.listen(PORT,()=>{
    console.log(`server is stared ${PORT}`)
    connectDB()
})