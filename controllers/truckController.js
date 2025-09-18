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

      return { truck };
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editTruck = async (req, res) => {
  const { plate, make, model } = req.body;

  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required" });

  const truck = await prisma.truck.findFirst({ where: { id: req.body.id } });

  try {
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
            where: { id: req.body.id },
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

          message = needsApproval ? "Truck delete is awaiting approval" : "Truck is successfully deleted";

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

    let where = {};

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
      });

      const total = await tx.truck.count({ where });

      return { trucks, total }
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

    const truck = await prisma.truck.findUnique({
      where: { id: req.params.id },
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    try {
      return res.status(201).json({ truck })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
};

module.exports = { createTruck, editTruck, deleteTruck, getAllTrucks, getTruck };
