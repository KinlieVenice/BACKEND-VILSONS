const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
    const { jobOrderCode, senderName, amount, mop, status } = req.body;

    if (!jobOrderCode || !senderName || !amount || !mop || !status) return res.status(404).json({ message: "All jobOrderCode, senderName, amount, mop, status required"});

    try {
        const jobOrder = await prisma.jobOrder.findFirst({ where: { jobOrderCode }});
        if (!jobOrder) return res.status(404).json({ message: "Job order not found" });

        const result = await prisma.$transaction(async (tx) => {
            const phpAmount = amount*100
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
            if (amount) amount = amount*100
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

module.exports = { createTransaction , editTransaction}