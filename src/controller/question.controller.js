import questionModel from "../model/question.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    // Fetch all questions
    const questions = await questionModel.find().exec();
    return ResponseHandler.successResponse(res, 200, "successful", questions);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getTypeQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { category } = req.params;
  try {
    const questions = await questionModel.find({
      category: { $in: [category] },
    });
    return ResponseHandler.successResponse(res, 200, "successful", questions);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
