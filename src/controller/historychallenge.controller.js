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
    
    const response = await userModel
      .findOne({ _id: userId })
      .select("is_doing_challenge pretest_done posttest_done")
      .exec();
    const is_doing_challenge = response.is_doing_challenge;

    if (is_doing_challenge != "free") {
      if (is_doing_challenge === category) {
        const challenge = await historyChallengeModel.findOne({
          user_id: userId,
          category: category,
        });
        return next(
          ResponseHandler.successResponse(res, 200, "successful", challenge)
        );
      } else {
        return next(
          ResponseHandler.errorResponse(
            res,
            500,
            "Anda sedang berada di challenge lain!"
          )
        );
      }
    } else {
      console.log("UWUUU")
      const newChallenge = await historyChallengeModel({
        user_id: userId,
        category: category,
        start_time: Date.now(),
      });
      await newChallenge.save();
      const response = await userModel.findByIdAndUpdate(userId, {
        is_doing_challenge: category,
      });

      return next(
        ResponseHandler.successResponse(res, 200, "successful", newChallenge)
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
    const { answer, questionCount } = req.body;

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
    const answersWithCorrectness = questions.map((question) => {
      const questionId = question._id.toString();
      const userAnswer = answer[questionId].toLowerCase();
      const isCorrect = userAnswer === question.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return {
        question_id: question._id,
        answer: userAnswer.toUpperCase(),
        is_correct: isCorrect,
      };
    });
    const score = (correctCount / questionCount) * 100;
    const formattedScore = score.toFixed(2);
    const challenge = await historyChallengeModel.findOneAndUpdate(
      { category: category, user_id: userId },
      {
        $set: {
          is_finished: true,
          end_time: Date.now(),
          answer: answersWithCorrectness,
        },
      },
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
    const newHistory = await historyModel({
      user_id: userId,
      name: category,
      score: formattedScore,
      point: formattedScore,
      result: "OK!",
    });
    await newHistory.save();
    const user = await userModel.findByIdAndUpdate(userId, {
      $set: { pretest_done: true, is_doing_challenge: "free" },
    });
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

export const getAllChallenge = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const finishedChallenge = await historyChallengeModel.find({
      user_id: req.user.id,
      is_finished: true,
    });
    const unfinishedChallenge = await historyChallengeModel.find({
      user_id: req.user.id,
      is_finished: false,
    });
    return next(
      ResponseHandler.successResponse(res, 200, "successful", {
        finishedChallenge,
        unfinishedChallenge,
      })
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getDetailFinishedChallenge = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const { category } = req.params;
    const questions = await questionModel.find({
      category: { $in: [category] },
    });
    const challenge = await historyChallengeModel.findOne({
      user_id: req.user.id,
      category,
      is_finished: true,
    });
    if (!challenge) {
      return next(
        ResponseHandler.errorResponse(
          res,
          404,
          "Challenge not found or unauthorized"
        )
      );
    }
    return next(
      ResponseHandler.successResponse(res, 200, "successful", {
        challenge,
        questions,
      })
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
