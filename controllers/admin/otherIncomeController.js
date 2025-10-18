const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../utils/monthYearFilter");
const { branchFilter } = require("../../utils/branchFilter");
const { requestApproval } = require("../../utils/services/approvalService")


/*
  description String
  amount      Decimal @db.Decimal(13, 2)
  branchId    String
*/

const createOtherIncome = async (req, res) => {
  const { description, amount, branchId } = req.body;
  if (!description || !amount || !branchId)
    return res
      .status(400)
      .json({ message: "Description, amount, and branchId required" });

  try {
    const needsApproval = req.approval;
    let message;
    const otherIncomeData = {
      description,
      amount,
      branchId,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const otherIncome = needsApproval
        ? await requestApproval('otherIncome', null, 'create', otherIncomeData, req.username)
        : await tx.otherIncome.create({
            data: otherIncomeData,
          });

      message = needsApproval
        ? "Other income is awaiting approval"
        : "Other income is successfully created";

      return otherIncome;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editOtherIncome = async (req, res) => {
  const { description, amount, branchId } = req.body;
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const otherIncome = await prisma.otherIncome.findFirst({
      where: { id: req.params.id },
    });
    if (!otherIncome)
      return res.status(404).json({
        message: `Other income with id: ${req.params.id} does not exist`,
      });

    const needsApproval = req.approval;
    let message;
    const otherIncomeData = {
      description: description ?? otherIncome.description,
      amount: amount ?? otherIncome.amount,
      branchId: branchId ?? otherIncome.branchId,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedOtherIncome = needsApproval
        ? await requestApproval('otherIncome', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
        : await tx.otherIncome.update({
            where: { id: otherIncome.id },
            data: otherIncomeData,
          });

      message = needsApproval
        ? "Other income edit awaiting approval"
        : "Other income edited successfully";

      return editedOtherIncome;
    });
    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteOtherIncome = async (req, res) => {
  if (!req.params.id) return res.status(404).json({ message: "Id is required" });
  try {
    const otherIncome = await prisma.otherIncome.findFirst({
      where: { id: req.params.id },
    });
    if (!otherIncome)
      return res
        .status(404)
        .json({ message: `Other income with id: ${req.params.id} not found` });

    const needsApproval = req.approval;
    let message;
    const otherIncomeData = {
      description: otherIncome.description,
      amount: otherIncome.amount,
      branchId: otherIncome.branchId,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const deletedOtherIncome = needsApproval
        ? await requestApproval( "otherIncome", otherIncome.id, "delete", otherIncome, req.username)
        : await tx.otherIncome.delete({
            where: { id: otherIncome.id },
          });

      message = needsApproval
        ? "Other income delete awaiting approval"
        : "Other income deleted successfully";

      return deletedOtherIncome;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllOtherIncomes = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  let where = {
    createdAt: { gte: startDate, lt: endDate },
    ...branchFilter("otherIncome", branch, req.branchIds)
  };

    // Search filter
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [{ description: { contains: searchValue } }];
  }

  try {
    const totalItems = await prisma.otherIncome.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const otherIncome = await prisma.otherIncome.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        branch: {
          select: { id: true, branchName: true, address: true },
        },
      },
    });

    const totalAmount = otherIncome.reduce((sum, inc) => sum + Number(inc.amount), 0);

    return res.status(200).json({
      data: {
        otherIncome,
        totalAmount,
      },
      pagination: {
          totalItems,
          totalPages,
          currentPage: page || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOtherIncome = async (req, res) => {
    if (!req.params.id) return res.status(404).json({ message: "Id is required" });

  try {
    const otherIncome = await prisma.otherIncome.findFirst({
      where: { id: req.params.id },
    });
    if (!otherIncome)
      return res
        .status(404)
        .json({ message: `Other income with id: ${req.params.id.id} not found` });

    return res.status(201).json({ data: otherIncome }) 
} catch (err) {
    return res.status(500).json({ message: err.message })
}
}

module.exports = {
  createOtherIncome,
  editOtherIncome,
  deleteOtherIncome,
  getAllOtherIncomes,
  getOtherIncome,
};
