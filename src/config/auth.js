const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("@better-auth/mongo-adapter");

let auth;

function buildSocialProviders() {
  const providers = {};

  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  ) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  return providers;
}

/** Call once after MongoDB `connectDB()` succeeds. */
function initAuth(mongoClient) {
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error("DB_NAME is not set in environment");
  }

  const socialProviders = buildSocialProviders();

  auth = betterAuth({
    database: mongodbAdapter(
      mongoClient.db(dbName)
    ),
    ...(Object.keys(socialProviders).length > 0
      ? { socialProviders }
      : {}),
  });

  return auth;
}

function getAuth() {
  if (!auth) {
    throw new Error(
      "Auth not initialized. Ensure connectDB() runs before handling requests."
    );
  }

  return auth;
}

module.exports = {
  initAuth,
  getAuth,
};
