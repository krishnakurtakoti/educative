const logger = require("../../util/log");
const coreDB = require("../../core/db");
const responser = require("../../core/responser");
const getMessage = require("../../core/translated-response").getMessage;

const userService = require("../../services/user");
const authenticationService = require("../../services/authentication");
const tempUserService = require("../../services/tempUser");
const tokenService = require("../../services/token");

module.exports.register = async (req, res) => {
  const db = await coreDB.openDBConnection();
  try {
    const body = JSON.parse(req.body);
    let response;
    body.type = "email";
    if (body.username) {
      const query = {
        username: body.username,
      };

      const data = await userService.search(query, null);

      if (data.isExist) {
        return responser.send(400, "authentication", "US_E002", req, res, {});
      }
    }
    switch (body.type) {
      case "phone":
        response = await authenticationService.registerwithphone(body, req);
        break;
      case "email":
        response = await authenticationService.registerWithEmail(body, req);
        break;
      default:
        response = {
          statusCode: 400,
          message: await getMessage(
            "authentication",
            req.headers.locale || "en",
            "R_E006"
          ),
          messageCode: "R_E006",
        };
        break;
    }
    console.log("response", response);
    if (response.sendEmail || response.sendSMS) {
      let condition1 =
        process.env.PLATFORM &&
        process.env.PLATFORM.toLowerCase() == "educative";
      console.log({
        condition: condition1,
        a: process.env.PLATFORM,
        b: process.env.PLATFORM.toLowerCase(),
      });
      if (
        process.env.PLATFORM &&
        process.env.PLATFORM.toLowerCase() == "educative"
      ) {
        // add to user table;
        let token = await tokenService.verify_token(response.data.token);
        let result = await tempUserService.findTempUser({
          _id: token.id,
        });
        logger.data("result", result);
        if (result) {
          if (result.Verified == true) {
            logger.info("Already verified");
            return responser.send(
              400,
              "authentication",
              "R_E008",
              req,
              res,
              {}
            );
          } else {
            let newUserData = await userService.createUser(req, res, result);
            logger.data("newUserData", newUserData);
            let loginData = await authenticationService.loginResponse(
              req,
              res,
              newUserData
            );
            logger.data("loginData", loginData);
            return responser.send(
              200,
              "authentication",
              "L_S001",
              req,
              res,
              loginData
            );
          }
        } else {
          return responser.send(400, "authentication", "R_E011", req, res, {});
        }
      } else {
        const type = response.sendEmail ? "email" : "sms";
        //////// await _sendEmailsAndMessages(response.content, "otp", type);
      }
    }

    return res.status(response.statusCode).send({
      message: response.message,
      ...(response.data && { data: response.data }),
      ...(response.messageCode && { messageCode: response.messageCode }),
    });
  } catch (err) {
    logger.error("REGISTER FAILED", err);
  }
};

module.exports.loginUser = async (req, res) => {
  const db = await coreDB.openDBConnection();
  try {
    let reqData = JSON.parse(req.body);
    if (reqData.email && reqData.password) {
      const loginResponse = await authenticationService.userLogin(
        reqData,
        req,
        res
      );
      return res.status(200).send(loginResponse);
    }
    res.status(400).send({
        message: await getMessage(
          "authentication",
          req.headers.locale || "en",
          "R_E013"
        ),
        messageCode: "R_E013",
      });
  } catch (err) {
    console.log(err);
  }
};

//to verify user
module.exports.verify_user = async (req, res) => {
  const db = await coreDB.openDBConnection();
  try {
    let reqData = JSON.parse(req.body);
    if (reqData.token && reqData.otp && reqData.type) {
      if (reqData.type == "email") {
        let token = await tokenService.verify_token(reqData.token);
        logger.data(token);
        let result = await tempUserService.findTempUser({
          _id: token.id,
          emailOTP: reqData.otp,
        });
        if (result) {
          if (new Date() > result.emailOTPexp) {
            res.status(400).send({
              message: await getMessage(
                "auth",
                req.headers.locale || "en",
                "R_E007"
              ),
              messageCode: "R_E007",
            });
          } else if (result.Verified == true) {
            res.status(400).send({
              message: await getMessage(
                "auth",
                req.headers.locale || "en",
                "R_E008"
              ),
              messageCode: "R_E008",
            });
          } else {
            logger.data("Moving to user collection");
            let insert = {
              fullName: result.fullName,
              password: result.password,
              isPassword: true,
              phoneNumber: result.phoneNumber,
              emailisVerified: true,
              email: result.email,
              profilePicture: "",
              createdBy: "system",
              updatedBy: "system",
            };

            let inserteduser = await auth.tempEmailSave(insert);
            if (inserteduser) {
              logger.data(
                "User detail moved from temp collection to temp email collection",
                inserteduser
              );

              let updateData = {
                Verified: true,
                updatedOn: new Date(),
              };
              let update = await auth.delete_temp(result._id);
              if (update) {
                res.status(200).send({
                  message: await getMessage(
                    "auth",
                    req.headers.locale || "en",
                    "R_S002"
                  ),
                  messageCode: "R_S002",
                });
              } else {
                res.status(400).send({
                  message: await getMessage(
                    "auth",
                    req.headers.locale || "en",
                    "R_E009"
                  ),
                  messageCode: "R_E009",
                });
              }
            } else {
              res.status(400).send({
                message: await getMessage(
                  "auth",
                  req.headers.locale || "en",
                  "R_E010"
                ),
                messageCode: "R_E010",
              });
            }
          }
        } else {
          res.status(400).send({
            message: await getMessage(
              "auth",
              req.headers.locale || "en",
              "R_E011"
            ),
            messageCode: "R_E011",
          });
        }
      } else {
        res.status(400).send({
          message: "Invalid registration type!",
        });
      }
    } else {
      res.status(400).send({
        message: "Token, OTP and type required!",
      });
    }
  } catch (err) {
  } finally {
    await coreDB.closeDBConnection(db);
  }
};
