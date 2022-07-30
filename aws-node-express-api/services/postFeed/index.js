const postFeedService = require("./postFeed");
const likeService = require("./like");

module.exports.getFilteredPosts = postFeedService.getFilteredPosts;
module.exports.getSinglePostRecord = postFeedService.getSinglePostRecord;
module.exports.getPostRecord = postFeedService.getPostRecord
module.exports.savePost = postFeedService.savePost;
module.exports.updatePost = postFeedService.updatePost;
module.exports.removePost = postFeedService.removePost;
module.exports.createLike = postFeedService.createLike;
module.exports.editLike = postFeedService.editLike;
module.exports.removeLike = postFeedService.removeLike;
module.exports.saveLike = likeService.saveLike;
module.exports.getLike = likeService.getLike;
module.exports.updateLike = likeService.updateLike;
module.exports.deleteLike = likeService.deleteLike;
