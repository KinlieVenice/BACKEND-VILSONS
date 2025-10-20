const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const relationsChecker = require("../services/relationsChecker");
const getMainBaseRole = require("./getMainBaseRole"); // make sure this exists
const generateJobOrderCode = require("./generateJobOrderCode");

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

      let customer = null;
      let activeTruckId = truckData.truckId;

      // 1️⃣ Existing customer logic
      if (customerData.customerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerData.customerId },
        });

        // Handle truck assignment/transfer for existing customer
        if (truckData.truckId) {
          // Check current ownership
          const currentOwnership = await tx.truckOwnership.findFirst({
            where: { 
              truckId: truckData.truckId,
              endDate: null 
            },
          });

          if (currentOwnership) {
            if (currentOwnership.customerId !== customerData.customerId) {
              // Transfer ownership - end previous ownership and create new one
              await tx.truckOwnership.updateMany({
                where: { 
                  truckId: truckData.truckId,
                  endDate: null 
                },
                data: { 
                  endDate: new Date() 
                },
              });

              await tx.truckOwnership.create({
                data: {
                  truckId: truckData.truckId,
                  customerId: customerData.customerId,
                  startDate: new Date(),
                  transferredByUser: updateUser,
                },
              });
            }
            // If already owned by this customer, no action needed
          } else {
            // Truck has no current owner - assign ownership
            await tx.truckOwnership.create({
              data: {
                truckId: truckData.truckId,
                customerId: customerData.customerId,
                startDate: new Date(),
                transferredByUser: updateUser,
              },
            });
          }
          
          activeTruckId = truckData.truckId;
        }

        // If no truckId, but new truck details provided, create new truck for them
        if (!truckData.truckId && truckData.plate && truckData.model && truckData.make) {
          const existingTruck = await tx.truck.findUnique({ 
            where: { plate: truckData.plate } 
          });
          if (existingTruck) {
            throw new Error("A truck with this plate number already exists. Transfer ownership first.");
          }

          const createdTruck = await tx.truck.create({
            data: {
              plate: truckData.plate,
              model: truckData.model,
              make: truckData.make,
              createdByUser: requestedByUser,
              updatedByUser: updateUser,
            },
          });

          await tx.truckOwnership.create({
            data: {
              truckId: createdTruck.id,
              customerId: customer.id,
              startDate: new Date(),
              transferredByUser: updateUser,
            },
          });

          activeTruckId = createdTruck.id;
        } 
      }

      // 2️⃣ Handle new customer
      else if (customerData.name && customerData.email && customerData.phone && customerData.username) {
        const roleId = await roleIdFinder(ROLES_LIST.CUSTOMER);

        const newUser = await tx.user.create({
          data: {
            fullName: customerData.name,
            hashPwd: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
            email: customerData.email,
            phone: customerData.phone.toString(),
            username: customerData.username,
            roles: {
              create: [
                {
                  role: { connect: { id: roleId } },
                },
              ],
            },
            createdByUser: requestedByUser,
            updatedByUser: updateUser
          },
        });

        const newCustomer = await tx.customer.create({
          data: { userId: newUser.id },
        });

        let finalTruck;

        if (truckData.plate && truckData.model && truckData.make) {
          // Create new truck for new customer
          finalTruck = await tx.truck.create({
            data: {
              plate: truckData.plate,
              model: truckData.model,
              make: truckData.make,
              createdByUser: requestedByUser,
              updatedByUser: updateUser,
              owners: {
                create: {
                  customerId: newCustomer.id,
                  startDate: new Date(),
                  transferredByUser: updateUser,
                },
              },
            },
          });
        } else if (truckData.truckId) {
          // Validate truck exists in transaction context
          const existingTruck = await tx.truck.findUnique({
            where: { id: truckData.truckId },
          });
          if (!existingTruck) {
            throw new Error("Truck not found");
          }

          // For new customer with existing truck - transfer ownership
          await tx.truckOwnership.updateMany({
            where: { 
              truckId: truckData.truckId,
              endDate: null 
            },
            data: { 
              endDate: new Date() 
            },
          });

          await tx.truckOwnership.create({
            data: {
              truckId: truckData.truckId,
              customerId: newCustomer.id,
              startDate: new Date(),
              transferredByUser: updateUser,
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

      if (jobOrderData.contractorId) {
        contractor = await tx.contractor.findUnique({
          where: { id: jobOrderData.contractorId },
        });

        if (jobOrderData.labor) {
          contractorPercent = contractor.commission;
          contractorCommission = jobOrderData.labor * contractorPercent;
          shopCommission = jobOrderData.labor - contractorCommission;
        }
      }

      const finalJobOrderData = {
        customerId: customer.id,
        branchId: jobOrderData.branchId,
        truckId: activeTruckId,
        description: jobOrderData.description,
        ...(jobOrderData.contractorId && { contractorId: jobOrderData.contractorId }),
        ...(jobOrderData.labor && { labor: jobOrderData.labor }),
        createdByUser: requestedByUser,
        updatedByUser: updateUser,
      };

      // Create job order
      jobOrder = await tx.jobOrder.create({
        data: {
          ...finalJobOrderData,
          jobOrderCode: await generateJobOrderCode(tx),
          contractorPercent,
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

      // Create materials if provided
      if (materials && materials.length > 0) {
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

      // Return consistent structure
      return {
        jobOrder,
        contractorCommission,
        shopCommission,
        totalMaterialCost,
        materials: materials || [],
      };

    case "edit":
      console.log("[edit] Starting job order update from approval");

      const {
        updateData,
        materials: editMaterials = [],
      } = payload;

      // Update job order - spread the updateData directly
      jobOrder = await tx.jobOrder.update({
        where: { id: recordId },
        data: {
          ...updateData,
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
        
        await tx.material.deleteMany({ where: { jobOrderId: recordId } });
        
        await tx.material.createMany({
          data: editMaterials.map((m) => ({
            jobOrderId: recordId,
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
      await tx.material.deleteMany({ where: { jobOrderId: recordId } });
      
      // Delete the job order
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
