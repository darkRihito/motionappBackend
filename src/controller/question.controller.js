import questionModel from "../model/question.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const questions = await questionModel.find();
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

export const getRoomQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { room } = req.params;

  try {
    const questions = await questionModel.find({
      room_code: room,
    });
    return ResponseHandler.successResponse(res, 200, "successful", questions);
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const createQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { room_code, question, answer, category, difficulty } =
    req.body.payload;

  try {
    const newQuestion = await questionModel({
      room_code: room_code,
      question: question,
      answer: answer,
      category: category,
      difficulty: difficulty,
    });
    await newQuestion.save();
    return next(
      ResponseHandler.successResponse(res, 200, "successful", newQuestion)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const editQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { id } = req.params;
  const { question, answer, category, difficulty } = req.body.payload;

  console.log(question, answer, category, difficulty);

  try {
    const updatedQuestion = await questionModel.findByIdAndUpdate(id, {
      question: question,
      answer: answer,
      category: category,
      difficulty: difficulty,
    });
    return next(
      ResponseHandler.successResponse(res, 200, "successful", updatedQuestion)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const addExplanation = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { id } = req.params;
  const { explanation } = req.body.payload;

  try {
    const updatedQuestion = await questionModel.findByIdAndUpdate(id, {
      explanation: explanation,
    });
    return next(
      ResponseHandler.successResponse(res, 200, "successful", updatedQuestion)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const deleteQuestions = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await questionModel.findByIdAndDelete(id);
    return next(
      ResponseHandler.successResponse(res, 200, "successful", deletedQuestion)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
