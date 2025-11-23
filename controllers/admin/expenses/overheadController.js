const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../../utils/filters/monthYearFilter");
const { requestApproval } = require("../../../utils/services/approvalService");
const { logActivity } = require("../../../utils/services/activityService.js");


/*
  description String
  amount      Decimal @db.Decimal(13, 2)
  branchId    String
*/

const createOverhead = async (req, res) => {
  const { description, amount, branchId, isMonthly } = req.body;
  if (!description || !amount || !branchId)
    return res
      .status(400)
      .json({ message: "Description, amount, and branchId required" });

  try {
    const needsApproval = req.approval;
    let message;
    const overheadData = {
      description,
      amount,
      branchId,
      isMonthly: isMonthly ?? false,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const overhead = needsApproval
        ? await requestApproval('overhead', null, 'create', overheadData, req.username)
        : await tx.overhead.create({
            data: overheadData,
          });

      message = needsApproval
        ? "Overhead is awaiting approval"
        : "Overhead is successfully created";

      return overhead;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} created Overhead ${overheadData.description}`
        : `${req.username} created Overhead ${overheadData.description}`,
    );
    
    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editOverhead = async (req, res) => {
  const { description, amount, branchId, isMonthly, remarks } = req.body;
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const overhead = await prisma.overhead.findFirst({
      where: { id: req.params.id },
    });
    if (!overhead)
      return res.status(404).json({
        message: `Overhead with id: ${req.params.id} does not exist`,
      });

    const needsApproval = req.approval;
    let message;
    const overheadData = {
      description: description ?? overhead.description,
      amount: amount ?? overhead.amount,
      branchId: branchId ?? overhead.branchId,
      isMonthly: isMonthly ?? overhead.isMonthly,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedOverhead = needsApproval
        ? await requestApproval('overhead', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
        : await tx.overhead.update({
            where: { id: overhead.id },
            data: overheadData,
          });

      message = needsApproval
        ? "Overhead edit awaiting approval"
        : "Overhead edited successfully";

      return editedOverhead;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} edited Overhead ${overheadData.description}`
        : `${req.username} edited Overhead ${overheadData.description}`,
      remarks
    );

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteOverhead = async (req, res) => {
  if (!req.params.id) return res.status(404).json({ message: "Id is required" });

  try {
    const overhead = await prisma.overhead.findFirst({
      where: { id: req.params.id },
    });
    if (!overhead)
      return res
        .status(404)
        .json({ message: `Overhead with id: ${req.params.id.id} not found` });

    const needsApproval = req.approval;
    let message;

    const result = await prisma.$transaction(async (tx) => {
      const deletedOverhead = needsApproval
        ? await requestApproval( "overhead", overhead.id, "delete", overhead, req.username)
        : await tx.overhead.delete({
            where: { id: overhead.id },
          });

      message = needsApproval
        ? "Overhead delete awaiting approval"
        : "Overhead deleted successfully";

      return deletedOverhead;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} deleted Overhead ${overheadData.description}`
        : `${req.username} deleted Overhead ${overheadData.description}`
    );

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllOverheads = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  const isMonthly = req.originalUrl.includes("/monthly");

  let where = {
    createdAt: { gte: startDate, lt: endDate },
  };

  // Branch filter
  if (branch) {
    let branchValue = branch.trim().replace(/^["']|["']$/g, "");
    where.branchId = branchValue;
  } else if (req.branchIds?.length) {
    where.branchId = { in: req.branchIds };
  }

  // Search filter
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [{ description: { contains: searchValue } }];
  }

  try {
    let overheads;

    if (isMonthly) {
      // Step 1: Get all overheads (without isMonthly filter first)
      const allOverheads = await prisma.overhead.findMany({
        where, // This includes date range, branch, search filters but NOT isMonthly
        include: {
          branch: { select: { id: true, branchName: true, address: true } },
        },
        orderBy: {
          createdAt: "desc", // Order by latest first
        },
      });

      // Step 2: Filter to get only the latest record for each description
      const uniqueOverheads = new Map();

      allOverheads.forEach((overhead) => {
        const description = overhead.description?.toLowerCase().trim();

        // If we haven't seen this description before, or if this record is newer
        if (
          !uniqueOverheads.has(description) ||
          new Date(overhead.createdAt) >
            new Date(uniqueOverheads.get(description).createdAt)
        ) {
          uniqueOverheads.set(description, overhead);
        }
      });

      // Step 3: Now filter by isMonthly=true from the unique records
      overheads = Array.from(uniqueOverheads.values()).filter(
        (overhead) => overhead.isMonthly === true
      );

      // Apply pagination manually after all filtering
      if (page && limit) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        overheads = overheads.slice(startIndex, endIndex);
      } else if (limit) {
        overheads = overheads.slice(0, limit);
      }
    } else {
      // Original logic for non-monthly requests
      overheads = await prisma.overhead.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          branch: { select: { id: true, branchName: true, address: true } },
        },
      });
    }

    const totalAmount = overheads.reduce((sum, o) => sum + Number(o.amount), 0);

    return res.status(200).json({ data: { overheads, totalAmount } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const getOverhead = async (req, res) => {
    if (!req.params.id) return res.status(404).json({ message: "Id is required" });

  try {
    const overhead = await prisma.overhead.findFirst({
      where: { id: req.params.id },
    });
    if (!overhead)
      return res
        .status(404)
        .json({ message: `Overhead with id: ${req.params.id} not found` });

    return res.status(201).json({ data: overhead }) 
} catch (err) {
    return res.status(500).json({ message: err.message })
}
}

module.exports = {
  createOverhead,
  editOverhead,
  deleteOverhead,
  getAllOverheads,
  getOverhead,
};
