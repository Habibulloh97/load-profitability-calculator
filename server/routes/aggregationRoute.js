import { Router } from "express";
import {
  getCompanyProfit,
  loadCount,
  averageRpm,
} from "../controllers/aggregationController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/weekly-profit", requireAuth, getCompanyProfit);
router.get("/load-count", requireAuth, loadCount);
router.get("/avgrpm", requireAuth, averageRpm);

export default router;
