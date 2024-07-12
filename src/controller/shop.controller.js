import userModel from "../model/user.model.js";
import ResponseHandler from "../utils/responseHandler.js";
import settingsModel from "../model/settings.model.js";

const allAvatars = [
  { points: 20, icon: "/assets/icon/villager.png" },
  { points: 40, icon: "/assets/icon/knight.png" },
  { points: 100, icon: "/assets/icon/assasin.png" },
  { points: 150, icon: "/assets/icon/guardian.png" },
  { points: 300, icon: "/assets/icon/prince.png" },
  { points: 500, icon: "/assets/icon/king.png" },
  { points: 700, icon: "/assets/icon/angel.png" },
];

const getRandomAvatars = () => {
  const shuffled = allAvatars.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

// Daily reset of available avatars
export const resetDailyAvatars = async () => {
  const randomAvatars = getRandomAvatars();
  await settingsModel.findOneAndUpdate(
    { key: "dailyAvatars" },
    { value: randomAvatars },
    { upsert: true }
  );
};

export const initializeDailyAvatars = async () => {
  const settings = await settingsModel.findOne({ key: "dailyAvatars" });
  if (!settings) {
    const randomAvatars = getRandomAvatars();
    await settingsModel.create({ key: "dailyAvatars", value: randomAvatars });
  }
};

// Get daily avatars
export const getDailyAvatars = async (req, res, next) => {
  try {
    const settings = await settingsModel.findOne({ key: "dailyAvatars" });
    console.log("oit", settings);
    if (settings) {
      return next(
        ResponseHandler.successResponse(res, 200, "success", settings.value)
      );
    } else {
      return next(
        ResponseHandler.errorResponse(res, 500, "Daily avatars not set")
      );
    }
  } catch (error) {
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};

export const buyAvatar = async (req, res, next) => {
  const userId = req.user.id;
  const itemTarget = req.body.item_target;
  const itemUrl = req.body.item_url;

  try {
    const dailyAvatarsSetting = await settingsModel.findOne({
      key: "dailyAvatars",
    });
    const dailyAvatars = dailyAvatarsSetting ? dailyAvatarsSetting.value : [];

    const isValidAvatar = dailyAvatars.some(
      (avatar) => avatar.icon === itemUrl && avatar.points === itemTarget
    );
    if (!isValidAvatar) {
      return next(
        ResponseHandler.errorResponse(
          res,
          400,
          "Avatar not available for purchase today"
        )
      );
    }

    const data = await userModel.findById(userId);
    if (data.challenge_point >= itemTarget) {
      data.challenge_point -= itemTarget;
      data.pict_url = itemUrl;
      if (itemTarget >= 700) {
        data.achievement[17] = true;
      }
      await data.save();

      return next(
        ResponseHandler.successResponse(res, 200, "successful", data)
      );
    } else {
      return next(
        ResponseHandler.errorResponse(res, 400, "Insufficient points")
      );
    }
  } catch (error) {
    console.error("Error buying avatar:", error.message);
    return next(ResponseHandler.errorResponse(res, 500, error.message));
  }
};