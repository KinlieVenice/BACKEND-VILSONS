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
      where: { id: req.params.id },
    });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.params.id} not found` });

    const needsApproval = req.approval;
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
      message = needsApproval
        ? "Job Order edit awaiting approval"
        : "Job order successfully edited";

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
      }

      return editedJobOrder;
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

const deleteJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const needsApproval = req.approval;
    let message;
    let deletedJobOrder;
    let responseMaterials = [];

    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.params.id },
    });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.params.id} not found` });

    const result = await prisma.$transaction(async (tx) => {
      const materials = await tx.material.findMany({
        where: { jobOrderId: jobOrder.id },
      });

      if (needsApproval) {
        deletedJobOrder = await tx.jobOrderEdit.create({
          data: {
            jobOrderId: jobOrder.id,
            jobOrderCode: jobOrder.jobOrderCode,
            customerId: jobOrder.customerId || null,
            truckId: jobOrder.truckId || null,
            branchId: jobOrder.branchId || null,
            contractorId: jobOrder.contractorId || null,
            description: jobOrder.description || null,
            labor: jobOrder.labor || null,
            status: jobOrder.status,
            completedAt: jobOrder.completedAt || null,
            requestType: "delete",
            createdByUser: req.username,
            updatedByUser: req.username,
          },
        });

        const materialEdits = await tx.materialEdit.createMany({
          data: materials.map((m) => ({
            jobOrderId: jobOrder.id,
            materialName: m.materialName,
            quantity: m.quantity,
            price: m.price,
            requestType: "delete",
          })),
        });

        responseMaterials = await tx.materialEdit.findMany({
          where: {
            jobOrderId: jobOrder.id,
            requestType: "delete",
            approvalStatus: "pending",
          },
        });

        message = "Job Order delete awaiting approval";
      } else {
        await tx.material.deleteMany({ where: { jobOrderId: jobOrder.id } });
        deletedJobOrder = await tx.jobOrder.delete({
          where: { id: jobOrder.id },
        });

        responseMaterials = materials;
        message = "Job order successfully deleted";
      }

      return deletedJobOrder;
    });

    return res.status(201).json({
      message,
      data: {
        ...result,
        materials: responseMaterials,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (branch) {
    where.branch = {
      branchName: { contains: branch },
    };
  }

  if (status) {
    where.status = status; 
  }

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
      {
        customer: {
          user: {
            OR: [
              { username: { contains: search } },
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      },
      {
        contractor: {
          user: {
            OR: [
              { username: { contains: search } },
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      },
    ];
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      return tx.jobOrder.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          truck: true,
          branch: {
            select: { branchName: true, address: true }, // single branch, not array
          },
          customer: {
            include: {
              user: true,
            },
          },
          contractor: {
            include: {
              user: true,
            },
          },
          materials: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id: req.params.id },
      include: {
        materials: true,
      },
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job Order not found" });
    }

    return res.status(200).json({ data: jobOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAssignedJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
    ];
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const contractor = await prisma.contractor.findFirst({ where: { userId: req.id }});

    console.log(contractor.id)
    const jobOrder = await prisma.jobOrder.findMany({
      where: {
        contractorId: contractor.id,
        ...where, 
      },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        materials: true,
        truck: true, 
      },
      orderBy: { createdAt: "desc" },
    });


    if (!jobOrder) {
      return res.status(404).json({ message: "Job Orders not found" });
    }

    return res.status(200).json({ data: jobOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getMyJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
    ];
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const customer = await prisma.customer.findFirst({ where: { userId: req.id }});

    const jobOrder = await prisma.jobOrder.findMany({
      where: {
        customerId: customer.id,
        ...where, 
      },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        materials: true,
        truck: true, 
      },
      orderBy: { createdAt: "desc" },
    });


    if (!jobOrder) {
      return res.status(404).json({ message: "Job Orders not found" });
    }

    return res.status(200).json({ data: jobOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createJobOrder,
  editJobOrder,
  deleteJobOrder,
  getAllJobOrders,
  getAssignedJobOrders,
  getJobOrder,
  getMyJobOrders,
};
