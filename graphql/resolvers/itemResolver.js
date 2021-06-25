const {
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");

const ItemModel = require("../../models/Item");
const UserModel = require("../../models/User");
const UserProfileModel = require("../../models/UserProfile");
const checkAuth = require("../../utils/checkAuth");
const { validateItemInput } = require("../../utils/validators");
const { loggerFactory } = require("../../utils/logger");
const { UserNotVerified } = require("../exceptions");
const logger = loggerFactory("info", "itemResolver");

const validatedUser = (foundUser, fromWhere) => {
  if (!foundUser) {
    logger.log(
      "warn",
      `${foundUser} : No user found with this token (${fromWhere})`
    );
    throw new UserInputError("No user with this ID", {
      errors: {
        userNotFound: "No user with this ID found",
        valid: false,
      },
    });
  }
  if (!foundUser.validated) {
    logger.log(
      "warn",
      `${foundUser.username} : User not validated (${fromWhere})`
    );
    throw new UserNotVerified("User has not been validated", {
      errors: {
        userNotValid: "Your account is not validated.",
        valid: false,
      },
    });
  }
};

const getItems = async (_, __, context) => {
  logger.log("info", `${user.username} : Attempting to get items`);
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  validatedUser(user, "getItems");
  logger.log("info", `Attempting to get items for ${user.username}`);
  const foundItems = await ItemModel.find({ user: foundUser.id }).sort({
    createdAt: -1,
  });
  return foundItems;
};

const addItem = async (_, { name, price, cost }, context) => {
  const { errors, valid } = validateItemInput(name, price, cost);
  if (!valid) {
    logger.log("warn", "Invalid item input");
    throw new UserInputError("There's something going on", {
      errors,
    });
  }
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  logger.log("info", `${user.username} : Attempting to add item`);
  validatedUser(foundUser, "addItem");
  const newItem = ItemModel({
    name,
    price,
    cost,
    username: user.username,
    user: user.id,
    createdAt: new Date().toISOString(),
  });
  const item = await newItem
    .save()
    .catch((err) =>
      logger.log("error", `While saving item ${user.username} ` + err)
    );

  // Get the user's profile and add the price, cost and item count to it
  const profile = await UserProfileModel.findOne({ user: user.id });
  await profile.updateOne({
    totalCost: profile.totalCost + item.cost,
    totalPrice: profile.totalPrice + item.price,
    totalAddedItems: profile.totalAddedItems + 1,
  });

  logger.log("info", `Added item ${item} : ${user}`);
  return item;
};

const deleteItem = async (_, { itemId }, context) => {
  // TODO: Check if the user is authenticated
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  validatedUser(foundUser, "deleteItem");
  // TODO: Check if this item is owned by the user, and if it exists
  logger.log("info", `${user.username} : Attempting to delete item ${itemId}`);
  try {
    const item = await ItemModel.findById(itemId);
    if (item.username === user.username) {
      await item.delete();
      const profile = await UserProfileModel.findOne({ user: user.id });
      await profile.updateOne({
        totalCost: profile.totalCost - item.cost,
        totalPrice: profile.totalPrice - item.price,
        totalAddedItems: profile.totalAddedItems - 1,
      });
      return itemId;
    } else {
      logger.log("warn", `${user.username} tried to delete ${item}`);
      throw new AuthenticationError("This item does not belong to this user");
    }
  } catch (err) {
    logger.log("error", `${user.username} : ${itemId} - `, +err);
    throw new Error(err);
  }
};

const updateItem = async (_, { itemId, name, price, cost }, context) => {
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  validatedUser(foundUser, "updateItem");
  const { errors, valid } = validateItemInput(name, price, cost);
  logger.log("info", `${user.username} : Attempting to update item ${itemId}`);
  if (valid) {
    try {
      const item = await ItemModel.findById(itemId);
      if (item.username === user.username) {
        // Before the update, adjust prices
        const profile = await UserProfileModel.findOne({ user: user.id });
        await profile.updateOne({
          totalCost: profile.totalCost + Math.abs(cost - item.cost),
          totalPrice: profile.totalPrice + Math.abs(price - item.price),
        });
        await item.updateOne({
          name,
          price,
          cost,
        });
        return "Item updated";
      } else {
        logger.log("warn", `${user.username} tried to delete ${item}`);
        throw new AuthenticationError("This item does not belong to this user");
      }
    } catch (err) {
      logger.log("error", `${user.username} : ${itemId} - `, +err);
      throw new Error(err);
    }
  }
  logger.log(
    "warn",
    `${user.username} : Missing values for Item | itemId = ${itemId} name = ${name} price = ${price} cost = ${cost}`
  );
  throw new UserInputError("Missing/wrong values", {
    errors,
  });
};

module.exports.itemResolver = {
  Query: { getItems },
  Mutation: { addItem, deleteItem, updateItem },
};
