const { ApolloError } = require("apollo-server-express");

class UserNotVerified extends ApolloError {
  constructor(message, properties) {
    super(message, "USER_NOT_VERIFIED", properties);

    Object.defineProperty(this, "name", { value: "UserNotVerified" });
  }
}

module.exports = {
  UserNotVerified,
};
