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

router.delete("/", async (req, res) => {
  const { filenames } = req.body;

  if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
    return res.status(400).json({ message: "filenames array is required" });
  }

  try {
    const results = {
      successful: [],
      failed: [],
      notFound: [],
    };

    // Process each filename
    for (const filename of filenames) {
      try {
        const filePath = path.join(__dirname, "..", "images", filename);

        // --- 1️⃣ Update database references to null/delete ---
        // Check if a user has this image
        const user = await prisma.user.findFirst({
          where: { image: filename },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: null },
          });
        }

        // Check if a truck has this image
        const truck = await prisma.truck.findFirst({
          where: { image: filename },
        });
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
          results.successful.push(filename);
        } else {
          results.notFound.push(filename);
        }
      } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
        results.failed.push({
          filename,
          error: error.message,
        });
      }
    }

    // Generate response message
    let message = "";
    if (results.successful.length > 0) {
      message += `Successfully deleted ${results.successful.length} file(s). `;
    }
    if (results.notFound.length > 0) {
      message += `${results.notFound.length} file(s) not found. `;
    }
    if (results.failed.length > 0) {
      message += `Failed to delete ${results.failed.length} file(s).`;
    }

    const statusCode =
      results.failed.length === filenames.length
        ? 500
        : results.failed.length > 0
        ? 207
        : 200; // 207 = Multi-Status

    return res.status(statusCode).json({
      message: message.trim(),
      results,
    });
  } catch (err) {
    console.error("Error in bulk delete:", err);
    return res.status(500).json({
      message: "Failed to process bulk delete",
      error: err.message,
    });
  }
});

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
