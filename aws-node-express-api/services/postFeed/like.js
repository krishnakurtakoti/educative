const logger = require("../../util/log");
const likeModel = require("../../models/likePost.model");
const AppError = require("../../util/appError");

module.exports.saveLike = async (event) => {
  try {
    //const reqData = JSON.parse(event.body);
    const reqData = event.body;
    logger.data("reqData: ", reqData);
    const like = new likeModel(reqData);
    return await like.save();
  } catch (error) {
    logger.error(error.message, error);
    throw error.message;
  }
};

module.exports.getLike = async ({ filter, projection, option }) => {
  try {
    logger.data("filter", { filter, projection, option })
    return await likeModel.find(filter, projection, option);
  } catch (err) {
    logger.error(err.message, err);
    throw err.message;
  }
};

module.exports.updateLike = async (condition, updateQuery) => {
  try {
    return await likeModel.findByIdAndUpdate(condition, updateQuery, {
      new: true,
    });
  } catch (error) {
    logger.error(error.message, error);
    throw error;
  }
};

module.exports.deleteLike = async (condition) => {
  try {
    return await likeModel.findOneAndDelete(condition);
  } catch (error) {
    logger.error(error.message, error);
    throw error;
  }
};
