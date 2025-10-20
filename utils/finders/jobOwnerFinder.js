function getOwnerAtCreation(owners, jobOrderDate) {
  return owners.find(
    (o) =>
      new Date(o.startDate) <= new Date(jobOrderDate) &&
      (!o.endDate || new Date(o.endDate) >= new Date(jobOrderDate))
  );
}


module.exports = getOwnerAtCreation;
