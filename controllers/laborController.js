const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllLaborPays = async (req, res) => {
  try {
    // --- Employee Pays ---
    const employeePays = await prisma.employeePay.findMany({
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        payComponents: {
          select: {
            componentId: true,
            amount: true,
            component: true,
          },
        },
      },
    });

    const formattedEmployees = employeePays.map(pay => ({
      id: pay.id,
      type: "employee",
      employeeId: pay.employee.id,
      userId: pay.employee.userId,
      fullName: pay.employee.user.fullName,
      salaryType: pay.salaryType,
      createdAt: pay.createdAt,
      updatedAt: pay.updatedAt,
      createdByUser: pay.createdByUser,
      updatedByUser: pay.updatedByUser,
      amount: pay.payComponents.reduce(
        (sum, pc) => sum + Number(pc.amount),
        0
      ),
      payComponents: pay.payComponents, // keep details
    }));

    // --- Contractor Pays ---
    const contractorPays = await prisma.contractorPay.findMany({
      include: {
        contractor: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    const formattedContractors = contractorPays.map(pay => ({
      id: pay.id,
      type: "contractor",
      contractorId: pay.contractor.id,
      userId: pay.contractor.userId,
      fullName: pay.contractor.user.fullName,
      salaryType: pay.salaryType,
      createdAt: pay.createdAt,
      updatedAt: pay.updatedAt,
      createdByUser: pay.createdByUser,
      updatedByUser: pay.updatedByUser,
      amount: Number(pay.amount), // contractors have single amount
      payComponents: [], // no components for contractors
    }));

    // --- Combine Both ---
    const allLaborPays = [...formattedEmployees, ...formattedContractors];

    return res.status(200).json({ data: { laborPays: allLaborPays } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllLaborPays }
