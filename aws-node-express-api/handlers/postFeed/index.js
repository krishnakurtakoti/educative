//Package Imports
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const useragent = require("express-useragent");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

//Custom Module/File Imports
const postFeedHandler = require("./postFeed");
const catchError = require("../../core/catchError");
const coreDB = require("../../core/db");
const auth = require("../../auth/VerifyToken");

const app = express();
// const campaignRouter = express.Router();
const router = express.Router();

//Middlewares
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(useragent.express());
app.use("/social", router);
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//Open a DB connection
coreDB.openDBConnection();

// router.get(
//   "/post",
//   auth.verifyToken,
//   catchError(postFeedHandler.postsAfterLogin)
// );
router
  .route("/")
  .get(auth.verifyToken, catchError(postFeedHandler.fetchPostsAfterLogin))
  .post(auth.verifyToken, catchError(postFeedHandler.createPost));

router
  .route("/:id")
  .get(auth.verifyToken, catchError(postFeedHandler.getPost))
  .patch(auth.verifyToken, catchError(postFeedHandler.updatePostRecord))
  .delete(auth.verifyToken, catchError(postFeedHandler.deletePost));

// router.post(
//   "/post",
//   auth.verifyToken,
//   catchError(postFeedHandler.createPost)
// );

router.post("/like", auth.verifyToken, catchError(postFeedHandler.insertLike));
router.route("/like/:id")
.patch(auth.verifyToken, catchError(postFeedHandler.editLike))
.delete(auth.verifyToken, catchError(postFeedHandler.removeLike))
// router.patch("/social/like/:id", likePermission, editLike);
// router.delete("/social/like/:id", likePermission, removeLike);

// module.exports = router;
//app.use(globalErrorHandler);

module.exports.handler = serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});
