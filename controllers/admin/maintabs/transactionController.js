const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../../utils/filters/monthYearFilter");


const createTransactionOld = async (req, res) => {
    const { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;

    if (!jobOrderCode || !senderName || !amount || !mop || !status) return res.status(400).json({ message: "All jobOrderCode, senderName, amount, mop, status required"});

    try {
        const jobOrder = await prisma.jobOrder.findFirst({ where: { jobOrderCode }});
        if (!jobOrder) return res.status(400).json({ message: "Job order not found" });

        const needsApproval = req.approval;

        const result = await prisma.$transaction(async (tx) => {
            const phpAmount = amount;
            const transactionData = {
                jobOrderCode, senderName, amount: phpAmount, mop, status, 
                referenceNumber: referenceNumber ?? null,
                createdByUser: req.username,
                updatedByUser: req.username
            }
            const transaction = needsApproval 
            ? await requestApproval('transaction', null, 'create', transactionData, req.username)
            : await tx.transaction.create({
                data: transactionData
            })
            return transaction
        })
        return res.status(201).json({ message: "Transaction completed", result })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const createTransaction = async (req, res) => {
  const { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;

  if (!jobOrderCode || !senderName || !amount || !mop || !status)
    return res.status(400).json({
      message: "All jobOrderCode, senderName, amount, mop, and status are required",
    });

  try {
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { jobOrderCode },
      include: {
        materials: { select: { price: true, quantity: true } },
        transactions: { select: { amount: true } },
      },
    });

    if (!jobOrder)
      return res.status(400).json({ message: "Job order not found" });

    // 🧮 Compute totals
    const totalMaterialCost = jobOrder.materials?.reduce(
      (sum, m) => sum + Number(m.price) * Number(m.quantity),
      0
    ) || 0;

    const totalTransactions = jobOrder.transactions?.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    ) || 0;

    const laborCost = Number(jobOrder.labor) || 0;
    const totalBill = laborCost + totalMaterialCost;
    const totalBalance = totalBill - totalTransactions;

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: `Amount cannot be 0`,
      });
    }

    // 🧾 Check if the payment amount exceeds the remaining balance
    if (Number(amount) > totalBalance) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance. Remaining balance: ₱${totalBalance.toFixed(2)}`,
      });
    }



    // Proceed with transaction creation
    const needsApproval = req.approval;

    const result = await prisma.$transaction(async (tx) => {
      const phpAmount = Number(amount);
      const transactionData = {
        jobOrderCode,
        senderName,
        amount: phpAmount,
        mop,
        status,
        referenceNumber: referenceNumber ?? null,
        createdByUser: req.username,
        updatedByUser: req.username,
      };

      const transaction = needsApproval
        ? await requestApproval("transaction", null, "create", transactionData, req.username)
        : await tx.transaction.create({
            data: transactionData,
          });

      return transaction;
    });

    return res.status(201).json({ message: "Transaction completed", result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editTransactionOld = async (req, res) => {
    let { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        const needsApproval = req.approval;
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

            const editedTransaction = needsApproval 
             ? await requestApproval('transaction', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
            : await tx.transaction.update({
                where: { id: transaction.id },
                data: transactionData
            })
            return editedTransaction
        })
        return res.status(201).json({ message: "Transaction edit completed", result })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const editTransaction = async (req, res) => {
  let { jobOrderCode, referenceNumber, senderName, amount, mop, status } = req.body;
  if (!req?.params?.id)
    return res.status(404).json({ message: "Transaction ID is required" });

  try {
    // 1️⃣ Find the existing transaction
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id },
    });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    // 2️⃣ Find the related job order
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { jobOrderCode: jobOrderCode ?? transaction.jobOrderCode },
      include: {
        materials: { select: { price: true, quantity: true } },
        transactions: { select: { id: true, amount: true } },
      },
    });
    if (!jobOrder)
      return res.status(400).json({ message: "Job order not found" });

    // 3️⃣ Compute total bill and transactions
    const totalMaterialCost = jobOrder.materials?.reduce(
      (sum, m) => sum + Number(m.price) * Number(m.quantity),
      0
    ) || 0;

    const totalTransactions = jobOrder.transactions?.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    ) || 0;

    const laborCost = Number(jobOrder.labor) || 0;
    const totalBill = laborCost + totalMaterialCost;

    // 4️⃣ Exclude this transaction’s own current amount before comparing
    const currentAmount = Number(transaction.amount);
    const newAmount = amount ? Number(amount) : currentAmount;

    // All other transactions (excluding this one)
    const totalTransactionsExcludingSelf = totalTransactions - currentAmount;

    // Remaining balance BEFORE editing
    const remainingBalance = totalBill - totalTransactionsExcludingSelf;
    
    if (Number(newAmount) <= 0) {
      return res.status(400).json({
        message: `Amount cannot be 0`,
      });
    }

    // 5️⃣ Prevent overpayment
    if (newAmount > remainingBalance) {
      return res.status(400).json({
        message: `Updated amount exceeds remaining balance. Remaining balance: ₱${remainingBalance.toFixed(
          2
        )}`,
      });
    }

    // 6️⃣ Continue with edit
    const needsApproval = req.approval;

    const result = await prisma.$transaction(async (tx) => {
      const transactionData = {
        jobOrderCode: jobOrderCode ?? transaction.jobOrderCode,
        senderName: senderName ?? transaction.senderName,
        referenceNumber: referenceNumber ?? transaction.referenceNumber,
        amount: newAmount,
        mop: mop ?? transaction.mop,
        status: status ?? transaction.status,
        updatedByUser: req.username,
      };

      const editedTransaction = needsApproval
        ? await requestApproval(
            "transaction",
            req.params.id,
            "edit",
            { ...transactionData, createdByUser: req.username },
            req.username
          )
        : await tx.transaction.update({
            where: { id: transaction.id },
            data: transactionData,
          });

      return editedTransaction;
    });

    return res
      .status(201)
      .json({ message: "Transaction edit completed", result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const deleteTransaction = async (req, res) => {
    if (!req?.params?.id) return res.status(404).json({ message: "ID required"});

    try {
        const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
        const needsApproval = req.approval;
         const result = await prisma.$transaction(async (tx) => {
            
            const deletedTransaction = needsApproval
            ? await requestApproval( "transaction", transaction.id, "delete", transaction, req.username)
            : await tx.transaction.delete({
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