const mongoose = require("mongoose");
const log_mongoose = require("mongoose");

const logger = require("../util/log");

let conn = null;
let conn_log = null;

const _DBException = (message) => {
  this.message = message;
  this.name = "DBException";
};

const _dbExecuteHelper = async (db, fn) =>
  db.then(fn).finally(async () => {
    await mongoose.connection.close();
    console.log("Connection  closed");
  });

module.exports.dbExecute = async (fn) => {
  let dbUrl = process.env.DB_CONNECTION_URL;
  if (!dbUrl) {
    throw new _DBException("DB connection string not valid");
  }
  console.log("Opening new connection");
  return _dbExecuteHelper(
    mongoose.connect(dbUrl, {
      useCreateIndex: true,
      useNewUrlParser: true,
    }),
    fn
  );
};

module.exports.openDBConnection = async () => {
  try {
    const dbUrl = process.env.DB_CONNECTION_URL;
    if (!dbUrl) {
      throw new _DBException("DB connection string not valid");
    }
    console.log("mongoose connection", mongoose.connection.readyState);
    if (!mongoose.connection.readyState == 1) {
      console.log("Opening new connection");
      conn = await mongoose.connect(dbUrl, {
        // useCreateIndex: true,
        // useNewParser: true,
        // useUnifiedTopology: true,
      });
      return conn;
    } else {
      console.log("Reusing the existing DB connection");
      return conn;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports.closeDBConnection = async (db) => {};