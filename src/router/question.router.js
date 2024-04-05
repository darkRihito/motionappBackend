import express from "express";
import {
  getQuestions,
  getTypeQuestions,
  getRoomQuestions,
  createQuestions,
  deleteQuestions,
  editQuestions,
  addExplanation,
} from "../controller/question.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/question", isAuthenticated, getQuestions);
router.post("/question", isAuthenticated, createQuestions);
router.patch("/question/:id", isAuthenticated, editQuestions);
router.patch("/explanation/:id", isAuthenticated, addExplanation);
router.delete("/question/:id", isAuthenticated, deleteQuestions);
router.get("/question/:category", isAuthenticated, getTypeQuestions);
router.get("/questionroom/:room", isAuthenticated, getRoomQuestions);

export default router;
