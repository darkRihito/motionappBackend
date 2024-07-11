import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import roomModel from "../model/room.model.js";
import practiceModel from "../model/practice.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const register = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPaswword = await bcrypt.hash(req.body.password, salt);
    if (req.body.role === "admin") {
      const count = await roomModel.countDocuments();
      const generatedcode = `R${(count + 1).toString().padStart(3, "0")}`;
      let adminRoom = await roomModel({
        room_name: req.body.adminroomname,
        room_code: generatedcode,
      });
      const response = await adminRoom.save();
      const newAdmin = await userModel({
        name: req.body.name,
        email: req.body.email,
        password: hashPaswword,
        role: req.body.role,
        admin_room: response._id,
      });
      await newAdmin.save();
      return next(
        ResponseHandler.successResponse(
          res,
          201,
          "Admin created successfully",
          newAdmin
        )
      );
    } else {
      const newUser = await userModel({
        name: req.body.name,
        nickname: req.body.nickname,
        email: req.body.email,
        password: hashPaswword,
        room: req.body.room,
        role: req.body.role,
        challenge_point: 10,
        star_collected: 0,
        qualification: "?",
        status: "",
        is_doing_challenge: "free",
        pretest_done: false,
        pretest_score: -1,
        posttest_done: false,
        posttest_score: -1,
      });
      let practice = await practiceModel({
        user_id: newUser._id,
        stage: 0,
        correct: 0,
        knowledge: 0,
        point_gain: 0,
        question: {},
      });
      await practice.save();

      const checkRoom = await roomModel.findOne({ room_code: req.body.room });
      if (!checkRoom) {
        return next(
          ResponseHandler.errorResponse(
            res,
            404,
            "Room not found, please input a valid room code"
          )
        );
      }
      checkRoom.list_user.push({ userId: newUser._id });
      await newUser.save();
      await checkRoom.save();
      return next(
        ResponseHandler.successResponse(
          res,
          201,
          "User created successfully",
          newUser
        )
      );
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const login = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(ResponseHandler.errorResponse(res, 404, "User not found"));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(
        ResponseHandler.errorResponse(res, 401, "Invalid credentials")
      );
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.cookie("access_token", token, {
      httpOnly: false,
      sameSite: "none",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    const { password: _, ...data } = user._doc;
    data.token = token;
    req.user = user;
    return next(
      ResponseHandler.successResponse(res, 200, "Login successful", data)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const logout = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    res.clearCookie("access_token");
    return ResponseHandler.successResponse(res, 200, "Logout successful");
  } catch (error) {
    return ResponseHandler.errorResponse(res, 500, error.message);
  }
};
