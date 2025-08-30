const roleFinder = require('../utils/roleFinder')
const getRolesList = async () => {
  return {
    Admin: await roleFinder("Admin"),
    Employee: await roleFinder("Employee"),
    Contractor: await roleFinder("Contractor"),
    Customer: await roleFinder("Customer"),
  };
};



module.exports = getRolesList;