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

const handleJobOrderApproval = async (request, updateUser, tx) => {
  const { payload, actionType: action, recordId, requestedByUser } = request;

  let jobOrder;
  console.log(`[handleJobOrderApproval] Action: ${action}, Record ID: ${recordId}`);

  switch (action) {
    case "create":
      console.log("[create] Starting job order creation from approval");

      const {
        customerData,
        truckData,
        jobOrderData,
        materials = [],
      } = payload;

      console.log("[create] Customer data:", customerData);
      console.log("[create] Truck data:", truckData);
      console.log("[create] Job order data:", jobOrderData);
      console.log("[create] Materials:", materials);

      let finalCustomerId;
      let finalTruckId;

      // Handle Customer Creation/Validation
      if (customerData.customerId) {
        // Existing customer - validate
        const existingCustomer = await tx.customer.findUnique({
          where: { id: customerData.customerId },
        });
        if (!existingCustomer) {
          throw new Error("Invalid customer ID in approval payload");
        }
        finalCustomerId = customerData.customerId;
      } else {
        // New customer - create user and customer
        console.log("[create] Creating new customer");
        const { name, email, phone, username } = customerData;
        
        if (!name || !email || !phone || !username) {
          throw new Error("Missing required customer fields for new customer");
        }

        // Use your existing roleIdFinder function
        const roleId = await roleIdFinder(ROLES_LIST.CUSTOMER);

        const newUser = await tx.user.create({
          data: {
            fullName: name,
            hashPwd: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
            email,
            phone,
            username,
            roles: {
              create: [
                {
                  role: { connect: { id: roleId } },
                },
              ],
            },
            createdByUser: requestedByUser,
            updatedByUser: updateUser,
          },
        });

        const newCustomer = await tx.customer.create({
          data: { userId: newUser.id },
        });

        finalCustomerId = newCustomer.id;
        console.log(`[create] New customer created with ID: ${finalCustomerId}`);
      }

      // Handle Truck Creation/Validation
      if (truckData.truckId) {
        // Existing truck - validate ownership
        const existingTruck = await tx.truck.findUnique({
          where: { id: truckData.truckId },
        });
        if (!existingTruck) {
          throw new Error("Invalid truck ID in approval payload");
        }

        // Check ownership
        const ownership = await tx.truckOwnership.findFirst({
          where: { 
            truckId: truckData.truckId, 
            customerId: finalCustomerId, 
            endDate: null 
          },
        });

        if (!ownership) {
          throw new Error("Truck ownership validation failed for existing truck");
        }

        finalTruckId = truckData.truckId;
      } else {
        // New truck - create truck and ownership
        console.log("[create] Creating new truck");
        const { plate, model, make } = truckData;
        
        if (!plate || !model || !make) {
          throw new Error("Missing required truck fields for new truck");
        }

        // Check if truck with same plate already exists
        const existingTruck = await tx.truck.findUnique({ 
          where: { plate } 
        });
        if (existingTruck) {
          throw new Error("A truck with this plate number already exists");
        }

        const newTruck = await tx.truck.create({
          data: {
            plate,
            model,
            make,
            createdByUser: requestedByUser,
            updatedByUser: updateUser,
          },
        });

        // Create ownership record
        await tx.truckOwnership.create({
          data: {
            truckId: newTruck.id,
            customerId: finalCustomerId,
            startDate: new Date(),
            transferredByUser: updateUser,
          },
        });

        finalTruckId = newTruck.id;
        console.log(`[create] New truck created with ID: ${finalTruckId}`);
      }

      // Validate contractor if provided
      if (jobOrderData.contractorId) {
        const contractor = await tx.contractor.findUnique({
          where: { id: jobOrderData.contractorId },
        });
        if (!contractor) {
          throw new Error("Invalid contractor ID in approval payload");
        }
      }

      // Validate branch
      const branch = await tx.branch.findUnique({
        where: { id: jobOrderData.branchId },
      });
      if (!branch) {
        throw new Error("Invalid branch ID in approval payload");
      }

      // ✅ 5️⃣ Create the main job order record
      jobOrder = await tx.jobOrder.create({
        data: {
          ...jobOrderData,
          jobOrderCode: await generateJobOrderCode(prisma),
          customerId: finalCustomerId,
          truckId: finalTruckId,
          createdByUser: requestedByUser,
          updatedByUser: updateUser,
        },
        include: {
          truck: { select: { id: true, plate: true, model: true, make: true } },
          customer: {
            include: {
              user: { select: { username: true, fullName: true } },
            },
          },
          contractor: jobOrderData.contractorId
            ? { include: { user: { select: { username: true, fullName: true } } } }
            : false,
          branch: { select: { id: true, branchName: true } },
        },
      });
      console.log(`[create] Job order created with ID: ${jobOrder.id}`);

      // ✅ 6️⃣ Create materials if provided
      if (materials.length > 0) {
        console.log("[create] Creating material entries");
        
        const invalid = materials.some(
          (m) => !m.name || !m.price || !m.quantity
        );
        if (invalid) {
          throw new Error(
            "Each material must include non-empty name, non-zero price, and non-zero quantity"
          );
        }

        await tx.material.createMany({
          data: materials.map((m) => ({
            jobOrderId: jobOrder.id,
            materialName: m.name,
            quantity: m.quantity,
            price: m.price,
          })),
        });

        console.log(`[create] Created ${materials.length} material entries`);
      }

      console.log("[create] Job order creation completed");
      break;

    case "edit":
      console.log("[edit] Starting job order update from approval");

      const {
        jobOrderId,
        updateData,
        materials: editMaterials = [],
      } = payload;

      // Update job order - spread the updateData directly
      jobOrder = await tx.jobOrder.update({
        where: { id: jobOrderId },
        data: {
          ...updateData, // Spread the updateData fields directly
          updatedByUser: updateUser,
        },
        include: {
          truck: { select: { id: true, plate: true, model: true, make: true } },
          customer: {
            include: {
              user: { select: { username: true, fullName: true } },
            },
          },
          contractor: updateData.contractorId
            ? { include: { user: { select: { username: true, fullName: true } } } }
            : false,
          branch: { select: { id: true, branchName: true } },
        },
      });

      // Update materials if provided
      if (editMaterials.length > 0) {
        console.log("[edit] Updating material entries");
        
        await tx.material.deleteMany({ where: { jobOrderId: jobOrderId } });
        
        await tx.material.createMany({
          data: editMaterials.map((m) => ({
            jobOrderId: jobOrderId,
            materialName: m.name,
            quantity: m.quantity,
            price: m.price,
          })),
        });

        console.log(`[edit] Updated ${editMaterials.length} material entries`);
      }

      console.log("[edit] Job order update completed");
      break;

    case "delete":
      console.log(`[delete] Attempting to delete job order: ${recordId}`);

      const existingJobOrder = await tx.jobOrder.findUnique({
        where: { id: payload.jobOrderId },
        include: {
          transactions: true,
          materials: true,
        },
      });

      if (!existingJobOrder) throw new Error("Job order not found for deletion");

      // Check if job order has relations that prevent deletion
      const excludedKeys = ["labor", "contractorPercent", "materials"];
      const hasRelations = relationsChecker(existingJobOrder, excludedKeys);

      console.log("[delete] Has relations:", hasRelations);

      if (hasRelations) {
        throw new Error("Job order cannot be deleted as it's connected to other records");
      }

      // Delete materials first (due to foreign key constraints)
      await tx.material.deleteMany({ where: { jobOrderId: payload.jobOrderId } });
      
      // Delete the job order
      await tx.jobOrder.delete({ where: { id: payload.jobOrderId } });

      jobOrder = null;
      console.log("[delete] Job order deletion completed");
      break;

    default:
      throw new Error(`Unknown action type for job order: ${action}`);
  }

  console.log("[handleJobOrderApproval] Finished action");
  return jobOrder;
};

const createJobOrderOld = async (req, res) => {
  const {
    customerId,
    truckId,
    branchId,
    contractorId,
    description,
    materials,
    labor,
  } = req.body;

  if (!description || !customerId || !branchId || !truckId) {
    return res.status(400).json({
      message: "Customer, truck, branch, and description are required",
    });
  }

  try {
    // Validate existence of required foreign keys
    const [customer, truck, branch] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.truck.findUnique({ where: { id: truckId } }),
      prisma.branch.findUnique({ where: { id: branchId } }),
    ]);

    if (!customer) return res.status(400).json({ message: "Invalid customer ID" });
    if (!truck) return res.status(400).json({ message: "Invalid truck ID" });
    if (!branch) return res.status(400).json({ message: "Invalid branch ID" });

    // Validate contractor if provided
    let contractor = null;
    if (contractorId) {
      contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
      if (!contractor)
        return res.status(400).json({ message: "Invalid contractor ID" });
    }

    // Validate if customer owns the truck (ownership with no endDate)
    const ownership = await prisma.truckOwnership.findFirst({
      where: { truckId, customerId, endDate: null },
    });

    if (!ownership) {
      return res.status(400).json({
        message: "This truck is not currently owned by the specified customer",
      });
    }

    // -------------------------------------------------------------
    // Proceed if all validation passes
    // -------------------------------------------------------------
    const needsApproval = req.approval;
    const newCode = await generateJobOrderCode(prisma);

    const jobOrderData = {
      customerId,
      branchId,
      truckId,
      description,
      ...(contractorId && { contractorId }),
      ...(labor && { labor }),
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    let contractorPercent = 0,
      contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    const result = await prisma.$transaction(async (tx) => {
      // Compute contractor commission if applicable
      if (contractor && labor) {
        contractorPercent = contractor.commission;
        contractorCommission = labor * contractorPercent;
        shopCommission = labor - contractorCommission;
      }

      const jobOrderModel = needsApproval ? tx.jobOrderEdit : tx.jobOrder;
      const materialModel = needsApproval ? tx.materialEdit : tx.material;

      const jobOrderInclude = {
        truck: { select: { id: true, plate: true } },
        customer: { include: { user: { select: { username: true, fullName: true } } } },
        contractor: contractorId
          ? { include: { user: { select: { username: true, fullName: true } } } }
          : false,
        branch: { select: { id: true, branchName: true } },
      };

      const jobOrder = await jobOrderModel.create({
        data: {
          ...jobOrderData,
          jobOrderCode: needsApproval ? null : newCode,
          requestType: needsApproval ? "create" : undefined,
          contractorPercent,
        },
        include: jobOrderInclude,
      });

      // Handle materials
      if (materials && materials.length > 0) {
        const invalid = materials.some(
          (m) => !m.name || !m.price || !m.quantity
        );
        if (invalid)
          return res.status(400).json({
            message:
              "Each material must include non-empty name, non-zero price, and non-zero quantity",
          });

        await materialModel.createMany({
          data: materials.map((m) => ({
            jobOrderId: needsApproval ? null : jobOrder.id,
            materialName: m.name,
            quantity: m.quantity,
            price: m.price,
            ...(needsApproval && { requestType: "create" }),
          })),
        });

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return jobOrder;
    });

    const {
      truckId: _,
      customerId: __,
      contractorId: ___,
      branchId: ____,
      ...jobOrderFields
    } = result;

    return res.status(201).json({
      message: needsApproval
        ? "Job order awaiting approval"
        : "Job order successfully created",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createJobOrderNOTX = async (req, res) => {
  const {
    customerId,
    name,
    email,
    phone,
    username,
    truckId,
    plate,
    model,
    make,
    branchId,
    contractorId,
    description,
    materials,
    labor,
  } = req.body;

  if (
    !description ||
    !branchId ||
    (!truckId && (!plate || !model || !make)) ||
    (!customerId && (!name || !email || !phone || !username))
  ) {
    return res.status(400).json({
      message: "Customer, branch, description, truck, and customer required.",
    });
  }

  try {
    // ✅ Validate branch
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) return res.status(400).json({ message: "Invalid branch ID" });

    let customer = null;
    let user = null;
    let activeTruckId = truckId;

    // ✅ 1️⃣ Existing customer logic
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer)
        return res.status(400).json({ message: "Invalid customer ID" });

      // If truck ID is provided, verify ownership
      if (truckId) {
        const ownership = await prisma.truckOwnership.findFirst({
          where: { truckId, customerId, endDate: null },
        });

        if (!ownership) {
          return res.status(400).json({
            message:
              "This truck is not currently owned by the specified customer. Transfer ownership first.",
          });
        }
      }

      // If no truckId, but new truck details provided, create new truck for them
      if (!truckId && plate && model && make) {
        const existingTruck = await prisma.truck.findUnique({ where: { plate } });
        if (existingTruck) {
          return res.status(400).json({
            message:
              "A truck with this plate number already exists. Transfer ownership first.",
          });
        }

        const newTruck = await prisma.$transaction(async (tx) => {
          const createdTruck = await tx.truck.create({
            data: {
              plate,
              model,
              make,
              createdByUser: req.username,
              updatedByUser: req.username,
            },
          });

          await tx.truckOwnership.create({
            data: {
              truckId: createdTruck.id,
              customerId: customer.id,
              startDate: new Date(),
              transferredByUser: req.username,
            },
          });

          return createdTruck;
        });

        activeTruckId = newTruck.id;
      }
    }

    // ✅ 2️⃣ Handle new customer
    else if (name && email && phone && username) {
      const roleId = await roleIdFinder(ROLES_LIST.CUSTOMER);

      // 🔸 Check if truck already exists (not allowed for new customer)
      const existingTruck = await prisma.truck.findUnique({ where: { id: truckId } });
      if (existingTruck) {
        return res.status(400).json({
          message:
            "Create customer account first in User tab then transfer truck ownership.",
        });
      }

      // 🔸 Create new user, customer, and truck together
      const { createdCustomer, createdTruck } = await prisma.$transaction(
        async (tx) => {
          const newUser = await tx.user.create({
            data: {
              fullName: name,
              hashPwd: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
              email,
              phone,
              username,
              roles: {
                create: [
                  {
                    role: { connect: { id: roleId } },
                  },
                ],
              },
              createdByUser: req.username,
              updatedByUser: req.username
            },
          });

          const newCustomer = await tx.customer.create({
            data: { userId: newUser.id },
          });

          const newTruck = await tx.truck.create({
            data: {
              plate,
              model,
              make,
              createdByUser: req.username,
              updatedByUser: req.username,
              owners: {
                create: {
                  customerId: newCustomer.id,
                  startDate: new Date(),
                  transferredByUser: req.username,
                },
              },
            },
          });

          return { createdCustomer: newCustomer, createdTruck: newTruck };
        }
      );

      customer = createdCustomer;
      activeTruckId = createdTruck.id;
    }

    // ✅ Validate contractor if provided
    let contractor = null;
    if (contractorId) {
      contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
      });
      if (!contractor)
        return res.status(400).json({ message: "Invalid contractor ID" });
    }

    const needsApproval = req.approval;
    const newCode = await generateJobOrderCode(prisma);

    const jobOrderData = {
      customerId: customer.id,
      branchId,
      truckId: activeTruckId,
      description,
      ...(contractorId && { contractorId }),
      ...(labor && { labor }),
      createdByUser: req.username,
      updatedByUser: req.username,
    };

    let contractorPercent = 0,
      contractorCommission = 0,
      shopCommission = 0,
      totalMaterialCost = 0;

    // ✅ Create Job Order Transaction
    const result = await prisma.$transaction(async (tx) => {
      if (contractor && labor) {
        contractorPercent = contractor.commission;
        contractorCommission = labor * contractorPercent;
        shopCommission = labor - contractorCommission;
      }

      let jobOrder = null;

      if (!needsApproval) {
        jobOrder = await tx.jobOrder.create({
          data: {
            ...jobOrderData,
            jobOrderCode: newCode,
            contractorPercent,
          },
          include: {
            truck: { select: { id: true, plate: true, model: true, make: true } },
            customer: {
              include: {
                user: { select: { username: true, fullName: true } },
              },
            },
            contractor: contractorId
              ? { include: { user: { select: { username: true, fullName: true } } } }
              : false,
            branch: { select: { id: true, branchName: true } },
          },
        });

        if (materials && materials.length > 0) {
          const invalid = materials.some(
            (m) => !m.name || !m.price || !m.quantity
          );
          if (invalid)
            throw new Error(
              "Each material must include non-empty name, non-zero price, and non-zero quantity"
            );

          await tx.material.createMany({
            data: materials.map((m) => ({
              jobOrderId: jobOrder.id,
              materialName: m.name,
              quantity: m.quantity,
              price: m.price,
            })),
          });

          totalMaterialCost = materials.reduce(
            (sum, m) => sum + m.price * m.quantity,
            0
          );
        }
      }


      return jobOrder;
    });

    const { truckId: _t, customerId: _c, contractorId: _ct, branchId: _b, ...jobOrderFields } = result;

    return res.status(201).json({
      message: needsApproval
        ? "Job order awaiting approval"
        : "Job order successfully created",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};