/**
 * Safely parse specific fields in req.body that may be JSON strings (from multipart/form-data).
 * 
 * @param {Object} body - The request body (e.g. req.body)
 * @param {Array<string>} fields - List of field names to parse
 * @returns {Object} - The same body object with parsed arrays
 */
function parseArrayFields(body, fields = []) {
  const parsedBody = { ...body };

  for (const field of fields) {
    if (!parsedBody[field]) continue;

    // Skip if it's already an array
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
