const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createEmployeePay = async (req, res) => {
  const { employeeId, payComponents } = req.body;

  try {
    let totalComponentCost = 0;

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId }
    });
    if (!employee) {
      return res.status(400).json({ message: "User is not an employee" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const employeePay = await tx.employeePay.create({
        data: {
          employeeId,
          createdByUser: req.username,
          updatedByUser: req.username
        }
      });

      if (payComponents && payComponents.length > 0) {
        const invalid = payComponents.some(
          (pc) => !pc.componentId || !pc.amount
        );
        if (invalid) {
          throw new Error("Each payComponent must include non-empty componentId and non-zero amount");
        }

        await tx.payComponent.createMany({
          data: payComponents.map((pc) => ({
            employeePayId: employeePay.id,
            componentId: pc.componentId, 
            amount: pc.amount,
            createdByUser: req.username,
            updatedByUser: req.username
          }))
        });

        totalComponentCost = payComponents.reduce(
          (sum, pc) => sum + Number(pc.amount), 0
        );
      }

      // re-fetch employeePay with linked payComponents
      const employeePayWithComponents = await tx.employeePay.findUnique({
        where: { id: employeePay.id },
        include: {
          payComponents: {
            include: { component: true }
          }
        }
        
      });

      return { ...employeePayWithComponents, totalComponentCost };
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createEmployeePay }