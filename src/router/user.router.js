import express from "express";
import { getAllUser } from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/getalluser", isAuthenticated, getAllUser);

export default router;
