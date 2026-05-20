require("dotenv").config();

const app = require("./app");
const { connectDB, closeDB, getClient } = require("./config/db");
const { initAuth } = require("./config/auth");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initAuth(getClient());

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
