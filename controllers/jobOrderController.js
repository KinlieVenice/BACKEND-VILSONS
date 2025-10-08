const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const generateJobOrderCode = require("../utils/generateJobOrderCode");
const relationsChecker = require("../utils/relationsChecker");
const { getDateRangeFilter } = require("../utils/dateRangeFilter");
const { branchFilter } = require("../utils/branchFilter"); 



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
    return res.status(400).json({
      message: "Customer, truck, branch, and description are required",
    });
  }

  try {
    // Validate existence of required foreign keys
    const [customer, truck, branch] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.truck.findUnique({ where: { id: truckId } }),
      prisma.branch.findUnique({ where: { id: branchId } }),
    ]);

    if (!customer) return res.status(400).json({ message: "Invalid customer ID" });
    if (!truck) return res.status(400).json({ message: "Invalid truck ID" });
    if (!branch) return res.status(400).json({ message: "Invalid branch ID" });

    // Validate contractor if provided
    let contractor = null;
    if (contractorId) {
      contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
      if (!contractor)
        return res.status(400).json({ message: "Invalid contractor ID" });
    }

    // Validate if customer owns the truck (ownership with no endDate)
    const ownership = await prisma.truckOwnership.findFirst({
      where: { truckId, customerId, endDate: null },
    });

    if (!ownership) {
      return res.status(400).json({
        message: "This truck is not currently owned by the specified customer",
      });
    }

    // -------------------------------------------------------------
    // Proceed if all validation passes
    // -------------------------------------------------------------
    const needsApproval = req.approval;
    const newCode = await generateJobOrderCode(prisma);

    const jobOrderData = {
      customerId,
      branchId,
      truckId,
      description,
      ...(contractorId && { contractorId }),
      ...(labor && { labor }),
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    let contractorPercent = 0,
      contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    const result = await prisma.$transaction(async (tx) => {
      // Compute contractor commission if applicable
      if (contractor && labor) {
        contractorPercent = contractor.commission;
        contractorCommission = labor * contractorPercent;
        shopCommission = labor - contractorCommission;
      }

      const jobOrderModel = needsApproval ? tx.jobOrderEdit : tx.jobOrder;
      const materialModel = needsApproval ? tx.materialEdit : tx.material;

      const jobOrderInclude = {
        truck: { select: { id: true, plate: true } },
        customer: { include: { user: { select: { username: true, fullName: true } } } },
        contractor: contractorId
          ? { include: { user: { select: { username: true, fullName: true } } } }
          : false,
        branch: { select: { id: true, branchName: true } },
      };

      const jobOrder = await jobOrderModel.create({
        data: {
          ...jobOrderData,
          jobOrderCode: needsApproval ? null : newCode,
          requestType: needsApproval ? "create" : undefined,
          contractorPercent,
        },
        include: jobOrderInclude,
      });

      // Handle materials
      if (materials && materials.length > 0) {
        const invalid = materials.some(
          (m) => !m.name || !m.price || !m.quantity
        );
        if (invalid)
          return res.status(400).json({
            message:
              "Each material must include non-empty name, non-zero price, and non-zero quantity",
          });

        await materialModel.createMany({
          data: materials.map((m) => ({
            jobOrderId: needsApproval ? null : jobOrder.id,
            materialName: m.name,
            quantity: m.quantity,
            price: m.price,
            ...(needsApproval && { requestType: "create" }),
          })),
        });

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return jobOrder;
    });

    const {
      truckId: _,
      customerId: __,
      contractorId: ___,
      branchId: ____,
      ...jobOrderFields
    } = result;

    return res.status(201).json({
      message: needsApproval
        ? "Job order awaiting approval"
        : "Job order successfully created",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
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

  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.params.id },
    });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.params.id} not found` });

    const needsApproval = true;
    let message;

    const jobOrderData = {
      customerId: customerId ?? jobOrder.customerId,
      truckId: truckId ?? jobOrder.truckId,
      branchId: branchId ?? jobOrder.branchId,
      description: description ?? jobOrder.description,
      contractorId:
        contractorUsername === ""
          ? null
          : contractorId ?? jobOrder.contractorId,
      labor: labor === "" ? null : labor ?? jobOrder.labor,
      updatedByUser: req.username,
      jobOrderId: needsApproval ? jobOrder.id : undefined,
      jobOrderCode: jobOrder.jobOrderCode,
      requestType: needsApproval ? "edit" : undefined,
      createdByUser: needsApproval ? req.username : jobOrder.createdByUser,
    };

    let contractorPercent = 0,
      contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    const result = await prisma.$transaction(async (tx) => {
      message = needsApproval
        ? "Job Order edit awaiting approval"
        : "Job order successfully edited";

      if (contractorId && labor) {
        const contractor = await tx.contractor.findUnique({
          where: { id: contractorId },
        });
        contractorPercent = contractor.commission;
        contractorCommission = labor * contractorPercent;
        shopCommission = labor - contractorCommission;
      }

      const jobOrderInclude = {
        truck: { select: { id: true, plate: true } },
        customer: {
          include: { user: { select: { username: true, fullName: true } } },
        },
        contractor: contractorId
          ? {
              include: { user: { select: { username: true, fullName: true } } },
            }
          : false,
        branch: { select: { id: true, branchName: true } },
      };

      const editedJobOrder = needsApproval
        ? await tx.jobOrderEdit.create({
            data: jobOrderData,
            include: jobOrderInclude,
          })
        : await tx.jobOrder.update({
            where: { id: jobOrder.id },
            data: jobOrderData,
            include: jobOrderInclude,
          });

      if (materials && materials.length > 0) {
        const invalid = materials.some(
          (m) => !m.name || !m.price || !m.quantity
        );
        if (invalid)
          return res
            .status(400)
            .json({
              message:
                "Each material must include non-empty name, non-zero price, and non-zero quantity",
            });

        const materialData = materials.map((m) => ({
          jobOrderId: jobOrder.id,
          materialName: m.name,
          quantity: m.quantity,
          price: m.price,
          ...(needsApproval && { requestType: "edit" }),
        }));

        if (needsApproval)
          await tx.materialEdit.createMany({ data: materialData });
        else {
          await tx.material.deleteMany({ where: { jobOrderId: jobOrder.id } });
          await tx.material.createMany({ data: materialData });
        }

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return editedJobOrder;
    });

    const {
      truckId: _,
      customerId: __,
      contractorId: ___,
      branchId: ____,
      ...jobOrderFields
    } = result;

    return res
      .status(201)
      .json({
        message: needsApproval
          ? "Job order awaiting approval"
          : "Job order successfully created",
        data: {
          ...jobOrderFields,
          contractorCommission,
          shopCommission,
          totalMaterialCost,
          materials: materials || result.materials,
        },
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const acceptJobOrder = async (req, res) => {
  const { id, accept } = req.params;
  if (!id) return res.status(400).json({ message: "ID is required" });
  console.log(id);

  try {
    const jobOrder = await prisma.jobOrder.findFirst({ where: { id } });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${id} not found` });

    if (!jobOrder.contractorId)
      return res
        .status(403)
        .json({ message: "This job order has no contractor assigned" });

    const contractor = await prisma.contractor.findFirst({
      where: { id: jobOrder.contractorId },
    });
    if (!contractor)
      return res.status(404).json({ message: `User is not a contractor` });

    if (contractor.userId !== req.id || jobOrder.contractorId === null) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this job order" });
    }

    const isAccepted = accept === "true";

    const result = await prisma.jobOrder.update({
      where: { id: jobOrder.id },
      data: {
        status: isAccepted ? "ongoing" : "pending",
        contractorId: isAccepted ? jobOrder.contractorId : null,
        updatedByUser: req.username,
      },
    });

    let message = `Job order is now set to ${result.status}`;

    return res.status(200).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editJobOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  try {
    const jobOrder = await prisma.jobOrder.findFirst({ where: { id } });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${id} not found` });

    if (!jobOrder.contractorId)
      return res.status(404).json({ message: "No contractor assigned yet" });

    if (status === "pending")
      return res
        .status(404)
        .json({ message: "Status can't be pending if contractor is assigned" });

    const needsApproval = req.approval;
    let message;

    const jobOrderData = {
      status,
      contractorId: jobOrder.contractorId,
      updatedByUser: req.username,
      jobOrderId: needsApproval ? jobOrder.id : undefined,
      jobOrderCode: jobOrder.jobOrderCode,
      requestType: needsApproval ? "edit" : undefined,
      createdByUser: needsApproval ? req.username : jobOrder.createdByUser,
    };

    const result = await prisma.$transaction(async (tx) => {
      message = needsApproval
        ? "Job Order status awaiting approval"
        : "Job order status successfully updated";

      return needsApproval
        ? tx.jobOrderEdit.create({ data: jobOrderData })
        : tx.jobOrder.update({
            where: { id: jobOrder.id },
            data: jobOrderData,
          });
    });

    return res.status(200).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const needsApproval = req.approval;
    let deletedJobOrder;
    let message;

    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.params.id },
      include: {
        transactions: true,
      }
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

        message = "Job order delete awaiting approval"
      } else {
        const excludedKeys = ["labor", "contractorPercent"]
        const hasRelations = relationsChecker(jobOrder, excludedKeys);
        console.log(hasRelations)

        if (hasRelations) {
          throw new Error("Job order cannot be deleted as its connnected to other records"); 
        }
        
        await tx.material.deleteMany({ where: { jobOrderId: jobOrder.id } });
        await tx.materialEdit.deleteMany({ where: { jobOrderId: jobOrder.id } });
        await tx.jobOrderEdit.deleteMany({ where: { jobOrderId: jobOrder.id } });

        deletedJobOrder = await tx.jobOrder.delete({
          where: { id: jobOrder.id },
        });

        message = "Job Order successfully deleted as well as materials"
      }
      return deletedJobOrder;
    });

    return res.status(200).json({ message });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllJobOrders = async (req, res) => {
  const statusGroup = req?.params.statusGroup; // 'active' or 'archive'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;
  
  let where;

  // Add status filter based on statusGroup
  if (statusGroup === 'active') {
    where = { ...where, status: { in: ['pending', 'ongoing', 'completed', 'forRelease'] } };
  } else if (statusGroup === 'archived') {
    where = { ...where, status: 'archive' };
  } else if (statusGroup) {
    return res.status(200).json({ data: { jobOrders: [], }, pagination: { totalItems: 0, totalPages: 0, currentPage: 1 } });
  }

  where = {...where, ...branchFilter("jobOrder", branch, req.branchIds)};
  
  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
  }
  
  // If specific status is provided in query, it overrides the statusGroup
  if (status) {
    where.status = status;
  }
  
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      {
        truck: {
          OR: [
            { plate: { contains: searchValue } },
            { make: { contains: searchValue } },
            { model: { contains: searchValue } },
          ],
        },
      },
      {
        customer: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
      {
        contractor: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
    ];
  }

  try {
    const totalItems = await prisma.jobOrder.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;
    
    const jobOrders = await prisma.jobOrder.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        truck: {
          select: {
            id: true,
            plate: true
          }
        },
        customer: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                fullName: true
              }
            },
          },
        },
        contractor: {
          select: {
            id: true,
            userId: true,
            commission: true,
            user: {
              select: {
                fullName: true
              }
            },
          },
        },
        branch: {
          select: {
            id: true,
            branchName: true
          }
        },
        materials: {
          select: {
            price: true,
            quantity: true
          },
        },
      },
      orderBy: {
        createdAt: "desc"
      },
    });

    // compute commissions & flatten output
    const result = jobOrders.map((job) => {
      let contractorCommission = 0,
        shopCommission = 0,
        totalMaterialCost = 0;

      if (job.contractor && job.labor) {
        contractorCommission = job.labor * Number(job.contractor.commission);
        shopCommission = job.labor - contractorCommission;
      }

      if (job.materials?.length) {
        totalMaterialCost = job.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
      }

      const totalBill = Number(shopCommission) + Number(contractorCommission) + Number(totalMaterialCost);

      return {
        jobOrderId: job.id,
        jobOrderCode: job.jobOrderCode,
        status: job.status,
        plateNumber: job.truck?.plate,
        truckId: job.truck?.id,
        contractorId: job.contractor?.id || null,
        contractorUserId: job.contractor?.userId || null,
        contractorName: job.contractor?.user?.fullName || null,
        customerId: job.customer?.id,
        customerUserId: job.customer?.userId,
        customerName: job.customer?.user?.fullName,
        branchId: job.branch?.id || null,
        branchName: job.branch?.branchName || null,
        totalMaterialCost,
        contractorCommission,
        shopCommission,
        totalBill,
        balance: totalBill, // adjust if you track payments separately
        // new audit fields
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    return res.status(200).json({
      data: {
        jobOrders: result,
      },
      pagination: {
          totalItems,
          totalPages,
          currentPage: page || 1,
        },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const jobOrderInclude = {
      truck: { select: { id: true, plate: true } },
      customer: {
        include: { user: { select: { id: true, username: true, fullName: true } } },
      },
      contractor: {
        include: { user: { select: { id: true, username: true, fullName: true } } },
      },
      branch: { select: { id: true, branchName: true } },
      materials: { select: { materialName: true, quantity: true, price: true } },
    };

    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id: req.params.id },
      include: jobOrderInclude,
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job Order not found" });
    }

    let contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    // calculate commissions
    if (jobOrder.contractorId && jobOrder.labor) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: jobOrder.contractorId },
      });
      if (contractor) {
        contractorCommission = jobOrder.labor * contractor.commission;
        shopCommission = jobOrder.labor - contractorCommission;
      }
    }

    // calculate total material cost
    if (jobOrder.materials && jobOrder.materials.length > 0) {
      totalMaterialCost = jobOrder.materials.reduce(
        (sum, m) => sum + m.price * m.quantity,
        0
      );
    }

    const totalBill =
        Number(shopCommission) + Number(contractorCommission) + Number(totalMaterialCost);

    return res.status(200).json({
      data: {
        id: jobOrder.id,
        jobOrderCode: jobOrder.jobOrderCode,
        status: jobOrder.status,
        plateNumber: jobOrder.truck?.plate,
        truckId: jobOrder.truck?.id,
        contractorId: jobOrder.contractor?.id  || null,
        contractorUserId: jobOrder.contractor?.user?.id  || null,
        contractorName: jobOrder.contractor?.user?.fullName  || null,
        customerId: jobOrder.customer?.id,
        customerUserId: jobOrder.customer?.user?.id,
        customerName: jobOrder.customer?.user?.fullName,
        branchId: jobOrder.branch?.id  || null,
        branchName: jobOrder.branch?.branchName  || null,
        totalBill,
        balance: jobOrder.balance,
        description: jobOrder.description,
        createdAt: jobOrder.createdAt,
        updatedAt: jobOrder.updatedAt,
        createdBy: jobOrder.createdByUser,
        updatedBy: jobOrder.updatedByUser,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: jobOrder.materials,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllAssignedJobOrders = async (req, res) => {
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
    const result = await prisma.$transaction(async (tx) => {
      const contractor = await prisma.contractor.findFirst({
        where: { userId: req.id },
      });
      const jobOrder = await prisma.jobOrder.findMany({
        where: {
          contractorId: contractor.id,
          ...where,
        },
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          truck: { select: { id: true, plate: true } },
          contractor: {
            include: { user: { select: { username: true, fullName: true } } },
          },
          branch: { select: { id: true, branchName: true } },
          materials: { select: { materialName: true, quantity: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!jobOrder) {
        return res.status(404).json({ message: "Job Orders not found" });
      }

      return jobOrder;
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAssignedJobOrder = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Job Order ID is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const contractor = await tx.contractor.findFirst({
        where: { userId: req.id },
      });

      if (!contractor) return res.status(400).json({ message: "You must be a contractor"})

      // Step 2: Find the job order with params.id AND contractorId
      const jobOrder = await tx.jobOrder.findFirst({
        where: {
          id: req.params.id, // only this job order
          contractorId: contractor.id,
        },
        include: {
          truck: { select: { id: true, plate: true } },
          contractor: {
            include: { user: { select: { username: true, fullName: true } } },
          },
          branch: { select: { id: true, branchName: true } },
          materials: { select: { materialName: true, quantity: true } },
        },
      });

      return jobOrder;
    });

    if (!result) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this Job Order" });
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllMyJobOrders = async (req, res) => {
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
    const customer = await prisma.customer.findFirst({
      where: { userId: req.id },
    });

    const jobOrder = await prisma.jobOrder.findMany({
      where: {
        customerId: customer.id,
        ...where,
      },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        truck: { select: { id: true, plate: true } },
        customer: {
          include: { user: { select: { username: true, fullName: true } } },
        },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { materialName: true, quantity: true } },
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

const getMyJobOrder = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Job Order ID is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { userId: req.id },
      });

      if (!customer)
        return res.status(400).json({ message: "You must be a customer" });

      // Step 2: Find the job order with params.id AND customerId
      const jobOrder = await tx.jobOrder.findFirst({
        where: {
          id: req.params.id, // only this job order
          customerId: customer.id,
        },
        include: {
          truck: { select: { id: true, plate: true } },
          customer: {
            include: { user: { select: { username: true, fullName: true } } },
          },
          branch: { select: { id: true, branchName: true } },
          materials: { select: { materialName: true, quantity: true } },
        },
      });

      return jobOrder;
    });

    if (!result) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this Job Order" });
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createJobOrder,
  editJobOrder,
  deleteJobOrder,
  getAllJobOrders,
  getAllAssignedJobOrders,
  getAssignedJobOrder,
  editJobOrderStatus,
  getJobOrder,
  getAllMyJobOrders,
  getMyJobOrder,
  acceptJobOrder,
};
