const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { requestApproval, approveRequest, rejectRequest } = require("../../../utils/services/approvalService");
const { logActivity } = require("../../../utils/services/activityService.js");
const { enrichPayloadWithNames } = require("../../../utils/services/enrichPayloadService.js"); // Adjust path
const { branchFilter } = require("../../../utils/filters/branchFilter"); 
const { getLastUpdatedAt } = require("../../../utils/services/lastUpdatedService");


const getAllApprovalLogsOLDDD2 = async (req, res) => {
  try {
    const pendingApprovalLogs = await prisma.approvalLog.findMany({
      where: {
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ data: pendingApprovalLogs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const getAllApprovalLogs = async (req, res) => {
  try {
    const branch = req.query?.branch;
    const where = {
        status: "pending",
        ...branchFilter("approvalLog", branch, req.branchIds),
      };

    const pendingApprovalLogs = await prisma.approvalLog.findMany({
      where,
      include: { branch: { select: { branchName: true } } },
      orderBy: { createdAt: "desc" },
    });
    
    const lastUpdatedAt = await getLastUpdatedAt(prisma, "approvalLog", where);

    // Define field mappings based on your schema
    const fieldMappings = {
      // Array fields
      roles: {
        model: "role",
        nameField: "roleName",
      },
      branches: {
        model: "branch",
        nameField: "branchName",
      },

      // Single ID fields
      branchId: {
        model: "branch",
        nameField: "branchName",
      },
      employeeId: {
        model: "employee",
        nameField: "fullName",
        specialLookup: {
          type: "userRelation",
          relation: "user", // employee.user.fullName
        },
      },
      // Add other common ID fields you might encounter
      contractorId: {
        model: "contractor",
        nameField: "fullName",
        specialLookup: {
          type: "userRelation",
          relation: "user", // contractor.user.fullName
        },
      },
      customerId: {
        model: "customer",
        nameField: "fullName",
        specialLookup: {
          type: "userRelation",
          relation: "user", // customer.user.fullName
        },
      },
      createdByUser: {
        model: "user",
        nameField: "fullName",
      },
      updatedByUser: {
        model: "user",
        nameField: "fullName",
      },
      requestedByUser: {
        model: "user",
        nameField: "fullName",
      },
      approvedByUser: {
        model: "user",
        nameField: "fullName",
      },
    };

    // Enrich all payloads in parallel
    const enrichedApprovalLogs = await Promise.all(
      pendingApprovalLogs.map(async (log) => {
        const enrichedPayload = await enrichPayloadWithNames(
          log.payload,
          fieldMappings
        );

        // Also enrich the log itself (requestedByUser, etc.)
        const enrichedLog = {
          ...log,
          payload: enrichedPayload,
        };

        return enrichedLog;
      })
    );

    return res.status(200).json({ data: enrichedApprovalLogs, lastUpdatedAt });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

    // Parse the payload safely
    const payload = approvalLog.payload;

    // Use the values from the correct location
    const actionType =
      payload?.actionType || approvalLog.actionType || "unknown";
    const requestedByUser =
      payload?.requestedByUser || approvalLog.requestedByUser || "unknown";

    const result = await approveRequest(id, admin);

    await logActivity(
      req.username,
      `${req.username} approved ${
        actionType === "edit" ? "an" : "a"
      } ${actionType} request from ${requestedByUser}`,
    );

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
      return res
        .status(400)
        .json({ message: "Rejection responseComment is required" });
    }

    // Debug: log the entire approvalLog to see the structure
    console.log(
      "Approval log structure:",
      JSON.stringify(approvalLog, null, 2)
    );

    // Parse the payload safely
    const payload = approvalLog.payload;

    // Check what's actually in the payload
    console.log("Payload keys:", Object.keys(payload || {}));
    console.log("actionType in payload:", payload?.actionType);
    console.log("requestedByUser in payload:", payload?.requestedByUser);
    console.log("actionType in approvalLog:", approvalLog.actionType);
    console.log("requestedByUser in approvalLog:", approvalLog.requestedByUser);

    // Use the values from the correct location
    const actionType =
      payload?.actionType || approvalLog.actionType || "unknown";
    const requestedByUser =
      payload?.requestedByUser || approvalLog.requestedByUser || "unknown";

    const result = await rejectRequest(id, admin, responseComment);

    await logActivity(
      req.username,
      `${req.username} rejected ${actionType === "edit" ? "an" : "a"} ${actionType} request from ${requestedByUser}`,
      remarks
    );

    return res.status(200).json({ message: "Request rejected", result });
  } catch (error) {
    console.error("Reject approval log error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllApprovalLogs, approveApprovalLog, rejectApprovalLog }