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
    return ele;
  })
  let Data = await prisma.marketGiftTransaction.createMany({
    data: [...data],
    skipDuplicates: true,
  });

  const message = `Market Items purchased`;
  const notification = await prisma.notifications.create({
    data: {
      userId: userId,
      type: "PURCHASE",
      message: message,
    },
  });

  await prisma.$disconnect();
  return { Data, notification };
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
