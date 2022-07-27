module.exports.info = function (message) {
  console.log("INFO:" + message);
};

module.exports.error = function (message, error) {
  console.log("ERROR:" + message);
  console.log(error);
};

module.exports.data = function (message, data) {
  console.log("DATA:" + message);
  console.log(data);
};

module.exports.success = function (message, data) {
  console.log("SUCCESS:" + message);
  console.log(data);
};

/*
const authentication = require("./authentication.json");
const global = require("./global.json");


module.exports = {
  authentication,
  global,
};

{
  "en": {
    "L_S001": "Login successfully",
    "R_E002": "Register failed",
    "R_E004": "Name, password, email is required",
    "R_E005": "Email address already registered",
    "R_E006": "Invalid registration type",
    "R_E007": "OTP expired",
    "R_E008": "Already verified",
    "R_E009": "Account verification failed",
    "R_E010": "Something went wrong. Please try after some time",
    "R_E011": "OTP doesn't match",
    "R_E012": "Verification error",
    "R_S001": "Register successfully",
    "R_S002": "Account verified successfully",
    "US_E002": "Username already exist",
    "L_E006": "This email address is not registered to an user"
  },
  "ms": {
    "L_S001": "Login successfully",
    "R_E002": "Daftar gagal",
    "R_E004": "Name, password, email is required",
    "R_E005": "Email address already registered",
    "R_E006": "Invalid registration type",
    "R_E007": "OTP expired",
    "R_E008": "Already verified",
    "R_E009": "Account verification failed",
    "R_E010": "Something went wrong. Please try after some time",
    "R_E011": "OTP doesn't match",
    "R_E012": "Verification error",
    "R_S001": "Register successfully",
    "R_S002": "Account verified successfully",
    "US_E002": "Username already exist",
    "L_E006": "This email address is not registered to an user"
  },
  "ar": {
    "L_S001": "Login successfully",
    "R_E002": "ÙØ´Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„",
    "R_E004": "Name, password, email is required",
    "R_E005": "Email address already registered",
    "R_E006": "Invalid registration type",
    "R_E007": "OTP expired",
    "R_E008": "Already verified",
    "R_E009": "Account verification failed",
    "R_E010": "Something went wrong. Please try after some time",
    "R_E011": "OTP doesn't match",
    "R_E012": "Verification error",
    "R_S001": "Register successfully",
    "R_S002": "Account verified successfully",
    "US_E002": "Username already exist",
    "L_E006": "This email address is not registered to an user"
  },
  "fr": {
    "L_S001": "Login successfully",
    "R_E002": "Echec du registre",
    "R_E004": "Name, password, email is required",
    "R_E005": "Email address already registered",
    "R_E006": "Invalid registration type",
    "R_E007": "OTP expired",
    "R_E008": "Already verified",
    "R_E009": "Account verification failed",
    "R_E010": "Something went wrong. Please try after some time",
    "R_E011": "OTP doesn't match",
    "R_E012": "Verification error",
    "R_S001": "Register successfully",
    "R_S002": "Account verified successfully",
    "US_E002": "Username already exist",
    "L_E006": "This email address is not registered to an user"
  }
}


{
  "en": {
    "G_E001": "Something went wrong!"
  },
  "ms": {
    "G_E001": "Something went wrong!"
  },
  "ar": {
    "G_E001": "Something went wrong!"
  },
  "fr": {
    "G_E001": "Something went wrong!"
  }
}
*/