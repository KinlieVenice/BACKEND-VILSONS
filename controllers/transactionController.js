const { PrismaClient } = require("../generated/prisma");
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

const getAllTransactions = async (req, res) => {
    const search = req?.query?.search;
    const branch = req?.query?.branch;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const year = req?.query?.year; // e.g. "2025"
    const month = req?.query?.month; // e.g. "09" for September

    let where = {};

    if (branch) {
        where.jobOrder.branch = {
        branchName: { contains: branch },
        };
    }

    if (search) {
        where.OR = [
            { jobOrderCode: { contains: search } }, // directly in Transaction
            { senderName: { contains: search } },   // also in Transaction
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
        const totalItems = await prisma.transaction.count({ where });
        const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

        const transactions = await prisma.transaction.findMany({
            include: {
            jobOrder: {
            select: {
                id: true, 
                branch: {
                select: {
                    branchName: true, 
                },
                },
            },
            },
        },
        orderBy: { createdAt: "desc" },
        });
       
        return res.status(201).json({ data: { transactions, pagination: {
                totalItems,
                totalPages,
                currentPage: page || 1,
                }, 
            } 
        })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

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