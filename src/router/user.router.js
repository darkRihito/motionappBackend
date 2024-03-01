import express from "express";
import { getAllUser, getUserId, patchUserStatus } from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.get("/user", isAuthenticated, getUserId);
router.get("/alluser", isAuthenticated, getAllUser);
router.patch("/userstatus", isAuthenticated, patchUserStatus);

export default router;
