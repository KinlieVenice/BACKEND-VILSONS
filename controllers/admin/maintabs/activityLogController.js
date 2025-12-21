const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getActivityLogs = async (req, res) => {
  const branch = req.query?.branch;
  const search = req?.query?.search;

  const where = branch ? { branchId: branch } : {};

  if (search) {
    let searchValue = search.trim().replace(/^["']|["']$/g, "");
     where.OR = [
       { activity: { contains: searchValue } },
       { remarks: { contains: searchValue } },
     ];
  }

  try {
    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: { branch: { select: { branchName: true } }},
      orderBy: { createdAt: "desc" }, // show newest first
    });

    return res.status(200).json({ data: { activities: activityLogs } });
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    return res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};

module.exports = getActivityLogs;
