const truckIdFinder = require("../utils/truckIdFinder");
const customerIdFinder = require("../utils/customerIdFinder");
const { PrismaClient } = require("../generated/prisma");
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
  const { truckPlate, customerUsername } = req.body;

  if (!truckPlate || !customerUsername) {
    return res
      .status(400)
      .json({ message: "truckPlate and customerUsername are required" });
  }

  try {
    const truckId = await truckIdFinder(truckPlate);
    const customerId = await customerIdFinder(customerUsername);

    console.log("truck", truckId)
    console.log("customer", customerId)

    const truckData = {
      truckId,
      customerId,
      transferredByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const truck = await tx.truck.findUnique({ where: { id: truckId } });
      if (!truck) return res.status(404).json({ message: "Truck not found" });

      // Get latest ownership
      const truckOwner = await tx.truckOwnership.findFirst({
        where: { truckId },
        orderBy: { startDate: "desc" },
      });

      let newTruckOwner;
      if (truckOwner) {
        // End previous ownership
        await tx.truckOwnership.update({
          where: { id: truckOwner.id },
          data: { endDate: new Date() },
        });

        newTruckOwner = await tx.truckOwnership.create({ data: truckData });
      } else {
        newTruckOwner = await tx.truckOwnership.create({ data: truckData });
      }

      return newTruckOwner;
    });

    return res.status(201).json({
      message: "Truck owner successfully transferred",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

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
      const truck_delete = needsApproval
        ? await tx.truckEdit.create({
            data: truckData,
          })
        : await tx.truck.delete({
            where: { id: truck.id },
          });

      message = needsApproval
        ? "Truck delete is awaiting approval"
        : "Truck is successfully deleted";

      return truck_delete;
    });
    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllTrucks = async (req, res) => {
  try {
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const startDate = req?.query?.startDate; // e.g. "2025-01-01"
    const endDate = req?.query?.endDate; // e.g. "2025-01-31"

    let where = {};

    if (search) {
      where.OR = [
        { plate: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const trucks = await tx.truck.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        // include: {
        //   owners: {
        //     select: { customer: { select: { user: { select: { username: true, }, },
        //         },
        //       },
        //     },
        //   },
        // },
      });

      const total = await tx.truck.count({ where });

      return { trucks, total };
    });

    return res.status(201).json({
      data: result,
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
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }
    return res.status(201).json({ truck });
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
