import {
  create,
  list,
  get,
  update,
  remove,
} from "../controllers/driverController.js";
import { Router } from "express";

const router = Router();

router.post("/", create);
router.patch("/:id", update);
router.get("/", list);
router.get("/:id", get);
router.delete("/:id", remove);

export default router;
