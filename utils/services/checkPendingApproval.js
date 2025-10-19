// utils/checkPendingApproval.js
const checkPendingApprovalOld = async (prisma, tableName, fieldPath, value) => {
  try {
    console.log(`Checking pending approval: ${tableName}, ${fieldPath.join('.')}, ${value}`);
    
    const jsonPath = `$.${fieldPath.join('.')}`;
    
    const pending = await prisma.approvalLog.findFirst({
      where: {
        status: "pending",
        tableName: tableName,
        payload: { 
          path: jsonPath,  // ✅ Fixed: just the string, no array
          equals: value 
        }
      },
    });

    console.log('Prisma JSON query result:', pending);

    if (pending) {
      // Extract the actual value from the payload
      let actualValue = pending.payload;
      for (const field of fieldPath) {
        actualValue = actualValue?.[field];
      }
      return { approval: pending, value: actualValue };
    }
    
    return null;
    
  } catch (error) {
    console.warn(`JSON query failed:`, error.message);
    return null;
  }
};

// utils/checkPendingApproval.js
const checkPendingApproval = async (prisma, tableName, fieldPath, value, excludeId = null) => {
  try {
    console.log(`Checking pending approval: ${tableName}, ${fieldPath.join('.')}, ${value}`);
    
    const jsonPath = `$.${fieldPath.join('.')}`;

    const whereClause = {
      status: "pending",
      tableName,
      payload: {
        path: jsonPath,
        equals: value
      }
    };

    // ✅ Exclude current record if provided
    if (excludeId) {
      whereClause.recordId = { not: excludeId };
    }

    const pending = await prisma.approvalLog.findFirst({ where: whereClause });

    console.log('Prisma JSON query result:', pending);

    if (pending) {
      let actualValue = pending.payload;
      for (const field of fieldPath) {
        actualValue = actualValue?.[field];
      }
      return { approval: pending, value: actualValue };
    }

    return null;
  } catch (error) {
    console.warn(`JSON query failed:`, error.message);
    return null;
  }
};

module.exports = checkPendingApproval;
