const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const usernameFinder = require('../utils/usernameFinder');

/*
  contractorId String

  type   PaymentType
  amount Decimal     @db.Decimal(13, 2)
*/

const createContractorPay = async (req, res)  => {
    const { contractorId, type, amount } = req.body;
    if (!contractorId || !type || !amount) return res.status(400).json({ message: "ContractorId, type, and amount required"});

    try {
        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay awaiting approval" : "Contractor pay successful"

        let contractorPayData = {
            contractorId, type, amount,
            createdByUser: req.username,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const contractoyPay = needsApproval 
            ? await tx.contractorPayEdit.create({
                data: contractorPayData
            }) : await tx.contractorPay.create({
                data: contractorPayData
            });

            return contractoyPay
        });
        return res.status(201).json({ message, date: result})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

const editContractorPay = async (req, res) => {
    const { contractorId, type, amount } = req.body;
    if (!req?.params?.id) return res.status(400).json({ message: "ID is required" });

    try {
        const contractorPay = await prisma.contractorPay.findFirst({
            where: { id: req.params.id },
            include: { contractor: { include: { user: { select: { username: true, fullName: true } } } } }
        });
        if (!contractorPay) return res.status((400).json({ message: "Contractor pay not found"}));

        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay edit is awaiting approval" : "Contractor pay edit successful";

        const contractorPayData = {
            contractorId: contractorId ?? contractorPay.contractorId,
            type: type ?? contractorPay.type,
            amount: amount ?? contractorPay.amount,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const editedContractorPay = needsApproval 
                ? await tx.contractorPayEdit.create({
                    data: { ...contractorPayData, requestType: "edit", createdByUser: req.username }
                })
                : await tx.contractorPay.update({
                    where: { id: contractorPay.id },
                    data: contractorPayData
                })
            return editedContractorPay
        })
        return res.status(201).json({ message, data: {...result, contractor: contractorPay.contractor } })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

};



module.exports = { createContractorPay, editContractorPay, deleteContractorPay, getContractorPay }