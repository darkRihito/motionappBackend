import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spaceRegesPattern = /\s/;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "First name is required"],
      maxLength: [20, "First name must be less than 20 characters"],
      validate: {
        validator: function (value) {
          return !spaceRegesPattern.test(value);
        },
        message: "First name must not contain spaces",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (value) {
          return emailRegesPattern.test(value);
        },
        message: "Please enter a valid email address",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    nickname: {
      type: String,
      required: [true, "Nickname is required"],
      maxLength: [15, "Nickname must be less than 20 characters"],
      validate: {
        validator: function (value) {
          return !spaceRegesPattern.test(value);
        },
        message: "Nickname must not contain spaces",
      },
      unique: true,
    },
    role: {
      type: String,
      default: "user",
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    status: {
      type: String,
    },
    pict_url: {
      type: String,
    },
    challenge_point: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
