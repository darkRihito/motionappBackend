import historyModel from "../model/history.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getAllHistory = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const history = await historyModel.find();
    if (!history || history.length === 0) {
      return next(ResponseHandler.errorResponse(res, 404, "No history found"));
    }
    return ResponseHandler.successResponse(res, 200, users);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getHistoryId = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;
  
  try {
    const history = await historyModel
      .find({ user_id: userId })
      .select("-user_id -_id");
    return next(
      ResponseHandler.successResponse(res, 200, "successful", history)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const createHistory = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;
  const { name, score, point, result } = req.body;

  try {
    const newHistory = await historyModel({
      user_id: userId,
      name: name,
      score: score,
      point: point,
      result: result,
    });
    await newHistory.save();
    return ResponseHandler.successResponse(res, 200, newHistory);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
