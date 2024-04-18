// Librairies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDb from "./src/utils/db.js";

// Router import
import authRouter from "./src/router/auth.router.js";
import userRouter from "./src/router/user.router.js";
import historyRouter from "./src/router/history.router.js";
import leaderboardRouter from "./src/router/leaderboard.router.js";
import historychallengeRouter from "./src/router/historychallenge.router.js";
import questionRouter from "./src/router/question.router.js";
import practiceRouter from "./src/router/practice.router.js";
import shopRouter from "./src/router/shop.router.js";
import { isAuthenticated, isAdmin } from "./src/middleware/auth.js";

// setting up the server
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://motionapp-backend.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    messages: "API is Working",
  });
});
app.get("/isauthenticated", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    messages: "User is authenticated",
  });
});
app.get("/isadmin", isAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    messages: "Admin is authenticated",
  });
});

app.use("/api", authRouter);
app.use("/user", userRouter);
app.use("/history", historyRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/challenge", historychallengeRouter);
app.use("/question", questionRouter);
app.use("/practice", practiceRouter);
app.use("/shop", shopRouter);
dotenv.config();

if (process.env.NODE_ENV === "production") {
  // cloudinary.config({
  //   cloud_name: process.env.CLOUD_NAME,
  //   api_key: process.env.CLOUD_API_KEY,
  //   api_secret: process.env.CLOUD_API_SECRET,
  // });
  connectDb();
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} 🚀`);
  });
}

export default app;
