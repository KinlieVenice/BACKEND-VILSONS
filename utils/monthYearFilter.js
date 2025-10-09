function getMonthYear(yearQuery, monthQuery) {

  const year = yearQuery ? parseInt(yearQuery, 10) : null;
  const month = monthQuery ? parseInt(monthQuery, 10) : null;

  let startDate, endDate;

  if (!year && !month) {
    // ✅ Default: include all time
    startDate = new Date(0); // January 1, 1970
    endDate = new Date(); // current date/time
  } else if (year && !month) {
    // Yearly range
    startDate = new Date(year, 0, 1);
    endDate = new Date(year + 1, 0, 0);
  } else if (year && month) {
    // Monthly range
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

module.exports = { getMonthYear };
