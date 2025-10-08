const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../utils/monthYearFilter");
const { branchFilter } = require("../utils/branchFilter"); 

const getAllLaborPays = async (req, res) => {
  const search = req?.query?.search;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  let year = req?.query?.year;
  let month = req?.query?.month;

  // Date range using utility
  const { startDate, endDate } = getMonthYear(year, month);

  // Base where for date range
  const where = { createdAt: { gte: startDate, lt: endDate } };

  try {
    // --- Employee Pays ---
    const employeePays = await prisma.employeePay.findMany({
      where: {
        ...where,
        ...branchFilter("employeePay", branch, req.branchIds),
      },
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
    }));

    // --- Contractor Pays ---
    const contractorPays = await prisma.contractorPay.findMany({
      where: {
        ...where,
        ...branchFilter("contractorPay", branch, req.branchIds),
      },
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

module.exports = { getAllLaborPays };
