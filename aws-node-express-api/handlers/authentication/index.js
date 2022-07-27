const serverless = require("serverless-http");
const express = require("express");
const app = express();

const authenticationHandler = require("./authentication");


app.post("/auth/verify", authenticationHandler.verify_user);
app.post("/auth/login", authenticationHandler.loginUser);
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

app.post("/auth/register", authenticationHandler.register);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
