import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spaceRegesPattern = /\s/;

const userSchema = mongoose.Schema(
  {
    first_name: {
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
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      maxLength: [20, "Last name must be less than 20 characters"],
      validate: {
        validator: function (value) {
          return !spaceRegesPattern.test(value);
        },
        message: "Last name must not contain spaces",
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
    phone: {
      type: String,
      minLength: [11, "Please enter a valid phone number"],
      unique: true,
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
    },
    role: {
      type: String,
      default: "user",
    },
    no_ID: {
      type: String,
      required: [true, "no_ID is required"],
      unique: true,
      validate: {
        validator: function (value) {
          return !spaceRegesPattern.test(value);
        },
        message: "no_ID must not contain spaces",
      },
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
