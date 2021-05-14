const { userResolver } = require("./userResolver");
const { itemResolver } = require("./itemResolver");

module.exports.resolvers = {
  Query: {
    ...userResolver.Query,
    ...itemResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...itemResolver.Mutation,
  },
};
