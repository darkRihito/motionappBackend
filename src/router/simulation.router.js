import express from "express";
import {startSimulation, endSimulation, getDetailFinishedSimulation } from "../controller/simulation.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();
router.post("/start/:category", isAuthenticated, startSimulation);
router.post("/end/:category", isAuthenticated, endSimulation);
router.get("/detail/:category", isAuthenticated, getDetailFinishedSimulation);

export default router;
