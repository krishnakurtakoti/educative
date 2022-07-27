const serverless = require("serverless-http");
const express = require("express");
const app = express();
const logger = require("../../util/log");
const userService = require("../../services/user");

const authorizer = require("../../auth/VerifyToken");

const userProfile = async (req, res) => {
  const user = await userService.profile({ _id: req.userid });
  logger.data("user: ", user);
  return res.status(200).send(user);
};

app.get("/user", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/user/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from user path!",
  });
});

app.get("/user/profile", authorizer.verifyToken, userProfile);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
