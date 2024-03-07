import express from "express";
import { getQuestions, getTypeQuestions, getRoomQuestions } from "../controller/question.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/question", isAuthenticated, getQuestions);
router.get("/question/:category", isAuthenticated, getTypeQuestions);
router.get("/questionroom/:room", isAuthenticated, getRoomQuestions);

export default router;
