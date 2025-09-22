const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/*
  equipmentName     String  @db.VarChar(100)
  quantity Int
  price    Decimal @db.Decimal(13, 2)
  branchId String
*/

const createEquipment = async (req, res) => {
  const { name, quantity, price, branchId } = req.body;
  if (!name || !quantity || !price || !branchId)
    return res
      .status(404)
      .json({ message: "Name, quantity, price, and branchId are required" });

  try {
    const needsApproval = req.approval;
    let message;
    const equipmentData = {
      equipmentName: name,
      quantity,
      price,
      branchId,
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const equipment = needsApproval
        ? await tx.equipmentEdit.create({
            data: {
              ...equipmentData,
              requestType: "create",
              equipmentId: null,
            },
          })
        : await tx.equipment.create({
            data: equipmentData,
          });

      message = needsApproval
        ? "Equipment awaiting approval"
        : "Equipment successfully added";
      return equipment;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editEquipment = async (req, res) => {
  const { name, quantity, price, branchId } = req.body;
  if (!req?.body?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id: req.body.id },
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: `Equipment with ${req.body.id} not found` });

    const needsApproval = req.approval;
    let message;

    const equipmentData = {
      equipmentName: name ?? equipment.equipmentName,
      quantity: quantity ?? equipment.quantity,
      price: price ?? equipment.price,
      branchId: branchId ?? equipment.branchId,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedEquipment = needsApproval
        ? await tx.equipmentEdit.create({
            data: {
              ...equipmentData,
              createdByUser: req.username,
              requestType: "edit",
              equipmentId: equipment.id,
            },
          })
        : await tx.equipment.update({
            where: { id: equipment.id },
            data: equipmentData,
          });

      message = needsApproval
        ? "Equipment edit is awaiting approval"
        : "Equipment successfully edited";

      return editedEquipment;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteEquipment = async (req, res) => {
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id: req.params.id },
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: `Equipment with ${req.params.id} not found` });

    const needsApproval = true;
    let message;

    const equipmentData = {
      equipmentName: equipment.equipmentName,
      quantity: equipment.quantity,
      price: equipment.price,
      branchId: equipment.branchId,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const deletedEquipment = needsApproval
        ? await tx.equipmentEdit.create({
            data: {
              ...equipmentData,
              createdByUser: req.username,
              requestType: "delete",
              equipmentId: equipment.id,
            },
          })
        : await tx.equipment.delete({
            where: { id: equipment.id },
          });

      message = needsApproval
        ? "Equipment edit is awaiting approval"
        : "Equipment successfully deleted";

      return deletedEquipment;
    });

    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllEquipments = async (req, res) => {
  const search = req?.query?.search;
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

  if (search) {
    const searchAsNumber = Number(search);

    where.OR = [
      { equipmentName: { contains: search } }, // string search
      ...(isNaN(searchAsNumber)
        ? []
        : [
            { price: { equals: searchAsNumber } }, // number search
            { quantity: { equals: searchAsNumber } },
          ]),
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
      const equipments = await tx.equipment.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          branch: {
            select: { branchName: true, address: true },
          },
        },
      });

      return equipments;
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getEquipment = async (req, res) => {
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id: req.params.id },
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: `Equipment with ${req.params.id} not found` });

    return res.status(201).json({ data: equipment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEquipment,
  editEquipment,
  deleteEquipment,
  getAllEquipments,
  getEquipment,
};
