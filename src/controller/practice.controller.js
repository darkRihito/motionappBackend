import userModel from "../model/user.model.js";
import historyModel from "../model/history.model.js";
import questionModel from "../model/question.model.js";
import practiceModel from "../model/practice.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const startPractice = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;

  try {
    const users = await userModel
      .findOne({ _id: userId })
      .select("is_doing_challenge pretest_done");

    if (!users.pretest_done) {
      return next(
        ResponseHandler.errorResponse(
          res,
          500,
          "Selesaikan pretest terlebih dahulu!"
        )
      );
    }

    if (
      users.is_doing_challenge != "free" &&
      users.is_doing_challenge != "practice"
    ) {
      return next(
        ResponseHandler.errorResponse(
          res,
          500,
          "Anda sedang berada di challenge lain!"
        )
      );
    } else if (users.is_doing_challenge == "free") {
      await userModel.findByIdAndUpdate(userId, {
        is_doing_challenge: "practice",
      });
      const question = await questionModel.aggregate([
        {
          $match: {
            category: { $in: ["structure", "written"] },
            difficulty: "medium",
          },
        },
        { $sample: { size: 1 } },
      ]);

      const practiceUpdateResponse = await practiceModel.findOneAndUpdate(
        { user_id: userId },
        {
          isFinished: false,
          knowledge: 0.4,
          point_gain: 0,
          stage: 0,
          correct: 0,
          question: {
            id: question[0]._id,
            question: question[0].question,
            category: question[0].category,
            difficulty: question[0].difficulty,
          },
        },
        { new: true, upsert: true }
      );

      return next(
        ResponseHandler.successResponse(
          res,
          200,
          "successful",
          practiceUpdateResponse
        )
      );
    } else {
      const response = await practiceModel.findOne({ user_id: userId });
      return next(
        ResponseHandler.successResponse(res, 200, "successful", response)
      );
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

// submit
export const submitAnswer = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;
  const payload = req.body;
  //   const payload = {
  //     question_id: String,
  //     user_answer: Char,
  //     stage: Number,
  //     health: Number,
  //     point_gain: Number,
  //     knowledge: Number,
  //     correct_count: Number,
  //   };

  try {
    const questions = await questionModel.find({
      category: { $in: ["structure", "written"] },
    });
    // const practice = await practiceModel.findOne({
    //   user_id: userId,
    // });

    // Check if answer is correct
    const currentQuestion = questions.find(
      (question) => question._id.toString() === payload.question_id
    );

    // console.log("CURR", currentQuestion);

    const userAnswer = payload.user_answer.toLowerCase();
    const isCorrect = userAnswer === currentQuestion.answer.toLowerCase();
    const explanation = currentQuestion.explanation;

    let guessRate = 0.1;
    let slipRate = 0.05;
    let pLearn = 0.0,
      pGuess = 0.0;
    function updateKnowledge(isCorrect, currentKnowledge) {
      pLearn =
        (currentKnowledge * (1 - slipRate)) /
        (currentKnowledge * (1 - slipRate) +
          (1 - currentKnowledge) * guessRate);
      pGuess =
        ((1 - currentKnowledge) * guessRate) /
        ((1 - currentKnowledge) * guessRate + currentKnowledge * slipRate);

      if (isCorrect) {
        currentKnowledge = currentKnowledge + (1 - currentKnowledge) * pLearn;
      } else {
        currentKnowledge = currentKnowledge * (1 - pGuess);
      }
      return currentKnowledge;
    }
    let newKnowledge = updateKnowledge(isCorrect, payload.knowledge);
    // console.log("NK:", newKnowledge, "PL:", pLearn, "PG:", pGuess);

    let isFinished = false;
    let isWinning = false;
    let resultCategory = "";
    let health = payload.health;
    let correctCount = payload.correct_count;
    let pointGain = payload.point_gain;
    let starGain = 0;
    let nextQuestion = "";

    // Pembobotan soal dan poin
    if (isCorrect) {
      if (currentQuestion.difficulty === "easy") {
        pointGain += 5;
      } else if (currentQuestion.difficulty === "medium") {
        pointGain += 10;
      } else {
        pointGain += 15;
      }
      correctCount++;
    } else {
      pointGain -= 5;
      health--;
    }

    if (health === 0) {
      isFinished = true;
      isWinning = false;
    }
    if (payload.stage === 9) {
      isFinished = true;
      isWinning = true;
    }

    if (isFinished) {
      if (correctCount === 10) {
        starGain = 5;
        resultCategory = "Perfect";
      } else if (correctCount > 8) {
        starGain = 4;
        resultCategory = "Superr";
      } else if (correctCount > 6) {
        starGain = 3;
        resultCategory = "Awesome";
      } else if (correctCount > 4) {
        starGain = 2;
        resultCategory = "Great";
      } else if (correctCount > 2) {
        starGain = 1;
        resultCategory = "Nice";
      } else if (correctCount < 3) {
        starGain = 0;
        resultCategory = "Bad";
      }
      const practiceUpdateResponse = await practiceModel.findOneAndUpdate(
        { user_id: userId },
        {
          knowledge: 0.5,
          stage: 0,
          point_gain: 0,
          question: {},
          correct: 0,
        },
        { new: true }
      );
      const userData = await userModel.findById(userId);
      const userUpdateResponse = await userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            is_doing_challenge: "free",
            challenge_point: userData.challenge_point + pointGain,
            star_collected: userData.star_collected + starGain,
          },
          $inc: {
            practice_count: 1, // Increment practice_count by 1
          },
        },
        { new: true }
      );
      if (userUpdateResponse.practice_count === 1) {
        userUpdateResponse.achievement[1] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.challenge_point >= 50 &&
        userUpdateResponse.challenge_point < 100 &&
        userUpdateResponse.achievement[5] == false
      ) {
        userUpdateResponse.achievement[5] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.star_collected >= 5 &&
        userUpdateResponse.star_collected < 15 &&
        userUpdateResponse.achievement[4] === false
      ) {
        userUpdateResponse.achievement[4] = true;
        await userUpdateResponse.save();
      }
      if (userUpdateResponse.practice_count === 10) {
        userUpdateResponse.achievement[6] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.challenge_point >= 100 &&
        userUpdateResponse.challenge_point < 300 &&
        userUpdateResponse.achievement[7] == false
      ) {
        userUpdateResponse.achievement[7] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.star_collected >= 15 &&
        userUpdateResponse.star_collected < 26 &&
        userUpdateResponse.achievement[9] === false
      ) {
        userUpdateResponse.achievement[9] = true;
        await userUpdateResponse.save();
      }
      if (userUpdateResponse.practice_count === 20) {
        userUpdateResponse.achievement[12] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.star_collected >= 26 &&
        userUpdateResponse.achievement[11] === false
      ) {
        userUpdateResponse.achievement[11] = true;
        await userUpdateResponse.save();
      }
      if (userUpdateResponse.star_collected === 36) {
        userUpdateResponse.achievement[15] = true;
        await userUpdateResponse.save();
      }
      if (
        userUpdateResponse.challenge_point >= 300 &&
        userUpdateResponse.achievement[16] == false
      ) {
        userUpdateResponse.achievement[16] = true;
        await userUpdateResponse.save();
      }
      const newHistory = await historyModel({
        user_id: userId,
        name: "practice",
        score: correctCount * 10,
        point: pointGain,
        result: resultCategory,
      });
      await newHistory.save();

      const response = {
        isFinished: isFinished,
        isWinning: isWinning,
        resultCategory: resultCategory,
        isCorrect: isCorrect,
        bkt: {
          curKnowledge: newKnowledge,
          // curPLearn: pLearn,
          // curPGuess: pGuess,
        },
        curCorrect: correctCount,
        curPoint: pointGain,
        addPoint: pointGain - payload.point_gain,
        starGain: starGain,
        curStage: payload.stage + 1,
        explanation: explanation,
      };
      return next(
        ResponseHandler.successResponse(
          res,
          200,
          "Jawaban berhasil disimpan!",
          response
        )
      );
    } else {
      const easyQuestions = questions.filter(
        (question) => question.difficulty === "easy"
      );
      const mediumQuestions = questions.filter(
        (question) => question.difficulty === "medium"
      );
      const hardQuestions = questions.filter(
        (question) => question.difficulty === "hard"
      );
      if (newKnowledge > 0.7) {
        const randomIndex = Math.floor(Math.random() * hardQuestions.length);
        nextQuestion = hardQuestions[randomIndex];
      } else if (newKnowledge <= 0.7 && newKnowledge > 0.3) {
        const randomIndex = Math.floor(Math.random() * mediumQuestions.length);
        nextQuestion = mediumQuestions[randomIndex];
      } else {
        const randomIndex = Math.floor(Math.random() * easyQuestions.length);
        nextQuestion = easyQuestions[randomIndex];
      }
      console.log("UWU");
      const practiceUpdateResponse = await practiceModel.findOneAndUpdate(
        { user_id: userId },
        {
          knowledge: newKnowledge,
          stage: payload.stage + 1,
          question: {
            id: nextQuestion._id,
            question: nextQuestion.question,
            difficulty: nextQuestion.difficulty,
          },
          correct: correctCount,
          point_gain: pointGain,
        },
        { new: true }
      );
      const response = {
        isFinished: isFinished,
        isWinning: isWinning,
        resultCategory: resultCategory,
        isCorrect: isCorrect,
        bkt: {
          curKnowledge: newKnowledge,
          // curPLearn: pLearn,
          // curPGuess: pGuess,
        },
        curQuestion: {
          questionId: nextQuestion._id,
          question: nextQuestion.question,
          difficulty: nextQuestion.difficulty,
        },
        curCorrect: correctCount,
        curStage: payload.stage + 1,
        curHealth: health,
        curPoint: pointGain,
        addPoint: pointGain - payload.point_gain,
        explanation: explanation,
      };
      return next(
        ResponseHandler.successResponse(
          res,
          200,
          "Jawaban berhasil disimpan!",
          response
        )
      );
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
