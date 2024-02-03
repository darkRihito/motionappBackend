import mongoose, { Schema } from "mongoose";

const emailRegesPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema =  mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: {
            validator: function (value) {
                return emailRegesPattern.test(value);
            }
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
    }
}, { timestamps: true, });

const userModel = mongoose.Model("User", userSchema);

export default userModel; 
