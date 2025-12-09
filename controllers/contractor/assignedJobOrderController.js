const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getDateRangeFilter } = require("../../utils/filters/dateRangeFilter");

// CONTRACTOR
const getAllAssignedJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate; // e.g. "2025-01-01"
  const endDate = req?.query?.endDate; // e.g. "2025-01-31"

  let where = {};

  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) { where.createdAt = createdAtFilter; }

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

// CONTRACTOR
const getAssignedJobOrder = async (req, res) => {
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

const acceptJobOrder = async (req, res) => {
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

module.exports = {
  getAllAssignedJobOrders,
  getAssignedJobOrder,
  acceptJobOrder
};