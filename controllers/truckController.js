const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const sanitizeAndValidate = require("../utils/sanitizeData");

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
    const {
      plate: sanitizedPlate,
      make: sanitizedMake,
      model: sanitizedModel,
    } = sanitizeAndValidate({ plate, make, model });

    const existingTruck = await prisma.truck.findFirst({
      where: { plate: sanitizedPlate },
    });

    const pendingTruck = await prisma.truckEdit.findFirst({
      where: {
        plate: sanitizedPlate,
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
      plate: sanitizedPlate,
      make: sanitizedMake,
      model: sanitizedModel,
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

module.exports = { createTruck };
