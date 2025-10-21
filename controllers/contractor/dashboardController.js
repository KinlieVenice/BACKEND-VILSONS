const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getContractorDashboard = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Find contractor by userId
      const contractor = await tx.contractor.findUnique({
        where: { userId: "9727527a-96f3-4f08-8fb6-405ce07ff918" }, // change to req.id for dynamic
        select: { id: true },
      });

      if (!contractor) {
        throw new Error("Contractor not found");
      }

      // 2️⃣ Get total labor from contractorPay
      const labors = await tx.contractorPay.findMany({
        where: { contractorId: contractor.id },
        select: { amount: true },
      });

      const totalLabor = labors.reduce(
        (sum, labor) => sum + (Number(labor.amount) || 0),
        0
      );

      // 3️⃣ Get all job orders with related truck (to get plate)
      const jobOrders = await tx.jobOrder.findMany({
        where: { contractorId: contractor.id },
        select: {
          id: true,
          jobOrderCode: true,
          labor: true,
          contractorPercent: true,
          status: true,
          createdAt: true,
          truck: {
            select: { plate: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // 4️⃣ Compute totalCommission
      const totalCommission = jobOrders.reduce((sum, jo) => {
        const labor = Number(jo.labor) || 0;
        const percent = Number(jo.contractorPercent) || 0;
        return sum + labor * percent;
      }, 0);

      // 5️⃣ Compute totalBalance
      const totalBalance = totalCommission - totalLabor;

      // 6️⃣ Get 5 most recent job orders (with plate)
      const recentJobOrders = jobOrders.slice(0, 5).map((jo) => ({
        id: jo.id,
        jobOrderCode: jo.jobOrderCode,
        plate: jo.truck?.plate || "N/A",
        commission: Number(jo.labor) * Number(jo.contractorPercent),
        contractorPercent: jo.contractorPercent,
        status: jo.status,
        createdAt: jo.createdAt,
      }));

      // 7️⃣ Count job orders by status
      const statusCounts = {
        pending: 0,
        ongoing: 0,
        completed: 0,
        forRelease: 0,
        archived: 0,
      };

      for (const jo of jobOrders) {
        if (statusCounts.hasOwnProperty(jo.status)) {
          statusCounts[jo.status]++;
        }
      }

      return {
        totalBalance,
        recentJobOrders,
        statusCounts,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error in getContractorDashboard:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getContractorDashboard }
