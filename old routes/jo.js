const getAllJobOrders = async (req, res) => {
  const search = req?.query?.search;
  const status = req?.query?.status;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;

  let where = {};

  if (branch) where.branch = { branchName: { contains: branch } };
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { jobOrderCode: { contains: search } },
      {
        truck: {
          OR: [
            { plate: { contains: search } },
            { make: { contains: search } },
            { model: { contains: search } },
          ],
        },
      },
      {
        customer: {
          user: {
            OR: [
              { username: { contains: search } },
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      },
      {
        contractor: {
          user: {
            OR: [
              { username: { contains: search } },
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      },
    ];
  }

  if (startDate && endDate)
    where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };

  try {
    const jobOrderInclude = {
      truck: { select: { id: true, plate: true } },
      customer: {
        include: { user: { select: { username: true, fullName: true } } },
      },
      contractor: {
        include: { user: { select: { username: true, fullName: true } } },
      },
      branch: { select: { id: true, branchName: true } },
      materials: {
        select: { materialName: true, quantity: true, price: true },
      },
    };

    const jobOrders = await prisma.jobOrder.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: jobOrderInclude,
      orderBy: { createdAt: "desc" },
    });

    // Calculate contractorCommission and shopCommission for each job order
    const resultWithExtras = await Promise.all(
      jobOrders.map(async (job) => {
        let contractorCommission = 0,
          shopCommission = 0,
          totalMaterialCost = 0;

        // compute commissions
        if (job.contractorId && job.labor) {
          const contractor = await prisma.contractor.findUnique({
            where: { id: job.contractorId },
          });
          if (contractor) {
            contractorCommission = job.labor * contractor.commission;
            shopCommission = job.labor - contractorCommission;
          }
        }

        // compute total material cost
        if (job.materials && job.materials.length > 0) {
          totalMaterialCost = job.materials.reduce(
            (sum, m) => sum + m.price * m.quantity,
            0
          );
        }

        const totalBill = shopCommission + contractorCommission + totalMaterialCost;

        return {
          ...job,
          contractorCommission,
          shopCommission,
          totalMaterialCost,
          totalBill
        };
      })
    );
    const cleanedResult = resultWithExtras.map(
      ({ truckId, customerId, contractorId, branchId, ...rest }) => rest
    );

    return res.status(200).json({ data: { joborders: cleanedResult } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const jobOrderInclude = {
      truck: { select: { id: true, plate: true } },
      customer: {
        include: { user: { select: { username: true, fullName: true } } },
      },
      contractor: {
        include: { user: { select: { username: true, fullName: true } } },
      },
      branch: { select: { id: true, branchName: true } },
      materials: {
        select: { materialName: true, quantity: true, price: true },
      },
    };

    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id: req.params.id },
      include: jobOrderInclude,
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job Order not found" });
    }

    let contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    // calculate commissions
    if (jobOrder.contractorId && jobOrder.labor) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: jobOrder.contractorId },
      });
      if (contractor) {
        contractorCommission = jobOrder.labor * contractor.commission;
        shopCommission = jobOrder.labor - contractorCommission;
      }
    }

    // calculate total material cost
    if (jobOrder.materials && jobOrder.materials.length > 0) {
      totalMaterialCost = jobOrder.materials.reduce(
        (sum, m) => sum + m.price * m.quantity,
        0
      );
    }

    const { truckId, customerId, contractorId, branchId, ...jobOrderFields } =
      jobOrder;

    return res.status(200).json({
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};