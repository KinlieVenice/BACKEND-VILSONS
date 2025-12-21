// services/lastUpdatedService.js

/**
 * Get the last updated timestamp for a given table
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} tableName - Name of the table/model
 * @param {Object} where - Filter conditions
 * @returns {Promise<Date|null>} - Last updated timestamp or null
 */
const getLastUpdatedAt = async (prisma, tableName, where = {}) => {
  try {
    // Map table name to Prisma model
    const model = prisma[tableName];

    if (!model) {
      throw new Error(`Table/model '${tableName}' not found`);
    }

    const aggregation = await model.aggregate({
      where,
      _max: {
        updatedAt: true,
      },
    });

    return aggregation._max.updatedAt;
  } catch (error) {
    console.error(`Error getting lastUpdatedAt for ${tableName}:`, error);
    throw error;
  }
};

module.exports = {
  getLastUpdatedAt,
};
