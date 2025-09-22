const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/*
  description String
  amount      Decimal @db.Decimal(13, 2)
  branchId    String
*/

const createOtherIncome = async (req, res) => {
    const { description, amount, branchId } = req.body;
    if (!description || !amount || !branchId) return res.status(400).json({ message: "Description, amount, and branchId required"});

    try {
        const needsApproval = req.approval;
        let message;
        const otherIncomeData = {
            description,
            amount,
            branchId,
            createdByUser: req.username,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const otherIncome = needsApproval ?
            await tx.otherIncomeEdit.create({
                data: {...otherIncomeData, requestType: "create", otherIncomeId: null}
            }) : await tx.otherIncome.create({
                data: otherIncomeData
            })

            message = needsApproval ? "Other income is awaiting approval" : "Other income is successfully created"

            return otherIncome
        })

        return res.status(201).json({ message, data: result })

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

const editOtherIncome = async (req, res) => {
    const { description, amount, branchId } = req.body;
    if (!req?.body?.id) return res.status(400).json({ message: "ID is required"});

    try {

        const otherIncome = await prisma.otherIncome({ where: { id: req.body.id }});
        if (!otherIncome) return res.status(404).json({ message: `Other income with id: ${req.body.id} does not exist`});

        const needsApproval = req.approval;
        let message;
        const otherIncomeData = {
            description: description ?? otherIncome.description,
            amount: amount ?? otherIncome.amount,
            branchId: branchId ?? otherIncome.branchId,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const editedOtherIncome = needsApproval ?
            await tx.otherIncomeEdit.create({
                data: {...otherIncomeData, createdByUser: req.username, otherIncomeId: otherIncome.id, requestType: "edit"}
            }) : await tx.otherIncome.update({
                where: { id: otherIncome.id },
                data: otherIncomeData
            })

            message = needsApproval ? "Other income edit awaiting approval" : "Other income edited successfully";

            return editedOtherIncome
        })
        return res.status(201).json({ message, data: result })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}


module.exports = { createOtherIncome, editOtherIncome }