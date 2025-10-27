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
        jobOrders: {
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
      const jobOrders = customer.jobOrders.map((jo) => {
        const totalMaterials = jo.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
        return Number(jo.labor) + totalMaterials;
      });

      const grandTotalBill = jobOrders.reduce((sum, bill) => sum + bill, 0);
      const jobOrderCodes = customer.jobOrders.map((jo) => jo.jobOrderCode);

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

const getRecentJobOrders = async (req, res) => {
  try {
    // Fetch all job orders
    const jobOrders = await prisma.jobOrder.findMany({
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

    // Get 5 most recent job orders
    const recentJobOrders = jobOrders.slice(0, 5).map((jo) => {
      const labor = Number(jo.labor) || 0;
      const percent = Number(jo.contractorPercent) || 0;

      return {
        id: jo.id,
        jobOrderCode: jo.jobOrderCode,
        plate: jo.truck?.plate || "N/A",
        contractorPercent: percent,
        contractorCommission: labor * percent, // contractor’s share
        shopCommission: labor - labor * percent, // company’s remaining share
        status: jo.status,
        createdAt: jo.createdAt,
      };
    });

    // Count job orders by status
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

    // Return both
    return res.status(200).json({
      recentJobOrders,
      statusCounts,
    });
  } catch (err) {
    console.error("Error fetching recent job orders:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getRevenueAndProfitChart = async (req, res) => {
  try {
    // Default: current year and monthly view
    const now = new Date();
    let { year, type } = req.query;
    year = year ? parseInt(year, 10) : now.getFullYear();
    type = type || "monthly";

    // Determine earliest and latest years based on available transaction data
    const [minDateResult, maxDateResult] = await prisma.$transaction([
      prisma.transaction.aggregate({ _min: { createdAt: true } }),
      prisma.transaction.aggregate({ _max: { createdAt: true } }),
    ]);

    const earliestDate = minDateResult._min.createdAt || new Date(now.getFullYear(), 0, 1);
    const latestDate = maxDateResult._max.createdAt || now;

    const earliestYear = earliestDate.getFullYear();
    const latestYear = latestDate.getFullYear();

    // Define date range depending on selected type (monthly or yearly)
    const startDate =
      type === "monthly" ? new Date(year, 0, 1) : new Date(earliestYear, 0, 1);
    const endDate =
      type === "monthly" ? new Date(year + 1, 0, 1) : new Date(latestYear + 1, 0, 1);

    // Retrieve all relevant financial records within the date range
    const [
      transactions,
      otherIncomes,
      materials,
      overheads,
      equipments,
      employeePays,
      contractorPays,
    ] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { amount: true, createdAt: true },
      }),
      prisma.otherIncome.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { amount: true, createdAt: true },
      }),
      prisma.material.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.overhead.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { amount: true, createdAt: true },
      }),
      prisma.equipment.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.employeePay.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        include: { payComponents: true },
      }),
      prisma.contractorPay.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: { amount: true, createdAt: true },
      }),
    ]);

    // Helper to determine grouping key (by month or by year)
    const getKey = (date) =>
      type === "monthly"
        ? `${year}-${new Date(date).getMonth()}`
        : new Date(date).getFullYear().toString();

    // Helper to determine display label (month name or year)
    const getLabel = (date) =>
      type === "monthly"
        ? new Date(date).toLocaleString("default", { month: "short" })
        : new Date(date).getFullYear().toString();

    // Map used to store aggregated results by month or year
    const map = new Map();

    // Function to add values to the corresponding month/year
    const addValue = (date, field, value) => {
      const key = getKey(date);
      if (!map.has(key)) {
        map.set(key, {
          label: getLabel(date),
          revenue: 0,
          profit: 0,
          _tmp: { materials: 0, equipments: 0, overheads: 0, labor: 0 },
        });
      }
      const entry = map.get(key);
      if (field === "revenue") entry.revenue += value;
      else entry._tmp[field] += value;
    };

    // Aggregate revenue and expenses
    transactions.forEach((t) => addValue(t.createdAt, "revenue", Number(t.amount || 0)));
    otherIncomes.forEach((t) => addValue(t.createdAt, "revenue", Number(t.amount || 0)));
    materials.forEach((m) =>
      addValue(m.createdAt, "materials", Number(m.price || 0) * Number(m.quantity || 0))
    );
    equipments.forEach((e) =>
      addValue(e.createdAt, "equipments", Number(e.price || 0) * Number(e.quantity || 0))
    );
    overheads.forEach((o) => addValue(o.createdAt, "overheads", Number(o.amount || 0)));
    employeePays.forEach((ep) => {
      const totalComponents = ep.payComponents.reduce(
        (sum, pc) => sum + Number(pc.amount || 0),
        0
      );
      addValue(ep.createdAt, "labor", totalComponents);
    });
    contractorPays.forEach((cp) =>
      addValue(cp.createdAt, "labor", Number(cp.amount || 0))
    );

    // Calculate profit for each month or year
    for (const [key, item] of map.entries()) {
      const { materials, equipments, overheads, labor } = item._tmp;
      const totalOperational = materials + equipments + labor;
      item.profit = item.revenue - (totalOperational - overheads);
      delete item._tmp;
    }

    // Generate a complete dataset with zeroes for missing months or years
    const filledData = [];
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    if (type === "monthly") {
      // Fill in all months up to the current month for the selected year
      for (let m = 0; m < 12; m++) {
        if (year < nowYear || (year === nowYear && m <= nowMonth)) {
          const key = `${year}-${m}`;
          const existing = map.get(key);
          filledData.push(
            existing || {
              label: new Date(year, m).toLocaleString("default", { month: "short" }),
              revenue: 0,
              profit: 0,
            }
          );
        }
      }
    } else {
      // Fill in all years from the earliest to the latest year available
      for (let y = earliestYear; y <= latestYear; y++) {
        if (y < nowYear || y === nowYear) {
          const key = y.toString();
          const existing = map.get(key);
          filledData.push(existing || { label: y.toString(), revenue: 0, profit: 0 });
        }
      }
    }

    // Return final dataset
    return res.json({
      data: {
        type,
        year: type === "monthly" ? year : undefined,
        chart: filledData,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { getRevenue, getProfit, getExpenses, getCustomerBalance, getRecentJobOrders, getRevenueAndProfitChart }