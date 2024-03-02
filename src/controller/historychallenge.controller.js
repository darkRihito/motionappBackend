import historyChallengeModel from "../model/historychallenge.model.js";
import historyModel from "../model/history.model.js";
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
    // Cek apakah user hendak melakukan challenge kategori: pretest/latihan/posttest.
    const { category } = req.params;
    // Cek apakah user sedang aktif dalam challenge lain
    // const response = await historyChallengeModel.findOne({
    //   user_id: userId,
    //   is_finished: false,
    // });
    const response = await historyChallengeModel.find();

    const hasUnfinished = response
      .filter((item) => item.is_finished === false && item.user_id === userId)
      .map((item) => item._id);

    const donePretest = response
      .filter(
        (item) => item.is_finished === true && item.category === "pretest"
      )
      .map((item) => item._id);

    // console.log("HASUNFINISHED", hasUnfinished);
    // console.log("donePretest", donePretest);

    if (donePretest.length != 0) {
      console.log("DONE PRETEST");
      return next(
        ResponseHandler.errorResponse(
          res,
          500,
          "Anda sudah mengerjakan pretest!"
        )
      );
    } else if (hasUnfinished.length != 0) {
      if (response.category == category) {
        console.log("LANJUT");

        return next(
          ResponseHandler.successResponse(res, 200, "successful", response)
        );
      } else {
        console.log("ADA TES LAIN");

        return next(
          ResponseHandler.errorResponse(
            res,
            500,
            "Anda sedang mengerjakan challenge lain!"
          )
        );
      }
    } else {
      console.log("MASUK");

      // Apabila user sedang tidak dalam proses challenge lain
      const newChallenge = await historyChallengeModel({
        user_id: userId,
        category: category,
        start_time: Date.now(),
      });
      await newChallenge.save();
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
