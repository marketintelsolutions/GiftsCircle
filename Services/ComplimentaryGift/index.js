const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (id) => {
  const complimentaryItem = await prisma.complimentarygift.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return complimentaryItem;
};

const GetAll = async () => {
  const complimentaryItems = await prisma.complimentarygift.findMany({});
  await prisma.$disconnect();
  return complimentaryItems;
};

const Buy = async (data, userId) => {
  data.forEach((element) => {
    element.date = new Date(Date.now());
    element.quantity = 1;
    element.userId = userId
    return element;
  });
  let transactions = await prisma.giftTransaction.createMany({
    data: [...data],
    skipDuplicates: true,
  });
  await prisma.$disconnect();

  return transactions;
};





module.exports = {  Buy, Get, GetAll };
