import userModel from "../model/user.model.js";
import roomModel from "../model/room.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getAllUser = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
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
  const userId = req.user.id;

  try {
    const data = await userModel.findById(userId);
    if (req.user.role == "admin") {
      const admin_room = await roomModel.findById(data.admin_room);
      const newData = {
        ...data._doc,
        admin_room_code: admin_room.room_code,
        admin_room_name: admin_room.room_name,
      };
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
  const userId = req.user.id;

  try {
    const response = await userModel.findByIdAndUpdate(userId, {
      status: req.body.status,
    });
    return next(
      ResponseHandler.successResponse(res, 200, "successful", response)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const patchUserModule = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;
  const { index } = req.params;

  console.log(index);

  const moduleIndex = parseInt(index, 10);

  try {
    // Construct the update object using MongoDB's $set operator
    const update = {
      [`modules_completed.${moduleIndex}`]: true,
    };

    // Find the user by ID and update the specific module
    const response = await userModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    );
    // Check how many modules have been completed
    const completedModulesCount =
      response.modules_completed.filter(Boolean).length;

    // If all modules are completed, update the achievement
    if (completedModulesCount === 1) {
      response.achievement[3] = true;
      await response.save();
    }
    if (completedModulesCount === 5) {
      response.achievement[8] = true;
      await response.save();
    }
    if (completedModulesCount === 10) {
      response.achievement[13] = true;
      await response.save();
    }

    return next(
      ResponseHandler.successResponse(res, 200, "successful", response)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
