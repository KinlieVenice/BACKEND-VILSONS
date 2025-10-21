const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllTransactions = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Find customer by userId
      const customer = await tx.customer.findFirst({
        where: { userId: req.id },
        include: {
          jobOrders: {
            select: { jobOrderCode: true },
          },
        },
      });

      if (!customer) {
        throw new Error("You are not a customer");
      }

      // 2️⃣ Collect all jobOrder codes
      const jobOrderCodes = customer.jobOrders.map((jo) => jo.jobOrderCode);

      if (!jobOrderCodes.length) {
        return { transactions: [], total: 0, totalBill: 0 };
      }

      // 3️⃣ Find all transactions matching those jobOrder codes
      const transactions = await tx.transaction.findMany({
        where: {
          jobOrderCode: { in: jobOrderCodes },
        },
        orderBy: { createdAt: "desc" },
      });

      // 4️⃣ Find all job orders for the customer
      const jobOrders = await tx.jobOrder.findMany({
        where: { customerId: customer.id },
        select: {
          labor: true,       // numeric
          materials: true,   // array
        },
      });

      // 5️⃣ Compute total bill from job orders
      const totalBill = jobOrders.reduce((sum, jo) => {
        const laborTotal = Number(jo.labor) || 0;

        const materialsTotal = Array.isArray(jo.materials)
          ? jo.materials.reduce((a, m) => a + (Number(m.amount) || 0), 0)
          : 0;

        return sum + laborTotal + materialsTotal;
      }, 0);

      // 6️⃣ Compute total transaction amount
      const totalTransactions = transactions.reduce(
        (sum, t) => sum + (Number(t.amount) || 0),
        0
      );

      // 7️⃣ Compute remaining balance (optional)
      const totalBalance = totalBill - total;

      return { transactions, totalTransactions, totalBill, totalBalance };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTransactions };