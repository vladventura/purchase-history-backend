const logger = require("./logger").loggerFactory("info", "mailhandler");
const nodemailer = require("nodemailer");
const { mailtemplate } = require("./mailtemplate");
const CryptoJS = require("crypto-js");
const { DateTime } = require("luxon");

const emailThreshold = (minutes = 1) => 1000 * 60 * minutes;

const sentUsers = {};

const verified = (user) => {
  delete sentUsers[user.id];
};

const sendConfirmAccountMail = (user) => {
  logger.log("info", `${user} : Attempting to send confirmation email`);
  const now = DateTime.local();
  let euid = "";
  if (sentUsers[user.id]) {
    const sentTime = sentUsers[user.id];
    if (now - sentTime >= emailThreshold()) {
      euid = sendMail(user);
      sentUsers[user.id] = now;
    }
  } else {
    euid = sendMail(user);
    sentUsers[user.id] = now;
  }
  return euid;
};

const sendMail = (user) => {
  const noreplyAccount = {
    user: process.env.NOREPLY_USERNAME,
    pass: process.env.NOREPLY_PASSWORD,
  };
  const appUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://purchase-history-316614.ue.r.appspot.com/";
  const encodedUserId = CryptoJS.AES.encrypt(user.id, process.env.JWT_SECRET);
  const redirect = appUrl + "confirm-account?u=" + encodedUserId.toString();
  const message = mailtemplate(redirect);
  logger.log("info", `${user} : Creating transport for email`);
  const transporter = nodemailer.createTransport({
    host: process.env.NOREPLY_HOST,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: noreplyAccount,
  });
  const mailOptions = {
    from: noreplyAccount.user,
    to: user.email,
    subject: user.username + ", please confirm your account",
    html: message,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) logger.log("info", `${user} : ${err} : Failed to send email`);
    else logger.log("info", `${user} : ${info.response} : Email sent`);
  });
  return encodedUserId.toString();
};

module.exports = { sendConfirmAccountMail, verified };
