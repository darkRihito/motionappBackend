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

export const getPretestQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const questions = await questionModel.find({
      category: { $in: ["pretest"] },
    });
    return ResponseHandler.successResponse(res, 200, "successful", questions);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
