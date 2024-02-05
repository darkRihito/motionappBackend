import ResponseHandler from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
export const isAuthenticated = async (req, res, next) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    ResponseHandler.errorResponse(res, 401, "Unauthorized");
  }
  jwt.verify(access_token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      ResponseHandler.errorResponse(res, 401, "Unauthorized");
    }
    req.user = user;
    next();
  });
};

export const authorizeRules = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || "")) {
      ResponseHandler.errorResponse(res, 403, "Forbidden");
    }
    next();
  };
};
