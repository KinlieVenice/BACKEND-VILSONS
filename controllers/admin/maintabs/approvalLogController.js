const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { requestApproval, approveRequest, rejectRequest } = require("../../../utils/services/approvalService")

const getAllApprovalLogs = async (req, res) => {
    try {
        const pendingApprovalLogs = await prisma.approvalLog.findMany( { where: { status: "pending" } } );
        return res.status(200).json({ data: pendingApprovalLogs })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

const approveApprovalLog = async (req, res) => {
    const { id } = req.params;
    const admin = req.username;

    const result = await approveRequest(id, admin);
    res.json({ message: 'Request approved', result });
}

const rejectApprovalLog = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = req.username;

    const result = await rejectRequest(id, admin, reason);
    res.json({ message: 'Request rejected', result });
}

module.exports = { getAllApprovalLogs, approveApprovalLog, rejectApprovalLog }