import express from "express";
import { getQuestions, getTypeQuestions } from "../controller/question.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/question", isAuthenticated, getQuestions);
router.get("/question/:category", isAuthenticated, getTypeQuestions);

export default router;
