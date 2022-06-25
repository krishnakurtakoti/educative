const serverless = require("serverless-http");
const express = require("express");
const app = express();

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

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
