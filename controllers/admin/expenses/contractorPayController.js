const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { logActivity } = require("../../../utils/services/activityService.js");


/*
  contractorId String
  type   PaymentType
  amount Decimal     @db.Decimal(13, 2)
*/

const createContractorPay = async (req, res)  => {
    const { userId, type, amount, branchId } = req.body;
    if (!userId || !type || !amount) return res.status(400).json({ message: "userId, type, branchId, and amount required"});

    const user = await prisma.user.findFirst({ where: { id: userId }});
    if (!user) return res.status(400).json({ message: "User not found"});

    const contractor = await prisma.contractor.findFirst({ where: { userId }})
    if (!contractor) return res.status(400).json({ message: "User is not a contractor"})

    try {
        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay awaiting approval" : "Contractor pay successful"

        let contractorPayData = {
            contractorId: contractor.id, 
            branchId,
            type, amount,
            createdByUser: req.username,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const contractoyPay = needsApproval 
            ? await requestApproval('contractorPay', null, 'create', contractorPayData, req.username, branchId) 
            : await tx.contractorPay.create({
                data: contractorPayData
            });

            return contractoyPay
        });

        needsApproval
          ? await logActivity(
              req.username,
              `FOR APPROVAL: ${req.username} created Contractor Pay for ${
                user.username
              } with amount PHP ${amount / 100}`,
              branchId
            )
          : await logActivity(
              req.username,
              `${req.username} created Contractor Pay for ${
                user.username
              } with amount PHP ${amount / 100}`,
              branchId
            );
        return res.status(201).json({ message, date: result})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

const editContractorPay = async (req, res) => {
     const { userId, type, amount, branchId, remarks } = req.body;

    if (!req?.params?.id || !remarks) return res.status(400).json({ message: "ID and remarks are required" });

    try {
        const contractorPay = await prisma.contractorPay.findFirst({
            where: { id: req.params.id },
            include: { contractor: { include: { user: { select: { username: true, fullName: true } } } } }
        });
        if (!contractorPay) return res.status((400).json({ message: "Contractor pay not found"}));

        let contractorId;
        let user;
        if (userId) { 
            const contractor = await prisma.contractor.findFirst({ where: { userId }});
            user = await prisma.user.findFirst({ where: { id: userId }});
            contractorId = contractor.id
        } else {
            contractorId = contractorPay.contractorId;
            user = await prisma.user.findFirst({ where: { id: contractorPay.contractor.userId }});
        }


        const needsApproval = req.approval;
        let message = needsApproval ? "Contractor pay edit is awaiting approval" : "Contractor pay edit successful";

        const contractorPayData = {
            contractorId,
            branchId: branchId ?? contractorPay.branchId,
            type: type ?? contractorPay.type,
            amount: amount ?? contractorPay.amount,
            updatedByUser: req.username
        }

        const result = await prisma.$transaction(async (tx) => {
            const editedContractorPay = needsApproval 
                ? await requestApproval('contractorPay', req.params.id, 'edit', {
                ...updatedData,
                createdByUser: req.username }, req.username, branchId || contractorPay.branchId)
                : await tx.contractorPay.update({
                    where: { id: contractorPay.id },
                    data: contractorPayData
                })
            return editedContractorPay
        });
        await logActivity(
          req.username,
          needsApproval
            ? `FOR APPROVAL: ${req.username} edited Contractor Pay for ${
                user.username
              } with amount PHP ${amount / 100}`
            : `${req.username} edited Contractor Pay for ${user.username} with amount PHP ${amount / 100}`,
          branchId,
          remarks
        );
          

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
            branchId: contractorPay.branchId,
            amount: contractorPay.amount,
            updatedByUser: req.username,
            createdByUser: req.username
        }

        const user = await prisma.user.findFirst({ where: { id: contractorPay.contractor.userId }});

        const result = await prisma.$transaction(async (tx) => {
            const deletedContractorPay = needsApproval
              ? await requestApproval(
                  "contractorPay",
                  req.params.id,
                  "delete",
                  {
                    ...contractorPayData,
                    createdByUser: req.username,
                  },
                  req.username,
                  contractorPayData.branchId
                )
              : await tx.contractorPay.delete({
                  where: { id: contractorPay.id },
                });
            return deletedContractorPay;
        })
        needsApproval
          ? await logActivity(
              req.username,
              `FOR APPROVAL: ${req.username} edited Contractor Pay for ${user.username} with amount PHP ${amount/100}`,
              branchId
            )
          : await logActivity(
              req.username,
              `${req.username} edited Contractor Pay for ${user.username} with amount PHP ${amount/100}`,
              branchId
            );

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
            orderBy: { createdAt: 'desc' },
            include: { 
                contractor: { include: { user: { select: { username: true, fullName: true } } } },
                branch : { select: { id: true, branchName: true } } 
            },
        });
        if (!contractorPay) return res.status(400).json({ message: "Contractor pay not found"});

        return res.status(201).json({ data: contractorPay})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getAllContractorPays = async (req, res) => {
    try {
        const contractorPay = await prisma.contractorPay.findMany({       
            orderBy: { createdAt: 'desc' },     
            include: { 
                contractor: { include: { user: { select: { username: true, fullName: true } } } },
                branch : { select: { id: true, address: true, branchName: true } }, 
            },
        });

        return res.status(201).json({ data: { contractorPay }})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { createContractorPay, editContractorPay, deleteContractorPay, getContractorPay, getAllContractorPays }