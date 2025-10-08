// Helper to generate branch filter per model
function getBranchFilter(model, branch, branchIds) {
  if (branch) {
    const branchValue = branch.trim().replace(/^["']|["']$/g, "");
    switch (model) {
      case "transaction":
      case "material":
        return { jobOrder: { branch: { id: branchValue } } };
      case "otherIncome":
      case "overhead":
      case "equipment":
        return { branchId: branchValue };
      case "employeePay":
        return { employee: { user: { branches: { some: { branchId: branchValue } } } } };
      case "contractorPay":
        return { contractor: { user: { branches: { some: { branchId: branchValue } } } } };
      default:
        return {};
    }
  } else if (branchIds?.length) {
    switch (model) {
      case "transaction":
      case "material":
        return { jobOrder: { branchId: { in: branchIds } } };
      case "otherIncome":
      case "overhead":
      case "equipment":
        return { branchId: { in: branchIds } };
      case "employeePay":
        return { employee: { user: { branches: { some: { branchId: { in: branchIds } } } } } };
      case "contractorPay":
        return { contractor: { user: { branches: { some: { branchId: { in: branchIds } } } } } };
      default:
        return {};
    }
  }

  return {};
}

module.exports = { getBranchFilter }