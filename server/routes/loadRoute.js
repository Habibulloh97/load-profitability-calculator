import { create, list, get, remove } from "../controllers/loadController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { Router } from "express";
const router = Router();

router.post("/", requireAuth, create);
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, get);
router.delete("/:id", requireAuth, remove);

export default router;
