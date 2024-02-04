import userModel from "../model/user.model.js";
import jwt from "json-web-token";
import bcrypt from "bcrypt";

export const register = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res
) => {

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPaswword = await bcrypt.hash(req.body.password, salt);
    const newUser = await userModel({
      email: req.body.email,
      password: hashPaswword,
      phone: req.body.phone,
      nickname: req.body.nickname,
    });

    await newUser.save();
    const response = res.status(201).json({  
      success: true,
      message: "User created successfully",
      data: newUser,
    });
    return response;
  } catch (error) {
    const response = res.status(500).json({
      success: false,
      message: error.message,
    });
    return response;
  }
};
