import historyModel from "../model/history.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getAllHistory = async (req, res, next) => {
  try {
    const history = await historyModel.find();
    if (!history || history.length === 0) {
      return next(ResponseHandler.errorResponse(res, 404, "No users found"));
    }
    return ResponseHandler.successResponse(res, 200, users);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getHistoryId = async (req, res, next) => {
  const userid = req.user.id;
  try {
    const history = await historyModel.find({ userId: userid }).select("-userId -_id").exec();
    return next(
      ResponseHandler.successResponse(res, 200, "successful", history)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
