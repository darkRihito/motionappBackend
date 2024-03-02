import mongoose, { Schema } from "mongoose";

const historySchema = mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    score: {
      type: Number,
    },
    point: {
      type: Number,
    },
    result: {
      type: String,
    },
  },
  { timestamps: true }
);

const historyModel = mongoose.model("History", historySchema);

export default historyModel;
