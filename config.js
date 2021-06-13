const env = process.env.NODE_ENV;
const config = {};

if (env === "development") {
  config.uri = process.env.MONGODB_DEV_URI;
} else {
  const user = process.env.MONGODB_ATLAS_USER;
  const password = process.env.MONGODB_ATLAS_PASSWORD;
  const cluster = process.env.MONGODB_ATLAS_CLUSTER;
  const dbName = process.env.MONGODB_ATLAS_DBNAME;
  const options = process.env.MONGODB_ATLAS_OPTIONS;
  const uri =
    `mongodb+srv://${user}:${password}@${cluster}/${dbName}` +
    (options ? `?${options}` : "");
  config.uri = uri;
}
config.port = process.env.PORT || 4000;

module.exports = { config };
