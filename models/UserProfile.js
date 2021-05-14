const { model, Schema } = require("mongoose");

const UserProfileModel = new Schema({
  totalCost: Number,
  totalPrice: Number,
  totalAddedItems: Number,
  createdAt: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Profile", UserProfileModel);
