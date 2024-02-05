import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
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
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      nickname: req.body.nickname,
      email: req.body.email,
      password: hashPaswword,
      phone: req.body.phone,
      no_ID: req.body.no_ID,
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
