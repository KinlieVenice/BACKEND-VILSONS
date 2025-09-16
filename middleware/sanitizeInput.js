const sanitizeHtml = require("sanitize-html");

function deepValidate(obj) {
  if (typeof obj === "string") {
    // If sanitized string is different from original, it had HTML/script
    const cleaned = sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (cleaned !== obj) {
      throw new Error("Input contains forbidden HTML or script");
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(deepValidate);
  } else if (typeof obj === "object" && obj !== null) {
    for (let key in obj) {
      obj[key] = deepValidate(obj[key]);
    }
  }
  return obj;
}

const sanitizeInput = (req, res, next) => {
  try {
    if (req.body) {
      req.body = deepValidate(req.body);
    }
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = sanitizeInput;
