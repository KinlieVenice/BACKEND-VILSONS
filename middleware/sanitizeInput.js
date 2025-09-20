function sanitize(string) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  const reg = /[&<>"'`=\/]/g;
  return string.replace(reg, (match) => map[match]);
}

function deepValidate(input) {
  if (typeof input === "string") {
    return sanitize(input);
  } else if (Array.isArray(input)) {
    return input.map(deepValidate);
  } else if (typeof input === "number") {
    return input;
  } else if (typeof input === "object" && input !== null) {
    for (let key in input) {
      input[key] = deepValidate(input[key]);
    }
  }
  return input;
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
