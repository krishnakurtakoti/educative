const serverless = require("serverless-http");
const express = require("express");
const app = express();
const catchHandler = require("../../core/catchError")
const authenticationHandler = require("./authentication");


app.post("/auth/verify", catchHandler(authenticationHandler.verify_user));
app.post("/auth/login", catchHandler(authenticationHandler.loginUser));
app.get("/auth", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/auth/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from auth path!",
  });
});

app.post("/auth/register", catchHandler(authenticationHandler.register));

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
