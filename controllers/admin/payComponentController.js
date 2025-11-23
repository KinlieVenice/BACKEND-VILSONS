const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getPayComponent = async (req, res) => {
    if (!req.params.id) return res.status(404).json({ message: "Id is required" });

    try {
        const payComponent = await prisma.payComponent.findMany({
        where: { id: req.params.id },
        });
        if (!payComponent)
        return res
            .status(404)
            .json({ message: `Overhead with id: ${req.params.id} not found` });

        return res.status(201).json({ data: payComponent }) 
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getAllComponents = async (req, res) => {
  try {
    const components = await prisma.component.findMany();

    return res.status(200).json({ data: components });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getPayComponent, getAllComponents };