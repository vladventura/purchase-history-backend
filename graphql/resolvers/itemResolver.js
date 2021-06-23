const {
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");

const ItemModel = require("../../models/Item");
const UserModel = require("../../models/User");
const UserProfileModel = require("../../models/UserProfile");
const checkAuth = require("../../utils/checkAuth");
const { validateItemInput } = require("../../utils/validators");

const getItems = async (_, __, context) => {
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  if (!foundUser) {
    throw new UserInputError("No user with this ID", {
      errors: {
        general: "No user with this ID found",
      },
    });
  }
  const foundItems = await ItemModel.find({ user: foundUser.id }).sort({
    createdAt: -1,
  });
  return foundItems;
};

const addItem = async (_, { name, price, cost }, context) => {
  const { errors, valid } = validateItemInput(name, price, cost);
  if (!valid) {
    throw new UserInputError("There's something going on", {
      errors,
    });
  }
  const user = checkAuth(context);
  const foundUser = await UserModel.findById(user.id);
  if (!foundUser) {
    throw new UserInputError("User ID not found", {
      errors: {
        general: "User ID not found",
      },
    });
  }
  const newItem = ItemModel({
    name,
    price,
    cost,
    username: user.username,
    user: user.id,
    createdAt: new Date().toISOString(),
  });
  const item = await newItem.save();

  // Get the user's profile and add the price, cost and item count to it
  const profile = await UserProfileModel.findOne({ user: user.id });
  await profile.updateOne({
    totalCost: profile.totalCost + item.cost,
    totalPrice: profile.totalPrice + item.price,
    totalAddedItems: profile.totalAddedItems + 1,
  });

  return item;
};

const deleteItem = async (_, { itemId }, context) => {
  // TODO: Check if the user is authenticated
  const user = checkAuth(context);
  // TODO: Check if this item is owned by the user, and if it exists
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
      throw new AuthenticationError("This item does not belong to this user");
    }
  } catch (err) {
    throw new Error(err);
  }
};

const updateItem = async (_, { itemId, name, price, cost }, context) => {
  const user = checkAuth(context);
  const { errors, valid } = validateItemInput(name, price, cost);
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
        throw new AuthenticationError("This item does not belong to you");
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  throw new UserInputError("Missing/wrong values", {
    errors,
  });
};

module.exports.itemResolver = {
  Query: { getItems },
  Mutation: { addItem, deleteItem, updateItem },
};
