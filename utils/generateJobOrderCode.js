const generateJobOrderCode = async (prisma) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);

  // Get the latest job order for this year
  const lastOrder = await prisma.jobOrder.findFirst({
    where: {
      jobOrderCode: {
        startsWith: `JO-${currentYear}-`,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lastOrder) {
    // First ever job order for this year
    return `JO-${currentYear}-001`;
  }

  // Extract the number part after JO-YY-
  const lastNumber = parseInt(lastOrder.jobOrderCode.split("-")[2], 10);
  const nextNumber = lastNumber + 1;

  // Dynamic padding: at least 3 digits, but grows with the number
  const padded = String(nextNumber).padStart(
    Math.max(3, String(nextNumber).length),
    "0"
  );

  return `JO-${currentYear}-${padded}`;
};

module.exports = generateJobOrderCode;

