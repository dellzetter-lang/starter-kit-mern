class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.body = {
      success: true,
      message,
      data,
      meta,
    };
  }
}

module.exports = ApiResponse;
