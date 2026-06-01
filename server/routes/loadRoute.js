import { create } from "../controllers/loadController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { Router } from "express";
const router = Router();

router.post("/", requireAuth, create);

export default router;
