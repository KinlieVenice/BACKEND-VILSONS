const { PrismaClient } = require("../generated/prisma");
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
    let newCode;

    const lastOrder = await prisma.jobOrder.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!lastOrder) {
      // First ever job order
      newCode = "JO-00001";
    } else {
      // Extract the number part, increment it
      const lastNumber = parseInt(lastOrder.jobOrderCode.replace("JO-", ""));
      const nextNumber = lastNumber + 1;

      // Format with leading zeros (5 digits)
      newCode = `JO-${String(nextNumber).padStart(5, "0")}`;
    }

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
      jobOrderCode: newCode,
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
              ...jobOrderData,
              requestType: "create",
            },
          })
        : await tx.jobOrder.create({
            data: jobOrderData,
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

module.exports = { createJobOrder }