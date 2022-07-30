const jwt = require("jsonwebtoken");
const logger = require("../util/log");
const coreDB = require("../core/db");
const userService = require("../services/user");
const tokenService = require("../services/token");

let updateRefreshTokenTime = null;
module.exports.handler = (event, context, callback) => {
  try {
    const bearerHeader = event.authorizationToken;
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    //Verify JWT
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    const userid = decoded.id;
    const authorizerContent = { userid: userid };
    const policy = {
      principalId: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api: Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
      context: authorizerContext,
    };
    callback(null, policy);
  } catch (e) {
    callback("Unauthorized"); //Return a 401 unauthorized response
  }
};

module.exports.verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  const db = await coreDB.openDBConnection();
  try {
    if (!bearerHeader) throw new Error("authorization header not Found");
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    logger.data("token", bearerToken);
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    logger.data("decoded", decoded);
    const createdate = new Date(decoded.iat * 1000);
    logger.data("createdate", createdate);
    const expires = new Date(decoded.exp * 1000);
    logger.data("expires", expires);
    let diff = await tokenService.timeDifference(expires, createdate);
    if (diff) {
      const userid = decoded.id;
      const query = {
        filter: {
          _id: userid,
        },
        projection: {
          _id: 1,
          accountType: 1,
          //accessLevel: 1,
          credentialsChangedAt: 1,
          //isAuthor: 1,
        },
      };
      const user = await userService.getUsers(query);
      if (user && user[0].credentialsChangedAt) {
        const changedTimestamp = parseInt(
          user[0].credentialsChangedAt.getTime() / 1000,
          10
        );

        if (decoded.iat < changedTimestamp) {
          throw new Error("JWT Token created before change of credentials.");
        }
      }

      //Check for invalidating the refresh token
      if (!updateRefreshTokenTime) {
        //   updateRefreshTokenTime =
        //     await siteConfig_service.getUpdateRefreshToken();
        logger.info("refresh token details fetched from DB");
      } else {
        logger.info("refresh token details fetched from cache");
      }
      /*
      if (updateRefreshTokenTime.updateRequestRefreshToken) {
        if (
          decoded.iat <
          updateRefreshTokenTime.updateRequestRefreshToken.getTime() / 1000
        ) {
          logger.info(
            "JWT refresh token is created before change of expiry of refresh token"
          );
          throw new Error(
            "JWT refresh token is created before change of expiry of refresh token"
          );
        }
      }
      */
      if (!user.length) throw new Error("User Does Not Exist");

      req.accountType = user[0].accountType;
      req.userid = userid;
      req.accessLevel = user[0].accessLevel;
      req.user = user[0];
      await coreDB.closeDBConnection(db);
      next();
    } else {
      logger.error("Authentication Failed");
      await coreDB.closeDBConnection(db);
      res.status(401).send("Unauthorized"); // Return a 401 Unauthorized response
    }
  } catch (error) {
    logger.error("Authentication Failed", error);
    await coreDB.closeDBConnection(db);
    res.status(401).send("Unauthorized"); // Return a 401 Unauthorized response
  }
};
