const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token", { errors: err });
      }
    }
    throw new AuthorizationError(
      'Authentication token must be formatted "Bearer <token>"'
    );
  }
  throw new Error("Authorization header must be provided");
};
