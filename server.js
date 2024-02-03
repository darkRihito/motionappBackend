import { app } from "./app.js";
import * as dotenv from "dotenv";
import connectDb from "./src/utils/db.js";

dotenv.config();
app.listen(process.env.PORT, () => {
  console.log(`server is listening on ${process.env.PORT}`);
  connectDb();
});
