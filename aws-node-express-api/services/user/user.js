const mongoose = require("mongoose");

const logger = require("../../util/log");
const UserModel = require("../../models/user.model");
const tempUserService = require("../tempUser");

//find one in user
module.exports.findUser = async (conditions) => {
  try {
    const modelProperties = Object.keys(UserModel.schema.obj);
    let project = {};
    modelProperties.forEach((ele) => {
      project[ele] = 1;
    });
    return await UserModel.findOne(conditions, project);
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

module.exports.search = async (filter, id) => {
  try {
    const user = await UserModel.findOne(filter, {}, {});
    if (user) {
      if (user._id == id) {
        return {
          isExist: false,
        };
      }
    }
    if (user) {
      return {
        isExist: true,
      };
    }
    return {
      isExist: false,
    };
  } catch (error) {
    throw error;
  }
};

/**
 *
 * Function will return all users from the given query
 */
module.exports.getUsers = async ({ filter, projection, option }) => {
  logger.data("START: get all the users with filter ", filter);
  logger.data("Get all users with projection: ", projection);
  logger.data("Get all the users with option: ", option);
  try {
    return await UserModel.find(filter, projection, option).sort({
      createdAt: -1,
    });
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

module.exports.userSave = async (insert) => {
  try {
    let user = new UserModel(insert);
    logger.info(`inside user save function ${user}`);
    if (user.email) {
      //send email to the user
    }
    return await user.save();
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

module.exports.createUser = async (req, res, user, platform) => {
  let body = JSON.parse(req.body);
  if (body.dob) {
    user.userFlag = true;
  }
  logger.info("createUser function started");
  logger.data("Moving to user collection");
  const userId = new mongoose.mongo.ObjectId();
  const insert = {
    _id: userId,
    accountType: platform === "educative" ? user.accountType : "user",
    fullName: user.fullName,
    userName: user.userName,
    isPassword: true,
    password: user.password,
    phoneNumber: user.phoneNumber,
    phoneisVerified: true,
    email: user.email,
    emailisVerified: true,
    createdBy: "system",
    updatedBy: "system",
    updatedOn: new Date(),
    createdAgent: req.useragent,
    userFlag: user.userFlag,
    isAccountActivated: false,
  };

  logger.data("user inserting data", insert);
  let inserteduser = await this.userSave(insert);
  logger.data("user update", inserteduser);
  let update = await tempUserService.deleteTempUser(user._id);
  logger.info("createUser function ended");
  return inserteduser;
};

module.exports.profile = async (conditions) => {
  try {
    return await UserModel.findOne(conditions, {
      password: 0,
      phoneOTP: 0,
      phoneOTPexp: 0,
      emailOTP: 0,
      emailOTPexp: 0,
    });
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};
