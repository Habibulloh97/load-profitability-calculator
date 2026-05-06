import { register, login, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { Router } from "express";
const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

export default router;
