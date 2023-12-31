const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAllMarketPlaceTrans = async (status) => {
  const marketTrans = await prisma.marketGiftTransaction.findMany({});

  await prisma.$disconnect();
  return marketTrans;
};

module.exports = {
  GetAllMarketPlaceTrans,
};
