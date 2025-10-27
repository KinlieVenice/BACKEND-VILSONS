const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Logs an activity to the activityLog table.
 * @param {string} username - The username of the user performing the action.
 * @param {string} activity - A brief description of the activity.
 */
async function logActivity(username, activity) {
  if (!username || !activity) {
    throw new Error("Username and activity are required");
  }

  try {
    await prisma.activityLog.create({
      data: {
        createdByUser: username,
        activity,
      },
    });
    console.log(`Activity logged: ${activity} by ${username}`);
  } catch (err) {
    console.error('Error logging activity:', err.message);
    // Don't throw error here to avoid breaking the main request
  }
}

module.exports = { logActivity };