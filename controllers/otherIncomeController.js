const { PrismaClient } = require("@prisma/client");
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
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const otherIncome = await prisma.otherIncome({
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
  const year = req?.query?.year; // e.g. "2025"
  const month = req?.query?.month; // e.g. "09" for September

  let where = {};

  if (branch) {
    where.branch = {
      id: { contains: branch },
    };
  }

  if (search) {
    where.OR = [
      { description: { contains: search } },
    ];
  }

  if (year && !month) {
    const y = parseInt(year, 10);
    where.createdAt = {
      gte: new Date(y, 0, 1),
      lt: new Date(y + 1, 0, 1),
    };
  }

  if (year && month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const startOfMonth = new Date(y, m - 1, 1); 
    const endOfMonth = new Date(y, m, 1); 
    where.createdAt = {
      gte: startOfMonth,
      lt: endOfMonth,
    };
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
