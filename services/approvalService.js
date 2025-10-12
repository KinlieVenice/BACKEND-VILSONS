const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
      await prisma[tableName].delete({ where: { id: recordId } });
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
