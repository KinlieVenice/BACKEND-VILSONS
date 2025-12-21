const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../../utils/filters/monthYearFilter");
const { getLastUpdatedAt } = require("../../../utils/services/lastUpdatedService");


const getAllMaterials = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);

  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  let where = {
    createdAt: { gte: startDate, lt: endDate },
  };

  // Search filter
  if (search) {
    const searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { materialName: { contains: searchValue } }, 
      { jobOrder: { jobOrderCode: { contains: searchValue } } }
    ];
  }

  // Branch filter
  if (branch) {
    const branchValue = branch.trim().replace(/^["']|["']$/g, "");
    where.jobOrder = { branchId: branchValue };
  } else if (req.branchIds?.length) {
    where.jobOrder = { branchId: { in: req.branchIds } };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const materials = await tx.material.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          jobOrder: {
            select: {
              jobOrderCode: true,
              truck: { select: { plate: true } },
            },
          },
        },
      });

      const materialsWithTotal = materials.map((m) => ({
        ...m,
        totalAmount: Number(m.price) * Number(m.quantity),
      }));

      const totalMaterialsAmount = materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      return { materialsWithTotal, totalMaterialsAmount };
    });

    return res.status(200).json({
      data: {
        materials: result.materialsWithTotal,
        totalMaterialsAmount: result.totalMaterialsAmount,
        lastUpdatedAt: result.lastUpdatedAt
      },
    });
  } catch (err) {
    console.error("Error fetching materials:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMaterials };
