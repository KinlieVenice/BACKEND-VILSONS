const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEmployeePay = async (req, res) => {
  const { userId, payComponents = [], branchId } = req.body;

  try {
    // if (payComponents.length > 0) {
    //   const invalid = payComponents.some(
    //     (pc) => !pc.componentId || !pc.amount
    //   );
    //   if (invalid) {
    //     return res.status(400).json({ message: "Total salary cannot be 0" });
    //   }
    // }

    if (!payComponents || payComponents.length === 0) {
      return res.status(400).json({ message: "Total salary cannot be 0" });
    }

    // Check if user is an employee
    const employee = await prisma.employee.findFirst({
      where: { userId },
    });
    if (!employee) {
      return res.status(400).json({ message: "User is not an employee" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create employeePay record
      const employeePay = await tx.employeePay.create({
        data: {
          employeeId: employee.id,
          branchId,
          createdByUser: req.username,
          updatedByUser: req.username,
        },
      });

      // 3️⃣ Process payComponents (create missing ones if needed)
      const userComponents = await Promise.all(
        payComponents.map(async (pc) => {
          const existing = await tx.component.findUnique({
            where: { id: pc.componentId },
          });

          if (!existing) {
            let newComponent = await tx.component.findFirst({
              where: { componentName: pc.componentName },
            });

            if (newComponent) return res.status(400).json({ message: "New component already exists" })

            newComponent = await tx.component.create({
              data: { componentName: pc.componentName },
            });

            return { ...pc, componentId: newComponent.id };
          }

          return pc;
        })
      );

      // 2️⃣ Fetch all existing components
      const allComponents = await tx.component.findMany();

      // 4️⃣ Merge userComponents with allComponents (fill missing with amount 0)
      const processedComponents = allComponents.map((component) => {
        const match = userComponents.find(
          (pc) =>
            pc.componentId === component.id ||
            pc.componentName === component.componentName
        );

        if (match) {
          return {
            componentId: component.id,
            amount: Number(match.amount) || 0,
          };
        }

        // component not submitted → default 0
        return {
          componentId: component.id,
          amount: 0,
        };
      });

      // 5️⃣ Create all payComponents
      await tx.payComponent.createMany({
        data: processedComponents.map((pc) => ({
          employeePayId: employeePay.id,
          componentId: pc.componentId,
          amount: pc.amount,
          createdByUser: req.username,
          updatedByUser: req.username,
        })),
      });

      // 6️⃣ Compute total
      const totalComponentCost = processedComponents.reduce(
        (sum, pc) => sum + Number(pc.amount),
        0
      );

      if (totalComponentCost === 0) return res.status(400).json({ message: "Total salary cannot be 0"});7

      // 7️⃣ Re-fetch full record
      const employeePayWithComponents = await tx.employeePay.findUnique({
        where: { id: employeePay.id },
        include: {
          payComponents: {
            include: { component: true },
          },
        },
      });

      return { ...employeePayWithComponents, totalComponentCost };
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const editEmployeePay = async (req, res) => {
  const { userId, payComponents = [], branchId } = req.body;

  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    if (!payComponents || payComponents.length === 0) {
      return res.status(400).json({ message: "Total salary cannot be 0" });
    }

    const employeePay = await prisma.employeePay.findFirst({
      where: { id: req.params.id },
      include: { payComponents: { include: { component: true } } },
    });
    if (!employeePay)
      return res
        .status(404)
        .json({ message: `Employee pay with ID: ${req.params.id} not found` });

    // 2️⃣ If updating employee link, validate userId
    let employee;
    if (userId) {
      employee = await prisma.employee.findFirst({ where: { userId } });
      if (!employee)
        return res
          .status(404)
          .json({ message: `Employee with userId: ${userId} not found` });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 3️⃣ Get all existing components from DB
      const allComponents = await tx.component.findMany();

      // 4️⃣ Validate and process payComponents (existing + missing ones)
      const processedComponents = await Promise.all(
        allComponents.map(async (component) => {
          const match = payComponents.find(
            (pc) =>
              pc.componentId === component.id ||
              pc.componentName === component.componentName
          );

          // If found in submitted data → use it
          if (match) {
            return {
              componentId: component.id,
              amount: Number(match.amount) || 0,
            };
          }

          // Not found → add missing one with amount = 0
          return {
            componentId: component.id,
            amount: 0,
          };
        })
      );

      // 5️⃣ Remove old payComponents
      await tx.payComponent.deleteMany({ where: { employeePayId: employeePay.id } });

      // 6️⃣ Create new payComponents (all included)
      await tx.payComponent.createMany({
        data: processedComponents.map((pc) => ({
          employeePayId: employeePay.id,
          componentId: pc.componentId,
          amount: Number(pc.amount) || 0,
          createdByUser: req.username,
          updatedByUser: req.username,
        })),
      });

      // 7️⃣ Update employeePay
      await tx.employeePay.update({
        where: { id: employeePay.id },
        data: {
          employeeId: userId ? employee.id : employeePay.employeeId,
          branchId: branchId || employeePay.branchId,
          updatedByUser: req.username,
          updatedAt: new Date(),
        },
      });

      // 8️⃣ Calculate total
      const totalComponentCost = processedComponents.reduce(
        (sum, pc) => sum + Number(pc.amount),
        0
      );

      if (totalComponentCost === 0) return res.status(400).json({ message: "Total salary cannot be 0"})

      // 9️⃣ Re-fetch updated employeePay
      const updated = await tx.employeePay.findFirst({
        where: { id: employeePay.id },
        include: {
          payComponents: {
            include: { component: true },
          },
        },
      });

      return { ...updated, totalComponentCost };
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const deleteEmployeePay = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const employeePay = await prisma.employeePay.findFirst({
      where: { id: req.params.id },
    });

    if (!employeePay)
      return res
        .status(404)
        .json({ message: `Employee pay with ID: ${req.params.id} not found` });

    await prisma.$transaction(async (tx) => {
      // Delete all related payComponents first
      await tx.payComponent.deleteMany({
        where: { employeePayId: employeePay.id },
      });

      // Then delete the employeePay itself
      await tx.employeePay.delete({
        where: { id: employeePay.id },
      });
    });

    return res
      .status(200)
      .json({ message: "Employee pay and pay components deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const getAllEmployeePays = async (req, res) => {
  try {
    const allEmployeePays  = await prisma.employeePay.findMany({
      include: {
        employee: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        branch : { select: { id: true, address: true, branchName: true } }, 
        payComponents: {
          select: {
            componentId: true,
            amount: true,
            component: true,
          },
        },
      },
    });

    const withTotals = allEmployeePays.map(employeePay => ({
      ...employeePay,
      totalAmount: employeePay.payComponents.reduce(
        (sum, pc) => sum + Number(pc.amount), 
        0
      )
    }));
    return res.status(201).json({ data: { employeePay: withTotals }})
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

const getEmployeePay = async (req, res) => {
  const employeeId = req?.params?.id;
  if (!employeeId)
    return res.status(404).json({ message: "ID is required" });

  try {
    // Get latest employee pay
    const employeePay = await prisma.employeePay.findFirst({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      include: {
        payComponents: { include: { component: true } },
      },
    });

    if (!employeePay) {
      return res.status(404).json({ message: "Employee pay not found" });
    }

    // Total of components in the latest pay
    const totalComponentCost = employeePay.payComponents.reduce(
      (sum, pc) => sum + Number(pc.amount),
      0
    );

    // Get all possible components
    const allComponents = await prisma.component.findMany({
      select: { id: true, componentName: true },
    });

    // Merge latest pay amounts with all components
    const mergedComponents = allComponents.map((comp) => {
      const used = employeePay.payComponents.find(
        (pc) => pc.componentId === comp.id
      );
      return {
        componentId: comp.id,
        componentName: comp.componentName,
        amount: used ? used.amount : 0,
      };
    });

    return res.status(200).json({
      data: {
        employeePay: {
          id: employeePay.id,
          employeeId: employeePay.employeeId,
          type: employeePay.type,
          createdAt: employeePay.createdAt,
          updatedAt: employeePay.updatedAt,
          createdByUser: employeePay.createdByUser,
          updatedByUser: employeePay.updatedByUser,
          totalComponentCost,
          mergedComponents,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};



module.exports = { createEmployeePay, editEmployeePay, deleteEmployeePay, getAllEmployeePays, getEmployeePay }