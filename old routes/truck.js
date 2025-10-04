const getAllTrucks = async (req, res) => {
  try {
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const startDate = req?.query?.startDate; // e.g. "2025-01-01"
    const endDate = req?.query?.endDate; // e.g. "2025-01-31"
    let totalItems = 0;
    let totalPages = 1;

    let where = {};

    if (search) {
      where.OR = [
        { plate: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const trucks = await tx.truck.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          owners: {
            include: {
              customer: {
                include: { user: true },
              },
            },
          },
        },
      });

      const trucksWithOwners = trucks.map((truck) => ({
        ...truck,
        owners:
          truck.owners.length > 0
            ? truck.owners.map((owner) => ({
                customerName: owner.customer?.user?.fullName,
                transferredByUser: owner.transferredByUser,
                startDate: owner.startDate,
                endDate: owner.endDate,
              }))
            : [],
      }));

      totalItems = await tx.truck.count({ where });

      if (limit) {
        totalPages = Math.ceil(totalItems / limit);
      } 

      return { trucks: trucksWithOwners };
    });

    return res.status(200).json({
      data: { ...result, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getTruck = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const truck = await prisma.truck.findUnique({
      where: { id: req.params.id },
      include: {
        owners: {
          include: {
            customer: {
              include: { user: true },
            },
          },
        },
        jobOrders: true,
      },
      

    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    const truckWithOwners = {
      ...truck,
      owners:
        truck.owners.length > 0
          ? truck.owners.map((owner) => ({
              customerId: owner.customer?.id || null,
              customerUserId: owner.customer?.user?.id || null,
              ownerFullName: owner.customer?.user?.fullName || null,
              transferredByUser: owner.transferredByUser,
              startDate: owner.startDate,
              endDate: owner.endDate,
            }))
          : [],
    };

    return res.status(200).json({ truck: truckWithOwners });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};