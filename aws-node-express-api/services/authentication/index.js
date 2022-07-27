const authenticationService = require("./authentication")

module.exports.registerWithEmail = authenticationService.registerWithEmail
module.exports.registerwithphone = authenticationService.registerwithphone
module.exports.loginResponse = authenticationService.loginResponse
module.exports.userLogin = authenticationService.userLogin