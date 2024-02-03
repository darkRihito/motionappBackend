import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL).then((data) => {
      console.log(`Database connected with ${data.connection.host}`);
    });
  } catch (error) {
    console.log(error.message);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;
