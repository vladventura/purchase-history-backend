const { gql } = require("apollo-server-core");

module.exports.User = gql`
  type UserProfile {
    totalCost: Float!
    totalPrice: Float!
    totalAddedItems: Int!
    createdAt: String
  }

  type User {
    id: ID!
    username: String!
    token: String!
    createdAt: String!
    items: [Item]!
    profile: UserProfile!
  }
`;
