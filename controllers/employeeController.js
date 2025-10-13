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
          some: {
            branchId: { in: branchIds },
          },
        },
      },
    };

    // Add search if provided
    if (search) {
      where.user.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
      ];
    }

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
              include: {
                component: true, // Include nested components table
              },
            },
          },
        },
      },
    });

    const formattedEmployees = employees.map((emp) => ({
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
      employeePay: emp.employeePay,

    }));

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
