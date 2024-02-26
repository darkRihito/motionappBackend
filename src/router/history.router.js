import express from "express";
import { getAllHistory, getHistoryId } from "../controller/history.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/gethistory", isAuthenticated, getAllHistory);
router.get("/gethistoryid", isAuthenticated, getHistoryId);

export default router;
