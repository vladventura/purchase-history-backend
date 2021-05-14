require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require("./graphql/typeDefs");
const { resolvers } = require("./graphql/resolvers");

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.applyMiddleware({ app });

mongoose
  .connect(process.env.MONGODB_USERS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => app.listen({ port: 4000 }, () => console.log("Server ready!")));
