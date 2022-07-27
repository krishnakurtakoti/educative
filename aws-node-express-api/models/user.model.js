const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require("mongoose-paginate-v2");

// arbitary max length
const usernameMaxLength = 100;

/** @see https://stackoverflow.com/a/574698 */
const emailMaxLength = 256;

const userSchema = mongoose.Schema(
  {
    accountType: { type: String, required: true, default: "user" },
    fullName: {
      type: String,
      required: [true, "fullName required"],
      minLength: [1, "{VALUE} is too short, minimum length is 1"],
      maxLength: [100, `{VALUE} is too long, maximum length is 100`],
    },
    userName: {
      type: String,
      unique: true,
      maxLength: [
        usernameMaxLength,
        `{VALUE} is too long, maximum length is ${usernameMaxLength}`,
      ],
    },
    phoneNumber: {
      type: String,
      maxLength: [30, "{VALUE} is too long, maximum length is 30"],
    },
    email: {
      type: String,
      lowercase: true,
      maxLength: [
        emailMaxLength,
        `{VALUE} is too long, maximum length is ${emailMaxLength}`,
      ],
    },
    phoneisVerified: { type: Boolean, default: false },
    emailisVerified: { type: Boolean, default: false },
    isPassword: { type: Boolean, default: false },
    password: { type: String, select: false },
    createdAgent: Object,
    updatedAgent: Object,
    emailOtpVerifyAttempts: {
      type: Number,
      default: 0,
    },
    phoneOtpVerifyAttempts: {
      type: Number,
      default: 0,
    },
    phoneLockUntil: {
      type: Date,
      default: Date.now(),
    },
    emailLockUntil: {
      type: Date,
      default: Date.now(),
    },
    credentialsChangedAt: Date,
    userFlag: { type: Boolean, default: false },
    isAccountActivated: { type: Boolean, default: false },
    Status: {
      type: Number,
      required: true,
      default: 1, //1:active, 2:inactive, 3:deleted
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", userSchema);
module.exports = user;
