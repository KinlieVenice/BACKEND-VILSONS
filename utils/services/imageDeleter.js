// utils/deleteFile.js
const fs = require("fs");
const path = require("path");

function deleteFile(relativePath) {
  if (!relativePath) return;
  const fullPath = path.resolve(relativePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑️ Deleted file: ${fullPath}`);
  } else {
    console.log(`⚠️ File not found: ${fullPath}`);
  }
}

module.exports = deleteFile;
