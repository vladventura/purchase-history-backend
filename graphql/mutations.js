const { gql } = require("apollo-server-core");

module.exports.Mutation = gql`
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    login(username: String!, password: String!): User!
    addItem(name: String!, price: Float!, cost: Float!): Item!
    deleteItem(itemId: ID!): String!
  }
`;
