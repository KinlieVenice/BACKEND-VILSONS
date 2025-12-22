const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { branchFilter } = require("../../../utils/filters/branchFilter"); 
const { job } = require("../../../utils/persistentScheduler");


const getRevenue = async (req, res) => {
  try {
    let { month, year, branch } = req.query;
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
      const baseWhere = { createdAt: { gte: startDate, lt: endDate } };

      // Add branch filter only if branch is provided
      const where = branch ? { ...baseWhere, branchId: branch } : baseWhere;

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

// accrual-based profit.
const getProfitAccrual = async (req, res) => {
  try {
    let { month, year, branch } = req.query;

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
      const baseWhere = { createdAt: { gte: startDate, lt: endDate } };

      // Add branch filter only if branch is provided
      const where = branch ? { ...baseWhere, branchId: branch } : baseWhere;
      const materialWhere = branch ? { ...baseWhere, jobOrder: { branchId: branch } } : baseWhere;

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

      const materials = await tx.material.findMany({ where: materialWhere });
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

// cash-based profit
const getProfit = async (req, res) => {
  try {
    let { month, year, branch } = req.query;

    const now = new Date();
    year = year ? parseInt(year, 10) : now.getFullYear();
    month = month ? parseInt(month, 10) - 1 : now.getMonth();

    // Determine period (monthly or yearly)
    let startDate, endDate;
    if (req.query.year && !req.query.month) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    }

    // Base filter for date
    const baseDateWhere = { createdAt: { gte: startDate, lt: endDate } };
    const branchFilter = branch ? { branchId: branch } : {};

    const result = await prisma.$transaction(async (tx) => {
      // Received revenue (transactions)
      const transactions = await tx.transaction.findMany({
        where: { ...baseDateWhere, ...branchFilter },
      });
      const totalRevenueReceived = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      // Expenses
      const materials = await tx.material.findMany({
        where: { jobOrder: { ...baseDateWhere, ...branchFilter } },
      });
      const totalMaterials = materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      const overheads = await tx.overhead.findMany({
        where: { ...baseDateWhere, ...branchFilter },
      });
      const totalOverheads = overheads.reduce(
        (sum, o) => sum + Number(o.amount),
        0
      );

      const equipments = await tx.equipment.findMany({
        where: { ...baseDateWhere, ...branchFilter },
      });
      const totalEquipments = equipments.reduce(
        (sum, e) => sum + Number(e.price) * Number(e.quantity),
        0
      );

      const employeePays = await tx.employeePay.findMany({
        where: { ...baseDateWhere, ...branchFilter },
        include: { payComponents: true },
      });
      const totalEmployeePays = employeePays.reduce((sum, emp) => {
        const componentsTotal = emp.payComponents.reduce(
          (cSum, pc) => cSum + Number(pc.amount),
          0
        );
        return sum + componentsTotal;
      }, 0);

      const contractorPays = await tx.contractorPay.findMany({
        where: { ...baseDateWhere, ...branchFilter },
      });
      const totalContractorPays = contractorPays.reduce(
        (sum, c) => sum + Number(c.amount),
        0
      );

      const totalExpenses =
        totalMaterials +
        totalOverheads +
        totalEquipments +
        totalEmployeePays +
        totalContractorPays;

      const grossProfit = totalRevenueReceived - totalExpenses;

      return { grossProfit, totalRevenueReceived, totalExpenses };
    });

    return res.status(200).json({
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
    let { month, year, branch } = req.query;

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
      const baseWhere = { createdAt: { gte: startDate, lt: endDate } };

      // Add branch filter only if branch is provided
      const where = branch ? { ...baseWhere, branchId: branch } : baseWhere;
      const materialWhere = branch ? { ...baseWhere, jobOrder: { branchId: branch } } : baseWhere;

      const materials = await tx.material.findMany({ where: materialWhere });
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
    let { month, year, branch } = req.query;

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

    // Build base where clause for date filtering
    const baseDateWhere = {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    };

    // Add branch filter if provided
    const dateAndBranchWhere = branch
      ? { ...baseDateWhere, branchId: branch }
      : baseDateWhere;

    // Find customers - you may also want to filter customers by branch if they have branch association
    const customers = await prisma.customer.findMany({
      include: {
        jobOrders: {
          where: dateAndBranchWhere, // Apply date and branch filter to job orders
          select: {
            jobOrderCode: true,
            labor: true,
            branchId: true, // Include branchId to verify filtering
            materials: {
              select: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });
    let totalBalanceAllCustomers = 0;

    for (const customer of customers) {
      // Filter job orders (in case customer has job orders from multiple branches)
      const customerJobOrders = customer.jobOrders;

      const jobOrders = customerJobOrders.map((jo) => {
        const totalMaterials = jo.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
        return Number(jo.labor) + totalMaterials;
      });

      const grandTotalBill = jobOrders.reduce((sum, bill) => sum + bill, 0);
      const jobOrderCodes = customerJobOrders.map((jo) => jo.jobOrderCode);

      // Skip if no job orders for this customer in the filtered period/branch
      if (jobOrderCodes.length === 0) continue;

      const totalTransactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          jobOrderCode: { in: jobOrderCodes },
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          // Also filter transactions by branch if branch filter is applied
          ...(branch && { branchId: branch }),
        },
      });

      const paidAmount = totalTransactions._sum.amount || 0;
      const totalBalance = grandTotalBill - paidAmount;

      totalBalanceAllCustomers += totalBalance;
    }

    return res.status(200).json({
      totalBalanceAllCustomers,
      branch: branch || null,
      year,
      month: req.query.year && !req.query.month ? undefined : month + 1,
      type: req.query.year && !req.query.month ? "yearly" : "monthly",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// accrual basis
const getRevenueAndProfitChartAccrual = async (req, res) => {
  try {
    // Default: current year and monthly view
    const now = new Date();
    let { year, type, branch } = req.query;
    year = year ? parseInt(year, 10) : now.getFullYear();
    type = type || "monthly";

    // Determine earliest and latest years based on available transaction data
    const [minDateResult, maxDateResult] = await prisma.$transaction([
      prisma.transaction.aggregate({
        _min: { createdAt: true },
        ...(branch && { where: { branchId: branch } }),
      }),
      prisma.transaction.aggregate({
        _max: { createdAt: true },
        ...(branch && { where: { branchId: branch } }),
      }),
    ]);

    const earliestDate =
      minDateResult._min.createdAt || new Date(now.getFullYear(), 0, 1);
    const latestDate = maxDateResult._max.createdAt || now;

    const earliestYear = earliestDate.getFullYear();
    const latestYear = latestDate.getFullYear();

    // Define date range depending on selected type (monthly or yearly)
    const startDate =
      type === "monthly" ? new Date(year, 0, 1) : new Date(earliestYear, 0, 1);
    const endDate =
      type === "monthly"
        ? new Date(year + 1, 0, 1)
        : new Date(latestYear + 1, 0, 1);

    // Build base where clause with optional branch filter
    const baseWhere = { createdAt: { gte: startDate, lt: endDate } };
    const whereWithBranch = branch
      ? { ...baseWhere, branchId: branch }
      : baseWhere;
    const materialWhere = branch ? { ...baseWhere, jobOrder: { branchId: branch } } : baseWhere;

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
        where: whereWithBranch,
        select: { amount: true, createdAt: true },
      }),
      prisma.otherIncome.findMany({
        where: whereWithBranch,
        select: { amount: true, createdAt: true },
      }),
      prisma.material.findMany({
        where: materialWhere,
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.overhead.findMany({
        where: whereWithBranch,
        select: { amount: true, createdAt: true },
      }),
      prisma.equipment.findMany({
        where: whereWithBranch,
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.employeePay.findMany({
        where: whereWithBranch,
        include: { payComponents: true },
      }),
      prisma.contractorPay.findMany({
        where: whereWithBranch,
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
    transactions.forEach((t) =>
      addValue(t.createdAt, "revenue", Number(t.amount || 0))
    );
    otherIncomes.forEach((t) =>
      addValue(t.createdAt, "revenue", Number(t.amount || 0))
    );
    materials.forEach((m) =>
      addValue(
        m.createdAt,
        "materials",
        Number(m.price || 0) * Number(m.quantity || 0)
      )
    );
    equipments.forEach((e) =>
      addValue(
        e.createdAt,
        "equipments",
        Number(e.price || 0) * Number(e.quantity || 0)
      )
    );
    overheads.forEach((o) =>
      addValue(o.createdAt, "overheads", Number(o.amount || 0))
    );
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
              label: new Date(year, m).toLocaleString("default", {
                month: "short",
              }),
              revenue: 0,
              profit: 0,
            }
          );
        }
      }
    } else {
      // YEARLY: Get current year and up to 9 prior years, but only if they have data or are within the current year range
      const currentYear = now.getFullYear();
      const startYear = Math.max(earliestYear, currentYear - 9); // Don't go earlier than 10 years back from current

      for (let y = startYear; y <= currentYear; y++) {
        const key = y.toString();
        const existing = map.get(key);
        filledData.push(
          existing || { label: y.toString(), revenue: 0, profit: 0 }
        );
      }
    }

    // Return final dataset
    return res.json({
      data: {
        type,
        year: type === "monthly" ? year : undefined,
        branch: branch || null,
        chart: filledData,
      },
    });
  } catch (err) {
    console.log("getRevenueAndProfitChart error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// cash basis
const getRevenueAndProfitChart = async (req, res) => {
  try {
    const now = new Date();
    let { year, type, branch } = req.query;
    year = year ? parseInt(year, 10) : now.getFullYear();
    type = type || "monthly";

    // Determine earliest and latest transaction dates
    const [minDateResult, maxDateResult] = await prisma.$transaction([
      prisma.transaction.aggregate({
        _min: { createdAt: true },
        ...(branch && { where: { branchId: branch } }),
      }),
      prisma.transaction.aggregate({
        _max: { createdAt: true },
        ...(branch && { where: { branchId: branch } }),
      }),
    ]);

    const earliestDate =
      minDateResult._min.createdAt || new Date(now.getFullYear(), 0, 1);
    const latestDate = maxDateResult._max.createdAt || now;
    const earliestYear = earliestDate.getFullYear();
    const latestYear = latestDate.getFullYear();

    // Define date range
    const startDate =
      type === "monthly" ? new Date(year, 0, 1) : new Date(earliestYear, 0, 1);
    const endDate =
      type === "monthly"
        ? new Date(year + 1, 0, 1)
        : new Date(latestYear + 1, 0, 1);

    const baseWhere = { createdAt: { gte: startDate, lt: endDate } };
    const branchFilter = branch ? { branchId: branch } : {};
    const materialWhere = branch
      ? { ...baseWhere, jobOrder: { branchId: branch } }
      : baseWhere;

    // Fetch all relevant records
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
        where: { ...baseWhere, ...branchFilter },
        select: { amount: true, createdAt: true },
      }),
      prisma.otherIncome.findMany({
        where: { ...baseWhere, ...branchFilter },
        select: { amount: true, createdAt: true },
      }),
      prisma.material.findMany({
        where: materialWhere,
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.overhead.findMany({
        where: { ...baseWhere, ...branchFilter },
        select: { amount: true, createdAt: true },
      }),
      prisma.equipment.findMany({
        where: { ...baseWhere, ...branchFilter },
        select: { price: true, quantity: true, createdAt: true },
      }),
      prisma.employeePay.findMany({
        where: { ...baseWhere, ...branchFilter },
        include: { payComponents: true },
      }),
      prisma.contractorPay.findMany({
        where: { ...baseWhere, ...branchFilter },
        select: { amount: true, createdAt: true },
      }),
    ]);

    const getKey = (date) =>
      type === "monthly"
        ? `${year}-${new Date(date).getMonth()}`
        : new Date(date).getFullYear().toString();
    const getLabel = (date) =>
      type === "monthly"
        ? new Date(date).toLocaleString("default", { month: "short" })
        : new Date(date).getFullYear().toString();

    const map = new Map();
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

    // Only include **received revenue**
    transactions.forEach((t) =>
      addValue(t.createdAt, "revenue", Number(t.amount || 0))
    );
    otherIncomes.forEach((t) =>
      addValue(t.createdAt, "revenue", Number(t.amount || 0))
    );

    materials.forEach((m) =>
      addValue(
        m.createdAt,
        "materials",
        Number(m.price || 0) * Number(m.quantity || 0)
      )
    );
    equipments.forEach((e) =>
      addValue(
        e.createdAt,
        "equipments",
        Number(e.price || 0) * Number(e.quantity || 0)
      )
    );
    overheads.forEach((o) =>
      addValue(o.createdAt, "overheads", Number(o.amount || 0))
    );

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

    // Calculate cash-based profit
    for (const [key, item] of map.entries()) {
      const { materials, equipments, overheads, labor } = item._tmp;
      const totalOperational = materials + equipments + labor;
      item.profit =
        item.revenue -
        (item._tmp.materials +
          item._tmp.equipments +
          item._tmp.labor +
          item._tmp.overheads);
      delete item._tmp;
    }

    // Fill in missing months/years
    const filledData = [];
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    if (type === "monthly") {
      for (let m = 0; m < 12; m++) {
        if (year < nowYear || (year === nowYear && m <= nowMonth)) {
          const key = `${year}-${m}`;
          const existing = map.get(key);
          filledData.push(
            existing || {
              label: new Date(year, m).toLocaleString("default", {
                month: "short",
              }),
              revenue: 0,
              profit: 0,
            }
          );
        }
      }
    } else {
      const currentYear = now.getFullYear();
      const startYear = Math.max(earliestYear, currentYear - 9);
      for (let y = startYear; y <= currentYear; y++) {
        const key = y.toString();
        const existing = map.get(key);
        filledData.push(
          existing || { label: y.toString(), revenue: 0, profit: 0 }
        );
      }
    }

    return res.json({
      data: {
        type,
        year: type === "monthly" ? year : undefined,
        branch: branch || null,
        chart: filledData,
      },
    });
  } catch (err) {
    console.log("getRevenueAndProfitChart error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};


// ...existing code...
const getRecentJobOrders = async (req, res) => {
  const branch = req?.query?.branch;
  try {
    const baseWhere = {
      ...branchFilter("jobOrder", branch, req.branchIds),
      status: { not: "archived" },
    };

    // Recent 5 job orders
    const recentPromise = prisma.jobOrder.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        transactions: true,
        truck: { select: { id: true, plate: true } },
        customer: { select: { id: true, userId: true, user: { select: { fullName: true } } } },
        contractor: { select: { id: true, userId: true, user: { select: { fullName: true } } } },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { price: true, quantity: true } },
      },
    });

    // Counts per status (apply same branch filter)
    const statuses = ["pending", "ongoing", "completed", "forRelease"];
    const countPromises = statuses.map((s) =>
      prisma.jobOrder.count({ where: { ...baseWhere, status: s } })
    );

    const [recentJobs, ...countsArr] = await Promise.all([recentPromise, ...countPromises]);

    const counts = {};
    statuses.forEach((s, i) => (counts[s] = countsArr[i] || 0));

    const result = recentJobs.map((job) => {
      let contractorCommission = 0,
        shopCommission = 0,
        totalTransactions = 0,
        totalMaterialCost = 0;

      if (job.contractor && job.labor) {
        contractorCommission = Number(job.labor) * Number(job.contractorPercent || 0);
        shopCommission = Number(job.labor) - contractorCommission;
      }

      if (job.materials?.length) {
        totalMaterialCost = job.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
      }

      if (job.transactions?.length) {
        totalTransactions = job.transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      }

      const totalBill = Number(job.labor || 0) + Number(totalMaterialCost || 0);

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
        balance: Number(totalBill) - Number(totalTransactions),
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    return res.status(200).json({ data: { recent: result, counts } });
  } catch (err) {
    console.log("getRecentJobOrders error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRevenue,
  getProfit,
  getExpenses,
  getCustomerBalance,
  getRecentJobOrders,
  getRevenueAndProfitChart,
  getRecentJobOrders,
};