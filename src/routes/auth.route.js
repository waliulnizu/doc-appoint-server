const express = require("express");

const { getAuth } = require("../config/auth");

const router = express.Router();

router.all("/*splat", async (req, res) => {
  const auth = getAuth();

  if (typeof auth.handler === "function") {
    return auth.handler(req, res);
  }

  const { toNodeHandler } = await import("better-auth/node");

  return toNodeHandler(auth)(req, res);
});

module.exports = router;