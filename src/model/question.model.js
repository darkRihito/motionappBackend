import mongoose, { Schema } from "mongoose";

const questionSchema = mongoose.Schema(
  {
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    question: {
      type: String,
      required: [true, "Question is required"],
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
