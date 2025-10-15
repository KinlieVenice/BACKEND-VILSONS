const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createComponent = async (req, res) => {
    const { componentName } = req.body;

    try {
        const component = await prisma.payComponent.create({
            data: { componentName: componentName }
        })
        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { createComponent };