class AppError extends Error {
  constructor(
    statusCode,
    handler,
    messageCode = "G_E001",
    optionalMessage = undefined,
    mergeOptional = false
  ) {
    super(messageCode);

    this.statusCode = statusCode || 500;
    this.handler = handler || "global";
    this.messageCode = messageCode || "G_E001";
    this.optionalMessage = optionalMessage;
    this.mergeOptional = mergeOptional;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
