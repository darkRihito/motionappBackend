import userModel from "../model/user.model.js";
import ResponseHandler from "../utils/responseHandler.js";

// export const getuser = async (
//   /** @type import('express').Request */ req,
//   /** @type import('express').Response */ res
// ) => {
//   try {
//   } catch (error) {}
// };

export const getAllUser = async (req, res, next) => {
  try {
    // Fetch all users
    const users = await userModel.find();

    if (!users || users.length === 0) {
      return next(ResponseHandler.errorResponse(res, 404, "No users found"));
    }

    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject
        ? user.toObject()
        : user;
      return userWithoutPassword;
    });

    return ResponseHandler.successResponse(
      res,
      200,
      "Users",
      usersWithoutPasswords
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
