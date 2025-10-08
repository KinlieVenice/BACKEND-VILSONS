const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllMaterials = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  let year = req?.query?.year; // e.g. "2025"
  let month = req?.query?.month; // e.g. "09" for September

  let where = {};

  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [{ materalName: { contains: searchValue } }];
  }

  if (branch) {
    const branchValue = req.query.branch.trim().replace(/^["']|["']$/g, "");
    where.jobOrder = {
      branch: { id: branchValue },
    };
  } else if (req.branchIds?.length) {
    where.jobOrder = {
      branchId: { in: req.branchIds },
    };
  }

  // Date filters — default to current month if none provided
  const now = new Date();
  year = year ? parseInt(year, 10) : now.getFullYear();
  month = month ? parseInt(month, 10) - 1 : now.getMonth();

  let startDate, endDate;
  if (year && !month) {
    // Yearly range
    startDate = new Date(year, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(year + 1, 0, 1);
    endDate.setHours(0, 0, 0, 0);
  } else {
    // Monthly range
    startDate = new Date(year, month, 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(year, month + 1, 1);
    endDate.setHours(0, 0, 0, 0);
  }

   where.createdAt = {
    gte: startDate,
    lt: endDate,
  };

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
            truck: {
              select: {
                plate: true, 
              },
            },
          },
        },
      },
    });
        
      const materialsWithTotal = materials.map((m) => ({
        ...m,
        totalAmount: Number(m.price) * Number(m.quantity),
      }));

      const totalMaterialsAmount = materials.reduce(
        (sum, m) => sum + (Number(m.price) * Number(m.quantity)),
        0
      );


      return { materialsWithTotal, totalMaterialsAmount };
    });


    return res.status(201).json({ data: { materials: result.materialsWithTotal, totalMaterialsAmount: result.totalMaterialsAmount } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMaterials };
