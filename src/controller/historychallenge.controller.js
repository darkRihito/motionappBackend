import userModel from "../model/user.model.js";
import roomModel from "../model/room.model.js";
import historyChallengeModel from "../model/historychallenge.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getHistory = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  try {
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
    const { type } = req.params;
    // cari kuis yang sedang dikerjakan user
    const response = await historyChallengeModel.findOne({ 
      user_id: userId,
      is_finished: false,
    });
    if (!response) {
      // bikin
      const newChallenge = await historyChallengeModel({
        user_id: userId,
        type: type,
        start_time: Date.now(),
      });
      await newChallenge.save();
      return next(
        ResponseHandler.successResponse(res, 200, "successful", newChallenge)
      );
    } else {
      if(response.type == type){
        return next(
          ResponseHandler.successResponse(res, 200, "successful", response)
        );
      }else{
        return next(ResponseHandler.errorResponse(res, 500, "Anda sedang mengerjakan challenge lain!"));
      }
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
    const { type } = req.params;

    // Find the challenge
    const challenge = await historyChallengeModel.findOneAndUpdate(
      { type: type, user_id: userId },
      { $set: { is_finished: true, end_time: Date.now() } },
      { new: true }
    );

    if (!challenge) {
      return next(
        ResponseHandler.errorResponse(res, 404, "Challenge not found or unauthorized")
      );
    }

    return next(
      ResponseHandler.successResponse(res, 200, "Challenge ended successfully", challenge)
    );
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
