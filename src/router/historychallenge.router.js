import express from "express";
import { getHistory, startChallenge, endChallenge } from "../controller/historychallenge.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/data", isAuthenticated, getHistory);
router.post("/start/:category", isAuthenticated, startChallenge);
router.post("/end/:category", isAuthenticated, endChallenge);

export default router;
