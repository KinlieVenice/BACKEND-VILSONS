const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getRevenue = async (req, res) => {
  try {
    let { month, year } = req.query;

    // default to current date if not provided
    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();
    month = month ? parseInt(month, 10) - 1 : now.getMonth(); // default to current month if not provided

    // always use monthly range unless explicitly requesting yearly
    let startDate, endDate;
    if (req.query.year && !req.query.month) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      const where = { createdAt: { gte: startDate, lt: endDate } };

      const transactions = await tx.transaction.findMany({ where });
      const otherIncomes = await tx.otherIncome.findMany({ where });

      const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalOtherIncomes = otherIncomes.reduce((sum, t) => sum + Number(t.amount), 0);

      return { totalRevenue: totalTransactions + totalOtherIncomes };
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
  
const getProfit = async (req, res) => {
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

      return { grossProfit: totalRevenue - (totalOperationals - totalOverheads) };
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

const getExpenses = async (req, res) => {
  try {
    let { month, year } = req.query;

    // Default to current date if not provided
    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();
    month = month ? parseInt(month, 10) - 1 : now.getMonth();

    // Determine if query is yearly or monthly
    let startDate, endDate;
    if (req.query.year && !req.query.month) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      const where = { createdAt: { gte: startDate, lt: endDate } };

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

      const totalLabor = totalEmployeePays + totalContractorPays;
      const totalOperationals =
        totalMaterials + totalEquipmments + totalLabor;
      const totalExpenses = totalOverheads + totalOperationals;

      return {
        totalExpenses,
        totalOperationals,
        totalLabor,
        totalEmployeePays,
        totalContractorPays,
        totalMaterials,
        totalEquipmments,
        totalOverheads,
      };
    });

    // helper to build tree structure
    const makeNode = (label, value, children = []) => ({
      label,
      value,
      ...(children.length ? { children } : {}),
    });

    const expenseTree = makeNode("Expenses", result.totalExpenses, [
      makeNode("Operational Expenses", result.totalOperationals, [
        makeNode("Material Expenses", result.totalMaterials),
        makeNode("Equipment Expenses", result.totalEquipmments),
        makeNode("Labor Expenses", result.totalLabor, [
          makeNode("Employee Pays", result.totalEmployeePays),
          makeNode("Contractor Pays", result.totalContractorPays),
        ]),
      ]),
      makeNode("Overhead Expenses", result.totalOverheads),
    ]);

    return res.json({
      data: expenseTree,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getCustomerBalance = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        jobOrder: {
          select: {
            jobOrderCode: true,
            labor: true,
            materials: { select: { price: true, quantity: true } },
          },
        },
      },
    });

    if (!customers.length) {
      return res.status(404).json({ message: "No customers found" });
    }

    let totalBalanceAllCustomers = 0;

    for (const customer of customers) {
      const jobOrders = customer.jobOrder.map((jo) => {
        const totalMaterials = jo.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
        return Number(jo.labor) + totalMaterials;
      });

      const grandTotalBill = jobOrders.reduce((sum, bill) => sum + bill, 0);
      const jobOrderCodes = customer.jobOrder.map((jo) => jo.jobOrderCode);

      const totalTransactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { jobOrderCode: { in: jobOrderCodes } },
      });

      const paidAmount = totalTransactions._sum.amount || 0;
      const totalBalance = grandTotalBill - paidAmount;

      totalBalanceAllCustomers += totalBalance;
    }

    return res.status(200).json({ totalBalanceAllCustomers });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { getRevenue, getProfit, getExpenses, getCustomerBalance }