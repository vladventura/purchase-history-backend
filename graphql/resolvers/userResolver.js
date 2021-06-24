const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserInputError } = require("apollo-server-express");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const UserModel = require("../../models/User");
const UserProfileModel = require("../../models/UserProfile");
const { sendConfirmAccountMail } = require("../../utils/mailhandler");
const CryptoJS = require("crypto-js");
const { ApolloError } = require("apollo-server-express");
const { loggerFactory } = require("../../utils/logger");

const logger = loggerFactory("info", "userResolver");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );

const register = async (_, { username, email, password, confirmPassword }) => {
  logger.log("info", `Registering user ${username} - ${email}`);
  // Validate the incoming input
  const { errors, valid } = validateRegisterInput(
    username,
    email,
    password,
    confirmPassword
  );
  if (!valid) {
    throw new UserInputError("Input is invalid", {
      errors,
    });
  }
  const errs = {};
  // Find a user with this username already
  const findUsername = await UserModel.findOne({ username });
  if (findUsername) {
    logger.log("warn", `Found ${username}`);
    errs.username = "This username is already taken";
  }
  // Find a user with this email
  const findEmail = await UserModel.findOne({ email });
  if (findEmail) {
    logger.log("warn", `Found ${email}`);
    errs.email = "This email has already been used";
  }
  if (Object.keys(errs).length >= 1) {
    throw new UserInputError("Username/email already used", {
      errors: { ...errs },
    });
  }
  logger.log("info", `Hashing password for user ${username}`);
  password = await bcrypt.hash(password, 12);
  const createdAt = new Date().toISOString();
  const newUser = new UserModel({
    email,
    username,
    password,
    createdAt,
    validated: false,
  });
  logger.log("info", "Saving user on DB");

  const user = await newUser
    .save()
    .catch((err) => logger.log("error", `While saving ${username}, ` + err));

  // Create the user's profile
  const profile = new UserProfileModel({
    createdAt,
    totalCost: 0,
    totalPrice: 0,
    totalAddedItems: 0,
    user: user.id,
  });
  await profile
    .save()
    .catch((err) =>
      logger.log("error", `While saving ${username} profile, ` + err)
    );
  // Send the email here
  const encodedUserId = sendConfirmAccountMail(user);
  return encodedUserId;
};

const login = async (_, { username, password }) => {
  logger.log("info", `Attempting to log in user ${username}`);
  // Validating input
  const { errors, valid } = validateLoginInput(username, password);
  if (!valid) {
    throw new UserInputError("Input error", {
      errors,
    });
  }
  // Check if user exists
  const user = await UserModel.findOne({ username });
  if (!user) {
    logger.log("warn", `Could not find ${username}`);
    throw new UserInputError("User not found", {
      errors: {
        general: "Couldn't find user with these credentials",
      },
    });
  }
  // Check if user is verified
  if (!user.validated) {
    const encryptedUserId = CryptoJS.AES.encrypt(
      user.id,
      process.env.JWT_SECRET
    ).toString();
    logger.log("warn", `${usename} not validated`);
    throw new UserNotVerified("User has not been validated", {
      errors: encryptedUserId,
    });
  }
  //  Matching credentials
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    logger.log("warn", `Wrong password for ${username}`);
    throw new UserInputError("Wrong credentials", {
      errors: {
        general: "Couldn't log in with these credentials",
      },
    });
  }
  const token = generateToken(user);
  // Get the profile here
  const profile = await UserProfileModel.findOne({ user: user.id }).catch(
    (err) => logger.log("error", `While searching profile ${username} ` + err)
  );
  // Returning user
  const result = {
    ...user._doc,
    id: user._id,
    token,
    profile,
  };
  return result;
};

const confirmAccount = async (_, { userId }) => {
  // Find a user with this id (it's encoded)
  const decodedUserId = CryptoJS.AES.decrypt(userId, process.env.JWT_SECRET);
  logger.log(
    "info",
    `Attempting to confirm account for ${userId} : ${decodedUserId}`
  );
  try {
    const user = await UserModel.findOne({
      _id: decodedUserId.toString(CryptoJS.enc.Utf8),
    });
    if (!user) {
      logger.log("warn", `${userId} : ${decodedUserId} not found`);
      throw new UserInputError("Wrong ID", {
        errors: {
          general: "Couldn't find a user with this ID",
        },
      });
    }
    // Check if already valid
    if (user.validated) {
      logger.log(
        "warn",
        `${user.username} : ${userId} : ${decodedUserId} already validated`
      );
      throw new UserInputError("Already validated", {
        errors: {
          general: "User is already validated",
        },
      });
    }
    logger.log("info", `Attempting to validate user ${user.username}`);
    // Set it as validated
    await user
      .updateOne({
        validated: true,
      })
      .catch((err) =>
        logger.log("error", `${user.username} could not validate` + err)
      );

    // Return user
    const token = generateToken(user);
    // Get the profile here
    const profile = await UserProfileModel.findOne({ user: user.id }).catch(
      (err) => logger.log("error", `Profile not found ${user.username} ` + err)
    );
    const result = {
      ...user._doc,
      profile,
      id: user._id,
      token,
    };
    return result;
  } catch {
    logger.log("warn", `${userId} : ${decodedUserId} invalid ID`);
    throw new UserInputError("Invalid ID", {
      errors: {
        general: "This ID is invalid",
      },
    });
  }
};

const resendConfirmationEmail = async (_, { userId }) => {
  // Find the user
  const decodedUserId = CryptoJS.AES.decrypt(
    userId,
    process.env.JWT_SECRET
  ).toString(CryptoJS.enc.Utf8);
  logger.log("info", `Attempting to resend email ${userId} : ${decodedUserId}`);
  const user = await UserModel.findOne({ _id: decodedUserId });
  if (!user) {
    logger.log("warn", `${userId} : ${decodedUserId} no id found`);
    throw new UserInputError("Not found", {
      errors: {
        general: "User with this ID could not be found",
      },
    });
  }
  // Send email
  sendConfirmAccountMail(user);
  // Return whatever string
  return "Sent!";
};

class UserNotVerified extends ApolloError {
  constructor(message, properties) {
    super(message, "USER_NOT_VERIFIED", properties);

    Object.defineProperty(this, "name", { value: "UserNotVerified" });
  }
}

module.exports.userResolver = {
  Mutation: {
    register,
    login,
    confirmAccount,
    resendConfirmationEmail,
  },
  Query: {},
};
