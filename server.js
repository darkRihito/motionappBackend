import app  from "./app.js";
import * as dotenv from "dotenv";
import connectDb from "./src/utils/db.js";
import { resetDailyAvatars, initializeDailyAvatars } from './src/controller/shop.controller.js';
import cron from 'node-cron';

dotenv.config();
app.listen(process.env.PORT, () => {
  console.log(`server is listening on http://localhost:${process.env.PORT}/`);
  connectDb();
  initializeDailyAvatars();
  cron.schedule('0 0 * * *', resetDailyAvatars);
});
