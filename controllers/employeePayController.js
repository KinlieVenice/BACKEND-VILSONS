const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEmployeePay = async (req, res) => {
  const { userId, payComponents, branchId } = req.body;

  try {
    let totalComponentCost = 0;

    const employee = await prisma.employee.findFirst({
      where: { userId }
    });
    if (!employee) {
      return res.status(400).json({ message: "User is not an employee" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const employeePay = await tx.employeePay.create({
        data: {
          employeeId: employee.id,
          branchId,
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

const editEmployeePay = async (req, res) => {
  const { userId, payComponents, branchId } = req.body;

  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const employeePay = await prisma.employeePay.findFirst({ 
      where: { id: req.params.id },
      include: { payComponents: { include: { component: true } } }
    });
    if (!employeePay) return res.status(404).json({ message: `Job order with ID: ${req.params.id} not found` });

    if (userId) {
      const employee = await prisma.employee.findFirst({ where: { id: userId } })
      if (!employee) return res.status(404).json({ message: `Employee with ID: ${userId} not found` });
    }

    let totalComponentCost = 0;

    const result = await prisma.$transaction(async (tx) => {

       if (payComponents && payComponents.length > 0) {
        const invalid = payComponents.some(
          (pc) => !pc.componentId || !pc.amount
        );
        if (invalid) {
          throw new Error("Each payComponent must include non-empty componentId and non-zero amount");
        }

        await tx.payComponent.deleteMany({ where: { employeePayId: employeePay.id, } });

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

      await tx.employeePay.update({
        where: { id: employeePay.id },
        data: {
          userId,
          branchId,
          updatedByUser: req.username
        }
      })

      return employeePay
    })
    return res.status(201).json({ data: {...result, totalComponentCost} })
  } catch (err) {
    return res.status(500).json({ message: err.status })
  }
}

const deleteEmployeePay = async (req, res) => {
    if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

    try {
      const employeePay = await prisma.employeePay.findFirst({ where: { id: req.params.id }, });
      if (!employeePay) return res.status(404).json({ message: `Employee pay with ID: ${req.params.id} not found` });

      const result = await prisma.$transaction(async (tx) => {
        await tx.payComponent.deleteMany({
          where: { employeePayId: employeePay.id }
        });
        await tx.employeePay.findFirst({ where: { id: employeePay.id }})
      }) 
      return res.status(201).json(({ message: "Employee pay and pay componennts deleted"}))
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
}

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
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    const employeePay  = await prisma.employeePay.findFirst({
      where: { employeeId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { payComponents: { include: { component: true } } }
    });

    if (!employeePay) {
      return res.status(404).json({ message: "Employee pay not found" });
    }

    const totalComponentCost = employeePay.payComponents.reduce(
      (sum, pc) => sum + Number(pc.amount),
      0
    );

    return res.status(200).json({ data: { ...employeePay, totalComponentCost } });
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}


module.exports = { createEmployeePay, editEmployeePay, deleteEmployeePay, getAllEmployeePays, getEmployeePay }