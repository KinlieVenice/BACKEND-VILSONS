const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/*
contractorId String

  type   PaymentType
  amount Decimal     @db.Decimal(13, 2)
*/
const createContractorPay = async (req, res) => {
  const { contractorId, type, amount } = req.body;
  if (!contractorId || !type || !amount)
    return res
      .status(404)
      .json({ message: "ContractorId, type and amount required" });

  try {
    const needsApproval = req.approval;
    let message;

    const contractorPayData = {
      contractorId,
      type,
      amount,
    };

    const result = await prisma.$transaction(async (tx) => {
      const contractorPay = needsApproval
        ? await tx.contractorPayEdit.create({
            data: {
              ...contractorPayData,
              contractorPayId: null,
              requestType: "create",
            },
          })
        : await tx.contractorPay.create({
            data: contractorPayData,
          });

      message = needsApproval
        ? "Contractor pay awaiting approval"
        : "Contractor pay successfully created";

      return contractorPay;
    });
    return req.status(201).json({ message, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editContractorPay = async (req, res) => {
  const { contractorId, type, amount } = req.body;

  if (!req.params?.id) return res.status(400).json({ message: "ID is required"});

  try {
    const needsApproval = req.approval;
    let message;

    const contractorPay = await prisma.contractorPay.findFirst({ where: { id: req.params.id }});

    const contractorPayData = {
        contractorId: contractorId ?? contractorPay.id,
        type: type ?? contractorId.type,
        amount: amount ?? contractorPay.amount
    };

    const result = await prisma.$transaction(async (tx) => {
        const editedContractorPay = needsApproval ?
        await tx.contractorPayEdit.create({
            data: {...contractorPayData, contractorPayId: contractorPay.id, requestType: "edit"}
        }) : await tx.contractorPay.update({
            where: { id: contractorId.id },
            data: contractorPayData
        })

        message = needsApproval
          ? "Contractor pay edit awaiting approval"
          : "Contractor pay successfully edited";

          return editedContractorPay;
    })

    return res.status(201).json({ message, data: result })

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
};



module.exports = { createContractorPay, editContractorPay };