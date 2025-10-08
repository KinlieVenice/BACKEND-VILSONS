const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRevenueProfit = async (req, res) => {
  try {
    let { month, year, branch } = req?.query;
    let where = {};

    // Branch filtering
    if (branch) {
      const branchValue = branch.trim().replace(/^["']|["']$/g, "");
      where.branchId = branchValue;
    } else if (req.branchIds?.length) {
      where.branchId = { in: req.branchIds };
    }

    // Default to current month/year if not provided
    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();
    month = month ? parseInt(month, 10) - 1 : now.getMonth();

    // Determine date range
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

    const result = await prisma.$transaction(async (tx) => {
      const dateWhere = { ...where, createdAt: { gte: startDate, lt: endDate } };

      // Revenue sources
      const transactions = await tx.transaction.findMany({ where: dateWhere });
      const otherIncomes = await tx.otherIncome.findMany({ where: dateWhere });

      const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalOtherIncomes = otherIncomes.reduce((sum, t) => sum + Number(t.amount), 0);

      // Expenses
      const materials = await tx.material.findMany({ where: dateWhere });
      const overheads = await tx.overhead.findMany({ where: dateWhere });
      const equipments = await tx.equipment.findMany({ where: dateWhere });
      const employeePays = await tx.employeePay.findMany({
        where: dateWhere,
        include: { payComponents: true },
      });
      const contractorPays = await tx.contractorPay.findMany({ where: dateWhere });

      const totalMaterials = materials.reduce((sum, m) => sum + Number(m.price) * Number(m.quantity), 0);
      const totalOverheads = overheads.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalEquipments = equipments.reduce((sum, m) => sum + Number(m.price) * Number(m.quantity), 0);

      const totalEmployeePays = employeePays.reduce((sum, e) => {
        const totalComponents = e.payComponents.reduce((pcSum, pc) => pcSum + Number(pc.amount), 0);
        return sum + totalComponents;
      }, 0);

      const totalContractorPays = contractorPays.reduce((sum, t) => sum + Number(t.amount), 0);

      // Totals
      const totalRevenue = totalTransactions + totalOtherIncomes;
      const totalLabor = totalEmployeePays + totalContractorPays;
      const totalOperationals = totalMaterials + totalEquipments + totalLabor;
      const totalExpenses = totalOperationals + totalOverheads;
      const grossProfit = totalRevenue - (totalOperationals - totalOverheads);

      return {
        grossProfit,
        totalRevenue,
        totalTransactions,
        totalOtherIncomes,
        totalExpenses,
        totalMaterials,
        totalOverheads,
        totalEquipments,
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
