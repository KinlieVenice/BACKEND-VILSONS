const sanitizeHtml = require("sanitize-html");

const clean = (value) =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
  
const sanitizeAndValidate = (fields) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(fields)) {
    const cleaned = clean(value);
    if (cleaned !== value) {
      throw new Error(
        `Invalid input in ${key}: HTML or scripts are not allowed`
      );
    }
    sanitized[key] = cleaned;
  }
  return sanitized;
}

const sanitizeHtml = require("sanitize-html");

function containsHtml(str) {
  // Regex: detects <something> or </something>
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(str);
}

function deepValidate(obj) {
  if (typeof obj === "string") {
    if (containsHtml(obj)) {
      throw new Error("Input contains forbidden HTML or script tags");
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

  module.exports = sanitizeAndValidate;