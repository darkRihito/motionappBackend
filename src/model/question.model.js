import mongoose, { Schema } from "mongoose";

const questionSchema = mongoose.Schema(
  {
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    room_code: {
      type: String,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    explanation: {
      type: String,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      enum: ["A", "B", "C", "D"],
    },
    category: {
      type: [String],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
  },
  { timestamps: true }
);

const questionModel = mongoose.model("question", questionSchema);

export default questionModel;
