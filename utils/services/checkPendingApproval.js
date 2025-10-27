const checkPendingApproval = async (prisma, tableName, fieldPath, value, excludeId = null) => {
  try {
    // Skip if value is null or undefined — avoids Prisma error
    if (value === undefined || value === null || value === "undefined" || value === "null") return null;

    console.log(`Checking pending approval: ${tableName}, ${fieldPath.join('.')}, ${value}`);

    const jsonPath = `$.${fieldPath.join('.')}`;

    const whereClause = {
      status: "pending",
      tableName,
      payload: {
        path: jsonPath, // ✅ String path required in Prisma v5+
        equals: value,  // ✅ Only run if scalar (we check above)
      },
    };

    if (excludeId) {
      whereClause.recordId = { not: excludeId };
    }

    const pending = await prisma.approvalLog.findFirst({ where: whereClause });

    console.log("Prisma JSON query result:", pending);

    if (pending) {
      let actualValue = pending.payload;
      for (const field of fieldPath) {
        actualValue = actualValue?.[field];
      }
      return { approval: pending, value: actualValue };
    }

    return null;
  } catch (error) {
    console.warn("JSON query failed:", error.message);
    return null;
  }
};

module.exports = checkPendingApproval;
