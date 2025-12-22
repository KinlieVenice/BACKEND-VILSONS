const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getMonthYear } = require("../../../utils/filters/monthYearFilter");
const { branchFilter } = require("../../../utils/filters/branchFilter"); 

const getAllLaborPays = async (req, res) => {
  const search = req?.query?.search?.trim()?.replace(/^["']|["']$/g, "");
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  let year = req?.query?.year;
  let month = req?.query?.month;

  const { startDate, endDate } = getMonthYear(year, month);
  const baseWhere = { createdAt: { gte: startDate, lt: endDate } };

  try {
    // ✅ Get all components (for merging)
    const allComponents = await prisma.component.findMany({
      select: { id: true, componentName: true },
    });

    // --- Employee Pays ---
    const employeeWhere = {
      ...baseWhere,
      ...branchFilter("employeePay", branch, req.branchIds),
      ...(search
        ? {
            employee: {
              user: {
                fullName: { contains: search },
              },
            },
          }
        : {}),
    };

    const employeePays = await prisma.employeePay.findMany({
      where: employeeWhere,
      include: {
        employee: {
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
                      select: { id: true, branchName: true },
                    },
                  },
                },
              },
            },
          },
        },
        branch: {
          select: { id: true, address: true, branchName: true },
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

    const formattedEmployees = employeePays.map((pay) => {
      // ✅ Merge all possible components with this employee’s pay
      const mergedComponents = allComponents.map((comp) => {
        const used = pay.payComponents.find((pc) => pc.componentId === comp.id);
        return {
          componentId: comp.id,
          componentName: comp.componentName,
          amount: used ? Number(used.amount) : 0,
        };
      });

      const totalAmount = mergedComponents.reduce(
        (sum, mc) => sum + Number(mc.amount),
        0
      );

      return {
        id: pay.id,
        type: "employee",
        employeeId: pay.employee.id,
        userId: pay.employee.userId,
        fullName: pay.employee.user.fullName,
        username: pay.employee.user.username,
        salaryType: pay.type,
        createdAt: pay.createdAt,
        updatedAt: pay.updatedAt,
        createdByUser: pay.createdByUser,
        updatedByUser: pay.updatedByUser,
        amount: totalAmount,
        payComponents: mergedComponents, // ✅ Now includes all components
        branch: {
          address: pay.branch?.address || "N/A",
          branchName: pay.branch?.branchName || "N/A",
        },
        branchId: pay.branchId,
      };
    });

    // --- Contractor Pays ---
    const contractorWhere = {
      ...baseWhere,
      ...branchFilter("contractorPay", branch, req.branchIds),
      ...(search
        ? {
            contractor: {
              user: {
                fullName: { contains: search },
              },
            },
          }
        : {}),
    };

    const contractorPays = await prisma.contractorPay.findMany({
      where: contractorWhere,
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
                      select: { id: true, branchName: true },
                    },
                  },
                },
              },
            },
          },
        },
        branch: {
          select: { id: true, address: true, branchName: true },
        },
      },
    });

    const formattedContractors = contractorPays.map((pay) => ({
      id: pay.id,
      type: "contractor",
      contractorId: pay.contractor.id,
      userId: pay.contractor.userId,
      fullName: pay.contractor.user.fullName,
      username: pay.contractor.user.username,
      salaryType: pay.type,
      createdAt: pay.createdAt,
      updatedAt: pay.updatedAt,
      createdByUser: pay.createdByUser,
      updatedByUser: pay.updatedByUser,
      amount: Number(pay.amount),
      branch: {
        address: pay.branch?.address || "N/A",
        branchName: pay.branch?.branchName || "N/A",
      },
      branchId: pay.branchId,
    }));

    // Combine results
    const allLaborPays = [...formattedEmployees, ...formattedContractors];
    const totalAmount = allLaborPays.reduce((sum, lp) => sum + lp.amount, 0);

    return res.status(200).json({
      data: {
        laborPays: allLaborPays,
        totalAmount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};



module.exports = { getAllLaborPays };
