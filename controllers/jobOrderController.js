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

  if (!description || !customerId || !branchId || !truckId) {
    return res
      .status(400)
      .json({ message: "Customer, truck, and description are required" });
  }

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

    if (existingJob || pendingJob) {
      return res
        .status(400)
        .json({ message: "Job order already exists or awaiting approval" });
    }

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
      let jobOrder;

      if (needsApproval) {
        jobOrder = await tx.jobOrderEdit.create({
          data: {
            jobOrderCode: null,
            jobOrderId: null,
            ...jobOrderData,
            requestType: "create",
          },
        });

        if (materials && materials.length > 0) {
          await tx.materialEdit.createMany({
            data: materials.map((m) => ({
              jobOrderId: null,
              materialName: m.name,
              quantity: m.quantity,
              price: m.price,
              requestType: "create",
            })),
          });
        }
      } else {
        jobOrder = await tx.jobOrder.create({
          data: { ...jobOrderData, jobOrderCode: newCode },
        });

        if (materials && materials.length > 0) {
          await tx.material.createMany({
            data: materials.map((m) => ({
              jobOrderId: jobOrder.id,
              materialName: m.name,
              quantity: m.quantity,
              price: m.price,
            })),
          });
        }
      }

      message = needsApproval
        ? "Job order awaiting approval"
        : "Job order successfully created";

      return jobOrder;
    });

    return res.status(201).json({
      message,
      data: {
        ...result,
        materials: materials || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editJobOrder = async (req, res) => {
  const {
    customerId,
    truckId,
    branchId,
    contractorId,
    description,
    materials,
    labor,
  } = req.body;

  if (!req?.body?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.body.id },
    });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.body.id} not found` });

    const needsApproval = false;
    let message;

    const jobOrderData = {
      customerId: customerId ?? jobOrder.customerId,
      truckId: truckId ?? jobOrder.truckId,
      branchId: branchId ?? jobOrder.branchId,
      description: description ?? jobOrder.description,
      ...(contractorId ? { contractorId } : {}),
      ...(labor ? { labor } : {}),
      updatedByUser: req.username,
    };
    const result = await prisma.$transaction(async (tx) => {
      let editedJobOrder;
      message = needsApproval ? "Job Order edit awaiting approval" : "Job order successfully edited";

      if (needsApproval) {
        editedJobOrder = await tx.jobOrderEdit.create({
          data: {
            jobOrderId: jobOrder.id,
            jobOrderCode: jobOrder.jobOrderCode,
            ...jobOrderData,
            requestType: "edit",
            createdByUser: req.username,
          },
        });

        if (materials && materials.length > 0) {
          await tx.materialEdit.createMany({
            data: materials.map((m) => ({
              jobOrderId: jobOrder.id,
              materialName: m.name,
              quantity: m.quantity,
              price: m.price,
              requestType: "edit",
            })),
          });
        }

         return editedJobOrder;
      } else {
        editedJobOrder = await tx.jobOrder.update({
          where: { id: jobOrder.id },
          data: jobOrderData,
        });

        if (materials && materials.length > 0) {
          await tx.material.deleteMany({
            where: { jobOrderId: jobOrder.id },
          });

          // Insert new materials
          await tx.material.createMany({
            data: materials.map((m) => ({
              jobOrderId: jobOrder.id,
              materialName: m.name,
              quantity: m.quantity,
              price: m.price,
            })),
          });
        }

        return editedJobOrder;
      }

    });

    return res.status(201).json({ message, data: result, materials: materials || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createJobOrder, editJobOrder };
