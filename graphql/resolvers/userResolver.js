const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserInputError } = require("apollo-server-express");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const UserModel = require("../../models/User");

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
    errs.username = "This username is already taken";
  }
  // Find a user with this email
  const findEmail = await UserModel.findOne({ email });
  if (findEmail) {
    errs.email = "This email has already been used";
  }
  if (Object.keys(errs).length >= 1) {
    throw new UserInputError("Username/email already used", {
      errors: { ...errs },
    });
  }
  /// TODO: Return a user object
  password = await bcrypt.hash(password, 12);
  const newUser = new UserModel({
    email,
    username,
    password,
    createdAt: new Date().toISOString(),
  });
  const result = await newUser.save();
  const token = generateToken(result);
  return {
    ...result._doc,
    id: result._id,
    token,
  };
};

const login = async (_, { username, password }) => {
  // Validating input
  const { errors, valid } = validateLoginInput(username, password);
  if (!valid) {
    throw new UserInputError("Input error", {
      errors,
    });
  }
  // Check if user exists
  const foundUser = await UserModel.findOne({ username });
  if (!foundUser) {
    throw new UserInputError("User not found", {
      errors: {
        general: "Couldn't find user with these credentials",
      },
    });
  }
  //  Matching credentials
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    throw new UserInputError("Wrong credentials", {
      errors: {
        general: "Couldn't log in with these credentials",
      },
    });
  }
  const token = generateToken(foundUser);
  // Returning user
  return {
    ...foundUser._doc,
    id: foundUser._id,
    token,
  };
};

module.exports.userResolver = {
  Mutation: {
    register,
    login,
  },
  Query: {},
};
