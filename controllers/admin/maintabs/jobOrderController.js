const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const generateJobOrderCode = require("../../../utils/services/generateJobOrderCode");
const relationsChecker = require("../../../utils/services/relationsChecker");
const { getDateRangeFilter } = require("../../../utils/filters/dateRangeFilter");
const { branchFilter } = require("../../../utils/filters/branchFilter"); 
const bcrypt = require("bcrypt");
const ROLES_LIST = require("../../../constants/ROLES_LIST");
const roleIdFinder = require("../../../utils/finders/roleIdFinder");
const { requestApproval } = require("../../../utils/services/approvalService")
const {logActivity} = require("../../../utils/services/activityService.js")
const deleteFile = require("../../../utils/services/imageDeleter")
const checkPendingApproval = require("../../../utils/services/checkPendingApproval")
const parseArrayFields = require("../../../utils/services/parseArrayFields.js");




// "POST /"
const createJobOrder = async (req, res) => {
  const parsedBody = parseArrayFields(req.body, ["materials", "images"]);
  const {
    customerId,
    name,
    email,
    username,
    truckId,
    plate,
    model,
    make,
    image,
    branchId,
    contractorId,
    description,
    materials,
    labor,
    images,
  } = parsedBody; 

  const beforeImages = req.files?.beforeImages?.map(f => f.filename) || []; 
  const afterImages = req.files?.afterImages?.map(f => f.filename) || [];

  const truckImage = req.files?.truckImage?.[0]?.filename || null;
  const customerImage = req.files?.customerImage?.[0]?.filename || null;

  const imageData = [
    ...beforeImages.map(filename => ({ type: "before", filename })),
    ...afterImages.map(filename => ({ type: "after", filename })),
  ];

  let { phone } = req.body;

  // Debug logging
  console.log('Raw customerId from request:', req.body.customerId);
  console.log('Parsed customerId:', customerId);
  console.log('Type of customerId:', typeof customerId);
  
  // Check if customerId is actually a valid ID (not empty string)
  const hasValidCustomerId = customerId && customerId.trim() !== '';
  
  // Enhanced validation
  if (
    !description ||
    !branchId ||
    (!truckId && (!plate || !model || !make)) ||
    (!hasValidCustomerId && (!name || !phone || !username))
  ) {
    return res.status(400).json({
      message: "Customer, branch, description, and truck required.",
    });
  }

  try {
    // ✅ Global validation - runs regardless of approval needs
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) return res.status(400).json({ message: "Invalid branch ID" });

    if (phone) {
      phone = phone.toString();
    }

    // Validate customer exists if valid customerId is provided
    if (hasValidCustomerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Validate new customer data
    if (name && phone && username) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });

      const pendingUsername = await checkPendingApproval(prisma, 'user', ['username'], username);
      const pendingEmail = await checkPendingApproval(prisma, 'user', ['email'], email);

      if (pendingUsername || pendingEmail) {
        let message = [];
        if (
          (existingUser && existingUser.username === username) ||
          (pendingUsername && pendingUsername.value === username)
        )
          message.push("Username");
        if (
          (existingUser && existingUser.email === email) ||
          (pendingEmail && pendingEmail.value === email)
        )
          message.push("Email");

        return res
          .status(400)
          .json({ error: `${message.join(" and ")} already exist` });
      }
    }

    // Validate truck exists (if truckId provided)
    if (truckId) {
      const existingTruck = await prisma.truck.findUnique({ 
        where: { id: truckId } 
      });
      if (!existingTruck) {
        return res.status(400).json({ message: "Invalid truck ID" });
      }
    }

    // Validate contractor if provided
    if (contractorId) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
      });
      if (!contractor) return res.status(400).json({ message: "Invalid contractor ID" });
    }

    // Check if truck plate already exists (for new trucks)
    if (!truckId && plate) {
      const existingTruck = await prisma.truck.findUnique({ where: { plate } });
      const pendingJobOrderTruck = await checkPendingApproval(prisma, 'jobOrder', ['truckData', 'plate'], plate);
      const pendingTruck = await checkPendingApproval(prisma, 'truck', ['plate'], plate);
      if (existingTruck || pendingTruck || pendingJobOrderTruck) {
        return res.status(400).json({
          message: "A truck with this plate number already exists or is pending.",
        });
      }
    }

    // Validate materials if provided
    if (materials && materials.length > 0) {
      const invalid = materials.some(
        (m) => !m.materialName || !m.price || !m.quantity
      );
      if (invalid) {
        return res.status(400).json({
          message: "Each material must include non-empty name, non-zero price, and non-zero quantity",
        });
      }
    }

    const needsApproval = req.approval;
    const newCode = await generateJobOrderCode(prisma);

    // ✅ If approval is needed, create approval request
    if (needsApproval) {
      const approvalPayload = {
        customerData: hasValidCustomerId ? { customerId } : { name, email, phone, username, image: customerImage },
        truckData: truckId ? { truckId } : { plate, model, make, image: truckImage },
        jobOrderData: {
          branchId,
          description,
          ...(contractorId && { contractorId }),
          ...(labor && { labor }),
          jobOrderCode: null,
        },
        materials: materials || [],
        images: imageData || [],
      };

      const approvalLog = await requestApproval('jobOrder', null, 'create', approvalPayload, req.username)

      return res.status(202).json({
        message: "Job order creation awaiting approval",
        data: {
          approvalId: approvalLog.id,
        },
      });
    }

    // ✅ If no approval needed, proceed with creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      let customer = null;
      let activeTruckId = truckId;

      // 1️⃣ Handle existing customer
      if (hasValidCustomerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerId },
        });

        if (!customer) {
          throw new Error("Invalid customer ID");
        }

        // Handle truck assignment/transfer for existing customer
        if (truckId) {
          // Check current ownership
          const currentOwnership = await tx.truckOwnership.findFirst({
            where: { 
              truckId: truckId,
              endDate: null 
            },
          });

          if (currentOwnership) {
            if (currentOwnership.customerId !== customerId) {
              // Transfer ownership - end previous ownership and create new one
              await tx.truckOwnership.updateMany({
                where: { 
                  truckId: truckId,
                  endDate: null 
                },
                data: { 
                  endDate: new Date() 
                },
              });

              await tx.truckOwnership.create({
                data: {
                  truckId: truckId,
                  customerId: customerId,
                  startDate: new Date(),
                  transferredByUser: req.username,
                },
              });
            }
            // If already owned by this customer, no action needed
          } else {
            // Truck has no current owner - assign ownership
            await tx.truckOwnership.create({
              data: {
                truckId: truckId,
                customerId: customerId,
                startDate: new Date(),
                transferredByUser: req.username,
              },
            });
          }
          
          activeTruckId = truckId;
        }

        // If no truckId, but new truck details provided, create new truck for them
        if (!truckId && plate && model && make) {
          const existingTruck = await tx.truck.findUnique({ where: { plate } });
          if (existingTruck) {
            throw new Error("A truck with this plate number already exists. Transfer ownership first.");
          }

          const createdTruck = await tx.truck.create({
            data: {
              plate,
              model,
              make,
              image: truckImage,
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

          activeTruckId = createdTruck.id;
        } 
      }
      // 2️⃣ Handle new customer
      else if (name && phone && username) {
        console.log('Creating new customer with:', { name, email, phone, username });
        
        const roleId = await roleIdFinder(ROLES_LIST.CUSTOMER);

        const newUser = await tx.user.create({
          data: {
            fullName: name,
            hashPwd: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
            email: email || null,
            phone,
            username,
            image: customerImage,
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

        customer = await tx.customer.create({
          data: { userId: newUser.id },
        });

        console.log('Created customer:', customer.id);

        let finalTruck;

        if (plate && model && make) {
          // Create new truck for new customer
          finalTruck = await tx.truck.create({
            data: {
              plate,
              model,
              make,
              image: truckImage,
              createdByUser: req.username,
              updatedByUser: req.username,
              owners: {
                create: {
                  customerId: customer.id,
                  startDate: new Date(),
                  transferredByUser: req.username,
                },
              },
            },
          });
        } else if (truckId) {
          // Validate truck exists in transaction context
          const existingTruck = await tx.truck.findUnique({
            where: { id: truckId },
          });
          if (!existingTruck) {
            throw new Error("Truck not found");
          }

          // For new customer with existing truck - transfer ownership
          await tx.truckOwnership.updateMany({
            where: { 
              truckId: truckId,
              endDate: null 
            },
            data: { 
              endDate: new Date() 
            },
          });

          await tx.truckOwnership.create({
            data: {
              truckId: truckId,
              customerId: customer.id,
              startDate: new Date(),
              transferredByUser: req.username,
            },
          });

          finalTruck = existingTruck;
        } else {
          throw new Error("Either truckId or plate details are required for new customer");
        }

        customer = customer;
        activeTruckId = finalTruck.id;
      } else {
        throw new Error("Customer information is incomplete");
      }

      // Ensure customer was created/found
      if (!customer) {
        throw new Error("Failed to resolve customer");
      }

      // Calculate commissions
      let contractor = null;
      let contractorPercent = 0,
        contractorCommission = 0,
        shopCommission = 0,
        totalMaterialCost = 0;

      if (contractorId) {
        contractor = await tx.contractor.findUnique({
          where: { id: contractorId },
        });

        if (labor) {
          contractorPercent = contractor.commission;
          contractorCommission = labor * contractorPercent;
          shopCommission = labor - contractorCommission;
        }
      }

      const jobOrderData = {
        customerId: customer.id,
        branchId,
        truckId: activeTruckId,
        description,
        ...(contractorId && { contractorId }),
        ...(labor && { labor }),
        createdByUser: req.username,
        updatedByUser: req.username,
        images: {
          create: imageData,
        },
      };

      console.log('Labor value from request:', labor);
      console.log('Labor type:', typeof labor);

      // Create job order
      const jobOrder = await tx.jobOrder.create({
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

      // Create materials if provided
      if (materials && materials.length > 0) {
        await tx.material.createMany({
          data: materials.map((m) => ({
            jobOrderId: jobOrder.id,
            materialName: m.materialName,
            quantity: m.quantity,
            price: m.price,
          })),
        });

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return {
        jobOrder,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      };
    });

    // Handle successful creation response
    const { jobOrder, contractorCommission, shopCommission, totalMaterialCost, materials: resultMaterials } = result;
    const { truckId: _t, customerId: _c, contractorId: _ct, branchId: _b, ...jobOrderFields } = jobOrder;
    
    await logActivity(req.username, `${req.username} created Job Order ${jobOrder.jobOrderCode}`);

    return res.status(201).json({
      message: "Job order successfully created",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: resultMaterials,
      },
    });

  } catch (err) {
    console.log('Error in createJobOrder:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const createJobOrderOld = async (req, res) => {
  const parsedBody = parseArrayFields(req.body, ["materials", "images"]);
  const {
    customerId,
    name,
    email,
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
    images,
  } = parsedBody; 

  const beforeImages = req.files?.beforeImages?.map(f => f.filename) || []; 
  const afterImages = req.files?.afterImages?.map(f => f.filename) || [];

  const truckImage = req.files?.truckImage?.[0]?.filename || null;
  const customerImage = req.files?.customerImage?.[0]?.filename || null;

  const imageData = [
    ...beforeImages.map(filename => ({ type: "before", filename })),
    ...afterImages.map(filename => ({ type: "after", filename })),
  ];

  let { phone } = req.body;

  if (
    !description ||
    !branchId ||
    (!truckId && (!plate || !model || !make)) ||
    (!customerId && (!name || !phone || !username))
  ) {
    return res.status(400).json({
      message: "Customer, branch, description, and truck required.",
    });
  }

  try {
    // ✅ Global validation - runs regardless of approval needs
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) return res.status(400).json({ message: "Invalid branch ID" });

    if (phone) {
      phone = phone.toString();
    }

    // Validate customer exists if customerId is provided
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Validate new customer data
    if (name && phone && username) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });

      const pendingUsername = await checkPendingApproval(prisma, 'user', ['username'], username);
      const pendingEmail = await checkPendingApproval(prisma, 'user', ['email'], email);

      if (pendingUsername || pendingEmail) {
        let message = [];
        if (
          (existingUser && existingUser.username === username) ||
          (pendingUsername && pendingUsername.value === username)
        )
          message.push("Username");
        if (
          (existingUser && existingUser.email === email) ||
          (pendingEmail && pendingEmail.value === email)
        )
          message.push("Email");

        return res
          .status(400)
          .json({ error: `${message.join(" and ")} already exist` });
      }
    }

    // Validate truck exists (if truckId provided)
    if (truckId) {
      const existingTruck = await prisma.truck.findUnique({ 
        where: { id: truckId } 
      });
      if (!existingTruck) {
        return res.status(400).json({ message: "Invalid truck ID" });
      }
    }

    // Validate contractor if provided
    if (contractorId) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
      });
      if (!contractor) return res.status(400).json({ message: "Invalid contractor ID" });
    }

    // Check if truck plate already exists (for new trucks)
    if (!truckId && plate) {
      const existingTruck = await prisma.truck.findUnique({ where: { plate } });
      const pendingJobOrderTruck = await checkPendingApproval(prisma, 'jobOrder', ['truckData', 'plate'], plate);
      const pendingTruck = await checkPendingApproval(prisma, 'truck', ['plate'], plate);
      if (existingTruck || pendingTruck || pendingJobOrderTruck) {
        return res.status(400).json({
          message: "A truck with this plate number already exists or is pending.",
        });
      }
    }

    // Validate materials if provided
    if (materials && materials.length > 0) {
      const invalid = materials.some(
        (m) => !m.materialName || !m.price || !m.quantity
      );
      if (invalid) {
        return res.status(400).json({
          message: "Each material must include non-empty name, non-zero price, and non-zero quantity",
        });
      }
    }

    const needsApproval = req.approval;
    const newCode = await generateJobOrderCode(prisma);

    // ✅ If approval is needed, create approval request
    if (needsApproval) {
      const approvalPayload = {
        customerData: customerId ? { customerId } : { name, email, phone, username, image: customerImage },
        truckData: truckId ? { truckId } : { plate, model, make, image: truckImage },
        jobOrderData: {
          branchId,
          description,
          ...(contractorId && { contractorId }),
          ...(labor && { labor }),
          jobOrderCode: null,
        },
        materials: materials || [],
        images: imageData || [],
      };

      const approvalLog = await requestApproval('jobOrder', null, 'create', approvalPayload, req.username)

      return res.status(202).json({
        message: "Job order creation awaiting approval",
        data: {
          approvalId: approvalLog.id,
        },
      });
    }

    // ✅ If no approval needed, proceed with creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      let customer = null;
      let activeTruckId = truckId;

      // 1️⃣ Existing customer logic
      if (customerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerId },
        });

        // Handle truck assignment/transfer for existing customer
        if (truckId) {
          // Check current ownership
          const currentOwnership = await tx.truckOwnership.findFirst({
            where: { 
              truckId: truckId,
              endDate: null 
            },
          });

          if (currentOwnership) {
            if (currentOwnership.customerId !== customerId) {
              // Transfer ownership - end previous ownership and create new one
              await tx.truckOwnership.updateMany({
                where: { 
                  truckId: truckId,
                  endDate: null 
                },
                data: { 
                  endDate: new Date() 
                },
              });

              await tx.truckOwnership.create({
                data: {
                  truckId: truckId,
                  customerId: customerId,
                  startDate: new Date(),
                  transferredByUser: req.username,
                },
              });
            }
            // If already owned by this customer, no action needed
          } else {
            // Truck has no current owner - assign ownership
            await tx.truckOwnership.create({
              data: {
                truckId: truckId,
                customerId: customerId,
                startDate: new Date(),
                transferredByUser: req.username,
              },
            });
          }
          
          activeTruckId = truckId;
        }

        // If no truckId, but new truck details provided, create new truck for them
        if (!truckId && plate && model && make) {
          const existingTruck = await tx.truck.findUnique({ where: { plate } });
          if (existingTruck) {
            throw new Error("A truck with this plate number already exists. Transfer ownership first.");
          }

          const createdTruck = await tx.truck.create({
            data: {
              plate,
              model,
              make,
              image: truckImage,
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

          activeTruckId = createdTruck.id;
        } 
      }

      // 2️⃣ Handle new customer
      else if (name && email && phone && username) {
        const roleId = await roleIdFinder(ROLES_LIST.CUSTOMER);
        console.log(req.body)

        const newUser = await tx.user.create({
          data: {
            fullName: name,
            hashPwd: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
            email,
            phone,
            username,
            image: customerImage,
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

        let finalTruck;

        if (plate && model && make) {
          // Create new truck for new customer
          finalTruck = await tx.truck.create({
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
        } else if (truckId) {
          // Validate truck exists in transaction context
          const existingTruck = await tx.truck.findUnique({
            where: { id: truckId },
          });
          if (!existingTruck) {
            throw new Error("Truck not found");
          }

          // For new customer with existing truck - transfer ownership
          await tx.truckOwnership.updateMany({
            where: { 
              truckId: truckId,
              endDate: null 
            },
            data: { 
              endDate: new Date() 
            },
          });

          await tx.truckOwnership.create({
            data: {
              truckId: truckId,
              customerId: newCustomer.id,
              startDate: new Date(),
              transferredByUser: req.username,
            },
          });

          finalTruck = existingTruck;
        } else {
          throw new Error("Either truckId or plate details are required for new customer");
        }

        customer = newCustomer;
        activeTruckId = finalTruck.id;
      }

      // Calculate commissions
      let contractor = null;
      let contractorPercent = 0,
        contractorCommission = 0,
        shopCommission = 0,
        totalMaterialCost = 0;

      if (contractorId) {
        contractor = await tx.contractor.findUnique({
          where: { id: contractorId },
        });

        if (labor) {
          contractorPercent = contractor.commission;
          contractorCommission = labor * contractorPercent;
          shopCommission = labor - contractorCommission;
        }
      }

      const jobOrderData = {
        customerId: customer.id,
        branchId,
        truckId: activeTruckId,
        description,
        ...(contractorId && { contractorId }),
        ...(labor && { labor }),
        createdByUser: req.username,
        updatedByUser: req.username,
        images: {
          create: imageData,
        },
      };

      console.log('Labor value from request:', labor);
      console.log('Labor type:', typeof labor);

      // Create job order
      const jobOrder = await tx.jobOrder.create({
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

      // Create materials if provided
      if (materials && materials.length > 0) {
        await tx.material.createMany({
          data: materials.map((m) => ({
            jobOrderId: jobOrder.id,
            materialName: m.materialName,
            quantity: m.quantity,
            price: m.price,
          })),
        });

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return {
        jobOrder,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      };
    });

    // Handle successful creation response
    const { jobOrder, contractorCommission, shopCommission, totalMaterialCost, materials: resultMaterials } = result;
    const { truckId: _t, customerId: _c, contractorId: _ct, branchId: _b, ...jobOrderFields } = jobOrder;

    await logActivity(req.username, `${req.username } created Job Order ${jobOrder.jobOrderCode}`);
    return res.status(201).json({
      message: "Job order successfully created",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: resultMaterials,
      },
    });

  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ message: err.message });
  }
};

// "PUT /:id"
const editJobOrder = async (req, res) => {
  const parsedBody = parseArrayFields(req.body, ["materials", "images"]);
  const {
    branchId,
    contractorId,
    description,
    materials,
    labor,
    images,
  } = parsedBody;

  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    // ✅ Global validation - runs regardless of approval needs
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.params.id },
      include: {
        images: true
      }
    });
    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.params.id} not found` });

    // Validate branch exists if provided
    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) return res.status(400).json({ message: "Invalid branch ID" });
    }
    // Validate contractor if provided
    if (contractorId && contractorId !== "undefined" && contractorId !== "null") {
      const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
      });
      if (!contractor) return res.status(400).json({ message: "Invalid contractor ID" });
    }



    // Validate materials if provided
    if (materials && materials.length > 0) {
      const invalid = materials.some(
        (m) => !m.materialName || !m.price || !m.quantity
      );
      if (invalid) {
        return res.status(400).json({
          message: "Each material must include non-empty name, non-zero price, and non-zero quantity",
        });
      }
    }

    const needsApproval = req.approval;

    // ✅ Handle uploaded images
    const beforeImages = req.files?.beforeImages?.map((f) => f.filename) || [];
    const afterImages = req.files?.afterImages?.map((f) => f.filename) || [];

    const imageData = [
    ...beforeImages.map(filename => ({ type: "before", filename, jobOrderId: jobOrder.id })),
    ...afterImages.map(filename => ({ type: "after", filename, jobOrderId: jobOrder.id })),
    ];

    // ✅ If approval is needed, create approval request
    if (needsApproval) {
      // Create approval request without updating any entities
      const approvalPayload = {
        jobOrderId: req.params.id,
        updateData: {
          customerId: jobOrder.customerId,
          truckId: jobOrder.truckId,
          branchId: branchId ?? jobOrder.branchId,
          description: description ?? jobOrder.description,
          contractorId: contractorId && contractorId !== "undefined" && contractorId !== "null" ? contractorId : null,
          labor: labor && labor !== "undefined" && labor !== "null" ? labor : null,
          images: imageData
        },
        materials: materials || [],
      };

      const approvalLog = await requestApproval(
        'jobOrder', 
        req.params.id, 
        'edit', 
        approvalPayload, 
        req.username
      );

      return res.status(202).json({
        message: "Job order edit awaiting approval",
        data: {
          approvalId: approvalLog.id,
          jobOrderCode: jobOrder.jobOrderCode,
        },
      });
    }

    // ✅ If no approval needed, proceed with update in transaction
    const result = await prisma.$transaction(async (tx) => {
      let contractor = null;
      let contractorPercent = 0,
        contractorCommission = 0,
        shopCommission = 0,
        totalMaterialCost = 0;

    if (imageData.length > 0) {
      await prisma.jobOrderImage.createMany({ data: imageData });
      console.log(`📸 Added ${imageData.length} new job order images`);
    }

      // Calculate commissions if contractor and labor provided
      if (contractorId && labor) {
        contractor = await tx.contractor.findUnique({
          where: { id: contractorId },
        });
        contractorPercent = contractor.commission;
        contractorCommission = Number(labor) * contractorPercent;
        shopCommission = Number(labor) - contractorCommission;
      }

      const jobOrderData = {
        customerId: jobOrder.customerId,
        truckId: jobOrder.truckId,
        branchId: branchId ?? jobOrder.branchId,
        description: description ?? jobOrder.description,
        contractorId: contractorId && contractorId !== "undefined" && contractorId !== "null" ? contractorId : null,
        labor: labor && labor !== "undefined" && labor !== "null" ? labor : null,
        updatedByUser: req.username,
      };

      const jobOrderInclude = {
        truck: { select: { id: true, plate: true } },
        customer: {
          include: { user: { select: { username: true, fullName: true } } },
        },
        contractor: contractorId
          ? {
              include: { user: { select: { username: true, fullName: true } } },
            }
          : false,
        branch: { select: { id: true, branchName: true } },
      };

      // Update job order
      const editedJobOrder = await tx.jobOrder.update({
        where: { id: jobOrder.id },
        data: jobOrderData,
        include: jobOrderInclude,
      });

      // Update materials if provided
      if (materials && materials.length > 0) {
        // Delete existing materials and create new ones
        await tx.material.deleteMany({ where: { jobOrderId: jobOrder.id } });
        
        await tx.material.createMany({
          data: materials.map((m) => ({
            jobOrderId: jobOrder.id,
            materialName: m.materialName,
            quantity: m.quantity,
            price: m.price,
          })),
        });

        totalMaterialCost = materials.reduce(
          (sum, m) => sum + m.price * m.quantity,
          0
        );
      }

      return {
        jobOrder: editedJobOrder,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      };
    });

    // Handle successful update response
    const { jobOrder: editedJobOrder, contractorCommission, shopCommission, totalMaterialCost, materials: resultMaterials } = result;
    const { truckId: _, customerId: __, contractorId: ___, branchId: ____, ...jobOrderFields } = editedJobOrder;
    await logActivity(req.username, `${req.username} edited Job Order ${jobOrder.jobOrderCode}`);

    return res.status(200).json({
      message: "Job order successfully updated",
      data: {
        ...jobOrderFields,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: resultMaterials,
      },
    });

  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ message: err.message });
  }
};

// "DELETE /:id"
const deleteJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(404).json({ message: "ID is required" });

  try {
    // ✅ Global validation - runs regardless of approval needs
    const jobOrder = await prisma.jobOrder.findFirst({
      where: { id: req.params.id },
      include: {
        transactions: true,
        materials: true,
      }
    });

    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${req.params.id} not found` });

    const needsApproval = req.approval;

    // ✅ If approval is needed, create approval request
    if (needsApproval) {
      const approvalPayload = {
        jobOrderId: req.params.id,
        jobOrderData: {
          jobOrderCode: jobOrder.jobOrderCode,
          customerId: jobOrder.customerId,
          truckId: jobOrder.truckId,
          branchId: jobOrder.branchId,
          contractorId: jobOrder.contractorId,
          description: jobOrder.description,
          labor: jobOrder.labor,
          status: jobOrder.status,
        }
      };

      const approvalLog = await requestApproval(
        'jobOrder', 
        req.params.id, 
        'delete', 
        approvalPayload, 
        req.username
      );

      return res.status(202).json({
        message: "Job order deletion awaiting approval",
        data: {
          approvalId: approvalLog.id,
          jobOrderCode: jobOrder.jobOrderCode,
        },
      });
    }

    // ✅ If no approval needed, proceed with deletion in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if job order has relations that prevent deletion
      const excludedKeys = ["labor", "contractorPercent", "materials"];
      const hasRelations = relationsChecker(jobOrder, excludedKeys);

      if (hasRelations) {
        throw new Error("Job order cannot be deleted as it's connected to other records"); 
      }
      
      // Delete materials first (due to foreign key constraints)
      await tx.material.deleteMany({ where: { jobOrderId: jobOrder.id } });

      // Delete the job order
      const deletedJobOrder = await tx.jobOrder.delete({
        where: { id: jobOrder.id },
      });

      return deletedJobOrder;
    });

    return res.status(200).json({ 
      message: "Job order successfully deleted as well as materials",
      data: {
        jobOrderCode: jobOrder.jobOrderCode,
      }
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// "GET /"
const getAllJobOrdersoLD = async (req, res) => {
  const statusGroup = req?.params.statusGroup; // 'active' or 'archived'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const branch = req?.query?.branch;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;
  
  let where;

  // Add status filter based on statusGroup
  if (statusGroup === 'active') {
    where = { ...where, status: { in: ['pending', 'ongoing', 'completed', 'forRelease'] } };
  } else if (statusGroup === 'archived') {
    where = { ...where, status: 'archived' };
  } else if (statusGroup) {
    return res.status(200).json({ data: { jobOrders: [], }, pagination: { totalItems: 0, totalPages: 0, currentPage: 1 } });
  }

  where = {...where, ...branchFilter("jobOrder", branch, req.branchIds)};
  
  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
  }
  
  // If specific status is provided in query, it overrides the statusGroup
  if (status) {
    where.status = status;
  }
  
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      {
        truck: {
          OR: [
            { plate: { contains: searchValue } },
            { make: { contains: searchValue } },
            { model: { contains: searchValue } },
          ],
        },
      },
      {
        customer: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
      {
        contractor: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
    ];
  }

  try {
    const totalItems = await prisma.jobOrder.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;
    
    const jobOrders = await prisma.jobOrder.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
     include: {
        transactions: true,
        truck: {
          select: {
            id: true,
            plate: true,
          }
        },
        customer: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                fullName: true
              }
            },
          },
        },
        contractor: {
          select: {
            id: true,
            userId: true,
            commission: true,
            user: {
              select: {
                fullName: true
              }
            },
          },
        },
        branch: {
          select: {
            id: true,
            branchName: true
          }
        },
        materials: {
          select: {
            price: true,
            quantity: true
          },
        },
      },
      orderBy: {
        createdAt: "desc"
      },
    });

    // compute commissions & flatten output
    const result = jobOrders.map((job) => {
      let contractorCommission = 0,
        shopCommission = 0, totalTransactions = 0,
        totalMaterialCost = 0;

      if (job.contractor && job.labor) {
        contractorCommission = Number(job.labor) * Number(job.contractor.commission);
        shopCommission = Number(job.labor) - contractorCommission;
      }

      if (job.materials?.length) {
        totalMaterialCost = job.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
      }

      if (job.transactions?.length) {
        totalTransactions = job.transactions.reduce(
          (sum, m) => sum + Number(m.amount),
          0
        );
      }

      const totalBill = Number(job.labor) + Number(totalMaterialCost);

      return {
        id: job.id,
        jobOrderCode: job.jobOrderCode,
        status: job.status,
        plateNumber: job.truck?.plate,
        truckId: job.truck?.id,
        contractorId: job.contractor?.id || null,
        contractorUserId: job.contractor?.userId || null,
        contractorName: job.contractor?.user?.fullName || null,
        customerId: job.customer?.id,
        customerUserId: job.customer?.userId,
        customerName: job.customer?.user?.fullName,
        branchId: job.branch?.id || null,
        branchName: job.branch?.branchName || null,
        totalMaterialCost,
        contractorCommission,
        shopCommission,
        totalBill,
        balance: totalBill - totalTransactions, // adjust if you track payments separately
        // new audit fields
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    return res.status(200).json({
      data: {
        jobOrders: result,
      },
      pagination: {
          totalItems,
          totalPages,
          currentPage: page || 1,
        },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getAllJobOrders = async (req, res) => {
  const statusGroup = req?.params.statusGroup; // 'active' or 'archived'
  const search = req?.query?.search;
  const status = req?.query?.status;
  const branch = req?.query?.branch;
  const unpaidParam = req?.params.unpaid;
  const page = req?.query?.page && parseInt(req.query.page, 10);
  const limit = req?.query?.limit && parseInt(req.query.limit, 10);
  const startDate = req?.query?.startDate;
  const endDate = req?.query?.endDate;

  const unpaid = unpaidParam === "unpaid";
  
  let where;

  // Add status filter based on statusGroup
  if (statusGroup === "active") {
    where = { ...where, status: { in: ["pending", "ongoing", "completed", "forRelease"] } };
  } else if (statusGroup === "archived") {
    where = { ...where, status: "archived" };
  } else if (statusGroup) {
    return res.status(200).json({
      data: { jobOrders: [] },
      pagination: { totalItems: 0, totalPages: 0, currentPage: 1 },
    });
  }

  where = { ...where, ...branchFilter("jobOrder", branch, req.branchIds) };

  const createdAtFilter = getDateRangeFilter(startDate, endDate);
  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
  }

  // If specific status is provided in query, override statusGroup
  if (status) {
    where.status = status;
  }

  // Search filter
  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
    where.OR = [
      { jobOrderCode: { contains: searchValue } },
      {
        truck: {
          OR: [
            { plate: { contains: searchValue } },
            { make: { contains: searchValue } },
            { model: { contains: searchValue } },
          ],
        },
      },
      {
        customer: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
      {
        contractor: {
          user: {
            OR: [
              { username: { contains: searchValue } },
              { fullName: { contains: searchValue } },
              { phone: { contains: searchValue } },
              { email: { contains: searchValue } },
            ],
          },
        },
      },
    ];
  }

  try {
    const totalItems = await prisma.jobOrder.count({ where });
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const jobOrders = await prisma.jobOrder.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
      include: {
        transactions: true,
        truck: { select: { id: true, plate: true } },
        customer: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        contractor: {
          select: {
            id: true,
            userId: true,
            commission: true,
            user: { select: { fullName: true } },
          },
        },
        branch: { select: { id: true, branchName: true } },
        materials: { select: { price: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // compute commissions & flatten output
    let result = jobOrders.map((job) => {
      let contractorCommission = 0,
        shopCommission = 0,
        totalTransactions = 0,
        totalMaterialCost = 0;

      if (job.contractor && job.labor) {
        contractorCommission = Number(job.labor) * Number(job.contractor.commission);
        shopCommission = Number(job.labor) - contractorCommission;
      }

      if (job.materials?.length) {
        totalMaterialCost = job.materials.reduce(
          (sum, m) => sum + Number(m.price) * Number(m.quantity),
          0
        );
      }

      if (job.transactions?.length) {
        totalTransactions = job.transactions.reduce(
          (sum, m) => sum + Number(m.amount),
          0
        );
      }

      const totalBill = Number(job.labor) + Number(totalMaterialCost);

      return {
        id: job.id,
        jobOrderCode: job.jobOrderCode,
        status: job.status,
        plateNumber: job.truck?.plate,
        truckId: job.truck?.id,
        contractorId: job.contractor?.id || null,
        contractorUserId: job.contractor?.userId || null,
        contractorName: job.contractor?.user?.fullName || null,
        customerId: job.customer?.id,
        customerUserId: job.customer?.userId,
        customerName: job.customer?.user?.fullName,
        branchId: job.branch?.id || null,
        branchName: job.branch?.branchName || null,
        totalMaterialCost,
        contractorCommission,
        shopCommission,
        totalBill,
        totalTransactions,
        balance: totalBill - totalTransactions,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        createdBy: job.createdByUser,
        updatedBy: job.updatedByUser,
      };
    });

    // 🔹 Apply "unpaid" filter (where totalBill !== totalTransactions)
    if (unpaid) {
      result = result.filter((job) => 
        job.totalBill !== job.totalTransactions || 
        (job.totalBill === 0 && job.totalTransactions === 0)
      );
    }
    
    return res.status(200).json({
      data: { jobOrders: result },
      pagination: {
        totalItems: result.length,
        totalPages: limit ? Math.ceil(result.length / limit) : 1,
        currentPage: page || 1,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};


// "GET /id"
const getJobOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const jobOrderInclude = {
      truck: true,
      transactions: true,
      customer: {
        include: { user: true },
      },
      contractor: {
        include: { user: true },
      },
      branch: { select: { id: true, branchName: true } },
      materials: { select: { id: true, materialName: true, quantity: true, price: true } },
      images: true,
    };

    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id: req.params.id },
      include: jobOrderInclude,
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job Order not found" });
    }

    let contractorCommission = 0,
      shopCommission = 0, totalTransactions = 0,
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

    if (jobOrder.transactions?.length) {
        totalTransactions = jobOrder.transactions.reduce(
          (sum, m) => sum + Number(m.amount),
          0
        );
      }

    const processedMaterials = (jobOrder.materials || []).map((m) => {
      const total = Number(m.price) * Number(m.quantity);
      totalMaterialCost += total;
      return {
        ...m,
        total,
      };
    });

    const totalBill =
        Number(shopCommission) + Number(contractorCommission) + Number(totalMaterialCost);

    return res.status(200).json({
      data: {
        id: jobOrder.id,
        jobOrderCode: jobOrder.jobOrderCode,
        status: jobOrder.status,
        plate: jobOrder.truck?.plate,
        make: jobOrder.truck?.make,
        model: jobOrder.truck?.model,
        truckId: jobOrder.truck?.id,
        contractorId: jobOrder.contractor?.id  || null,
        contractorUserId: jobOrder.contractor?.user?.id  || null,
        contractorName: jobOrder.contractor?.user?.fullName  || null,
        contractorUsername: jobOrder.contractor?.user?.username  || null,
        contractorEmail: jobOrder.contractor?.user?.email,
        contractorPhone: jobOrder.contractor?.user?.phone,
        customerId: jobOrder.customer?.id,
        customerUserId: jobOrder.customer?.user?.id,
        customerName: jobOrder.customer?.user?.fullName,
        customerUsername: jobOrder.customer?.user?.username,
        customerEmail: jobOrder.customer?.user?.email,
        customerPhone: jobOrder.customer?.user?.phone,
        branchId: jobOrder.branch?.id  || null,
        branchName: jobOrder.branch?.branchName  || null,
        labor: Number(jobOrder.labor),
        totalBill,
        balance: totalBill - totalTransactions,
        description: jobOrder.description,
        createdAt: jobOrder.createdAt,
        updatedAt: jobOrder.updatedAt,
        createdBy: jobOrder.createdByUser,
        updatedBy: jobOrder.updatedByUser,
        contractorCommission,
        shopCommission,
        totalLabor: contractorCommission + shopCommission,
        totalMaterialCost,
        materials: processedMaterials,
        images: jobOrder.images.reduce((acc, image) => {
          const type = image.type || "unknown";
          if (!acc[type]) acc[type] = [];
          acc[type].push(image);
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editJobOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) return res.status(400).json({ message: "ID is required" });
  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const jobOrder = await prisma.jobOrder.findFirst({ where: { id } });

    if (!jobOrder)
      return res
        .status(404)
        .json({ message: `Job order with ID: ${id} not found` });

    if (!jobOrder.contractorId)
      return res.status(400).json({ message: "No contractor assigned yet" });

    const needsApproval = req.approval;
    let message;

    const jobOrderData = {

      status: status,
      updatedByUser: req.username
    }

    const result = await prisma.$transaction(async (tx) => {
      if (needsApproval) {
        message = "Job order status awaiting approval";
        return await requestApproval(
          "jobOrder",
          id,
          "edit",
          jobOrderData,
          req.username
        );
      } else {
        message = "Job order status successfully updated";
        return await tx.jobOrder.update({
          where: { id: jobOrder.id },
          data: jobOrderData,
        });
      }
    });

    return res.status(200).json({ message, data: result });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};



module.exports = {
  createJobOrder,
  editJobOrder,
  deleteJobOrder,
  getAllJobOrders,
  editJobOrderStatus,
  getJobOrder,
};
