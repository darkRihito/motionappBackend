// Librairies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";

// Router import
import authRouter from "./src/router/auth.router.js";
import userRouter from "./src/router/user.router.js";
import { isAuthenticated } from "./src/middleware/auth.js";

// setting up the server
const server = express();
server.use(express.json());
server.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
server.use(cookieParser());
server.use(bodyParser.json({ limit: "10mb", extended: true }));
server.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

server.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    messages: "API is Working",
  });
});
server.get("/isauthenticated", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    messages: "User is authenticated",
  });
});

server.use("/api", authRouter);
server.use("/user", userRouter);

export default server;
