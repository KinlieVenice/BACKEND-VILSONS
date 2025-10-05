const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/*
  contractorId String
  type   PaymentType
  amount Decimal     @db.Decimal(13, 2)
*/

const createContractorPay = async (req, res)  => {
    const { userId, type, amount } = req.body;
    if (!userId || !type || !amount) return res.status(400).json({ message: "ContractorId, type, and amount required"});

    const contractor = await prisma.contractor.findFirst({ where: { userId }})
    if (!contractor) return res.status(400).json({ message: "User is not a contractor"})

    try {
        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay awaiting approval" : "Contractor pay successful"

        let contractorPayData = {
            contractorId: contractor.id, 
            type, amount,
            createdByUser: req.username,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const contractoyPay = needsApproval 
            ? await tx.contractorPayEdit.create({
                data: {...contractorPayData, requestType: "create", contractorPayId: null}
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
     const { userId, type, amount } = req.body;

    if (!req?.params?.id) return res.status(400).json({ message: "ID is required" });

    try {
        const contractorPay = await prisma.contractorPay.findFirst({
            where: { id: req.params.id },
            include: { contractor: { include: { user: { select: { username: true, fullName: true } } } } }
        });
        if (!contractorPay) return res.status((400).json({ message: "Contractor pay not found"}));

        let contractorId;
        if (userId) { 
            const contractor = await prisma.contractor.findFirst({ where: { userId }});
            contractorId = contractor.id
        } else {
            contractorId = contractorPay.contractorId
        }


        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay edit is awaiting approval" : "Contractor pay edit successful";

        const contractorPayData = {
            contractorId,
            type: type ?? contractorPay.type,
            amount: amount ?? contractorPay.amount,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const editedContractorPay = needsApproval 
                ? await tx.contractorPayEdit.create({
                    data: { ...contractorPayData, requestType: "edit", contractorPayId: req.params.id, createdByUser: req.username }
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

const deleteContractorPay = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: "ID is required" });

    try {
        const contractorPay = await prisma.contractorPay.findFirst({            
            where: { id: req.params.id }
        });
        if (!contractorPay) return res.status((400).json({ message: "Contractor pay not found"}));

        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay delete awaiting approval" : "Contactor pay deleted";

        const contractorPayData = {
            contractorId:  contractorPay.contractorId,
            type: contractorPay.type,
            amount: contractorPay.amount,
            updatedByUser: req.username,
            createdByUser: req.username
        }


        const result = await prisma.$transaction(async (tx) => {
            const deletedContractorPay = needsApproval 
                ? await tx.contractorPayEdit.create({
                    data: contractorPayData
                })
                : await tx.contractorPay.delete({
                    where: { id: contractorPay.id }
                })
            return deletedContractorPay;
        })

        return res.status(201).json({ message })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getContractorPay = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: "ID is required" });

    try {
        const contractorPay = await prisma.contractorPay.findFirst({
            where: { id: req.params.id },
            include: { contractor: { include: { user: { select: { username: true, fullName: true } } } } },
        });
        if (!contractorPay) return res.status((400).json({ message: "Contractor pay not found"}));

        return res.status(201).json({ data: contractorPay})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getAllContractorPays = async (req, res) => {
    try {
        const contractorPay = await prisma.contractorPay.findMany({            
            include: { contractor: { include: { user: { select: { username: true, fullName: true } } } } },
        });

        return res.status(201).json({ data: { contractorPay }})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { createContractorPay, editContractorPay, deleteContractorPay, getContractorPay, getAllContractorPays }