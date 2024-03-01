import express from "express";
import { getHistory, startChallenge, endChallenge } from "../controller/historychallenge.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/data", isAuthenticated, getHistory);
router.post("/start/:type", isAuthenticated, startChallenge);
router.post("/end/:type", isAuthenticated, endChallenge);

export default router;
