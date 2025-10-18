const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const relationsChecker = require("../relationsChecker");
const getMainBaseRole = require("../getMainBaseRole"); // make sure this exists
const generateJobOrderCode = require("../generateJobOrderCode");

const requestApproval = async (tableName, recordId, actionType, payload, reqUser) => {
    return prisma.approvalLog.create({
        data: {
            tableName,
            recordId,
            actionType,
            payload,
            requestedByUser: reqUser,
        },
    })
};

const handleUserApproval = async (request, updateUser, tx) => {
  const { payload, actionType: action, recordId, requestedByUser } = request;

  let user;
  console.log(`[handleUserApproval] Action: ${action}, Record ID: ${recordId}`);

  switch (action) {
    case "create":
      console.log("[create] Starting user creation");

      // Separate roles and branches from user data
      const { roles = [], branches = [], ...userPayload } = payload;
      console.log("[create] Roles:", roles);
      console.log("[create] Branches:", branches);
      console.log("[create] User payload:", userPayload);

      // 1️⃣ Create the main user record
      user = await tx.user.create({
        data: {
          ...userPayload,
          status: "active",
          createdByUser: requestedByUser,
          updatedByUser: updateUser,
        },
      });
      console.log(`[create] User created with ID: ${user.id}`);

      // 2️⃣ Create userRole entries
      if (roles.length > 0) {
        console.log("[create] Creating userRole entries");
        await tx.userRole.createMany({
          data: roles.map((roleId) => ({ userId: user.id, roleId })),
        });

        // Create main role tables (admin, customer, employee, contractor)
        console.log("[create] Creating main role tables if applicable");
        const roleNames = [
          ...new Set(
            (
              await Promise.all(roles.map((r) => getMainBaseRole(tx, r)))
            ).filter(Boolean)
          ),
        ];
        console.log("[create] Main role names to create:", roleNames);

        for (const roleName of roleNames) {
          console.log(`[create] Creating main role table for: ${roleName}`);
          switch (roleName) {
            case "admin":
              await tx.admin.create({ data: { userId: user.id } });
              break;
            case "customer":
              await tx.customer.create({ data: { userId: user.id } });
              break;
            case "employee":
              await tx.employee.create({ data: { userId: user.id } });
              break;
            case "contractor":
              await tx.contractor.create({
                data: { userId: user.id, commission: payload.commission || 0 },
              });
              break;
          }
        }
      }

      // 3️⃣ Create userBranch entries
     const userBranchData =
        branches?.length > 0
          ? branches.map((branch) => ({ branchId: branch, userId: user.id }))
          : [];

      if (userBranchData.length > 0) {
        await tx.userBranch.createMany({ data: userBranchData });
      }
      
      console.log("[create] User creation completed");
      break;

    case "edit":
      console.log("[edit] Starting user update");

      const { roles: editRoles = [], branches: editBranches = [], ...editPayload } = payload;
      console.log("[edit] Roles:", editRoles);
      console.log("[edit] Branches:", editBranches);
      console.log("[edit] User payload:", editPayload);

      // Update user
      user = await tx.user.update({
        where: { id: recordId },
        data: { ...editPayload, updatedByUser: updateUser },
      });
      console.log(`[edit] User updated with ID: ${user.id}`);

      // Update roles
      if (editRoles.length > 0) {
        console.log("[edit] Updating userRole entries");
        await tx.userRole.deleteMany({ where: { userId: user.id } });
        await tx.userRole.createMany({
          data: editRoles.map((roleId) => ({ userId: user.id, roleId })),
        });

        console.log("[edit] Refreshing main role tables");
        await Promise.all([
          tx.admin.deleteMany({ where: { userId: user.id } }),
          tx.customer.deleteMany({ where: { userId: user.id } }),
          tx.employee.deleteMany({ where: { userId: user.id } }),
          tx.contractor.deleteMany({ where: { userId: user.id } }),
        ]);

        const roleNames = [
          ...new Set(
            (
              await Promise.all(editRoles.map((r) => getMainBaseRole(tx, r)))
            ).filter(Boolean)
          ),
        ];
        console.log("[edit] Main role names to create:", roleNames);

        for (const roleName of roleNames) {
          console.log(`[edit] Creating main role table for: ${roleName}`);
          switch (roleName) {
            case "admin":
              await tx.admin.create({ data: { userId: user.id } });
              break;
            case "customer":
              await tx.customer.create({ data: { userId: user.id } });
              break;
            case "employee":
              await tx.employee.create({ data: { userId: user.id } });
              break;
            case "contractor":
              await tx.contractor.create({
                data: { userId: user.id, commission: payload.commission || 0 },
              });
              break;
          }
        }
      }

      // Update branches
      if (editBranches.length > 0) {
        console.log("[edit] Updating userBranch entries");
        await tx.userBranch.deleteMany({ where: { userId: user.id } });
        await tx.userBranch.createMany({
          data: editBranches.map((branchId) => ({ userId: user.id, branchId })),
        });
      }

      console.log("[edit] User update completed");
      break;

    case "delete":
    console.log(`[delete] Attempting to delete user: ${recordId}`);

    const existingUser = await tx.user.findUnique({
        where: { id: recordId },
        include: {
        admin: true,
        customer: {
          include: {
            trucks: true,
            jobOrders: true,
          },
        },
        contractor: {
          include: {
            contractorPay: true,
            jobOrders: true,
          },
        },
        employee: {
          include: {
            employeePay: true
          },
        },

        // exclude these from relation checking
        roles: true,
        branches: true,

        // keep all other created/updated relations
        activityLog: true,
        createdUsers: true,
        updatedUsers: true,
        createdRole: true,
        createdBranches: true,
        createdTrucks: true,
        createdTransactions: true,
        createdJobOrders: true,
        createdContractorPays: true,
        createdEquipments: true,
        createdOtherIncomes: true,
        createdOverheads: true,
        transferredTruckOwnerships: true,
        updatedBranches: true,
        updatedTrucks: true,
        updatedTransactions: true,
        updatedJobOrders: true,
        updatedContractorPays: true,
        updatedEquipments: true,
        updatedOtherIncomes: true,
        updatedOverheads: true,
      },
    });

    if (!existingUser) throw new Error("User not found for deletion");

    const excludedKeys = ["roles", "branches"];
    const hasRelations = relationsChecker(existingUser, excludedKeys);

    console.log("[delete] Has relations:", hasRelations);

    if (hasRelations) {
        await tx.user.update({
            where: { id: recordId },
            data: {
                status: "inactive",
                refreshToken: null,
                updatedByUser: updateUser,
            },
    });
    } else {
        await tx.userRole.deleteMany({ where: { userId: existingUser.id } });
        await tx.userBranch.deleteMany({ where: { userId: existingUser.id } });

        await tx.customer.deleteMany({ where: { userId: existingUser.id } });
        await tx.employee.deleteMany({ where: { userId: existingUser.id } });
        await tx.contractor.deleteMany({ where: { userId: existingUser.id } });
        await tx.admin.deleteMany({ where: { userId: existingUser.id } });

        await tx.user.delete({ where: { id: existingUser.id } });
    }

    user = null;
    console.log("[delete] Deletion completed.");
    break;


    default:
      throw new Error(`Unknown action type: ${action}`);
  }

  console.log("[handleUserApproval] Finished action");
  return user;
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
        where: { id: recordId },
        include: {
          materials: true,
        },
      });

      if (!existingJobOrder) throw new Error("Job order not found for deletion");
      
      await tx.material.deleteMany({ where: { jobOrderId: recordId } });
      await tx.jobOrder.delete({ where: { id: recordId } });

      jobOrder = null;
      console.log("[delete] Job order deletion completed");
      break;

    default:
      throw new Error(`Unknown action type for job order: ${action}`);
  }

  console.log("[handleJobOrderApproval] Finished action");
  return jobOrder;
};

const approveRequest = async (requestId, updateUser) => {
    const request = await prisma.approvalLog.findUnique({ where: { id: requestId }});
    if (!request) throw new Error('Approval request not found');
    const tableName = request.tableName

    switch (tableName) {
        case "user":
            await prisma.$transaction(async (tx) => {
                await handleUserApproval(request, updateUser, tx);
            });
            break;

        case "jobOrder":
            await prisma.$transaction(async (tx) => {
                await handleJobOrderApproval(request, updateUser, tx);
            });
            break;

        default:
            switch (request.actionType) {
                case 'create':
                await prisma[tableName].create({ data: {...request.payload, createdByUser: request.requestedByUser, updatedByUser: updateUser }  });
                break;

            case 'edit':
            // Mark old record as versioned
                await prisma[tableName].update({
                    where: { id: request.recordId },
                    data: {...request.payload, updatedByUser: updateUser}
                });
                break;

            case 'delete':
                await prisma[tableName].delete({ where: { id: request.recordId } });
                break;
        }
}

  return prisma.approvalLog.update({
    where: { id: requestId },
    data: { status: 'published', approvedByUser: updateUser, responseComment: 'Request approved successfully.', updatedAt: new Date()},
  });

};

const rejectRequest = async (requestId, approveUser, reason = null) => {
  const request = await prisma.approvalLog.findUnique({ where: { id: requestId } })
  if (!request) throw new Error('Approval request not found');

  return prisma.approvalLog.update({
    where: { id: requestId },
    data: {
      status: 'rejected',
      approvedByUser: approveUser,  
      responseComment: reason || 'No comment provided',
      updatedAt: new Date(),
    },
  });
};

module.exports = { requestApproval, approveRequest, rejectRequest }
