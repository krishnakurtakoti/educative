const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.get("/test", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/test/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from test path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
