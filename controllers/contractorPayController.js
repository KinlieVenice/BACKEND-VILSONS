const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

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
}



module.exports = { createContractorPay }