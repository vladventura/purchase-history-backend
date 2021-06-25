const { model, Schema } = require("mongoose");

const UserModel = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  validated: Boolean,
});

module.exports = model("User", UserModel);
