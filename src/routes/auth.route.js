const express = require("express");

const { getAuth } = require("../config/auth");

const router = express.Router();

let nodeHandler;

router.all("/*splat", async (req, res) => {
  if (!nodeHandler) {
    const { toNodeHandler } = await import("better-auth/node");

    nodeHandler = toNodeHandler(getAuth());
  }

  return nodeHandler(req, res);
});

module.exports = router;