function getDateRangeFilter(startDate, endDate) {
  if (!startDate && !endDate) return null;

  const filter = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    filter.gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full day
    filter.lte = end;
  }

  return filter;
}

module.exports = { getDateRangeFilter };