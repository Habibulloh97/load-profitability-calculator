import { register } from "../controllers/authController.js";
import { Router } from "express";
const router = Router()

router.post("/signup", register)

export default router