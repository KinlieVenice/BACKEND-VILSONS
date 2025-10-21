const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCustomerProfile = async (req, res) => {

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.id },
      include: {
        trucks: {
          where: { endDate: null },
          select: {
            id: true,
            truck: {
              select: {
                createdAt: true,
                id: true,
                plate: true,
                make: true,
                model: true,
              },
            },
          },
        },
        jobOrders: {
          select: {
            id: true,
            jobOrderCode: true,
            status: true,
            createdAt: true,
            labor: true,
            materials: { select: { price: true, quantity: true } },
            truck: { select: { plate: true, id: true } },
          },
        },
        user: {
          include: {
            roles: {
              select: { role: { select: { id: true, roleName: true } } },
            },
            branches: {
              select: { branch: { select: { id: true, branchName: true } } },
            },
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Group job orders
    const activeStatuses = ["pending", "ongoing", "completed", "forRelease"];

    const activeJobOrders = customer.jobOrders.filter((jo) =>
      activeStatuses.includes(jo.status)
    );
    const archivedJobOrders = customer.jobOrders.filter(
      (jo) => jo.status === "archived"
    );

    // Collect all job order codes
    const allJobOrders = [...activeJobOrders, ...archivedJobOrders];
    const jobOrderCodes = allJobOrders.map((jo) => jo.jobOrderCode);

    // Get related transactions
    const transactions = await prisma.transaction.groupBy({
      by: ["jobOrderCode"],
      _sum: { amount: true },
      where: { jobOrderCode: { in: jobOrderCodes } },
    });

    // Map transactions for quick lookup
    const transactionMap = transactions.reduce((acc, t) => {
      acc[t.jobOrderCode] = Number(t._sum.amount) || 0;
      return acc;
    }, {});

    // Helper mapper for job orders
    const mapJobOrders = (jobOrders) =>
      jobOrders.map((jo) => {
        const totalMaterials = jo.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
        const totalBill = Number(jo.labor) + totalMaterials;
        const totalPaid = transactionMap[jo.jobOrderCode] || 0;
        const balance = totalBill - totalPaid;

        return {
          id: jo.id,
          jobOrderCode: jo.jobOrderCode,
          status: jo.status,
          createdAt: jo.createdAt,
          plate: jo.truck.plate,
          truckId: jo.truck.id,
          totalBill,
          totalPaid,
          balance,
        };
      });

    const activeOrders = mapJobOrders(activeJobOrders);
    const archivedOrders = mapJobOrders(archivedJobOrders);

    // Compute totals based on all job orders
    const allOrders = [...activeOrders, ...archivedOrders];
    const grandTotalBill = allOrders.reduce(
      (sum, jo) => sum + Number(jo.totalBill),
      0
    );
    const totalTransactions = allOrders.reduce(
      (sum, jo) => sum + Number(jo.totalPaid),
      0
    );
    const totalBalance = grandTotalBill - totalTransactions;

    const activeCount = activeOrders.length;
    const archivedCount = archivedOrders.length;

    // Construct clean response
    const cleanCustomer = {
      user: customer.user
        ? {
            id: customer.user.id,
            customerId: req.params.id,
            fullName: customer.user.fullName,
            username: customer.user.username,
            email: customer.user.email,
            phone: customer.user.phone,
            createdAt: customer.user.createdAt,
            roles: customer.user.roles.map((r) => ({
              roleId: r.role.id,
              roleName: r.role.roleName,
            })),
            branches: customer.user.branches.map((b) => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName,
            })),
          }
        : null,
      trucks: customer.trucks.map((t) => ({
        truckId: t.truck.id,
        createdAt: t.truck.createdAt,
        plate: t.truck.plate,
        model: t.truck.model,
        make: t.truck.make,
      })),
      jobOrders: {
        active: activeOrders,
        archived: archivedOrders,
      },
      jobOrderSummary: {
        activeCount,
        archivedCount,
        grandTotalBill,
        totalTransactions,
        totalBalance,
      },
    };

    return res.status(200).json({ data: cleanCustomer });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getCustomerProfile };