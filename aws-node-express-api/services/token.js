const jwt = require("jsonwebtoken");

const logger = require("../util/log");
var TokenModel = require("../models/token.model");

module.exports.signToken = async (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: 900, // expires in 15 min
    //expiresIn: "365d",
  });
};

module.exports.tokenVerify = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
module.exports.refreshToken = async (id) => {
  return jwt.sign({ id: id }, process.env.REFRESH_SECRET, {
    //expiresIn: 86400 // expires in 24 hours
    expiresIn: "30d",
    //expiresIn: "7d",
  });
};

module.exports.setCookieOption = async (refresh) => {
  var date = new Date();

  // Get Unix milliseconds at current time plus 365 days
  date.setTime(30 * 86400000); //24 \* 60 \* 60 \* 100
  //date.setTime(1 * 86400000);
  //for server
  var options;
  if (process.env.COOKIE_DOMAIN === "localhost") {
    options = {
      maxAge: date,
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN,
    };
  } else {
    options = {
      maxAge: date,
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: process.env.COOKIE_DOMAIN,
    };
  }

  return options;
};

module.exports.verify_token = async (token) => {
  try {
    console.log("token: ", token);
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded: ", decoded);
    return decoded;
  } catch (err) {
    logger.error(err.message, err);
    throw err;
  }
};

module.exports.saveToken = async (insert) => {
  try {
    let token = new TokenModel(insert);
    return token.save();
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

//find in token
module.exports.findToken = async (conditions) => {
  try {
    return await TokenModel.findOne(conditions).populate("user");
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

//to update token
module.exports.updateToken = async (id, udatedata) => {
  try {
    return await TokenModel.findByIdAndUpdate(id, udatedata, { new: true });
  } catch (err) {
    logger.error(err.message);
    throw err.message;
  }
};

module.exports.timeDifference = async (curr, prev) => {
  const ms_Min = 60 * 1000; // milliseconds in Minute
  const ms_Hour = ms_Min * 60; // milliseconds in Hour
  const diff = curr - prev; //difference between dates.
  // If the diff is less then milliseconds in a minute
  logger.data("diff", diff);
  logger.data("ms_Hour", ms_Hour);

  if (diff > ms_Hour) {
    return false;
  } else {
    return true;
  }
};
