const { gql } = require("apollo-server-express");
const { User, Item } = require("./schema");
const { Mutation } = require("./mutations");
const { Query } = require("./queries");

module.exports.typeDefs = gql`
  ${Item}

  ${User}

  ${Query}

  ${Mutation}
`;
