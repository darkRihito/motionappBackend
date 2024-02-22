import express from "express";
import { login, logout, register } from "../controller/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

export default router;
