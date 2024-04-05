import mongoose, { Schema } from "mongoose";

const practiceSchema = mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    stage: {
      type: Number,
    },
    correct: {
      type: Number,
    },
    knowledge: {
      type: Number,
    },
    point_gain: {
      type: Number,
    },
    question: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
      question: {
        type: String,
      },
      category: {
        type: [String],
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
    },
  },
  { timestamps: true }
);

const practiceModel = mongoose.model("Practice", practiceSchema);

export default practiceModel;
