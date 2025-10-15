const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getContractor = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: req.params.id },
       include: {
        contractorPay: { select: { amount: true } },
        JobOrder: {
          select: {
            id: true,
            jobOrderCode: true,
            status: true,
            createdAt: true,
            contractorPercent: true,
            labor: true,
            materials: { select: { price: true, quantity: true } },
            truck: { select: { plate: true, id: true }}
          }
        },
        user: {
          include: {
            roles: { select: { role: { select: { id: true, roleName: true } } } },
            branches: { select: { branch: { select: { id: true, branchName: true } } } },
          }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    // filter
    const filter = req?.query?.filter;
    const activeStatuses = ['pending', 'ongoing', 'completed', 'forRelease'];

    let filteredJobOrders = contractor.JobOrder;
    if (filter === "active") {
      filteredJobOrders = contractor.JobOrder.filter(jo =>
        activeStatuses.includes(jo.status)
      );
    } else if (filter === "archived") {
      filteredJobOrders = contractor.JobOrder.filter(jo => jo.status === "archive");
    }

    // count
    const activeCount = contractor.JobOrder.filter(jo =>
      activeStatuses.includes(jo.status)
    ).length;
    const archivedCount = contractor.JobOrder.filter(
      jo => jo.status === "archive"
    ).length;


    // map job orders 
    const jobOrders = filteredJobOrders.map(jo => {
      const totalMaterials = jo.materials.reduce(
        (sum, m) => sum + Number(m.price) * Number(m.quantity),
        0
      );

      const contractorCommission = Number(jo.labor) * Number(jo.contractorPercent);
      const shopCommission = Number(jo.labor) - contractorCommission;
      const totalBill = Number(jo.labor) + totalMaterials;

      return {
        id: jo.id,
        jobOrderCode: jo.jobOrderCode,
        status: jo.status,
        createdAt: jo.createdAt,
        contractorPercent: jo.contractorPercent,
        labor: jo.labor,
        plate: jo.truck.plate,
        truckId: jo.truck.id,
        contractorCommission,
        shopCommission,
        totalMaterials,
        totalBill
      };
    });

    // total contractor commission 
    const totalContractorCommission = jobOrders.reduce(
      (sum, jo) => sum + jo.contractorCommission,
      0
    );

    const totalTransactions = contractor.contractorPay.reduce(
        (sum, cp) => sum + Number(cp.amount),0);
    
    const totalBalance = totalContractorCommission - totalTransactions;

    const cleanContractor = {
      ...contractor,
      user: contractor.user
        ? {
            id: contractor.user.id,
            contractorId: req.params.id,
            fullName: contractor.user.fullName,
            username: contractor.user.username,
            email: contractor.user.email,
            phone: contractor.user.phone,
            roles: contractor.user.roles.map(r => ({
              roleId: r.role.id,
              roleName: r.role.roleName
            })),
            branches: contractor.user.branches.map(b => ({
              branchId: b.branch.id,
              branchName: b.branch.branchName
            }))
          }
        : null,
      JobOrder: jobOrders,
      jobOrderSummary: { activeCount, archivedCount, totalContractorCommission, totalTransactions, totalBalance }
    };

    return res.status(200).json({ data: cleanContractor });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllContractors = async (req, res) => {
  const search = req?.query?.search;
  const branchIds = req.branchIds || [];

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

  try {
    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        contractorPay: { select: { amount: true } },
        JobOrder: {
          select: {
            id: true,
            jobOrderCode: true,
            status: true,
            createdAt: true,
            contractorPercent: true,
            labor: true,
            materials: { select: { price: true, quantity: true } },
            truck: { select: { plate: true, id: true } },
          },
        },
        user: {
          include: {
            roles: { select: { role: { select: { id: true, roleName: true } } } },
            branches: { select: { branch: { select: { id: true, branchName: true } } } },
          },
        },
      },
    });

    // if (!contractors.length) {
    //   return res.status(404).json({ message: "No contractors found" });
    // }

    const filter = req?.query?.filter;
    const activeStatuses = ["pending", "ongoing", "completed", "forRelease"];

    const formattedContractors = contractors.map((contractor) => {
      // Apply filter (active/archived)
      let filteredJobOrders = contractor.JobOrder;
      if (filter === "active") {
        filteredJobOrders = contractor.JobOrder.filter((jo) =>
          activeStatuses.includes(jo.status)
        );
      } else if (filter === "archived") {
        filteredJobOrders = contractor.JobOrder.filter(
          (jo) => jo.status === "archive"
        );
      }

      // Counts
      const activeCount = contractor.JobOrder.filter((jo) =>
        activeStatuses.includes(jo.status)
      ).length;
      const archivedCount = contractor.JobOrder.filter(
        (jo) => jo.status === "archive"
      ).length;

      // Map job orders
      const jobOrders = filteredJobOrders.map((jo) => {
        const totalMaterials = jo.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );

        const contractorCommission =
          Number(jo.labor) * Number(jo.contractorPercent);
        const shopCommission = Number(jo.labor) - contractorCommission;
        const totalBill = Number(jo.labor) + totalMaterials;

        return {
          id: jo.id,
          jobOrderCode: jo.jobOrderCode,
          status: jo.status,
          createdAt: jo.createdAt,
          contractorPercent: jo.contractorPercent,
          labor: jo.labor,
          plate: jo.truck.plate,
          truckId: jo.truck.id,
          contractorCommission,
          shopCommission,
          totalMaterials,
          totalBill,
        };
      });

      // Totals
      const totalContractorCommission = jobOrders.reduce(
        (sum, jo) => sum + jo.contractorCommission,
        0
      );

      const totalContractorPays = contractor.contractorPay.reduce(
        (sum, cp) => sum + Number(cp.amount),
        0
      );

      const totalBalance = totalContractorCommission - totalContractorPays;

      // Clean contractor object
      return {
        user: contractor.user
          ? {
              id: contractor.user.id,
              contractorId: contractor.id,
              fullName: contractor.user.fullName,
              username: contractor.user.username,
              email: contractor.user.email,
              phone: contractor.user.phone,
              roles: contractor.user.roles.map((r) => ({
                roleId: r.role.id,
                roleName: r.role.roleName,
              })),
              branches: contractor.user.branches.map((b) => ({
                branchId: b.branch.id,
                branchName: b.branch.branchName,
              })),
            }
          : null,
        jobOrderSummary: {
          activeCount,
          archivedCount,
          totalContractorCommission,
          totalContractorPays,
          totalBalance,
        },
      };
    });

    res.status(200).json({ data: { contractors: formattedContractors } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getContractor, getAllContractors }