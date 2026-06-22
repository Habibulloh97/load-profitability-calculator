import {
  register,
  login,
  getMe,
  update,
  remove,
  updatePassword,
  logout,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { Router } from "express";
const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, update);
router.delete("/me", requireAuth, remove);
router.patch("/me/password", requireAuth, updatePassword);
router.post("/logout", logout);

export default router;
