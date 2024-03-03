import mongoose, { Schema } from "mongoose";

const historyChallengeSchema = mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
    },
    start_time: {
      type: Date,
    },
    end_time: {
      type: Date,
    },
    is_finished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const historyChallengeModel = mongoose.model(
  "HistoryChallenge",
  historyChallengeSchema
);

export default historyChallengeModel;
