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
        data: result
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editBranch = async (req, res) => {
  const { name, description, address } = req.body;
  
}

module.exports = { createBranch }
