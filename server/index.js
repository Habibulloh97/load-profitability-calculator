import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import mongoose from "mongoose"
import router from "./routes/authRoute.js"

dotenv.config()

const app = express()

app.use(cors({
    origin : process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",router)


app.get("/health", (req,res)=>{
    res.json({ok:true, ts: new Date().toDateString()})
})

const PORT =process.env.PORT ||"5000"

mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("Mongo Connected"))
    .catch((err)=>console.error("Mongo Connection Failed:", err.message))

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})