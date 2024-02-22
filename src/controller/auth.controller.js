import userModel from "../model/user.model.js";
// import bcrypt from 'bcryptjs';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ResponseHandler from "../utils/responseHandler.js";

// User registration
export const register = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res
) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPaswword = await bcrypt.hash(req.body.password, salt);
    const newUser = await userModel({
      name: req.body.name,
      nickname: req.body.nickname,
      email: req.body.email,
      password: hashPaswword,
      room: req.body.room,
      role: req.body.role,
    });

    await newUser.save();
    ResponseHandler.successResponse(
      res,
      201,
      "User created successfully",
      newUser
    );
  } catch (error) {
    ResponseHandler.errorResponse(res, 500, error.message);
  }
};

// User login
export const login = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res
) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      ResponseHandler.errorResponse(res, 404, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      ResponseHandler.errorResponse(res, 401, "Invalid credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
    ResponseHandler.successResponse(res, 200, "Login successful", user);
  } catch (error) {
    ResponseHandler.errorResponse(res, 500, error.message);
  }
};

// User logout
export const logout = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res
) => {
  try {
    res.clearCookie("access_token");
    ResponseHandler.successResponse(res, 200, "Logout successful");
  } catch (error) {
    ResponseHandler.errorResponse(res, 500, error.message);
  }
};
