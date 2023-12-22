const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const UpdateGiftTrans = async (data) => {
  const gift = await prisma.giftTransaction.findUnique({
    where: {
      id: data.id,
    },
  });

  if (gift) {
    let Data = await prisma.giftTransaction.update({
      where: {
        id: gift.id,
      },
      data: {
        delivered: data.delivered,
      },
    });

    await prisma.$disconnect();

    return Data;
  }
  await prisma.$disconnect();
  return null;
};

module.exports = { UpdateGiftTrans };
