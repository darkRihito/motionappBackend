import express from "express";
import { getAllHistory, getHistoryId } from "../controller/history.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/history", isAuthenticated, getAllHistory);
router.get("/historyid", isAuthenticated, getHistoryId);

export default router;
