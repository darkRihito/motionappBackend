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
    const response = await historyChallengeModel.findOne({
      user_id: userId,
      category,
    });

    const cookiesName = `is_doing_challenge:${userId}`;
    const cookieValue = req.cookies[cookiesName];
    const is_doing_challenge = cookieValue ? JSON.parse(cookieValue) : null;

    if (is_doing_challenge) {
      console.log("is doing challenge");
      if (
        is_doing_challenge.category.toString() === category &&
        is_doing_challenge.user_id === userId
      ) {
        console.log(is_doing_challenge.category.toString(), category);
        // cek user sedang mengerjakan challenge tersebut?
        console.log("sedang mengerjakan");
        const challenge = await historyChallengeModel.findOne({
          user_id: userId,
          category: category,
        });
        return next(
          ResponseHandler.successResponse(res, 200, "successful", challenge)
        );
      } else {
        // user sedang mengerjakan challenge lain
        console.log(is_doing_challenge.category.toString(), category);
        console.log("User sedang melakukan challenge lain");
        return next(
          ResponseHandler.errorResponse(
            res,
            500,
            "Anda sedang mengerjakan challenge lain!"
          )
        );
      }
    } else {
      // user pertama kali challenge by history
      console.log("User pertama kali melakukan pre-test");
      const newChallenge = await historyChallengeModel({
        user_id: userId,
        category: category,
        start_time: Date.now(),
      });
      await newChallenge.save();
      const data = {
        category: category,
        start_time: newChallenge.start_time,
        user_id: newChallenge.user_id,
      };
      res.cookie(`is_doing_challenge:${userId}`, JSON.stringify(data), {
        maxAge: 900000,
        httpOnly: true,
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
      { $set: { is_finished: true, end_time: Date.now() } },
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
    res.clearCookie(`is_doing_challenge:${userId}`);
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
