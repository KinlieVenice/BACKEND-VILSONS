const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getCustomerOld = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const customer = await prisma.customer.findUnique({
        where: { id: req.params.id },
        include: {
            trucks: {
            where: { endDate: null },
            select: {
                id: true,
                truck: {
                select: {
                    id: true,
                    plate: true,
                    make: true,
                    model: true
                }
                }
            }
            },
            jobOrders: {
            select: {
                id: true,
                jobOrderCode: true,
                status: true,
                createdAt: true,
                labor: true,
                materials: { select: { price: true, quantity: true } },
                truck: { select: { plate: true, id: true } }
            }
            },
            user: {
            include: {
                roles: { select: { role: { select: { id: true, roleName: true } } } },
                branches: { select: { branch: { select: { id: true, branchName: true } } } }
            }
            }
        }
    });


    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // filter
    const filter = req?.query?.filter;
    const activeStatuses = ['pending', 'ongoing', 'completed', 'forRelease'];

    let filteredJobOrders = customer.jobOrders;
    if (filter === "active") {
      filteredJobOrders = customer.jobOrders.filter(jo =>
        activeStatuses.includes(jo.status)
      );
    } else if (filter === "archived") {
      filteredJobOrders = customer.jobOrders.filter(jo => jo.status === "archived");
    }

    // count
    const activeCount = customer.jobOrders.filter(jo =>
      activeStatuses.includes(jo.status)
    ).length;
    const archivedCount = customer.jobOrders.filter(
      jo => jo.status === "archived"
    ).length;


    // map job orders 
    const jobOrders = filteredJobOrders.map(jo => {
      const totalMaterials = jo.materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      const totalBill = Number(jo.labor) + totalMaterials;

      return {
        id: jo.id,
        jobOrderCode: jo.jobOrderCode,
        status: jo.status,
        createdAt: jo.createdAt,
        plate: jo.truck.plate,
        truckId: jo.truck.id,
        totalBill
      };
    });

    const grandTotalBill = jobOrders.reduce((sum, jo) => sum + Number(jo.totalBill), 0);
    const jobOrderCodes = customer.jobOrders.map(jo => jo.jobOrderCode);

    let totalTransactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        jobOrderCode: { in: jobOrderCodes }
      }
    });

    totalTransactions = totalTransactions._sum.amount || 0

    const totalBalance = grandTotalBill - totalTransactions;

    const cleanCustomer = {
      ...customer,
      user: customer.user
        ? {
            id: customer.user.id,
            customerId: req.params.id,
            fullName: customer.user.fullName,
            username: customer.user.username,
            email: customer.user.email,
            phone: customer.user.phone,
            createdAt: customer.user.createdAt,
            roles: customer.user.roles.map(r => ({
              roleId: r.role.id,
              roleName: r.role.roleName
            })),
            branches: customer.user.branches.map(b => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName
            })),
          }
        : null,
      jobOrder: jobOrders,
      trucks: customer.trucks.map(t => ({
        truckId: t.truck.id,
        plate: t.truck.plate,
        model: t.truck.model,
        make: t.truck.make
    })),
      jobOrderSummary: { activeCount, archivedCount, grandTotalBill, totalBalance, totalTransactions }
    };

    res.status(200).json({ data: cleanCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCustomer = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
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
                model: true
              }
            }
          }
        },
        jobOrders: {
          select: {
            id: true,
            jobOrderCode: true,
            status: true,
            createdAt: true,
            labor: true,
            materials: { select: { price: true, quantity: true } },
            truck: { select: { plate: true, id: true } }
          }
        },
        user: {
          include: {
            roles: { select: { role: { select: { id: true, roleName: true } } } },
            branches: { select: { branch: { select: { id: true, branchName: true } } } }
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // filter
    const filter = req?.query?.filter;
    const activeStatuses = ['pending', 'ongoing', 'completed', 'forRelease'];

    let filteredJobOrders = customer.jobOrders;
    if (filter === "active") {
      filteredJobOrders = customer.jobOrders.filter(jo =>
        activeStatuses.includes(jo.status)
      );
    } else if (filter === "archived") {
      filteredJobOrders = customer.jobOrders.filter(jo => jo.status === "archived");
    }

    // count
    const activeCount = customer.jobOrders.filter(jo =>
      activeStatuses.includes(jo.status)
    ).length;
    const archivedCount = customer.jobOrders.filter(
      jo => jo.status === "archived"
    ).length;

    // Get all job order codes
    const jobOrderCodes = customer.jobOrders.map(jo => jo.jobOrderCode);

    // Get all related transactions for these job orders
    const transactions = await prisma.transaction.groupBy({
      by: ['jobOrderCode'],
      _sum: { amount: true },
      where: { jobOrderCode: { in: jobOrderCodes } }
    });

    const transactionMap = transactions.reduce((acc, t) => {
      acc[t.jobOrderCode] = Number(t._sum.amount) || 0;
      return acc;
    }, {});

    // map job orders
    const jobOrders = filteredJobOrders.map(jo => {
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
        balance
      };
    });

    // summary totals
    const grandTotalBill = jobOrders.reduce((sum, jo) => sum + Number(jo.totalBill), 0);
    const totalTransactions = jobOrders.reduce((sum, jo) => sum + Number(jo.totalPaid), 0);
    const totalBalance = grandTotalBill - totalTransactions;

    // Clean response
    const cleanCustomer = {
      ...customer,
      user: customer.user
        ? {
            id: customer.user.id,
            customerId: req.params.id,
            fullName: customer.user.fullName,
            username: customer.user.username,
            email: customer.user.email,
            phone: customer.user.phone,
            createdAt: customer.user.createdAt,
            roles: customer.user.roles.map(r => ({
              roleId: r.role.id,
              roleName: r.role.roleName
            })),
            branches: customer.user.branches.map(b => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName
            }))
          }
        : null,
      jobOrders: jobOrders,
      trucks: customer.trucks.map(t => ({
        truckId: t.truck.id,
        createdAt: t.truck.createdAt,
        plate: t.truck.plate,
        model: t.truck.model,
        make: t.truck.make
      })),
      jobOrderSummary: { activeCount, archivedCount, grandTotalBill, totalBalance, totalTransactions }
    };

    res.status(200).json({ data: cleanCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { getCustomer }
