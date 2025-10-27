const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Dynamic route to serve images from different folders.
 * Example URLs:
 *   GET /images/users/abcdef123456.jpg
 *   GET /images/trucks/truck123.jpg
 *   GET /images/job-orders/before456.jpg
 */

router.get("/:filename", (req, res) => {
  const { filename } = req.params;

  const filePath = path.join(__dirname, "..", "images", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(filePath);
});

router.delete("/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "images", filename);

  try {
    // --- 1️⃣ Update database references to null/delete ---
    // Check if a user has this image
    const user = await prisma.user.findFirst({ where: { image: filename } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: null },
      });
    }

    // Check if a truck has this image
    const truck = await prisma.truck.findFirst({ where: { image: filename } });
    if (truck) {
      await prisma.truck.update({
        where: { id: truck.id },
        data: { image: null },
      });
    }

    // Check if a job order image exists with this filename
    const jobOrderImage = await prisma.jobOrderImage.findFirst({
      where: { filename },
    });
    if (jobOrderImage) {
      await prisma.jobOrderImage.delete({
        where: { id: jobOrderImage.id },
      });
    }

    // --- 2️⃣ Delete the actual file if it exists ---
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      return res.status(404).json({ message: "File not found" });
    }

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    return res.status(500).json({ message: "Failed to delete image", error: err.message });
  }
});


module.exports = router;
