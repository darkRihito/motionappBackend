import historyChallengeModel from "../model/historychallenge.model.js";
import historyModel from "../model/history.model.js";
import userModel from "../model/user.model.js";
import questionModel from "../model/question.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getHistory = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const data = await historyChallengeModel.find();
    return next(ResponseHandler.successResponse(res, 200, "successful", data));
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

// Start Challenge
export const startChallenge = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;
    const response = await userModel.findOne({ _id: userId });

    if (!(response.qualification == "?")) {
      // Done
      console.log("Sudah menyelesaikan pre-test!");
      return next(
        ResponseHandler.errorResponse(
          res,
          500,
          "Anda sudah mengerjakan pretest!"
        )
      );
    } else if (response.is_doing_challenge == "pretest") {
      // Lanjut
      console.log("User perlu melanjutkan challenge!");
      const challenge = await historyChallengeModel.findOne({
        user_id: userId,
        category: "pretest",
      });
      return next(
        ResponseHandler.successResponse(res, 200, "successful", challenge)
      );
    } else if (response.is_doing_challenge == "free") {
      // Bikin baru
      console.log("User pertama kali melakukan pre-test");
      const data = {
        user_id: userId,
        category: category,
      };
      res.cookie("is_doing_challenge", JSON.stringify(data), {
        maxAge: 900000,
        httpOnly: true,
      });

      const newChallenge = await historyChallengeModel({
        user_id: userId,
        category: category,
        start_time: Date.now(),
      });
      await newChallenge.save();
      return next(
        ResponseHandler.successResponse(res, 200, "successful", newChallenge)
      );
    } else {
      // Dalam challenge lain
      console.log("User sedang melakukan challenge lain");
      return next(
        ResponseHandler.errorResponse(
          res,
          500,
          "Anda sedang mengerjakan challenge lain!"
        )
      );
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

// End Challenge
export const endChallenge = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;
    const { answer } = req.body;

    const questionIds = Object.keys(answer).map((id) => id);

    const questions = await questionModel.find({
      _id: { $in: questionIds },
    });
    if (!questions.length) {
      return next(
        ResponseHandler.errorResponse(res, 404, "Questions not found!")
      );
    }
    let correctCount = 0;
    questions.forEach((question) => {
      const questionId = question._id.toString();
      if (
        answer[questionId] &&
        answer[questionId].toLowerCase() === question.answer.toLowerCase()
      ) {
        correctCount++;
      }
    });
    const score = (correctCount / questions.length) * 100;

    const challenge = await historyChallengeModel.findOneAndUpdate(
      { category: category, user_id: userId },
      { $set: { end_time: Date.now() } },
      { new: true }
    );

    if (!challenge) {
      return next(
        ResponseHandler.errorResponse(
          res,
          404,
          "Challenge not found or unauthorized"
        )
      );
    }

    // Create userHistory
    const newHistory = await historyModel({
      user_id: userId,
      name: category,
      score: score,
      point: score,
      result: "OK!",
    });
    await newHistory.save();

    return next(
      ResponseHandler.successResponse(
        res,
        200,
        "Challenge ended successfully",
        newHistory
      )
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
