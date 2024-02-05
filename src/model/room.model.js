import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spaceRegesPattern = /\s/;

const roomSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Room name is required"],
    maxLength: [20, "Room name must be less than 20 characters"],
    validate: {
      validator: function (value) {
        return !spaceRegesPattern.test(value);
      },
      message: "Room name must not contain spaces",
    },
  },
  challanges: [],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.model("Room", roomSchema);
