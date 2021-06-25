const logger = require("./logger").loggerFactory("info", "checkAuth");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (context) => {
  logger.log("info", `${context} : Authenticating user`);
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        return user;
      } catch (err) {
        logger.log("warn", `${context} : Invalid/Expired token`);
        throw new AuthenticationError("Invalid/Expired token", { errors: err });
      }
    }
    logger.log("warn", `${context} : Malformed Authorization token`);
    throw new AuthorizationError(
      'Authentication token must be formatted "Bearer <token>"'
    );
  }
  logger.log("warn", `${context} : Missing Authorization header`);
  throw new Error("Authorization header must be provided");
};
