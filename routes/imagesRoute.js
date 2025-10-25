const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

/**
 * Dynamic route to serve images from different folders.
 * Example URLs:
 *   GET /images/users/abcdef123456.jpg
 *   GET /images/trucks/truck123.jpg
 *   GET /images/job-orders/before456.jpg
 */

router.get("/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;

  // Whitelist allowed folders for safety
  const allowedFolders = ["users", "trucks", "job-orders"];
  if (!allowedFolders.includes(folder)) {
    return res.status(400).send("Invalid folder");
  }

  const filePath = path.join(__dirname, "..", "images", folder, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(filePath);
});

module.exports = router;
