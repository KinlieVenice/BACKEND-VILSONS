const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const roleFinder = async (roleName) => {
    return await prisma.role.findUnique({where: { roleName }})
}

module.exports = roleFinder;