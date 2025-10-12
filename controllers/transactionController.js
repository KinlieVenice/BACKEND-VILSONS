const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../utils/monthYearFilter");


const createTransaction = async (req, res) => {
    const { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;

    if (!jobOrderCode || !senderName || !amount || !mop || !status) return res.status(404).json({ message: "All jobOrderCode, senderName, amount, mop, status required"});

    try {
        const jobOrder = await prisma.jobOrder.findFirst({ where: { jobOrderCode }});
        if (!jobOrder) return res.status(404).json({ message: "Job order not found" });

        const result = await prisma.$transaction(async (tx) => {
            const phpAmount = amount;
            const transactionData = {
                jobOrderCode, senderName, amount: phpAmount, mop, status, 
                referenceNumber: referenceNumber ?? null,
                createdByUser: req.username,
                updatedByUser: req.username
            }
            const transaction = await tx.transaction.create({
                data: transactionData
            })
            return transaction
        })
        return res.status(201).json({ message: "Transaction completed", result })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const editTransaction = async (req, res) => {
    let { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
         const result = await prisma.$transaction(async (tx) => {
            const transactionData = {
                jobOrderCode: jobOrderCode ?? transaction.jobOrderCode,
                senderName: senderName ?? transaction.senderName, 
                referenceNumber: referenceNumber ?? transaction.referenceNumber,
                amount: amount ?? transaction.amount, 
                mop: mop ?? transaction.mop, 
                status: status ?? transaction.status,
                updatedByUser: req.username
            }
            const updatedTransaction = await tx.transaction.update({
                where: { id: transaction.id },
                data: transactionData
            })
            return updatedTransaction
        })
        return res.status(201).json({ message: "Transaction edit completed", result })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const deleteTransaction = async (req, res) => {
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
         const result = await prisma.$transaction(async (tx) => {
            
            const deletedTransaction = await tx.transaction.delete({
                where: { id: transaction.id },
            })
            return deletedTransaction
        })
        return res.status(201).json({ message: "Transaction delete completed" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

//only view own branches
const getAllTransactions = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);

  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  let where = {
    createdAt: { gte: startDate, lt: endDate },
  };

  // Branch filter (via JobOrder)
  if (branch) {
    const branchValue = branch.trim().replace(/^["']|["']$/g, "");
    where.jobOrder = { branch: { id: branchValue } };
  } else if (req.branchIds?.length) {
    where.jobOrder = { branchId: { in: req.branchIds } };
  }

  // Search filter
  if (search) {
    const searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      { senderName: { contains: searchValue } },
      { referenceNumber: { contains: searchValue } },
    ];
  }

  try {
    const totalItems = await prisma.transaction.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        jobOrder: {
          select: {
            id: true,
            jobOrderCode: true,
            branch: { select: { id: true, branchName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
    });

    const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return res.status(200).json({
      data: {
        transactions,
        totalTransactions
       
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

const getTransaction = async (req, res) => {
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
       
        return res.status(201).json({ data: transaction })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { createTransaction , editTransaction, deleteTransaction,getAllTransactions, getTransaction}