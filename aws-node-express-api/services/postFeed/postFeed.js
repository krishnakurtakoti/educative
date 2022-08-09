//Package Imports
//import { ObjectId} from 'mongodb'
const ObjectId = require("mongodb").ObjectId
//Other Imports
const logger = require("../../util/log");

const AppError = require("../../util/appError");
const responser = require("../../core/responser");

const LikePostModel = require("../../models/likePost.model");
const PostFeedModel = require("../../models/postFeed.model");
const likeService = require("../../services/postFeed");


const POST_TYPE = Object.freeze({
  MEDIA: "media",
  LINK: "link",
  SHARE: "share",
  BROAD_CAST: "braoadcast",
});
const maxFileCount = 6;
const urlRegex =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(urlRegex);

const createdByPopulateQuery = {
  path: "createdBy",
  select: "userName",
};
const likesPopulate = {
  path: "likes",
  select: "_id likeReact createdOn updatedOn",
  populate: createdByPopulateQuery,
  options: { sort: { createdOn: -1 } },
};

/**
 * service method from finding post feed
 */
module.exports.getFilteredPosts = async (req, res) => {
  const filter = { isPrivate: false };
  const option = { populate: likesPopulate };
  const projection = {};
  req.filter = filter;
  req.option = option;
  req.projection = projection;
  return await this.getPosts(req);
};

module.exports.getPosts = async (
  { filter, projection, option },
  count = true
) => {
  try {
    if (!count) {
      const posts = await PostFeedModel.find(filter, projection, option);
      return { posts };
    }
    const [posts, total] = await Promise.all([
      PostFeedModel.find(filter, projection, option),
      PostFeedModel.countDocuments(filter),
    ]);
    return { posts, total };
  } catch (error) {
    throw error;
  }
};

const likeExists = async (filter) => {
  try {
    const like = await likeService.getLike(filter);
    if (!like) return false;
    return like;
  } catch (error) {
    logger.error("err: ", error);
    throw error;
  }
};

module.exports.getSinglePostRecord = async (postId) => {
  const postRecord = await PostFeedModel.findOne({
    _id: postId,
  });
  if (!postRecord)
    throw new AppError(404, "postFeed", "CO_C001", "POST fetch failed");
  return postRecord;
};

module.exports.getPostRecord = async (postId) => {
  logger.info("START: Get single post record with projection and option")
  try {
    const projection = {updatedOn: 0, updatedBy: 0}
    const option = { populate: likesPopulate };
    return await PostFeedModel.findById(postId, projection, option)
  } catch (error) {
    logger.error("err: ", error)
    throw error
  }
}
module.exports.createLike = async (req, postId, reqBody, res) => {
  logger.info("START: Insert like");
  try {
    const createdBy = reqBody.createdBy;
    logger.data("postId", postId);
    const likeFilter = {
      filter: {
        postId: new ObjectId(postId),
        createdBy: new ObjectId(createdBy),
      },
      projection: {},
      option: {},
    }; 
    logger.data("likeFilter: ", likeFilter);
    const checkIfLikeExists = await likeExists(likeFilter);
    logger.data("check If Like Exists: ", checkIfLikeExists);
    if (checkIfLikeExists.length) {
      return responser.send(400, "postFeed", "LF_L000", req, res, {});
    }
    const payload = { postId, ...reqBody, createdBy };
    logger.data("payload: ", payload);
    const data = await likeService.saveLike({ body: payload });
    const updateQuery = { $push: { likes: data._id } };
    const updatedPost = await this.updatePost({ _id: postId }, updateQuery);
    return data;
  } catch (error) {
    logger.error("Like insert error: ", error);
    return responser.send(500, "postFeed", "CO_C002", req, res, {});
  }
};

module.exports.editLike = async (condition, updateQuery) => {
  logger.info("START: Edit like service");
  const updateLike = await likeService.updateLike(condition, updateQuery);
  return updateLike;
};

module.exports.removeLike = async (condition, postId) => {
  logger.info("START: Delete like service");
  const updatePostQuery = { $pull: { likes: condition._id } };
  const [updatePost, data] = await Promise.all([
    this.updatePost({ _id: postId }, updatePostQuery),
    likeService.deleteLike(condition),
  ]);
  return data;
};

/**
 * service method to save post feed
 * @param {*} data
 */
module.exports.savePost = async (reqBody, loggedInUser) => {
  try {
    let requestBody = reqBody;
    logger.data("request body: ", requestBody);
    if(requestBody.images){
      const imageUrls = requestBody.images.map((imageElement) => {
        return imageElement.imageUrl
      })
      logger.data("image Urls: ", imageUrls)
      requestBody.imagesLink = imageUrls
    }
    let { videoLink, imagesLink, message, url } = requestBody;
    //message = await filterText(message);
    let payload = {};
    const postType = requestBody?.postType || POST_TYPE.MEDIA;
    switch (postType) {
      case POST_TYPE.MEDIA:
        const videosCount = videoLink?.length || 0;
        const imagesCount = imagesLink?.length || 0;
        const totalFiles = videosCount + imagesCount;
        if (!(message || totalFiles <= maxFileCount)) {
          return responser.send(400, "postFeed", "CO_C003", req, res, {});
        }
        payload = { videoLink, imagesLink, message };
        break;
      case POST_TYPE.LINK:
        if (!url?.match(regex)) {
          return responser.send(400, "postFeed", "CO_C003", req, res, {});
        }
        payload = { url, message };
        break;
      case POST_TYPE.BROAD_CAST:
        payload = { ...requestBody };
        break;
      default:
        return responser(400, "postFeed", "CO_COO2", req, res, {});
    }
    payload["isPrivate"] = requestBody?.isPrivate || false;
    payload["createdBy"] = loggedInUser._id;
    payload["postType"] = postType;
    let post = new PostFeedModel(payload);
    return await post.save();
  } catch (error) {
    throw error;
  }
};

/**
 * service method to update post feed
 * @param {*} condition
 * @param {*} updateQuery
 */
module.exports.updatePost = async (condition, updateQuery) => {
  try {
    updateQuery.updatedOn = new Date();
    return await PostFeedModel.findOneAndUpdate(condition, updateQuery, {
      new: true,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * service method to delete a post feed
 * @param {*} condition
 */
module.exports.removePost = async (condition) => {
  try {
    const data = await PostFeedModel.findOneAndDelete(condition);
    return Boolean(data);
  } catch (error) {
    throw error;
  }
};
