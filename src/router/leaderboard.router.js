import express from "express";
import { getLeaderboard } from "../controller/leaderboard.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/data", isAuthenticated, getLeaderboard);

export default router;
