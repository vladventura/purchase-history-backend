const { model, Schema } = require("mongoose");

const ItemModel = new Schema({
  name: String,
  price: Number,
  cost: Number,
  createdAt: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  username: String,
});

module.exports = model("Item", ItemModel);
