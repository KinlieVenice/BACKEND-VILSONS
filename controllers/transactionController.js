const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
    const { jobOrderCode, senderName, amount, mop, status } = req.body;

    if (!jobOrderCode || !senderName || !amount || !mop || !status) return res.status(404).json({ message: "All jobOrderCode, senderName, amount, mop, status required"});

    try {
        const jobOrder = await prisma.jobOrder.findFirst({ where: { jobOrderCode }});
        if (!jobOrder) return res.status(404).json({ message: "Job order not found" });

        const result = await prisma.$transaction(async (tx) => {
            const phpAmount = amount;
            const transactionData = {
                jobOrderCode, senderName, amount: phpAmount, mop, status,
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
    let { jobOrderCode, senderName, amount, mop, status } = req.body;
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
         const result = await prisma.$transaction(async (tx) => {
            const transactionData = {
                jobOrderCode: jobOrderCode ?? transaction.jobOrderCode,
                senderName: senderName ?? transaction.senderName, 
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
  let year = req?.query?.year;
  let month = req?.query?.month;
  let where = {};

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
    ];
  }

  // Date filters — default to current month if none provided
  const now = new Date();
  year = year ? parseInt(year, 10) : now.getFullYear();
  month = month ? parseInt(month, 10) - 1 : now.getMonth();

  let startDate, endDate;
  if (year && !month) {
    startDate = new Date(year, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(year + 1, 0, 1);
    endDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(year, month, 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(year, month + 1, 1);
    endDate.setHours(0, 0, 0, 0);
  }
  

  where.createdAt = { gte: startDate, lt: endDate };

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

    return res.status(200).json({
      data: {
        transactions,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page || 1,
        },
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