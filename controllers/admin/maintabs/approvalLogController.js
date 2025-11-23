const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { requestApproval, approveRequest, rejectRequest } = require("../../../utils/services/approvalService");
const { logActivity } = require("../../../utils/services/activityService.js");


const getAllApprovalLogs = async (req, res) => {
    try {
        const pendingApprovalLogs = await prisma.approvalLog.findMany( { where: { status: "pending" } } );
        return res.status(200).json({ data: pendingApprovalLogs })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

const approveApprovalLogOld = async (req, res) => {
    const { id } = req.params;
    const admin = req.username;

    const result = await approveRequest(id, admin);
    res.json({ message: 'Request approved', result });
}

const rejectApprovalLogOld = async (req, res) => {
    const { id } = req.params;
    const { responseComment } = req.body;
    const admin = req.username;

    const result = await rejectRequest(id, admin, responseComment);
    res.json({ message: 'Request rejected', result });
}

const approveApprovalLog = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.username;

    // Check if approval log exists first
    const approvalLog = await prisma.approvalLog.findFirst({
      where: { id },
    });
    if (!approvalLog)
      return res
        .status(404)
        .json({ message: `Approval log with ID ${id} not found` });

    const result = await approveRequest(id, admin);
    await logActivity(req.username, `${req.username} approved request ${id}`);

    return res.status(200).json({ message: "Request approved", result });
  } catch (error) {
    console.error("Approve approval log error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const rejectApprovalLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseComment, remarks } = req.body;
    const admin = req.username;

    const approvalLog = await prisma.approvalLog.findFirst({
      where: { id: id },
    });
    if (!approvalLog)
      return res
        .status(404)
        .json({ message: `Approval log with ID ${id} not found` });

    if (!responseComment || responseComment.trim() === "") {
      return res.status(400).json({ message: "Rejection responseComment is required" });
    }

    const result = await rejectRequest(id, admin, responseComment);

    await logActivity(req.username, `${req.username} rejected request ${id}`, remarks);
    return res.status(200).json({ message: "Request rejected", result });
  } catch (error) {
    console.error("Reject approval log error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllApprovalLogs, approveApprovalLog, rejectApprovalLog }