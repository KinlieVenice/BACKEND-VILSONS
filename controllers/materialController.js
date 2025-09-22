const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllMaterials = async (req, res) => {
  const search = req?.query?.search;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const year = req?.query?.year; // e.g. "2025"
  const month = req?.query?.month; // e.g. "09" for September

  let where = {};

  if (search) {
    where.OR = [
      { materialName: { contains: search } },
      { price: { contains: search } },
      { quantity: { contains: search } },
    ];
  }

  if (year && !month) {
    const y = parseInt(year, 10);
    where.createdAt = {
      gte: new Date(y, 0, 1),
      lt: new Date(y + 1, 0, 1),
    };
  }

  if (year && month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 1);
    where.createdAt = {
      gte: startOfMonth,
      lt: endOfMonth,
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const materials = await tx.material.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
      });

      return materials;
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMaterials };
