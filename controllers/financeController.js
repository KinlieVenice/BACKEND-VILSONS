const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRevenueProfit = async (req, res) => {
  try {
    let { month, year } = req.query;

    // default to current date if not provided
    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();
    month = month ? parseInt(month, 10) - 1 : now.getMonth(); // default to current month if not provided

    // always use monthly range unless explicitly requesting yearly
    let startDate, endDate;
    if (req.query.year && !req.query.month) {
      // if only year is passed -> yearly range
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      // default: monthly range (either given or current month)
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      const where = {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      };

      const transactions = await tx.transaction.findMany({ where });
      const otherIncomes = await tx.otherIncome.findMany({ where });

      const totalTransactions = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
      const totalOtherIncomes = otherIncomes.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const materials = await tx.material.findMany({ where });
      const overheads = await tx.overhead.findMany({ where });
      const equipments = await tx.equipment.findMany({ where });

      const employeePays = await tx.employeePay.findMany({
        where,
        include: { payComponents: true },
      });

      const contractorPays = await tx.contractorPay.findMany({ where });

      const totalMaterials = materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );
      const totalOverheads = overheads.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
      const totalEquipmments = equipments.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      const totalEmployeePays = employeePays.reduce((sum, employeePay) => {
        const totalComponents = employeePay.payComponents.reduce(
          (pcSum, pc) => pcSum + Number(pc.amount),
          0
        );
        return sum + totalComponents;
      }, 0);

      const totalContractorPays = contractorPays.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const totalRevenue = totalTransactions + totalOtherIncomes;
      const totalLabor = totalEmployeePays + totalContractorPays;
      const totalOperationals = totalMaterials + totalEquipmments + totalLabor;
      const grossProfit =
        totalRevenue - (totalOperationals - totalOverheads);

      return {
        grossProfit,
        totalRevenue,
        totalTransactions,
        totalOtherIncomes,
        totalMaterials,
        totalOverheads,
        totalEquipmments,
        totalLabor,
        totalOperationals,
      };
    });

    return res.json({
      data: {
        type: req.query.year && !req.query.month ? "yearly" : "monthly",
        year,
        month: req.query.year && !req.query.month ? undefined : month + 1,
        ...result,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { getRevenueProfit }
