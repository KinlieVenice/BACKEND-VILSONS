
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../utils/monthYearFilter");
const { getBranchFilter } = require("../utils/getBranchFilter");

const getRevenueProfit = async (req, res) => {
  try {
    let { month, year, branch } = req?.query;
    const { startDate, endDate } = getMonthYear(year, month);

    const where = { createdAt: { gte: startDate, lt: endDate } };

    const result = await prisma.$transaction(async (tx) => {
      // Revenue sources
      const transactions = await tx.transaction.findMany({
        where: { ...where, ...getBranchFilter("transaction", branch, req.branchIds) },
      });

      const otherIncomes = await tx.otherIncome.findMany({
        where: { ...where, ...getBranchFilter("otherIncome", branch, req.branchIds) },
      });

      const materials = await tx.material.findMany({
        where: { ...where, ...getBranchFilter("material", branch, req.branchIds) },
      });

      const overheads = await tx.overhead.findMany({
        where: { ...where, ...getBranchFilter("overhead", branch, req.branchIds) },
      });

      const equipments = await tx.equipment.findMany({
        where: { ...where, ...getBranchFilter("equipment", branch, req.branchIds) },
      });

      const employeePays = await tx.employeePay.findMany({
        where: { ...where, ...getBranchFilter("employeePay", branch, req.branchIds) },
        include: { payComponents: true },
      });

      const contractorPays = await tx.contractorPay.findMany({
        where: { ...where, ...getBranchFilter("contractorPay", branch, req.branchIds) },
      });

      // Totals
      const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalOtherIncomes = otherIncomes.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalMaterials = materials.reduce((sum, m) => sum + Number(m.price) * Number(m.quantity), 0);
      const totalOverheads = overheads.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalEquipments = equipments.reduce((sum, m) => sum + Number(m.price) * Number(m.quantity), 0);
      const totalEmployeePays = employeePays.reduce(
        (sum, e) => sum + e.payComponents.reduce((pcSum, pc) => pcSum + Number(pc.amount), 0),
        0
      );
      const totalContractorPays = contractorPays.reduce((sum, t) => sum + Number(t.amount), 0);

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
        ...result,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRevenueProfit };
