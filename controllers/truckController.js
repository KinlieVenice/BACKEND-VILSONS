const truckIdFinder = require("../utils/truckIdFinder");
const customerIdFinder = require("../utils/customerIdFinder");
const jobOwnerFinder = require("../utils/jobOwnerFinder");
const { getDateRangeFilter } = require("../utils/dateRangeFilter");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/*
  plate       String   @db.VarChar(10)
  make        String   @db.VarChar(20)
  model       String   @db.VarChar(20)
  createdAt   DateTime @default(now())
  createdByUser String
*/

const createTruck = async (req, res) => {
  const { plate, make, model } = req.body;
  if (!plate || !make || !model)
    return res
      .status(400)
      .json({ message: "Plate number, make, and model are required" });

  try {
    const existingTruck = await prisma.truck.findFirst({
      where: { plate },
    });

    const pendingTruck = await prisma.truckEdit.findFirst({
      where: {
        plate,
        approvalStatus: "pending",
      },
    });

    if (existingTruck || pendingTruck) {
      return res.status(400).json({
        message: "Truck already exists or is pending approval",
      });
    }

    const needsApproval = req.approval;
    let message;

    const truckData = {
      plate,
      make,
      model,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const truck = needsApproval
        ? await tx.truckEdit.create({
            data: { ...truckData, requestType: "create" },
          })
        : await tx.truck.create({
            data: truckData,
          });

      message = needsApproval
        ? "Truck is awaiting approval"
        : "Truck is successfully created";

      return truck;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editTruck = async (req, res) => {
  const { plate, make, model } = req.body;

  try {
    if (!req?.params?.id)
      return res.status(400).json({ message: "ID is required" });

    const truck = await prisma.truck.findFirst({
      where: { id: req.params.id },
    });

    if (!truck)
      return res
        .status(404)
        .json({ message: `Truck with ID: ${req.params.id} not found` });

    if (plate) {
      const existingTruck = await prisma.truck.findFirst({
        where: { plate },
      });

      const pendingTruck = await prisma.truckEdit.findFirst({
        where: {
          plate,
          approvalStatus: "pending",
        },
      });

      if (existingTruck || pendingTruck) {
        return res.status(400).json({
          message: "Truck already exists or is pending approval",
        });
      }
    }
    const needsApproval = req.approval;
    let message;
    const truckData = {
      plate: plate ?? truck.plate,
      make: make ?? truck.make,
      model: model ?? truck.model,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const truck_edit = needsApproval
        ? await tx.truckEdit.create({
            data: {
              truckId: truck.id,
              ...truckData,
              createdByUser: req.username,
              requestType: "edit",
            },
          })
        : await tx.truck.update({
            where: { id: truck.id },
            data: truckData,
          });

      message = needsApproval
        ? "Truck edit is awaiting approval"
        : "Truck successfully edited";

      return truck_edit;
    });

    return res.status(201).json({
      message,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editTruckOwner = async (req, res) => {
  const { truckId, customerId } = req.body;

  if (!truckPlate || !customerUsername) {
    return res
      .status(400)
      .json({ message: "truckPlate and customerUsername are required" });
  }

  try {
    const needsApproval = req.approval;
    let message;
    let newTruckOwner;

    const truckData = {
      truckId,
      customerId,
      transferredByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const truck = await tx.truck.findUnique({ where: { id: truckId } });
      if (!truck) return res.status(404).json({ message: "Truck not found" });

      const pendingEdit = await tx.truckOwnershipEdit.findFirst({
        where: {
          truckId,
          approvalStatus: "pending", 
        },
      });

      if (pendingEdit) return res.status(400).json({ message: "Truck already has a pending ownership transfer request" });

      // Get latest ownership
      const latestOwner = await tx.truckOwnership.findFirst({
        where: { truckId },
        orderBy: { startDate: "desc" },
      });

      if (
        latestOwner &&
        !latestOwner.endDate &&
        latestOwner.customerId === customerId
      ) return res.status(400).json({ message: "Truck is already owned by this customer" });
    
      if (needsApproval) {
        newTruckOwner = await tx.truckOwnershipEdit.create({
          data: { ...truckData, requestType: "edit" },
        });
        message = "Truck owner transfer awaiting approval";
      } else {
        if (latestOwner) {
          // End previous ownership
          await tx.truckOwnership.update({
            where: { id: latestOwner.id },
            data: { endDate: new Date() },
          });
        }

        // Create new ownership if no previous owner
        newTruckOwner = await tx.truckOwnership.create({ data: truckData });
        message = "Truck owner successfully transferred";
      }

      return newTruckOwner;
    });

    return res.status(201).json({
      message,
      data: { result },
    });
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }
};

// add check relation before delete
const deleteTruck = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  const truck = await prisma.truck.findUnique({ where: { id: req.params.id } });

  if (!truck) {
    return res.status(404).json({ message: "Truck not found" });
  }
  try {
    const needsApproval = req.approval;
    let message;
    const truckData = {
      plate: truck.plate,
      make: truck.make,
      model: truck.model,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const deletedTruck = needsApproval
        ? await tx.truckEdit.create({
            data: truckData,
          })
        : await tx.truck.delete({
            where: { id: truck.id },
          });

      message = needsApproval
        ? "Truck delete is awaiting approval"
        : "Truck is successfully deleted";

      return truckData;
    });
    return res
      .status(201)
      .json({ message, plate: result.plate });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllTrucks = async (req, res) => {
  try {
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const startDate = req?.query?.startDate;
    const endDate = req?.query?.endDate;
    let totalItems = 0;
    let totalPages = 1;

    let where = {};

    const createdAtFilter = getDateRangeFilter(startDate, endDate);
    if (createdAtFilter) {
      where.createdAt = createdAtFilter;
    }

    if (search) {
      where.OR = [
        { plate: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const result = await prisma.$transaction(async (tx) => {
      const trucks = await tx.truck.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          owners: {
            where: { endDate: null }, // only active owners
            include: {
              customer: {
                include: {
                  user: { select: { fullName: true, id: true } },
                },
              },
            },
          },
        },
      });

      const trucksWithOwner = trucks.map((truck) => ({
        id: truck.id,
        plate: truck.plate,
        make: truck.make,
        model: truck.model,
        customerId: truck.owners[0]?.customer?.id || null,
        customerUserId: truck.owners[0]?.customer?.user?.id || null,
        customerFullName: truck.owners[0]?.customer?.user?.fullName || null, // irst active owner only
        createdAt: truck.createdAt,
      }));

      totalItems = await tx.truck.count({ where });
      if (limit) {
        totalPages = Math.ceil(totalItems / limit);
      }

      return { trucks: trucksWithOwner };
    });

    return res.status(200).json({
      data: { ...result, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getTruck = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {

    const truck = await prisma.truck.findUnique({
      where: { id: req.params.id },
      include: {
        owners: {
          include: {
            customer: {
              include: { user: true },
            },
          },
        },
        jobOrders: {
          include: {
            materials: true,
          },
        },
      },
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    const owners =
      truck.owners.length > 0
        ? truck.owners.map((owner) => ({
            customerId: owner.customer?.id || null,
            customerUserId: owner.customer?.user?.id || null,
            ownerFullName: owner.customer?.user?.fullName || null,
            transferredByUser: owner.transferredByUser,
            startDate: owner.startDate,
            endDate: owner.endDate,
          }))
        : [];

    const jobOrders =
      truck.jobOrders.length > 0
        ? truck.jobOrders.map((jo) => {
            // Find the active owner at job order creation time
            const ownerAtCreation = jobOwnerFinder(owners, jo.createdAt);

            const materialsTotal = jo.materials.reduce(
              (sum, m) => sum + Number(m.price) * Number(m.quantity),
              0
            );

            const totalBill = (Number(jo.labor) || 0) + materialsTotal;

            return {
              jobOrderId: jo.id,
              jobOrderCode: jo.jobOrderCode,
              customerId: ownerAtCreation?.customerId,
              customerUserId: ownerAtCreation?.customerUserId,
              ownerFullName: ownerAtCreation?.ownerFullName,
              createdAt: jo.createdAt,
              totalBill,
              status: jo.status,
            };
          })
        : [];
    
    const filter = req?.query?.filter;
    const activeStatuses = ["pending", "ongoing", "completed", "for release"];

    let filteredJobOrders = jobOrders;
    if (filter === "active") {
      filteredJobOrders = jobOrders.filter((jo) =>
        activeStatuses.includes(jo.status)
      );
    } else if (filter === "archived") {
      filteredJobOrders = jobOrders.filter((jo) => jo.status === "archive");
    }

    const activeCount = jobOrders.filter((jo) =>
      activeStatuses.includes(jo.status)
    ).length;
    const archivedCount = jobOrders.filter((jo) => jo.status === "archive").length;

    const truckWithOwnersAndJobOrders = {
      ...truck,
      owners,
      jobOrders: filteredJobOrders,
      jobOrderSummary: {
        activeCount,
        archivedCount,
      },
    };

    return res.status(200).json({ data: truckWithOwnersAndJobOrders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createTruck,
  editTruck,
  deleteTruck,
  getAllTrucks,
  getTruck,
  editTruckOwner,
};
