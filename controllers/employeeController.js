const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllEmployees = async (req, res) => {
  try {
    const branchIds = req.branchIds || [];
    const search = req?.query?.search?.trim()?.replace(/^["']|["']$/g, "");

    // Base where filter (branch restriction)
    const where = {
      user: {
        branches: {
          some: { branchId: { in: branchIds } },
        },
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { username: { contains: search } },
              ],
            }
          : {}),
      },
    };

    // Fetch all components once
    const allComponents = await prisma.component.findMany({
      select: { id: true, componentName: true },
    });

    // Fetch employees
    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          include: {
            roles: {
              select: {
                role: { select: { id: true, roleName: true } },
              },
            },
            branches: {
              select: {
                branch: { select: { id: true, branchName: true } },
              },
            },
          },
        },
        employeePay: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only the latest record
          include: {
            payComponents: {
              include: { component: true },
            },
          },
        },
      },
    });

    const formattedEmployees = employees.map((emp) => {
      // Map latest pay components or empty array
      const latestPayComponents = emp.employeePay[0]?.payComponents || [];

      // Merge with all components; set amount = 0 if missing
      const mergedComponents = allComponents.map((comp) => {
        const used = latestPayComponents.find((pc) => pc.componentId === comp.id);
        return {
          componentId: comp.id,
          componentName: comp.componentName,
          amount: used ? used.amount : 0,
        };
      });

      return {
        user: emp.user
          ? {
              id: emp.user.id,
              employeeId: emp.id,
              fullName: emp.user.fullName,
              username: emp.user.username,
              salary: emp.salary,
              email: emp.user.email,
              phone: emp.user.phone,
              roles: emp.user.roles.map((r) => ({
                roleId: r.role.id,
                roleName: r.role.roleName,
              })),
              branches: emp.user.branches.map((b) => ({
                branchId: b.branch.id,
                branchName: b.branch.branchName,
              })),
            }
          : null,
        payComponents: mergedComponents, // always present, even if employeePay is empty
      };
    });

    return res.status(200).json({ data: { employees: formattedEmployees } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


const getEmployee = async (req, res) => {
  try {
    const { id } = req.params; // employee ID from route
    const branchIds = req.branchIds || [];

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    // Base filter
    const where = {
      id,
      user: {
        branches: {
          some: { branchId: { in: branchIds } },
        },
      },
    };

    // Fetch all components once
    const allComponents = await prisma.component.findMany({
      select: { id: true, componentName: true },
    });

    // Fetch employee with latest pay
    const employee = await prisma.employee.findFirst({
      where,
      include: {
        user: {
          include: {
            roles: {
              select: {
                role: { select: { id: true, roleName: true } },
              },
            },
            branches: {
              select: { branch: { select: { id: true, branchName: true } } },
            },
          },
        },
        employeePay: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            payComponents: { include: { component: true } },
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Get components from latest pay
    const latestPayComponents = employee.employeePay[0]?.payComponents || [];

    // Map all components and merge with actual amounts from latest pay
    const mergedComponents = allComponents.map((comp) => {
    const used = latestPayComponents.find((c) => c.componentId === comp.id);
        return {
            componentId: comp.id,
            componentName: comp.componentName,
            amount: used ? used.amount : 0, 
        };
    });

    const formattedEmployee = {
      user: employee.user
        ? {
            id: employee.user.id,
            employeeId: employee.id,
            fullName: employee.user.fullName,
            username: employee.user.username,
            salary: employee.salary,
            email: employee.user.email,
            phone: employee.user.phone,
            roles: employee.user.roles.map((r) => ({
              roleId: r.role.id,
              roleName: r.role.roleName,
            })),
            branches: employee.user.branches.map((b) => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName,
            })),
          }
        : null,
      employeePay: employee.employeePay.map((pay) => ({
        ...pay,
        payComponents: mergedComponents,
      })),
    };

    return res.status(200).json({ data: { employee: formattedEmployee } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const getEmployeeold = async (req, res) => {
  try {
    const { id } = req.params; // employee ID from route
    const branchIds = req.branchIds || [];

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    // Base filter with branch restriction and specific employee ID
    const where = {
      id,
      user: {
        branches: {
          some: {
            branchId: { in: branchIds },
          },
        },
      },
    };

    // Fetch single employee
    const employee = await prisma.employee.findFirst({
      where,
      include: {
        user: {
          include: {
            roles: {
              select: {
                role: { select: { id: true, roleName: true } },
              },
            },
            branches: {
              select: {
                branch: { select: { id: true, branchName: true } },
              },
            },
          },
        },
        employeePay: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only the latest pay record
          include: {
            payComponents: {
              include: {
                component: true, // Include nested components
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Format result to match your structure
    const formattedEmployee = {
      user: employee.user
        ? {
            id: employee.user.id,
            employeeId: employee.id,
            fullName: employee.user.fullName,
            username: employee.user.username,
            salary: employee.salary,
            email: employee.user.email,
            phone: employee.user.phone,
            roles: employee.user.roles.map((r) => ({
              roleId: r.role.id,
              roleName: r.role.roleName,
            })),
            branches: employee.user.branches.map((b) => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName,
            })),
          }
        : null,
      employeePay: employee.employeePay,
    };

    return res.status(200).json({ data: { employee: formattedEmployee } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};



module.exports = { getAllEmployees, getEmployee }
