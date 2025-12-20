function parseArrayFieldsOld(body, fields = []) {
  const parsedBody = {};

  for (const [key, value] of Object.entries(body)) {
    if (["undefined", "null", ""].includes(value)) {
      parsedBody[key] = null; // Normalize garbage string values
    } else {
      parsedBody[key] = value;
    }
  }

  for (const field of fields) {
    if (!parsedBody[field]) continue;
    if (Array.isArray(parsedBody[field])) continue;

    try {
      parsedBody[field] = JSON.parse(parsedBody[field]);
    } catch (err) {
      throw new Error(`Invalid JSON array format for field "${field}".`);
    }
  }

  return parsedBody;
}

function parseArrayFields(body, fields = []) {
  const parsedBody = {};

  for (const [key, value] of Object.entries(body)) {
    if (["undefined", "null", ""].includes(value)) {
      parsedBody[key] = null;
      continue;
    }
    parsedBody[key] = value;
  }

  for (const field of fields) {
    if (!parsedBody[field]) continue;

    if (typeof parsedBody[field] === "object") continue;

    if (typeof parsedBody[field] === "string") {
      let val = parsedBody[field];

      if (val === "[object Object]") {
        throw new Error(
          `Field "${field}" must be JSON.stringify() before sending`
        );
      }

      try {
        val = JSON.parse(val);

        // 🔥 handle double-stringified JSON
        if (typeof val === "string") {
          val = JSON.parse(val);
        }

        parsedBody[field] = val;
      } catch {
        throw new Error(`Invalid JSON format for field "${field}"`);
      }
    }
  }

  return parsedBody;
}

module.exports = parseArrayFields;



