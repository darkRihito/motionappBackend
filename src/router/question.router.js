import express from "express";
import { getQuestions, getPretestQuestions } from "../controller/question.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/question", isAuthenticated, getQuestions);
router.get("/pretestquestion", isAuthenticated, getPretestQuestions);

export default router;
