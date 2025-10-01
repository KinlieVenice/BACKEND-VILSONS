const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getRevenue = async (req, res) => {
  try {
    let { month, year } = req.query;

    // default to current date if not provided
    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();

    let startDate, endDate;

    if (month) {
      // monthly range
      month = parseInt(month, 10) - 1; // JS months are 0-based
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    } else {
      // yearly range
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    }

    const result = await prisma.$transaction(async (tx) => {
        const transactions = await tx.transaction.findMany({
        where: {
            updatedAt: {
                gte: startDate,
                lt: endDate
            }
        }
        });

        const otherIncomes = await tx.otherIncome.findMany({
        where: {
            updatedAt: {
                gte: startDate,
                lt: endDate
            }
        }
        });

        const totalTransactions = transactions.reduce(
          (sum, t) => sum + Number(t.amount), // ✅ force to number
          0
        );

        const totalOtherIncomes = otherIncomes.reduce(
          (sum, t) => sum + Number(t.amount), // ✅ force to number
          0
        );

        const totalRevenue = totalTransactions + totalOtherIncomes;

        return totalRevenue
    })

    return res.json({
        data: {
            type: month ? "monthly" : "yearly",
            year,
            month: month !== undefined ? month + 1 : undefined,
            totalRevenue: result
        }      
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRevenue }
