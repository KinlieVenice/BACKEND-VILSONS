const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getDateRangeFilter } = require("../../utils/filters/dateRangeFilter");
const { getLastUpdatedAt } = require("../../utils/services/lastUpdatedService");


// CONTRACTOR
const getAllAssignedJobOrdersoLD = async (req, res) => {
  const statusGroup = req?.params.statusGroup; // 'active' or 'archived'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

   if (statusGroup === "active") {
     where = {
       ...where,
       status: { in: ["pending", "ongoing", "completed", "forRelease"] },
     };
   } else if (statusGroup === "archived") {
     where = { ...where, status: "archived" };
   } else if (statusGroup) {
     return res.status(200).json({
       data: { jobOrders: [] },
       pagination: { totalItems: 0, totalPages: 0, currentPage: 1 },
     });
   }

  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
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
    ];
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

const getAllAssignedJobOrders = async (req, res) => {
  const statusGroup = req?.params?.statusGroup; // 'active' or 'archived'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;

  let where = {};

  // Status filter based on statusGroup
  if (statusGroup === "active") {
    where.status = { in: ["pending", "ongoing", "completed", "forRelease"] };
  } else if (statusGroup === "archived") {
    where.status = "archived";
  } else if (statusGroup) {
    return res.status(200).json({
      data: { jobOrders: [] },
      pagination: { totalItems: 0, totalPages: 0, currentPage: 1 },
    });
  }

  // Date range filter
  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) where.createdAt = createdAtFilter;

  // Status query override
  if (status) where.status = status;

  // Search filter
  if (search) {
    const searchValue = search.trim().replace(/^["']|["']$/g, "");
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
    const contractor = await prisma.contractor.findFirst({
      where: { userId: req.id },
    });
    if (!contractor)
      return res.status(404).json({ message: "Contractor not found" });

    const totalItems = await prisma.jobOrder.count({
      where: { contractorId: contractor.id, ...where },
    });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;
    const lastUpdatedAt = await getLastUpdatedAt(prisma, "jobOrder", where);


    const jobOrders = await prisma.jobOrder.findMany({
      where: { contractorId: contractor.id, ...where },
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        truck: { select: { id: true, plate: true } },
        customer: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        contractor: {
          select: {
            id: true,
            userId: true,
            commission: true,
            user: { select: { fullName: true } },
          },
        },
        branch: { select: { id: true, branchName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = jobOrders.map((job) => ({
      id: job.id,
      jobOrderCode: job.jobOrderCode,
      status: job.status,
      plateNumber: job.truck?.plate || null,
      truckId: job.truck?.id || null,
      contractorId: job.contractor?.id || null,
      contractorUserId: job.contractor?.userId || null,
      contractorPercent: job.contractor?.commission || 0,
      contractorName: job.contractor?.user?.fullName || null,
      customerId: job.customer?.id,
      customerUserId: job.customer?.userId,
      customerName: job.customer?.user?.fullName,
      branchId: job.branch?.id || null,
      branchName: job.branch?.branchName || null,
      contractorCommission: Number(job.labor) * Number(job.contractor?.commission || 0),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      createdBy: job.createdByUser,
      updatedBy: job.updatedByUser,
    }));

    return res.status(200).json({
      data: { jobOrders: result },
      pagination: { totalItems, totalPages, currentPage: page || 1 },
      lastUpdatedAt,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};
// CONTRACTOR
const getAssignedJobOrderoLD = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
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

const getAssignedJobOrder = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const jobOrder = await prisma.jobOrder.findFirst({
      where: {
        id: req.params.id,
        contractor: { userId: req.id },
      },
      include: {
        truck: true,
        contractor: { include: { user: true } },
        branch: { select: { id: true, branchName: true } },
        materials: {
          select: { id: true, materialName: true, quantity: true, price: true },
        },
        images: true,
      },
    });

    if (!jobOrder) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this Job Order" });
    }

    const contractorCommission = jobOrder.labor
      ? Number(jobOrder.labor) * Number(jobOrder.contractorPercent)
      : 0;

    let totalMaterialCost = 0;
    const processedMaterials = (jobOrder.materials || []).map((m) => {
      const total = Number(m.price) * Number(m.quantity);
      totalMaterialCost += total;
      return { ...m, total };
    });

    return res.status(200).json({
      data: {
        id: jobOrder.id,
        jobOrderCode: jobOrder.jobOrderCode,
        status: jobOrder.status,
        plate: jobOrder.truck?.plate,
        make: jobOrder.truck?.make,
        model: jobOrder.truck?.model,
        truckId: jobOrder.truck?.id,
        contractorId: jobOrder.contractor?.id || null,
        contractorUserId: jobOrder.contractor?.user?.id || null,
        contractorName: jobOrder.contractor?.user?.fullName || null,
        contractorUsername: jobOrder.contractor?.user?.username || null,
        contractorEmail: jobOrder.contractor?.user?.email,
        contractorPhone: jobOrder.contractor?.user?.phone,
        contractorPercent: jobOrder.contractorPercent,
        labor: Number(jobOrder.labor),
        description: jobOrder.description,
        createdAt: jobOrder.createdAt,
        updatedAt: jobOrder.updatedAt,
        createdBy: jobOrder.createdByUser,
        updatedBy: jobOrder.updatedByUser,
        contractorCommission,
        totalMaterialCost,
        materials: processedMaterials,
        images: jobOrder.images.reduce((acc, image) => {
          const type = image.type || "unknown";
          if (!acc[type]) acc[type] = [];
          acc[type].push(image);
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const acceptJobOrderOld = async (req, res) => {
  const { id, action } = req.params;
  
  if (!id) return res.status(400).json({ message: "Job order ID is required" });
  if (!action || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: "Action must be 'accept' or 'reject'" });
  }

  try {
    // Get contractor first (more efficient)
    const contractor = await prisma.contractor.findFirst({
      where: { userId: req.id }
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor profile not found" });
    }

    // Get job order with contractor relation
    const jobOrder = await prisma.jobOrder.findFirst({ 
      where: { 
        id,
        contractorId: contractor.contractorId // Only find job orders assigned to this contractor
      }
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found or not assigned to you" });
    }

    const isAccepted = action === 'accept';
    const updateData = {
      updatedByUser: req.username,
      status: isAccepted ? "ongoing" : "pending",
      contractorId: isAccepted ? jobOrder.contractorId : null,
    };



    const result = await prisma.jobOrder.update({
      where: { id: jobOrder.id },
      data: updateData,
    });

    const message = isAccepted 
      ? "Job order accepted and set to ongoing" 
      : "Job order rejected and contractor assignment removed";

    return res.status(200).json({ message, data: result });
  } catch (err) {
    console.error("Error in acceptJobOrder:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const acceptJobOrder = async (req, res) => {
  const { id, action } = req.params;

  const allowedActions = ["accept", "reject", "completed"];

  if (!id) {
    return res.status(400).json({ message: "Job order ID is required" });
  }

  if (!allowedActions.includes(action)) {
    return res.status(400).json({
      message: "Action must be 'accept', 'reject', or 'complete'",
    });
  }

  try {
    // Get contractor
    const contractor = await prisma.contractor.findFirst({
      where: { userId: req.id },
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor profile not found" });
    }

    // Find job order assigned to this contractor
    const jobOrder = await prisma.jobOrder.findFirst({
      where: {
        id,
        contractorId: contractor.contractorId,
      },
    });

    if (!jobOrder) {
      return res
        .status(404)
        .json({ message: "Job order not found or not assigned to you" });
    }

    let updateData = {
      updatedByUser: req.username,
    };

    // 🔹 ACTION LOGIC
    switch (action) {
      case "accept":
        if (jobOrder.status !== "pending") {
          return res.status(400).json({
            message: "Only pending job orders can be accepted",
          });
        }

        updateData.status = "ongoing";
        break;

      case "reject":
        if (jobOrder.status !== "pending") {
          return res.status(400).json({
            message: "Only pending job orders can be rejected",
          });
        }

        updateData.status = "pending";
        updateData.contractorId = null;
        break;

      case "completed":
        if (jobOrder.status !== "ongoing") {
          return res.status(400).json({
            message: "Only ongoing job orders can be completed",
          });
        }

        updateData.status = "completed";
        updateData.completedAt = new Date(); // optional but recommended
        break;
    }

    const result = await prisma.jobOrder.update({
      where: { id: jobOrder.id },
      data: updateData,
    });

    return res.status(200).json({
      message: `Job order ${action}ed successfully`,
      data: result,
    });
  } catch (err) {
    console.error("Error in acceptJobOrder:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllAssignedJobOrders,
  getAssignedJobOrder,
  acceptJobOrder
};