const { gql } = require("apollo-server-core");

module.exports.User = gql`
  type User {
    id: ID!
    username: String!
    token: String!
    createdAt: String!
    items: [Item]!
  }
`;
