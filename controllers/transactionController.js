const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
    const { jobOrderCode, senderName, amount, mop } = req.body;
    try {
        const jobOrder = await prisma.jobOrder.findFirst({ where: { jobOrderCode }});
        if (!jobOrder) return res.status(404).json({ message: "Job order not found" });

        const result = await prisma.$transaction(async (tx) => {

            const transactionData = {
                jobOrderCode, senderName, amount, mop,
                createdByUser: req.username,
                updatedByUser: req.username
            }
            const transaction = await tx.transaction.create({
                data: transactionData
            })
            return transaction
        })
        return res.status(201).json({ message: "Transaction completed"})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}