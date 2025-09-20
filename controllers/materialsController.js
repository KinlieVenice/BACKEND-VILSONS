const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllMaterials = async (req, res) => {
  const search = req?.query?.search;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (search) {
    where.OR = [
      { materialName: { contains: search } },
      { price: { contains: search } },
      { quantity: { contains: search } },
    ];
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const materials = await tx.material.findMany(
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {})
      );

      return materials;
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMaterials }