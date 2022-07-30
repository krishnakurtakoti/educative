const responser = require("../../core/responser");
const logger = require("../../util/log");

const postFeedService = require("../../services/postFeed");
const { POST_TYPE } = require("../../models/postFeed.model");

/**
 * Method to insert like
 * @param {*} req
 * @param {*} res
 */
module.exports.insertLike = async (req, res, next) => {
  logger.info("START: insert like");
  logger.data("req.query: ", req.query)
  const  {postId}  = req.query//["postId"];
  const p = req.query.postId
  console.log("P", p)
  //const reqBody = JSON.parse(req.body);
  const reqBody = req.body
  reqBody.createdBy = req.userid
  const data = await postFeedService.createLike(req, postId, reqBody, res);
  return responser.send(201, "postFeed", "LF_L002", req, res, data);
};


module.exports.editLike = async (req, res, next) => {
  logger.info("START: edit like");
  const requestData = req.body;
  const condition = { _id: req.params.id };
  const update = requestData;
  update.updatedBy = req.userid
  const response = await postFeedService.editLike(condition, update);
  return responser.send(200, "postFeed", "LF_L003", req, res, response);
};

module.exports.removeLike = async (req, res, next) => {
  logger.info("START: remove like");
  //const requestData = JSON.parse(req.body);
  const requestData = req.body
  const { postId } = requestData.postId;
  const condition = { _id: req.params.id };

  const response = await postFeedService.removeLike(condition, postId);
  return responser.send(200, "postFeed", "LF_LOO4", req, res, response);
};

/**
 * Get posts afterlogin or get posts by user
 * @param {*} req
 * @param {*} res
 */
module.exports.fetchPostsAfterLogin = async (req, res) => {
  logger.info("START: Get Posts After Login");
  const data = await postFeedService.getFilteredPosts(req, res);
  return responser.send(200, "postFeed", "PF_P001", req, res, data);
};

/**
 * Method to post a post on social feed
 * @param {*} req
 * @param {*} res
 */
module.exports.createPost = async (req, res, next) => {
  logger.info("START: Create Post");
  //const reqBody = JSON.parse(req.body);
  const reqBody = req.body;
  console.log("reqBody: ", reqBody);
  const data = await postFeedService.savePost(reqBody, req.user);
  return responser.send(201, "postFeed", "PF_P002", req, res, data);
};

module.exports.getPost = async (req, res, next) => {
  logger.info("START: Get post feed record");
  //const response = await postFeedService.getSinglePostRecord(req.params.id);
  const id = req.params.id
  const postId = {_id: id}
  const response = await postFeedService.getPostRecord(postId)
  return responser.send(200, "postFeed", "PF_P003", req, res, response);
};

module.exports.updatePostRecord = async (req, res, next) => {
  logger.info("START: Update post record");
  const requestData = req.body;
  requestData.userid = req.userid;
  const response = await postFeedService.updatePost({_id: req.params.id}, requestData);
  return responser.send(200, "postFeed", "PF_P004", req, res, response);
};

module.exports.deletePost = async (req, res, next) => {
    logger.info("START: Delete post")
    const response = await postFeedService.removePost({_id: req.params.id})
    return responser.send(200, "postFeed", "PF_P005", req, res, response)
}

