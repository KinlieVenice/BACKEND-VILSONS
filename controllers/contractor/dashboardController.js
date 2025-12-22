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

const getContractorBalance = async (req, res) => {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { userId: req.id }, // use req.id dynamically
      select: { id: true },
    });

    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    // Get total labor
    const labors = await prisma.contractorPay.findMany({
      where: { contractorId: contractor.id },
      select: { amount: true },
    });

    const totalLabor = labors.reduce(
      (sum, labor) => sum + (Number(labor.amount) || 0),
      0
    );

    // Get job orders for commission calculation
    const jobOrders = await prisma.jobOrder.findMany({
      where: { contractorId: contractor.id },
      select: { labor: true, contractorPercent: true },
    });

    const totalCommission = jobOrders.reduce((sum, jo) => {
      const labor = Number(jo.labor) || 0;
      const percent = Number(jo.contractorPercent) || 0;
      return sum + labor * percent;
    }, 0);

    const totalBalance = totalCommission - totalLabor;

    return res.status(200).json({
      data: { totalLabor, totalCommission, totalBalance },
    });
  } catch (err) {
    console.error("Error in getContractorBalance:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getContractorJobStatus = async (req, res) => {
  try {
    // Find contractor by logged-in user ID
    const contractor = await prisma.contractor.findUnique({
      where: { userId: req.id },
      select: { id: true },
    });

    if (!contractor)
      return res.status(404).json({ message: "Contractor not found" });

    // Recent 5 job orders for this contractor
    const recentPromise = prisma.jobOrder.findMany({
      where: { contractorId: contractor.id, status: { not: "archived" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        transactions: true,
        truck: { select: { id: true, plate: true } },
        customer: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        contractor: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { price: true, quantity: true } },
      },
    });

    // Get counts per status
    const statuses = [
      "pending",
      "ongoing",
      "completed",
      "forRelease",
    ];
    const countPromises = statuses.map((s) =>
      prisma.jobOrder.count({
        where: { contractorId: contractor.id, status: s },
      })
    );

    const [recentJobs, ...countsArr] = await Promise.all([
      recentPromise,
      ...countPromises,
    ]);
    const counts = {};
    statuses.forEach((s, i) => (counts[s] = countsArr[i] || 0));

    // Format recent jobs
    const recent = recentJobs.map((job) => {
      const laborValue = Number(job.labor || 0);

      // Calculate commissions
      const contractorPercent = Number(job.contractorPercent || 0);
      const contractorCommission = laborValue * contractorPercent;
      const shopCommission = laborValue - contractorCommission;

      // Total material cost
      const totalMaterialCost =
        job.materials?.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        ) || 0;

      // Total transactions
      const totalTransactions =
        job.transactions?.reduce((sum, t) => sum + Number(t.amount || 0), 0) ||
        0;

      const totalBill = laborValue + totalMaterialCost;
      const balance = totalBill - totalTransactions;

      return {
        id: job.id,
        jobOrderCode: job.jobOrderCode,
        status: job.status,
        plateNumber: job.truck?.plate || null,
        truckId: job.truck?.id || null,
        contractorId: job.contractor?.id || null,
        contractorUserId: job.contractor?.userId || null,
        contractorName: job.contractor?.user?.fullName || null,
        customerId: job.customer?.id || null,
        customerUserId: job.customer?.userId || null,
        customerName: job.customer?.user?.fullName || null,
        branchId: job.branch?.id || null,
        branchName: job.branch?.branchName || null,
        totalMaterialCost,
        contractorCommission,
        shopCommission,
        totalBill,
        totalTransactions,
        balance,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    return res.status(200).json({ data: { recent, counts } });
  } catch (err) {
    console.error("Error in getContractorJob:", err);
    return res.status(500).json({ message: err.message });
  }
};


const getContractorRecentJobs = async (req, res) => {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { userId: req.id },
      select: { id: true },
    });

    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    const recentJobOrders = await prisma.jobOrder.findMany({
      where: { contractorId: contractor.id },
      select: {
        id: true,
        jobOrderCode: true,
        labor: true,
        contractorPercent: true,
        status: true,
        createdAt: true,
        truck: { select: { plate: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const formatted = recentJobOrders.map((jo) => ({
      id: jo.id,
      jobOrderCode: jo.jobOrderCode,
      plate: jo.truck?.plate || "N/A",
      commission: Number(jo.labor) * Number(jo.contractorPercent),
      contractorPercent: jo.contractorPercent,
      status: jo.status,
      createdAt: jo.createdAt,
    }));

    return res.status(200).json({ data: formatted });
  } catch (err) {
    console.error("Error in getContractorRecentJobs:", err);
    return res.status(500).json({ message: err.message });
  }
};



module.exports = { getContractorDashboard,  getContractorBalance, getContractorJobStatus, getContractorRecentJobs }
