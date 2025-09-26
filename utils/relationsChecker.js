function hasRelations(user, excludedKeys = []) {
  return Object.entries(user).some(([key, value]) => {
    console.log("Checking:", key, value);

    if (excludedKeys.includes(key)) return false;

    if (Array.isArray(value)) {
      console.log("Array check:", key, value.length);
      return value.length > 0;
    }

    if (typeof value === "object" && value !== null) {
      const nestedHas = Object.values(value).some(
        (v) => Array.isArray(v) && v.length > 0
      );
      if (nestedHas) console.log("Nested true at:", key);
      return nestedHas;
    }

    return false;
  });
}

module.exports = hasRelations