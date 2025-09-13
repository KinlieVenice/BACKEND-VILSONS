const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

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

  const pendingBranch = await prisma.branchEdit.findFirst({
    where: {
      branchName: name,
      approvalStatus: "pending",
    },
  });

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
        ? await tx.branchEdit.create({
            data: { ...branchData, requestType: "create" },
          })
        : await tx.branch.create({
            data: branchData,
          });

      message = needsApproval
        ? "Branch awaiting approval"
        : "Branch successfully created";

      return { branch };
    });

    return res.status(201).json({
      message,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editBranch = async (req, res) => {
  const { name, description, address } = req.body;

  if (!req.body.id) return res.status(404).json({ message: "ID is required" });

  const user = prisma.branch.findFirst({ id: req.body.id });

  if (!user)
    return res
      .status(404)
      .json({ message: `User with ${req.body.id} not found` });

  const existingBranch = await prisma.branch.findFirst({
    where: { branchName: name },
  });

  const pendingBranch = await prisma.branchEdit.findFirst({
    where: {
      branchName: name,
      approvalStatus: "pending",
    },
  });

  if (existingBranch || pendingBranch)
    return res
      .status(400)
      .json({ message: "Branch name already in exists or pending approval" });

  try {
    const needsApproval = req.approval;
    let message;
    const updatedData = {
      branchName: name ?? user.branchName,
      ...(description ? { description } : {}),
      address: address ?? user.address,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const branch_edit = needsApproval
        ? await tx.branchEdit.create({
            data: { ...updatedData, createdByUser: req.username, requestType: "edit" },
          })
        : await tx.branch.update({
            where: { id: req.body.id },
            data: updatedData,
          });

      message = needsApproval
        ? "Branch edit is awaiting approval"
        : "Branch successfully edited";

        return branch_edit
    });
    return res.status(201).json({
      message,
      data: result
    })
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteBranch = async (req, res) => {
  if (!req.params.id) return res.status(400).json({ message: "ID is required" });

  const branch = await prisma.branch.findFirst({ where: { id: req.params.id }});
  if (!branch) return res.status(404).json({ message: `Branch with ${req.params.id} not found` });

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
      const branch_delete = needsApproval 
      ? await tx.branchEdit.create({
        data: {
          branchId: branch.id,
          ...deletedData,
          createdByUser: req.username,
        }
      }) 
      : await tx.branch.delete({
        where: { id: branch.id }
      })

      message = needsApproval ? "Branch delete awaiting approval" : "Branch successfully deleted"

      return branch_delete.branchName
    })

    return res.status(201).json({ 
      message,
      data: result
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports = { createBranch, editBranch, deleteBranch };
