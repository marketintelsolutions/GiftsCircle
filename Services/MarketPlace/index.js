const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetMarketTransactions = async (id) => {
  const trans = await prisma.marketGiftTransaction.findMany({
    where: {
      userId: id,
    },
  });

  await prisma.$disconnect();
  return trans;
};

const BuyMarketItems = async (data, userId) => {
  data.map((ele) => {
    ele.userId = userId
    ele.amountPaid = parseInt(ele.amountPaid)
    return ele;
  })
  let Data = await prisma.marketGiftTransaction.createMany({
    data: [...data],
    skipDuplicates: true,
  });



  await prisma.$disconnect();
  return Data;
};

const UpdateTransaction = async (id, data) => {
  let trans = await prisma.marketGiftTransaction.update({
    where: {
      id: id,
    },
    data: {
      delivered: data.delivered,
    },
  });

  await prisma.$disconnect();
  return trans;
};

module.exports = {
  GetMarketTransactions,
  BuyMarketItems,
  UpdateTransaction,
};
