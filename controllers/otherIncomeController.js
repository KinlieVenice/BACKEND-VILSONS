const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

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
        ? await tx.otherIncomeEdit.create({
            data: {
              ...otherIncomeData,
              requestType: "create",
              otherIncomeId: null,
            },
          })
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
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const otherIncome = await prisma.otherIncome({
      where: { id: req.body.id },
    });
    if (!otherIncome)
      return res.status(404).json({
        message: `Other income with id: ${req.body.id} does not exist`,
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
        ? await tx.otherIncomeEdit.create({
            data: {
              ...otherIncomeData,
              createdByUser: req.username,
              otherIncomeId: otherIncome.id,
              requestType: "edit",
            },
          })
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
  if (!req.body.id) return res.status(404).json({ message: "Id is required" });

  try {
    const otherIncome = await prisma.otherIncome.findFirst({
      where: { id: req.body.id },
    });
    if (!otherIncome)
      return res
        .status(404)
        .json({ message: `Other income with id: ${req.body.id.id} not found` });

    const needsApproval = req.approval;
    let message;
    const otherIncomeData = {
      description: description ?? otherIncome.description,
      amount: amount ?? otherIncome.amount,
      branchId: branchId ?? otherIncome.branchId,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const deletedOtherIncome = needsApproval
        ? await tx.otherIncomeEdit.create({
            data: {
              ...otherIncomeData,
              createdByUser: req.username,
              otherIncomeId: otherIncome.id,
              requestType: "delete",
            },
          })
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
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (branch) {
    where.branch = {
      branchName: { contains: branch },
    };
  }

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { amount: { contains: search } },
      { brnach: { contains: search } },
      {
        branch: {
          OR: [
            { branchName: { contains: search } },
            { address: { contains: search } },
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
    const otherIncome = await prisma.otherIncome.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        branch: {
          select: { branchName: true, address: true },
        },
      },
    });

    return otherIncome;
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createOtherIncome, editOtherIncome, deleteOtherIncome };
