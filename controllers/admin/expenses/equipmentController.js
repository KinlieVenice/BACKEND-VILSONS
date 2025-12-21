const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { branchFilter } = require("../../../utils/filters/branchFilter");
const { getMonthYear } = require("../../../utils/filters/monthYearFilter");
const { requestApproval } = require("../../../utils/services/approvalService");
const { logActivity } = require("../../../utils/services/activityService.js");
const { getLastUpdatedAt } = require("../../../utils/services/lastUpdatedService");



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
        ?await requestApproval('equipment', null, 'create', equipmentData, req.username, branchId)
        : await tx.equipment.create({
            data: equipmentData,
          });

      message = needsApproval
        ? "Equipment awaiting approval"
        : "Equipment successfully added";
      return equipment;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} created Equipment ${equipmentData.equipmentName}`
        : `${req.username} created Equipment ${equipmentData.equipmentName}`, branchId
    );
    
    return res.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editEquipment = async (req, res) => {
  const { name, quantity, price, branchId, remarks } = req.body;
  if (!req?.params?.id || !remarks)
    return res.status(404).json({ message: "ID and remarks are required" });

  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id: req.params.id },
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: `Equipment with ${req.params.id} not found` });

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
        ? await requestApproval('equipment', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username, branchId || equipment.branchId)
        : await tx.equipment.update({
            where: { id: equipment.id },
            data: equipmentData,
          });

      message = needsApproval
        ? "Equipment edit is awaiting approval"
        : "Equipment successfully edited";

      return editedEquipment;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} edited Equipment ${equipmentData.equipmentName}`
        : `${req.username} edited Equipment ${equipmentData.equipmentName}`, branchId,
      remarks
    );

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
        ? await requestApproval( "equipment", equipment.id, "delete", equipment, req.username, equipment.branchId)
        : await tx.equipment.delete({
            where: { id: equipment.id },
          });

      message = needsApproval
        ? "Equipment edit is awaiting approval"
        : "Equipment successfully deleted";

      return deletedEquipment;
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} deleted Equipment ${equipmentData.equipmentName}`
        : `${req.username} deleted Equipment ${equipmentData.equipmentName}`, equipment.branchId
    );
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
  const { startDate, endDate } = getMonthYear(req.query.year, req.query.month);

  let where;

  where = {
    createdAt: { gte: startDate, lt: endDate }, ...where, ...branchFilter("equipment", branch, req.branchIds)
  };


  // Search filter
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [{ equipmentName: { contains: searchValue } }];
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

      const lastUpdatedAt = await getLastUpdatedAt(tx, "equipment", where);

      const equipmentsWithTotal = equipments.map((m) => ({
        ...m,
        totalAmount: Number(m.price) * Number(m.quantity),
      }));

      const totalEquipmentsAmount = equipments.reduce(
        (sum, m) => sum + (Number(m.price) * Number(m.quantity)),
        0
      );

      return { equipmentsWithTotal, totalEquipmentsAmount, lastUpdatedAt };
    });

    return res
      .status(201)
      .json({
        data: {
          equipments: result.equipmentsWithTotal,
          totalEquipmentsAmount: result.totalEquipmentsAmount,
          lastUpdatedAt: result.lastUpdatedAt
        },
      });
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
