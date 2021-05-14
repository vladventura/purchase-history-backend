const { gql } = require("apollo-server-core");

module.exports.Item = gql`
  type Item {
    id: ID!
    name: String!
    price: Float!
    cost: Float!
    createdAt: String!
    username: String!
  }
`;
