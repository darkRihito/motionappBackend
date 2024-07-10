import historyChallengeModel from "../model/historychallenge.model.js";
import historyModel from "../model/history.model.js";
import userModel from "../model/user.model.js";
import questionModel from "../model/question.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const startSimulation = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;
    const response = await userModel
      .findOne({ _id: userId })
      .select("is_doing_challenge pretest_done");
    if (response.is_doing_challenge === "free") {
      if (
        (category === "structure" ||
          category === "written" ||
          category === "structurewritten") &&
        !response.pretest_done
      ) {
        return next(
          ResponseHandler.errorResponse(
            res,
            500,
            "Silakan lakukan pretest terlebih dahulu!"
          )
        );
      } else {
        const challenge = await historyChallengeModel.findOne({
          user_id: userId,
          category: category,
        });
        if (challenge) {
          let questions = [];
          if (category === "structurewritten") {
            const structureQuestions = await questionModel.aggregate([
              { $match: { category: "structure" } },
              { $sample: { size: 25 } },
            ]);
            const writtenQuestions = await questionModel.aggregate([
              { $match: { category: "written" } },
              { $sample: { size: 15 } },
            ]);
            questions = [...writtenQuestions, ...structureQuestions];
          }
          const questionIds = questions.map((q) => ({
            question: q.question,
            question_id: q._id,
            answer: "",
            is_correct: false,
          }));
          const newChallenge = await historyChallengeModel.findByIdAndUpdate(
            challenge._id,
            {
              user_id: userId,
              category: category,
              is_finished: false,
              start_time: Date.now(),
              answer: questionIds,
            }
          );
          await userModel.findByIdAndUpdate(userId, {
            is_doing_challenge: category,
          });
          return next(
            ResponseHandler.successResponse(
              res,
              200,
              "successful",
              newChallenge
            )
          );
        } else {
          let questions = [];
          if (category === "structurewritten") {
            const structureQuestions = await questionModel.aggregate([
              { $match: { category: "structure" } },
              { $sample: { size: 25 } },
            ]);
            const writtenQuestions = await questionModel.aggregate([
              { $match: { category: "written" } },
              { $sample: { size: 15 } },
            ]);
            questions = [...writtenQuestions, ...structureQuestions];
          }
          const questionIds = questions.map((q) => ({
            question: q.question,
            question_id: q._id,
            answer: "",
            is_correct: false,
          }));
          const newChallenge = await historyChallengeModel.create({
            user_id: userId,
            category: category,
            is_finished: false,
            start_time: Date.now(),
            answer: questionIds,
          });
          await userModel.findByIdAndUpdate(userId, {
            is_doing_challenge: category,
          });
          return next(
            ResponseHandler.successResponse(
              res,
              200,
              "successful",
              newChallenge
            )
          );
        }
      }
    } else {
      if (response.is_doing_challenge === category) {
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
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const endSimulation = async (
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
    // console.log("DEBUG", answer, "IDS", questionIds, "QUESTIONS", questions);

    let correctCount = 0;
    const answersWithCorrectness = questions.map((question) => {
      const questionId = question._id.toString();
      const userAnswer = answer[questionId].toLowerCase();
      const isCorrect = userAnswer === question.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return {
        question: question.question,
        question_id: question._id,
        answer: userAnswer.toUpperCase(),
        is_correct: isCorrect,
      };
    });
    const score = (correctCount / questionCount) * 100;
    const formattedScore = score.toFixed(2);
    // let scoreCategory = "";
    // if (score == 100) {
    //   scoreCategory = "Sempurna";
    // } else if (score < 100 && score > 79) {
    //   scoreCategory = "Sangat Baik";
    // } else if (score < 80 && score > 59) {
    //   scoreCategory = "Baik";
    // } else if (score < 60 && score > 39) {
    //   scoreCategory = "Cukup";
    // } else {
    //   scoreCategory = "Kurang Baik";
    // }
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
          "Simulation not found or unauthorized"
        )
      );
    }
    const newHistory = await historyModel({
      user_id: userId,
      name: "simulation",
      score: formattedScore,
      result: scoreCategory,
    });
    await newHistory.save();
    const user = await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          is_doing_challenge: "free",
          // qualification: scoreCategory,
        },
        $inc: {
          simulation_count: 1,
        },
      },
      { new: true }
    );

    if (user.simulation_count === 1) {
      user.achievement[2] = true;
      await user.save();
    }

    if (user.simulation_count === 5) {
      user.achievement[10] = true;
      await user.save();
    }

    if (user.simulation_count === 10) {
      user.achievement[14] = true;
      await user.save();
    }
    return next(
      ResponseHandler.successResponse(
        res,
        200,
        "Simulation Finished!",
        newHistory
      )
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const getDetailFinishedSimulation = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  console.log("UWU");
  try {
    const { category } = req.params;
    console.log(category);
    const challenge = await historyChallengeModel.findOne({
      user_id: req.user.id,
      category: category,
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
      ResponseHandler.successResponse(res, 200, "successful", challenge)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
