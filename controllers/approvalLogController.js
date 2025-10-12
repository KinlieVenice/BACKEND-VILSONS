const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { requestApproval } = require("../services/approvalService")

const getAllApprovalLogs = async (req, res) => {
    try {
        const pendingApprovalLogs = await prisma.approvalLog.findMany( { where: { status: "pending" } } );
        return res.status(200).json({ data: pendingApprovalLogs })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { getAllApprovalLogs }