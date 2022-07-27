const messageCode = require("../error-code");

module.exports.getMessage = async (handler, locale, code) => {
  return messageCode[handler][locale][code];
};