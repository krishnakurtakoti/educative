const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const REACTION = Object.freeze({
  FEELS: 0,
  SAFEGUARDED: 1,
  WINNING: 2,
  AGREED: 3,
});
const LikePost = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "postFeed" },
  likeReact: {
    type: Number,
    enum: Object.values(REACTION),
    default: REACTION.FEELS,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
});
LikePost.index({ postId: 1 });
LikePost.index({ createdBy: 1 });
LikePost.index({ updatedBy: 1 });
LikePost.index({ updatedOn: -1 });
LikePost.index({ createdOn: -1 });

module.exports = mongoose.models.likePost || mongoose.model('likePost', LikePost);
// const likePost = mongoose.model("likePost", LikePost);
// module.exports = likePost;
