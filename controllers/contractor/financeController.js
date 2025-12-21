const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../utils/filters/monthYearFilter");


const getAllLabor = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);

  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  let where = {
    createdAt: {
      gte: startDate,
      lt: endDate,
      ...branchFilter("contractorPay", branch, req.branchIds),
    },
  };

  // Search filter
  if (search) {
    const searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      { senderName: { contains: searchValue } },
      { referenceNumber: { contains: searchValue } },
    ];
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Find contractor by userId
      const contractor = await tx.contractor.findUnique({
        where: { userId: req.id },
        select: { id: true },
      });

      if (!contractor) {
        throw new Error("Contractor not found");
      }

      // 2️⃣ Get labor records (type, createdAt, amount)
      const labors = await tx.contractorPay.findMany({
        where: { contractorId: contractor.id },
        select: {
          type: true,
          createdAt: true,
          amount: true,
        },
      });

      // 3️⃣ Compute totalLabor
      const totalLabor = labors.reduce((sum, labor) => {
        return sum + (Number(labor.amount) || 0);
      }, 0);

      // 4️⃣ Get job orders for contractor
      const jobOrders = await tx.jobOrder.findMany({
        where: { contractorId: contractor.id },
        select: {
          labor: true,
          contractorPercent: true,
        },
      });

      // 5️⃣ Compute totalCommission
      const totalCommission = jobOrders.reduce((sum, jo) => {
        const labor = Number(jo.labor) || 0;
        const percent = Number(jo.contractorPercent) || 0;
        return sum + labor * percent;
      }, 0);

      // 6️⃣ Compute total balance
      const totalBalance = totalCommission - totalLabor;

      return { labors, totalBalance, totalLabor };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllLabor };