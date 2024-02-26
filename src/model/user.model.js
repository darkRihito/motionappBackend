import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spaceRegesPattern = /\s/;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "First name is required"],
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
      type: String,
    },
    status: {
      type: String,
      default: "",
    },
    admin_room_name: {
      type: String,
    },
    pict_url: {
      type: String,
      default: "",
    },
    challenge_point: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      default: "?",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
