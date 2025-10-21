const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCustomerDashboard = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Find customer by userId
      const customer = await tx.customer.findFirst({
        where: { userId: "7a7ffb3e-a04a-4481-93ae-a354c085316e" },
        include: {
          jobOrders: {
            select: {
              id: true,
              jobOrderCode: true,
              status: true,
              labor: true,
              materials: true,
              createdAt: true,
              truck: { select: { plate: true } },
            },
          },
        },
      });

      if (!customer) {
        throw new Error("You are not a customer");
      }

      // 2️⃣ Collect job order codes
      const jobOrderCodes = customer.jobOrders.map((jo) => jo.jobOrderCode);

      if (!jobOrderCodes.length) {
        return {
          totalBalance: 0,
          totalBill: 0,
          totalTransactions: 0,
          statusCounts: {
            pending: 0,
            ongoing: 0,
            completed: 0,
            forRelease: 0,
            archived: 0,
          },
          recentJobOrders: [],
        };
      }

      // 3️⃣ Fetch all transactions related to the customer’s job orders
      const transactions = await tx.transaction.findMany({
        where: { jobOrderCode: { in: jobOrderCodes } },
        select: { jobOrderCode: true, amount: true },
      });

      // Group transactions by jobOrderCode
      const transactionMap = {};
      for (const t of transactions) {
        transactionMap[t.jobOrderCode] =
          (transactionMap[t.jobOrderCode] || 0) + (Number(t.amount) || 0);
      }

      // 4️⃣ Compute totals for each job order
      let totalBill = 0;
      let totalTransactions = 0;

      const jobOrdersWithTotals = customer.jobOrders.map((jo) => {
        const laborTotal = Number(jo.labor) || 0;
        const materialsTotal = Array.isArray(jo.materials)
          ? jo.materials.reduce((a, m) => a + (Number(m.amount) || 0), 0)
          : 0;
        const bill = laborTotal + materialsTotal;
        const paid = transactionMap[jo.jobOrderCode] || 0;
        const balance = bill - paid;

        totalBill += bill;
        totalTransactions += paid;

        return {
          id: jo.id,
          jobOrderCode: jo.jobOrderCode,
          plate: jo.truck?.plate || "N/A",
          createdAt: jo.createdAt,
          status: jo.status,
          totalBill: bill,
          totalBalance: balance,
        };
      });

      // 5️⃣ Compute overall totals
      const totalBalance = totalBill - totalTransactions;

      // 6️⃣ Count job orders per status
      const statusCounts = {
        pending: 0,
        ongoing: 0,
        completed: 0,
        forRelease: 0,
        archived: 0,
      };

      for (const jo of customer.jobOrders) {
        if (statusCounts.hasOwnProperty(jo.status)) {
          statusCounts[jo.status]++;
        }
      }

      // 7️⃣ Get the 5 most recent job orders
      const recentJobOrders = jobOrdersWithTotals
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      return {
        totalBalance,
        totalBill,
        totalTransactions,
        statusCounts,
        recentJobOrders,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error in getCustomerDashboard:", err);
    return res.status(500).json({ message: err.message });
  }
};




module.exports = { getCustomerDashboard }
