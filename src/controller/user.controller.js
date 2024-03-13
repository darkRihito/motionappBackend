import userModel from "../model/user.model.js";
import roomModel from "../model/room.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getAllUser = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    // Fetch all users
    const users = await userModel.find({ role: "user" }).select("-password");
    if (!users || users.length === 0) {
      return next(ResponseHandler.errorResponse(res, 404, "No users found"));
    }
    return ResponseHandler.successResponse(res, 200, users);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getAllUserRoom = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { room } = req.params;
  try {
    // Fetch all users
    const users = await userModel
      .find({ role: "user", room: room })
      .select("-password");
    return ResponseHandler.successResponse(res, 200, "success", users);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getUserId = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const userid = req.user.id;
    const data = await userModel.findById(userid).exec();
    if (req.user.role == "admin") {
      const admin_room = await roomModel.findById(data.admin_room).exec();
      const adminrcode = admin_room.room_code;
      const newData = {
        ...data._doc,
        admin_room_code: adminrcode,
      };
      data.admin_room_code = adminrcode;
      return next(
        ResponseHandler.successResponse(res, 200, "successful", newData)
      );
    }
    return next(ResponseHandler.successResponse(res, 200, "successful", data));
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const patchUserStatus = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const userid = req.user.id;
    const response = await userModel
      .findByIdAndUpdate(userid, { status: req.body.status })
      .exec();
    return next(
      ResponseHandler.successResponse(res, 200, "successful", response)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
