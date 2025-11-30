const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { requestApproval } = require("../../utils/services/approvalService");
const checkPendingApproval = require("../../utils/services/checkPendingApproval");
const { logActivity } = require("../../utils/services/activityService.js");


/*
branchName           String         @db.VarChar(100)
  description    String
  address        String
  approvalStatus ApprovalStatus @default(pending)

  createdAt   DateTime @default(now())
  createdByUser String
  updatedAt   DateTime @updatedAt
  updatedByUser String
*/
const createBranch = async (req, res) => {
  const { name, description, address } = req.body;

  if (!name || !address)
    return res.status(404).json({ message: "Name and Address are required" });

  const existingBranch = await prisma.branch.findFirst({
    where: { branchName: name },
  });

  const pendingBranch = await checkPendingApproval(prisma, 'branch', ['branchName'], name);

  if (existingBranch || pendingBranch) {
    return res
      .status(400)
      .json({ message: "Branch already in exists or pending approval" });
  }

  try {
    const needsApproval = req.approval;
    let message;
    let branchData = {
      branchName: name,
      ...(description ? { description } : {}),
      address,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const branch = needsApproval
        ? await requestApproval('branch', null, 'create', branchData, req.username)
        : await tx.branch.create({
            data: branchData,
          });

          const superadmin = await tx.user.findFirst({
            where: { username: "superadmin" },
          });
          if (superadmin) {
            const existingLink = await tx.userBranch.findFirst({
              where: { userId: superadmin.id, branchId: branch.id },
            });
            if (!existingLink) {
              await tx.userBranch.create({
                data: { userId: superadmin.id, branchId: branch.id },
              });
            }
          }

      message = needsApproval
        ? "Branch awaiting approval"
        : "Branch successfully created";

      return branch;
    });
    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} created Branch ${branchData.branchName}`
        : `${req.userbranchName} created Branch ${branchData.name}`
    );

    return res.status(201).json({
      message,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editBranch = async (req, res) => {
  const { name, description, address, remarks } = req.body;

  if (!req.params.id) return res.status(404).json({ message: "ID is required" });

  const branch = await prisma.branch.findFirst({ where: { id: req.params.id } });

  if (!branch)
    return res
      .status(404)
      .json({ message: `Branch with ${req.params.id} not found` });
      
  if (name && name !== branch.branchName) {
    const existingBranch = await prisma.branch.findFirst({
      where: { branchName: name },
    });

    const pendingBranch = await checkPendingApproval(prisma, 'branch', ['branchName'], name);

     if (existingBranch || pendingBranch)
    return res
      .status(400)
      .json({ message: "Branch name already in exists or pending approval" });
  }

  try {
    const needsApproval = req.approval;
    let message;
    const updatedData = {
      branchName: name ?? branch.branchName,
      ...(description ? { description } : {}),
      address: address ?? branch.address,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedBranch = needsApproval
        ? await requestApproval('branch', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
        : await tx.branch.update({
            where: { id: req.params.id },
            data: updatedData,
          });

      message = needsApproval
        ? "Branch edit is awaiting approval"
        : "Branch successfully edited";

      return editedBranch;
    });
    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} edited Branch ${updatedData.branchName}`
        : `${req.username} edited Branch ${updatedData.branchName}`,
        remarks
    );
    return res.status(201).json({
      message,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// add check for relation even if its for approval
const deleteBranch = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ message: "ID is required" });

  const branch = await prisma.branch.findFirst({
    where: { id: req.params.id },
  });
  if (!branch)
    return res
      .status(404)
      .json({ message: `Branch with ${req.params.id} not found` });

  try {
    const needsApproval = req.approval;
    let message;
    const deletedData = {
      branchName: branch.branchName,
      address: branch.address,
      ...(branch.description ? { description: branch.description } : {}),
      requestType: "delete",
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const deletedBranch = needsApproval
        ? await requestApproval('branch', req.params.id, 'delete', {
              ...deletedData,
              createdByUser: req.username }, req.username)
        : await tx.branch.delete({
            where: { id: branch.id },
          });

      message = needsApproval
        ? "Branch delete awaiting approval"
        : "Branch successfully deleted";

      return deletedBranch.branchName;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} deleted Branch ${deletedData.branchName}`
        : `${req.username} deleted Branch ${deletedData.branchName}`
    );

    return res.status(201).json({
      message,
      branchName: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const startDate = req?.query?.startDate; // e.g. "2025-01-01"
    const endDate = req?.query?.endDate; // e.g. "2025-01-31"
    let totalItems = 0;
    let totalPages = 1;

    let where = {};

    if (search) {
      where.OR = [
        { branchName: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const branches = await prisma.branch.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      orderBy: { createdAt: "desc" },
    });

    totalItems = await prisma.branch.count({ where });

    if (limit) {
      totalPages = Math.ceil(totalItems / limit);
    } 

    return res.status(201).json({
      data: { branches, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getBranch = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    return res.status(201).json({ data: branch });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBranch,
  editBranch,
  deleteBranch,
  getAllBranches,
  getBranch,
};
