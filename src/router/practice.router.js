import express from "express";
import { startPractice, submitAnswer } from "../controller/practice.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.post("/start", isAuthenticated, startPractice);
router.post("/submit", isAuthenticated, submitAnswer);

export default router;
