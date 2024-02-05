class ResponseHandler {
  static successResponse(res, statusCode, message, data) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
  static errorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default ResponseHandler;
