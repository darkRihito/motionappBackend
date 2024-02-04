// Librairies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Router import
import authRouter from "./src/router/auth.router.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());


// Routes
app.use("/api", authRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    messages: "API is Working",
  });
});

export default app;
