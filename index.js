require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require("./graphql/typeDefs");
const { config } = require("./config");
const { resolvers } = require("./graphql/resolvers");
const { loggerFactory } = require("./utils/logger");

const logger = loggerFactory("http", "index");
logger.log("info", "Starting server setup");

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});
logger.log("info", "Created Apollo Server");

server.applyMiddleware({ app });
logger.log("info", "Applied the app as middleware");

logger.log("info", "Connecting to database...");
mongoose
  .connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.log("info", "Connection to database finished");
    return app.listen({ port: config.port }, () =>
      logger.log("info", `Server ready. Listening on :${config.port}`)
    );
  })
  .catch((err) => {
    logger.log("error", err);
  });
