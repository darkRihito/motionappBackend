import express from "express";
import { buyAvatar } from "../controller/shop.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.post("/avatar", isAuthenticated, buyAvatar);
export default router;
