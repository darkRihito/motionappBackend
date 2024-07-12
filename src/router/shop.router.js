import express from "express";
import { getDailyAvatars, buyAvatar } from "../controller/shop.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.post("/avatar", isAuthenticated, buyAvatar);
router.get("/dailyavatars", getDailyAvatars);
export default router;
