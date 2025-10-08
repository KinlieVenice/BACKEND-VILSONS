
function getMonthYear(yearQuery, monthQuery) {
  const now = new Date();

  const year = yearQuery ? parseInt(yearQuery, 10) : now.getFullYear();
  const month = monthQuery ? parseInt(monthQuery, 10) : null;

  let startDate, endDate;

  if (year && !month) {
    //  Yearly range
    startDate = new Date(year, 0, 1);
    endDate = new Date(year + 1, 0, 1);
  } else if (year && month) {
    //  Monthly range
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 1);
  } else {
    // default: current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

module.exports = { getMonthYear };
