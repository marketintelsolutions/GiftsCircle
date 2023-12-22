const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAllTransactions = async (
  perPage = 20,
  page = 1,
  type = null,
  status = null
) => {
  let query = {};
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  const skip = (page - 1) * perPage;
  const trans = await prisma.transaction.findMany({
    where: query,
    include: {
      purchasedBy: {
        select: {
          firstname: true,
          lastname: true,
          email: true,
          id: true,
        },
      },
    },
    take: parseInt(perPage),
    orderBy: [
      {
        created_at: "desc",
      },
    ],
    skip: skip,
  });

  await prisma.$disconnect();

  return trans;
};

const Get = async (id) => {
  const trans = await prisma.transaction.findUnique({
    where: {
      id: id,
    },
    include: {
      purchasedBy: true,
    },
  });

  await prisma.$disconnect();

  return trans;
};

module.exports = { Get, GetAllTransactions };
