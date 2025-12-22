const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getDateRangeFilter } = require("../../utils/filters/dateRangeFilter");
const bcrypt = require("bcrypt");

const getAllMyJobOrders = async (req, res) => {
  const statusGroup = req?.params?.statusGroup; // 'active' or 'archived'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;

  let where = {};

  // Status group filter
  if (statusGroup === "active") {
    where.status = { in: ["pending", "ongoing", "completed", "forRelease"] };
  } else if (statusGroup === "archived") {
    where.status = "archived";
  } else if (statusGroup) {
    return res.status(200).json({
      data: { jobOrders: [] },
      pagination: { totalItems: 0, totalPages: 0, currentPage: 1 },
    });
  }

  // Override status if specific query status is provided
  if (status) {
    where.status = status;
  }

  // Search filter
  if (search) {
    const searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      {
        truck: {
          OR: [
            { plate: { contains: searchValue } },
            { make: { contains: searchValue } },
            { model: { contains: searchValue } },
          ],
        },
      },
    ];
  }

  // Date range filter
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    
    const customer = await prisma.customer.findFirst({
      where: { userId: req.id },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const totalItems = await prisma.jobOrder.count({
      where: { customerId: customer.id, ...where },
    });

    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const jobOrders = await prisma.jobOrder.findMany({
      where: { customerId: customer.id, ...where },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        transactions: { select: { amount: true } },
        truck: { select: { id: true, plate: true } },
        branch: { select: { id: true, branchName: true } },
        contractor: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        materials: { select: { price: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = jobOrders.map((job) => {
      const totalMaterialCost =
        job.materials?.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        ) || 0;

      const totalTransactions =
        job.transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const laborCost = Number(job.labor) || 0;
      const totalBill = laborCost + totalMaterialCost;
      const totalBalance = totalBill - totalTransactions;

      return {
        id: job.id,
        jobOrderCode: job.jobOrderCode,
        status: job.status,
        plateNumber: job.truck?.plate || null,
        truckId: job.truck?.id || null,
        branchId: job.branch?.id || null,
        branchName: job.branch?.branchName || null,
        labor: laborCost,
        totalBill,
        totalBalance,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    return res.status(200).json({
      data: { jobOrders: result },
      pagination: {
        totalItems,
        totalPages,
        currentPage: page || 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const getMyJobOrder = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Job Order ID is required" });
  }

  try {
    const jobOrderInclude = {
      truck: true,
      transactions: true,
      customer: { include: { user: true } },
      contractor: { include: { user: true } },
      branch: { select: { id: true, branchName: true } },
      materials: {
        select: { id: true, materialName: true, quantity: true, price: true },
      },
      images: true,
    };

    // Verify that the user is the customer of this job order
    const jobOrder = await prisma.jobOrder.findFirst({
      where: {
        id: req.params.id,
        customer: { userId: req.id },
      },
      include: jobOrderInclude,
    });

    if (!jobOrder) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this Job Order" });
    }

    let contractorCommission = 0,
      shopCommission = 0,
      totalTransactions = 0,
      totalMaterialCost = 0;

    // calculate commissions
    if (jobOrder.labor && jobOrder.contractorPercent) {
      contractorCommission =
        Number(jobOrder.labor) * Number(jobOrder.contractorPercent);
      shopCommission = Number(jobOrder.labor) - contractorCommission;
    }

    // sum transactions
    if (jobOrder.transactions?.length) {
      totalTransactions = jobOrder.transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
    }

    // process materials and totalMaterialCost
    const processedMaterials = (jobOrder.materials || []).map((m) => {
      const total = Number(m.price) * Number(m.quantity);
      totalMaterialCost += total;
      return { ...m, total };
    });

    const totalBill =
      Number(shopCommission) + Number(contractorCommission) + totalMaterialCost;
    const balance = totalBill - totalTransactions;

    return res.status(200).json({
      data: {
        id: jobOrder.id,
        jobOrderCode: jobOrder.jobOrderCode,
        status: jobOrder.status,
        plate: jobOrder.truck?.plate,
        make: jobOrder.truck?.make,
        model: jobOrder.truck?.model,
        truckId: jobOrder.truck?.id,
        customerId: jobOrder.customer?.id,
        customerUserId: jobOrder.customer?.user?.id,
        customerName: jobOrder.customer?.user?.fullName,
        customerUsername: jobOrder.customer?.user?.username,
        customerEmail: jobOrder.customer?.user?.email || null,
        customerPhone: jobOrder.customer?.user?.phone || null,
        branchId: jobOrder.branch?.id || null,
        branchName: jobOrder.branch?.branchName || null,
        labor: Number(jobOrder.labor) || 0,
        totalBill,
        balance,
        description: jobOrder.description,
        createdAt: jobOrder.createdAt,
        updatedAt: jobOrder.updatedAt,
        createdBy: jobOrder.createdByUser,
        updatedBy: jobOrder.updatedByUser,
        totalLabor: contractorCommission + shopCommission,
        totalMaterialCost,
        materials: processedMaterials,
        images: jobOrder.images.reduce((acc, image) => {
          const type = image.type || "unknown";
          if (!acc[type]) acc[type] = [];
          acc[type].push(image);
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error("getMyJobOrder error:", err);
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { getAllMyJobOrders, getMyJobOrder }