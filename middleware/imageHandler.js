const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const createUploader = (folderName = "general") => {
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

  return multer({ storage, fileFilter });
};

module.exports = createUploader;
