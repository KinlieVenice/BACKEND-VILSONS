const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllLaborPays = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  let year = req?.query?.year;
  let month = req?.query?.month;

  const now = new Date();
  year = year ? parseInt(year, 10) : now.getFullYear();
  month = month ? parseInt(month, 10) - 1 : now.getMonth();

  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 1);
  endDate.setHours(0, 0, 0, 0);

  let whereEmployee = { createdAt: { gte: startDate, lt: endDate } };
  let whereContractor = { createdAt: { gte: startDate, lt: endDate } };

  if (branch) {
    const branchValue = branch.trim().replace(/^["']|["']$/g, "");
    whereEmployee.employee = {
      user: { branches: { some: { branchId: branchValue } } },
    };
    whereContractor.contractor = {
      user: { branches: { some: { branchId: branchValue } } },
    };
  } else if (req.branchIds?.length) {
    whereEmployee.employee = {
      user: { branches: { some: { branchId: { in: req.branchIds } } } },
    };
    whereContractor.contractor = {
      user: { branches: { some: { branchId: { in: req.branchIds } } } },
    };
  }

  try {
    // --- Employee Pays ---
    const employeePays = await prisma.employeePay.findMany({
      where: whereEmployee,
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                fullName: true,
                branches: {
                  select: {
                    branch: {
                      select: {
                        id: true,
                        branchName: true, 
                      },
                    },
                  },
                },
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

    const formattedEmployees = employeePays.map((pay) => ({
      id: pay.id,
      type: "employee",
      employeeId: pay.employee.id,
      userId: pay.employee.userId,
      fullName: pay.employee.user.fullName,
      salaryType: pay.type,
      createdAt: pay.createdAt,
      updatedAt: pay.updatedAt,
      createdByUser: pay.createdByUser,
      updatedByUser: pay.updatedByUser,
      amount: pay.payComponents.reduce((sum, pc) => sum + Number(pc.amount), 0),
      // payComponents: pay.payComponents,
    }));

    // --- Contractor Pays ---
    const contractorPays = await prisma.contractorPay.findMany({
      where: whereContractor,
      include: {
        contractor: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                username: true,
                fullName: true,
                branches: {
                  select: {
                    branch: {
                      select: {
                        id: true,
                        branchName: true, 
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedContractors = contractorPays.map((pay) => ({
      id: pay.id,
      type: "contractor",
      contractorId: pay.contractor.id,
      userId: pay.contractor.userId,
      fullName: pay.contractor.user.fullName,
      salaryType: pay.type,
      createdAt: pay.createdAt,
      updatedAt: pay.updatedAt,
      createdByUser: pay.createdByUser,
      updatedByUser: pay.updatedByUser,
      amount: Number(pay.amount),
    }));

    const allLaborPays = [...formattedEmployees, ...formattedContractors];
    const totalAmount = allLaborPays.reduce((sum, lp) => sum + lp.amount, 0);

    return res.status(200).json({
      data: {
        laborPays: allLaborPays,
        totalAmount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { getAllLaborPays }
