const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requestApproval = async (tableName, recordId, actionType, payload, userId) => {
    return prisma.approvalLog.create({
        data: {
            tableName,
            recordId,
            actionType,
            payload,
            requestedByUser: req.username,
        },
    })
};

const approveRequest = async (requestId, adminId) => {
    const request = await prisma.approvalLog.findUnique({ where: { id: requestId }});
    if (!request) throw new Error('Approval request not found');

    switch (actionType) {
    case 'create':
      await prisma[tableName].create({ data: {...payload, createdByUser: request.payload.requestedByUser, updatedByUser: req.username }  });
      break;

    case 'update':
      // Mark old record as versioned
      await prisma[tableName].update({
        where: { id: recordId },
        data: {...payload, updatedByUser: req.username}
      });
      break;

    case 'delete':
      await prisma[tableName].delete({ where: { id: recordId } });
      break;
  }

  return prisma.approvalLog.update({
    where: { id: requestId },
    data: { status: 'approved', approvedByUser: req.username, responseComment: 'Request approved successfully.', updatedAt: new Date()},
  });

}

const rejectRequest = async (requestId, comment = null) => {
  const request = await prisma.approvalLog.findUnique({ where: { id: requestId } })
  if (!request) throw new Error('Approval request not found');

  return prisma.approvalLog.update({
    where: { id: requestId },
    data: {
      status: 'rejected',
      approvedByUser: req.username,     // matches your schema
      responseComment: comment || 'No comment provided',
      updatedAt: new Date(),
    },
  });
}
