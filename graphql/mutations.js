const { gql } = require("apollo-server-core");

module.exports.Mutation = gql`
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): String!
    login(username: String!, password: String!): User!
    confirmAccount(userId: String!): User!
    resendConfirmationEmail(userId: String!): String!
    addItem(name: String!, price: Float!, cost: Float!): Item!
    deleteItem(itemId: ID!): String!
    updateItem(itemId: ID!, name: String!, price: Float!, cost: Float!): String!
  }
`;
