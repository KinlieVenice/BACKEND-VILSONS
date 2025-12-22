const { getDateRangeFilter, } = require("../../utils/filters/dateRangeFilter");
const jobOwnerFinder = require("../../utils/finders/jobOwnerFinder");


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/*
  plate       String   @db.VarChar(10)
  make        String   @db.VarChar(20)
  model       String   @db.VarChar(20)
  createdAt   DateTime @default(now())
  createdByUser String
*/

const getAllMyTrucks = async (req, res) => {
  try {
    const search = req?.query?.search;
    const page = req?.query?.page ? parseInt(req.query.page, 10) : undefined;
    const limit = req?.query?.limit ? parseInt(req.query.limit, 10) : undefined;
    const startDate = req?.query?.startDate;
    const endDate = req?.query?.endDate;

    // Build filter
    const where = {};
    const createdAtFilter = getDateRangeFilter(startDate, endDate);
    if (createdAtFilter) where.createdAt = createdAtFilter;
    if (search) {
      where.OR = [
        { plate: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
        { engine: { contains: search } },
      ];
    }

    // Find customer
    const customer = await prisma.customer.findFirst({
      where: { userId: req.id },
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // Fetch trucks with owners
    const trucks = await prisma.truck.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        owners: {
          where: { customerId: customer.id, endDate: null },
          orderBy: { startDate: "desc" },
          include: {
            customer: {
              include: {
                user: { select: { fullName: true, id: true, username: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map trucks
    const trucksWithOwner = trucks.map((truck) => ({
      id: truck.id,
      plate: truck.plate,
      make: truck.make,
      model: truck.model,
      image: truck.image,
      engine: truck.engine,
      customerId: truck.owners[0]?.customer?.id || null,
      customerUserId: truck.owners[0]?.customer?.user?.id || null,
      customerFullName: truck.owners[0]?.customer?.user?.fullName || null,
      customerUsername: truck.owners[0]?.customer?.user?.username || null,
      createdAt: truck.createdAt,
    }));

    const totalItems = await prisma.truck.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    return res.status(200).json({
      data: { trucks: trucksWithOwner, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const getMyTruck = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const truck = await prisma.truck.findUnique({
      where: { id: req.params.id },
      include: {
        owners: {
          orderBy: { startDate: "desc" }, // newest ownership first
          include: { customer: { include: { user: true } } },
        },
        jobOrders: {
          include: { materials: true },
        },
      },
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Map owners and mark current ownership
    const owners = truck.owners.map((owner) => ({
      customerId: owner.customer?.id || null,
      userId: owner.customer?.user?.id || null,
      fullName: owner.customer?.user?.fullName || null,
      username: owner.customer?.user?.username || null,
      transferredByUser: owner.transferredByUser,
      startDate: owner.startDate,
      endDate: owner.endDate,
      isCurrentOwner: owner.endDate === null && owner.customerId === req.id,
    }));

    // Map job orders
    const jobOrders = truck.jobOrders.map((jo) => {
      const ownerAtCreation = owners.find(
        (o) =>
          new Date(o.startDate) <= new Date(jo.createdAt) &&
          (!o.endDate || new Date(o.endDate) >= new Date(jo.createdAt))
      );

      const materialsTotal = jo.materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      const totalBill = (Number(jo.labor) || 0) + materialsTotal;

      return {
        jobOrderId: jo.id,
        jobOrderCode: jo.jobOrderCode,
        customerId: ownerAtCreation?.customerId,
        customerUserId: ownerAtCreation?.userId,
        customerFullName: ownerAtCreation?.fullName,
        customerUsername: ownerAtCreation?.username,
        createdAt: jo.createdAt,
        totalBill,
        status: jo.status,
      };
    });

    // Group job orders by status
    const activeStatuses = ["pending", "ongoing", "completed", "forRelease"];
    const activeJobOrders = jobOrders.filter((jo) =>
      activeStatuses.includes(jo.status)
    );
    const archivedJobOrders = jobOrders.filter((jo) => jo.status === "archive");

    const truckWithOwnersAndJobOrders = {
      ...truck,
      owners,
      jobOrders: {
        active: activeJobOrders,
        archived: archivedJobOrders,
      },
      jobOrderSummary: {
        activeCount: activeJobOrders.length,
        archivedCount: archivedJobOrders.length,
      },
    };

    return res.status(200).json({ data: truckWithOwnersAndJobOrders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



module.exports = {
  getAllMyTrucks,
  getMyTruck,
};
