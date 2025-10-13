const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { relationsChecker } = require("../utils/relationsChecker");
const { getMainBaseRole } = require("../utils/getMainBaseRole"); // make sure this exists

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
  const payload = request.payload;
  const action = request.actionType;
  const recordId = request.recordId;

  let user;

  switch (action) {
    case "create":
      user = await tx.user.create({
        data: {
          ...payload,
          status: "active",
          createdByUser: request.requestedByUser,
          updatedByUser: updateUser,
        },
      });

      const createRoles = payload.roles || [];
      const createBranches = payload.branches || [];

      if (createRoles.length > 0)
        await tx.userRole.createMany({
          data: createRoles.map((r) => ({ userId: user.id, roleId: r })),
        });

      if (createBranches.length > 0)
        await tx.userBranch.createMany({
          data: createBranches.map((b) => ({ userId: user.id, branchId: b })),
        });

      // Create main roles (admin, customer, etc.)
      const createRoleNames = await Promise.all(
        createRoles.map((r) => getMainBaseRole(tx, r))
      );
      const uniqueCreateRoles = [...new Set(createRoleNames.filter(Boolean))];

      for (const roleName of uniqueCreateRoles) {
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
      break;

    case "edit":
      user = await tx.user.update({
        where: { id: recordId },
        data: {
          ...payload,
          updatedByUser: updateUser,
        },
      });

      const updateRoles = payload.roles || [];
      const updateBranches = payload.branches || [];

      if (updateRoles.length > 0) {
        await tx.userRole.deleteMany({ where: { userId: user.id } });
        await tx.userRole.createMany({
          data: updateRoles.map((r) => ({ userId: user.id, roleId: r })),
        });
      }

      if (updateBranches.length > 0) {
        await tx.userBranch.deleteMany({ where: { userId: user.id } });
        await tx.userBranch.createMany({
          data: updateBranches.map((b) => ({ userId: user.id, branchId: b })),
        });
      }

      // Refresh main roles
      const updateRoleNames = await Promise.all(
        updateRoles.map((r) => getMainBaseRole(tx, r))
      );
      const uniqueUpdateRoles = [...new Set(updateRoleNames.filter(Boolean))];

      await Promise.all([
        tx.admin.deleteMany({ where: { userId: user.id } }),
        tx.customer.deleteMany({ where: { userId: user.id } }),
        tx.employee.deleteMany({ where: { userId: user.id } }),
        tx.contractor.deleteMany({ where: { userId: user.id } }),
      ]);

      for (const roleName of uniqueUpdateRoles) {
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
      break;

    case "delete":
      const existingUser = await tx.user.findUnique({
        where: { id: recordId },
        include: {
          admin: true,
          customer: {
            include: {
              trucks: true,
              trucksEdit: true,
              jobOrder: true,
              jobOrderEdit: true,
            },
          },
          contractor: {
            include: {
              contractorPay: true,
              contractorPayEdit: true,
              JobOrder: true,
              JobOrderEdit: true,
            },
          },
          employee: { include: { employeeSalary: true } },
          roles: true,
          rolesEdit: true,
          branches: true,
          branchesEdit: true,
        },
      });

      if (!existingUser) throw new Error("User not found for deletion");

      const excludedKeys = ["roles", "rolesEdit", "branches", "branchesEdit"];
      const hasRelations = relationsChecker(existingUser, excludedKeys);

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
        await tx.userRoleEdit.deleteMany({ where: { userId: existingUser.id } });
        await tx.userBranch.deleteMany({ where: { userId: existingUser.id } });
        await tx.userBranchEdit.deleteMany({ where: { userId: existingUser.id } });
        await tx.userEdit.deleteMany({ where: { userId: existingUser.id } });

        await tx.customer.deleteMany({ where: { userId: existingUser.id } });
        await tx.employee.deleteMany({ where: { userId: existingUser.id } });
        await tx.contractor.deleteMany({ where: { userId: existingUser.id } });
        await tx.admin.deleteMany({ where: { userId: existingUser.id } });

        await tx.user.delete({ where: { id: existingUser.id } });
      }

      user = null;
      break;

    default:
      throw new Error(`Unknown action type: ${action}`);
  }

  return user;
};

const approveRequest = async (requestId, updateUser) => {
    const request = await prisma.approvalLog.findUnique({ where: { id: requestId }});
    if (!request) throw new Error('Approval request not found');
    const tableName = request.tableName

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
