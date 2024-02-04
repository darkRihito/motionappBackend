import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spaceRegesPattern = /\s/;


const userSchema =  mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: {
            validator: function (value) {
                return emailRegesPattern.test(value);
            },
            message: "Please enter a valid email address",
        },
        unique: true
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
    }
}, { timestamps: true, });

const userModel = mongoose.model("User", userSchema);

export default userModel; 
