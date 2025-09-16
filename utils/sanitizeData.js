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

  module.exports = sanitizeAndValidate;