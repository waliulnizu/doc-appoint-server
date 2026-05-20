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
      prompt: "select_account",
      mapProfileToUser: (profile) => ({
        name: profile.name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
      }),
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

  // Must match Google OAuth redirect host (client URL when using Next rewrite).
  const baseURL =
    process.env.BETTER_AUTH_URL ||
    process.env.CLIENT_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  const clientOrigin =
    process.env.CLIENT_URL || "http://localhost:3000";

  auth = betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [clientOrigin],
    database: mongodbAdapter(
      mongoClient.db(dbName)
    ),
    emailAndPassword: {
      enabled: true,
    },
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
