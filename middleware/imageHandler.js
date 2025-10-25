const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/**
 * Create a Multer uploader.
 * 
 * @param {string} folderName - Folder where files are stored (default: "general")
 * @param {boolean} multiple - Whether to allow multiple files (default: false)
 * @param {number} maxCount - Max number of files for multiple uploads
 */
const createUploader = (folderName = "general", multiple = false, maxCount = 10) => {
  const uploadDir = path.join(__dirname, `../images/${folderName}`);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const encryptedName = crypto.randomBytes(16).toString("hex");
      const ext = path.extname(file.originalname);
      cb(null, `${encryptedName}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only image files are allowed"), false);
  };

  const uploader = multer({ storage, fileFilter });

  if (multiple) {
    // For multiple files, return the fields array for before/after images
    return uploader.fields([
      { name: "beforeImages", maxCount },
      { name: "afterImages", maxCount },
    ]);
  } else {
    // For single file, expect key "image"
    return uploader.single("image");
  }
};

module.exports = createUploader;
