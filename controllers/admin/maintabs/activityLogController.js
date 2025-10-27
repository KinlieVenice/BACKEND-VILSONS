const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" }, // show newest first
    });

    return res.status(200).json({ data: { activities: activityLogs } });
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    return res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};

module.exports = getActivityLogs;
