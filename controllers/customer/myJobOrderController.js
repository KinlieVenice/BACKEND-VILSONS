const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getDateRangeFilter } = require("../../utils/filters/dateRangeFilter");
const bcrypt = require("bcrypt");


// CUSTOMER
const getAllMyJobOrdersOld = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
    ];
  }

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

    const jobOrder = await prisma.jobOrder.findMany({
      where: {
        customerId: customer.id,
        ...where,
      },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        truck: { select: { id: true, plate: true } },
        customer: {
          include: { user: { select: { username: true, fullName: true } } },
        },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { materialName: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job Orders not found" });
    }

    return res.status(200).json({ data: jobOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllMyJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;

  let where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
    ];
  }

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

    const jobOrders = await prisma.jobOrder.findMany({
      where: {
        customerId: customer.id,
        ...where,
      },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        transactions: { select: { amount: true } },
        truck: { select: { id: true, plate: true } },
        customer: {
          include: { user: { select: { username: true, fullName: true } } },
        },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { materialName: true, price: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!jobOrders.length) {
      return res.status(404).json({ message: "Job Orders not found" });
    }

    // Compute totalBill and totalBalance
    const result = jobOrders.map((job) => {
      const totalMaterialCost = job.materials?.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      ) || 0;

      const totalTransactions = job.transactions?.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      ) || 0;

      const laborCost = Number(job.labor) || 0;
      const totalBill = laborCost + totalMaterialCost;
      const totalBalance = totalBill - totalTransactions;

      return {
        ...job,
        totalBill,
        totalBalance,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// CUSTOMER
const getMyJobOrder = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Job Order ID is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { userId: req.id },
      });

      if (!customer)
        return res.status(400).json({ message: "You must be a customer" });

      // Step 2: Find the job order with params.id AND customerId
      const jobOrder = await tx.jobOrder.findFirst({
        where: {
          id: req.params.id, // only this job order
          customerId: customer.id,
        },
        include: {
          truck: { select: { id: true, plate: true } },
          customer: {
            include: { user: { select: { username: true, fullName: true } } },
          },
          branch: { select: { id: true, branchName: true } },
          materials: { select: { materialName: true, quantity: true } },
        },
      });

      return jobOrder;
    });

    if (!result) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this Job Order" });
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMyJobOrders, getMyJobOrder }