const { PrismaClient } = require("../generated/prisma");
const generateJobOrderCode = require("../utils/generateJobOrderCode");
const prisma = new PrismaClient();

const createJobOrder = async (req, res) => {
  const {
    customerId,
    truckId,
    branchId,
    contractorId,
    description,
    materials,
    labor,
  } = req.body;

  if (!description || !customerId || !branchId || !truckId)
    return res
      .status(400)
      .json({ message: "Customer, truck, and description are required" });

  try {
    const needsApproval = req.approval;
    let message;
    const newCode = await generateJobOrderCode(prisma);

    const existingJob = await prisma.jobOrder.findUnique({
      where: { jobOrderCode: newCode },
    });
    const pendingJob = await prisma.jobOrderEdit.findFirst({
      where: { jobOrderCode: newCode },
    });

    if (existingJob || pendingJob)
      return res
        .status(400)
        .json({ message: "Job order already exists or awaiting approval" });

    const jobOrderData = {
      customerId,
      branchId,
      truckId,
      description,
      ...(contractorId ? { contractorId } : {}),
      ...(labor ? { labor } : {}),
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const jobOrder = needsApproval
        ? await tx.jobOrderEdit.create({
            data: {
              jobOrderCode: {},
              ...jobOrderData,
              requestType: "create",
            },
          })
        : await tx.jobOrder.create({
            data: { ...jobOrderData, jobOrderCode: newCode },
          });

      message = needsApproval
        ? "Job order awaiting approval"
        : "Job order successfully created";

      return jobOrder;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editJobOrder = async (req, res) => {
  
}

module.exports = { createJobOrder }