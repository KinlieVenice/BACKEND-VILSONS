function parseArrayFields(body, fields = []) {
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


module.exports = parseArrayFields;
