import userModel from "../model/user.model.js";
import ResponseHandler from "../utils/responseHandler.js";

// Tukar poin
export const buyAvatar = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
  next
) => {
  const userId = req.user.id;
  const itemTarget = req.body.item_target;
  const itemUrl = req.body.item_url;

  try {
    const data = await userModel.findById(userId);
    if (data.challenge_point >= itemTarget) {
      const response = await userModel.findByIdAndUpdate(userId, {
        pict_url: itemUrl,
      });
      if (itemTarget === 700) {
        response.achievement[17] = true;
        await response.save();
      }
      return next(
        ResponseHandler.successResponse(res, 200, "successful", response)
      );
    } else {
      return next(ResponseHandler.errorResponse(res, 500, "Poin Kurang"));
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};
