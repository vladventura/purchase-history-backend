const { gql } = require("apollo-server-core");

module.exports.Query = gql`
  type Query {
    getItems: [Item]!
  }
`;
