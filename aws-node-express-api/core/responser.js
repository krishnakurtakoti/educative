const logger = require("../util/log");
const messageCode = require("../error-code");
const axios = require("axios").default;
const { isStatusCode } = require("./utils");

let cacheAPIHolder = {};
const getCachedAPIData = (apiName) => {
  if (cacheAPIHolder[apiName]) {
    logger.data("Cache Hit.", apiName);
    return cacheAPIHolder[apiName];
  }
  logger.data("Cache Miss.", apiName);
  return null;
};

const setCachedAPIData = (apiName, data) => {
  cacheAPIHolder[apiName] = data;
  logger.data("Cache Added.", apiName);
};

module.exports.useCache = async (req, res, next) => {
  try {
    const cache = getCachedAPIData(req.originalUrl);
    if (cache) {
      res.status(200).send(cache);
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

const getMessage = (handler, locale, code) => {
  return messageCode[handler][locale][code];
};

const successResponse = (
  handler,
  messageCode,
  req,
  data,
  cache,
  extras,
  success
) => {
  let responseData = {
    status: " success",
    message: getMessage(handler, req.headers.locale || "en", messageCode),
    messageCode,
    success,
    data,
  };
  if (Array.isArray(data)) responseData.totals = { count: data.length };
  if (extras) {
    if (Array.isArray(extras))
      throw new Error("Extra data needs to be a non array object");
    if (typeof extras == "object") {
      responseData = { ...responseData, ...extras };
    }
  }
  logger.info(`Success || ${messageCode} || ${handler} || ${req.originalUrl}`);
  if (cache) setCachedAPIData(req.originalUrl, responseData);
  return responseData;
};

const errorResponse = (handler, messageCode, req, error) => {
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  const notificationData = {
    userAgent: req.get("User-Agent"),
    url: fullUrl,
    method: req.method,
    errorName: error.name || undefined,
    errorMessage: error.message || undefined,
    errorStack: error.stack,
    //platform: process.env.PLATFORM,
    environment: "dev" || process.env.S3_IMAGE_PATH,
    date: new Date(),
    ip: req.ip,
  };
  if (req.method.toUpperCase() == "GET") {
    notificationData.request = {
      query: req.query,
      params: req.params,
    };
  } else {
    notificationData.request = req.body
      ? typeof req.body == "object"
        ? req.body
        : JSON.parse(req.body)
      : {};
  }

  // More logging if error isOperational
  if (error.isOperational) {
    notificationData.statusCode = error.statusCode;
    notificationData.handler = error.handler;
    notificationData.messageCode = error.messageCode;
    notificationData.optionalMessage = error.optionalMessage;
    notificationData.status = error.status;
    notificationData.message = messageCode
      ? getMessage(handler, req.headers.locale || "en", messageCode)
      : "Unknown Error";
  }

  if (
    notificationData.handler === "auth" &&
    notificationData.environment !== "dev"
  ) {
    delete notificationData.request;
  }

  // Logging Error Notification to console
  logger.error("Error Notification: ", notificationData);
  //delete createdAgent
  if (notificationData.request) delete notificationData.request.createdAgent;
  // Sending Slack Notification
  // sendSlackNotification(notificationData);
  // Response Data for the client request
  let response = {
    status: "error",
    message: messageCode
      ? getMessage(handler, req.headers.locale || "en", messageCode)
      : "Unknown Error",
    messageCode,
  };
  if (error.isOperational) {
    // If mergeOptional is true, then merge translated error Message and Optional Parameters
    if (error.mergeOptional) {
      response.message = response.message + " : " + error.optionalMessage;
    } else {
      response.errorDetails = error.optionalMessage;
    }
  }
  // If message is dynamic (for refund message) in error response for Maxis
  if (error.dynamicMessage) {
    response.message = error.dynamicMessage;
    response.errorDetails = error.data;
  }
  return response;
};

module.exports.send = (
  statusCode,
  handler,
  messageCode,
  req,
  res,
  data,
  cache = false,
  extras = null,
  success = true
) => {
  let responseData;
  statusCode = isStatusCode(statusCode) ? statusCode : 500;
  if (`${statusCode}`.startsWith("2")) {
    responseData = successResponse(
      handler,
      messageCode,
      req,
      data,
      cache,
      extras,
      success
    );
  }
  if (`${statusCode}`.startsWith("4") || `${statusCode}`.startsWith("5")) {
    responseData = errorResponse(handler, messageCode, req, data);
  }
  res.status(statusCode).send(responseData);
};

module.exports.globalErrorHandler = (req, res, err) => {
  this.send(500, "global", "G_E001", req, res, err);
};