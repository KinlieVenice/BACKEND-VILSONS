const bcrypt = require("bcrypt");

const defaultPassword = async () => {
  return await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10); 
};

module.exports = defaultPassword;
